export class Input {
  private keys = new Set<string>();
  private _jumpBuffered = false;
  private _enterBuffered = false;

  // Touch state
  touchLeft = false;
  touchRight = false;
  touchJump = false;
  touchSlide = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys.has(e.code)) {
        if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
          this._jumpBuffered = true;
        }
        if (e.code === 'Enter') {
          this._enterBuffered = true;
        }
      }
      this.keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  get left(): boolean {
    return this.keys.has('ArrowLeft') || this.keys.has('KeyA') || this.touchLeft;
  }

  get right(): boolean {
    return this.keys.has('ArrowRight') || this.keys.has('KeyD') || this.touchRight;
  }

  get jumpHeld(): boolean {
    return this.keys.has('ArrowUp') || this.keys.has('KeyW') || this.keys.has('Space') || this.touchJump;
  }

  get jumpPressed(): boolean {
    return this._jumpBuffered || this.touchJump;
  }

  get slide(): boolean {
    return this.keys.has('ArrowDown') || this.keys.has('KeyS') || this.touchSlide;
  }

  get enter(): boolean {
    return this._enterBuffered;
  }

  /** Call once per frame after processing input */
  endFrame() {
    this._jumpBuffered = false;
    this._enterBuffered = false;
    this.touchJump = false; // touch jump is single-fire per tap
  }
}
