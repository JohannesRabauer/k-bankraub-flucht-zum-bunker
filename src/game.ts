import { Input } from './input';
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

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    this.input = new Input();
    this.reset();
  }

  private reset() {
    this.level = loadLevel();
    this.player = new Player(this.level.playerStart.x, this.level.playerStart.y);
    this.police = new Police();
    this.camera = new Camera();
    this.score = 0;
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    this.update(dt);
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number) {
    if (this.state === GameState.MENU) {
      if (this.input.enter) {
        this.state = GameState.PLAYING;
        this.reset();
      }
      return;
    }

    if (this.state === GameState.GAME_OVER || this.state === GameState.WIN) {
      if (this.input.enter) {
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
      this.level.height * this.level.tileSize
    );

    // Win condition
    if (this.player.x >= this.level.bunkerX) {
      this.state = GameState.WIN;
    }

    // Lose conditions
    if (this.player.dead || this.police.caught) {
      this.state = GameState.GAME_OVER;
    }
  }

  private render() {
    const ctx = this.ctx;

    // Background
    this.drawBackground(ctx);

    if (this.state === GameState.MENU) {
      drawMenu(ctx);
      return;
    }

    // Level
    drawLevel(ctx, this.level, this.camera.x, this.camera.y);
    drawCollectibles(ctx, this.level, this.camera.x, this.camera.y);

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
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    gradient.addColorStop(0, '#1a1a3e');
    gradient.addColorStop(0.5, '#2a2a5e');
    gradient.addColorStop(1, '#0a0a1e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // City silhouette in background
    ctx.fillStyle = '#111122';
    const offset = -(this.camera.x * 0.2) % CANVAS_W;
    for (let i = 0; i < 10; i++) {
      const bx = offset + i * 100;
      const bh = 60 + Math.sin(i * 2.5) * 40;
      ctx.fillRect(bx, CANVAS_H - bh - 50, 60, bh);
    }
  }
}
