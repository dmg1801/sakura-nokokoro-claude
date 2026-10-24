import Phaser from 'phaser';
import gp from '../../config/gameplay.json';
import labels from '../../config/labels.json';
import { World } from '../entities/World.js';
import { Samurai } from '../entities/Samurai.js';
import { Ninja } from '../entities/Ninja.js';
import { HUD } from '../entities/HUD.js';
import { InputManager } from '../input.js';
import { makeButton, txt } from '../ui.js';
import { spawnInterval, isDay } from '../logic.js';
import { W, H, TREE_X } from '../consts.js';

export class Play extends Phaser.Scene {
  constructor() { super('Play'); }
  create() {
    this.settings = this.registry.get('settings'); this.audio = this.registry.get('audio');
    this.world = new World(this, gp, this.settings); this.tree = this.world.tree; this.fx = this.world.fx;
    this.input_ = new InputManager(this);
    this.sam = new Samurai(this, 250, gp, this.input_, this.audio, this.settings);
    this.ninjas = []; this.elapsed = 0; this.spawnT = 1.5; this.spawned = 0; this.state = 'play'; this.lastNight = null;
    this.worries = this.registry.get('worries').length ? this.registry.get('worries') : gp.defaultWorries;
    this.hud = new HUD(this, gp, this.input_, this.audio, this.settings, { pause: () => this.setPaused(!this.paused), mute: () => this.toggleMute(), restart: () => this.scene.restart() });
    this.audio.setMode('battle'); this.paused = false;
    this.onHidden = () => this.state === 'play' && this.setPaused(true);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.onHidden);
    this.events.once('shutdown', () => this.game.events.off(Phaser.Core.Events.HIDDEN, this.onHidden));
    this.cameras.main.fadeIn(400, 10, 6, 24);
  }
  toggleMute() { const s = this.settings; const on = s.sound && s.music; s.sound = !on; s.music = !on; this.audio.apply(); this.hud.refreshSound(s); }
  setPaused(p) {
    if (this.state !== 'play') return; this.paused = p; this.fx.setPaused(p); this.input_.reset();
    if (p) {
      this.pauseUI = [this.add.rectangle(0, 0, W, H, 0x0a0618, 0.65).setOrigin(0).setDepth(90).setInteractive(), txt(this, W / 2, 110, labels.pause, 34).setDepth(91),
        makeButton(this, W / 2, 170, 200, 40, labels.resume, () => this.setPaused(false), { depth: 92, size: 18 }),
        makeButton(this, W / 2, 218, 200, 40, labels.restart, () => this.scene.restart(), { depth: 92, size: 18 }),
        makeButton(this, W / 2, 266, 200, 40, labels.mainMenu, () => this.exit('Menu'), { depth: 92, size: 18 })];
    } else { this.pauseUI && this.pauseUI.forEach(o => o.destroy()); this.pauseUI = null; }
  }
  exit(scene) { this.scene.stop('Results'); this.audio.setMode('ambient'); this.scene.start(scene); }
  spawn() {
    const alive = this.ninjas.filter(n => !n.dead).length; if (alive >= gp.ninja.maxActive) return;
    const text = this.worries[this.spawned % this.worries.length];
    this.ninjas.push(new Ninja(this, this.spawned % 2 ? 1 : -1, text, gp, this.spawned % 3)); this.spawned++;
  }
  update(time, delta) {
    if (this.input_.consumePause() && this.state === 'play') this.setPaused(!this.paused);
    if (this.paused) return;
    const dt = Math.min(delta, 50) / 1000, d = gp.duration;
    if (this.state === 'play') {
      this.elapsed = Math.min(d, this.elapsed + dt);          // only advances while playing and not paused
      this.sam.update(dt); this.world.parallax(this.sam.x);
      const hb = this.sam.hitbox();
      for (const n of this.ninjas) {
        if (n.dead) continue; const b = n.hurtbox;
        if (hb && !this.sam.hitDone.has(n) && Phaser.Geom.Rectangle.Overlaps(hb, new Phaser.Geom.Rectangle(b.x, b.y, b.w, b.h))) {
          this.sam.hitDone.add(n); n.die(isDay(this.elapsed, d), this.fx); this.audio.kill();
          if (this.tree.restore()) this.audio.restore();
        } else n.update(dt, this.sam, this.tree, this.audio, this.fx);
      }
      this.ninjas = this.ninjas.filter(n => !n.dead || n.s.active);
      this.spawnT -= dt; if (this.spawnT <= 0) { this.spawn(); this.spawnT = spawnInterval(gp.spawn, this.elapsed); }
      if (this.tree.petals <= 0) return this.lose();
      if (this.elapsed >= d) return this.win();
    }
    this.world.update(time, dt, this.elapsed / d);
    this.hud.set(d - this.elapsed, this.tree.petals, isDay(this.elapsed, d));
  }
  lose() {
    this.state = 'lost'; this.audio.lose(); this.audio.setMode('ambient'); this.sam.freeze(); this.hud.set(gp.duration - this.elapsed, 0, isDay(this.elapsed, gp.duration));
    this.time.delayedCall(700, () => this.scene.launch('Results', { win: false }));
  }
  win() {
    this.state = 'won'; this.hud.set(0, this.tree.petals, false);
    this.ninjas.forEach(n => !n.dead && n.die(false, this.fx));                // enemies vanish
    this.sam.freeze(); this.tree.bloom(); this.audio.win(); this.audio.setMode('ambient');
    this.time.delayedCall(3600, () => this.scene.launch('Results', { win: true }));
  }
}
