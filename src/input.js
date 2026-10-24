// Keyboard + on-screen touch buttons unified. Scenes read: left/right (held), consumeJump(), consumeSlash().
export class InputManager {
  constructor(scene) {
    const k = scene.input.keyboard;
    this.keys = k.addKeys({ l: 'LEFT', a: 'A', r: 'RIGHT', d: 'D', u: 'UP', w: 'W', sp: 'SPACE', j: 'J', k: 'K', p: 'P', esc: 'ESC' });
    this.touch = { left: false, right: false }; this.jumpQ = false; this.slashQ = false; this.pauseQ = false;
    this.keys.u.on('down', () => (this.jumpQ = true)); this.keys.w.on('down', () => (this.jumpQ = true)); this.keys.sp.on('down', () => (this.jumpQ = true));
    this.keys.j.on('down', () => (this.slashQ = true)); this.keys.k.on('down', () => (this.slashQ = true));
    this.keys.p.on('down', () => (this.pauseQ = true)); this.keys.esc.on('down', () => (this.pauseQ = true));
    scene.input.addPointer(3);
  }
  get left() { return this.keys.l.isDown || this.keys.a.isDown || this.touch.left; }
  get right() { return this.keys.r.isDown || this.keys.d.isDown || this.touch.right; }
  consumeJump() { const v = this.jumpQ; this.jumpQ = false; return v; }
  consumeSlash() { const v = this.slashQ; this.slashQ = false; return v; }
  consumePause() { const v = this.pauseQ; this.pauseQ = false; return v; }
  reset() { this.jumpQ = this.slashQ = this.pauseQ = false; this.touch.left = this.touch.right = false; }
}
