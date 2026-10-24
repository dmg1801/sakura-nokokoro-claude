import Phaser from 'phaser';
import quotesData from '../../config/quotes.json';
import { showResults, closeOverlay } from '../ui.js';
import { pickQuote } from '../logic.js';

// Launched on top of Play. The panel is DOM (readable and finger-friendly in portrait and landscape).
export class Results extends Phaser.Scene {
  constructor() { super('Results'); }
  init(d) { this.win = !!d.win; }
  create() {
    const leave = (target) => { closeOverlay(); this.scene.stop('Play'); this.scene.start(target); };
    showResults({ win: this.win, quote: this.win ? pickQuote(quotesData.quotes) : null,
      onRetry: () => leave('Play'), onNew: () => leave('Worries'), onMenu: () => leave('Menu') });
  }
}
