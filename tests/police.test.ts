import { describe, it, expect } from 'vitest';
import { Police } from '../src/police';

describe('Police', () => {
  it('catches up when player is stationary', () => {
    const police = new Police();
    const initial = police.distance;
    police.update(1, 0, true); // player stationary on ground
    expect(police.distance).toBeLessThan(initial);
  });

  it('falls behind when player is fast', () => {
    const police = new Police();
    const initial = police.distance;
    police.update(1, 300, true); // player moving fast
    expect(police.distance).toBeGreaterThan(initial);
  });

  it('reports caught when distance is zero', () => {
    const police = new Police();
    police.distance = 0;
    expect(police.caught).toBe(true);
  });

  it('reports not caught with positive distance', () => {
    const police = new Police();
    expect(police.caught).toBe(false);
  });

  it('clamps distance to max 300', () => {
    const police = new Police();
    police.distance = 290;
    police.update(1, 300, true);
    expect(police.distance).toBeLessThanOrEqual(300);
  });
});
