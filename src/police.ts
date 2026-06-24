export class Police {
  distance = 200; // pixels behind player
  private flashTimer = 0;

  update(dt: number, playerVx: number, playerOnGround: boolean) {
    // Police catches up when player is slow/stuck
    if (playerVx === 0 && playerOnGround) {
      this.distance -= 60 * dt;
    } else if (Math.abs(playerVx) > 250) {
      this.distance += 30 * dt;
    } else {
      this.distance -= 20 * dt;
    }
    // Clamp
    this.distance = Math.min(this.distance, 300);
    this.flashTimer += dt;
  }

  get caught(): boolean {
    return this.distance <= 0;
  }

  draw(ctx: CanvasRenderingContext2D, canvasH: number) {
    const intensity = 1 - Math.min(this.distance / 200, 1);
    const flash = Math.sin(this.flashTimer * 8) > 0;

    // Police glow from left
    const gradient = ctx.createLinearGradient(0, 0, 80 + intensity * 60, 0);
    gradient.addColorStop(0, flash ? `rgba(255,0,0,${0.3 + intensity * 0.4})` : `rgba(0,80,255,${0.3 + intensity * 0.4})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 140, canvasH);

    // Distance warning
    if (intensity > 0.5) {
      ctx.fillStyle = `rgba(255,0,0,${(intensity - 0.5) * 0.3})`;
      ctx.fillRect(0, 0, ctx.canvas.width, canvasH);
    }
  }
}
