export class Input {
  private keys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  get left(): boolean {
    return this.isDown('ArrowLeft') || this.isDown('KeyA');
  }

  get right(): boolean {
    return this.isDown('ArrowRight') || this.isDown('KeyD');
  }

  get jump(): boolean {
    return this.isDown('ArrowUp') || this.isDown('KeyW') || this.isDown('Space');
  }

  get slide(): boolean {
    return this.isDown('ArrowDown') || this.isDown('KeyS');
  }

  get enter(): boolean {
    return this.isDown('Enter');
  }
}
