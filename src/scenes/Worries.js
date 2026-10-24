import Phaser from 'phaser';
import gp from '../../config/gameplay.json';
import { World } from '../entities/World.js';
import { showWorries } from '../ui.js';
import { setSceneMode } from '../controls.js';

export class Worries extends Phaser.Scene {
  constructor() { super('Worries'); }
  create() {
    setSceneMode('worries');
    this.world = new World(this, gp, this.registry.get('settings'));
    this.add.image(250, 296, 'sam_sit').setOrigin(0.5, 1).setDepth(21);
    showWorries(list => { this.registry.set('worries', list); this.scene.start('Intro'); }, () => this.scene.start('Menu'));
  }
  update(time, delta) { this.world.update(time, delta / 1000, 0.03); }
}
