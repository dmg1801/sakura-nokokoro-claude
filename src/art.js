// Procedural pixel-art textures. Every texture is skipped if a PNG with the same key was loaded
// from config.assets (see README "Replacing assets"), so artwork is fully replaceable.
const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
function mk(scene, key, w, h, fn) {
  if (scene.textures.exists(key)) return;
  const t = scene.textures.createCanvas(key, w, h);
  const c = t.getContext(); c.imageSmoothingEnabled = false;
  fn(c, w, h); t.refresh();
}
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function samurai(c, pose) {
  const W = '#f6f3ec', S = '#cfc9ba', K = '#d9b36c', K2 = '#9c7436', F = '#e8b98f', D = '#262638', B = '#dfe9f5', RD = '#b83a4a';
  c.translate(4, 0);
  const sit = pose === 'sit', o = sit ? 8 : 0;
  R(c, K, 6, o + 0, 12, 2); R(c, K2, 4, o + 2, 16, 2); R(c, K, 2, o + 4, 20, 2); R(c, K2, 3, o + 6, 18, 1); // kasa
  R(c, F, 9, o + 7, 6, 3); R(c, D, 10, o + 8, 1, 1); R(c, D, 13, o + 8, 1, 1);                             // face
  R(c, W, 7, o + 10, 10, 11); R(c, S, 7, o + 10, 2, 11); R(c, D, 7, o + 16, 10, 2); R(c, RD, 11, o + 16, 2, 4); // robe, belt
  if (sit) { R(c, W, 2, 24, 20, 6); R(c, S, 2, 28, 20, 2); R(c, F, 10, 20, 4, 2); R(c, D, 2, 29, 20, 1); return; }
  const leg = (x, y, h) => { R(c, W, x, y, 4, h); R(c, D, x, y + h - 2, 5, 2); };
  if (pose === 'run0') { leg(6, 21, 11); leg(13, 21, 9); }
  else if (pose === 'run1') { leg(9, 21, 9); leg(12, 21, 11); }
  else if (pose === 'jump') { leg(5, 21, 8); leg(13, 21, 7); }
  else { leg(8, 21, 11); leg(12, 21, 11); }
  R(c, F, 16, o + 13, 3, 3);                                    // hand
  if (pose === 'slash0') { for (let i = 0; i < 12; i++) R(c, B, 5 - i / 3 | 0, 14 - i, 2, 2); R(c, D, 15, 14, 3, 2); }   // blade raised behind
  else if (pose === 'slash1') { R(c, B, 17, 13, 14, 2); R(c, '#fff', 20, 13, 10, 1); R(c, D, 15, 13, 3, 3); }          // blade thrust forward
  else { R(c, B, 19, 14, 2, 12); R(c, D, 18, 12, 4, 2); R(c, F, 18, 12, 3, 2); }               // blade held low
}
function ninja(c, pose) {
  const N = '#1d1b2b', N2 = '#34304a', RS = '#c23b4f', E = '#f2e6c8';
  R(c, N, 5, 2, 10, 8); R(c, E, 7, 5, 6, 2); R(c, N, 9, 5, 2, 2); R(c, RS, 4, 9, 12, 2); R(c, RS, 14, 10, 4, 2); // head/scarf
  R(c, N, 4, 11, 12, 9); R(c, N2, 4, 11, 3, 9); R(c, N, 1, 12, 4, 3); R(c, N, 15, 12, 4, 3);              // torso/arms
  R(c, '#b9c3d0', 17, 8, 2, 8);                                                                              // blade
  const leg = (x, y, h) => { R(c, N, x, y, 4, h); R(c, N2, x, y + h - 2, 5, 2); };
  if (pose === 0) { leg(4, 20, 8); leg(11, 20, 6); } else if (pose === 1) { leg(6, 20, 6); leg(10, 20, 8); }
  else { leg(3, 20, 5); leg(12, 20, 5); }
  if (pose === 3) { R(c, '#ffd23f', 0, 0, 20, 2); }  // (unused marker)
}
function blossomCrown(c, w, h) {
  const cols = ['#ffd1e1', '#ff9fc2', '#f26ea2', '#ffe7ef'];
  for (let i = 0; i < 90; i++) {                                   // blobs
    const cx = w / 2 + (rnd() - 0.5) * (w - 60), cy = h / 2 + (rnd() - 0.5) * (h - 40) + 10;
    const r = 14 + rnd() * 20;
    for (let j = 0; j < 38; j++) {
      const a = rnd() * 6.28, d = Math.sqrt(rnd()) * r;
      R(c, cols[(rnd() * 4) | 0], (cx + Math.cos(a) * d) | 0, (cy + Math.sin(a) * d * 0.7) | 0, 3, 3);
    }
  }
  for (let i = 0; i < 160; i++) R(c, '#fff4f8', (rnd() * w) | 0, (rnd() * h) | 0, 2, 2);
}
function trunk(c, w, h) {
  const bark = ['#4a3224', '#5d4030', '#3a2519'];
  for (let y = h - 1; y >= 0; y--) {                               // curved trunk, thick base thinning upward
    const k = y / h, cx = 44 + Math.sin(k * 3.2) * 14 * (1 - k) - (1 - k) * 4, tw = 7 + k * 15;
    R(c, bark[(y >> 2) % 3], (cx - tw / 2) | 0, y, tw | 0, 1);
    R(c, bark[2], (cx - tw / 2) | 0, y, 2, 1);
  }
  R(c, '#4a3224', 4, 40, 28, 4); R(c, '#4a3224', 54, 54, 34, 4); R(c, '#4a3224', 60, 30, 26, 3); // boughs
  for (let i = 0; i < 70; i++) { R(c, ['#3f7a3a', '#5aa04a', '#2f5e2f'][i % 3], 14 + rnd() * 66, h - 12 + rnd() * 11, 3 + rnd() * 5, 2); } // moss
}
function fuji(c, w, h) {
  for (let y = 0; y < h; y++) {
    const k = y / h, half = 18 + k * (w / 2 - 20), jag = Math.sin(y * 0.9) * 2;
    R(c, y < h * 0.3 ? '#e9eefc' : '#5d6aa8', (w / 2 - half) | 0, y, (half * 2) | 0, 1);
    if (y < h * 0.3) { R(c, '#8f9be0', (w / 2 - half + jag + half * 0.6) | 0, y, 3, 1); }
    else for (let x = w / 2 - half; x < w / 2 + half; x += 9) if (((x | 0) + y) % 5 === 0) R(c, '#4a5694', x | 0, y, 3, 1);
  }
  for (let x = 0; x < w; x++) { const hh = Math.max(0, (Math.abs(w / 2 - x) / (w / 2)) * 0); void hh; }
}
export const PAGODA = { w: 64, h: 120, roofs: [], windows: [] };
function pagoda(c, lit) {
  // Five stories, narrowest at the top and widest at the bottom, topped by a spire (sorin).
  for (let i = 0; i < 5; i++) {
    const y = 14 + i * 19, rw = 22 + i * 9, bw = rw - 12, rx = 32 - rw / 2, bx = 32 - bw / 2;
    if (!lit) {
      R(c, '#2a1824', 32 - (rw - 12) / 2, y, rw - 12, 3);                    // roof ridge
      R(c, '#3a2330', 32 - (rw - 4) / 2, y + 3, rw - 4, 2);                  // roof mid
      R(c, '#4d2b3a', rx, y + 5, rw, 3);                                      // wide eaves
      R(c, '#2a1824', rx - 2, y + 4, 3, 2); R(c, '#2a1824', rx + rw - 1, y + 4, 3, 2); // upturned tips
      R(c, '#1a0f16', rx + 2, y + 8, rw - 4, 1);                              // shadow under eaves
      R(c, '#7a3f3f', bx, y + 9, bw, 10); R(c, '#5a2d2d', bx, y + 9, 2, 10); R(c, '#5a2d2d', bx + bw - 2, y + 9, 2, 10); // wooden body + posts
      R(c, '#c9a04a', bx, y + 17, bw, 1);                                     // balcony rail
    } else {
      R(c, '#ffcf6a', 30, y + 11, 4, 6); R(c, '#fff0b8', 31, y + 12, 2, 3);
      if (bw >= 22) { R(c, '#ffcf6a', bx + 4, y + 11, 3, 6); R(c, '#ffcf6a', bx + bw - 7, y + 11, 3, 6); }
    }
  }
  if (!lit) {
    R(c, '#2a1824', 31, 0, 2, 14); [3, 6, 9].forEach(y => R(c, '#c9a04a', 29, y, 6, 1)); R(c, '#c9a04a', 30, 0, 4, 1); // spire
    R(c, '#6b6677', 2, 109, 60, 11); R(c, '#8a859a', 2, 109, 60, 2); R(c, '#55505f', 6, 115, 52, 5);                   // stone base
  }
}
function disc(c, s, base, edge, craters) {
  const r = s / 2;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) { const d = Math.hypot(x - r + 0.5, y - r + 0.5); if (d < r) R(c, d > r - 2 ? edge : base, x, y, 1, 1); }
  craters && craters.forEach(([x, y, cr]) => R(c, '#c9cfdc', x, y, cr, cr));
}
function hills(c, w, h, col, amp, f, ph) {
  for (let x = 0; x < w; x++) { const y = h - amp - Math.sin(x * f + ph) * amp * 0.5 - Math.sin(x * f * 2.3 + ph) * amp * 0.25; R(c, col, x, y | 0, 1, h); }
}
function treesLine(c, w, h, col) {
  for (let x = 0; x < w; x += 7 + ((rnd() * 8) | 0)) { const th = 16 + rnd() * 26; R(c, col, x, h - th, 5, th); R(c, col, x - 3, h - th + 6, 11, 10); R(c, col, x - 1, h - th - 4, 7, 8); }
}

export function buildTextures(scene) {
  seed = 7;
  ['sit', 'idle', 'run0', 'run1', 'jump', 'slash0', 'slash1'].forEach(p => mk(scene, 'sam_' + p, 32, 32, c => samurai(c, p)));
  [0, 1, 2].forEach(p => mk(scene, 'nin' + p, 20, 28, c => ninja(c, p)));
  mk(scene, 'slash_arc', 44, 40, c => {
    for (let a = -1.1; a < 1.1; a += 0.03) for (let r = 18; r < 36; r += 1) {
      if (Math.abs(a) < 1.1 - (r - 18) / 40) R(c, r > 30 ? '#ffffff' : '#bfe3ff', (4 + Math.cos(a) * r) | 0, (20 + Math.sin(a) * r * 0.9) | 0, 2, 2);
    }
  });
  mk(scene, 'tree_trunk', 96, 130, trunk);
  mk(scene, 'tree_crown', 260, 140, blossomCrown);
  mk(scene, 'fuji', 320, 100, fuji);
  mk(scene, 'pagoda', PAGODA.w, PAGODA.h, c => pagoda(c, false));
  mk(scene, 'pagoda_lit', PAGODA.w, PAGODA.h, c => pagoda(c, true));
  mk(scene, 'sun', 32, 32, c => disc(c, 32, '#ffe37a', '#ffb347'));
  mk(scene, 'moon', 30, 30, c => disc(c, 30, '#f4f1e1', '#d8d6c4', [[8, 8, 4], [17, 14, 5], [10, 19, 3], [19, 5, 2]]));
  mk(scene, 'hills_far', 640, 90, c => hills(c, 640, 90, '#46508f', 40, 0.012, 1));
  mk(scene, 'hills_mid', 640, 80, c => { hills(c, 640, 80, '#35406f', 30, 0.02, 3); });
  mk(scene, 'trees_near', 640, 60, c => treesLine(c, 640, 60, '#1f3a38'));
  mk(scene, 'ground', 640, 70, c => {
    R(c, '#2f5a3a', 0, 0, 640, 6); R(c, '#244a30', 0, 6, 640, 6); R(c, '#4a3a2c', 0, 12, 640, 58); R(c, '#3a2c20', 0, 24, 640, 46);
    for (let i = 0; i < 260; i++) R(c, ['#5aa04a', '#3f7a3a', '#6dba58'][i % 3], rnd() * 640, rnd() * 6, 2, 1 + rnd() * 3);
    for (let i = 0; i < 80; i++) R(c, '#5d4a38', rnd() * 640, 14 + rnd() * 50, 3, 2);
  });
  mk(scene, 'lantern', 10, 16, c => { R(c, '#2a1824', 4, 0, 2, 3); R(c, '#c23b4f', 1, 3, 8, 9); R(c, '#ffcf6a', 3, 5, 4, 5); R(c, '#2a1824', 1, 12, 8, 2); });
  mk(scene, 'glow', 64, 64, c => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,230,160,0.9)'); g.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  mk(scene, 'petal', 5, 5, c => { R(c, '#ffb7d0', 1, 0, 3, 5); R(c, '#ff8fb3', 0, 1, 5, 3); R(c, '#fff', 2, 1, 1, 1); });
  mk(scene, 'petal_off', 5, 5, c => { R(c, '#4a3a5a', 1, 0, 3, 5); R(c, '#3a2c4a', 0, 1, 5, 3); });
  mk(scene, 'spark', 4, 4, c => { R(c, '#fff', 1, 0, 2, 4); R(c, '#fff', 0, 1, 4, 2); });
  mk(scene, 'star', 3, 3, c => { R(c, '#fff', 1, 0, 1, 3); R(c, '#fff', 0, 1, 3, 1); });
}
