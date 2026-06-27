import { CANVAS_W, CANVAS_H } from './physics';

export class Camera {
  x = 0;
  y = 0;
  private targetX = 0;
  private targetY = 0;
  private shakeAmount = 0;
  private shakeTimer = 0;

  follow(targetX: number, targetY: number, levelWidth: number, levelHeight: number, dt: number) {
    this.targetX = targetX - CANVAS_W / 3;
    this.targetY = targetY - CANVAS_H * 0.55;

    // Clamp targets
    this.targetX = Math.max(0, Math.min(this.targetX, levelWidth - CANVAS_W));
    this.targetY = Math.max(0, Math.min(this.targetY, levelHeight - CANVAS_H));

    // Smooth lerp
    const lerpSpeed = 5;
    this.x += (this.targetX - this.x) * lerpSpeed * dt;
    this.y += (this.targetY - this.y) * lerpSpeed * dt;

    // Screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const shake = this.shakeAmount * (this.shakeTimer / 0.3);
      this.x += (Math.random() - 0.5) * shake;
      this.y += (Math.random() - 0.5) * shake;
    }
  }

  shake(amount = 4) {
    this.shakeAmount = amount;
    this.shakeTimer = 0.3;
  }
}
