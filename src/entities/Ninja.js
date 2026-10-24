import { GY, W, TREE_X } from '../consts.js';
import { txt } from '../ui.js';
import { clamp } from '../logic.js';

const GRAV = 1100;
export class Ninja {
  constructor(scene, side, text, cfg, lane = 0) {
    this.scene = scene; this.c = cfg.ninja; this.side = side; this.x = side < 0 ? -16 : W + 16; this.y = GY; this.vy = 0;
    this.speed = this.c.speed + (Math.random() * 2 - 1) * this.c.speedJitter;
    this.s = scene.add.sprite(this.x, this.y, 'nin0').setOrigin(0.5, 1).setDepth(20);
    this.label = txt(scene, this.x, this.y - 34, text, 14, { stroke: 5, style: { color: '#ffffff', backgroundColor: '#120a22dd', padding: { x: 5, y: 2 } } }).setDepth(40);
    this.lane = lane; this.state = 'walk'; this.t = 0; this.atkCd = 1.0; this.anim = Math.random() * 3; this.dead = false;
  }
  get hurtbox() { return { x: this.x - 9, y: this.y - 26, w: 18, h: 26 }; }
  _sync(dir) {
    this.s.setPosition(this.x, this.y).setFlipX(dir < 0);
    const hw = this.label.width / 2 + 4;
    this.label.setPosition(clamp(this.x, hw, W - hw), this.y - 32 - this.lane * 20);
  }
  /** Intro helper: plain walk toward targetX. */
  walkTo(dt, targetX) { const d = Math.sign(targetX - this.x); if (Math.abs(targetX - this.x) > 3) { this.x += d * this.speed * dt; this.anim += dt * 8; } this.s.setTexture('nin' + (Math.floor(this.anim) % 2)); this._sync(d || 1); }
  update(dt, sam, tree, audio, fx) {
    if (this.dead) return;
    this.t += dt; this.atkCd -= dt;
    this.vy += GRAV * dt; this.y += this.vy * dt; if (this.y >= GY) { this.y = GY; this.vy = 0; }
    const air = this.y < GY - 1; let dir = this.side < 0 ? 1 : -1;
    if (this.state === 'walk') {
      dir = Math.sign(TREE_X - this.x) || 1; this.x += dir * this.speed * dt; this.anim += dt * 8;
      if (!air && Math.random() < this.c.jumpChancePerSec * dt) this.vy = -this.c.jump;
      const near = Math.abs(sam.x - this.x) < this.c.attackRange + 10 && Math.abs(sam.y - this.y) < 26;
      if (this.atkCd <= 0 && near && sam.inv <= 0) { this.state = 'wind'; this.t = 0; }
      if (Math.abs(this.x - TREE_X) < 22 && !air) {                          // reached the trunk → steal a petal and flee
        if (tree.losePetal()) audio.steal();
        this.state = 'flee'; this.side = this.x < TREE_X ? -1 : 1; this.s.setTint(0xffffff);
      }
    } else if (this.state === 'wind') {                                         // anticipation: yellow flash before striking
      this.s.setTint(Math.floor(this.t * 20) % 2 ? 0xffe14a : 0xffffff); dir = Math.sign(sam.x - this.x) || 1;
      if (this.t >= this.c.attackWindup) {
        if (Math.abs(sam.x - this.x) < this.c.attackRange + 8 && Math.abs(sam.y - this.y) < 28) sam.hurt(this.x);
        this.state = 'recover'; this.t = 0; this.s.clearTint(); this.atkCd = this.c.attackRecover + 0.6;
      }
    } else if (this.state === 'recover') { if (this.t >= this.c.attackRecover) this.state = 'walk'; dir = Math.sign(sam.x - this.x) || 1; }
    else if (this.state === 'flee') { dir = this.side; this.x += dir * this.speed * 1.9 * dt; this.anim += dt * 12; if (this.x < -40 || this.x > W + 40) { this.destroy(); return; } }
    this.s.setTexture(air ? 'nin2' : 'nin' + (Math.floor(this.anim) % 2));
    this._sync(dir);
  }
  /** Defeated: dissolve into petals (day) or fireworks (night). */
  die(isDay, fx) {
    if (this.dead) return; this.dead = true;
    (isDay ? fx.killDay : fx.killNight).call(fx, this.x, this.y - 14);
    this.scene.tweens.add({ targets: [this.s, this.label], alpha: 0, duration: 200, onComplete: () => this.destroy() });
  }
  destroy() { this.dead = true; this.s.destroy(); this.label.destroy(); }
}
