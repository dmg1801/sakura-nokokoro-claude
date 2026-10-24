import Phaser from 'phaser';
import gp from '../../config/gameplay.json';
import { buildTextures } from '../art.js';
import { AudioManager } from '../audio.js';
import { loadSettings } from '../settings.js';

export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    // Optional PNG overrides: config/gameplay.json -> "assets": { "sam_idle": "assets/my_samurai.png" }
    this.load.setBaseURL(import.meta.env.BASE_URL);
    for (const [key, path] of Object.entries(gp.assets || {})) this.load.image(key, path);
    this.load.on('loaderror', f => console.warn('Asset not found, using built-in art:', f.key));
  }
  create() {
    buildTextures(this);
    const settings = loadSettings();
    this.registry.set('settings', settings); this.registry.set('audio', new AudioManager(settings)); this.registry.set('worries', []);
    this.scene.start('Menu');
  }
}
