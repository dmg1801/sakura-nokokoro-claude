// Scenery bundle used by every scene: sky, parallax layers, Fuji, pagoda, ground, tree, lanterns, petals.
import { W, GY, TREE_X } from '../consts.js';
import { DayNightController } from './DayNightController.js';
import { Pagoda } from './Pagoda.js';
import { PetalParticles } from './PetalParticles.js';
import { SakuraTree } from './SakuraTree.js';
import { mixColor } from '../logic.js';

export class World {
  constructor(scene, cfg, settings) {
    this.scene = scene; this.time = 0;
    this.daynight = new DayNightController(scene, this);
    this.fuji = scene.add.image(500, GY - 30, 'fuji').setOrigin(0.5, 1).setDepth(3);
    this.far = scene.add.image(W / 2, GY - 10, 'hills_far').setOrigin(0.5, 1).setDepth(4);
    this.mid = scene.add.image(W / 2, GY, 'hills_mid').setOrigin(0.5, 1).setDepth(5);
    this.pagoda = new Pagoda(scene, 105, GY - 4);
    this.near = scene.add.image(W / 2, GY + 6, 'trees_near').setOrigin(0.5, 1).setDepth(8);
    this.ground = scene.add.image(0, GY - 6, 'ground').setOrigin(0, 0).setDepth(10);
    this.lanterns = [60, 245, 395, 590].map((x, i) => ({
      s: scene.add.image(x, GY - 48 - (i % 2) * 10, 'lantern').setDepth(11),
      g: scene.add.image(x, GY - 42 - (i % 2) * 10, 'glow').setDepth(11).setBlendMode('ADD').setAlpha(0).setScale(1.2)
    }));
    this.fx = new PetalParticles(scene, settings.reducedMotion);
    this.tree = new SakuraTree(scene, cfg, this.fx, settings.reducedMotion);
    this.settings = settings; this.n = 0;
  }
  setNight(n) {
    this.n = n;
    const t = mixColor(0xffffff, 0x7f8ec0, n * 0.7);
    this.ground.setTint(t); this.fuji.setTint(mixColor(0xffffff, 0x8f9cd8, n * 0.6));
    this.tree.setNight(n);
    this.pagoda.setNight(n, this.time);
    for (const l of this.lanterns) l.g.setAlpha(n * (0.55 + 0.1 * Math.sin(this.time / 300 + l.s.x)));
  }
  parallax(px) { const o = (px - TREE_X); this.fuji.x = 500 - o * 0.01; this.far.x = W / 2 - o * 0.02; this.mid.x = W / 2 - o * 0.04; this.near.x = W / 2 - o * 0.07; }
  update(time, dt, t01) { this.time = time; this.daynight.update(t01, time, this.settings.reducedMotion); this.tree.update(time, dt); }
}
