// =====================================================================
//  Sprites em pixel art desenhados por código (sem imagens externas).
//  1 pixel de arte = 1 unidade do mundo. Tile = 16.
// =====================================================================

const TILE = 16;

function mkCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  draw(g, w, h);
  return c;
}
function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function disc(g, cx, cy, r, c) {
  g.fillStyle = c;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.round(Math.sqrt(r * r - dy * dy));
    g.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
  }
}

// ---------------------------------------------------------------------
//  MARINA (alta resolução: 32x48, desenhada na metade do tamanho no mundo)
//  Cabelo longo castanho-escuro com mechas, olhos castanhos sorridentes,
//  sorriso aberto, blusa creme estampada (azul, amarelo, verde), colar prateado.
// ---------------------------------------------------------------------
const MH = {
  H: '#24150f', h: '#3a2219', L: '#5e3b2a', l: '#7d5039',
  S: '#efbf9b', s: '#dda580', t: '#c98a66', W: '#ffffff', E: '#24120a', B: '#7a4628', K: '#140a05',
  R: '#d0505c', r: '#e9858c', P: '#f6a596',
  C: '#f7ecd2', c: '#e6d4ae', Y: '#f2c230', U: '#2a5ba8', G: '#5fa84a', O: '#c9a24a',
  N: '#f4f8fa', n: '#aeb9c2', J: '#4a6a98', j: '#38557f', F: '#8a5232', f: '#5e3420',
};
function hd(g) {
  return {
    sp: (y, x0, x1, c) => R(g, x0, y, x1 - x0 + 1, 1, c),
    px: (x, y, c) => R(g, x, y, 1, 1, c),
    rect: (x0, y0, x1, y1, c) => R(g, x0, y0, x1 - x0 + 1, y1 - y0 + 1, c),
  };
}
function hdLegsFront(g, frame) {
  const { sp, px, rect } = hd(g);
  const lL = frame === 1 ? 1 : 0, rL = frame === 2 ? 1 : 0;
  rect(11, 39, 15, 46 - lL, MH.J); rect(16, 39, 20, 46 - rL, MH.j);
  px(15, 40, MH.j);
  sp(47 - lL, 10, 15, MH.F); sp(47 - rL, 16, 21, MH.F);
  px(10, 47 - lL, MH.f); px(21, 47 - rL, MH.f);
}
function hdBlouseFront(g, frame) {
  const { sp, px, rect } = hd(g);
  const aL = frame === 1 ? -1 : 0, aR = frame === 2 ? -1 : 0;
  // braços (atrás das mangas)
  rect(6, 28 + aL, 8, 36 + aL, MH.S); rect(6, 37 + aL, 7, 37 + aL, MH.S); rect(8, 28 + aL, 8, 36 + aL, MH.s);
  rect(23, 28 + aR, 25, 36 + aR, MH.S); rect(24, 37 + aR, 25, 37 + aR, MH.S); rect(23, 28 + aR, 23, 36 + aR, MH.s);
  // tronco
  sp(22, 10, 21, MH.C); sp(23, 8, 23, MH.C);
  rect(9, 24, 22, 33, MH.C); rect(10, 34, 21, 38, MH.C);
  sp(38, 10, 21, MH.c); rect(21, 25, 22, 33, MH.c);
  // mangas bufantes
  rect(5, 23 + aL, 8, 27 + aL, MH.C); sp(28 + aL, 5, 8, MH.c);
  rect(23, 23 + aR, 26, 27 + aR, MH.C); sp(28 + aR, 23, 26, MH.c);
  px(6, 24 + aL, MH.U); px(7, 25 + aL, MH.Y); px(5, 26 + aL, MH.G);
  px(24, 24 + aR, MH.Y); px(25, 25 + aR, MH.U); px(26, 26 + aR, MH.G);
  // estampa
  sp(26, 10, 12, MH.U); sp(27, 11, 14, MH.U); sp(28, 13, 15, MH.U);
  sp(30, 9, 11, MH.Y); sp(31, 10, 13, MH.Y); sp(32, 12, 15, MH.Y);
  sp(25, 18, 20, MH.G); sp(26, 17, 21, MH.G); sp(27, 18, 20, MH.G); px(19, 28, MH.G);
  sp(31, 18, 20, MH.U); sp(32, 19, 21, MH.U); px(21, 33, MH.U);
  px(16, 27, MH.O); px(17, 28, MH.O); px(18, 29, MH.O); px(14, 34, MH.O); px(15, 35, MH.O);
  sp(36, 11, 13, MH.G); sp(35, 17, 19, MH.Y); px(20, 37, MH.U); px(12, 29, MH.O);
}
function marinaDownHD(g, frame) {
  const { sp, px, rect } = hd(g);
  // cabelo de trás, longo, com pontas onduladas
  sp(0, 11, 20, MH.H); sp(1, 9, 22, MH.H); sp(2, 7, 24, MH.H); sp(3, 6, 25, MH.H); sp(4, 5, 26, MH.H);
  rect(4, 5, 27, 30, MH.H);
  sp(31, 4, 9, MH.H); sp(31, 22, 27, MH.H); sp(32, 5, 8, MH.H); sp(32, 23, 26, MH.H); px(6, 33, MH.H); px(25, 33, MH.H);
  rect(5, 12, 5, 28, MH.h); rect(26, 12, 26, 28, MH.h);
  hdLegsFront(g, frame);
  hdBlouseFront(g, frame);
  // pescoço, decote em V e colar
  rect(14, 19, 17, 21, MH.S); px(14, 21, MH.s); px(17, 21, MH.s);
  sp(22, 13, 18, MH.S); sp(23, 14, 17, MH.S); sp(24, 15, 16, MH.S);
  px(13, 22, MH.N); px(18, 22, MH.N); px(14, 23, MH.N); px(17, 23, MH.N); sp(24, 15, 16, MH.N); px(15, 25, MH.n);
  // rosto
  sp(7, 12, 19, MH.S); sp(8, 10, 21, MH.S); rect(9, 9, 22, 16, MH.S);
  sp(17, 9, 22, MH.S); sp(18, 10, 21, MH.S); sp(19, 11, 20, MH.S); sp(20, 13, 18, MH.S);
  rect(9, 14, 9, 17, MH.s); rect(22, 14, 22, 17, MH.s); px(10, 18, MH.s); px(21, 18, MH.s); px(12, 20, MH.s); px(19, 20, MH.s);
  // franja com risca lateral, varrida para o lado
  sp(5, 6, 25, MH.H); sp(6, 6, 25, MH.H);
  sp(7, 6, 11, MH.H); sp(7, 13, 25, MH.H);
  sp(8, 6, 9, MH.H); sp(8, 16, 25, MH.H);
  sp(9, 6, 8, MH.H); sp(9, 19, 25, MH.H);
  sp(10, 21, 23, MH.H); rect(4, 10, 8, 20, MH.H); rect(23, 10, 27, 20, MH.H);
  // brilho do cabelo
  sp(1, 12, 15, MH.L); sp(2, 10, 13, MH.L); px(9, 3, MH.L); px(8, 4, MH.l); px(13, 1, MH.l);
  sp(6, 15, 19, MH.h); sp(7, 17, 20, MH.L); sp(8, 19, 21, MH.L); px(22, 9, MH.L);
  rect(7, 11, 7, 19, MH.h); rect(24, 11, 24, 19, MH.h);
  // sobrancelhas
  sp(10, 10, 13, MH.H); px(9, 11, MH.h); sp(11, 18, 20, MH.H); px(21, 11, MH.H);
  // olhos sorridentes com cílios
  sp(12, 10, 13, MH.K); px(9, 12, MH.K); sp(12, 18, 21, MH.K); px(22, 12, MH.K);
  px(10, 13, MH.W); px(11, 13, MH.B); px(12, 13, MH.E); px(13, 13, MH.W);
  px(18, 13, MH.W); px(19, 13, MH.E); px(20, 13, MH.B); px(21, 13, MH.W);
  px(11, 12, MH.W); px(19, 12, MH.W); // brilho no olhar
  sp(14, 11, 12, MH.s); sp(14, 19, 20, MH.s);
  // nariz
  px(16, 14, MH.s); px(16, 15, MH.s); sp(16, 15, 16, MH.t);
  // bochechas
  sp(15, 9, 11, MH.P); sp(15, 20, 22, MH.P); px(10, 16, MH.P); px(21, 16, MH.P);
  // sorriso aberto
  px(13, 16, MH.s); px(18, 16, MH.s);
  sp(17, 14, 17, MH.R); px(13, 17, MH.R); px(18, 17, MH.R);
  sp(18, 14, 17, MH.W); px(13, 18, MH.s); px(18, 18, MH.s);
  sp(19, 14, 17, MH.r);
  // mechas na frente dos ombros
  rect(8, 21, 10, 30, MH.H); rect(21, 21, 23, 30, MH.H);
  sp(31, 8, 9, MH.H); sp(31, 22, 23, MH.H); px(9, 32, MH.H); px(22, 32, MH.H);
  rect(9, 22, 9, 29, MH.L); rect(22, 22, 22, 29, MH.h);
}
function marinaUpHD(g, frame) {
  const { sp, px, rect } = hd(g);
  hdLegsFront(g, frame);
  hdBlouseFront(g, frame);
  sp(0, 11, 20, MH.H); sp(1, 9, 22, MH.H); sp(2, 7, 24, MH.H); sp(3, 6, 25, MH.H); sp(4, 5, 26, MH.H);
  rect(5, 5, 26, 33, MH.H);
  sp(34, 6, 10, MH.H); sp(34, 13, 18, MH.H); sp(34, 21, 25, MH.H);
  sp(35, 7, 9, MH.H); sp(35, 14, 17, MH.H); sp(35, 22, 24, MH.H);
  for (const x of [8, 12, 16, 20, 24]) rect(x, 6, x, 30, MH.h);
  rect(10, 8, 10, 26, MH.L); rect(18, 8, 18, 28, MH.L);
  sp(1, 12, 15, MH.L); sp(2, 10, 14, MH.L); sp(3, 9, 12, MH.l);
  const aL = frame === 1 ? -1 : 0, aR = frame === 2 ? -1 : 0;
  rect(4, 23 + aL, 6, 27 + aL, MH.C); rect(25, 23 + aR, 27, 27 + aR, MH.C);
  rect(4, 28 + aL, 6, 36 + aL, MH.S); rect(25, 28 + aR, 27, 36 + aR, MH.S);
  px(5, 24 + aL, MH.U); px(26, 25 + aR, MH.Y);
}
function marinaRightHD(g, frame) {
  const { sp, px, rect } = hd(g);
  // cabelo atrás
  sp(1, 12, 20, MH.H); sp(2, 10, 22, MH.H); sp(3, 9, 23, MH.H); rect(8, 4, 23, 9, MH.H);
  rect(7, 10, 17, 32, MH.H); sp(33, 8, 15, MH.H); sp(34, 9, 13, MH.H); px(10, 35, MH.H);
  rect(9, 12, 9, 30, MH.h); rect(13, 12, 13, 31, MH.h);
  // pernas
  if (frame === 0) { rect(13, 39, 18, 46, MH.J); rect(13, 39, 13, 46, MH.j); sp(47, 13, 20, MH.F); px(20, 47, MH.f); }
  else if (frame === 1) { rect(11, 39, 14, 46, MH.j); sp(47, 9, 14, MH.f); rect(16, 39, 19, 46, MH.J); sp(47, 17, 22, MH.F); }
  else { rect(13, 39, 17, 46, MH.j); sp(47, 13, 18, MH.f); rect(15, 39, 19, 45, MH.J); sp(46, 16, 21, MH.F); }
  // corpo
  sp(22, 13, 20, MH.C); rect(12, 23, 21, 33, MH.C); rect(13, 34, 21, 38, MH.C); sp(38, 13, 21, MH.c);
  rect(12, 23, 12, 33, MH.c);
  sp(26, 18, 20, MH.G); sp(27, 17, 21, MH.G); sp(30, 13, 15, MH.Y); sp(31, 14, 17, MH.Y); sp(33, 18, 21, MH.U); px(20, 35, MH.O); px(19, 36, MH.O);
  // cabelo caindo nas costas
  rect(10, 21, 13, 31, MH.H); rect(11, 22, 11, 30, MH.L); px(12, 32, MH.H);
  // pescoço e colar
  rect(17, 19, 19, 22, MH.S); px(17, 21, MH.s); sp(22, 18, 20, MH.N); px(20, 23, MH.n);
  // braço balançando
  const ax = frame === 1 ? 18 : frame === 2 ? 13 : 15;
  rect(ax, 23, ax + 3, 28, MH.C); px(ax + 1, 24, MH.U); px(ax + 2, 26, MH.Y); sp(28, ax, ax + 3, MH.c);
  rect(ax + 1, 29, ax + 3, 36, MH.S); rect(ax + 1, 29, ax + 1, 36, MH.s); sp(37, ax + 2, ax + 3, MH.S);
  // rosto de perfil
  rect(15, 8, 23, 17, MH.S); sp(18, 15, 22, MH.S); sp(19, 16, 21, MH.S); sp(20, 17, 20, MH.S);
  px(24, 13, MH.S); px(24, 14, MH.S); px(24, 15, MH.s);
  rect(15, 14, 16, 18, MH.s);
  // cabelo da frente, franja e lateral
  rect(13, 4, 23, 7, MH.H); sp(8, 17, 24, MH.H); sp(9, 20, 23, MH.H); px(23, 10, MH.H);
  rect(13, 8, 15, 19, MH.H); rect(14, 9, 14, 18, MH.h);
  sp(3, 14, 18, MH.L); sp(4, 17, 21, MH.L); sp(5, 20, 22, MH.L); px(22, 8, MH.L);
  // olho, sobrancelha, bochecha, sorriso
  sp(10, 20, 22, MH.H);
  sp(12, 20, 22, MH.K); px(23, 11, MH.K); px(21, 13, MH.E); px(22, 13, MH.B); px(21, 12, MH.W); sp(14, 21, 22, MH.s);
  sp(15, 19, 21, MH.P);
  px(21, 16, MH.s); sp(17, 22, 23, MH.R); px(23, 16, MH.R); px(22, 18, MH.s);
}
function buildMarina() {
  const frames = {};
  for (const dir of ['down', 'up', 'left', 'right']) {
    frames[dir] = [0, 1, 2].map(f => mkCanvas(32, 48, g => {
      if (dir === 'down') marinaDownHD(g, f);
      else if (dir === 'up') marinaUpHD(g, f);
      else if (dir === 'right') marinaRightHD(g, f);
      else { g.translate(32, 0); g.scale(-1, 1); marinaRightHD(g, f); }
    }));
  }
  return frames;
}

// NPC genérico (cabelo curto) com cores próprias
function buildPerson(look) {
  return [0, 1].map(f => mkCanvas(16, 24, g => {
    const y = f;
    R(g, 5, 18, 3, 4, '#4a4a5a'); R(g, 8, 18, 3, 4, '#3a3a4a');
    R(g, 5, 22, 3, 1, '#3a2a1a'); R(g, 8, 22, 3, 1, '#3a2a1a');
    R(g, 4, 11 + y, 8, 7 - y, look.shirt); R(g, 2, 12 + y, 2, 4, look.shirt); R(g, 12, 12 + y, 2, 4, look.shirt);
    R(g, 2, 16 + y, 2, 1, look.skin); R(g, 12, 16 + y, 2, 1, look.skin);
    R(g, 4, 3 + y, 8, 8, look.skin);
    R(g, 3, 1 + y, 10, 3, look.hair); R(g, 3, 4 + y, 1, 3, look.hair); R(g, 12, 4 + y, 1, 3, look.hair);
    R(g, 5, 6 + y, 2, 1, '#2a1a10'); R(g, 9, 6 + y, 2, 1, '#2a1a10');
    R(g, 6, 9 + y, 4, 1, '#8a3a3a');
  }));
}

// ---------------------------------------------------------------------
//  Retrato da Marina: foto em assets/marina.jpg
// ---------------------------------------------------------------------
const MARINA_PHOTO = '<img src="assets/marina.jpg" alt="Marina" class="photo">';

// Retrato simples de NPC (SVG) a partir das cores
function npcPortraitSVG(look) {
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="58" fill="#f1e4c6"/>
  <path d="M18 122 C20 100 36 92 60 92 C84 92 100 100 102 122Z" fill="${look.shirt}"/>
  <rect x="52" y="74" width="16" height="20" fill="${look.skin}"/>
  <ellipse cx="60" cy="54" rx="22" ry="25" fill="${look.skin}"/>
  <path d="M37 50 C36 28 48 22 60 22 C74 22 85 30 83 50 C80 38 70 34 60 34 C50 34 42 38 37 50Z" fill="${look.hair}"/>
  <circle cx="51" cy="53" r="2.6" fill="#2a1a10"/><circle cx="69" cy="53" r="2.6" fill="#2a1a10"/>
  <path d="M51 66 Q60 73 69 66" stroke="#7a2a2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// ---------------------------------------------------------------------
//  Vegetação e objetos do mapa
// ---------------------------------------------------------------------
function treeRound(trunk, c1, c2, c3, w = 16, h = 22) {
  return mkCanvas(w, h, g => {
    const cx = w >> 1;
    R(g, cx - 1, h - 8, 2, 8, trunk); R(g, cx - 2, h - 1, 4, 1, trunk);
    disc(g, cx, h - 13, 6, c1); disc(g, cx - 3, h - 11, 4, c1); disc(g, cx + 3, h - 11, 4, c1);
    disc(g, cx - 1, h - 15, 4, c2); disc(g, cx + 2, h - 12, 2, c2);
    R(g, cx - 3, h - 17, 2, 1, c3); R(g, cx + 1, h - 15, 1, 1, c3); R(g, cx - 4, h - 13, 1, 1, c3);
  });
}

function buildDecor() {
  const D = {};
  D.serra = [
    treeRound('#5a3a22', '#2f7a3a', '#3f9a48', '#6ac25a'),
    treeRound('#5a3a22', '#276b34', '#358a42', '#5ab04f'),
    treeRound('#4a2e1a', '#2a6a44', '#3a8a54', '#5ab070'),
  ];
  D.ipeRoxo = treeRound('#5a3a22', '#8e4fb0', '#a865cc', '#d49af0');
  D.ipeAmarelo = treeRound('#5a3a22', '#d9a21e', '#f2c230', '#ffe27a');
  D.pequi = treeRound('#6a4a2a', '#5a8a3a', '#6fa448', '#9ccc6a', 18, 20);
  // árvore da caatinga (galhos tortos, copa rala)
  D.caatinga = [0, 1, 2].map(v => mkCanvas(16, 18, g => {
    R(g, 7, 9, 2, 9, '#7a6a5a'); R(g, 4, 8, 3, 1, '#7a6a5a'); R(g, 9, 7, 3, 1, '#7a6a5a'); R(g, 3, 6, 1, 2, '#7a6a5a'); R(g, 12, 5, 1, 2, '#7a6a5a');
    const leaf = ['#8a9a4a', '#9aa85a', '#7a8a3a'][v];
    disc(g, 4, 5, 2, leaf); disc(g, 12, 4, 2, leaf); disc(g, 8, 4, 3, leaf);
    if (v === 1) { R(g, 6, 2, 1, 1, '#c8d07a'); R(g, 11, 3, 1, 1, '#c8d07a'); }
  }));
  // mandacaru
  D.mandacaru = mkCanvas(14, 22, g => {
    const c = '#3f8a4a', d = '#2f6a3a', l = '#6ab86a';
    R(g, 5, 2, 4, 20, c); R(g, 6, 2, 1, 20, l); R(g, 8, 2, 1, 20, d);
    R(g, 1, 7, 3, 7, c); R(g, 1, 12, 5, 3, c); R(g, 2, 7, 1, 6, l);
    R(g, 10, 4, 3, 7, c); R(g, 9, 10, 2, 3, c); R(g, 11, 4, 1, 6, l);
    R(g, 6, 1, 2, 1, '#f2f2d0'); R(g, 11, 3, 1, 1, '#f2f2d0');
  });
  // carnaúba
  D.carnauba = mkCanvas(20, 30, g => {
    R(g, 9, 9, 2, 21, '#8a7a62'); for (let y = 11; y < 30; y += 3) R(g, 9, y, 2, 1, '#6a5a48');
    const f = '#5a9a4a', f2 = '#7ab85a';
    for (let a = 0; a < 9; a++) {
      const ang = Math.PI + (a / 8) * Math.PI; // leque
      for (let r = 2; r < 9; r++) R(g, Math.round(10 + Math.cos(ang) * r), Math.round(8 + Math.sin(ang) * r * 0.8), 1, 1, a % 2 ? f : f2);
    }
    disc(g, 10, 8, 2, f);
  });
  // coqueiro
  D.coqueiro = mkCanvas(20, 28, g => {
    for (let y = 8; y < 28; y++) R(g, 9 + Math.round(Math.sin(y / 6) * 2), y, 2, 1, '#9a7a52');
    const f = '#3f9a3a';
    const fr = [[-8, 2], [-6, -3], [0, -5], [6, -3], [8, 2], [-4, 4], [4, 4]];
    for (const [dx, dy] of fr) for (let t = 0; t <= 1; t += 0.1) R(g, Math.round(10 + dx * t), Math.round(8 + dy * t + t * t * 3), 1, 1, f);
    R(g, 9, 8, 3, 2, '#6a4a2a');
  });
  // mangue com raízes-escora
  D.mangue = [0, 1].map(v => mkCanvas(18, 20, g => {
    const r = '#6a4a32';
    R(g, 8, 8, 2, 7, r);
    for (const [x0, x1] of [[8, 3], [9, 14], [8, 6], [9, 12]]) {
      for (let t = 0; t <= 1; t += 0.12) R(g, Math.round(x0 + (x1 - x0) * t), Math.round(13 + t * 6 - Math.sin(t * Math.PI) * 2), 1, 1, r);
    }
    disc(g, 9, 6, 6, v ? '#2c6b3f' : '#2f7a46'); disc(g, 7, 5, 3, '#3f8a54'); R(g, 6, 2, 2, 1, '#5aa86a');
  }));
  // monólito (Quixadá)
  D.monolito = [0, 1].map(v => mkCanvas(44, 52, g => {
    const base = v ? '#9a8f86' : '#a69a90', sh = '#7a706a', hi = '#c4bab0';
    g.fillStyle = base;
    for (let y = 0; y < 52; y++) {
      const t = y / 51;
      const u = Math.min(1, t * 1.35); const w = Math.round(Math.sqrt(1 - (1 - u) * (1 - u)) * (v ? 20 : 18) + (t > 0.85 ? 2 : 0));
      R(g, 22 - w, y, w * 2, 1, base);
      R(g, 22 + w - Math.max(2, Math.round(w * 0.35)), y, Math.max(2, Math.round(w * 0.35)), 1, sh);
      if (y > 6 && y < 40) R(g, 22 - w + 2, y, 2, 1, hi);
    }
    R(g, 18, 14, 1, 12, sh); R(g, 26, 22, 1, 14, sh); R(g, 12, 30, 1, 10, sh);
    R(g, 8, 49, 28, 3, '#8a9a4a');
  }));
  // casas / prédios de Fortaleza
  const palette = [['#e9d8b4', '#c2553a'], ['#d6e2ea', '#4a6a8a'], ['#f2e2a4', '#b5553a'], ['#e2c6d6', '#7a4a6a'], ['#cfe6c6', '#5a7a4a'], ['#ffffff', '#3a7aa8']];
  D.casas = palette.map(([wall, roof], i) => mkCanvas(30, 30, g => {
    const tall = i % 2 === 0;
    const top = tall ? 0 : 8;
    R(g, 1, top + 6, 28, 30 - top - 6, wall); R(g, 0, top, 30, 7, roof); R(g, 0, top + 6, 30, 1, '#00000033');
    for (let y = top + 10; y < 26; y += 6) for (let x = 4; x < 27; x += 7) { R(g, x, y, 4, 3, '#5a8ab0'); R(g, x, y, 4, 1, '#8ab8d8'); }
    R(g, 12, 25, 6, 5, '#6a4a2a');
  }));
  D.sema = mkCanvas(64, 48, g => {
    R(g, 2, 14, 60, 34, '#f4efe2'); R(g, 0, 6, 64, 9, '#2f7a46'); R(g, 0, 14, 64, 2, '#225a34');
    for (let x = 6; x < 60; x += 9) { R(g, x, 20, 6, 5, '#5a8ab0'); R(g, x, 20, 6, 1, '#9ac8e8'); R(g, x, 30, 6, 5, '#5a8ab0'); R(g, x, 30, 6, 1, '#9ac8e8'); }
    R(g, 26, 37, 12, 11, '#6a4a2a'); R(g, 31, 37, 1, 11, '#4a3020'); R(g, 28, 42, 1, 1, '#f2c230'); R(g, 35, 42, 1, 1, '#f2c230');
    R(g, 18, 0, 28, 8, '#ffffff'); R(g, 18, 0, 28, 1, '#2f7a46'); R(g, 18, 7, 28, 1, '#2f7a46');
    g.fillStyle = '#2f7a46'; g.font = 'bold 7px monospace'; g.textBaseline = 'top'; g.fillText('SEMA', 24, 0.5);
    disc(g, 6, 43, 4, '#3f9a48'); disc(g, 58, 43, 4, '#3f9a48');
  });
  D.ufc = mkCanvas(56, 40, g => {
    R(g, 2, 12, 52, 28, '#e8e2d2'); R(g, 0, 6, 56, 7, '#2a4a8a');
    for (let x = 5; x < 52; x += 8) { R(g, x, 17, 4, 12, '#c9c1ad'); }
    R(g, 22, 30, 12, 10, '#5a3a22');
    R(g, 14, 0, 28, 8, '#ffffff'); R(g, 14, 0, 28, 1, '#2a4a8a'); R(g, 14, 7, 28, 1, '#2a4a8a');
    g.fillStyle = '#2a4a8a'; g.font = 'bold 7px monospace'; g.textBaseline = 'top'; g.fillText('UFC', 22, 0.5);
  });
  D.rock = mkCanvas(10, 7, g => { R(g, 1, 2, 8, 5, '#9a9088'); R(g, 2, 1, 5, 1, '#b8aea4'); R(g, 6, 3, 3, 4, '#7a706a'); });
  D.tufo = mkCanvas(8, 5, g => { R(g, 1, 2, 1, 3, '#8a9a3a'); R(g, 3, 0, 1, 5, '#9aaa4a'); R(g, 5, 1, 1, 4, '#7a8a2a'); });
  D.flor = mkCanvas(6, 6, g => { R(g, 2, 3, 1, 3, '#4a8a3a'); R(g, 1, 1, 3, 2, '#f2c230'); R(g, 2, 0, 1, 1, '#f2c230'); });
  D.muda = mkCanvas(10, 12, g => {
    R(g, 1, 10, 8, 2, '#6a4a2a'); R(g, 4, 4, 1, 7, '#4a8a3a'); R(g, 1, 4, 3, 2, '#6ac25a'); R(g, 5, 2, 3, 2, '#6ac25a');
    R(g, 7, 3, 1, 8, '#c9a86a');
  });
  D.cova = mkCanvas(12, 8, g => { R(g, 1, 2, 10, 5, '#7a5a3a'); R(g, 3, 3, 6, 3, '#4a3220'); R(g, 1, 2, 10, 1, '#9a7a52'); });
  return D;
}

// Árvore plantada de uma espécie (cresce em 3 estágios)
const plantedCache = {};
function plantedSprite(speciesId, stage) {
  const key = speciesId + stage;
  if (plantedCache[key]) return plantedCache[key];
  const sp = SPECIES[speciesId];
  let c;
  if (stage === 0) c = DECOR.muda;
  else if (speciesId === 'carnauba') c = stage === 1 ? scaleSprite(DECOR.carnauba, 0.6) : DECOR.carnauba;
  else if (speciesId.startsWith('mangue')) c = stage === 1 ? scaleSprite(DECOR.mangue[0], 0.6) : DECOR.mangue[speciesId === 'manguePreto' ? 1 : 0];
  else {
    const t = treeRound('#5a3a22', shade(sp.color, -20), sp.color, shade(sp.color, 40));
    if (sp.fruit) { const g = t.getContext('2d'); R(g, 4, 9, 1, 1, sp.fruit); R(g, 10, 6, 1, 1, sp.fruit); R(g, 7, 11, 1, 1, sp.fruit); R(g, 12, 10, 1, 1, sp.fruit); }
    c = stage === 1 ? scaleSprite(t, 0.6) : t;
  }
  plantedCache[key] = c;
  return c;
}
function scaleSprite(src, s) {
  return mkCanvas(Math.ceil(src.width * s), Math.ceil(src.height * s), g => g.drawImage(src, 0, 0, src.width * s, src.height * s));
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
