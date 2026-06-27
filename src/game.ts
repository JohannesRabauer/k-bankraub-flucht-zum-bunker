import { Input } from './input';
import { setupTouchControls } from './touch';
import { Player } from './player';
import { Police } from './police';
import { Camera } from './camera';
import { loadLevel, drawLevel, drawCollectibles } from './level';
import { checkCollectibles } from './collectible';
import { drawHUD, drawMenu, drawGameOver, drawWin } from './hud';
import { GameState, LevelData } from './types';
import { CANVAS_W, CANVAS_H } from './physics';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private input: Input;
  private state = GameState.MENU;
  private player!: Player;
  private police!: Police;
  private camera!: Camera;
  private level!: LevelData;
  private score = 0;
  private lastTime = 0;
  private gameTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    this.input = new Input();
    setupTouchControls(this.input);
    this.reset();
  }

  private reset() {
    this.level = loadLevel();
    this.player = new Player(this.level.playerStart.x, this.level.playerStart.y);
    this.police = new Police();
    this.camera = new Camera();
    this.score = 0;
    this.gameTime = 0;
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.gameTime += dt;

    this.update(dt);
    this.input.endFrame();
    this.render(dt);
    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number) {
    const startPressed = this.input.enter || this.input.jumpPressed;

    if (this.state === GameState.MENU) {
      if (startPressed) {
        this.state = GameState.PLAYING;
        this.reset();
      }
      return;
    }

    if (this.state === GameState.GAME_OVER || this.state === GameState.WIN) {
      if (startPressed) {
        this.state = GameState.MENU;
      }
      return;
    }

    // Playing state
    this.player.update(dt, this.input, this.level);
    this.police.update(dt, this.player.vx, this.player.onGround);
    this.score += checkCollectibles(this.player, this.level);

    this.camera.follow(
      this.player.x,
      this.player.y,
      this.level.width * this.level.tileSize,
      this.level.height * this.level.tileSize,
      dt
    );

    // Win condition
    if (this.player.x >= this.level.bunkerX) {
      this.state = GameState.WIN;
    }

    // Lose conditions
    if (this.player.dead || this.police.caught) {
      this.state = GameState.GAME_OVER;
      this.camera.shake(6);
    }
  }

  private render(dt: number) {
    const ctx = this.ctx;

    // Multi-layer parallax background
    this.drawBackground(ctx);

    if (this.state === GameState.MENU) {
      drawMenu(ctx, this.gameTime);
      return;
    }

    // Level
    drawLevel(ctx, this.level, this.camera.x, this.camera.y);
    drawCollectibles(ctx, this.level, this.camera.x, this.camera.y, dt);

    // Player
    this.player.draw(ctx, this.camera.x, this.camera.y);

    // Police effect
    this.police.draw(ctx, CANVAS_H);

    // HUD
    drawHUD(ctx, this.score, this.player.x, this.level.bunkerX, this.police);

    // Overlays
    if (this.state === GameState.GAME_OVER) {
      drawGameOver(ctx, this.score);
    } else if (this.state === GameState.WIN) {
      drawWin(ctx, this.score);
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    // Sky gradient (vibrant Rayman-like palette)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    skyGrad.addColorStop(0, '#1a0a3e');
    skyGrad.addColorStop(0.3, '#2a1a5e');
    skyGrad.addColorStop(0.6, '#4a2a7e');
    skyGrad.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars / distant lights
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 127 + 50) % CANVAS_W);
      const sy = ((i * 73 + 20) % (CANVAS_H * 0.5));
      const twinkle = Math.sin(this.gameTime * 2 + i) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layer 1: Distant mountains (slowest parallax)
    const parallax1 = -(this.camera.x * 0.05);
    ctx.fillStyle = '#1a1a3a';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H);
    for (let x = 0; x <= CANVAS_W + 60; x += 60) {
      const h = 100 + Math.sin((x + parallax1) * 0.008) * 50 + Math.sin((x + parallax1) * 0.015) * 25;
      ctx.lineTo(x, CANVAS_H - h);
    }
    ctx.lineTo(CANVAS_W, CANVAS_H);
    ctx.closePath();
    ctx.fill();

    // Layer 2: Mid-distance buildings
    const parallax2 = -(this.camera.x * 0.15);
    ctx.fillStyle = '#151530';
    const offset2 = parallax2 % 120;
    for (let i = -1; i < 9; i++) {
      const bx = offset2 + i * 120;
      const bh = 80 + Math.sin(i * 2.1 + 0.5) * 40;
      const bw = 50 + Math.sin(i * 3.7) * 20;
      ctx.fillRect(bx, CANVAS_H - bh - 30, bw, bh);
      // Windows
      ctx.fillStyle = 'rgba(255,200,50,0.15)';
      for (let wy = 0; wy < bh - 20; wy += 16) {
        for (let wx = 4; wx < bw - 8; wx += 12) {
          if (Math.sin(i * 5 + wx + wy) > 0.2) {
            ctx.fillRect(bx + wx, CANVAS_H - bh - 30 + 10 + wy, 6, 8);
          }
        }
      }
      ctx.fillStyle = '#151530';
    }

    // Layer 3: Near buildings (fastest parallax)
    const parallax3 = -(this.camera.x * 0.3);
    ctx.fillStyle = '#0d0d22';
    const offset3 = parallax3 % 100;
    for (let i = -1; i < 11; i++) {
      const bx = offset3 + i * 100;
      const bh = 60 + Math.sin(i * 1.8 + 3) * 35;
      const bw = 40 + (i % 3) * 15;
      ctx.fillRect(bx, CANVAS_H - bh - 10, bw, bh + 10);
    }

    // Atmospheric fog at bottom
    const fogGrad = ctx.createLinearGradient(0, CANVAS_H - 60, 0, CANVAS_H);
    fogGrad.addColorStop(0, 'rgba(30,20,60,0)');
    fogGrad.addColorStop(1, 'rgba(30,20,60,0.4)');
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, CANVAS_H - 60, CANVAS_W, 60);
  }
}
