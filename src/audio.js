// Procedural Web Audio: original Japanese-inspired music (Hirajoshi scale, koto-like plucks, taiko) + SFX.
// Nothing starts until unlock() is called from a user gesture.
// To use your own files instead, replace the bodies of music()/sfx methods with HTMLAudio/Phaser sounds.
const SCALE = [0, 2, 3, 7, 8];            // Hirajoshi
const D4 = 293.66;
const note = (deg) => D4 * Math.pow(2, (SCALE[((deg % 5) + 5) % 5] + 12 * Math.floor(deg / 5)) / 12);

export class AudioManager {
  constructor(settings) { this.s = settings; this.ctx = null; this.mode = 'off'; this.step = 0; this.deg = 5; this.timer = null; }
  get ready() { return !!this.ctx && this.ctx.state === 'running'; }

  unlock() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      const c = this.ctx = new C();
      this.musicG = c.createGain(); this.sfxG = c.createGain(); this.master = c.createGain();
      this.musicG.connect(this.master); this.sfxG.connect(this.master); this.master.connect(c.destination);
      const len = c.sampleRate * 0.6, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = b;
      this.timer = setInterval(() => this.tick(), 90);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.apply();
  }
  apply() {
    if (!this.ctx) return;
    const s = this.s, t = this.ctx.currentTime;
    this.musicG.gain.setTargetAtTime(s.sound && s.music ? s.musicVol * 0.5 : 0, t, 0.05);
    this.sfxG.gain.setTargetAtTime(s.sound ? s.sfxVol * 0.7 : 0, t, 0.05);
  }
  setMode(m) { if (m !== this.mode) { this.mode = m; this.next = 0; } }

  // ---------- music scheduler ----------
  tick() {
    const c = this.ctx; if (!c || c.state !== 'running' || this.mode === 'off') return;
    const stepDur = this.mode === 'battle' ? 0.30 : 0.5;
    if (!this.next || this.next < c.currentTime) this.next = c.currentTime + 0.05;
    while (this.next < c.currentTime + 0.3) { this.playStep(this.step++, this.next); this.next += stepDur; }
  }
  playStep(n, t) {
    const battle = this.mode === 'battle';
    if (n % 32 === 0) this.pad(note(-5), t, 6);
    if (battle) {
      if (n % 4 === 0) this.taiko(t, 1); else if (n % 4 === 2) this.taiko(t, 0.45);
      if (n % 2 === 1) this.wood(t, 0.5);
    } else {
      if (n % 16 === 0) this.taiko(t, 0.55);
      if (n % 8 === 4) this.wood(t, 0.3);
    }
    if (Math.random() < (battle ? 0.65 : 0.4)) {                  // random-walk melody
      this.deg = Math.max(0, Math.min(11, this.deg + [-2, -1, -1, 1, 1, 2][(Math.random() * 6) | 0]));
      this.pluck(note(this.deg), t, battle ? 0.7 : 1.4);
    }
  }
  pluck(f, t, dur) {
    const c = this.ctx, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); o2.connect(g); g.connect(this.musicG); o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  pad(f, t, dur) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 2); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(this.musicG); o.start(t); o.stop(t + dur + 0.1);
  }
  taiko(t, v) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.25);
    g.gain.setValueAtTime(0.9 * v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    o.connect(g); g.connect(this.musicG); o.start(t); o.stop(t + 0.5);
    this.burst(t, 0.08, 500, 'lowpass', 0.4 * v, this.musicG);
  }
  wood(t, v) { this.burst(t, 0.04, 1800, 'bandpass', 0.5 * v, this.musicG); }
  burst(t, dur, freq, type, vol, dest, sweepTo) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = type; f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfxG); s.start(t); s.stop(t + dur + 0.02);
  }
  tone(f0, f1, dur, type = 'sine', vol = 0.4, delay = 0) {
    if (!this.ready) return;
    const c = this.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.sfxG); o.start(t); o.stop(t + dur + 0.02);
  }

  // ---------- SFX ----------
  shink() { if (!this.ready) return; const t = this.ctx.currentTime;
    this.burst(t, 0.22, 2500, 'highpass', 0.6, null, 9000); this.tone(3200, 5400, 0.2, 'triangle', 0.25); this.tone(4800, 6400, 0.35, 'sine', 0.12, 0.05); }
  hit() { if (!this.ready) return; this.burst(this.ctx.currentTime, 0.18, 700, 'lowpass', 0.8); this.tone(160, 60, 0.2, 'sine', 0.6); }
  jump() { this.tone(280, 620, 0.12, 'sine', 0.25); }
  steal() { this.tone(520, 160, 0.4, 'triangle', 0.4); }
  kill() { this.tone(988, 988, 0.5, 'sine', 0.3); this.tone(1480, 1480, 0.6, 'sine', 0.15, 0.04); }
  restore() { this.tone(660, 990, 0.25, 'sine', 0.3); }
  lose() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, f * 0.98, 0.8, 'triangle', 0.35, i * 0.35)); }
  win() { [293.66, 369.99, 440, 587.33, 739.99, 880].forEach((f, i) => this.tone(f, f, 2.2, 'sine', 0.3, i * 0.22)); }
}
