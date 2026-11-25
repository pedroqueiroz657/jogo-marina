'use strict';
// =====================================================================
//  Marina • Guardiã do Ceará — motor do jogo
// =====================================================================

const W = 90, H = 70;               // mapa em tiles
const T = { OCEAN: 0, SHALLOW: 1, SAND: 2, DUNE: 3, CAAT: 4, CAAT2: 5, SERRA: 6, CHAPADA: 7, MANGUE: 8, RIVER: 9, LAKE: 10, ROAD: 11, CITY: 12, PARK: 13, OTHER: 14, AGRI: 15, CLIFF: 16, BRIDGE: 17 };
const SOLID = new Set([T.OCEAN, T.SHALLOW, T.RIVER, T.LAKE, T.OTHER]);
const TCOL = {
  [T.OCEAN]: ['#2a7fc4', '#2f88cc', '#3a93d6'], [T.SHALLOW]: ['#45a9d9', '#52b4e0', '#62c0e6'],
  [T.SAND]: ['#f0dca0', '#e8d294', '#f6e6b4'], [T.DUNE]: ['#f6e7b8', '#eedca6', '#fff2cc'],
  [T.CAAT]: ['#c9a86a', '#bf9d5e', '#d4b57a'], [T.CAAT2]: ['#b8a564', '#ad9a58', '#c4b272'],
  [T.SERRA]: ['#3f8f46', '#37843f', '#4a9a50'], [T.CHAPADA]: ['#8fae5a', '#86a452', '#9aba66'],
  [T.MANGUE]: ['#5a6e4a', '#4e6242', '#677a54'], [T.RIVER]: ['#3a8fcf', '#3486c6', '#4a9cd8'],
  [T.LAKE]: ['#3a8fcf', '#3486c6', '#4a9cd8'], [T.ROAD]: ['#7a7570', '#726d68', '#827d78'],
  [T.CITY]: ['#c9c1b2', '#bfb7a8', '#d3cbbc'], [T.PARK]: ['#6db35a', '#64a852', '#78bd64'],
  [T.OTHER]: ['#a8a290', '#a09a88', '#b0aa98'], [T.AGRI]: ['#7fb34a', '#74a842', '#8abe56'],
  [T.CLIFF]: ['#d9734a', '#cc6640', '#e48458'], [T.BRIDGE]: ['#9a7a52', '#8e7048', '#a6865e'],
};

// ---------- utilidades ----------
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(x, y) { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967296; }
function smooth(t) { return t * t * (3 - 2 * t); }
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  const u = smooth(xf), v = smooth(yf);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v; // 0..1
}
function nz(x, y, s = 0.25) { return noise(x * s, y * s) * 2 - 1; } // -1..1
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
function shuffle(arr, rng = Math.random) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const $ = s => document.querySelector(s);

// ---------- geografia estilizada do Ceará ----------
const COAST = [[0, 9], [4, 7], [10, 6], [16, 5], [28, 7], [40, 11], [48, 14], [58, 17], [70, 22], [80, 27], [86, 31], [90, 33]];
const BORDER = [[2, 0], [88, 0], [86, 30], [78, 40], [74, 48], [68, 56], [64, 64], [52, 67], [36, 67], [24, 64], [20, 56], [14, 44], [8, 32], [3, 18]];
function coastY(x) {
  for (let i = 0; i < COAST.length - 1; i++) {
    const [x0, y0] = COAST[i], [x1, y1] = COAST[i + 1];
    if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
  }
  return x < 0 ? COAST[0][1] : COAST[COAST.length - 1][1];
}
function inPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

const RIVERS = {
  coco: [[51, 27], [52, 23], [54, 21], [56, 19], [57, 17], [58, 15]],
  jaguaribe: [[60, 67], [58, 58], [61, 53], [62, 48], [64, 44], [67, 38], [70, 32], [72, 27], [73, 22]],
  coreau: [[15, 18], [14, 13], [13, 9], [12, 5]],
  banabuiu: [[37, 49], [44, 47.5], [50, 46.5], [56, 45.5], [63.5, 44.5]],
};
const ROADS = [
  [[39, 16.5], [28, 11.5], [20, 10.5], [15, 9.5]],
  [[55, 19.5], [58, 21.5], [66, 25], [71, 26]],
  [[71, 26], [69, 32], [67, 38], [66, 40], [64, 46], [63, 52]],
  [[47.5, 19.5], [47.5, 26], [47, 31], [46, 37], [46, 43]],
  [[46, 43], [44, 50], [41, 56], [40, 61]],
  [[46, 43], [38, 44.5], [30, 46], [25, 47]],
  [[15, 9.5], [12, 15], [10, 22], [14, 32], [20, 40], [25, 47]],
  [[25, 47], [30, 55], [36, 60], [40, 61]],
  [[46, 43], [56, 42], [66, 40]],
  // ruas de Fortaleza
  [[39, 16.5], [55, 16.5]], [[39, 19.5], [55, 19.5]], [[39, 22.5], [55, 22.5]],
  [[40.5, 14], [40.5, 23]], [[44.5, 13], [44.5, 23]], [[51.5, 15], [51.5, 23]],
];

function stampLine(pts, r, fn) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const steps = Math.ceil(dist(x0, y0, x1, y1) * 4);
    for (let s = 0; s <= steps; s++) {
      const x = x0 + (x1 - x0) * s / steps, y = y0 + (y1 - y0) * s / steps;
      for (let ty = Math.floor(y - r); ty <= Math.ceil(y + r); ty++)
        for (let tx = Math.floor(x - r); tx <= Math.ceil(x + r); tx++)
          if (tx >= 0 && ty >= 0 && tx < W && ty < H && dist(tx + 0.5, ty + 0.5, x, y) <= r + 0.15) fn(tx, ty, dist(tx + 0.5, ty + 0.5, x, y));
    }
  }
}

let tiles, ground, DECOR, MARINA, decos = [], objects = [], colliders = [];
const plotAreas = [];

function genMap() {
  tiles = new Uint8Array(W * H);
  const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < W && y < H) tiles[y * W + x] = t; };
  const get = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.OTHER : tiles[y * W + x];

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const cx = x + 0.5, cy = y + 0.5;
    const cyc = coastY(cx) + nz(x, y, 0.35) * 0.9;
    let t;
    if (cy < cyc) t = T.OCEAN;
    else if (!inPoly(cx, cy, BORDER)) t = T.OTHER;
    else {
      const d = cy - cyc, n = nz(x, y, 0.2), n2 = nz(x + 50, y + 50, 0.12);
      t = n > 0.1 ? T.CAAT2 : T.CAAT;
      if (x > 61 && x < 71 && y > 33 && y < 42 && n2 > -0.25) t = T.AGRI;
      if (cx < 12.5 + n * 2 && cy > 13 && cy < 42) t = T.SERRA;
      if (dist(cx, cy, 47, 31) < 4.8 + n * 1.8) t = T.SERRA;
      if (cy > 57.2 + n * 1.2) t = T.CHAPADA;
      else if (cy > 55.6 + n * 1.2 && cx > 26 && cx < 56) t = T.SERRA;
      if (d < 4.2 + n * 1.5 && (cx < 35 || cx > 58)) t = T.DUNE;
      if (cx > 38.5 && cx < 55.5 && cy < 23.5) t = T.CITY;
      if (cx > 63 && cx < 80 && d >= 1.1 && d < 2.3) t = T.CLIFF;
      if (d < 1.2) t = T.SAND;
    }
    set(x, y, t);
  }
  // Parque do Cocó: área verde + manguezal ao redor do rio
  stampLine(RIVERS.coco, 3.2, (x, y) => { const t = get(x, y); if (t !== T.OCEAN && t !== T.SAND) set(x, y, T.PARK); });
  stampLine(RIVERS.coco.slice(1), 1.9, (x, y) => { const t = get(x, y); if (t !== T.OCEAN) set(x, y, T.MANGUE); });
  stampLine(RIVERS.coreau.slice(1), 1.8, (x, y) => { const t = get(x, y); if (t !== T.OCEAN) set(x, y, T.MANGUE); });
  stampLine(RIVERS.jaguaribe.slice(6), 1.8, (x, y) => { const t = get(x, y); if (t !== T.OCEAN) set(x, y, T.MANGUE); });
  // rios e açude Castanhão
  for (const k in RIVERS) stampLine(RIVERS[k], 0.55, (x, y) => { if (get(x, y) !== T.OCEAN) set(x, y, T.RIVER); });
  for (let y = 44; y < 56; y++) for (let x = 55; x < 68; x++) if (dist(x + 0.5, y + 0.5, 61.5, 50) < 3.3 + nz(x, y, 0.5) * 0.8) set(x, y, T.LAKE);
  // estradas (pontes sobre água)
  for (const r of ROADS) stampLine(r, 0.35, (x, y) => {
    const t = get(x, y);
    if (t === T.OTHER || t === T.OCEAN) return;
    set(x, y, (t === T.RIVER || t === T.LAKE || t === T.BRIDGE) ? T.BRIDGE : T.ROAD);
  });
  // áreas de plantio sempre caminháveis
  const plotSrc = PROCESSOS.map(p => ({ id: p.id, x: p.plots.x, y: p.plots.y })).concat(Object.values(GEN_SPOTS));
  for (const p of plotSrc) {
    const a = { x0: p.x - 1, y0: p.y - 1, x1: p.x + 7, y1: p.y + 4 };
    plotAreas.push(a);
    for (let y = a.y0; y <= a.y1; y++) for (let x = a.x0; x <= a.x1; x++) {
      const t = get(x, y);
      if (SOLID.has(t) || t === T.ROAD) set(x, y, p.id === 'coco' ? T.MANGUE : (t === T.ROAD ? T.ROAD : T.CAAT));
    }
  }
  // água rasa junto à costa
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (get(x, y) === T.OCEAN) {
    let near = false;
    for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) { const t = get(x + dx, y + dy); if (t !== T.OCEAN && t !== T.SHALLOW && t !== T.OTHER) { near = true; break; } }
    if (near) set(x, y, T.SHALLOW);
  }
  renderGround(get);
  placeObjects(get);
}

function renderGround(get) {
  ground = mkCanvas(W * TILE, H * TILE, g => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const t = get(x, y), cols = TCOL[t];
      const px = x * TILE, py = y * TILE;
      g.fillStyle = cols[0]; g.fillRect(px, py, TILE, TILE);
      const rng = mulberry32(x * 7919 + y * 104729);
      for (let i = 0; i < 7; i++) { g.fillStyle = cols[1 + (i % 2)]; g.fillRect(px + Math.floor(rng() * 15), py + Math.floor(rng() * 15), 2, 1); }
      if (t === T.DUNE) { g.fillStyle = '#e4d29a'; for (let i = 3; i < 16; i += 5) g.fillRect(px + 2 + (i % 3), py + i, 9, 1); }
      if (t === T.AGRI) { g.fillStyle = '#5e9a36'; for (let i = 1; i < 16; i += 4) g.fillRect(px, py + i, 16, 2); }
      if (t === T.CITY) { g.fillStyle = '#b4ac9c'; g.fillRect(px, py + 15, 16, 1); g.fillRect(px + 15, py, 1, 16); }
      if (t === T.CLIFF) { g.fillStyle = '#f0a070'; g.fillRect(px, py + 4, 16, 2); g.fillStyle = '#b5523a'; g.fillRect(px, py + 11, 16, 2); }
      if (t === T.MANGUE) { g.fillStyle = '#3f6a8a'; if (rng() < 0.5) g.fillRect(px + 3, py + 8, 6, 2); }
      if (t === T.ROAD) {
        g.fillStyle = '#6a6560'; g.fillRect(px, py, 16, 16);
        const h = get(x - 1, y) === T.ROAD || get(x + 1, y) === T.ROAD;
        g.fillStyle = '#e8d070'; if (h) g.fillRect(px + 4, py + 7, 6, 1); else g.fillRect(px + 7, py + 4, 1, 6);
      }
      if (t === T.BRIDGE) { g.fillStyle = '#6a4a2a'; for (let i = 0; i < 16; i += 4) g.fillRect(px, py + i, 16, 1); g.fillRect(px, py, 1, 16); g.fillRect(px + 15, py, 1, 16); }
      if (t === T.OTHER) { g.fillStyle = 'rgba(40,40,30,0.18)'; g.fillRect(px, py, TILE, TILE); }
      // espuma na praia
      if (t === T.SAND || t === T.DUNE || t === T.CLIFF) {
        g.fillStyle = '#ffffffaa';
        if (get(x, y - 1) === T.SHALLOW) g.fillRect(px, py, 16, 2);
        if (get(x + 1, y) === T.SHALLOW) g.fillRect(px + 14, py, 2, 16);
      }
    }
    // divisa do Ceará com estados vizinhos
    g.strokeStyle = 'rgba(120,40,40,0.55)'; g.lineWidth = 2; g.setLineDash([6, 4]);
    g.beginPath();
    BORDER.slice(2).concat([[3, 18], [2, 8]]).forEach(([x, y], i) => i ? g.lineTo(x * TILE, y * TILE) : g.moveTo(x * TILE, y * TILE));
    g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(80,60,40,0.55)'; g.font = 'bold 22px sans-serif';
    g.fillText('PIAUÍ', 2 * TILE, 50 * TILE); g.fillText('PERNAMBUCO', 40 * TILE, 69 * TILE);
    g.fillText('PARAÍBA', 72 * TILE, 58 * TILE); g.fillText('RIO GRANDE', 76 * TILE, 40 * TILE); g.fillText('DO NORTE', 77 * TILE, 42 * TILE);
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.font = 'italic bold 26px sans-serif'; g.fillText('Oceano Atlântico', 52 * TILE, 6 * TILE);
  });
}

function isBlockedTile(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true;
  return SOLID.has(tiles[ty * W + tx]);
}
function tileAt(px, py) { const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE); return (tx < 0 || ty < 0 || tx >= W || ty >= H) ? T.OTHER : tiles[ty * W + tx]; }

function placeObjects(get) {
  const rng = mulberry32(2026);
  const keepClear = [];
  const clear = (x, y, r) => keepClear.push({ x, y, r });
  for (const n of NPCS) clear(n.x + 0.5, n.y + 0.5, 1.6);
  for (const p of PROCESSOS) clear(p.site.x + 0.5, p.site.y + 0.5, 2);
  const inPlot = (x, y) => plotAreas.some(a => x >= a.x0 && x <= a.x1 + 1 && y >= a.y0 && y <= a.y1 + 1);
  const isClear = (x, y) => !keepClear.some(k => dist(k.x, k.y, x, y) < k.r) && !inPlot(x, y);

  const addObj = (spr, x, y, col) => {
    const o = { spr, x, y };
    objects.push(o);
    if (col) colliders.push({ x0: x + col[0], y0: y + col[1], x1: x + col[2], y1: y + col[3] });
    return o;
  };
  // SEMA e UFC
  addObj(DECOR.sema, 45 * TILE, 18 * TILE - 48, [2, 30, 62, 46]);
  addObj(DECOR.ufc, 39 * TILE, 21 * TILE - 40, [2, 20, 54, 38]);
  const excl = [[44, 13, 49, 18], [38, 17, 43, 21]];
  // prédios de Fortaleza
  const used = new Set();
  for (let by = 14; by <= 20; by += 3) for (let bx = 39; bx <= 54; bx++) {
    const ok = [0, 1].every(dx => [0, 1].every(dy => {
      const t = get(bx + dx, by + dy);
      return t === T.CITY && !used.has((bx + dx) + ',' + (by + dy));
    }));
    if (!ok || excl.some(([x0, y0, x1, y1]) => bx + 1 >= x0 && bx <= x1 && by + 1 >= y0 && by <= y1)) continue;
    if (!isClear(bx + 1, by + 1.5) || rng() < 0.15) continue;
    [0, 1].forEach(dx => [0, 1].forEach(dy => used.add((bx + dx) + ',' + (by + dy))));
    addObj(DECOR.casas[Math.floor(rng() * DECOR.casas.length)], bx * TILE + 1, (by + 2) * TILE - 30, [1, 16, 29, 30]);
  }
  // monólitos de Quixadá
  for (const [mx, my] of [[42, 39], [50, 40], [52.5, 43], [42, 47.5], [38.5, 41], [53, 49]]) {
    let roadNear = false;
    for (let dy = -1; dy <= 0; dy++) for (let dx = -2; dx <= 1; dx++) { const t = get(Math.floor(mx) + dx, Math.floor(my) + dy); if (t === T.ROAD || t === T.BRIDGE || t === T.RIVER) roadNear = true; }
    if (roadNear || !isClear(mx, my)) continue;
    const spr = DECOR.monolito[Math.floor(rng() * 2)];
    addObj(spr, mx * TILE - 22, my * TILE - 52, [6, 36, 38, 52]);
  }
  // aerogeradores
  const turbines = [];
  for (let x = 19; x <= 31; x += 2.4) turbines.push([x, coastY(x) + 2.6 + (Math.round(x) % 2)]);
  for (let x = 73; x <= 80; x += 2.3) turbines.push([x, coastY(x) + 3.3]);
  for (const [tx, ty] of turbines) {
    const t = get(Math.floor(tx), Math.floor(ty));
    if (SOLID.has(t) || t === T.ROAD || !isClear(tx, ty)) continue;
    const o = addObj(null, tx * TILE, ty * TILE, [-3, -4, 3, 0]);
    o.turbine = true; o.phase = rng() * 6;
  }
  // vegetação
  const colliderHit = (x, y) => colliders.some(c => x > c.x0 - 6 && x < c.x1 + 6 && y > c.y0 - 4 && y < c.y1 + 10);
  const nearRiver = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (get(x + dx, y + dy) === T.RIVER) return true; return false; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const t = get(x, y);
    if (SOLID.has(t) || t === T.ROAD || t === T.BRIDGE || t === T.CITY || !isClear(x + 0.5, y + 0.5)) continue;
    const r = rng();
    let spr = null;
    if ((t === T.CAAT || t === T.CAAT2 || t === T.AGRI || t === T.MANGUE) && y > 24 && nearRiver(x, y) && r < 0.3) spr = DECOR.carnauba;
    else if (t === T.CAAT || t === T.CAAT2) {
      if (r < 0.035) spr = DECOR.caatinga[Math.floor(rng() * 3)];
      else if (r < 0.052) spr = DECOR.mandacaru;
      else if (r < 0.058) spr = DECOR.ipeRoxo;
      else if (r < 0.09) spr = DECOR.tufo;
      else if (r < 0.1) spr = DECOR.rock;
    } else if (t === T.SERRA) {
      if (r < 0.3) spr = DECOR.serra[Math.floor(rng() * 3)];
      else if (r < 0.33) spr = rng() < 0.5 ? DECOR.ipeAmarelo : DECOR.ipeRoxo;
    } else if (t === T.CHAPADA) {
      if (r < 0.08) spr = DECOR.pequi; else if (r < 0.1) spr = DECOR.ipeAmarelo; else if (r < 0.14) spr = DECOR.tufo;
    } else if (t === T.MANGUE) { if (r < 0.35) spr = DECOR.mangue[Math.floor(rng() * 2)]; }
    else if (t === T.PARK) { if (r < 0.25) spr = DECOR.serra[Math.floor(rng() * 3)]; else if (r < 0.32) spr = DECOR.flor; }
    else if (t === T.SAND) { if (r < 0.05) spr = DECOR.coqueiro; }
    else if (t === T.DUNE) { if (r < 0.015) spr = DECOR.coqueiro; else if (r < 0.04) spr = DECOR.tufo; }
    if (!spr) continue;
    const px = x * TILE + 3 + Math.floor(rng() * 10), py = y * TILE + 10 + Math.floor(rng() * 6);
    if (colliderHit(px, py)) continue;
    const dry = DECOR.caatinga.includes(spr) || spr === DECOR.tufo;
    decos.push({ spr, x: px - (spr.width >> 1), y: py - spr.height, by: py, tx: Math.floor(px / TILE), ty: Math.floor((py - 1) / TILE), dry });
  }
}

// =====================================================================
//  Estado e salvamento
// =====================================================================
const SAVE_KEY = 'marina-ceara-v1';
let S;
const BAK_KEY = 'marina-ceara-bak';
function newState() {
  const procs = {};
  for (const p of PROCESSOS) procs[p.id] = newProcState();
  return Object.assign({ stats: { amb: 50, eco: 50, soc: 50 }, procs, unlocked: 2, quizDone: false, introDone: false, trees: 0, ended: false, player: { x: 47 * TILE + 8, y: 19 * TILE + 10 }, talked: {} }, mundoDefaults());
}
function save() { try { if (!S) return; S.player = { x: P.x, y: P.y }; S.lastSeen = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* sem armazenamento */ } }
function readSave(key) { try { const s = JSON.parse(localStorage.getItem(key)); return s && s.procs && s.stats ? migrate(s) : null; } catch (e) { return null; } }
// lê o save (com versão e migração); se estiver corrompido, usa a cópia de segurança
function load() {
  const s = readSave(SAVE_KEY) || readSave(BAK_KEY);
  if (s) try { localStorage.setItem(BAK_KEY, JSON.stringify(s)); } catch (e) { }
  return s;
}

// =====================================================================
//  Jogadora
// =====================================================================
const P = { x: 0, y: 0, dir: 'down', frame: 0, animT: 0, moving: false };
const SPEED = 72;

function canStand(x, y) {
  const pts = [[x - 5, y - 4], [x + 5, y - 4], [x - 5, y], [x + 5, y]];
  for (const [px, py] of pts) if (isBlockedTile(Math.floor(px / TILE), Math.floor(py / TILE))) return false;
  for (const c of colliders) if (x + 5 > c.x0 && x - 5 < c.x1 && y > c.y0 && y - 4 < c.y1) return false;
  return true;
}
function nearestWalkable(x, y) {
  if (canStand(x, y)) return { x, y };
  for (let r = 4; r < 200; r += 4) for (let a = 0; a < 16; a++) {
    const nx = x + Math.cos(a / 16 * Math.PI * 2) * r, ny = y + Math.sin(a / 16 * Math.PI * 2) * r;
    if (canStand(nx, ny)) return { x: nx, y: ny };
  }
  return { x, y };
}

// =====================================================================
//  Entrada: teclado + joystick virtual
// =====================================================================
let inputMode = 'desk';
function setInputMode(m) {
  if (m === inputMode && document.body.classList.contains(m)) return;
  inputMode = m;
  document.body.classList.toggle('touch', m === 'touch');
  document.body.classList.toggle('desk', m === 'desk');
}
const keys = {};
const joy = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  setInputMode('desk');
  keys[k] = true;
  if (e.repeat && [' ', 'e', 'enter'].includes(k)) { e.preventDefault(); return; }
  if ([' ', 'e', 'enter'].includes(k)) { e.preventDefault(); if ($('#title').hidden) onAction(); }
  if (k === 'escape') closeModal();
  if (k === 'm' && !uiBusy()) openMap();
  if (k === 'g' && !uiBusy()) openMenu();
  if ((k === 'j' || k === 'tab') && !uiBusy()) { e.preventDefault(); openAgenda(); }
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
addEventListener('pointerdown', e => { if (e.pointerType === 'touch') setInputMode('touch'); }, true);

function setupTouch() {
  const zone = $('#joyZone'), knob = $('#joyKnob'), base = $('#joyBase');
  zone.addEventListener('pointerdown', e => {
    if (joy.active) return;
    joy.active = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.dx = joy.dy = 0;
    base.style.left = e.clientX + 'px'; base.style.top = e.clientY + 'px'; base.classList.add('on');
    knob.style.transform = 'translate(-50%,-50%)';
    zone.setPointerCapture(e.pointerId); unlockAudio();
  });
  zone.addEventListener('pointermove', e => {
    if (!joy.active || e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy;
    const m = Math.hypot(dx, dy), max = 50;
    if (m > max) { dx = dx / m * max; dy = dy / m * max; }
    joy.dx = dx / max; joy.dy = dy / max;
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  });
  const end = e => { if (e.pointerId !== joy.id) return; joy.active = false; joy.dx = joy.dy = 0; base.classList.remove('on'); };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  $('#btnA').addEventListener('pointerdown', e => { e.preventDefault(); unlockAudio(); onAction(); });
  document.addEventListener('gesturestart', e => e.preventDefault());
}

// =====================================================================
//  Som (bem simples, WebAudio)
// =====================================================================
let AC = null;
function unlockAudio() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } if (AC && AC.state === 'suspended') AC.resume(); }
function beep(f = 660, d = 0.08, type = 'square', vol = 0.05, when = 0) {
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = f; g.gain.value = vol;
  o.connect(g); g.connect(AC.destination);
  const t = AC.currentTime + when; o.start(t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.stop(t + d + 0.02);
}
const sfx = {
  talk: () => beep(520, 0.03, 'square', 0.025),
  ok: () => { beep(660, 0.08); beep(880, 0.1, 'square', 0.05, 0.08); beep(1320, 0.14, 'square', 0.05, 0.16); },
  bad: () => { beep(220, 0.15, 'sawtooth', 0.04); beep(160, 0.2, 'sawtooth', 0.04, 0.12); },
  stamp: () => beep(120, 0.18, 'triangle', 0.12),
  plant: () => { beep(440, 0.06, 'triangle', 0.08); beep(660, 0.08, 'triangle', 0.08, 0.07); beep(990, 0.12, 'triangle', 0.08, 0.14); },
};

// =====================================================================
//  UI: diálogos, modais, toasts
// =====================================================================
let dialogQueue = [], dialogDone = null, typing = null;
function portraitFor(who) {
  if (who === 'marina') return { svg: MARINA_PHOTO, name: 'Marina' };
  if (who === 'sistema') return { svg: null, name: 'SEMA • Ceará', icon: '🌵' };
  return { svg: npcPortraitSVG(who.look), name: who.name, role: who.role };
}
function say(lines, onDone) {
  dialogQueue = lines.slice(); dialogDone = onDone || null;
  $('#dialog').hidden = false; nextLine();
}
function nextLine() {
  if (typing) { clearInterval(typing.iv); $('#dlgText').textContent = typing.full; typing = null; return; }
  const l = dialogQueue.shift();
  if (!l) { $('#dialog').hidden = true; const d = dialogDone; dialogDone = null; if (d) d(); return; }
  const p = portraitFor(l.who);
  $('#dlgPortrait').innerHTML = p.svg || `<div class="sysIcon">${p.icon}</div>`;
  $('#dlgName').innerHTML = p.name + (p.role ? ` <small>${p.role}</small>` : '');
  const el = $('#dlgText'); el.textContent = '';
  let i = 0; const full = l.text;
  typing = { full, iv: setInterval(() => { i += 2; el.textContent = full.slice(0, i); if (i % 6 === 0) sfx.talk(); if (i >= full.length) { clearInterval(typing.iv); typing = null; } }, 18) };
}
$('#dialog').addEventListener('click', () => { unlockAudio(); nextLine(); });

function openModal(html, cls = '') {
  const m = $('#modal'); m.className = 'modal ' + cls; m.innerHTML = html; $('#modalWrap').hidden = false;
  m.scrollTop = 0;
  m.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  return m;
}
function closeModal() { $('#modalWrap').hidden = true; $('#modal').innerHTML = ''; }
function uiBusy() { return !$('#dialog').hidden || !$('#modalWrap').hidden || !$('#title').hidden; }

let toastT = null;
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.innerHTML = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms);
}
function regionToast(r) {
  const t = $('#regionToast'); t.innerHTML = `<b>${r.name}</b><span>${r.sub}</span>`;
  t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
}

function updateHUD() {
  for (const k of ['amb', 'eco', 'soc']) {
    const v = Math.round(S.stats[k]);
    const bar = $('#bar-' + k);
    bar.style.width = v + '%';
    bar.style.background = v < 35 ? '#e2553a' : v < 60 ? '#f2c230' : '#4fbf5a';
    $('#val-' + k).textContent = v;
  }
  $('#treeCount').textContent = countVivas();
  const est = estacao();
  $('#seasonIcon').textContent = est.icon;
  $('#seasonTxt').textContent = `${est.nome.split(' •')[0]} • ${MESES[mesAtual() - 1]} • Ano ${S.year}`;
  const pend = tasks().filter(t => !t.done).length;
  $('#agendaBadge').textContent = pend; $('#agendaBadge').hidden = pend === 0;
  $('#btnAgenda').classList.toggle('alert', S.fires.length > 0);
}
function addStats(fx) {
  for (const k in fx) S.stats[k] = clamp(S.stats[k] + fx[k], 0, 100);
  updateHUD();
  const parts = Object.entries(fx).filter(([, v]) => v).map(([k, v]) => `${{ amb: '🌳', eco: '💰', soc: '🤝' }[k]} ${v > 0 ? '+' : ''}${v}`);
  if (parts.length) floatText(parts.join('  '));
}
function floatText(txt) {
  const d = document.createElement('div'); d.className = 'float'; d.textContent = txt;
  document.body.appendChild(d); setTimeout(() => d.remove(), 2200);
}

// =====================================================================
//  Lógica dos processos
// =====================================================================
const procById = id => PROCESSOS.find(p => p.id === id) || S.gen.find(p => p.id === id);
const regionById = id => REGIONS.find(r => r.id === id);
const AMBIENTE = { coco: 'Manguezal (APP)', adutora: 'Caatinga', eolico: 'Restinga e dunas', resort: 'Restinga e falésias', irrigacao: 'Mata ciliar do rio Jaguaribe', mineracao: 'Matas e cerrado da Chapada do Araripe', solar: 'Caatinga (mata ciliar de riacho)' };

function unlockedProcs() { return PROCESSOS.slice(0, S.unlocked).concat(S.gen); }
function compOf(p) { const st = S.procs[p.id]; return st.choice == null ? null : p.opcoes[st.choice].comp; }
function plotPos(p, i) { return { x: (p.plots.x + (i % 5) * 1.3) * TILE + 8, y: (p.plots.y + Math.floor(i / 5) * 1.7) * TILE + 12 }; }
function plantedCount(p) { return S.procs[p.id].planted.filter(Boolean).length; }

function tasks() {
  const out = [];
  for (const p of unlockedProcs()) {
    const st = S.procs[p.id], reg = regionById(p.region);
    if (st.status === 'pendente') {
      if (!st.visited) out.push({ icon: '🔎', txt: `Vistoria (opcional): ${p.titulo}`, where: reg.name, go: { x: p.site.x * TILE + 8, y: (p.site.y + 1) * TILE + 8 }, done: false, optional: true });
      out.push({ icon: '📄', txt: `Analisar processo nº ${p.numero}: ${p.titulo}`, where: 'Sede da SEMA, Fortaleza', go: { x: 47 * TILE + 8, y: 19 * TILE + 10 }, done: false });
    } else {
      const c = compOf(p);
      if (c && !st.done) {
        const k = plantedCount(p), go = { x: p.plots.x * TILE + 40, y: (p.plots.y - 1) * TILE + 12 };
        if (k < c.n) out.push({ icon: '🌱', txt: `Compensação: plantar mudas nativas (${k}/${c.n})`, where: reg.name, go, done: false });
        else {
          const adultas = st.planted.filter(pl => pl && stageOf(pl) >= 2).length;
          out.push({ icon: needsWater(p) ? '💧' : '🌿', txt: `${needsWater(p) ? 'Regar e acompanhar' : 'Acompanhar'} as mudas até virarem árvores (${adultas}/${c.n})`, where: reg.name, go, done: false });
        }
      } else if (!p.gen && S.year === 1) out.push({ icon: '✔️', txt: `Processo nº ${p.numero}: ${c ? 'compensação cumprida' : 'parecer assinado'}`, where: reg.name, done: true });
    }
  }
  tasksMundo(out);
  if (!S.quizDone) out.push({ icon: '🎓', txt: 'Conversar com a Profa. Iracema na UFC', where: 'Fortaleza', go: { x: 41 * TILE + 8, y: 22 * TILE + 8 }, done: false, optional: true });
  return out;
}

function openSema() {
  let arquivados = 0;
  const all = unlockedProcs();
  const list = all.filter(p => {
    const st = S.procs[p.id], c = compOf(p);
    const ativo = st.status === 'pendente' || (c && !st.done);
    if (!ativo && (S.year > 1 || p.gen)) { arquivados++; return false; }
    return true;
  }).sort((a, b) => (S.procs[b.id].status === 'pendente') - (S.procs[a.id].status === 'pendente')).map(p => {
    const st = S.procs[p.id], reg = regionById(p.region), c = compOf(p);
    let status, btn = '';
    if (st.status === 'pendente') { status = `<span class="tag warn">Aguardando parecer</span>`; btn = `<button class="btn" data-proc="${p.id}">Analisar</button>`; }
    else if (c && plantedCount(p) < c.n) status = `<span class="tag ok">Parecer assinado</span> <span class="tag">🌱 ${plantedCount(p)}/${c.n} mudas</span>`;
    else if (c && !st.done) status = `<span class="tag ok">Parecer assinado</span> <span class="tag">🌿 mudas crescendo</span>`;
    else status = `<span class="tag ok">Concluído ✔</span>`;
    return `<div class="card"><div class="cardHead"><b>Nº ${p.numero}</b><span>${reg.name}</span></div><div class="cardTitle">${p.titulo}</div><div class="cardFoot">${status}${btn}</div></div>`;
  }).join('');
  const more = S.unlocked < PROCESSOS.length ? `<p class="muted">📥 Novos processos chegam conforme você emite pareceres.</p>`
    : pendentes() ? '' : `<p class="muted">📥 Nenhum processo na mesa agora. Novos pedidos de licença chegam a todo momento.</p>`;
  const arq = arquivados ? `<p class="muted small">🗄️ ${arquivados} processo${arquivados > 1 ? 's' : ''} no arquivo.</p>` : '';
  const m = openModal(`<div class="mHead"><h2>🏛️ Mesa de processos • SEMA</h2><button class="x" data-close>✕</button></div>
    <p class="muted small">Ano ${S.year} de gestão • ${CARGOS[S.cargo]}</p>${list}${more}${arq}`);
  m.querySelectorAll('[data-proc]').forEach(b => b.addEventListener('click', () => openProcesso(procById(b.dataset.proc))));
}

function openProcesso(p) {
  const st = S.procs[p.id], reg = regionById(p.region);
  const vist = st.visited
    ? `<div class="box ok">🔎 <b>Vistoria realizada:</b> ${p.vistoria}</div>`
    : `<div class="box warn">⚠️ <b>Vistoria não realizada.</b> Vá até o 📍 em <b>${reg.name}</b> para fortalecer o parecer (opcional, mas dá bônus).</div>`;
  const opts = st.order.map(i => `<label class="opt"><input type="radio" name="op" value="${i}"><span>${p.opcoes[i].txt}</span></label>`).join('');
  const m = openModal(`
    <div class="mHead"><h2>📄 Processo nº ${p.numero}</h2><button class="x" data-close>✕</button></div>
    <div class="kv"><span>Empreendimento</span><b>${p.titulo}</b></div>
    <div class="kv"><span>Requerente</span><b>${p.requerente}</b></div>
    <div class="kv"><span>Tipo</span><b>${p.tipo}</b></div>
    <div class="kv"><span>Local</span><b>${reg.name} (${reg.sub})</b></div>
    <div class="kv"><span>Ambiente</span><b>${ambOf(p)}</b></div>
    <p>${p.resumo}</p>${vist}
    <h3>Qual a sua conclusão técnica?</h3>${opts}
    <div class="row"><button class="btn ghost" id="back">Voltar</button><button class="btn" id="go" disabled>Redigir parecer ✍️</button></div>`);
  m.querySelectorAll('input[name=op]').forEach(r => r.addEventListener('change', () => { m.querySelector('#go').disabled = false; }));
  m.querySelector('#back').onclick = openSema;
  m.querySelector('#go').onclick = () => openParecer(p, +m.querySelector('input[name=op]:checked').value);
}

function openParecer(p, idx) {
  const st = S.procs[p.id], reg = regionById(p.region), op = p.opcoes[idx];
  const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const comp = op.comp ? `Plantio compensatório de <b>${op.comp.n} mudas de espécies nativas</b> em ${reg.name}, com acompanhamento técnico da analista.` : 'Não se aplica.';
  const m = openModal(`
    <div class="paper">
      <div class="paperHead"><div class="brasao">🌵</div><div><b>GOVERNO DO ESTADO DO CEARÁ</b><br>Secretaria do Meio Ambiente e Mudança do Clima<br><small>(documento fictício do jogo)</small></div></div>
      <h3 class="center">PARECER TÉCNICO Nº ${p.numero}</h3>
      <p><b>Interessado:</b> ${p.requerente}<br><b>Assunto:</b> ${p.titulo}<br><b>Local:</b> ${reg.name}</p>
      <p><b>1. Análise.</b> ${p.resumo}</p>
      <p><b>2. Vistoria.</b> ${st.visited ? p.vistoria : 'Não realizada.'}</p>
      <p><b>3. Conclusão.</b> ${op.txt}</p>
      <p><b>4. Compensação ambiental.</b> ${comp}</p>
      <p class="right">Fortaleza, ${hoje}.</p>
      <div class="sigWrap"><canvas id="sig"></canvas><div class="sigHint">Assine aqui com o dedo</div><div class="stamp" id="stamp">ASSINADO</div></div>
      <div class="sigLine">Marina • ${CARGOS[S.cargo]}</div>
    </div>
    <div class="row"><button class="btn ghost" id="clr">Limpar</button><button class="btn ghost" id="back">Voltar</button><button class="btn" id="sign" disabled>Assinar parecer</button></div>`, 'paperModal');
  const cv = m.querySelector('#sig'), g = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const fit = () => { const r = cv.getBoundingClientRect(); cv.width = r.width * dpr; cv.height = r.height * dpr; g.scale(dpr, dpr); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1a3a8a'; g.lineWidth = 2.4; };
  requestAnimationFrame(fit);
  let drawing = false, pts = 0, last = null, signed = false;
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', e => { if (signed) return; drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); m.querySelector('.sigHint').style.opacity = 0; });
  cv.addEventListener('pointermove', e => {
    if (!drawing) return; const p2 = pos(e);
    g.beginPath(); g.moveTo(last[0], last[1]); g.lineTo(p2[0], p2[1]); g.stroke(); last = p2;
    if (++pts > 25) m.querySelector('#sign').disabled = false;
  });
  cv.addEventListener('pointerup', () => drawing = false);
  m.querySelector('#clr').onclick = () => { if (signed) return; g.clearRect(0, 0, cv.width, cv.height); pts = 0; m.querySelector('#sign').disabled = true; };
  m.querySelector('#back').onclick = () => openProcesso(p);
  m.querySelector('#sign').onclick = () => {
    if (signed) { closeModal(); finishDecision(p, idx); return; }
    signed = true; sfx.stamp();
    m.querySelector('#stamp').classList.add('on');
    m.querySelector('#sign').textContent = 'Enviar parecer ✉️';
    m.querySelector('#clr').disabled = true; m.querySelector('#back').disabled = true;
  };
}

function finishDecision(p, idx) {
  const st = S.procs[p.id], op = p.opcoes[idx], reg = regionById(p.region);
  st.choice = idx;
  st.status = op.comp || ['cond', 'ruim', 'simples'].includes(op.k) ? 'deferido' : (op.txt.startsWith('Indeferir') ? 'indeferido' : 'exigencia');
  const fx = Object.assign({}, op.fx);
  if (st.visited) { fx.soc = (fx.soc || 0) + 3; fx.amb = (fx.amb || 0) + 2; }
  addStats(fx);
  const good = isGood(p, idx);
  good ? sfx.ok() : sfx.bad();
  const before = S.unlocked;
  S.unlocked = Math.min(PROCESSOS.length, S.unlocked + 1);
  S.decTotal++; S.ys.dec++;
  if (S.unlocked >= PROCESSOS.length) S.nextProcAt = Math.min(S.nextProcAt, S.play + 25);
  agendarRetorno(p, idx);
  save();
  const lines = [
    { who: 'sistema', text: (good ? '✅ ' : '⚠️ ') + op.fb },
  ];
  if (st.visited) lines.push({ who: 'sistema', text: '🔎 Bônus: seu parecer estava fundamentado em vistoria de campo (+3 🤝, +2 🌳).' });
  lines.push({ who: 'sistema', text: '💡 Você sabia? ' + p.fato });
  if (op.comp) lines.push({ who: 'marina', text: `Agora é comigo: preciso plantar ${op.comp.n} mudas nativas em ${reg.name} e cuidar delas até virarem árvores. Já marquei as covas no mapa! 🌱` });
  if (st.status === 'deferido') lines.push({ who: 'sistema', text: '⚖️ Daqui a um tempo, a SEMA vai fiscalizar se as condicionantes desta licença estão sendo cumpridas.' });
  say(lines, () => {
    if (S.unlocked > before) { toast('📥 Novo processo chegou na mesa da SEMA!'); }
    updateHUD(); checkAno();
  });
}

function doVistoria(p) {
  const st = S.procs[p.id];
  st.visited = true; save(); sfx.ok();
  say([
    { who: 'marina', text: 'Vamos ver de perto como está a área…' },
    { who: 'sistema', text: '🔎 ' + p.vistoria },
    { who: 'marina', text: 'Anotado! Isso vai entrar no meu parecer lá na SEMA.' },
  ], updateHUD);
}

function openPlantio(p, i) {
  const c = compOf(p), reg = regionById(p.region);
  const rng = Math.random;
  const goods = shuffle(c.ok, rng).slice(0, 2), bads = shuffle(c.bad, rng).slice(0, 2);
  const opts = shuffle(goods.concat(bads), rng);
  const m = openModal(`
    <div class="mHead"><h2>🌱 Qual muda plantar aqui?</h2><button class="x" data-close>✕</button></div>
    <p class="muted">${reg.name} • Ambiente: <b>${ambOf(p)}</b> • Cova ${plantedCount(p) + 1} de ${c.n}</p>
    <div class="species">${opts.map(id => `<button class="sp" data-sp="${id}"><b>${SPECIES[id].name}</b><i>${SPECIES[id].sci}</i></button>`).join('')}</div>
    <p class="muted small">Dica: compensação ambiental usa espécies <b>nativas</b> do ambiente afetado.</p>`);
  m.querySelectorAll('[data-sp]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.sp, sp = SPECIES[id], st = S.procs[p.id];
    closeModal();
    if (sp.bad || !c.ok.includes(id)) {
      st.errors++; addStats({ amb: -1 }); sfx.bad(); save();
      say([{ who: 'sistema', text: `❌ ${sp.name} (${sp.sci}) não serve aqui. ${sp.info}` }, { who: 'marina', text: 'Opa! Vou escolher uma nativa desse ambiente.' }]);
      return;
    }
    st.planted[i] = { sp: id, t: Date.now(), g: 0, w: 1, d: 0 };
    S.trees++; S.ys.mudas++; sfx.plant(); spawnLeaves(plotPos(p, i));
    toast(`🌱 <b>${sp.name}</b> plantado! ${sp.info}`, 4200);
    if (plantedCount(p) >= c.n && !st.plantedAll) {
      st.plantedAll = true;
      setTimeout(() => queueSay([
        { who: 'marina', text: `Todas as ${c.n} mudas plantadas em ${reg.name}! 🌱` },
        { who: 'sistema', text: estacao().sede
          ? `${estacao().icon} Estamos em ${estacao().nome}: as mudas precisam de rega até virarem árvores. Fique de olho no 💧. Muda que morre volta a ser cova para replantio.`
          : '🌧️ É quadra chuvosa: a chuva rega as mudas. Agora é acompanhar até virarem árvores.' },
        { who: 'sistema', text: '📏 A compensação só é cumprida quando as árvores sobrevivem. É a “taxa de sobrevivência” que os órgãos ambientais cobram.' },
      ], updateHUD), 600);
    }
    save(); updateHUD();
  }));
}

function openQuiz(npc) {
  const q = npc.quiz;
  const m = openModal(`<div class="mHead"><h2>🎓 Pergunta da professora</h2><button class="x" data-close>✕</button></div>
    <p><b>${q.q}</b></p>${q.a.map((a, i) => `<button class="btn block ghost" data-a="${i}">${a}</button>`).join('')}`);
  m.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
    closeModal(); S.quizDone = true;
    const ok = +b.dataset.a === q.correct;
    if (ok) { sfx.ok(); addStats({ soc: 3, amb: 2 }); } else sfx.bad();
    save();
    say([{ who: npc, text: ok ? q.ok : q.no }], updateHUD);
  }));
}

// ---------- agenda e mapa ----------
function openAgenda() {
  const ts = tasks();
  const m = openModal(`<div class="mHead"><h2>📋 Agenda da Marina</h2><button class="x" data-close>✕</button></div>
    ${ts.map((t, i) => `<div class="task ${t.done ? 'done' : ''} ${t.urgent ? 'urgent' : ''}"><span class="ti">${t.done ? '✔️' : t.icon}</span><div><div>${t.txt}${t.optional ? ' <small class="muted">(opcional)</small>' : ''}</div><small class="muted">📍 ${t.where}</small></div>${!t.done && t.go ? `<button class="btn sm" data-go="${i}">Ir 🚙</button>` : ''}</div>`).join('')}
    <div class="legend"><b>Indicadores:</b> 🌳 Ambiente • 💰 Economia • 🤝 Sociedade. Na economia ecológica, o objetivo é manter os três saudáveis ao mesmo tempo.</div>`);
  m.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { const t = ts[+b.dataset.go]; closeModal(); travelTo(t.go.x, t.go.y); }));
}

let miniCanvas = null;
function buildMini() {
  miniCanvas = mkCanvas(W * 4, H * 4, g => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { g.fillStyle = TCOL[tiles[y * W + x]][0]; g.fillRect(x * 4, y * 4, 4, 4); }
    g.fillStyle = 'rgba(0,0,0,.15)';
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (tiles[y * W + x] === T.OTHER) g.fillRect(x * 4, y * 4, 4, 4);
  });
}
function openMap() {
  const m = openModal(`<div class="mHead"><h2>🗺️ Mapa do Ceará</h2><button class="x" data-close>✕</button></div>
    <p class="muted small">Toque numa região para viajar de viatura 🚙</p>
    <div class="mapBox"><canvas id="mini"></canvas></div>
    <div class="chips">${REGIONS.map(r => `<button class="chip" data-r="${r.id}">${r.name}</button>`).join('')}</div>
    <div class="legend small">🟡 vistoria • 🟢 plantio • 💧 rega • 🔵 SEMA • 🔴 fogo • 🟠 ocorrência • 🟣 fiscalização • 🩷 Marina</div>`, 'mapModal');
  const cv = m.querySelector('#mini'), g = cv.getContext('2d');
  cv.width = W * 4; cv.height = H * 4;
  g.imageSmoothingEnabled = false; g.drawImage(miniCanvas, 0, 0);
  g.font = 'bold 9px sans-serif'; g.textAlign = 'center';
  for (const r of REGIONS) { if (r.id === 'coco') continue; g.fillStyle = 'rgba(0,0,0,.55)'; g.fillText(r.name, r.x * 4 + 1, r.y * 4 + 1); g.fillStyle = '#fff'; g.fillText(r.name, r.x * 4, r.y * 4); }
  const dot = (x, y, c, rr = 5) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, rr + 1.5, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); };
  for (const p of unlockedProcs()) {
    const st = S.procs[p.id];
    if (st.status === 'pendente' && !st.visited) dot(p.site.x * 4, p.site.y * 4, '#f2c230');
    const c = compOf(p); if (c && plantedCount(p) < c.n) dot(p.plots.x * 4 + 8, p.plots.y * 4, '#3fbf5a');
  }
  mundoMapMarkers(dot);
  if (unlockedProcs().some(p => S.procs[p.id].status === 'pendente')) dot(47 * 4, 18 * 4, '#2a6ad8');
  dot(P.x / TILE * 4, P.y / TILE * 4, '#ff4f9a', 6);
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
    let best = null, bd = 1e9; for (const rg of REGIONS) { const d = dist(x, y, rg.x, rg.y); if (d < bd) { bd = d; best = rg; } }
    if (best && bd < 10) { closeModal(); travelTo(best.x * TILE + 8, best.y * TILE + 8, best); }
  });
  m.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { const r = regionById(b.dataset.r); closeModal(); travelTo(r.x * TILE + 8, r.y * TILE + 8, r); }));
}
function travelTo(x, y) {
  const f = $('#fade'); f.classList.add('on');
  setTimeout(() => {
    const p = nearestWalkable(x, y); P.x = p.x; P.y = p.y; P.dir = 'down';
    curRegion = null; save();
    setTimeout(() => f.classList.remove('on'), 120);
  }, 380);
}

// =====================================================================
//  Interações no mundo
// =====================================================================
function interactables() {
  const out = [];
  out.push({ x: 47 * TILE, y: 18 * TILE + 4, label: 'Processos', icon: '🏛️', fn: openSema });
  for (const n of NPCS) out.push({ x: n.x * TILE + 8, y: n.y * TILE + 12, label: 'Conversar', icon: '💬', npc: n, fn: () => talkTo(n) });
  for (const p of unlockedProcs()) {
    const st = S.procs[p.id];
    if (st.status === 'pendente' && !st.visited) out.push({ x: p.site.x * TILE + 8, y: p.site.y * TILE + 12, label: 'Vistoriar', icon: '🔎', fn: () => doVistoria(p) });
    const c = compOf(p);
    if (c && !st.archived) for (let i = 0; i < c.n; i++) if (!st.planted[i]) { const pp = plotPos(p, i); out.push({ x: pp.x, y: pp.y, label: 'Plantar', icon: '🌱', fn: () => openPlantio(p, i) }); }
  }
  mundoInteractables(out);
  return out;
}
function talkTo(n) {
  const k = S.talked[n.id] || 0;
  S.talked[n.id] = k + 1;
  const lines = n.lines.map(t => ({ who: n, text: t }));
  say(lines, () => { if (n.quiz && !S.quizDone) openQuiz(n); save(); });
}
let target = null;
function onAction() {
  if (!$('#title').hidden) return;
  if (!$('#dialog').hidden) { nextLine(); return; }
  if (!$('#modalWrap').hidden) return;
  if (target) target.fn();
}

// =====================================================================
//  Partículas
// =====================================================================
const parts = [];
function spawnLeaves(pos) { for (let i = 0; i < 14; i++) parts.push({ x: pos.x, y: pos.y - 6, vx: (Math.random() - 0.5) * 50, vy: -Math.random() * 60 - 20, life: 1, c: ['#6ac25a', '#4fbf5a', '#f2c230', '#9adf7a'][i % 4] }); }

// =====================================================================
//  Loop principal
// =====================================================================
const cv = $('#game'), ctx = cv.getContext('2d');
let VW = 0, VH = 0, DPR = 1, SCALE = 2, camX = 0, camY = 0, last = 0, time = 0, curRegion = null, regionCheck = 0, nearNpc = null;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 3);
  VW = innerWidth; VH = innerHeight;
  cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
  SCALE = clamp(Math.min(VW, VH) / (12 * TILE), 2, 4);
  SCALE = Math.round(SCALE * 2) / 2;
}
addEventListener('resize', resize);

function update(dt) {
  time += dt;
  let mx = 0, my = 0;
  if (!uiBusy()) {
    if (keys['arrowleft'] || keys['a']) mx -= 1;
    if (keys['arrowright'] || keys['d']) mx += 1;
    if (keys['arrowup'] || keys['w']) my -= 1;
    if (keys['arrowdown'] || keys['s']) my += 1;
    if (joy.active) { mx = joy.dx; my = joy.dy; }
  }
  let m = Math.hypot(mx, my);
  if (m > 0.15) {
    if (m > 1) { mx /= m; my /= m; m = 1; }
    const sp = SPEED * (joy.active ? clamp(m * 1.25, 0.4, 1) : (keys['shift'] ? 1.8 : 1)) * dt;
    const nx = P.x + mx * sp, ny = P.y + my * sp;
    if (canStand(nx, P.y)) P.x = nx;
    if (canStand(P.x, ny)) P.y = ny;
    P.dir = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? 'right' : 'left') : (my > 0 ? 'down' : 'up');
    P.moving = true; P.animT += dt * (6 + m * 4);
    P.frame = [0, 1, 0, 2][Math.floor(P.animT) % 4];
  } else { P.moving = false; P.frame = 0; }

  // alvo de interação
  target = null; let bd = 22; nearNpc = null;
  for (const it of interactables()) {
    const d = dist(P.x, P.y, it.x, it.y);
    if (d < bd) { bd = d; target = it; }
  }
  for (const n of NPCS) if (dist(P.x, P.y, n.x * TILE + 8, n.y * TILE + 12) < 60) nearNpc = n;
  $('#btnA').classList.toggle('ready', !!target);
  const kt = target ? `Espaço → ${target.icon} ${target.label}${target.npc ? ' • ' + target.npc.name : ''}` : '';
  if ($('#keyTarget').textContent !== kt) $('#keyTarget').textContent = kt;

  // região atual
  regionCheck -= dt;
  if (regionCheck <= 0) {
    regionCheck = 0.5;
    const tx = P.x / TILE, ty = P.y / TILE;
    let r = null, rd = 1e9;
    for (const rg of REGIONS) { const d = dist(tx, ty, rg.x, rg.y); if (d < rg.r && d < rd) { rd = d; r = rg; } }
    if (r && r !== curRegion) regionToast(r);
    if (r) curRegion = r;
    if (Math.random() < 0.05) save();
  }
  if ($('#title').hidden) mundoUpdate(dt);
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 120 * dt; p.life -= dt; if (p.life <= 0) parts.splice(i, 1); }
}

function render() {
  const vw = VW / SCALE, vh = VH / SCALE;
  camX = clamp(P.x - vw / 2, 0, W * TILE - vw); camY = clamp(P.y - 12 - vh / 2, 0, H * TILE - vh);
  camX = Math.round(camX * SCALE) / SCALE; camY = Math.round(camY * SCALE) / SCALE;
  const k = DPR * SCALE;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#2a7fc4'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.setTransform(k, 0, 0, k, -camX * k, -camY * k);
  ctx.imageSmoothingEnabled = false;
  const sx = Math.max(0, Math.floor(camX)), sy = Math.max(0, Math.floor(camY));
  const sw = Math.min(W * TILE - sx, Math.ceil(vw) + 2), sh = Math.min(H * TILE - sy, Math.ceil(vh) + 2);
  ctx.drawImage(ground, sx, sy, sw, sh, sx, sy, sw, sh);

  // brilho da água
  const tx0 = Math.floor(camX / TILE), ty0 = Math.floor(camY / TILE), tx1 = Math.ceil((camX + vw) / TILE), ty1 = Math.ceil((camY + vh) / TILE);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const t = tiles[y * W + x];
    if (t === T.OCEAN || t === T.SHALLOW || t === T.RIVER || t === T.LAKE) {
      const h = hash2(x, y), ph = (time * 0.6 + h * 6) % 3;
      if (ph < 1) ctx.fillRect(x * TILE + Math.floor(h * 10) + Math.floor(ph * 3), y * TILE + Math.floor(h * 97) % 14, 3, 1);
    }
  }

  drawGroundMundo(tx0, ty0, tx1, ty1);

  // covas de plantio (no chão)
  const draws = [];
  for (const p of unlockedProcs()) {
    const c = compOf(p), st = S.procs[p.id];
    if (!c || st.archived) continue;
    for (let i = 0; i < c.n; i++) {
      const pp = plotPos(p, i);
      if (st.planted[i]) {
        const spr = plantDraw(st.planted[i]);
        draws.push({ y: pp.y, f: () => ctx.drawImage(spr, Math.round(pp.x - spr.width / 2), Math.round(pp.y - spr.height + 2)) });
      } else {
        ctx.drawImage(DECOR.cova, pp.x - 6, pp.y - 6);
        const a = 0.35 + Math.sin(time * 4) * 0.25;
        ctx.strokeStyle = `rgba(120,255,140,${a})`; ctx.lineWidth = 1; ctx.strokeRect(pp.x - 7.5, pp.y - 7.5, 15, 11);
      }
    }
    // placa da compensação
    const px = p.plots.x * TILE - 6, py = p.plots.y * TILE + 4;
    draws.push({ y: py, f: () => { R(ctx, px, py - 14, 2, 14, '#6a4a2a'); R(ctx, px - 7, py - 20, 16, 9, '#c9a26a'); R(ctx, px - 5, py - 18, 12, 1, '#6a4a2a'); R(ctx, px - 5, py - 15, 9, 1, '#6a4a2a'); } });
  }

  const inView = (x, y, w, h) => x + w > camX - 8 && x < camX + vw + 8 && y + h > camY - 8 && y < camY + vh + 60;
  for (const d of decos) if (inView(d.x, d.y, d.spr.width, d.spr.height)) draws.push({ y: d.by, f: () => ctx.drawImage(decoSprite(d), d.x, d.y) });
  mundoDraws(draws, inView);
  for (const o of objects) {
    if (o.turbine) {
      if (!inView(o.x - 14, o.y - 48, 28, 48)) continue;
      draws.push({ y: o.y, f: () => drawTurbine(o) });
    } else if (inView(o.x, o.y, o.spr.width, o.spr.height)) draws.push({ y: o.y + o.spr.height, f: () => ctx.drawImage(o.spr, o.x, o.y) });
  }
  for (const n of NPCS) {
    const x = n.x * TILE + 8, y = n.y * TILE + 12;
    if (!inView(x - 8, y - 24, 16, 24)) continue;
    if (!n.spr) n.spr = buildPerson(n.look);
    draws.push({ y, f: () => { shadow(x, y); ctx.drawImage(n.spr[Math.floor(time * 1.6 + n.x) % 2], x - 8, y - 23); } });
  }
  draws.push({ y: P.y, f: () => { shadow(P.x, P.y); ctx.drawImage(MARINA[P.dir][P.frame], Math.round(P.x * 2) / 2 - 8, Math.round(P.y * 2) / 2 - 23.5 - (P.moving && P.frame ? 0.5 : 0), 16, 24); } });
  draws.sort((a, b) => a.y - b.y);
  for (const d of draws) d.f();

  // marcadores de vistoria
  for (const p of unlockedProcs()) {
    const st = S.procs[p.id];
    if (st.status !== 'pendente' || st.visited) continue;
    const x = p.site.x * TILE + 8, y = p.site.y * TILE + 12, b = Math.sin(time * 4) * 2;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x - 4, y - 1, 8, 2);
    disc(ctx, x, y - 16 + b, 5, '#e2553a'); disc(ctx, x, y - 16 + b, 3, '#f2c230');
    R(ctx, x - 1, y - 11 + b, 2, 4, '#e2553a'); R(ctx, x - 1, y - 18 + b, 2, 3, '#3a2a1a'); R(ctx, x - 1, y - 14 + b, 2, 1, '#3a2a1a');
  }
  // seta para a SEMA quando há processos
  if (unlockedProcs().some(p => S.procs[p.id].status === 'pendente')) {
    const x = 47 * TILE, y = 18 * TILE - 56 + Math.sin(time * 4) * 2;
    R(ctx, x - 1, y - 6, 2, 6, '#2a6ad8'); R(ctx, x - 3, y, 6, 1, '#2a6ad8'); R(ctx, x - 2, y + 1, 4, 1, '#2a6ad8'); R(ctx, x - 1, y + 2, 2, 1, '#2a6ad8');
  }
  drawOverMundo(inView);
  for (const p of parts) { ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, p.life); ctx.fillRect(p.x, p.y, 2, 2); }
  ctx.globalAlpha = 1;

  // textos em espaço de tela
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawScreenMundo();
  const toScreen = (wx, wy) => [(wx - camX) * SCALE, (wy - camY) * SCALE];
  ctx.textAlign = 'center'; ctx.font = '600 12px system-ui, sans-serif';
  if (nearNpc && (!target || !target.npc || target.npc !== nearNpc)) {
    const [x, y] = toScreen(nearNpc.x * TILE + 8, nearNpc.y * TILE - 14);
    label(nearNpc.name, x, y, 'rgba(0,0,0,.55)');
  }
  if (target && !uiBusy()) {
    const [x, y] = toScreen(target.x, target.y - 30);
    label((inputMode === 'desk' ? '[Espaço] ' : 'Ⓐ ') + `${target.icon} ${target.label}` + (target.npc ? ` • ${target.npc.name}` : ''), x, y, 'rgba(30,90,50,.92)');
  }
}
function label(txt, x, y, bg) {
  const w = ctx.measureText(txt).width + 16;
  ctx.fillStyle = bg; roundRect(x - w / 2, y - 12, w, 22, 11); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText(txt, x, y + 3.5);
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function shadow(x, y) { ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(Math.round(x - 5), Math.round(y - 1), 10, 2); ctx.fillRect(Math.round(x - 4), Math.round(y - 2), 8, 4); }
function drawTurbine(o) {
  const x = o.x, y = o.y, top = y - 44;
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x - 3, y - 1, 8, 2);
  R(ctx, x - 1, top, 3, 44, '#eef1f3'); R(ctx, x + 1, top, 1, 44, '#c8ced3');
  R(ctx, x - 2, top - 2, 5, 4, '#dfe4e8');
  const a = time * 2.2 + o.phase;
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.beginPath();
  for (let i = 0; i < 3; i++) { const an = a + i * Math.PI * 2 / 3; ctx.moveTo(x + 0.5, top); ctx.lineTo(x + 0.5 + Math.cos(an) * 16, top + Math.sin(an) * 16); }
  ctx.stroke();
  disc(ctx, x, top, 1, '#9aa4ac');
}

function loop(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  if (S) { update(dt); render(); }
  requestAnimationFrame(loop);
}

// =====================================================================
//  Início
// =====================================================================
function startGame(fresh) {
  if (fresh || !S) S = newState();
  P.x = S.player.x; P.y = S.player.y;
  const p = nearestWalkable(P.x, P.y); P.x = p.x; P.y = p.y;
  $('#title').hidden = true; $('#hud').hidden = false; $('#controls').hidden = false;
  msgQ.length = 0; rebuildFireSet();
  if (S.introDone) mostrarAusencia(progressoAusencia());
  else { S.lastSeen = Date.now(); S.season = estacaoId(); }
  updateHUD();
  if (!S.introDone) {
    S.introDone = true; save();
    const chefe = NPCS.find(n => n.id === 'chefe');
    say([
      { who: 'marina', text: 'Bom dia, Ceará! ☀️ Hoje começa minha missão como analista ambiental na SEMA.' },
      { who: chefe, text: 'Marina! Seja bem-vinda. Tem processos de licenciamento esperando seu parecer na mesa da sede, logo ali na porta.' },
      { who: chefe, text: 'Você decide: deferir, indeferir ou pedir ajustes. Se liberar uma obra, a compensação ambiental fica com você: plantar mudas nativas no local.' },
      { who: chefe, text: 'Antes de assinar, vale fazer a vistoria em campo (os 📍 no mapa). O 📋 mostra sua agenda e o 🗺️ leva você de viatura pelo estado.' },
      { who: chefe, text: `E fique de olho no tempo: aqui as estações seguem o calendário de verdade. Agora estamos em ${estacao().icon} ${estacao().nome}.${estacao().risco >= 0.8 ? ' É época de queimadas: quando aparecer 🔥 na agenda, corra!' : ''}` },
      { who: 'marina', text: 'Bora cuidar do Ceará! 🌵💚' },
    ], () => toast(inputMode === 'touch' ? 'Arraste à esquerda para andar • toque em <b>A</b> para interagir' : 'Setas/WASD para andar • Espaço/E para interagir • M abre o mapa', 5000));
  }
}
function resetGame() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } S = newState(); startGame(false); }

function init() {
  setInputMode(matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 1 && !matchMedia('(pointer: fine)').matches ? 'touch' : 'desk');
  DECOR = buildDecor();
  MARINA = buildMarina();
  genMap();
  buildMini();
  resize();
  setupTouch();
  $('#titlePortrait').innerHTML = MARINA_PHOTO;
  const saved = load();
  if (saved) { $('#btnContinue').hidden = false; $('#btnStart').textContent = 'Novo jogo'; $('#btnStart').classList.add('ghost'); }
  $('#btnStart').onclick = () => { unlockAudio(); if (saved && !confirmNew()) return; S = newState(); startGame(false); };
  $('#btnContinue').onclick = () => { unlockAudio(); S = saved; startGame(false); };
  $('#btnAgenda').onclick = () => { if (!uiBusy()) openAgenda(); };
  $('#btnMap').onclick = () => { if (!uiBusy()) openMap(); };
  $('#btnMenu').onclick = () => { if (!uiBusy()) openMenu(); };
  $('#season').onclick = () => { if (!uiBusy()) openEstacao(); };
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }
  addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  addEventListener('pagehide', save);
  $('#modalWrap').addEventListener('click', e => { if (e.target.id === 'modalWrap') closeModal(); });
  requestAnimationFrame(loop);
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
}
let confirmArmed = false;
function confirmNew() {
  if (confirmArmed) return true;
  confirmArmed = true; $('#btnStart').textContent = 'Tem certeza? Toque de novo';
  setTimeout(() => { confirmArmed = false; $('#btnStart').textContent = 'Novo jogo'; $('#btnStart').classList.add('ghost'); }, 3000);
  return false;
}
init();
