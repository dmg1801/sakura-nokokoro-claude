import gp from '../config/gameplay.json';
const KEY = 'sakura-no-kokoro-settings';   // only audio/motion preferences are stored — never worries.
export function loadSettings() {
  const s = { ...gp.audioDefaults };
  try { Object.assign(s, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* storage unavailable */ }
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches && !localStorage.getItem(KEY)) s.reducedMotion = true;
  return s;
}
export function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } }
