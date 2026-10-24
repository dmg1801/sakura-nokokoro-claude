import Phaser from 'phaser';
import gp from '../../config/gameplay.json';
import { World } from '../entities/World.js';
import { Ninja } from '../entities/Ninja.js';
import { txt, uiK } from '../ui.js';
import { setSceneMode } from '../controls.js';
import { W, TREE_X } from '../consts.js';
import { getLabels } from '../i18n.js';

export class Intro extends Phaser.Scene {
  constructor() { super('Intro'); }
  create() {
    const labels = getLabels();
    setSceneMode('intro');
    this.settings = this.registry.get('settings'); this.audio = this.registry.get('audio'); this.audio.setMode('ambient');
    this.world = new World(this, gp, this.settings); this.t = 0; this.ninjas = []; this.going = false;
    this.sam = this.add.image(250, 296, 'sam_sit').setOrigin(0.5, 1).setDepth(21);
    this.hint = txt(this, W / 2, 330 - 10 * uiK(this), labels.hint, 20 * uiK(this)).setDepth(50).setAlpha(0);
    this.tweens.add({ targets: this.hint, alpha: 1, duration: 1500 });
    const w = this.registry.get('worries').length ? this.registry.get('worries') : labels.defaultWorries.slice(0, 2);
    this.worries = w.slice(0, 5);
    const skip = () => { if (this.t > 1) this.go(); };
    this.input.on('pointerdown', skip); this.input.keyboard.on('keydown', skip);
  }
  go() { if (this.going) return; this.going = true; this.cameras.main.fadeOut(500, 10, 6, 24); this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Play')); }
  update(time, delta) {
    const dt = delta / 1000; this.t += dt; this.world.update(time, dt, 0.02 + this.t * 0.002);
    if (this.t > 4.5 && !this.ninjas.length) this.ninjas = this.worries.map((w, i) => new Ninja(this, i % 2 ? 1 : -1, w, gp, i % 3));
    this.ninjas.forEach((n, i) => n.walkTo(dt, TREE_X + (n.side < 0 ? -90 - i * 12 : 90 + i * 12)));
    if (this.t > 8) this.go();
  }
}
