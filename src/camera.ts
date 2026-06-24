import { CANVAS_W, CANVAS_H } from './physics';

export class Camera {
  x = 0;
  y = 0;

  follow(targetX: number, targetY: number, levelWidth: number, levelHeight: number) {
    this.x = targetX - CANVAS_W / 3;
    this.y = targetY - CANVAS_H / 2;
    this.x = Math.max(0, Math.min(this.x, levelWidth - CANVAS_W));
    this.y = Math.max(0, Math.min(this.y, levelHeight - CANVAS_H));
  }
}
