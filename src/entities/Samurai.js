import Phaser from 'phaser';
import { GY, W } from '../consts.js';
import { txt } from '../ui.js';

export class Samurai {
  constructor(scene, x, cfg, input, audio, settings) {
    this.scene = scene; this.c = cfg.samurai; this.input = input; this.audio = audio; this.settings = settings;
    this.s = scene.add.sprite(x, GY, 'sam_idle').setOrigin(0.5, 1).setDepth(21);
    this.arc = scene.add.sprite(0, 0, 'slash_arc').setOrigin(4 / 44, 0.5).setDepth(22).setVisible(false);
    this.x = x; this.y = GY; this.vx = 0; this.vy = 0; this.face = 1; this.anim = 0;
    this.stun = 0; this.inv = 0; this.slashT = -1; this.cool = 0; this.hitDone = new Set();
  }
  get stunned() { return this.stun > 0; }
  get slashing() { return this.slashT >= 0; }
  get phase() {                                    // anticipation → impact → recovery
    if (this.slashT < 0) return 'none'; const sl = this.c.slash;
    return this.slashT < sl.windup ? 'windup' : this.slashT < sl.windup + sl.active ? 'active' : 'recover';
  }
  /** Rectangle that kills ninjas, only during the 'active' phase. */
  hitbox() {
    if (this.phase !== 'active') return null; const sl = this.c.slash;
    return new Phaser.Geom.Rectangle(this.face > 0 ? this.x : this.x - sl.reach - 12, this.y - sl.height - 6, sl.reach + 12, sl.height + 6);
  }
  hurt(fromX) {
    if (this.inv > 0) return false;
    this.stun = this.c.stun; this.inv = this.c.invuln; this.slashT = -1; this.arc.setVisible(false);
    this.vx = (this.x < fromX ? -1 : 1) * 170; this.vy = -170; this.audio.hit();
    this.scene.cameras.main.shake(140, 0.005);
    const t = txt(this.scene, this.x, this.y - 44, '!', 22, { style: { color: '#ff6a6a' } }).setDepth(60);
    this.scene.tweens.add({ targets: t, y: t.y - 22, alpha: 0, duration: 600, onComplete: () => t.destroy() });
    return true;
  }
  update(dt) {
    const c = this.c, i = this.input;
    this.cool = Math.max(0, this.cool - dt); this.inv = Math.max(0, this.inv - dt);
    const wasStunned = this.stun > 0; this.stun = Math.max(0, this.stun - dt);
    const ground = this.y >= GY;
    if (this.stun <= 0) {
      let dir = (i.right ? 1 : 0) - (i.left ? 1 : 0);
      const mult = this.slashing ? 0.3 : 1;
      this.vx = dir * c.speed * mult; if (dir) this.face = dir;
      if (i.consumeJump() && ground && !this.slashing) { this.vy = -c.jump; this.audio.jump(); }
      if (i.consumeSlash() && this.cool <= 0 && !this.slashing) { this.slashT = 0; this.cool = c.slash.cooldown; this.hitDone.clear(); this.audio.shink(); }
    } else { this.vx *= 0.9; i.consumeJump(); i.consumeSlash(); }
    if (this.slashing) { this.slashT += dt; if (this.slashT >= c.slash.windup + c.slash.active + c.slash.recover) this.slashT = -1; }
    this.vy += c.gravity * dt; this.x = Math.min(W - 18, Math.max(18, this.x + this.vx * dt)); this.y += this.vy * dt;
    if (this.y >= GY) { this.y = GY; this.vy = 0; }
    this.anim += dt * (Math.abs(this.vx) > 5 ? 9 : 0);
    // visuals
    const air = this.y < GY - 1;
    let key = 'sam_idle';
    if (this.phase === 'windup') key = 'sam_slash0'; else if (this.phase === 'active' || (this.phase === 'recover' && this.slashT < c.slash.windup + c.slash.active + 0.07)) key = 'sam_slash1';
    else if (air) key = 'sam_jump'; else if (Math.abs(this.vx) > 5) key = (Math.floor(this.anim) % 2) ? 'sam_run0' : 'sam_run1';
    this.s.setTexture(key).setPosition(this.x, this.y).setFlipX(this.face < 0);
    this.s.setTint(this.stun > 0 ? 0xff7070 : 0xffffff);
    this.s.setAlpha(this.inv > 0 && this.stun <= 0 && !this.settings.reducedMotion ? (Math.floor(this.inv * 16) % 2 ? 0.45 : 1) : 1);
    const act = this.phase === 'active';
    this.arc.setVisible(act).setPosition(this.x + this.face * 8, this.y - 18).setFlipX(this.face < 0).setScale(this.face < 0 ? 1 : 1);
    if (this.face < 0) this.arc.setOrigin(1 - 4 / 44, 0.5); else this.arc.setOrigin(4 / 44, 0.5);
    void wasStunned;
  }
  freeze() { this.s.setTexture('sam_idle'); this.arc.setVisible(false); }
}
