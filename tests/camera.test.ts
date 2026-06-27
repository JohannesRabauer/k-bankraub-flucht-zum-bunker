import { describe, it, expect } from 'vitest';
import { Camera } from '../src/camera';

describe('Camera', () => {
  it('follows player horizontally', () => {
    const cam = new Camera();
    // Call multiple times with large dt to converge
    for (let i = 0; i < 60; i++) cam.follow(400, 200, 2000, 500, 1 / 60);
    expect(cam.x).toBeGreaterThan(0);
  });

  it('clamps to level bounds (left)', () => {
    const cam = new Camera();
    for (let i = 0; i < 60; i++) cam.follow(0, 200, 2000, 500, 1 / 60);
    expect(cam.x).toBe(0);
  });

  it('clamps to level bounds (right)', () => {
    const cam = new Camera();
    for (let i = 0; i < 60; i++) cam.follow(1900, 200, 2000, 500, 1 / 60);
    expect(cam.x).toBeLessThanOrEqual(2000 - 800);
  });
});
