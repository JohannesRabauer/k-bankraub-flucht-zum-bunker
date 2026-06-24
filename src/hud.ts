import { Police } from './police';
import { CANVAS_W } from './physics';

export function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number,
  playerX: number,
  bunkerX: number,
  police: Police
) {
  // Score
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText(`Score: ${score}`, 10, 24);

  // Progress bar
  const progress = Math.min(playerX / bunkerX, 1);
  const barW = 200;
  const barX = CANVAS_W / 2 - barW / 2;
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, 8, barW, 14);
  ctx.fillStyle = '#44cc44';
  ctx.fillRect(barX, 8, barW * progress, 14);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(barX, 8, barW, 14);
  ctx.fillStyle = '#fff';
  ctx.font = '10px monospace';
  ctx.fillText('🏦', barX - 16, 20);
  ctx.fillText('🏠', barX + barW + 4, 20);

  // Police distance warning
  const danger = 1 - Math.min(police.distance / 200, 1);
  ctx.fillStyle = danger > 0.5 ? '#ff3333' : '#ffaa00';
  ctx.font = '14px monospace';
  ctx.fillText(`🚔 ${Math.round(police.distance)}m`, CANVAS_W - 100, 24);
}

export function drawMenu(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🏦 Bankraub: Flucht zum Bunker 💰', ctx.canvas.width / 2, 140);
  ctx.fillStyle = '#fff';
  ctx.font = '16px monospace';
  ctx.fillText('Fliehe vor der Polizei und erreiche den Bunker!', ctx.canvas.width / 2, 200);
  ctx.fillText('← → Laufen | ↑/Leertaste Springen | ↓ Rutschen', ctx.canvas.width / 2, 240);
  ctx.font = '20px monospace';
  ctx.fillStyle = '#44ff44';
  ctx.fillText('Drücke ENTER zum Starten', ctx.canvas.width / 2, 320);
  ctx.textAlign = 'left';
}

export function drawGameOver(ctx: CanvasRenderingContext2D, score: number) {
  ctx.fillStyle = 'rgba(100,0,0,0.85)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#ff3333';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('🚔 GESCHNAPPT! 🚔', ctx.canvas.width / 2, 180);
  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText(`Score: ${score}`, ctx.canvas.width / 2, 230);
  ctx.font = '16px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('ENTER zum Neustarten', ctx.canvas.width / 2, 300);
  ctx.textAlign = 'left';
}

export function drawWin(ctx: CanvasRenderingContext2D, score: number) {
  ctx.fillStyle = 'rgba(0,60,0,0.85)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#44ff44';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('💰 BUNKER ERREICHT! 💰', ctx.canvas.width / 2, 180);
  ctx.fillStyle = '#fff';
  ctx.font = '18px monospace';
  ctx.fillText(`Score: ${score}`, ctx.canvas.width / 2, 230);
  ctx.font = '16px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('ENTER zum Neustarten', ctx.canvas.width / 2, 300);
  ctx.textAlign = 'left';
}
