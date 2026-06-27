import { Police } from './police';
import { CANVAS_W, CANVAS_H } from './physics';

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number,
  playerX: number,
  bunkerX: number,
  police: Police
) {
  ctx.save();

  // Score (modern pill badge)
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  roundRect(ctx, 8, 8, 110, 28, 14);
  ctx.fill();
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`💰 ${score}`, 20, 27);

  // Progress bar (modern style)
  const progress = Math.min(playerX / bunkerX, 1);
  const barW = 180;
  const barX = CANVAS_W / 2 - barW / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  roundRect(ctx, barX - 4, 8, barW + 8, 22, 11);
  ctx.fill();
  // Track
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, barX, 12, barW, 14, 7);
  ctx.fill();
  // Fill
  if (progress > 0.01) {
    const grad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
    grad.addColorStop(0, '#44dd88');
    grad.addColorStop(1, '#22aa66');
    ctx.fillStyle = grad;
    roundRect(ctx, barX, 12, barW * progress, 14, 7);
    ctx.fill();
  }
  // Icons
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('🏦', barX - 12, 24);
  ctx.fillText('🏠', barX + barW + 12, 24);

  // Police distance warning
  const danger = 1 - Math.min(police.distance / 200, 1);
  ctx.fillStyle = danger > 0.6 ? 'rgba(200,0,0,0.5)' : 'rgba(0,0,0,0.4)';
  roundRect(ctx, CANVAS_W - 118, 8, 110, 28, 14);
  ctx.fill();
  ctx.fillStyle = danger > 0.6 ? '#ff4444' : '#ffaa44';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`🚔 ${Math.round(police.distance)}m`, CANVAS_W - 18, 27);

  ctx.restore();
}

export function drawMenu(ctx: CanvasRenderingContext2D, time: number) {
  // Animated background overlay
  ctx.fillStyle = 'rgba(10,5,30,0.92)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Floating particles in menu
  ctx.fillStyle = 'rgba(255,215,0,0.3)';
  for (let i = 0; i < 15; i++) {
    const px = (Math.sin(time * 0.5 + i * 2.1) * 0.5 + 0.5) * ctx.canvas.width;
    const py = (Math.cos(time * 0.3 + i * 1.7) * 0.5 + 0.5) * ctx.canvas.height;
    ctx.beginPath();
    ctx.arc(px, py, 2 + Math.sin(time + i) * 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title with shadow
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('🏦 Bankraub: Flucht zum Bunker 💰', ctx.canvas.width / 2 + 2, 132);
  ctx.fillStyle = '#ffd700';
  ctx.fillText('🏦 Bankraub: Flucht zum Bunker 💰', ctx.canvas.width / 2, 130);

  // Subtitle
  ctx.fillStyle = '#ccc';
  ctx.font = '15px sans-serif';
  ctx.fillText('Fliehe vor der Polizei und erreiche den Bunker!', ctx.canvas.width / 2, 190);

  // Controls
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '13px sans-serif';
  ctx.fillText('← → Laufen  |  ↑ / Leertaste Springen  |  ↓ Rutschen', ctx.canvas.width / 2, 230);

  // Start prompt (pulsing)
  const pulse = Math.sin(time * 3) * 0.3 + 0.7;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#44ff88';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Drücke ENTER oder tippe zum Starten', ctx.canvas.width / 2, 320);
  ctx.globalAlpha = 1;

  ctx.textAlign = 'left';
}

export function drawGameOver(ctx: CanvasRenderingContext2D, score: number) {
  ctx.fillStyle = 'rgba(80,0,0,0.88)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff3333';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('🚔 GESCHNAPPT! 🚔', ctx.canvas.width / 2, 170);

  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Score: ${score}`, ctx.canvas.width / 2, 225);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '15px sans-serif';
  ctx.fillText('ENTER oder tippe zum Neustarten', ctx.canvas.width / 2, 300);
  ctx.textAlign = 'left';
}

export function drawWin(ctx: CanvasRenderingContext2D, score: number) {
  ctx.fillStyle = 'rgba(0,50,0,0.88)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#44ff88';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('💰 BUNKER ERREICHT! 💰', ctx.canvas.width / 2, 170);

  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Score: ${score}`, ctx.canvas.width / 2, 225);

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '15px sans-serif';
  ctx.fillText('ENTER oder tippe zum Neustarten', ctx.canvas.width / 2, 300);
  ctx.textAlign = 'left';
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
