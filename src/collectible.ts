import { Player } from './player';
import { LevelData, Rect } from './types';

const POINTS: Record<string, number> = {
  coin: 10,
  cash: 50,
  gold: 100,
  speed: 0,
  shield: 0,
};

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function checkCollectibles(player: Player, level: LevelData): number {
  let points = 0;
  const pr = player.rect;
  for (const c of level.collectibles) {
    if (c.collected) continue;
    if (rectsOverlap(pr, c)) {
      c.collected = true;
      points += POINTS[c.type] || 0;
      if (c.type === 'speed') player.speedBoost = 3;
      if (c.type === 'shield') player.hasShield = true;
    }
  }
  return points;
}
