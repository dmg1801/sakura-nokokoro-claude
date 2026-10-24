// Pure logic (no Phaser): unit-testable in Node.
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;

/** Clean one worry. Returns {ok, value, error}. error is blank | chars | text */
export function sanitizeWorry(raw, max = 28) {
  let s = String(raw ?? '').normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, ' ')
    .replace(/\s+/g, ' ').trim();
  if (!s) return { ok: false, error: 'blank' };
  if (/[<>{}`]/.test(s)) return { ok: false, error: 'chars' };
  if (!/[\p{L}\p{N}]/u.test(s)) return { ok: false, error: 'text' };
  if (s.length > max) s = s.slice(0, max).trim();
  return { ok: true, value: s };
}

/** Spawn interval (s) at time t from a table of {from,to,interval}. */
export function spawnInterval(table, t) {
  const row = table.find(r => t >= r.from && t < r.to) || table[table.length - 1];
  return row.interval;
}

/** Piecewise-linear sample over [[t, value], ...] sorted by t. */
export function sample(stops, t, mix = lerp) {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, v0] = stops[i - 1], [t1, v1] = stops[i];
      return mix(v0, v1, (t - t0) / (t1 - t0));
    }
  }
  return stops[stops.length - 1][1];
}

export function mixColor(a, b, k) {
  const ch = s => lerp((a >> s) & 255, (b >> s) & 255, k);
  return (Math.round(ch(16)) << 16) | (Math.round(ch(8)) << 8) | Math.round(ch(0));
}

export const isDay = (elapsed, duration) => elapsed < duration / 2;
export const pickQuote = (quotes, rnd = Math.random) => quotes[Math.floor(rnd() * quotes.length)];
