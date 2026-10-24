// Background music uses the provided WAV tracks; sound effects use Web Audio.
// Nothing starts until unlock() is called from a user gesture.
const MUSIC_TRACKS = {
  ambient: new URL('../samurai-sakura-menu.wav', import.meta.url).href,
  battle: new URL('../samurai-sakura-game-battle.wav', import.meta.url).href
};

export class AudioManager {
  constructor(settings) { this.s = settings; this.ctx = null; this.mode = 'off'; this.musicBuffers = new Map(); this.currentTrack = null; this.musicLoad = null; }
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
      this.musicLoad = Promise.all(Object.entries(MUSIC_TRACKS).map(async ([mode, url]) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status} al cargar ${url}`);
        const buffer = await c.decodeAudioData(await response.arrayBuffer());
        this.musicBuffers.set(mode, buffer);
      })).then(() => this.syncMusic()).catch(error => {
        console.error('No se pudieron cargar las pistas de música:', error);
      });
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => this.syncMusic()).catch(error => {
        console.error('No se pudo reanudar el audio:', error);
      });
    }
    this.apply();
  }
  apply() {
    if (!this.ctx) return;
    const s = this.s, t = this.ctx.currentTime;
    this.musicG.gain.setTargetAtTime(s.sound && s.music ? s.musicVol * 0.5 : 0, t, 0.05);
    this.sfxG.gain.setTargetAtTime(s.sound ? s.sfxVol * 0.7 : 0, t, 0.05);
  }
  setMode(mode) { if (mode !== this.mode) { this.mode = mode; this.syncMusic(); } }
  syncMusic() {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    if (this.currentTrack?.mode === this.mode) return;

    const t = c.currentTime;
    if (this.currentTrack) {
      const previous = this.currentTrack;
      this.currentTrack = null;
      previous.gain.gain.setTargetAtTime(0, t, 0.12);
      previous.source.stop(t + 0.7);
    }

    const buffer = this.musicBuffers.get(this.mode);
    if (!buffer) return;

    const source = c.createBufferSource(), gain = c.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.setValueAtTime(0, t);
    gain.gain.setTargetAtTime(1, t, 0.12);
    source.connect(gain);
    gain.connect(this.musicG);
    const track = { mode: this.mode, source, gain };
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      if (this.currentTrack === track) this.currentTrack = null;
    };
    this.currentTrack = track;
    source.start(t);
  }

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
