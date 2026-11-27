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
//  Visual padrão (da foto): cabelo longo castanho-escuro com mechas, olhos
//  castanhos sorridentes, sorriso aberto, blusa creme estampada (azul,
//  amarelo, verde), colar prateado.
//  O visual escolhido no jogo (js/loja.js) troca as cores da paleta M e as
//  formas em LK: penteado, calça/saia/short, chapéu e óculos.
// ---------------------------------------------------------------------
const MH = {
  H: '#24150f', h: '#3a2219', L: '#5e3b2a', l: '#7d5039',
  S: '#ecb791', s: '#d69c78', t: '#c2835f', W: '#ffffff', E: '#24120a', B: '#6a3a20', K: '#140a05',
  R: '#cf5a5c', r: '#e88a86', P: '#f09a8a',
  C: '#f7ecd2', c: '#e6d4ae', Y: '#f2c230', U: '#2a5ba8', G: '#5fa84a', O: '#c9a24a',
  N: '#f4f8fa', n: '#aeb9c2', J: '#4a6a98', j: '#38557f', F: '#8a5232', f: '#5e3420',
};
const LOOK_PADRAO = { cabelo: 'solto', baixo: 'calca', cabeca: null, rosto: null, barba: false, boca: null, pal: {} };
let M = MH, LK = LOOK_PADRAO;   // paleta e formas em uso enquanto desenha
const preso = () => LK.cabelo === 'rabo' || LK.cabelo === 'coque' || LK.cabelo === 'curto' || LK.cabelo === 'cacheado';
// cachinhos: pontos de luz e sombra espalhados sobre o cabelo
function cachos(px, pts) { for (const [x, y] of pts) { px(x, y, M.L); px(x + 1, y + 1, M.h); } }

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
  if (LK.baixo === 'calca') { rect(11, 39, 15, 46 - lL, M.J); rect(16, 39, 20, 46 - rL, M.j); px(15, 40, M.j); }
  else { rect(12, 39, 14, 46 - lL, M.S); rect(17, 39, 19, 46 - rL, M.S); rect(14, 39, 14, 46 - lL, M.s); rect(19, 39, 19, 46 - rL, M.s); }
  sp(47 - lL, 10, 15, M.F); sp(47 - rL, 16, 21, M.F);
  px(10, 47 - lL, M.f); px(21, 47 - rL, M.f);
  if (LK.baixo === 'saia') { sp(39, 9, 22, M.J); sp(40, 9, 22, M.J); sp(41, 8, 23, M.J); sp(42, 8, 23, M.J); sp(43, 8, 23, M.j); px(12, 40, M.j); px(19, 41, M.j); px(15, 42, M.j); }
  else if (LK.baixo === 'short') { rect(11, 39, 15, 41, M.J); rect(16, 39, 20, 41, M.j); }
}
function hdBlouseFront(g, frame) {
  const { sp, px, rect } = hd(g);
  const aL = frame === 1 ? -1 : 0, aR = frame === 2 ? -1 : 0;
  // braços (atrás das mangas)
  rect(6, 28 + aL, 8, 36 + aL, M.S); rect(6, 37 + aL, 7, 37 + aL, M.S); rect(8, 28 + aL, 8, 36 + aL, M.s);
  rect(23, 28 + aR, 25, 36 + aR, M.S); rect(24, 37 + aR, 25, 37 + aR, M.S); rect(23, 28 + aR, 23, 36 + aR, M.s);
  // tronco
  sp(22, 10, 21, M.C); sp(23, 8, 23, M.C);
  rect(9, 24, 22, 33, M.C); rect(10, 34, 21, 38, M.C);
  sp(38, 10, 21, M.c); rect(21, 25, 22, 33, M.c);
  // mangas bufantes
  rect(5, 23 + aL, 8, 27 + aL, M.C); sp(28 + aL, 5, 8, M.c);
  rect(23, 23 + aR, 26, 27 + aR, M.C); sp(28 + aR, 23, 26, M.c);
  px(6, 24 + aL, M.U); px(7, 25 + aL, M.Y); px(5, 26 + aL, M.G);
  px(24, 24 + aR, M.Y); px(25, 25 + aR, M.U); px(26, 26 + aR, M.G);
  // estampa
  sp(26, 10, 12, M.U); sp(27, 11, 14, M.U); sp(28, 13, 15, M.U);
  sp(30, 9, 11, M.Y); sp(31, 10, 13, M.Y); sp(32, 12, 15, M.Y);
  sp(25, 18, 20, M.G); sp(26, 17, 21, M.G); sp(27, 18, 20, M.G); px(19, 28, M.G);
  sp(31, 18, 20, M.U); sp(32, 19, 21, M.U); px(21, 33, M.U);
  px(16, 27, M.O); px(17, 28, M.O); px(18, 29, M.O); px(14, 34, M.O); px(15, 35, M.O);
  sp(36, 11, 13, M.G); sp(35, 17, 19, M.Y); px(20, 37, M.U); px(12, 29, M.O);
}

// ----- acessórios (desenhados por último, por cima de tudo) -----
function hdAcessorios(g, dir) {
  const { sp, px, rect } = hd(g);
  const cab = LK.cabeca, ros = LK.rosto;
  if (cab) {
    const { a, b, c } = cab;
    if (cab.forma === 'chapeu') {
      if (dir === 'right') { rect(10, 0, 22, 3, a); sp(2, 10, 22, c); sp(4, 6, 29, a); sp(5, 7, 28, b); }
      else { rect(7, 0, 24, 3, a); sp(3, 5, 26, a); sp(2, 7, 24, c); sp(4, 2, 29, a); sp(5, 3, 28, b); px(12, 1, b); px(18, 0, b); }
      if (cab.enfeite) { if (dir === 'right') px(20, 2, cab.enfeite); else if (dir === 'down') { px(11, 2, cab.enfeite); px(16, 2, cab.enfeite); px(21, 2, cab.enfeite); } }
    } else if (cab.forma === 'bone') {
      if (dir === 'right') { sp(0, 12, 20, a); rect(9, 1, 22, 5, a); sp(6, 20, 28, b); sp(7, 22, 27, b); px(17, 3, c); }
      else if (dir === 'up') { sp(0, 11, 20, a); sp(1, 9, 22, a); rect(6, 2, 25, 6, a); sp(6, 13, 18, b); px(15, 5, c); px(16, 5, c); }
      else { sp(0, 11, 20, a); sp(1, 9, 22, a); rect(7, 2, 24, 5, a); px(15, 3, c); px(16, 3, c); sp(4, 14, 17, c); sp(6, 8, 23, b); sp(7, 10, 21, b); }
    } else if (cab.forma === 'flor') {
      const [fx, fy] = dir === 'right' ? [11, 6] : dir === 'up' ? [7, 7] : [25, 7];
      disc(g, fx, fy, 2, a); px(fx, fy, c); px(fx - 2, fy + 2, '#3f8a4a');
    } else if (cab.forma === 'tiara') {
      if (dir === 'right') { sp(4, 14, 22, a); px(18, 3, c); }
      else if (dir === 'up') sp(4, 6, 25, a);
      else { sp(4, 6, 25, a); px(10, 3, c); px(16, 3, c); px(21, 3, c); }
    }
  }
  if (ros && dir !== 'up') {
    const a = ros.a;
    if (ros.forma === 'sol') {
      if (dir === 'right') { rect(20, 12, 24, 14, a); sp(12, 15, 19, a); px(22, 12, '#7a8aa8'); }
      else { rect(9, 12, 14, 14, a); rect(17, 12, 22, 14, a); sp(12, 15, 16, a); px(10, 12, '#7a8aa8'); px(18, 12, '#7a8aa8'); }
    } else {
      if (dir === 'right') { sp(11, 20, 24, a); sp(15, 20, 24, a); rect(24, 12, 24, 14, a); rect(20, 12, 20, 14, a); sp(12, 15, 19, a); }
      else {
        sp(11, 9, 14, a); sp(15, 9, 14, a); rect(9, 12, 9, 14, a); rect(14, 12, 14, 14, a);
        sp(11, 17, 22, a); sp(15, 17, 22, a); rect(17, 12, 17, 14, a); rect(22, 12, 22, 14, a);
        sp(12, 15, 16, a);
      }
    }
  }
}

function marinaDownHD(g, frame) {
  const { sp, px, rect } = hd(g);
  const st = LK.cabelo;
  // cabelo de trás
  if (st === 'solto') {
    sp(0, 11, 20, M.H); sp(1, 9, 22, M.H); sp(2, 7, 24, M.H); sp(3, 6, 25, M.H); sp(4, 5, 26, M.H);
    rect(4, 5, 27, 30, M.H);
    sp(31, 4, 9, M.H); sp(31, 22, 27, M.H); sp(32, 5, 8, M.H); sp(32, 23, 26, M.H); px(6, 33, M.H); px(25, 33, M.H);
    rect(5, 12, 5, 28, M.h); rect(26, 12, 26, 28, M.h);
  } else if (st === 'chanel') {
    sp(0, 11, 20, M.H); sp(1, 9, 22, M.H); sp(2, 7, 24, M.H); sp(3, 6, 25, M.H); sp(4, 5, 26, M.H);
    rect(4, 5, 27, 20, M.H); sp(21, 5, 12, M.H); sp(21, 19, 26, M.H);
    rect(5, 12, 5, 19, M.h); rect(26, 12, 26, 19, M.h);
  } else {
    if (st === 'coque') { sp(0, 13, 18, M.H); sp(1, 12, 19, M.H); sp(2, 12, 19, M.h); sp(0, 14, 15, M.L); px(13, 1, M.L); sp(3, 8, 23, M.H); }
    else { sp(0, 11, 20, M.H); sp(1, 9, 22, M.H); sp(2, 7, 24, M.H); sp(3, 6, 25, M.H); }
    sp(4, 6, 25, M.H); rect(6, 5, 25, 9, M.H);
  }
  hdLegsFront(g, frame);
  hdBlouseFront(g, frame);
  // pescoço, decote em V e colar
  rect(14, 19, 17, 21, M.S); px(14, 21, M.s); px(17, 21, M.s);
  sp(22, 13, 18, M.S); sp(23, 14, 17, M.S); sp(24, 15, 16, M.S);
  px(13, 22, M.N); px(18, 22, M.N); px(14, 23, M.N); px(17, 23, M.N); sp(24, 15, 16, M.N); px(15, 25, M.n);
  // rosto (testa à mostra, como na foto)
  sp(5, 14, 17, M.S); sp(6, 12, 19, M.S); sp(7, 11, 20, M.S); sp(8, 10, 21, M.S); rect(9, 9, 22, 16, M.S);
  sp(17, 9, 22, M.S); sp(18, 10, 21, M.S); sp(19, 11, 20, M.S); sp(20, 13, 18, M.S);
  rect(9, 14, 9, 17, M.s); rect(22, 14, 22, 17, M.s); px(10, 18, M.s); px(21, 18, M.s); px(12, 20, M.s); px(19, 20, M.s);
  // cabelo repartido no meio, caindo em cortina dos dois lados do rosto
  if (st === 'cacheado') {
    // cabelo curto cacheado: volume em cima, linha do cabelo reta, laterais baixas
    sp(5, 7, 24, M.H); sp(6, 8, 23, M.H); px(9, 7, M.H); px(22, 7, M.H);
    cachos(px, [[9, 0], [13, 0], [17, 0], [8, 2], [11, 1], [15, 2], [19, 1], [22, 2], [10, 4], [14, 3], [18, 4], [21, 4], [12, 5], [16, 5], [20, 5], [7, 4], [24, 4]]);
  } else {
    const x0 = preso() ? 6 : 5, x1 = preso() ? 25 : 26;
    px(15, 4, M.h); px(16, 4, M.h);
    sp(5, x0, 14, M.H); sp(5, 17, x1, M.H);
    sp(6, x0, 12, M.H); sp(6, 19, x1, M.H);
    sp(7, x0, 10, M.H); sp(7, 21, x1, M.H);
    sp(8, x0, 9, M.H); sp(8, 22, x1, M.H);
    sp(9, x0, 9, M.H); sp(9, 22, x1, M.H);
    px(13, 5, M.L); px(11, 6, M.L); px(10, 7, M.L); px(8, 8, M.l);
    px(18, 5, M.h); px(20, 6, M.h); px(21, 7, M.h);
  }
  if (preso()) {
    // cabelo preso: laterais coladas na cabeça e orelhas aparecendo
    rect(7, 10, 8, 12, M.H); rect(23, 10, 24, 12, M.H);
    rect(8, 13, 8, 15, M.S); rect(23, 13, 23, 15, M.S); px(8, 15, M.s); px(23, 15, M.s);
    if (st === 'coque') { sp(3, 10, 13, M.L); px(9, 4, M.l); } else if (st !== 'cacheado') { sp(1, 12, 14, M.L); sp(2, 10, 12, M.L); px(9, 3, M.L); px(13, 1, M.l); }
    if (st === 'cacheado') { rect(7, 8, 7, 12, M.h); rect(24, 8, 24, 12, M.h); }   // degradê nas laterais
  } else {
    rect(4, 10, 8, 20, M.H); rect(23, 10, 27, 20, M.H);
    rect(9, 10, 9, 12, M.H); rect(22, 10, 22, 12, M.H);   // mechas emoldurando as têmporas
    // brilho do cabelo
    sp(1, 12, 14, M.L); sp(2, 10, 12, M.L); px(9, 3, M.L); px(8, 4, M.l); px(13, 1, M.l);
    rect(7, 11, 7, 19, M.h); px(7, 9, M.L); px(6, 10, M.L); px(5, 11, M.l); rect(24, 11, 24, 19, M.h); rect(5, 13, 5, 18, M.h);
    if (st === 'chanel') { px(4, 21, M.h); px(27, 21, M.h); sp(20, 5, 7, M.L); sp(20, 24, 26, M.h); }
  }
  // sobrancelhas grossas e escuras, levemente arqueadas
  sp(9, 11, 13, M.H); sp(10, 10, 13, M.H); px(14, 10, M.h);
  sp(9, 18, 20, M.H); sp(10, 18, 21, M.H); px(17, 10, M.h);
  // olhos sorridentes com cílios
  sp(12, 10, 13, M.K); px(9, 12, M.K); sp(12, 18, 21, M.K); px(22, 12, M.K);
  px(10, 13, M.W); px(11, 13, M.B); px(12, 13, M.E); px(13, 13, M.W);
  px(18, 13, M.W); px(19, 13, M.E); px(20, 13, M.B); px(21, 13, M.W);
  px(11, 12, M.W); px(19, 12, M.W); // brilho no olhar
  sp(14, 11, 12, M.s); sp(14, 19, 20, M.s);
  // nariz
  px(16, 14, M.s); px(16, 15, M.s); sp(16, 15, 16, M.t);
  // bochechas
  sp(15, 9, 11, M.P); sp(15, 20, 22, M.P); px(10, 16, M.P); px(21, 16, M.P);
  // sorriso aberto
  px(13, 16, M.s); px(18, 16, M.s);
  sp(17, 14, 17, M.R); px(13, 17, M.R); px(18, 17, M.R);
  sp(18, 14, 17, M.W); px(13, 18, M.s); px(18, 18, M.s);
  sp(19, 14, 17, M.r);
  if (LK.boca === 'fechada') {   // sorriso de boca fechada
    rect(13, 16, 18, 19, M.S); sp(18, 14, 17, M.t); px(13, 17, M.t); px(18, 17, M.t); sp(19, 14, 17, M.s);
  }
  if (LK.barba) {                // bigode, cavanhaque e barba rala no queixo
    sp(16, 13, 18, M.H); px(12, 17, M.h); px(19, 17, M.h);
    rect(14, 19, 17, 20, M.H); px(13, 19, M.h); px(18, 19, M.h); px(15, 21, M.h); px(16, 21, M.h);
    px(10, 18, M.s); px(21, 18, M.s); px(11, 19, M.h); px(20, 19, M.h);
  }
  // mechas na frente dos ombros
  if (st === 'solto') {
    rect(8, 21, 10, 30, M.H); rect(21, 21, 23, 30, M.H);
    sp(31, 8, 9, M.H); sp(31, 22, 23, M.H); px(9, 32, M.H); px(22, 32, M.H);
    rect(9, 22, 9, 29, M.L); rect(22, 22, 22, 29, M.h);
  } else if (st === 'rabo') {
    // rabo de cavalo caindo por cima do ombro, com elástico
    rect(21, 20, 23, 31, M.H); sp(32, 22, 23, M.H); px(22, 33, M.H);
    rect(22, 21, 22, 30, M.L); sp(20, 21, 23, M.R);
  }
  hdAcessorios(g, 'down');
}
function marinaUpHD(g, frame) {
  const { sp, px, rect } = hd(g);
  const st = LK.cabelo;
  hdLegsFront(g, frame);
  hdBlouseFront(g, frame);
  sp(0, 11, 20, M.H);
  sp(1, 9, 22, M.H); sp(2, 7, 24, M.H); sp(3, 6, 25, M.H); sp(4, 5, 26, M.H);
  if (st === 'solto') {
    rect(5, 5, 26, 33, M.H);
    sp(34, 6, 10, M.H); sp(34, 13, 18, M.H); sp(34, 21, 25, M.H);
    sp(35, 7, 9, M.H); sp(35, 14, 17, M.H); sp(35, 22, 24, M.H);
    for (const x of [8, 12, 16, 20, 24]) rect(x, 6, x, 30, M.h);
    rect(10, 8, 10, 26, M.L); rect(18, 8, 18, 28, M.L);
  } else if (st === 'chanel') {
    rect(5, 5, 26, 21, M.H); sp(22, 6, 25, M.H);
    for (const x of [8, 12, 16, 20, 24]) rect(x, 6, x, 20, M.h);
    rect(10, 8, 10, 19, M.L); rect(18, 8, 18, 20, M.L);
  } else {
    // nuca à mostra
    rect(13, 17, 18, 21, M.S); rect(13, 17, 13, 21, M.s);
    rect(6, 5, 25, 16, M.H); sp(17, 8, 23, M.H);
    for (const x of [9, 13, 18, 22]) rect(x, 6, x, 15, M.h);
    if (st === 'cacheado') cachos(px, [[8, 1], [12, 0], [16, 1], [20, 0], [7, 4], [11, 3], [15, 4], [19, 3], [23, 4], [9, 7], [13, 8], [17, 7], [21, 8], [10, 11], [15, 12], [20, 11]]);
    if (st === 'rabo') {
      rect(14, 12, 17, 31, M.H); sp(32, 15, 16, M.H);
      rect(15, 13, 15, 30, M.L); rect(17, 13, 17, 30, M.h); sp(11, 14, 17, M.R);
    } else if (st === 'coque') {
      disc(g, 16, 8, 4, M.h); disc(g, 16, 8, 3, M.H); px(14, 6, M.L); px(15, 6, M.L); px(14, 7, M.L);
    }
  }
  sp(1, 12, 15, M.L); sp(2, 10, 14, M.L); sp(3, 9, 12, M.l);
  const aL = frame === 1 ? -1 : 0, aR = frame === 2 ? -1 : 0;
  rect(4, 23 + aL, 6, 27 + aL, M.C); rect(25, 23 + aR, 27, 27 + aR, M.C);
  rect(4, 28 + aL, 6, 36 + aL, M.S); rect(25, 28 + aR, 27, 36 + aR, M.S);
  px(5, 24 + aL, M.U); px(26, 25 + aR, M.Y);
  hdAcessorios(g, 'up');
}
function marinaRightHD(g, frame) {
  const { sp, px, rect } = hd(g);
  const st = LK.cabelo;
  // cabelo atrás
  sp(1, 12, 20, M.H); sp(2, 10, 22, M.H); sp(3, 9, 23, M.H); rect(8, 4, 23, 9, M.H);
  if (st === 'solto') {
    rect(7, 10, 17, 32, M.H); sp(33, 8, 15, M.H); sp(34, 9, 13, M.H); px(10, 35, M.H);
    rect(9, 12, 9, 30, M.h); rect(13, 12, 13, 31, M.h);
  } else if (st === 'chanel') {
    rect(7, 10, 17, 20, M.H); sp(21, 8, 16, M.H);
    rect(9, 12, 9, 20, M.h); rect(13, 12, 13, 20, M.h);
  } else {
    rect(8, 10, 16, 15, M.H); rect(14, 16, 17, 21, M.S); rect(14, 16, 14, 21, M.s);
    if (st === 'rabo') { rect(5, 9, 8, 26, M.H); sp(27, 6, 7, M.H); rect(6, 10, 6, 25, M.L); rect(8, 8, 9, 9, M.R); }
    else if (st === 'coque') { disc(g, 8, 7, 4, M.h); disc(g, 8, 7, 3, M.H); px(7, 5, M.L); px(6, 6, M.L); }
  }
  // pernas
  const calca = LK.baixo === 'calca', a = calca ? M.J : M.S, b = calca ? M.j : M.s;
  if (frame === 0) { rect(13, 39, 18, 46, a); rect(13, 39, 13, 46, b); sp(47, 13, 20, M.F); px(20, 47, M.f); }
  else if (frame === 1) { rect(11, 39, 14, 46, b); sp(47, 9, 14, M.f); rect(16, 39, 19, 46, a); sp(47, 17, 22, M.F); }
  else { rect(13, 39, 17, 46, b); sp(47, 13, 18, M.f); rect(15, 39, 19, 45, a); sp(46, 16, 21, M.F); }
  if (LK.baixo === 'saia') { sp(39, 11, 21, M.J); sp(40, 11, 22, M.J); sp(41, 10, 22, M.J); sp(42, 10, 23, M.J); sp(43, 10, 23, M.j); px(14, 41, M.j); px(19, 40, M.j); }
  else if (LK.baixo === 'short') { rect(11, 39, 20, 41, M.J); rect(11, 39, 12, 41, M.j); }
  // corpo
  sp(22, 13, 20, M.C); rect(12, 23, 21, 33, M.C); rect(13, 34, 21, 38, M.C); sp(38, 13, 21, M.c);
  rect(12, 23, 12, 33, M.c);
  sp(26, 18, 20, M.G); sp(27, 17, 21, M.G); sp(30, 13, 15, M.Y); sp(31, 14, 17, M.Y); sp(33, 18, 21, M.U); px(20, 35, M.O); px(19, 36, M.O);
  // cabelo caindo nas costas
  if (st === 'solto') { rect(10, 21, 13, 31, M.H); rect(11, 22, 11, 30, M.L); px(12, 32, M.H); }
  // pescoço e colar
  rect(17, 19, 19, 22, M.S); px(17, 21, M.s); sp(22, 18, 20, M.N); px(20, 23, M.n);
  // braço balançando
  const ax = frame === 1 ? 18 : frame === 2 ? 13 : 15;
  rect(ax, 23, ax + 3, 28, M.C); px(ax + 1, 24, M.U); px(ax + 2, 26, M.Y); sp(28, ax, ax + 3, M.c);
  rect(ax + 1, 29, ax + 3, 36, M.S); rect(ax + 1, 29, ax + 1, 36, M.s); sp(37, ax + 2, ax + 3, M.S);
  // rosto de perfil
  rect(15, 8, 23, 17, M.S); sp(18, 15, 22, M.S); sp(19, 16, 21, M.S); sp(20, 17, 20, M.S);
  px(24, 13, M.S); px(24, 14, M.S); px(24, 15, M.s);
  rect(15, 14, 16, 18, M.s);
  // testa, cabelo da frente puxado para trás e lateral
  sp(6, 21, 22, M.S); sp(7, 19, 23, M.S);
  rect(13, 4, 20, 5, M.H); sp(6, 13, 20, M.H); sp(7, 13, 18, M.H);
  if (preso()) { rect(13, 8, 15, 11, M.H); rect(14, 9, 14, 10, M.h); px(16, 12, M.s); px(16, 13, M.s); }
  if (st === 'cacheado') cachos(px, [[12, 1], [16, 1], [20, 2], [10, 3], [14, 3], [18, 4], [9, 6], [12, 6], [15, 5], [10, 9], [13, 11]]);
  else { rect(13, 8, 15, 19, M.H); rect(14, 9, 14, 18, M.h); }
  sp(3, 14, 18, M.L); sp(4, 17, 20, M.L); px(19, 5, M.L);
  // olho, sobrancelha, bochecha, sorriso
  sp(9, 21, 22, M.H); sp(10, 20, 22, M.H);
  sp(12, 20, 22, M.K); px(23, 11, M.K); px(21, 13, M.E); px(22, 13, M.B); px(21, 12, M.W); sp(14, 21, 22, M.s);
  sp(15, 19, 21, M.P);
  px(21, 16, M.s); sp(17, 22, 23, M.R); px(23, 16, M.R); px(22, 18, M.s);
  if (LK.boca === 'fechada') { sp(17, 22, 23, M.t); px(23, 16, M.S); }
  if (LK.barba) { sp(15, 22, 23, M.H); px(24, 15, M.h); sp(19, 20, 22, M.H); sp(18, 21, 22, M.H); px(19, 20, M.h); px(18, 19, M.h); }
  hdAcessorios(g, 'right');
}
// look: { cabelo, baixo, cabeca, rosto, pal } (ver lookSpec em js/loja.js). Sem look = visual da foto.
function withLook(look, fn) {
  const pm = M, pl = LK;
  M = Object.assign({}, MH, (look && look.pal) || {});
  LK = Object.assign({}, LOOK_PADRAO, look || {});
  try { return fn(); } finally { M = pm; LK = pl; }
}
function marinaFrame(dir, f) {
  return mkCanvas(32, 48, g => {
    if (dir === 'down') marinaDownHD(g, f);
    else if (dir === 'up') marinaUpHD(g, f);
    else if (dir === 'right') marinaRightHD(g, f);
    else { g.translate(32, 0); g.scale(-1, 1); marinaRightHD(g, f); }
  });
}
function buildMarina(look) {
  return withLook(look, () => {
    const frames = {};
    for (const dir of ['down', 'up', 'left', 'right']) frames[dir] = [0, 1, 2].map(f => marinaFrame(dir, f));
    return frames;
  });
}
// uma pose parada, para as prévias da loja e do guarda-roupa
function marinaPose(look, dir = 'down') { return withLook(look, () => marinaFrame(dir, 0)); }

// Moradores: mesmo corpo em alta resolução da Marina, com pele, cabelo, roupa e
// acessórios próprios. look: { skin, hair, shirt, fem, estilo, calca, baixo, chapeu, oculos }
// Devolve 2 quadros (respirando); andando=true devolve 2 quadros de caminhada.
function buildPerson(look, andando) {
  const sk = look.skin, calca = look.calca || '#4a4e5a';
  const pal = {
    S: sk, s: shade(sk, -20), t: shade(sk, -34), H: look.hair, h: shade(look.hair, 16), L: shade(look.hair, 34), l: shade(look.hair, 50),
    C: look.shirt, c: shade(look.shirt, -26), U: look.shirt, Y: shade(look.shirt, 22), G: look.shirt, O: shade(look.shirt, 22),
    J: calca, j: shade(calca, -18), F: look.sapato || '#3a2a1a', f: shade(look.sapato || '#3a2a1a', -16),
  };
  if (!look.fem) Object.assign(pal, { R: shade(sk, -48), r: shade(sk, -30), P: sk, N: sk, n: sk });
  const acc = v => !v ? null : (typeof v === 'string' ? (itemById(v) || {}).acc || null : v);
  const spec = { cabelo: look.estilo || (look.fem ? 'chanel' : 'curto'), baixo: look.baixo || 'calca', cabeca: acc(look.chapeu), rosto: acc(look.oculos), pal };
  return withLook(spec, () => {
    if (andando) return [1, 2].map(f => marinaFrame('down', f));
    const a = marinaFrame('down', 0);
    const b = mkCanvas(32, 48, g => { g.drawImage(a, 0, 0, 32, 39, 0, 1, 32, 39); g.drawImage(a, 0, 39, 32, 9, 0, 39, 32, 9); });
    return [a, b];
  });
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
//  Vegetação e objetos do mapa, em alta resolução (2 px de arte por
//  unidade do mundo). mkHD marca o canvas; dW/dH dão o tamanho na tela.
// ---------------------------------------------------------------------
function mkHD(w, h, draw) { const c = mkCanvas(w, h, draw); c.hd = 2; return c; }
const dW = s => s.width / (s.hd || 1), dH = s => s.height / (s.hd || 1);
// triângulo preenchido em pixels (sem borrão de antialias)
function tri(g, x0, y0, x1, y1, x2, y2, c) {
  g.fillStyle = c;
  const ys = [y0, y1, y2], top = Math.floor(Math.min(...ys)), bot = Math.ceil(Math.max(...ys));
  const ed = [[x0, y0, x1, y1], [x1, y1, x2, y2], [x2, y2, x0, y0]];
  for (let y = top; y < bot; y++) {
    const yc = y + 0.5, xs = [];
    for (const [ax, ay, bx, by] of ed) if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) * (bx - ax) / (by - ay));
    if (xs.length >= 2) { const a = Math.round(Math.min(...xs)), b = Math.round(Math.max(...xs)); if (b > a) g.fillRect(a, y, b - a, 1); }
  }
}
function lancet(g, x, y, w, h, c) { R(g, x, y, w, h, c); tri(g, x, y + 1, x + w / 2, y - w * 0.7, x + w, y + 1, c); }
// linha de pixels com espessura
function pline(g, x0, y0, x1, y1, c, wd = 1) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) R(g, Math.round(x0 + (x1 - x0) * i / n - wd / 2), Math.round(y0 + (y1 - y0) * i / n), wd, 1, c);
}
function rngOf(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// árvore de copa redonda: aglomerado de bolas com luz vindo de cima à esquerda
function treeHD(trunk, c1, c2, c3, w = 32, h = 44, seed = 1, fruit = null) {
  return mkHD(w, h, g => {
    const rng = rngOf(seed * 9973 + 7), cx = w / 2, tr2 = shade(trunk, -22);
    R(g, cx - 2, h - 18, 4, 18, trunk); R(g, cx + 1, h - 18, 1, 18, tr2); R(g, cx - 4, h - 2, 8, 2, tr2);
    pline(g, cx - 1, h - 15, cx - 6, h - 21, trunk, 2); pline(g, cx + 1, h - 16, cx + 6, h - 23, trunk, 2);
    const cy = h - 26, rx = w * 0.24, ry = (h - 18) * 0.34, blobs = [[cx, cy, 8]];
    for (let i = 0; i < 9; i++) { const a = rng() * Math.PI * 2, r = 0.4 + rng() * 0.6; blobs.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r, 4.5 + rng() * 3]); }
    for (const [x, y, r] of blobs) disc(g, Math.round(x + 1), Math.round(y + 2), Math.round(r), c1);
    for (const [x, y, r] of blobs) disc(g, Math.round(x), Math.round(y), Math.round(r - 1), c2);
    for (const [x, y, r] of blobs) if (x <= cx + 2 && y <= cy + 2) disc(g, Math.round(x - 1.5), Math.round(y - 1.5), Math.max(1, Math.round(r * 0.42)), c3);
    for (let i = 0; i < 30; i++) { const a = rng() * Math.PI * 2, r = Math.sqrt(rng()); R(g, (cx + Math.cos(a) * (rx + 5) * r) | 0, (cy + Math.sin(a) * (ry + 5) * r) | 0, 1, 1, rng() < 0.5 ? c3 : c1); }
    if (fruit) for (let i = 0; i < 6; i++) { const a = rng() * Math.PI * 2, r = 0.3 + rng() * 0.6; R(g, (cx + Math.cos(a) * rx * r) | 0, (cy + 2 + Math.sin(a) * ry * r) | 0, 2, 2, fruit); }
  });
}
function treeRound(trunk, c1, c2, c3, w = 16, h = 22) { return treeHD(trunk, c1, c2, c3, w * 2, h * 2, (c2.charCodeAt(2) * 31 + c2.charCodeAt(4)) | 0); }

function buildDecor() {
  const D = {};
  D.serra = [
    treeHD('#5a3a22', '#245f30', '#2f7a3a', '#5ab04f', 32, 44, 1),
    treeHD('#5a3a22', '#21582c', '#2b6e36', '#4fa04a', 32, 44, 2),
    treeHD('#4a2e1a', '#1f5a3a', '#2a7a4c', '#5ab070', 32, 44, 3),
  ];
  D.ipeRoxo = treeHD('#5a3a22', '#6e3a90', '#9a55c0', '#d49af0', 32, 44, 4);
  D.ipeAmarelo = treeHD('#5a3a22', '#b5841a', '#e8b423', '#ffe27a', 32, 44, 5);
  D.pequi = treeHD('#6a4a2a', '#4a7a32', '#6a9a44', '#9ccc6a', 36, 40, 6, '#e8d44a');
  // árvore da Caatinga: galhos tortos e cinzentos, copa rala
  D.caatinga = [0, 1, 2].map(v => mkHD(32, 36, g => {
    const rng = rngOf(70 + v), bark = '#7e6e5e', bark2 = '#5e5044', leaf = ['#8a9a4a', '#9aa85a', '#7a8a3a'][v], leaf2 = ['#6e7e36', '#7e8c44', '#5e6e2a'][v];
    const ends = [];
    const branch = (x, y, ang, len, wd, depth) => {
      const x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
      pline(g, x, y, x1, y1, depth > 2 ? bark2 : bark, wd);
      if (depth <= 0) { ends.push([x1, y1]); return; }
      branch(x1, y1, ang - 0.45 - rng() * 0.35, len * 0.68, Math.max(1, wd - 1), depth - 1);
      branch(x1, y1, ang + 0.4 + rng() * 0.35, len * 0.66, Math.max(1, wd - 1), depth - 1);
    };
    branch(16, 36, -Math.PI / 2 + (rng() - 0.5) * 0.2, 11, 3, 3);
    for (const [x, y] of ends) { disc(g, Math.round(x + 0.5), Math.round(y + 1), 3, leaf2); disc(g, Math.round(x), Math.round(y), 2, leaf); }
    if (v === 1) for (const [x, y] of ends.slice(0, 5)) R(g, Math.round(x), Math.round(y) - 2, 1, 1, '#e8e09a');
  }));
  // mandacaru: colunas com gomos, espinhos e flor
  D.mandacaru = mkHD(28, 44, g => {
    const c = '#3f8a4a', d = '#2a6a36', l = '#6ab86a', sp = '#f2f2d0';
    const col = (x, y0, y1, w) => { R(g, x, y0, w, y1 - y0, c); disc(g, x + (w >> 1), y0, w >> 1, c); for (let i = 1; i < w - 1; i += 2) R(g, x + i, y0, 1, y1 - y0, i % 4 === 1 ? l : d); for (let y = y0 + 2; y < y1; y += 4) { R(g, x - 1, y, 1, 1, sp); R(g, x + w, y + 2, 1, 1, sp); } };
    col(10, 4, 44, 8);
    R(g, 3, 24, 8, 4, c); col(2, 12, 28, 6);
    R(g, 17, 18, 6, 4, c); col(20, 8, 22, 6);
    disc(g, 14, 3, 2, '#f4eef4'); R(g, 14, 1, 1, 1, '#e8a0c0');
  });
  // carnaúba: tronco alto com cicatrizes em espiral e leque de folhas
  D.carnauba = mkHD(40, 60, g => {
    const tk = '#8a7a62', tk2 = '#6a5a48', f = '#4f8f42', f2 = '#7ab85a', f3 = '#3a6e32';
    for (let y = 18; y < 60; y++) { R(g, 18, y, 4, 1, tk); if (y % 4 === 0) R(g, 18, y, 4, 1, tk2); if (y % 4 === 2) R(g, 21, y, 1, 1, tk2); }
    for (let a = 0; a < 13; a++) {
      const ang = Math.PI * 0.95 + (a / 12) * Math.PI * 1.1, len = 13 + (a % 3) * 2;
      const ex = 20 + Math.cos(ang) * len, ey = 16 + Math.sin(ang) * len * 0.75;
      pline(g, 20, 16, ex, ey, a % 2 ? f : f3, 1);
      for (let k = -2; k <= 2; k++) pline(g, ex - Math.cos(ang) * 4, ey - Math.sin(ang) * 3, ex + Math.cos(ang + k * 0.18) * 3, ey + Math.sin(ang + k * 0.18) * 3, k % 2 ? f2 : f, 1);
    }
    disc(g, 20, 16, 3, f3); R(g, 19, 14, 2, 2, f2);
  });
  // coqueiro: tronco curvo com anéis, palhas e cocos
  D.coqueiro = mkHD(40, 56, g => {
    for (let y = 14; y < 56; y++) { const x = 19 + Math.round(Math.sin(y / 11) * 4); R(g, x, y, 4, 1, '#a0805a'); R(g, x + 3, y, 1, 1, '#7a5e3e'); if (y % 3 === 0) R(g, x, y, 4, 1, '#8a6a46'); }
    const fr = [[-17, 4], [-12, -6], [-3, -10], [7, -9], [16, -3], [18, 6], [-9, 9], [9, 10]];
    for (const [dx, dy] of fr) for (let t = 0; t <= 1; t += 0.04) {
      const x = 20 + dx * t, y = 14 + dy * t + t * t * 7;
      R(g, Math.round(x), Math.round(y), 1, 1, '#3a8a36');
      if (t > 0.15) { R(g, Math.round(x), Math.round(y + 1), 1, 2, '#2e7030'); R(g, Math.round(x + (dx > 0 ? -1 : 1)), Math.round(y - 1), 1, 1, '#5aa848'); }
    }
    disc(g, 18, 16, 2, '#6a4a2a'); disc(g, 22, 17, 2, '#7a5a32'); disc(g, 20, 18, 2, '#5e3e22');
  });
  // mangue com raízes-escora
  D.mangue = [0, 1].map(v => mkHD(36, 44, g => {
    const r = '#6a4a32', r2 = '#4e3422';
    // copa densa por cima, raízes-escora em arco por baixo
    g.drawImage(treeHD(r, v ? '#1e5a30' : '#226a3a', v ? '#2c6b3f' : '#2f7a46', '#5aa86a', 36, 44, 40 + v), 0, -8);
    for (const [x1, k] of [[3, 0], [9, 1], [27, 1], [33, 0], [13, 0], [23, 1]]) {
      for (let t = 0; t <= 1; t += 0.03) { const x = Math.round(18 + (x1 - 18) * t), y = Math.round(28 + t * 15 - Math.sin(t * Math.PI) * 7); R(g, x, y, 2, 1, k ? r2 : r); }
    }
    R(g, 2, 42, 32, 2, 'rgba(40,60,70,0.35)');
  }));
  // monólito de Quixadá
  D.monolito = [0, 1].map(v => mkHD(88, 104, g => {
    const base = v ? '#9a8f86' : '#a69a90', sh = '#7a706a', hi = '#c4bab0', st = '#6e6660';
    for (let y = 0; y < 104; y++) {
      const t = y / 103, u = Math.min(1, t * 1.35), w = Math.round(Math.sqrt(1 - (1 - u) * (1 - u)) * (v ? 40 : 36) + (t > 0.85 ? 4 : 0));
      R(g, 44 - w, y, w * 2, 1, base);
      R(g, 44 + w - Math.max(4, Math.round(w * 0.35)), y, Math.max(4, Math.round(w * 0.35)), 1, sh);
      if (y > 12 && y < 80) R(g, 44 - w + 4, y, 3, 1, hi);
    }
    const rng = rngOf(300 + v);
    for (let i = 0; i < 7; i++) { const x = 22 + rng() * 44, y0 = 18 + rng() * 30; R(g, x | 0, y0 | 0, 1, 14 + rng() * 26, st); }
    pline(g, 30, 40, 40, 58, sh, 1); pline(g, 58, 30, 52, 50, sh, 1);
    R(g, 14, 96, 60, 8, '#8a9a4a'); for (let x = 16; x < 72; x += 7) { R(g, x, 93, 2, 4, '#7a8a3a'); R(g, x + 3, 94, 1, 3, '#9aaa5a'); }
  }));
  // casas e prédios de Fortaleza (30x30 na tela)
  const pal = [['#e9d8b4', '#c2553a'], ['#d6e2ea', '#4a6a8a'], ['#f2e2a4', '#b5553a'], ['#e2c6d6', '#7a4a6a'], ['#cfe6c6', '#5a7a4a'], ['#ffffff', '#3a7aa8']];
  D.casas = pal.map(([wall, roof], i) => mkHD(60, 60, g => {
    const tall = i % 2 === 0, top = tall ? 0 : 16, w2 = shade(wall, -26), r2 = shade(roof, -30);
    R(g, 2, top + 12, 56, 60 - top - 12, wall); R(g, 50, top + 12, 8, 60 - top - 12, w2);
    if (tall) {
      // prediozinho com laje, varandas e ar-condicionado
      R(g, 0, top, 60, 13, roof); R(g, 0, top + 12, 60, 2, r2); R(g, 6, top + 2, 10, 4, '#d8d8d8');
      for (let y = top + 18; y < 50; y += 11) for (let x = 6; x < 52; x += 14) {
        R(g, x, y, 9, 7, '#5a8ab0'); R(g, x, y, 9, 2, '#9ac8e8'); R(g, x + 4, y, 1, 7, '#3e6a8e');
        R(g, x - 1, y + 7, 11, 2, '#8a8a8a'); if ((x + y) % 3 === 0) R(g, x + 9, y + 2, 3, 3, '#e8e8e8');
      }
    } else {
      // casa térrea com telhado de telha colonial
      tri(g, -2, top + 13, 30, top - 6, 62, top + 13, roof);
      for (let y = top; y < top + 13; y += 3) for (let x = 0; x < 60; x += 4) R(g, x + ((y / 3) % 2 ? 2 : 0), y, 1, 2, r2);
      R(g, 0, top + 12, 60, 2, r2);
      for (const x of [7, 41]) { R(g, x, top + 20, 12, 12, '#5a8ab0'); R(g, x, top + 20, 12, 3, '#9ac8e8'); R(g, x - 2, top + 19, 2, 14, shade(wall, -40)); R(g, x + 12, top + 19, 2, 14, shade(wall, -40)); R(g, x - 1, top + 32, 14, 2, '#d8d0c0'); }
    }
    R(g, 24, 46, 12, 14, '#6a4a2a'); R(g, 24, 46, 12, 2, '#4a3020'); R(g, 33, 53, 1, 2, '#f2c230');
    R(g, 0, 58, 60, 2, 'rgba(0,0,0,0.15)');
    if (i === 3 || i === 4) { disc(g, 6, 52, 5, '#3f9a48'); disc(g, 5, 50, 3, '#6ac25a'); }
  }));
  // sede da SEMA (64x48 na tela)
  D.sema = mkHD(128, 96, g => {
    R(g, 4, 28, 120, 68, '#f4efe2'); R(g, 112, 28, 12, 68, '#ddd6c4');
    R(g, 0, 14, 128, 16, '#2f7a46'); R(g, 0, 28, 128, 3, '#225a34'); R(g, 0, 14, 128, 2, '#4f9a62');
    for (let x = 10; x < 120; x += 18) for (const y of [38, 58]) { R(g, x, y, 12, 11, '#5a8ab0'); R(g, x, y, 12, 3, '#a8d4f0'); R(g, x + 6, y, 1, 11, '#3e6a8e'); R(g, x - 1, y + 11, 14, 2, '#d8d0c0'); }
    R(g, 50, 72, 28, 24, '#6a4a2a'); R(g, 63, 72, 2, 24, '#4a3020'); R(g, 56, 82, 2, 2, '#f2c230'); R(g, 70, 82, 2, 2, '#f2c230');
    R(g, 46, 70, 36, 3, '#2f7a46'); R(g, 44, 93, 40, 3, '#c9c1b2');
    R(g, 34, 0, 60, 16, '#ffffff'); R(g, 34, 0, 60, 2, '#2f7a46'); R(g, 34, 14, 60, 2, '#2f7a46');
    g.fillStyle = '#2f7a46'; g.font = 'bold 12px sans-serif'; g.textBaseline = 'top'; g.fillText('SEMA', 49, 2);
    g.fillStyle = '#ffffff'; g.font = 'bold 6px sans-serif'; g.fillText('SECRETARIA DO MEIO AMBIENTE', 18, 19);
    // mastros com bandeiras do Brasil e do Ceará
    R(g, 6, 2, 2, 26, '#9a9a9a'); R(g, 8, 3, 12, 8, '#2a9a4a'); tri(g, 9, 7, 14, 4, 19, 7, '#f2c230'); tri(g, 9, 7, 14, 10, 19, 7, '#f2c230'); disc(g, 14, 7, 2, '#2a4ab8');
    R(g, 120, 2, 2, 26, '#9a9a9a'); R(g, 108, 3, 12, 8, '#2a9a4a'); R(g, 108, 5, 12, 4, '#ffffff'); disc(g, 114, 7, 2, '#2a9a4a');
    for (const x of [8, 116]) { disc(g, x, 88, 7, '#2f8a3a'); disc(g, x - 2, 86, 4, '#5ab04f'); }
  });
  // UFC (56x40 na tela)
  D.ufc = mkHD(112, 80, g => {
    R(g, 4, 24, 104, 56, '#ece6d6'); R(g, 96, 24, 12, 56, '#d6ceba');
    R(g, 0, 12, 112, 14, '#2a4a8a'); R(g, 0, 24, 112, 2, '#1a3468');
    tri(g, 30, 26, 56, 12, 82, 26, '#e2dccb');
    for (let x = 10; x < 104; x += 16) { R(g, x, 32, 8, 26, '#d4ccb8'); R(g, x, 32, 8, 2, '#f8f4ea'); R(g, x + 6, 32, 2, 26, '#bfb7a2'); }
    R(g, 44, 58, 24, 22, '#5a3a22'); R(g, 55, 58, 2, 22, '#3a2414'); R(g, 40, 76, 32, 4, '#c9c1b2');
    R(g, 28, 0, 56, 14, '#ffffff'); R(g, 28, 0, 56, 2, '#2a4a8a'); R(g, 28, 12, 56, 2, '#2a4a8a');
    g.fillStyle = '#2a4a8a'; g.font = 'bold 11px sans-serif'; g.textBaseline = 'top'; g.fillText('UFC', 45, 2);
  });
  // Mercado Central (48x44 na tela)
  D.mercado = mkHD(96, 88, g => {
    R(g, 4, 20, 88, 68, '#d88a52'); R(g, 4, 20, 88, 3, '#b86a3a'); R(g, 84, 20, 8, 68, '#c0743e');
    for (let y = 26; y < 52; y += 5) for (let x = 6; x < 90; x += 10) R(g, x + (y % 10 ? 5 : 0), y, 6, 1, '#c0703e');
    R(g, 0, 8, 96, 13, '#7a3a22'); R(g, 0, 20, 96, 2, '#5a2a18');
    for (let x = 0; x < 96; x += 12) { R(g, x, 52, 6, 10, '#e2453a'); R(g, x + 6, 52, 6, 10, '#fffdf4'); tri(g, x, 62, x + 3, 65, x + 6, 62, '#e2453a'); tri(g, x + 6, 62, x + 9, 65, x + 12, 62, '#fffdf4'); }
    R(g, 34, 64, 28, 24, '#5a3a22'); R(g, 47, 64, 2, 24, '#3a2416');
    for (const x of [8, 68]) { R(g, x, 66, 20, 14, '#5a8ab0'); R(g, x, 66, 20, 3, '#9ac8e8'); }
    R(g, 11, 72, 3, 8, '#f2c230'); R(g, 15, 74, 3, 6, '#e2453a'); R(g, 20, 73, 4, 7, '#f4f0e4'); R(g, 71, 72, 5, 8, '#e6c46a'); R(g, 78, 74, 4, 6, '#4a8ad8'); R(g, 83, 73, 3, 7, '#c8894a');
    R(g, 16, 0, 64, 17, '#fffdf4'); R(g, 16, 0, 64, 2, '#c0582a'); R(g, 16, 15, 64, 2, '#c0582a');
    g.fillStyle = '#c0582a'; g.font = 'bold 11px sans-serif'; g.textBaseline = 'top'; g.fillText('MERCADO', 22, 3);
  });
  // Brechó do Benfica (30x30 na tela)
  D.brecho = mkHD(60, 60, g => {
    R(g, 2, 16, 56, 44, '#f2b3c0'); R(g, 50, 16, 8, 44, '#d98fa0');
    R(g, 0, 6, 60, 12, '#8e4fb0'); R(g, 0, 16, 60, 2, '#6a3a88');
    for (let x = 2; x < 58; x += 8) { R(g, x, 28, 4, 6, '#5fa84a'); R(g, x + 4, 28, 4, 6, '#fffdf4'); }
    R(g, 6, 36, 14, 12, '#5a8ab0'); R(g, 6, 36, 14, 2, '#9ac8e8'); R(g, 10, 40, 2, 8, '#f2c230'); R(g, 14, 42, 2, 6, '#e2453a');
    R(g, 26, 38, 14, 22, '#6a4a2a'); R(g, 36, 48, 2, 2, '#f2c230');
    R(g, 44, 36, 10, 12, '#5a8ab0'); R(g, 44, 36, 10, 2, '#9ac8e8');
    R(g, 10, 0, 40, 13, '#fffdf4'); R(g, 10, 0, 40, 2, '#8e4fb0'); R(g, 10, 11, 40, 2, '#8e4fb0');
    g.fillStyle = '#8e4fb0'; g.font = 'bold 8px sans-serif'; g.textBaseline = 'top'; g.fillText('BRECHÓ', 14, 2);
  });
  D.rock = mkHD(20, 14, g => { R(g, 2, 4, 16, 10, '#9a9088'); R(g, 4, 2, 10, 3, '#b8aea4'); R(g, 12, 6, 6, 8, '#7a706a'); R(g, 5, 4, 4, 2, '#d0c8be'); });
  D.tufo = mkHD(16, 10, g => { for (const [x, h, c] of [[2, 6, '#8a9a3a'], [4, 9, '#9aaa4a'], [6, 7, '#7a8a2a'], [8, 10, '#a4b456'], [10, 6, '#8a9a3a'], [12, 8, '#7a8a2a']]) R(g, x, 10 - h, 1, h, c); });
  D.flor = mkHD(12, 12, g => { R(g, 5, 6, 1, 6, '#4a8a3a'); R(g, 6, 8, 2, 1, '#5aa04a'); disc(g, 5, 4, 3, '#f2c230'); R(g, 5, 4, 1, 1, '#c0582a'); });
  D.muda = mkHD(20, 24, g => {
    R(g, 2, 20, 16, 4, '#6a4a2a'); R(g, 3, 20, 14, 1, '#8a6a42'); R(g, 9, 8, 2, 13, '#4a8a3a');
    disc(g, 6, 9, 3, '#5ab04f'); disc(g, 13, 6, 3, '#6ac25a'); disc(g, 10, 4, 2, '#8ad46a');
    R(g, 15, 6, 1, 15, '#c9a86a');
  });
  D.cova = mkHD(24, 16, g => { disc(g, 12, 8, 7, '#7a5a3a'); disc(g, 12, 8, 5, '#4a3220'); R(g, 4, 4, 16, 2, '#9a7a52'); });
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
    const t = treeHD('#5a3a22', shade(sp.color, -20), sp.color, shade(sp.color, 40), 32, 44, speciesId.length * 131 + speciesId.charCodeAt(0), sp.fruit);
    c = stage === 1 ? scaleSprite(t, 0.6) : t;
  }
  plantedCache[key] = c;
  return c;
}
function scaleSprite(src, s) {
  const c = mkCanvas(Math.ceil(src.width * s), Math.ceil(src.height * s), g => g.drawImage(src, 0, 0, src.width * s, src.height * s));
  c.hd = src.hd; return c;
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
