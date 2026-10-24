import { TREE_X, GY } from '../consts.js';
export class SakuraTree {
  constructor(scene, cfg, fx, reduced) {
    this.scene = scene; this.fx = fx; this.max = cfg.petals.max; this.petals = Math.min(cfg.petals.start, this.max); this.reduced = reduced;
    this.trunk = scene.add.image(TREE_X, GY + 4, 'tree_trunk').setOrigin(44 / 96, 1).setDepth(12);
    this.crown = scene.add.image(TREE_X + 8, GY - 120, 'tree_crown').setOrigin(0.5, 0.5).setDepth(13);
    this.base = this.crown.y; this.pulse = 0; this.shake = 0; this.blooming = false;
  }
  losePetal() { if (this.petals <= 0) return false; this.petals--; this.shake = 0.35; this.fx.petals(TREE_X, GY - 90, 12); return true; }
  restore() { if (this.petals >= this.max) return false; this.petals++; this.fx.petals(TREE_X, GY - 100, 6); return true; }
  update(time, dt) {
    const sway = this.reduced ? 0 : Math.sin(time / 1300) * 1.2 + Math.sin(time / 470) * 0.4;
    this.shake = Math.max(0, this.shake - dt);
    const sh = this.shake > 0 ? Math.sin(time / 25) * 2.5 : 0;
    this.crown.setAngle(sway * 0.6).setX(TREE_X + 8 + sway * 2 + sh).setY(this.base + (this.reduced ? 0 : Math.sin(time / 900) * 1.5));
    const frac = this.petals / this.max;
    this.crown.setAlpha(this.blooming ? 1 : 0.4 + 0.6 * frac);
    this.crown.setScale(this.blooming ? 1.05 + 0.04 * Math.sin(time / 400) : 1 + this.pulse * 0.06 * Math.sin(time / 120));
    this.pulse = Math.max(0, this.pulse - dt * 0.4);
  }
  setNight(n) { const t = (0xffffff & 0) + Math.round(255 - 70 * n) * 0x10101 + 0; this.trunk.setTint(t); this.crown.setTint(Math.round(255 - 40 * n) * 0x10101); }
  /** Win crescendo: refill, glow, repeated petal bursts. */
  bloom() {
    this.blooming = true; this.petals = this.max; this.pulse = 1;
    const n = this.reduced ? 3 : 10;
    for (let i = 0; i < n; i++) this.scene.time.delayedCall(i * 280, () => { this.fx.petals(TREE_X + (Math.random() - 0.5) * 160, GY - 120 + (Math.random() - 0.5) * 70, 18); this.pulse = 1; });
  }
}
