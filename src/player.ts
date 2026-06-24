import { Input } from './input';
import { GRAVITY, PLAYER_SPEED, PLAYER_JUMP, PLAYER_JUMP_CUT, SLIDE_DURATION } from './physics';
import { TileType, LevelData, Rect } from './types';

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

  private static readonly COYOTE_DURATION = 0.08;
  private static readonly JUMP_BUFFER_DURATION = 0.12;

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
    const speed = this.speedBoost > 0 ? PLAYER_SPEED * 2 : PLAYER_SPEED;
    if (this.speedBoost > 0) this.speedBoost -= dt;

    // Horizontal movement
    if (input.right) this.vx = speed;
    else if (input.left) this.vx = -speed;
    else this.vx = 0;

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
    }
    // Variable jump height - cut jump short if released early
    if (!input.jumpHeld && this.vy < PLAYER_JUMP_CUT) {
      this.vy = PLAYER_JUMP_CUT;
    }

    // Slide
    if (input.slide && this.onGround && !this.sliding) {
      this.sliding = true;
      this.slideTimer = SLIDE_DURATION;
    }
    if (this.sliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.sliding = false;
    }

    // Gravity
    this.vy += GRAVITY * dt;

    // Move X
    this.x += this.vx * dt;
    this.resolveCollisionsX(level);

    // Move Y
    this.y += this.vy * dt;
    this.resolveCollisionsY(level);

    // Pit death
    if (this.y > level.height * level.tileSize) {
      this.die();
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
          // Push out
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
      // just left ground - start coyote timer (already set above)
    } else {
      this.coyoteTime -= 1 / 60; // approximate dt
    }
  }

  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const r = this.rect;
    const sx = r.x - camX;
    const sy = r.y - camY;

    // Body
    ctx.fillStyle = '#4a90d9';
    ctx.fillRect(sx, sy, r.w, r.h);

    // Money sack
    ctx.fillStyle = '#c8a415';
    ctx.fillRect(sx + r.w - 10, sy - 8, 12, 12);
    ctx.fillStyle = '#a08010';
    ctx.font = '8px monospace';
    ctx.fillText('$', sx + r.w - 6, sy - 0);

    // Shield indicator
    if (this.hasShield) {
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx - 2, sy - 2, r.w + 4, r.h + 4);
    }

    // Speed indicator
    if (this.speedBoost > 0) {
      ctx.fillStyle = '#ffcc00';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(sx - 8 - i * 4, sy + r.h / 2 - 2 + i * 4, 6, 2);
      }
    }
  }
}
