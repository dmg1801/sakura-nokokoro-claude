import { W } from '../consts.js';
import { txt, uiK } from '../ui.js';
import { getLabels } from '../i18n.js';

// Canvas HUD: petals, timer, day/night label. Buttons live in the DOM (src/controls.js).
export class HUD {
  constructor(scene, cfg) {
    const labels = getLabels();
    this.labels = labels;
    const k = uiK(scene), ik = Math.min(k, 1.4); this.max = cfg.petals.max;
    this.icons = Array.from({ length: this.max }, (_, i) => scene.add.image(12 * ik + i * 15 * ik, 16 * ik, 'petal').setScale(2.6 * ik).setDepth(50));
    this.timer = txt(scene, W / 2, 16 * k, '2:00', 24 * k).setDepth(50);
    this.phase = txt(scene, W / 2, 16 * k + 24 * k, labels.day, 13 * k, { stroke: 3 }).setDepth(50);
  }
  set(remaining, petals, isDay) {
    const r = Math.max(0, Math.ceil(remaining)); this.timer.setText(Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0'));
    this.icons.forEach((ic, i) => ic.setTexture(i < petals ? 'petal' : 'petal_off'));
    this.phase.setText(isDay ? this.labels.day : this.labels.night);
  }
}
