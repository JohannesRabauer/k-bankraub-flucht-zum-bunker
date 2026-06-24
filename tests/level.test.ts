import { describe, it, expect } from 'vitest';
import { loadLevel } from '../src/level';
import { TileType } from '../src/types';

describe('Level', () => {
  it('loads a level with valid dimensions', () => {
    const level = loadLevel();
    expect(level.width).toBeGreaterThan(0);
    expect(level.height).toBeGreaterThan(0);
    expect(level.tiles.length).toBe(level.height);
    expect(level.tiles[0].length).toBe(level.width);
  });

  it('has a player start position', () => {
    const level = loadLevel();
    expect(level.playerStart.x).toBeGreaterThanOrEqual(0);
    expect(level.playerStart.y).toBeGreaterThanOrEqual(0);
  });

  it('has bunker tiles', () => {
    const level = loadLevel();
    let hasBunker = false;
    for (const row of level.tiles) {
      for (const tile of row) {
        if (tile === TileType.BUNKER) hasBunker = true;
      }
    }
    expect(hasBunker).toBe(true);
  });

  it('has collectibles', () => {
    const level = loadLevel();
    expect(level.collectibles.length).toBeGreaterThan(0);
  });

  it('has bunkerX set', () => {
    const level = loadLevel();
    expect(level.bunkerX).toBeGreaterThan(0);
  });
});
