// Pooled particles (Phaser emitters recycle particles; counts are capped via maxAliveParticles).
import { W } from '../consts.js';
export class PetalParticles {
  constructor(scene, reduced) {
    this.reduced = reduced; this.scene = scene;
    this.ambient = scene.add.particles(0, 0, 'petal', {
      x: { min: -40, max: W }, y: -8, lifespan: 10000, speedX: { min: 25, max: 75 }, speedY: { min: 22, max: 42 },
      frequency: reduced ? 700 : 260, quantity: 1, rotate: { start: 0, end: 540 }, scale: { min: 1, max: 2 }, alpha: { start: 1, end: 0.5 }, maxAliveParticles: reduced ? 25 : 60
    }).setDepth(30);
    this.petalBurst = scene.add.particles(0, 0, 'petal', { emitting: false, lifespan: 1100, speed: { min: 40, max: 150 }, angle: { min: 0, max: 360 },
      gravityY: 140, scale: { start: 2.4, end: 0.3 }, rotate: { start: 0, end: 360 }, alpha: { start: 1, end: 0 }, maxAliveParticles: 120 }).setDepth(31);
    this.fireworks = scene.add.particles(0, 0, 'spark', { emitting: false, lifespan: 950, speed: { min: 60, max: 170 }, angle: { min: 0, max: 360 },
      gravityY: 70, scale: { start: 2.2, end: 0 }, tint: [0xffe066, 0xff6fa5, 0x6fe3ff, 0xffffff], blendMode: 'ADD', maxAliveParticles: 150 }).setDepth(31);
  }
  killDay(x, y) { this.petalBurst.explode(this.reduced ? 6 : 16, x, y); }
  killNight(x, y) { this.fireworks.explode(this.reduced ? 10 : 30, x, y); }
  petals(x, y, n = 10) { this.petalBurst.explode(this.reduced ? Math.ceil(n / 2) : n, x, y); }
  setPaused(p) { for (const e of [this.ambient, this.petalBurst, this.fireworks]) e.timeScale = p ? 0 : 1; }
}
