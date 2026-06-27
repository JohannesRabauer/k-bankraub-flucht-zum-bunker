import { Input } from './input';
import {
  GRAVITY, GRAVITY_APEX, APEX_THRESHOLD,
  PLAYER_SPEED, PLAYER_ACCEL, PLAYER_DECEL, PLAYER_AIR_ACCEL,
  PLAYER_JUMP, PLAYER_JUMP_CUT, SLIDE_DURATION
} from './physics';
import { TileType, LevelData, Rect } from './types';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string; size: number;
}

export class Player {
  x: number;
  y: number;
  w = 24;
  h = 40;
  vx = 0;
  vy = 0;
  onGround = false;
  sliding = false;
  slideTimer = 0;
  dead = false;
  hasShield = false;
  speedBoost = 0;
  private coyoteTime = 0;
  private jumpBuffer = 0;
  private animTimer = 0;
  private squashY = 1;
  private squashX = 1;
  private wasOnGround = false;
  private facing = 1; // 1 = right, -1 = left
  private particles: Particle[] = [];
  private runParticleTimer = 0;

  private static readonly COYOTE_DURATION = 0.1;
  private static readonly JUMP_BUFFER_DURATION = 0.15;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
  }

  get rect(): Rect {
    const h = this.sliding ? 20 : this.h;
    const y = this.sliding ? this.y + (this.h - 20) : this.y;
    return { x: this.x, y, w: this.w, h };
  }

  update(dt: number, input: Input, level: LevelData) {
    const maxSpeed = this.speedBoost > 0 ? PLAYER_SPEED * 2 : PLAYER_SPEED;
    if (this.speedBoost > 0) this.speedBoost -= dt;

    // Smooth horizontal movement with acceleration
    const accel = this.onGround ? PLAYER_ACCEL : PLAYER_AIR_ACCEL;
    if (input.right) {
      this.vx = Math.min(this.vx + accel * dt, maxSpeed);
      this.facing = 1;
    } else if (input.left) {
      this.vx = Math.max(this.vx - accel * dt, -maxSpeed);
      this.facing = -1;
    } else {
      // Deceleration (friction)
      if (this.onGround) {
        if (this.vx > 0) this.vx = Math.max(0, this.vx - PLAYER_DECEL * dt);
        else if (this.vx < 0) this.vx = Math.min(0, this.vx + PLAYER_DECEL * dt);
      } else {
        if (this.vx > 0) this.vx = Math.max(0, this.vx - PLAYER_AIR_ACCEL * 0.5 * dt);
        else if (this.vx < 0) this.vx = Math.min(0, this.vx + PLAYER_AIR_ACCEL * 0.5 * dt);
      }
    }

    // Jump - uses buffered input for reliable detection
    if (input.jumpPressed) {
      this.jumpBuffer = Player.JUMP_BUFFER_DURATION;
    }
    this.jumpBuffer -= dt;

    const canJump = this.onGround || this.coyoteTime > 0;
    if (this.jumpBuffer > 0 && canJump) {
      this.vy = PLAYER_JUMP;
      this.onGround = false;
      this.coyoteTime = 0;
      this.jumpBuffer = 0;
      // Jump squash
      this.squashX = 0.7;
      this.squashY = 1.3;
      // Jump dust particles
      this.spawnDust(6);
    }
    // Variable jump height - cut jump short if released early
    if (!input.jumpHeld && this.vy < PLAYER_JUMP_CUT) {
      this.vy = PLAYER_JUMP_CUT;
    }

    // Slide
    if (input.slide && this.onGround && !this.sliding) {
      this.sliding = true;
      this.slideTimer = SLIDE_DURATION;
      this.spawnDust(4);
    }
    if (this.sliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.sliding = false;
    }

    // Gravity with apex hang-time (Rayman-like floaty feel)
    const gravity = Math.abs(this.vy) < APEX_THRESHOLD && !this.onGround ? GRAVITY_APEX : GRAVITY;
    this.vy += gravity * dt;

    // Move X
    this.x += this.vx * dt;
    this.resolveCollisionsX(level);

    // Move Y
    this.y += this.vy * dt;
    this.resolveCollisionsY(level);

    // Landing squash
    if (this.onGround && !this.wasOnGround) {
      this.squashX = 1.3;
      this.squashY = 0.7;
      this.spawnDust(4);
    }
    this.wasOnGround = this.onGround;

    // Animate squash back to normal
    this.squashX += (1 - this.squashX) * 12 * dt;
    this.squashY += (1 - this.squashY) * 12 * dt;

    // Animation timer
    this.animTimer += dt;

    // Run particles
    if (this.onGround && Math.abs(this.vx) > 100) {
      this.runParticleTimer -= dt;
      if (this.runParticleTimer <= 0) {
        this.runParticleTimer = 0.08;
        this.particles.push({
          x: this.x + this.w / 2 - this.facing * 8,
          y: this.y + this.h - 2,
          vx: -this.facing * (30 + Math.random() * 40),
          vy: -(Math.random() * 40 + 20),
          life: 0.3 + Math.random() * 0.2,
          maxLife: 0.5,
          color: 'rgba(200,200,220,',
          size: 2 + Math.random() * 2,
        });
      }
    }

    // Update particles
    this.updateParticles(dt);

    // Pit death
    if (this.y > level.height * level.tileSize) {
      this.die();
    }
  }

  private spawnDust(count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.x + this.w / 2 + (Math.random() - 0.5) * 16,
        y: this.y + this.h,
        vx: (Math.random() - 0.5) * 80,
        vy: -(Math.random() * 60 + 10),
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        color: 'rgba(180,180,200,',
        size: 2 + Math.random() * 3,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 100 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private die() {
    if (this.hasShield) {
      this.hasShield = false;
      return;
    }
    this.dead = true;
  }

  private resolveCollisionsX(level: LevelData) {
    const r = this.rect;
    const { tileSize, tiles } = level;
    const startCol = Math.floor(r.x / tileSize);
    const endCol = Math.floor((r.x + r.w - 1) / tileSize);
    const startRow = Math.floor(r.y / tileSize);
    const endRow = Math.floor((r.y + r.h - 1) / tileSize);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tile = tiles[row]?.[col];
        if (tile === TileType.SOLID || (tile === TileType.SLIDE && !this.sliding)) {
          if (this.vx > 0) {
            this.x = col * tileSize - this.w;
          } else if (this.vx < 0) {
            this.x = (col + 1) * tileSize;
          }
        }
      }
    }
  }

  private resolveCollisionsY(level: LevelData) {
    const r = this.rect;
    const { tileSize, tiles } = level;
    const startCol = Math.floor(r.x / tileSize);
    const endCol = Math.floor((r.x + r.w - 1) / tileSize);
    const startRow = Math.floor(r.y / tileSize);
    const endRow = Math.floor((r.y + r.h - 1) / tileSize);

    const wasOnGround = this.onGround;
    this.onGround = false;
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const tile = tiles[row]?.[col];
        if (tile === TileType.SOLID || (tile === TileType.SLIDE && !this.sliding)) {
          if (this.vy > 0) {
            const tileTop = row * tileSize;
            if (this.sliding) {
              this.y = tileTop - 20 - (this.h - 20);
            } else {
              this.y = tileTop - this.h;
            }
            this.vy = 0;
            this.onGround = true;
          } else if (this.vy < 0) {
            this.y = (row + 1) * tileSize;
            this.vy = 0;
          }
        }
      }
    }

    if (this.onGround) {
      this.coyoteTime = Player.COYOTE_DURATION;
    } else if (wasOnGround) {
      // just left ground - coyote timer already set
    } else {
      this.coyoteTime -= 1 / 60;
    }
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const r = this.rect;
    const sx = r.x - camX;
    const sy = r.y - camY;
    const cx = sx + r.w / 2;
    const cy = sy + r.h;

    // Draw particles behind player
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife) * 0.6;
      ctx.fillStyle = p.color + alpha + ')';
      ctx.beginPath();
      ctx.arc(p.x - camX, p.y - camY, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.squashX * this.facing, this.squashY);

    // Body (rounded character shape)
    const bodyW = r.w;
    const bodyH = r.h;

    // Legs animation
    const runCycle = Math.sin(this.animTimer * 14) * (Math.abs(this.vx) > 50 ? 1 : 0);
    
    // Legs
    ctx.fillStyle = '#2d5a8a';
    const legOffset = runCycle * 5;
    ctx.beginPath();
    ctx.ellipse(-4, -6 + legOffset, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, -6 - legOffset, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main body
    const bodyGrad = ctx.createLinearGradient(-bodyW / 2, -bodyH, bodyW / 2, 0);
    bodyGrad.addColorStop(0, '#5ba3e6');
    bodyGrad.addColorStop(0.5, '#4a90d9');
    bodyGrad.addColorStop(1, '#3a70b0');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, -bodyH / 2 - 4, bodyW / 2 + 2, bodyH / 2 - 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffcc88';
    ctx.beginPath();
    ctx.arc(0, -bodyH + 4, 9, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(3, -bodyH + 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(4, -bodyH + 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Mask/bandana
    ctx.fillStyle = '#222';
    ctx.fillRect(-8, -bodyH + 1, 16, 4);

    // Money sack (bouncing)
    const sackBounce = Math.sin(this.animTimer * 8) * 2;
    ctx.fillStyle = '#d4a017';
    ctx.beginPath();
    ctx.ellipse(8, -bodyH / 2 - 10 + sackBounce, 7, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8b6914';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('$', 5, -bodyH / 2 - 8 + sackBounce);

    ctx.restore();

    // Shield indicator (glowing ring)
    if (this.hasShield) {
      const shieldAlpha = 0.5 + Math.sin(this.animTimer * 4) * 0.2;
      ctx.strokeStyle = `rgba(0,255,200,${shieldAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy - bodyH / 2, bodyW / 2 + 6, bodyH / 2 + 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(0,255,200,${shieldAlpha * 0.4})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Speed indicator (motion lines)
    if (this.speedBoost > 0) {
      ctx.strokeStyle = 'rgba(255,200,0,0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const ly = sy + 10 + i * 12;
        ctx.beginPath();
        ctx.moveTo(sx - 12 - i * 4, ly);
        ctx.lineTo(sx - 4, ly);
        ctx.stroke();
      }
    }
  }
}
