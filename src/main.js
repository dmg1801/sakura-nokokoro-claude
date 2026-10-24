import Phaser from 'phaser';
import { W, H } from './consts.js';
import { Boot } from './scenes/Boot.js';
import { Menu } from './scenes/Menu.js';
import { Worries } from './scenes/Worries.js';
import { Intro } from './scenes/Intro.js';
import { Play } from './scenes/Play.js';
import { Results } from './scenes/Results.js';
import { initControls } from './controls.js';

initControls();

const game = new Phaser.Game({
  type: Phaser.AUTO, width: W, height: H, parent: 'game', pixelArt: true, roundPixels: true, backgroundColor: '#0b0818',
  audio: { noAudio: true },                       // we use our own Web Audio (src/audio.js)
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  scene: [Boot, Menu, Worries, Intro, Play, Results]
});
window.__game = game;   // handy for debugging in the console
