// Pixel-art prop generator for "my game".
// Zero dependencies: hand-rolled PNG encoder on top of node:zlib.
// Palette is taken verbatim from src/art.js so the close-ups match the scene.
//
// Usage:  node assets/objects/hall/make-items.mjs [输出目录]
//   省略输出目录时写在当前目录。改配色改 C，改构图改 painting/apron/table 三个函数，
//   重跑即可复现同三张图（所有随机效果走固定种子，结果确定）。
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const W = 320, H = 240;

/* ---------- palette, sampled from src/art.js ---------- */
const C = {
  // wood
  frameDark: '#8f7652', frameMid: '#a58a63', frameDeep: '#6f5a3e', frameGrain: '#7d6547',
  mat: '#c9af77', matShade: '#b89a63',
  chairDark: '#795e45', chairMid: '#b18a60', chairLight: '#d0ab76',
  peg: '#937b57', pegDark: '#79684d', pegLight: '#a98d64',
  tableTop: '#d3ad74', tableLine: '#bc965f', tableHi: '#e1bd87', tableEdge: '#b69160',
  tableLeg: '#866a4a', tableShadow: '#715e49',
  // cloth / paper / ceramic
  apron: '#e2d7bc', apronLight: '#f2e9d0', apronShade: '#c0b292', apronDeep: '#b6a98d',
  apronFold: '#cbbc9c', apronWorn: '#d6cbb0',
  runner: '#e1d6b9', runnerLine: '#c9bb97',
  plate: '#eee8d0', plateInner: '#d1d2b9', plateHi: '#f7f2e0', cutlery: '#d4c8a7',
  rug: '#a88373', rugLight: '#c3a38a', rugFringe: '#c9ad8d', rugWeave: '#967964',
  bowl: '#b3bda2', bowlLight: '#dee1c2', bowlRim: '#d3bc8b', green: '#5c7250',
  // the painting's own colours
  sky: '#dce3c1', skyTop: '#d2dbcd', skyLow: '#e5e9cf',
  hillBack: '#9cb588', hillMid: '#8aa97b', hillFront: '#7e9d70',
  sun: '#efe8c0', sunHalo: '#f6f0d8', tree: '#5f7d55', path: '#cfd6b0',
};

/* ---------- tiny deterministic RNG (only for the "badly painted" wobble) ---------- */
let _seed = 20261016;
const srand = s => { _seed = s; };
const rnd = () => { _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; };
const jit = (n = 1) => Math.round((rnd() - 0.5) * 2 * n);

/* ---------- canvas ---------- */
function parse(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return h.length === 8
    ? [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
    : [(n >>> 16) & 255, (n >>> 8) & 255, n & 255, 255];
}
function mixHex(a, b, t) {
  const A = parse(a), B = parse(b);
  const c = i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`;
}

class Canvas {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); }

  set(x, y, hex, alpha = 255) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const [r, g, b, a0] = parse(hex);
    const a = (a0 * alpha) / 255;
    if (a <= 0) return;
    const i = (y * this.w + x) * 4;
    if (a >= 255) { this.d[i] = r; this.d[i + 1] = g; this.d[i + 2] = b; this.d[i + 3] = 255; return; }
    const k = a / 255, ia = 1 - k, da = this.d[i + 3] / 255;
    const oa = k + ia * da;
    if (oa === 0) return;
    this.d[i] = (r * k + this.d[i] * ia * da) / oa;
    this.d[i + 1] = (g * k + this.d[i + 1] * ia * da) / oa;
    this.d[i + 2] = (b * k + this.d[i + 2] * ia * da) / oa;
    this.d[i + 3] = oa * 255;
  }

  rect(x, y, w, h, hex, a) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, hex, a); }

  line(x0, y0, x1, y1, hex, a) {
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, hex, a);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  poly(pts, hex, a) {
    let minY = Infinity, maxY = -Infinity;
    for (const [, y] of pts) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    minY = Math.max(0, Math.floor(minY)); maxY = Math.min(this.h - 1, Math.ceil(maxY));
    for (let y = minY; y <= maxY; y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const from = Math.ceil(xs[i] - 0.5), to = Math.floor(xs[i + 1] - 0.5);
        for (let x = from; x <= to; x++) this.set(x, y, hex, a);
      }
    }
  }

  outlinePoly(pts, hex, a) {
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      this.line(Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), hex, a);
    }
  }

  ellipse(cx, cy, rx, ry, hex, a, wobble = 0) {
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const r = wobble ? wobble * Math.sin(x * 0.7 + y * 1.3) : 0;
        const nx = (x - cx) / (rx + r), ny = (y - cy) / (ry + r);
        if (nx * nx + ny * ny <= 1) this.set(x, y, hex, a);
      }
  }
}

/* ---------- PNG encoder ---------- */
function crc32(buf) {
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    let c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function png(cv) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cv.w, 0); ihdr.writeUInt32BE(cv.h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((cv.w * 4 + 1) * cv.h);
  let o = 0;
  for (let y = 0; y < cv.h; y++) {
    raw[o++] = 0;
    for (let x = 0; x < cv.w; x++) {
      const i = (y * cv.w + x) * 4;
      raw[o++] = cv.d[i]; raw[o++] = cv.d[i + 1]; raw[o++] = cv.d[i + 2]; raw[o++] = cv.d[i + 3];
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ============================================================
   1. 墙上的画 —— “画得不算好，但画的人应该很喜欢那片草原”
   The depicted painting is deliberately amateurish: tilted
   horizon, lopsided sun, paint that slipped past the hill line.
   The asset itself is clean; the brushwork inside is not.
   ============================================================ */
function painting() {
  const cv = new Canvas(W, H);
  srand(7);
  const FX = 44, FY = 26, FW = 232, FH = 188;      // outer frame
  const T = 15;                                     // frame thickness
  const MX = FX + T, MY = FY + T, MW = FW - T * 2, MH = FH - T * 2; // mat
  const MT = 10;                                    // mat thickness
  const PX = MX + MT, PY = MY + MT, PW = MW - MT * 2, PH = MH - MT * 2; // picture

  // soft cast shadow so the object reads as hanging on a wall
  for (let i = 0; i < 5; i++)
    cv.rect(FX + 4 + i, FY + 5 + i, FW, FH, '#3a2f22', 6 - i);

  // frame body + bevels
  cv.rect(FX, FY, FW, FH, C.frameDark);
  cv.rect(FX, FY, FW, 3, C.frameMid); cv.rect(FX, FY, 3, FH, C.frameMid);
  cv.rect(FX, FY + FH - 3, FW, 3, C.frameDeep); cv.rect(FX + FW - 3, FY, 3, FH, C.frameDeep);
  cv.rect(FX + 3, FY + 3, FW - 6, 2, C.frameMid, 120);
  // wood grain
  for (let i = 0; i < 26; i++) {
    const y = FY + 2 + Math.floor(rnd() * (FH - 4));
    const x = FX + 1 + Math.floor(rnd() * (FW - 30));
    cv.line(x, y, x + 8 + Math.floor(rnd() * 22), y + jit(0), C.frameGrain, 70);
  }
  // corner mitres
  cv.line(FX, FY, FX + T, FY + T, C.frameDeep, 120);
  cv.line(FX + FW - 1, FY, FX + FW - T, FY + T, C.frameDeep, 120);
  cv.line(FX, FY + FH - 1, FX + T, FY + FH - T, C.frameDeep, 120);
  cv.line(FX + FW - 1, FY + FH - 1, FX + FW - T, FY + FH - T, C.frameDeep, 120);

  // mat board
  cv.rect(MX, MY, MW, MH, C.mat);
  cv.rect(MX, MY + MH - 2, MW, 2, C.matShade); cv.rect(MX + MW - 2, MY, 2, MH, C.matShade);
  cv.rect(MX, MY, MW, 1, '#d8bd85', 150); cv.rect(MX, MY, 1, MH, '#d8bd85', 150);
  // foxing spots on old mount board
  for (let i = 0; i < 14; i++)
    cv.ellipse(MX + 3 + rnd() * (MW - 6), MY + 3 + rnd() * (MH - 6), 1 + rnd(), 1 + rnd(), '#a98d5e', 55);

  // ---- the amateur painting itself ----
  // sky: one continuous hand-mixed gradient, no hard seam
  for (let y = PY; y < PY + PH; y++) {
    const t = (y - PY) / PH;
    cv.rect(PX, y, PW, 1, mixHex(C.skyTop, C.skyLow, Math.min(1, t * 1.15)));
  }
  for (let i = 0; i < 40; i++) {
    const y = PY + Math.floor(rnd() * PH * 0.6);
    cv.line(PX + Math.floor(rnd() * PW), y, PX + Math.floor(rnd() * PW), y, C.skyLow, 90);
  }
  // canvas weave
  for (let y = PY; y < PY + PH; y += 2) for (let x = PX; x < PX + PW; x += 2) cv.set(x, y, '#ffffff', 12);

  // lopsided sun, painted a bit too enthusiastically
  const sx = PX + PW - 34, sy = PY + 22;
  cv.ellipse(sx, sy, 12, 11, C.sunHalo, 120);
  cv.ellipse(sx, sy, 8, 9, C.sun, 255, 0.7);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    cv.line(sx + Math.cos(a) * 9, sy + Math.sin(a) * 9, sx + Math.cos(a) * (13 + jit(2)), sy + Math.sin(a) * (12 + jit(2)), C.sun, 170);
  }

  // three hill bands, horizon deliberately not level
  const band = (baseY, amp, colour, seed) => {
    srand(seed);
    const pts = [[PX, PY + PH]];
    for (let x = PX; x <= PX + PW; x += 6) {
      const t = (x - PX) / PW;
      pts.push([x, baseY + Math.sin(t * 3.1 + seed) * amp + jit(2) + t * 5]);
    }
    pts.push([PX + PW, PY + PH]);
    cv.poly(pts, colour);
    // outline the ridge so it looks brushed, not vector-clean
    for (let i = 1; i < pts.length - 2; i++) cv.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], '#6d8a60', 90);
    return pts;
  };
  const backPts = band(PY + PH * 0.46, 6, C.hillBack, 11);
  band(PY + PH * 0.62, 7, C.hillMid, 23);
  band(PY + PH * 0.78, 5, C.hillFront, 37);

  // a wobbly footpath and a few lopsided trees
  srand(5);
  for (let y = PY + PH - 4; y > PY + PH * 0.66; y--) {
    const t = (PY + PH - y) / (PH * 0.34);
    const cxp = PX + PW * 0.34 + Math.sin(t * 2.4) * 14;
    const half = 2 + t * 7;
    cv.line(cxp - half, y, cxp + half, y, C.path, 200);
  }
  const tree = (tx, ty, s) => {
    cv.rect(tx - 1, ty, 2, s * 3, '#6b563c');
    cv.poly([[tx, ty - s * 4], [tx - s * 2, ty + 1], [tx + s * 2, ty + 1]], C.tree);
    cv.poly([[tx, ty - s * 6], [tx - s * 1.6, ty - s * 2], [tx + s * 1.6, ty - s * 2]], '#6b8a5e');
  };
  tree(PX + 28, PY + PH * 0.60, 2);
  tree(PX + 46, PY + PH * 0.55, 1.6);
  tree(PX + PW - 62, PY + PH * 0.66, 2.2);

  // paint that slipped just over the ridge (the "not very good" tell),
  // hugging the hill line rather than floating in the sky
  srand(9);
  for (let i = 0; i < 16; i++) {
    const p = backPts[1 + Math.floor(rnd() * (backPts.length - 3))];
    cv.set(p[0] + jit(1), p[1] - 1 - Math.floor(rnd() * 3), i % 3 ? C.hillBack : C.hillMid, 200);
  }
  // one overworked corner
  for (let i = 0; i < 12; i++) cv.set(PX + 4 + jit(0) + i % 4, PY + PH - 6 + jit(1), '#6d8a60', 120);

  // inner shadow where the mat meets the picture
  cv.rect(PX, PY, PW, 2, '#000000', 26); cv.rect(PX, PY, 2, PH, '#000000', 26);
  cv.rect(PX, PY + PH - 2, PW, 2, '#ffffff', 18); cv.rect(PX + PW - 2, PY, 2, PH, '#ffffff', 18);
  return cv;
}

/* ============================================================
   2. 挂在门边的围裙 —— “对她来说太大了”
   Oversized, hanging empty from one peg: long dangling ties,
   a wide neck loop, limp heavy folds, frayed hem, one worn patch.
   ============================================================ */
function apron() {
  const cv = new Canvas(W, H);
  srand(31);

  // wall peg
  cv.ellipse(160, 26, 13, 9, '#000000', 30);
  cv.rect(150, 14, 22, 16, C.peg);
  cv.rect(150, 14, 22, 3, C.pegLight); cv.rect(150, 27, 22, 3, C.pegDark);
  cv.rect(146, 18, 6, 9, C.pegDark); cv.rect(170, 18, 6, 9, C.pegDark);
  cv.ellipse(161, 22, 3, 3, '#5d4f39');

  // neck loop, far too wide for a small girl
  const loopL = [[128, 54], [136, 40], [152, 28], [160, 26]];
  const loopR = [[192, 54], [184, 40], [168, 28], [160, 26]];
  cv.line(128, 54, 158, 27, C.apronShade); cv.line(129, 54, 159, 27, C.apron);
  cv.line(130, 55, 160, 28, C.apronLight, 150);
  cv.line(192, 54, 162, 27, C.apronShade); cv.line(191, 54, 161, 27, C.apron);
  cv.line(190, 55, 160, 28, C.apronLight, 130);

  // bib (upper panel)
  const bib = [[128, 52], [192, 52], [198, 106], [122, 106]];
  cv.poly(bib, C.apron);
  cv.poly([[128, 52], [146, 52], [140, 106], [122, 106]], C.apronLight, 120);
  cv.poly([[178, 52], [192, 52], [198, 106], [184, 106]], C.apronShade, 110);
  cv.outlinePoly(bib, C.apronDeep, 200);
  // stitch line along the bib top
  for (let x = 131; x < 190; x += 4) cv.line(x, 56, x + 2, 56, C.apronShade, 170);

  // skirt: wide, long, limp
  const skirt = [[122, 104], [198, 104], [214, 150], [222, 206], [210, 226], [110, 226], [98, 206], [106, 150]];
  cv.poly(skirt, C.apron);
  cv.poly([[122, 104], [146, 104], [138, 226], [110, 226], [98, 206], [106, 150]], C.apronLight, 95);
  cv.poly([[182, 104], [198, 104], [214, 150], [222, 206], [210, 226], [188, 226]], C.apronShade, 110);
  cv.outlinePoly(skirt, C.apronDeep, 210);

  // heavy limp folds
  const fold = (x0, y0, x1, y1, a = 150) => {
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t + Math.sin(t * 5.5) * 2.4;
      cv.set(x, y0 + (y1 - y0) * t, C.apronFold, a);
      cv.set(x + 1, y0 + (y1 - y0) * t, C.apronLight, a * 0.4);
    }
  };
  fold(132, 116, 124, 220); fold(152, 114, 150, 222);
  fold(172, 114, 176, 222); fold(192, 116, 202, 218);

  // waist tie band: follows the waist with a slight sag, not a straight plank
  for (let x = 100; x < 222; x++) {
    const t = (x - 100) / 122;
    const yo = Math.round(Math.abs(t - 0.5) * 4 - Math.sin(t * Math.PI) * 1);
    cv.rect(x, 100 + yo, 1, 13, C.apronDeep);
    cv.set(x, 100 + yo, '#c6b79a', 200);
    cv.set(x, 101 + yo, '#c6b79a', 110);
    cv.set(x, 110 + yo, '#a2937a', 200);
    cv.set(x, 111 + yo, '#a2937a', 160);
  }
  const tie = (x, dir) => {
    for (let i = 0; i < 74; i++) {
      const y = 112 + i;
      const xx = x + Math.sin(i * 0.11) * 6 * dir + dir * i * 0.12;
      cv.rect(xx - 3, y, 6, 1, C.apronDeep);
      cv.set(xx - 3, y, '#c6b79a', 200);
      cv.set(xx - 2, y, '#c6b79a', 120);
      cv.set(xx + 2, y, '#a2937a', 200);
    }
  };
  tie(106, -1); tie(216, 1);
  // knot
  cv.ellipse(160, 107, 9, 7, C.apronDeep);
  cv.ellipse(158, 105, 4, 3, '#c6b79a', 170);

  // pocket
  cv.rect(136, 150, 54, 44, C.apronLight, 130);
  cv.rect(136, 150, 54, 2, C.apronShade); cv.rect(136, 192, 54, 2, C.apronShade);
  cv.rect(136, 150, 2, 44, C.apronShade); cv.rect(188, 150, 2, 44, C.apronShade);
  for (let x = 139; x < 188; x += 4) cv.set(x, 154, C.apronShade, 150);

  // worn patch + frayed hem: this apron is inherited, not fitted
  cv.ellipse(196, 186, 9, 6, C.apronWorn, 190);
  cv.ellipse(196, 186, 5, 3, '#cfc3a6', 160);
  srand(77);
  for (let x = 112; x < 210; x += 3) {
    const y = 224 + jit(2);
    cv.line(x, y, x + jit(1), y + 2 + Math.abs(jit(2)), C.apron, 210);
  }
  cv.line(110, 226, 210, 226, C.apronDeep, 120);
  return cv;
}

/* ============================================================
   3. 餐桌 —— “这么大的桌子，坐下来吃饭的却只有三个人”
   Four chairs, three place settings, one conspicuously empty,
   and a great deal of bare wood.
   ============================================================ */
function table() {
  const cv = new Canvas(W, H);
  srand(53);

  // woven rug
  cv.rect(16, 40, 288, 192, C.rug);
  cv.rect(24, 48, 272, 176, C.rugLight);
  for (let x = 18; x < 302; x += 6) { cv.set(x, 42, C.rugWeave, 160); cv.set(x, 229, C.rugWeave, 160); }
  for (let y = 42; y < 230; y += 6) { cv.set(18, y, C.rugWeave, 160); cv.set(301, y, C.rugWeave, 160); }
  for (let x = 18; x < 302; x += 4) { cv.line(x, 37, x, 40, C.rugFringe); cv.line(x, 232, x, 235, C.rugFringe); }
  for (let y = 52; y < 224; y += 9) cv.rect(26, y, 268, 1, C.rugWeave, 70);

  // chairs behind the table (drawn first, so the table overlaps them)
  const chairBack = (cx, cy) => {
    cv.rect(cx - 24, cy, 48, 12, C.chairDark);
    cv.rect(cx - 24, cy, 48, 3, C.chairMid);
    cv.rect(cx - 20, cy - 12, 8, 14, C.chairMid);
    cv.rect(cx + 12, cy - 12, 8, 14, C.chairMid);
    cv.rect(cx - 20, cy - 12, 8, 3, C.chairLight);
    cv.rect(cx + 12, cy - 12, 8, 3, C.chairLight);
  };
  chairBack(84, 44); chairBack(236, 44);

  // table shadow on the rug
  cv.rect(38, 60, 252, 150, '#000000', 26);

  // legs
  const leg = (x, y) => { cv.rect(x, y, 13, 40, C.tableLeg); cv.rect(x, y, 4, 40, '#9c7f57'); cv.rect(x + 9, y, 4, 40, '#6d5636'); };
  leg(44, 176); leg(263, 176);

  // table top
  cv.rect(34, 56, 252, 132, C.tableTop);
  cv.rect(34, 56, 252, 4, C.tableHi);
  for (let y = 68; y < 186; y += 15) cv.rect(36, y, 248, 1, C.tableLine, 190);
  for (let y = 70; y < 186; y += 15) cv.rect(36, y, 248, 1, C.tableHi, 90);
  // grain
  for (let i = 0; i < 60; i++) {
    const y = 60 + Math.floor(rnd() * 124), x = 36 + Math.floor(rnd() * 200);
    cv.line(x, y, x + 10 + Math.floor(rnd() * 26), y, C.tableLine, 46);
  }
  cv.rect(34, 56, 3, 132, C.tableHi, 110); cv.rect(283, 56, 3, 132, C.tableEdge, 150);
  // front edge + thickness
  cv.rect(34, 188, 252, 14, C.tableEdge);
  cv.rect(34, 188, 252, 3, '#c79f6b');
  cv.rect(34, 199, 252, 3, '#8d6f4b');

  // runner down the middle
  cv.rect(140, 56, 44, 146, C.runner);
  cv.rect(140, 56, 2, 146, C.runnerLine); cv.rect(182, 56, 2, 146, C.runnerLine);
  for (let y = 60; y < 200; y += 7) cv.rect(144, y, 36, 1, C.runnerLine, 90);
  cv.rect(140, 188, 44, 14, '#d6cbae');

  // a small dish of greens near the centre
  cv.ellipse(206, 116, 19, 13, '#000000', 30);
  cv.ellipse(206, 114, 19, 13, C.bowl);
  cv.ellipse(206, 112, 14, 9, C.bowlLight);
  cv.ellipse(206, 111, 11, 6, C.green, 210);
  for (let i = 0; i < 9; i++) cv.set(198 + Math.floor(rnd() * 17), 106 + Math.floor(rnd() * 10), '#6f8a60', 200);
  cv.ellipse(206, 122, 17, 4, C.bowlRim, 180);

  // three place settings — and one seat left bare
  const setting = (cx, cy) => {
    cv.ellipse(cx, cy + 3, 20, 14, '#000000', 28);
    cv.ellipse(cx, cy, 20, 14, C.plate);
    cv.ellipse(cx, cy, 14, 9, C.plateInner);
    cv.ellipse(cx - 5, cy - 4, 5, 3, C.plateHi, 190);
    // fork
    cv.rect(cx - 28, cy - 9, 2, 18, C.cutlery);
    for (let i = 0; i < 3; i++) cv.rect(cx - 30 + i * 2, cy - 13, 1, 5, C.cutlery);
    // knife
    cv.rect(cx + 26, cy - 11, 2, 22, C.cutlery);
    cv.poly([[cx + 26, cy - 11], [cx + 28, cy - 11], [cx + 28, cy - 16], [cx + 26, cy - 14]], '#e3d9bd');
  };
  setting(80, 96); setting(244, 96); setting(80, 152);

  // chairs in front of the table (drawn last, overlapping the apron edge)
  const chairFront = (cx, cy) => {
    cv.rect(cx - 26, cy + 8, 52, 8, '#000000', 26);
    cv.rect(cx - 24, cy - 6, 48, 18, C.chairMid);
    cv.rect(cx - 24, cy - 6, 48, 4, C.chairLight);
    cv.rect(cx - 21, cy - 2, 42, 10, '#a37f57');
    cv.rect(cx - 24, cy + 10, 48, 9, C.chairDark);
    cv.rect(cx - 22, cy + 19, 6, 12, C.chairDark);
    cv.rect(cx + 16, cy + 19, 6, 12, C.chairDark);
  };
  chairFront(84, 202); chairFront(236, 202);

  // The fourth seat is left bare on purpose: the chair is there,
  // the place setting is not. No marks, no stains — the emptiness
  // is the whole point of the line "only three people eat here".
  return cv;
}

/* ---------- write ---------- */
const out = process.argv[2] || '.';
mkdirSync(out, { recursive: true });
const jobs = [
  ['hall_painting.png', painting, '墙上的画'],
  ['hall_apron.png', apron, '挂在门边的围裙'],
  ['hall_table.png', table, '餐桌'],
];
for (const [name, fn, label] of jobs) {
  const cv = fn();
  writeFileSync(`${out}/${name}`, png(cv));
  let opaque = 0;
  for (let i = 3; i < cv.d.length; i += 4) if (cv.d[i] > 8) opaque++;
  console.log(`${name.padEnd(20)} ${W}x${H}  非透明像素 ${((opaque / (W * H)) * 100).toFixed(1)}%  ${label}`);
}
