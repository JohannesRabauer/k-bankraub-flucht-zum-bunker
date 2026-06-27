import { TileType, LevelData, Collectible } from './types';
import { TILE_SIZE } from './physics';

function createLevel(): LevelData {
  const cols = 235; // ~7520px wide
  const rows = 14;  // 448px tall
  const tiles: TileType[][] = [];

  // Initialize all empty
  for (let r = 0; r < rows; r++) {
    tiles[r] = [];
    for (let c = 0; c < cols; c++) {
      tiles[r][c] = TileType.EMPTY;
    }
  }

  // Ground floor (row 13 = bottom)
  const groundRow = rows - 1;
  for (let c = 0; c < cols; c++) {
    tiles[groundRow][c] = TileType.SOLID;
  }

  // === Section 1: Bank Exit (cols 0-15) ===
  // Simple flat ground with a few small obstacles
  tiles[groundRow - 2][8] = TileType.SOLID; // small box
  tiles[groundRow - 2][12] = TileType.SOLID;

  // === Section 2: Rooftops (cols 16-78) ===
  // Elevated platforms with gaps
  for (let c = 16; c < 78; c++) {
    tiles[groundRow][c] = TileType.EMPTY; // remove ground (pits below)
  }
  // Rooftop platforms
  const roofRow = 9;
  buildPlatform(tiles, roofRow, 16, 24);
  buildPlatform(tiles, roofRow, 27, 35);
  buildPlatform(tiles, roofRow - 1, 37, 42);
  buildPlatform(tiles, roofRow, 44, 52);
  buildPlatform(tiles, roofRow + 1, 54, 60);
  buildPlatform(tiles, roofRow, 63, 70);
  buildPlatform(tiles, roofRow, 73, 78);
  // Rescue platforms lower (so falling isn't instant death)
  buildPlatform(tiles, groundRow - 2, 20, 23);
  buildPlatform(tiles, groundRow - 2, 38, 41);
  buildPlatform(tiles, groundRow - 2, 55, 58);
  buildPlatform(tiles, groundRow - 2, 68, 72);

  // === Section 3: Narrow Alleys (cols 78-125) ===
  // Ground restored, slide barriers
  for (let c = 78; c < 125; c++) {
    tiles[groundRow][c] = TileType.SOLID;
  }
  // Slide-under barriers (2 tiles high at row groundRow-2 and groundRow-1)
  addSlideBarrier(tiles, groundRow, 85);
  addSlideBarrier(tiles, groundRow, 95);
  addSlideBarrier(tiles, groundRow, 108);
  addSlideBarrier(tiles, groundRow, 118);
  // Some jump obstacles
  tiles[groundRow - 1][90] = TileType.SOLID;
  tiles[groundRow - 1][102] = TileType.SOLID;
  tiles[groundRow - 1][113] = TileType.SOLID;

  // === Section 4: Construction Site (cols 125-172) ===
  for (let c = 125; c < 172; c++) {
    tiles[groundRow][c] = TileType.SOLID;
  }
  // Moving platforms section - use static platforms as substitute
  buildPlatform(tiles, groundRow - 3, 130, 134);
  buildPlatform(tiles, groundRow - 5, 137, 141);
  buildPlatform(tiles, groundRow - 3, 144, 148);
  buildPlatform(tiles, groundRow - 4, 151, 155);
  buildPlatform(tiles, groundRow - 3, 158, 163);
  buildPlatform(tiles, groundRow - 5, 166, 170);
  // Pits
  for (let c = 135; c < 137; c++) tiles[groundRow][c] = TileType.EMPTY;
  for (let c = 149; c < 151; c++) tiles[groundRow][c] = TileType.EMPTY;
  for (let c = 163; c < 166; c++) tiles[groundRow][c] = TileType.EMPTY;

  // === Section 5: Underground Tunnel (cols 172-219) ===
  for (let c = 172; c < 219; c++) {
    tiles[groundRow][c] = TileType.SOLID;
    tiles[0][c] = TileType.SOLID; // ceiling
    tiles[1][c] = TileType.SOLID;
  }
  // Tight passages with slides and jumps
  addSlideBarrier(tiles, groundRow, 180);
  addSlideBarrier(tiles, groundRow, 192);
  addSlideBarrier(tiles, groundRow, 205);
  tiles[groundRow - 1][185] = TileType.SOLID;
  tiles[groundRow - 1][198] = TileType.SOLID;
  tiles[groundRow - 1][210] = TileType.SOLID;
  buildPlatform(tiles, groundRow - 3, 188, 191);
  buildPlatform(tiles, groundRow - 3, 200, 203);

  // === Section 6: Bunker Entrance (cols 219-234) ===
  for (let c = 219; c < cols; c++) {
    tiles[groundRow][c] = TileType.SOLID;
  }
  // Bunker door
  tiles[groundRow - 1][230] = TileType.BUNKER;
  tiles[groundRow - 2][230] = TileType.BUNKER;
  tiles[groundRow - 3][230] = TileType.BUNKER;

  // Collectibles
  const collectibles: Collectible[] = [
    // Section 1
    ...makeCoins(5, groundRow - 3, 3, 7),
    // Section 2 (rooftops)
    ...makeCoins(10, roofRow - 2, 18, 70),
    { x: 40 * TILE_SIZE, y: (roofRow - 2) * TILE_SIZE, w: 16, h: 16, type: 'cash', collected: false },
    { x: 65 * TILE_SIZE, y: (roofRow - 2) * TILE_SIZE, w: 16, h: 16, type: 'gold', collected: false },
    { x: 50 * TILE_SIZE, y: (roofRow - 2) * TILE_SIZE, w: 16, h: 16, type: 'speed', collected: false },
    // Section 3
    ...makeCoins(8, groundRow - 3, 80, 120),
    { x: 100 * TILE_SIZE, y: (groundRow - 3) * TILE_SIZE, w: 16, h: 16, type: 'shield', collected: false },
    // Section 4
    ...makeCoins(6, groundRow - 6, 130, 170),
    { x: 155 * TILE_SIZE, y: (groundRow - 6) * TILE_SIZE, w: 16, h: 16, type: 'gold', collected: false },
    // Section 5
    ...makeCoins(8, groundRow - 3, 175, 215),
    { x: 195 * TILE_SIZE, y: (groundRow - 4) * TILE_SIZE, w: 16, h: 16, type: 'speed', collected: false },
    { x: 212 * TILE_SIZE, y: (groundRow - 3) * TILE_SIZE, w: 16, h: 16, type: 'cash', collected: false },
  ];

  return {
    width: cols,
    height: rows,
    tileSize: TILE_SIZE,
    tiles,
    collectibles,
    playerStart: { x: 2 * TILE_SIZE, y: (groundRow - 2) * TILE_SIZE },
    bunkerX: 230 * TILE_SIZE,
  };
}

function buildPlatform(tiles: TileType[][], row: number, startCol: number, endCol: number) {
  for (let c = startCol; c <= endCol; c++) {
    if (tiles[row]) tiles[row][c] = TileType.SOLID;
  }
}

function addSlideBarrier(tiles: TileType[][], groundRow: number, col: number) {
  tiles[groundRow - 2][col] = TileType.SLIDE;
  tiles[groundRow - 3][col] = TileType.SLIDE;
  tiles[groundRow - 2][col + 1] = TileType.SLIDE;
  tiles[groundRow - 3][col + 1] = TileType.SLIDE;
}

function makeCoins(count: number, row: number, startCol: number, endCol: number): Collectible[] {
  const coins: Collectible[] = [];
  const step = Math.floor((endCol - startCol) / count);
  for (let i = 0; i < count; i++) {
    coins.push({
      x: (startCol + i * step) * TILE_SIZE + 8,
      y: row * TILE_SIZE + 8,
      w: 12,
      h: 12,
      type: 'coin',
      collected: false,
    });
  }
  return coins;
}

export function loadLevel(): LevelData {
  return createLevel();
}

export function drawLevel(ctx: CanvasRenderingContext2D, level: LevelData, camX: number, camY: number) {
  const { tileSize, tiles } = level;
  const startCol = Math.floor(camX / tileSize);
  const endCol = Math.ceil((camX + ctx.canvas.width) / tileSize);
  const startRow = Math.floor(camY / tileSize);
  const endRow = Math.ceil((camY + ctx.canvas.height) / tileSize);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tile = tiles[r]?.[c] ?? TileType.EMPTY;
      if (tile === TileType.EMPTY || tile === TileType.PIT) continue;

      const tx = c * tileSize - camX;
      const ty = r * tileSize - camY;

      if (tile === TileType.SOLID) {
        // Check if top is exposed (no solid above)
        const above = tiles[r - 1]?.[c] ?? TileType.EMPTY;
        const isTop = above === TileType.EMPTY || above === TileType.PIT;

        // Main tile body with gradient
        const grad = ctx.createLinearGradient(tx, ty, tx, ty + tileSize);
        if (isTop) {
          grad.addColorStop(0, '#6a8a6a');
          grad.addColorStop(0.2, '#4a6a4a');
          grad.addColorStop(1, '#3a5a3a');
        } else {
          grad.addColorStop(0, '#5a5a6a');
          grad.addColorStop(1, '#3a3a4a');
        }
        ctx.fillStyle = grad;
        roundRect(ctx, tx + 0.5, ty + 0.5, tileSize - 1, tileSize - 1, isTop ? 3 : 1);
        ctx.fill();

        // Top highlight for grass/surface tiles
        if (isTop) {
          ctx.fillStyle = '#7aaa5a';
          roundRect(ctx, tx + 1, ty, tileSize - 2, 4, 2);
          ctx.fill();
        }

        // Subtle edge
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        roundRect(ctx, tx + 0.5, ty + 0.5, tileSize - 1, tileSize - 1, isTop ? 3 : 1);
        ctx.stroke();
      } else if (tile === TileType.SLIDE) {
        // Warning-striped barrier
        ctx.fillStyle = '#996633';
        ctx.fillRect(tx + 1, ty + 1, tileSize - 2, tileSize - 2);
        ctx.fillStyle = 'rgba(255,200,0,0.4)';
        for (let s = 0; s < tileSize; s += 8) {
          ctx.fillRect(tx + s, ty, 4, tileSize);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + 1, ty + 1, tileSize - 2, tileSize - 2);
      } else if (tile === TileType.BUNKER) {
        // Bunker door (metallic)
        const bunkerGrad = ctx.createLinearGradient(tx, ty, tx + tileSize, ty);
        bunkerGrad.addColorStop(0, '#2a6a3a');
        bunkerGrad.addColorStop(0.5, '#4aaa5a');
        bunkerGrad.addColorStop(1, '#2a6a3a');
        ctx.fillStyle = bunkerGrad;
        ctx.fillRect(tx, ty, tileSize, tileSize);
        ctx.strokeStyle = '#1a4a2a';
        ctx.lineWidth = 2;
        ctx.strokeRect(tx + 2, ty + 2, tileSize - 4, tileSize - 4);
        // Rivets
        ctx.fillStyle = '#8ac';
        ctx.beginPath();
        ctx.arc(tx + 6, ty + 6, 2, 0, Math.PI * 2);
        ctx.arc(tx + tileSize - 6, ty + 6, 2, 0, Math.PI * 2);
        ctx.arc(tx + 6, ty + tileSize - 6, 2, 0, Math.PI * 2);
        ctx.arc(tx + tileSize - 6, ty + tileSize - 6, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

let collectibleAnimTimer = 0;

export function drawCollectibles(ctx: CanvasRenderingContext2D, level: LevelData, camX: number, camY: number, dt: number) {
  collectibleAnimTimer += dt;

  for (const c of level.collectibles) {
    if (c.collected) continue;
    const sx = c.x - camX;
    const sy = c.y - camY;
    if (sx < -20 || sx > ctx.canvas.width + 20) continue;

    // Floating animation
    const floatOffset = Math.sin(collectibleAnimTimer * 3 + c.x * 0.01) * 3;
    const drawY = sy + floatOffset;

    // Glow
    const glowAlpha = 0.2 + Math.sin(collectibleAnimTimer * 4 + c.x * 0.02) * 0.1;

    if (c.type === 'coin') {
      // Spinning coin
      const scaleX = Math.cos(collectibleAnimTimer * 5 + c.x * 0.03);
      ctx.save();
      ctx.translate(sx + c.w / 2, drawY + c.h / 2);
      ctx.scale(scaleX, 1);
      // Glow
      ctx.fillStyle = `rgba(255,220,0,${glowAlpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      // Coin body
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cc9900';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('¢', 0, 3);
      ctx.textAlign = 'left';
      ctx.restore();
    } else if (c.type === 'cash') {
      ctx.fillStyle = `rgba(80,200,80,${glowAlpha})`;
      ctx.beginPath();
      ctx.arc(sx + c.w / 2, drawY + c.h / 2, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a8a3a';
      roundRect(ctx, sx, drawY, c.w, c.h, 2);
      ctx.fill();
      ctx.fillStyle = '#5aca5a';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('$', sx + c.w / 2, drawY + 12);
      ctx.textAlign = 'left';
    } else if (c.type === 'gold') {
      ctx.fillStyle = `rgba(255,180,0,${glowAlpha})`;
      ctx.beginPath();
      ctx.arc(sx + c.w / 2, drawY + c.h / 2, 11, 0, Math.PI * 2);
      ctx.fill();
      // Gold bar shape
      ctx.fillStyle = '#daa520';
      ctx.beginPath();
      ctx.moveTo(sx + 2, drawY + c.h);
      ctx.lineTo(sx + 4, drawY + 2);
      ctx.lineTo(sx + c.w - 4, drawY + 2);
      ctx.lineTo(sx + c.w - 2, drawY + c.h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffcc44';
      ctx.beginPath();
      ctx.moveTo(sx + 4, drawY + 2);
      ctx.lineTo(sx + 6, drawY);
      ctx.lineTo(sx + c.w - 6, drawY);
      ctx.lineTo(sx + c.w - 4, drawY + 2);
      ctx.closePath();
      ctx.fill();
    } else if (c.type === 'speed') {
      ctx.fillStyle = `rgba(255,100,0,${glowAlpha + 0.1})`;
      ctx.beginPath();
      ctx.arc(sx + c.w / 2, drawY + c.h / 2, 11, 0, Math.PI * 2);
      ctx.fill();
      // Lightning bolt
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(sx + 9, drawY);
      ctx.lineTo(sx + 4, drawY + 8);
      ctx.lineTo(sx + 8, drawY + 8);
      ctx.lineTo(sx + 6, drawY + 16);
      ctx.lineTo(sx + 12, drawY + 6);
      ctx.lineTo(sx + 9, drawY + 6);
      ctx.lineTo(sx + 11, drawY);
      ctx.closePath();
      ctx.fill();
    } else if (c.type === 'shield') {
      ctx.fillStyle = `rgba(0,200,255,${glowAlpha + 0.1})`;
      ctx.beginPath();
      ctx.arc(sx + c.w / 2, drawY + c.h / 2, 11, 0, Math.PI * 2);
      ctx.fill();
      // Shield shape
      ctx.fillStyle = '#0099cc';
      ctx.beginPath();
      ctx.moveTo(sx + c.w / 2, drawY);
      ctx.lineTo(sx + c.w - 2, drawY + 4);
      ctx.lineTo(sx + c.w - 2, drawY + 10);
      ctx.lineTo(sx + c.w / 2, drawY + c.h);
      ctx.lineTo(sx + 2, drawY + 10);
      ctx.lineTo(sx + 2, drawY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#44ddff';
      ctx.beginPath();
      ctx.arc(sx + c.w / 2, drawY + c.h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
