import Phaser from 'phaser';
import gp from '../../config/gameplay.json';
import labels from '../../config/labels.json';
import { World } from '../entities/World.js';
import { makeButton, txt, showSettings, showInstructions } from '../ui.js';
import { W } from '../consts.js';

export class Menu extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    this.settings = this.registry.get('settings'); this.audio = this.registry.get('audio');
    this.world = new World(this, gp, this.settings);
    this.add.image(250, 296, 'sam_sit').setOrigin(0.5, 1).setDepth(21);
    txt(this, W / 2, 44, labels.title, 52, { stroke: 7 }).setDepth(50);
    txt(this, W / 2, 86, labels.subtitle, 18, { stroke: 4 }).setDepth(50);
    this.btns = [
      makeButton(this, 548, 170, 170, 38, labels.play, () => { this.audio.unlock(); this.audio.setMode('ambient'); this.scene.start('Worries'); }, { size: 18 }),
      makeButton(this, 548, 216, 170, 38, labels.settings, () => showSettings(this.settings, this.audio)),
      makeButton(this, 548, 262, 170, 38, labels.instructions, () => showInstructions())
    ];
    if (this.sys.game.device.fullscreen.available) makeButton(this, 610, 20, 44, 28, '⤢', () => this.scale.toggleFullscreen(), { size: 14 });
    this.input.keyboard.on('keydown-ENTER', () => { if (!document.getElementById('ui').classList.contains('open')) this.btns[0].bg.emit('pointerdown'); });
  }
  update(time, delta) { this.world.update(time, delta / 1000, 0.07); }
}
