import { PAGODA } from '../art.js';
export class Pagoda {
  constructor(scene, x, y) {
    this.body = scene.add.image(x, y, 'pagoda').setOrigin(0.5, 1).setDepth(6);
    this.lit = scene.add.image(x, y, 'pagoda_lit').setOrigin(0.5, 1).setDepth(7).setAlpha(0);
    this.glow = scene.add.image(x, y - PAGODA.h / 2, 'glow').setDepth(7).setScale(3.2).setBlendMode('ADD').setAlpha(0).setTint(0xffb050);
  }
  setNight(n, time) { this.lit.setAlpha(n * (0.85 + 0.15 * Math.sin(time / 700))); this.glow.setAlpha(n * 0.25); this.body.setTint(0xffffff); }
}
