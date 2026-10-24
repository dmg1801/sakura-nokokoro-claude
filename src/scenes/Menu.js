import Phaser from 'phaser';
import gp from '../../config/gameplay.json';
import { World } from '../entities/World.js';
import { txt, showSettings, showInstructions, showMenu, showLanguagePicker, hideMenu } from '../ui.js';
import { setSceneMode } from '../controls.js';
import { W } from '../consts.js';
import { getLabels } from '../i18n.js';

export class Menu extends Phaser.Scene {
  constructor() { super('Menu'); }
  create() {
    setSceneMode('menu');
    const labels = getLabels();
    this.settings = this.registry.get('settings'); this.audio = this.registry.get('audio');
    this.audio.setMode('ambient');
    const unlockAudio = () => {
      this.audio.unlock();
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('pointerdown', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    this.world = new World(this, gp, this.settings);
    this.add.image(250, 296, 'sam_sit').setOrigin(0.5, 1).setDepth(21);
    txt(this, W / 2, 44, labels.title, 52, { stroke: 7 }).setDepth(50);
    txt(this, W / 2, 86, labels.subtitle, 18, { stroke: 4 }).setDepth(50);
    const play = () => { this.audio.unlock(); this.audio.setMode('ambient'); hideMenu(); this.scene.start('Worries'); };   // runs inside a click = user gesture
    showMenu([{ label: labels.play, primary: true, onClick: play },
      { label: labels.settings, onClick: () => showSettings(this.settings, this.audio) },
      { label: labels.instructions, onClick: () => showInstructions() }]);
    showLanguagePicker(() => this.scene.restart());
    this.input.keyboard.on('keydown-ENTER', event => {
      if (event.target === document.querySelector('#menu select')) return;
      if (!document.getElementById('ui').classList.contains('open')) play();
    });
    this.events.once('shutdown', () => {
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      hideMenu();
    });
  }
  update(time, delta) { this.world.update(time, delta / 1000, 0.07); }
}
