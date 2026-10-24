import { W, H } from '../consts.js';
import { txt } from '../ui.js';
import labels from '../../config/labels.json';

export class HUD {
  constructor(scene, cfg, input, audio, settings, handlers) {
    this.scene = scene; this.max = cfg.petals.max;
    this.icons = Array.from({ length: this.max }, (_, i) => scene.add.image(14 + i * 15, 18, 'petal').setScale(2.6).setDepth(50));
    this.timer = txt(scene, W / 2, 16, '2:00', 24).setDepth(50);
    this.phase = txt(scene, W / 2, 40, labels.day, 13, { stroke: 3 }).setDepth(50);
    const mk = (x, draw, cb) => {
      const bg = scene.add.rectangle(x, 20, 30, 28, 0x1b1230, 0.8).setStrokeStyle(2, 0xff8fb3).setDepth(50).setInteractive({ useHandCursor: true });
      const g = scene.add.graphics({ x, y: 20 }).setDepth(51).fillStyle(0xfbe9f0, 1).lineStyle(2, 0xfbe9f0, 1); draw(g);
      bg.on('pointerdown', cb); return { bg, g };
    };
    mk(514, g => { g.fillRect(-6, -7, 4, 14); g.fillRect(2, -7, 4, 14); }, handlers.pause);
    this.snd = mk(550, g => { g.fillRect(-8, -3, 4, 6); g.fillTriangle(-4, -3, 2, -8, 2, 8); g.fillTriangle(-4, 3, 2, 8, -4, -3); g.beginPath(); g.arc(3, 0, 5, -0.9, 0.9); g.strokePath(); }, handlers.mute);
    this.slashLine = scene.add.graphics({ x: 550, y: 20 }).setDepth(52).lineStyle(3, 0xff6a6a, 1).lineBetween(-9, 8, 9, -8).setVisible(false);
    if (scene.sys.game.device.fullscreen.available) mk(586, g => { [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { g.fillRect(sx * 8 - (sx > 0 ? 5 : 0), sy * 8 - (sy > 0 ? 2 : 0), 5, 2); g.fillRect(sx * 8 - (sx > 0 ? 2 : 0), sy * 8 - (sy > 0 ? 5 : 0), 2, 5); }); }, () => scene.scale.toggleFullscreen());
    mk(622, g => { g.beginPath(); g.arc(0, 0, 7, 0.5, 5.4); g.strokePath(); g.fillTriangle(5, -9, 10, -2, 1, -3); }, handlers.restart);
    this.touchObjs = [];
    if (scene.sys.game.device.input.touch || new URLSearchParams(location.search).has('touch')) this.touch(scene, input);
    this.refreshSound(settings);
  }
  touch(scene, input) {
    const btn = (x, y, r, label, down, up) => {
      const c = scene.add.circle(x, y, r, 0xffffff, 0.16).setStrokeStyle(3, 0xffffff, 0.55).setDepth(55).setInteractive();
      const t = txt(scene, x, y, label, 14, { stroke: 3 }).setDepth(56); let id = null;
      c.on('pointerdown', p => { id = p.id; c.setFillStyle(0xff8fb3, 0.35); down(); });
      const release = p => { if (p.id === id) { id = null; c.setFillStyle(0xffffff, 0.16); up && up(); } };
      scene.input.on('pointerup', release); c.on('pointerout', p => release(p));
      this.touchObjs.push(c, t);
    };
    btn(58, H - 54, 40, '', () => (input.touch.left = true), () => (input.touch.left = false));
    btn(150, H - 54, 40, '', () => (input.touch.right = true), () => (input.touch.right = false));
    this.touchObjs.push(scene.add.triangle(58, H - 54, 10, 0, -8, -11, -8, 11, 0xffffff, 0.9).setDepth(56), scene.add.triangle(150, H - 54, -10, 0, 8, -11, 8, 11, 0xffffff, 0.9).setDepth(56));
    btn(W - 150, H - 54, 40, labels.ctrlJump, () => (input.jumpQ = true));
    btn(W - 58, H - 54, 44, labels.ctrlSlash, () => (input.slashQ = true));
  }
  refreshSound(s) { this.slashLine.setVisible(!(s.sound && s.music)); }
  set(remaining, petals, isDay) {
    const r = Math.max(0, Math.ceil(remaining)); this.timer.setText(Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0'));
    this.icons.forEach((ic, i) => ic.setTexture(i < petals ? 'petal' : 'petal_off'));
    this.phase.setText(isDay ? labels.day : labels.night);
  }
}
