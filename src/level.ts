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

const TILE_COLORS: Record<TileType, string> = {
  [TileType.EMPTY]: '',
  [TileType.SOLID]: '#555566',
  [TileType.SLIDE]: '#886633',
  [TileType.PIT]: '',
  [TileType.PLATFORM]: '#667788',
  [TileType.BUNKER]: '#228833',
};

export function drawLevel(ctx: CanvasRenderingContext2D, level: LevelData, camX: number, camY: number) {
  const { tileSize, tiles } = level;
  const startCol = Math.floor(camX / tileSize);
  const endCol = Math.ceil((camX + ctx.canvas.width) / tileSize);
  const startRow = Math.floor(camY / tileSize);
  const endRow = Math.ceil((camY + ctx.canvas.height) / tileSize);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const tile = tiles[r]?.[c] ?? TileType.EMPTY;
      if (tile !== TileType.EMPTY && tile !== TileType.PIT) {
        ctx.fillStyle = TILE_COLORS[tile];
        ctx.fillRect(c * tileSize - camX, r * tileSize - camY, tileSize, tileSize);
      }
    }
  }
}

const COLLECTIBLE_COLORS: Record<string, string> = {
  coin: '#ffdd00',
  cash: '#55cc55',
  gold: '#ffaa00',
  speed: '#ff5500',
  shield: '#00ccff',
};

export function drawCollectibles(ctx: CanvasRenderingContext2D, level: LevelData, camX: number, camY: number) {
  for (const c of level.collectibles) {
    if (c.collected) continue;
    const sx = c.x - camX;
    const sy = c.y - camY;
    if (sx < -20 || sx > ctx.canvas.width + 20) continue;
    ctx.fillStyle = COLLECTIBLE_COLORS[c.type] || '#fff';
    ctx.fillRect(sx, sy, c.w, c.h);
    if (c.type === 'coin') {
      ctx.fillStyle = '#aa8800';
      ctx.font = '8px monospace';
      ctx.fillText('¢', sx + 2, sy + 10);
    }
  }
}
