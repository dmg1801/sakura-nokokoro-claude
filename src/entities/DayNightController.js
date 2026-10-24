// Drives the 120 s cycle: sky gradient, sun/moon arcs, stars, lantern + pagoda lights, night overlay.
// Palette stops are plain data below — edit them to restyle the sky.
import { W, GY } from '../consts.js';
import { sample, mixColor, lerp } from '../logic.js';

// [t01, topColor, bottomColor]   t01 = elapsed/duration. 0 = dawn, 0.25 = noon, 0.5 = sunset/dusk, 0.75 = midnight, 1 = dawn.
export const SKY = [
  [0.00, [0x4a3f7a, 0xf6a77c]], [0.10, [0x5aa0d8, 0xd6ebf7]], [0.25, [0x3f8fe0, 0xa8d8f5]], [0.38, [0x5a8fd0, 0xf5d9a0]],
  [0.48, [0x6a4a8a, 0xff7a4a]], [0.55, [0x1d1f4a, 0x7a3f6a]], [0.65, [0x0c1236, 0x24306a]], [0.78, [0x070b22, 0x1a2450]],
  [0.90, [0x1d2255, 0x4a4a82]], [1.00, [0x4a3f7a, 0xf6a77c]]
];
export const NIGHT = [[0, 0.3], [0.1, 0], [0.42, 0], [0.55, 1], [0.88, 1], [1, 0.3]];   // 0 = full day, 1 = full night
const mixPair = (a, b, k) => [mixColor(a[0], b[0], k), mixColor(a[1], b[1], k)];

export class DayNightController {
  constructor(scene, w) {
    this.scene = scene; this.n = 0;
    this.sky = scene.add.graphics().setDepth(0);
    this.stars = Array.from({ length: 70 }, () => { const s = scene.add.image(Math.random() * W, Math.random() * 190, 'star').setDepth(1).setAlpha(0);
      s.ph = Math.random() * 6.28; s.sp = 1 + Math.random() * 3; return s; });
    this.sunGlow = scene.add.image(0, 0, 'glow').setDepth(2).setScale(3).setBlendMode('ADD').setTint(0xffc060);
    this.sun = scene.add.image(0, 0, 'sun').setDepth(2);
    this.moonGlow = scene.add.image(0, 0, 'glow').setDepth(2).setScale(2.6).setBlendMode('ADD').setTint(0x9fb8ff);
    this.moon = scene.add.image(0, 0, 'moon').setDepth(2);
    this.overlay = scene.add.rectangle(0, 0, W, GY, 0x070b30, 0).setOrigin(0).setDepth(9);
    this.w = w;
  }
  /** Returns night factor 0..1. */
  update(t01, time, reduced) {
    t01 = Math.min(1, Math.max(0, t01));
    const [top, bot] = sample(SKY.map(([t, v]) => [t, v]), t01, mixPair);
    const g = this.sky; g.clear();
    const bands = 20, h = GY / bands + 1;
    for (let i = 0; i < bands; i++) { g.fillStyle(mixColor(top, bot, Math.pow(i / (bands - 1), 1.4)), 1); g.fillRect(0, (i * GY) / bands, W, h); }
    const n = this.n = sample(NIGHT, t01);
    // sun: first half, moon: second half. Arc peak at middle of each half.
    const ks = t01 / 0.5, km = (t01 - 0.5) / 0.5, arc = (k) => [-30 + k * (W + 60), GY - 20 - Math.sin(Math.PI * k) * 215];
    const [sx, sy] = arc(Math.min(1, ks)), [mx, my] = arc(Math.max(0, Math.min(1, km)));
    const sunUp = ks <= 1, moonUp = km >= 0;
    this.sun.setPosition(sx, sy).setVisible(sunUp); this.sunGlow.setPosition(sx, sy).setVisible(sunUp).setAlpha(0.35 + 0.2 * Math.sin(time / 900));
    this.moon.setPosition(mx, my).setVisible(moonUp); this.moonGlow.setPosition(mx, my).setVisible(moonUp).setAlpha(0.35 * n);
    this.sun.setTint(mixColor(0xffffff, 0xff9a4a, Math.pow(1 - Math.sin(Math.PI * Math.min(1, ks)), 3)));
    for (const s of this.stars) s.setAlpha(reduced ? n * 0.8 : n * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time / 1000 * s.sp + s.ph))));
    this.overlay.setFillStyle(0x070b30, 0.28 * n);
    this.w.setNight(n);
    return n;
  }
}
