// DOM overlays (worries form, settings, instructions) + Phaser button helper.
// All text is inserted with textContent, never innerHTML, so user input cannot inject markup.
import Phaser from 'phaser';
import labels from '../config/labels.json';
import gp from '../config/gameplay.json';
import { sanitizeWorry } from './logic.js';
import { saveSettings } from './settings.js';

const root = () => document.getElementById('ui');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
export function closeOverlay() { const r = root(); r.replaceChildren(); r.classList.remove('open'); }
function panel(title) {
  const r = root(); r.replaceChildren(); r.classList.add('open');
  const p = el('div', 'panel'); p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'true');
  p.append(el('h2', null, title)); r.append(p); return p;
}

export function showInstructions(onClose) {
  const p = panel(labels.instrTitle);
  const ul = el('ul'); labels.instr.forEach(t => ul.append(el('li', null, t))); p.append(ul, el('p', 'small', labels.disclaimer));
  const b = el('button', 'btn', labels.back); b.onclick = () => { closeOverlay(); onClose && onClose(); }; p.append(b); b.focus();
}

export function showSettings(settings, audio, onClose) {
  const p = panel(labels.settingsTitle);
  const save = () => { saveSettings(settings); audio.apply(); };
  const check = (key, text) => { const l = el('label', 'row'); const i = el('input'); i.type = 'checkbox'; i.checked = !!settings[key];
    i.onchange = () => { settings[key] = i.checked; save(); }; l.append(i, el('span', null, text)); p.append(l); };
  const slider = (key, text) => { const l = el('label', 'row'); const i = el('input'); i.type = 'range'; i.min = 0; i.max = 1; i.step = 0.05; i.value = settings[key];
    i.oninput = () => { settings[key] = +i.value; save(); }; l.append(el('span', null, text), i); p.append(l); };
  check('sound', labels.sSound); check('music', labels.sMusic); slider('musicVol', labels.sMusicVol); slider('sfxVol', labels.sSfxVol); check('reducedMotion', labels.sMotion);
  const b = el('button', 'btn', labels.back); b.onclick = () => { closeOverlay(); onClose && onClose(); }; p.append(b); b.focus();
}

/** Worries form. onSubmit(array<string>) receives 0..5 sanitized strings. */
export function showWorries(onSubmit, onBack) {
  const p = panel(labels.worriesTitle);
  p.append(el('p', 'sub', labels.worriesTitleEn), el('p', null, labels.worriesBody), el('p', 'small', labels.worriesBodyEn));
  const list = el('div', 'list'), err = el('p', 'err'); err.setAttribute('role', 'alert');
  const addBtn = el('button', 'btn ghost', labels.add), chips = el('div', 'chips');
  const rows = () => [...list.children];
  const refresh = () => { addBtn.disabled = rows().length >= gp.worryMax; };
  function addRow(value = '') {
    if (rows().length >= gp.worryMax) return null;
    const r = el('div', 'wrow'), i = el('input'); i.type = 'text'; i.maxLength = gp.worryMaxLength; i.placeholder = labels.placeholder; i.value = value;
    i.autocomplete = 'off'; i.setAttribute('aria-label', labels.placeholder); i.enterKeyHint = 'done';
    const x = el('button', 'btn small', labels.remove); x.onclick = () => { r.remove(); refresh(); err.textContent = ''; };
    r.append(i, x); list.append(r); refresh(); return i;
  }
  addBtn.onclick = () => addRow() && rows().at(-1).firstChild.focus();
  labels.suggestions.forEach(s => { const c = el('button', 'chip', s); c.onclick = () => {
    const empty = rows().map(r => r.firstChild).find(i => !i.value.trim()); const i = empty || addRow(); if (i) i.value = s.slice(0, gp.worryMaxLength); }; chips.append(c); });
  const go = el('button', 'btn primary', labels.start), back = el('button', 'btn ghost', labels.back);
  go.onclick = () => {
    const out = []; err.textContent = '';
    for (const r of rows()) {
      const res = sanitizeWorry(r.firstChild.value, gp.worryMaxLength);
      if (!res.ok) { err.textContent = labels['err' + res.error[0].toUpperCase() + res.error.slice(1)]; r.firstChild.focus(); return; }
      out.push(res.value);
    }
    closeOverlay(); onSubmit(out.slice(0, gp.worryMax));
  };
  back.onclick = () => { closeOverlay(); onBack(); };
  const bar = el('div', 'bar'); bar.append(back, go);
  p.append(list, addBtn, el('p', 'small', ''), chips, err, bar);
  addRow().focus();
}

/** Crisp text helper: bold, outlined, linear-filtered so it stays readable when the canvas is scaled. */
export function txt(scene, x, y, str, size = 14, opts = {}) {
  const t = scene.add.text(x, y, str, { fontFamily: '"Noto Serif","Hiragino Mincho ProN","Yu Mincho",Georgia,serif', fontSize: size + 'px', color: '#fbe9f0',
    stroke: '#120a22', strokeThickness: opts.stroke ?? 4, align: opts.align || 'center', wordWrap: opts.wrap ? { width: opts.wrap } : undefined, resolution: 2, ...(opts.style || {}) }).setOrigin(opts.ox ?? 0.5, opts.oy ?? 0.5);
  t.texture.setFilter(Phaser.Textures.FilterMode.LINEAR); return t;
}

/** Phaser rectangle button with text. Returns container. */
export function makeButton(scene, x, y, w, h, text, cb, opts = {}) {
  const c = scene.add.container(x, y).setScrollFactor(0).setDepth(opts.depth || 100);
  const bg = scene.add.rectangle(0, 0, w, h, opts.fill ?? 0x1b1230, opts.alpha ?? 0.82).setStrokeStyle(2, 0xff8fb3);
  const t = txt(scene, 0, 0, text, opts.size || 15, { stroke: 2 });
  c.add([bg, t]); c.setSize(w, h); bg.setInteractive({ useHandCursor: true });
  bg.on('pointerover', () => bg.setFillStyle(0x3a2560, 1)); bg.on('pointerout', () => bg.setFillStyle(opts.fill ?? 0x1b1230, opts.alpha ?? 0.82));
  bg.on('pointerdown', (p) => { cb(p); });
  c.bg = bg; c.label = t; return c;
}
