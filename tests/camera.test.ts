import { describe, it, expect } from 'vitest';
import { Camera } from '../src/camera';

describe('Camera', () => {
  it('follows player horizontally', () => {
    const cam = new Camera();
    cam.follow(400, 200, 2000, 500);
    expect(cam.x).toBeGreaterThan(0);
  });

  it('clamps to level bounds (left)', () => {
    const cam = new Camera();
    cam.follow(0, 200, 2000, 500);
    expect(cam.x).toBe(0);
  });

  it('clamps to level bounds (right)', () => {
    const cam = new Camera();
    cam.follow(1900, 200, 2000, 500);
    expect(cam.x).toBeLessThanOrEqual(2000 - 800);
  });
});
