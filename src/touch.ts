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
      position: fixed; bottom: 16px; left: 0; right: 0;
      display: flex; justify-content: space-between;
      padding: 0 20px; pointer-events: none; z-index: 100;
    }
    .touch-left, .touch-right { display: flex; gap: 14px; pointer-events: auto; }
    #touch-controls button {
      width: 72px; height: 72px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.6);
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(4px);
      color: #fff; font-size: 26px;
      touch-action: manipulation; user-select: none;
      -webkit-user-select: none;
      transition: transform 0.08s ease, background 0.08s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    #touch-controls button:active {
      background: rgba(255,255,255,0.35);
      transform: scale(0.9);
    }
    #btn-jump {
      background: rgba(80,200,120,0.25);
      border-color: rgba(80,200,120,0.7);
      width: 80px; height: 80px; font-size: 30px;
    }
    #btn-jump:active {
      background: rgba(80,200,120,0.5);
    }
  `;
  document.head.appendChild(style);

  bind('btn-left', () => input.touchLeft = true, () => input.touchLeft = false);
  bind('btn-right', () => input.touchRight = true, () => input.touchRight = false);
  bind('btn-jump',
    () => { input.touchJumpPressed = true; input.touchJumpHeld = true; },
    () => { input.touchJumpHeld = false; }
  );
  bind('btn-slide', () => input.touchSlide = true, () => input.touchSlide = false);

  // Tap anywhere on canvas also serves as enter (for menu)
  document.getElementById('game')?.addEventListener('touchstart', () => {
    input.touchJumpPressed = true;
    input.touchJumpHeld = true;
  });
  document.getElementById('game')?.addEventListener('touchend', () => {
    input.touchJumpHeld = false;
  });
}

function bind(id: string, onDown: () => void, onUp: () => void) {
  const el = document.getElementById(id)!;
  el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); });
  el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
  el.addEventListener('touchcancel', (e) => { e.preventDefault(); onUp(); });
}
