import { Input } from './input';

export function setupTouchControls(input: Input) {
  const isMobile = 'ontouchstart' in window;
  if (!isMobile) return;

  const container = document.createElement('div');
  container.id = 'touch-controls';
  container.innerHTML = `
    <div class="touch-left">
      <button id="btn-left">◀</button>
      <button id="btn-right">▶</button>
    </div>
    <div class="touch-right">
      <button id="btn-slide">▼</button>
      <button id="btn-jump">▲</button>
    </div>
  `;
  document.body.appendChild(container);

  const style = document.createElement('style');
  style.textContent = `
    #touch-controls {
      position: fixed; bottom: 10px; left: 0; right: 0;
      display: flex; justify-content: space-between;
      padding: 0 16px; pointer-events: none; z-index: 100;
    }
    .touch-left, .touch-right { display: flex; gap: 12px; pointer-events: auto; }
    #touch-controls button {
      width: 64px; height: 64px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.5);
      background: rgba(255,255,255,0.15);
      color: #fff; font-size: 24px;
      touch-action: manipulation; user-select: none;
      -webkit-user-select: none;
    }
    #touch-controls button:active { background: rgba(255,255,255,0.4); }
  `;
  document.head.appendChild(style);

  bind('btn-left', () => input.touchLeft = true, () => input.touchLeft = false);
  bind('btn-right', () => input.touchRight = true, () => input.touchRight = false);
  bind('btn-jump', () => input.touchJump = true, () => {});
  bind('btn-slide', () => input.touchSlide = true, () => input.touchSlide = false);

  // Tap anywhere on canvas also serves as enter (for menu)
  document.getElementById('game')?.addEventListener('touchstart', () => {
    input.touchJump = true; // doubles as enter/start
  });
}

function bind(id: string, onDown: () => void, onUp: () => void) {
  const el = document.getElementById(id)!;
  el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); });
  el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
  el.addEventListener('touchcancel', (e) => { e.preventDefault(); onUp(); });
}
