// DOM controls: on-screen pad (left / right / jump / slash) and tool buttons (pause, sound, fullscreen, restart).
// They live outside the Phaser canvas so they keep a finger-sized touch target in portrait AND landscape.
export const touchState = { left: false, right: false, jumpQ: false, slashQ: false };
export const bus = new EventTarget();                 // emits 'action' events: detail = 'pause' | 'mute' | 'restart'

export const fsAvailable = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
export const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
export async function toggleFs() {
  const app = document.getElementById('app');
  const orientation = screen.orientation;
  if (isFs()) {
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
    if (exitFullscreen) {
      try { await exitFullscreen.call(document); }
      catch (error) { console.warn('No se pudo salir de pantalla completa:', error); }
    }
    if (orientation?.unlock) orientation.unlock();
    return;
  }

  const requestFullscreen = app.requestFullscreen || app.webkitRequestFullscreen;
  if (!requestFullscreen) return;
  try {
    await requestFullscreen.call(app, { navigationUI: 'hide' });
  } catch (error) {
    console.warn('No se pudo activar la pantalla completa:', error);
    return;
  }

  if (orientation?.lock) {
    try { await orientation.lock('landscape'); }
    catch (error) { console.warn('El navegador no permitió fijar la orientación horizontal:', error); }
  }
}
export const setSceneMode = m => { document.body.dataset.scene = m; };
export const setMuted = m => document.body.classList.toggle('muted', !!m);

const svg = (inner, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${inner}</svg>`;
const ICON = {
  pause: svg('<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>'),
  sound: svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path class="wave" d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none" stroke="currentColor" stroke-width="2"/><path class="x" d="M16 9l6 6M22 9l-6 6" fill="none" stroke="#ff7a7a" stroke-width="2.6"/>'),
  fsIn: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.6"/>'),
  fsOut: svg('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2.6"/>'),
  restart: svg('<path d="M20 12a8 8 0 11-2.4-5.7" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M21 2.5v7h-7z"/>'),
  left: svg('<path d="M16 4v16L5 12z"/>'), right: svg('<path d="M8 4v16l11-8z"/>'),
  jump: svg('<path d="M12 3l8 9h-5v9H9v-9H4z"/>'),
  slash: svg('<path d="M4 20L19 5" stroke="currentColor" stroke-width="3" fill="none"/><path d="M15 3l6 6-3 1-4-4z"/><path d="M3 17l4 4" stroke="currentColor" stroke-width="3" fill="none"/>')
};
const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };   // html = constants only

function holdBtn(btn, key) {
  const on = e => { e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } touchState[key] = true; btn.classList.add('on'); };
  const off = () => { touchState[key] = false; btn.classList.remove('on'); };
  btn.addEventListener('pointerdown', on);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => btn.addEventListener(ev, off));
}
function tapBtn(btn, key) {
  btn.addEventListener('pointerdown', e => { e.preventDefault(); touchState[key] = true; btn.classList.add('on'); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, () => btn.classList.remove('on')));
}

export function initControls(labels) {
  const touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || new URLSearchParams(location.search).has('touch');
  document.body.classList.toggle('touch', touch);
  document.addEventListener('contextmenu', e => e.preventDefault());

  // ---- tools ----
  const tools = document.getElementById('tools'); tools.replaceChildren();
  const tool = (cls, icon, label, fn) => { const b = mk('button', 'tool ' + cls, icon); b.type = 'button'; b.setAttribute('aria-label', label); b.title = label;
    b.addEventListener('mousedown', e => e.preventDefault()); b.addEventListener('click', () => { fn(); b.blur(); }); tools.append(b); return b; };
  tool('play-only', ICON.pause, labels.pause, () => bus.dispatchEvent(new CustomEvent('action', { detail: 'pause' })));
  tool('play-only snd', ICON.sound, labels.sound, () => bus.dispatchEvent(new CustomEvent('action', { detail: 'mute' })));
  if (fsAvailable) {
    const fs = tool('fs', ICON.fsIn + ICON.fsOut, labels.fullEnter, toggleFs);
    const sync = () => { document.body.classList.toggle('fs', isFs()); fs.setAttribute('aria-label', isFs() ? labels.fullExit : labels.fullEnter); fs.title = fs.getAttribute('aria-label'); };
    document.addEventListener('fullscreenchange', sync); document.addEventListener('webkitfullscreenchange', sync); sync();
  }
  tool('play-only', ICON.restart, labels.restart, () => bus.dispatchEvent(new CustomEvent('action', { detail: 'restart' })));

  // ---- pad ----
  const pad = document.getElementById('pad'); pad.replaceChildren();
  const btn = (cls, icon, text, label) => { const b = mk('button', 'pbtn ' + cls, icon + (text ? `<span></span>` : '')); b.type = 'button'; b.tabIndex = -1; b.setAttribute('aria-label', label || text);
    if (text) b.lastChild.textContent = text; return b; };
  const l = btn('p-left', ICON.left, '', labels.ctrlLeft), r = btn('p-right', ICON.right, '', labels.ctrlRight);
  const j = btn('p-jump', ICON.jump, labels.ctrlJump), s = btn('p-slash', ICON.slash, labels.ctrlSlash);
  holdBtn(l, 'left'); holdBtn(r, 'right'); tapBtn(j, 'jumpQ'); tapBtn(s, 'slashQ');
  const cl = mk('div', 'cluster cl-left'), cr = mk('div', 'cluster cl-right'); cl.append(l, r); cr.append(j, s); pad.append(cl, cr);
}
