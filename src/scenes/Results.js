import Phaser from 'phaser';
import quotesData from '../../config/quotes.json';
import labels from '../../config/labels.json';
import { makeButton, txt } from '../ui.js';
import { pickQuote } from '../logic.js';
import { W, H } from '../consts.js';

export class Results extends Phaser.Scene {
  constructor() { super('Results'); }
  init(d) { this.win = !!d.win; }
  create() {
    this.add.rectangle(0, 0, W, H, 0x0a0618, this.win ? 0.55 : 0.7).setOrigin(0).setDepth(100).setInteractive();
    const leave = (target, data) => { this.scene.stop('Play'); this.scene.start(target, data); };
    const D = 101;
    if (this.win) {
      const q = pickQuote(quotesData.quotes);
      txt(this, W / 2, 46, labels.winTitle, 26).setDepth(D);
      txt(this, W / 2, 112, '“' + q.original + '”', 17, { wrap: 520, stroke: 4 }).setDepth(D);
      txt(this, W / 2, 176, q.es, 15, { wrap: 520, style: { color: '#ffd1e1', fontStyle: 'italic' } }).setDepth(D);
      txt(this, W / 2, 226, '— ' + q.author + ' · ' + q.source, 12, { wrap: 540, stroke: 3 }).setDepth(D);
      makeButton(this, W / 2 - 110, 290, 190, 40, labels.newGame, () => leave('Worries'), { depth: D, size: 16 });
      makeButton(this, W / 2 + 110, 290, 190, 40, labels.mainMenu, () => leave('Menu'), { depth: D, size: 16 });
    } else {
      txt(this, W / 2, 80, labels.loseTitle, 24, { wrap: 540 }).setDepth(D);
      txt(this, W / 2, 150, labels.loseBody, 16, { wrap: 480, stroke: 3 }).setDepth(D);
      makeButton(this, W / 2 - 170, 262, 150, 40, labels.retry, () => leave('Play'), { depth: D, size: 15 });
      makeButton(this, W / 2, 262, 150, 40, labels.newGame, () => leave('Worries'), { depth: D, size: 15 });
      makeButton(this, W / 2 + 170, 262, 150, 40, labels.mainMenu, () => leave('Menu'), { depth: D, size: 15 });
    }
  }
}
