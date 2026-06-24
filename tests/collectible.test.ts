import { describe, it, expect } from 'vitest';
import { checkCollectibles } from '../src/collectible';
import { Player } from '../src/player';
import { LevelData, TileType } from '../src/types';

function makeMiniLevel(): LevelData {
  return {
    width: 10,
    height: 5,
    tileSize: 32,
    tiles: Array.from({ length: 5 }, () => Array(10).fill(TileType.EMPTY)),
    collectibles: [
      { x: 50, y: 50, w: 12, h: 12, type: 'coin', collected: false },
      { x: 200, y: 50, w: 12, h: 12, type: 'gold', collected: false },
      { x: 50, y: 50, w: 12, h: 12, type: 'speed', collected: false },
    ],
    playerStart: { x: 50, y: 50 },
    bunkerX: 300,
  };
}

describe('Collectibles', () => {
  it('collects coin and adds points', () => {
    const level = makeMiniLevel();
    const player = new Player(48, 45);
    const points = checkCollectibles(player, level);
    expect(points).toBe(10); // coin gives 10
    expect(level.collectibles[0].collected).toBe(true);
  });

  it('does not collect items far away', () => {
    const level = makeMiniLevel();
    const player = new Player(300, 300);
    const points = checkCollectibles(player, level);
    expect(points).toBe(0);
  });

  it('applies speed boost on speed pickup', () => {
    const level = makeMiniLevel();
    const player = new Player(48, 45);
    checkCollectibles(player, level);
    expect(player.speedBoost).toBe(3);
  });

  it('does not re-collect already collected items', () => {
    const level = makeMiniLevel();
    level.collectibles[0].collected = true;
    const player = new Player(48, 45);
    const points = checkCollectibles(player, level);
    // coin already collected, speed gives 0 points
    expect(points).toBe(0);
  });
});
