// =====================================================================
//  Lugares reais do Ceará: pontos turísticos desenhados em alta resolução
//  (2 pixels de arte por unidade do mundo), com curiosidades verdadeiras.
//  Visitar cada um guarda um cartão-postal na coleção (S.postais).
// =====================================================================

// (mkHD, tri, lancet, pline e treeHD ficam em sprites.js)

// ---------------------------------------------------------------------
//  Desenhos
// ---------------------------------------------------------------------
const LUGAR_SPR = {
  catedral: () => mkHD(96, 144, g => {
    const st = '#aaa499', st2 = '#958f84', st3 = '#78736a', lt = '#c9c4b8', dk = '#3e3a34', glass = '#3f5f9a';
    // nave central e empena
    R(g, 28, 62, 40, 82, st2); tri(g, 26, 64, 48, 34, 70, 64, st2); R(g, 28, 62, 40, 2, lt);
    // rosácea
    disc(g, 48, 78, 9, st3); disc(g, 48, 78, 7, glass); R(g, 47, 71, 2, 14, '#c8463c'); R(g, 41, 77, 14, 2, '#c8463c'); disc(g, 48, 78, 2, '#f2c230');
    // portal ogival
    lancet(g, 37, 104, 22, 40, st3); lancet(g, 40, 107, 16, 37, '#5a3a22'); R(g, 47, 104, 2, 40, '#3a2414');
    // torres com agulhas
    for (const x0 of [4, 66]) {
      R(g, x0, 44, 26, 100, st); R(g, x0 + 20, 44, 6, 100, st2); R(g, x0, 44, 2, 100, lt);
      for (const y of [64, 88, 112]) R(g, x0 - 1, y, 28, 3, lt);
      for (const y of [52, 72, 96]) lancet(g, x0 + 9, y, 8, 12, dk);
      tri(g, x0, 44, x0 + 13, 8, x0 + 26, 44, st2); tri(g, x0, 44, x0 + 13, 8, x0 + 13, 44, st);
      tri(g, x0 - 2, 46, x0 + 2, 32, x0 + 6, 46, st3); tri(g, x0 + 20, 46, x0 + 24, 32, x0 + 28, 46, st3);
      R(g, x0 + 12, 0, 2, 9, dk); R(g, x0 + 9, 3, 8, 2, dk);
    }
    // escadaria
    R(g, 30, 138, 36, 3, lt); R(g, 24, 141, 48, 3, st2);
  }),
  dragao: () => mkHD(96, 96, g => {
    const red = '#c0392b', red2 = '#8e2a20';
    // prédio de vidro com estrutura vermelha
    R(g, 34, 40, 58, 52, '#9fc4d8'); for (let i = 0; i <= 7; i++) R(g, 34 + i * 8, 40, 1, 52, '#6a8ea6'); for (let j = 0; j <= 6; j++) R(g, 34, 40 + j * 8, 58, 1, '#6a8ea6');
    R(g, 30, 32, 66, 8, red); R(g, 30, 38, 66, 2, red2); for (const x of [30, 52, 74, 92]) R(g, x, 32, 4, 60, red);
    g.fillStyle = '#fff'; g.font = 'bold 6px sans-serif'; g.textBaseline = 'top'; g.fillText('DRAGÃO DO MAR', 38, 33);
    // planetário (cúpula branca)
    disc(g, 19, 58, 17, '#eef0f0'); disc(g, 24, 56, 9, '#f8fafa');
    R(g, 2, 58, 34, 34, '#d6dada'); R(g, 28, 58, 8, 34, '#bfc4c4'); R(g, 2, 58, 34, 2, '#bfc4c4');
    R(g, 8, 46, 6, 2, '#ffffff'); R(g, 6, 50, 3, 2, '#ffffff');
    // passarela vermelha
    R(g, 0, 70, 34, 3, red); for (let x = 2; x < 34; x += 6) R(g, x, 73, 2, 19, red2);
    // calçada
    R(g, 0, 92, 96, 4, '#c9c1b2');
  }),
  theatro: () => mkHD(96, 80, g => {
    const cr = '#f0dfa6', cr2 = '#d4c080', gr = '#2f8a5a', gr2 = '#1f6a44', gold = '#e2b23a';
    R(g, 4, 26, 88, 50, cr); R(g, 4, 22, 88, 5, gr); R(g, 4, 26, 88, 2, cr2);
    // corpo central mais alto, com frontão
    R(g, 30, 12, 36, 64, cr); tri(g, 28, 14, 48, 2, 68, 14, cr2); R(g, 28, 12, 40, 3, gr); R(g, 44, 4, 8, 6, gold);
    // colunas
    for (const x of [8, 22, 70, 84]) { R(g, x, 30, 4, 44, cr2); R(g, x - 1, 30, 6, 2, '#fff4d0'); }
    // janelas em arco
    for (const x of [12, 76]) { R(g, x, 40, 8, 16, gr2); disc(g, x + 4, 40, 4, gr2); R(g, x + 3, 36, 2, 20, gr); }
    // grande arco de ferro verde (art nouveau)
    R(g, 36, 30, 24, 46, gr2); disc(g, 48, 30, 12, gr2);
    for (let i = 0; i < 6; i++) R(g, 38 + i * 4, 22, 1, 54, gr);
    for (let j = 0; j < 8; j++) R(g, 36, 30 + j * 6, 24, 1, gr);
    disc(g, 48, 26, 4, gold); disc(g, 48, 26, 2, gr2);
    // escadaria
    R(g, 30, 74, 36, 3, cr2); R(g, 26, 77, 44, 3, '#bfae7a');
  }),
  coluna: () => mkHD(24, 72, g => {
    R(g, 8, 16, 8, 50, '#ece4cf'); R(g, 14, 16, 2, 50, '#c8bfa8');
    R(g, 3, 64, 18, 8, '#c8bfa8'); R(g, 5, 62, 14, 3, '#ece4cf');
    R(g, 4, 4, 16, 14, '#ece4cf'); R(g, 4, 16, 16, 2, '#c8bfa8'); R(g, 6, 0, 12, 4, '#b8ae96');
    disc(g, 12, 11, 5, '#3a3a3a'); disc(g, 12, 11, 4, '#fffef6'); R(g, 12, 8, 1, 4, '#222'); R(g, 12, 11, 3, 1, '#222');
  }),
  poste: () => mkHD(8, 40, g => { R(g, 3, 6, 2, 34, '#2e2e2e'); R(g, 1, 2, 6, 5, '#2e2e2e'); R(g, 2, 3, 4, 3, '#f6e7a0'); R(g, 2, 38, 4, 2, '#2e2e2e'); }),
  jangada: () => mkHD(56, 52, g => {
    R(g, 4, 40, 48, 8, '#8a5a32'); R(g, 4, 46, 48, 2, '#5e3a1e'); for (let i = 0; i < 6; i++) R(g, 4 + i * 8, 40, 1, 8, '#6a4424');
    R(g, 20, 34, 12, 6, '#6a4424'); R(g, 26, 2, 2, 38, '#5a3a1e');
    tri(g, 28, 2, 28, 38, 54, 36, '#f6f1e2');
    for (const y of [12, 20, 28]) { const w = Math.round((y - 2) / 36 * 26); R(g, 28, y, w, 3, y === 20 ? '#2a5ba8' : '#e2453a'); }
    R(g, 2, 48, 52, 3, 'rgba(0,0,0,0.18)');
  }),
  iracema: () => mkHD(32, 64, g => {
    const br = '#8a6a3a', br2 = '#5e4624', ped = '#d8d2c2';
    R(g, 6, 48, 20, 16, ped); R(g, 4, 46, 24, 3, '#ece6d8'); R(g, 6, 60, 20, 4, '#bdb6a6');
    R(g, 13, 20, 7, 26, br); R(g, 18, 20, 2, 26, br2); disc(g, 16, 14, 4, br); R(g, 11, 12, 4, 18, br2);
    R(g, 19, 22, 8, 2, br); R(g, 26, 10, 2, 24, br2); R(g, 26, 10, 1, 24, '#b08a52');
    R(g, 14, 40, 2, 7, br2); R(g, 17, 40, 2, 7, br2);
  }),
  farol: () => mkHD(32, 96, g => {
    const wh = '#f4f1e8', sh = '#d2cec2';
    for (let y = 24; y < 88; y++) { const w = Math.round(10 + (y - 24) / 64 * 8); R(g, 16 - (w >> 1), y, w, 1, wh); R(g, 16 + (w >> 1) - 3, y, 3, 1, sh); }
    for (const y of [40, 58]) R(g, 14, y, 3, 5, '#6a8ab0');
    R(g, 14, 78, 5, 10, '#6a4a2a');
    R(g, 4, 88, 24, 8, '#bdb6a6'); R(g, 4, 88, 24, 2, '#d8d2c2');
    R(g, 7, 22, 18, 3, '#3a3a3a'); R(g, 10, 12, 12, 11, '#3a3a3a'); R(g, 11, 14, 10, 7, '#ffe680'); R(g, 14, 14, 3, 7, '#fff6c0');
    tri(g, 8, 13, 16, 2, 24, 13, '#c0392b');
  }),
  pedraFurada: () => mkHD(80, 64, g => {
    const rk = '#8e5c3a', rk2 = '#6e4428', rk3 = '#b07a50';
    disc(g, 40, 30, 30, rk); R(g, 10, 30, 60, 30, rk); disc(g, 22, 50, 12, rk); disc(g, 60, 52, 12, rk);
    for (const y of [14, 22, 34, 46]) R(g, 12, y, 56, 2, rk2);
    R(g, 14, 20, 4, 30, rk3); disc(g, 30, 12, 6, rk3);
    // o furo
    g.globalCompositeOperation = 'destination-out'; disc(g, 44, 38, 12, '#000'); R(g, 32, 38, 25, 26, '#000'); g.globalCompositeOperation = 'source-over';
    R(g, 30, 36, 2, 26, rk2); R(g, 57, 36, 2, 26, rk2);
    R(g, 6, 60, 70, 4, 'rgba(0,0,0,0.2)');
  }),
  luaEstrela: () => mkHD(40, 40, g => {
    const ln = '#fff2d6', sh = '#a8432a';
    disc(g, 16, 20, 13, sh); disc(g, 16, 20, 12, ln); disc(g, 22, 17, 11, sh);
    g.globalCompositeOperation = 'destination-out'; disc(g, 23, 17, 10, '#000'); g.globalCompositeOperation = 'source-over';
    tri(g, 30, 22, 33, 14, 36, 22, ln); tri(g, 28, 18, 38, 18, 33, 25, ln); R(g, 32, 19, 3, 2, ln);
  }),
  galinha: () => mkHD(96, 80, g => {
    const b = '#a69a90', sh = '#7a706a', hi = '#c4bab0';
    disc(g, 56, 54, 30, sh); disc(g, 52, 50, 29, b); disc(g, 82, 36, 9, b); R(g, 22, 34, 22, 28, b); disc(g, 28, 30, 13, b);
    tri(g, 6, 30, 18, 26, 18, 34, '#8e8278'); R(g, 24, 25, 3, 3, '#3a3430');
    R(g, 30, 40, 2, 30, hi); disc(g, 40, 36, 5, hi); R(g, 64, 44, 2, 22, sh); R(g, 46, 60, 18, 2, sh);
    R(g, 8, 74, 82, 6, '#8a9a4a'); R(g, 14, 72, 6, 2, '#9aaa5a'); R(g, 70, 72, 8, 2, '#9aaa5a');
  }),
  barragem: () => mkHD(112, 40, g => {
    R(g, 0, 10, 112, 22, '#b8b4aa'); R(g, 0, 6, 112, 5, '#d8d4ca'); R(g, 0, 30, 112, 2, '#8a8680');
    for (let i = 0; i < 6; i++) { R(g, 34 + i * 12, 14, 8, 16, '#5e5e58'); R(g, 34 + i * 12, 14, 8, 2, '#7a7a74'); }
    R(g, 34, 32, 70, 8, '#7ab8e0'); for (let x = 36; x < 104; x += 5) R(g, x, 33, 2, 6, '#e8f4fc');
    g.fillStyle = '#3a3a3a'; g.font = 'bold 6px sans-serif'; g.textBaseline = 'top'; g.fillText('CASTANHÃO', 4, 16);
  }),
  padreCicero: () => mkHD(40, 104, g => {
    const wh = '#f4f2ea', sh = '#cfcabb';
    R(g, 8, 84, 24, 20, '#b8b2a2'); R(g, 6, 82, 28, 3, '#d8d2c2'); R(g, 8, 100, 24, 4, '#9a947f');
    for (let y = 30; y < 82; y++) { const w = Math.round(10 + (y - 30) / 52 * 10); R(g, 20 - (w >> 1), y, w, 1, wh); R(g, 20 + (w >> 1) - 3, y, 3, 1, sh); }
    disc(g, 20, 24, 5, wh); R(g, 22, 22, 3, 6, sh);
    R(g, 11, 17, 18, 3, wh); R(g, 15, 10, 10, 8, wh); R(g, 23, 10, 2, 8, sh);
    R(g, 22, 40, 9, 3, wh); R(g, 30, 32, 2, 50, sh);
  }),
  estacao: () => mkHD(36, 36, g => {
    R(g, 2, 12, 32, 24, '#e8e2d2'); R(g, 0, 6, 36, 7, '#c0392b'); R(g, 0, 12, 36, 1, '#8e2a20');
    R(g, 6, 18, 8, 7, '#6a8ab0'); R(g, 22, 18, 8, 10, '#6a4a2a'); R(g, 15, 0, 6, 7, '#3a3a3a');
  }),
};

// ---------------------------------------------------------------------
//  Onde fica cada lugar (tiles) e o que se aprende lá
// ---------------------------------------------------------------------
// x, y = canto de cima à esquerda do desenho (em tiles); col = área sólida (unidades do mundo, relativa)
// ir = ponto de interação (tiles); chao = desenhado rente ao chão (sem volume)
const PONTOS = [
  { id: 'catedral', nome: 'Catedral Metropolitana', regiao: 'Fortaleza', icon: '⛪', spr: 'catedral', x: 33, y: 16 - 72 / 16, col: [2, 58, 46, 71], ir: [34.5, 16.4],
    fatos: ['A Catedral Metropolitana de Fortaleza é neogótica e levou quase 40 anos para ficar pronta: começou em 1939 e foi inaugurada em 1978.', 'Cabem cerca de 5 mil pessoas lá dentro. Os vitrais coloridos são um espetáculo no fim da tarde.'] },
  { id: 'dragao', nome: 'Centro Dragão do Mar', regiao: 'Fortaleza', icon: '🎭', spr: 'dragao', x: 37, y: 16 - 3, col: [1, 30, 47, 47], ir: [38.5, 16.4],
    fatos: ['O Centro Dragão do Mar de Arte e Cultura tem museus, cinema, teatro e um planetário.', 'O nome homenageia Francisco José do Nascimento, o “Dragão do Mar”, jangadeiro que em 1881 se recusou a levar pessoas escravizadas nos barcos. O Ceará aboliu a escravidão em 1884, quatro anos antes do Brasil.'] },
  { id: 'theatro', nome: 'Theatro José de Alencar', regiao: 'Fortaleza', icon: '🎼', spr: 'theatro', x: 33, y: 19 - 2.5, col: [2, 14, 46, 39], ir: [34.5, 19.4],
    fatos: ['O Theatro José de Alencar foi inaugurado em 1910. A estrutura de ferro art nouveau veio da Escócia, em peças, de navio.', 'Os jardins ao lado foram projetados por Roberto Burle Marx, o paisagista que valorizava as plantas nativas do Brasil.'] },
  { id: 'coluna', nome: 'Praça do Ferreira', regiao: 'Fortaleza', icon: '🕰️', spr: 'coluna', x: 38.1, y: 18.9 - 36 / 16, col: [3, 30, 9, 36], ir: [38.5, 19.4],
    fatos: ['A Praça do Ferreira é o coração do Centro de Fortaleza. A Coluna da Hora, com o relógio, é ponto de encontro há gerações.', 'Foi aqui que, em 1942, o povo vaiou o sol: depois de dias nublados, quando ele apareceu, a praça inteira vaiou. Coisa de cearense!'] },
  { id: 'ponte', nome: 'Ponte dos Ingleses', regiao: 'Fortaleza', icon: '🌅', ir: [38.5, 5.6],
    fatos: ['A Ponte dos Ingleses começou a ser construída nos anos 1920 por uma empresa inglesa, para ser um porto. O porto nunca funcionou ali.', 'Hoje ela é um mirante: dá para ver o pôr do sol no mar e, com sorte, golfinhos na Praia de Iracema.'] },
  { id: 'iracema', nome: 'Iracema Guardiã', regiao: 'Fortaleza', icon: '🏹', spr: 'iracema', x: 46.5, y: 14 - 2, col: [3, 24, 13, 32], ir: [47, 14.4],
    fatos: ['Iracema é a heroína do romance de José de Alencar (1865), a “virgem dos lábios de mel”. O nome é um anagrama de América.', 'A estátua fica na orla e dá nome à Praia de Iracema, um dos bairros mais boêmios de Fortaleza.'] },
  { id: 'jangada', nome: 'Jangadas da Beira-Mar', regiao: 'Fortaleza', icon: '⛵', spr: 'jangada', x: 47.6, y: 14.9 - 26 / 16, col: [3, 20, 25, 25], ir: [49.5, 14.6],
    fatos: ['A jangada é o barco tradicional dos pescadores do Ceará: tronco, vela triangular e muita coragem.', 'Em 1941, quatro jangadeiros foram de jangada de Fortaleza até o Rio de Janeiro, em 61 dias, para pedir direitos trabalhistas ao presidente. Viraram lenda.'] },
  { id: 'farol', nome: 'Farol do Mucuripe', regiao: 'Fortaleza', icon: '🗼', spr: 'farol', x: 60, y: 20 - 3, col: [3, 40, 13, 48], ir: [60.5, 20.4],
    fatos: ['O Farol Velho do Mucuripe é do século XIX e guiou os barcos que chegavam a Fortaleza por mais de cem anos.', 'O Mucuripe é o bairro das jangadas e da pesca artesanal, e também do porto da cidade.'] },
  { id: 'pedraFurada', nome: 'Pedra Furada', regiao: 'Jericoacoara', icon: '🪨', spr: 'pedraFurada', x: 17.5, y: 6 - 2, col: [4, 24, 14, 31], ir: [18.7, 6.4],
    fatos: ['A Pedra Furada é um arco de rocha esculpido pelo mar e pelo vento, dentro do Parque Nacional de Jericoacoara.', 'Em alguns dias de julho, o sol se põe bem no meio do furo. Tem gente que viaja só para ver isso!'] },
  { id: 'ubajara', nome: 'Teleférico de Ubajara', regiao: 'Serra da Ibiapaba', icon: '🚡', spr: 'estacao', x: 12, y: 21 - 18 / 16, col: [1, 6, 17, 18], ir: [13, 21.4],
    fatos: ['O Parque Nacional de Ubajara foi criado em 1959 e é um dos menores parques nacionais do Brasil.', 'O teleférico desce a serra até a Gruta de Ubajara, uma caverna de calcário cheia de estalactites, com morcegos e muita história.'] },
  { id: 'canoa', nome: 'Falésias de Canoa Quebrada', regiao: 'Aracati', icon: '🌙', spr: 'luaEstrela', chao: true, x: 77.2, y: 26.2, ir: [78.2, 28.5],
    fatos: ['A lua com a estrela esculpida na falésia virou o símbolo de Canoa Quebrada.', 'As falésias são de arenito colorido e ficam numa Área de Proteção Ambiental: pisar na beirada e construir em cima acelera a erosão.'] },
  { id: 'galinha', nome: 'Pedra da Galinha Choca', regiao: 'Quixadá', icon: '🐔', spr: 'galinha', x: 52.5, y: 39 - 2.5, col: [6, 22, 44, 39], ir: [54.5, 39.6],
    fatos: ['A Galinha Choca é um monólito com formato de galinha chocando, perto do Açude do Cedro.', 'Os monólitos de Quixadá são de granito, com centenas de milhões de anos, e formam um Monumento Natural protegido pelo estado.'] },
  { id: 'castanhao', nome: 'Açude Castanhão', regiao: 'Vale do Jaguaribe', icon: '💧', spr: 'barragem', chao: true, x: 59.5, y: 45.6, ir: [59, 47.4],
    fatos: ['O Castanhão é o maior açude do Ceará: guarda bilhões de metros cúbicos de água do rio Jaguaribe e abastece até Fortaleza.', 'Para construir a barragem, a cidade de Jaguaribara foi inundada e reconstruída em outro lugar: Nova Jaguaribara.'] },
  { id: 'padreCicero', nome: 'Estátua do Padre Cícero', regiao: 'Juazeiro do Norte', icon: '🙏', spr: 'padreCicero', x: 55, y: 59 - 3.25, col: [4, 42, 16, 52], ir: [55.6, 59.5],
    fatos: ['A estátua do Padre Cícero fica na Colina do Horto, em Juazeiro do Norte, e tem 27 metros de altura.', 'Todo ano, milhares de romeiros do Nordeste inteiro sobem a colina a pé. É uma das maiores romarias do Brasil.'] },
];
// postes de luz da Ponte dos Ingleses (decoração, sem colisão)
const POSTES_PONTE = [[37.9, 6.2], [37.9, 8.2], [37.9, 10.2], [39, 6.2], [39, 8.2], [39, 10.2]];
// áreas que as casas de Fortaleza não podem ocupar (tiles x0, y0, x1, y1)
const PONTOS_EXCL = [[33, 11, 39, 15], [33, 17, 35, 18], [37, 17, 39, 18]];

// ---------------------------------------------------------------------
//  Montagem no mapa
// ---------------------------------------------------------------------
let decals = [], aereos = [];
function placeLugares(addObj) {
  for (const l of PONTOS) {
    if (!l.spr) continue;
    const spr = LUGAR_SPR[l.spr]();
    if (l.chao) decals.push({ spr, x: l.x * TILE, y: l.y * TILE, w: dW(spr), h: dH(spr) });
    else addObj(spr, Math.round(l.x * TILE), Math.round(l.y * TILE), l.col);
  }
  const poste = LUGAR_SPR.poste();
  for (const [x, y] of POSTES_PONTE) addObj(poste, x * TILE, y * TILE - 20, null);
  // segunda jangada, já na areia molhada
  addObj(LUGAR_SPR.jangada(), Math.round(52.2 * TILE), Math.round(15.9 * TILE - 26), [3, 20, 25, 25]);
  // teleférico de Ubajara: cabo da serra até a estação de baixo
  aereos.push({ x0: 5.5 * TILE, y0: 14.6 * TILE, x1: 12.6 * TILE, y1: 20.1 * TILE, top: LUGAR_SPR.estacao() });
}
function drawDecals(inView) {
  for (const d of decals) if (inView(d.x, d.y, d.w, d.h)) ctx.drawImage(d.spr, d.x, d.y, d.w, d.h);
}
function drawAereos(inView) {
  for (const a of aereos) {
    if (!inView(Math.min(a.x0, a.x1) - 10, a.y0 - 20, Math.abs(a.x1 - a.x0) + 20, a.y1 - a.y0 + 30)) continue;
    // estação de cima
    shadow(a.x0, a.y0 + 1); ctx.drawImage(a.top, a.x0 - 9, a.y0 - 17, 18, 18);
    // dois cabos
    ctx.strokeStyle = '#2e2e2e'; ctx.lineWidth = 0.5;
    for (const o of [-1.5, 1.5]) { ctx.beginPath(); ctx.moveTo(a.x0, a.y0 - 14 + o); ctx.quadraticCurveTo((a.x0 + a.x1) / 2, (a.y0 + a.y1) / 2 - 6 + o, a.x1, a.y1 - 14 + o); ctx.stroke(); }
    // cabine indo e voltando
    const t = (Math.sin(time * 0.35) + 1) / 2, u = 1 - t;
    const cx = u * u * a.x0 + 2 * u * t * (a.x0 + a.x1) / 2 + t * t * a.x1, cy = u * u * (a.y0 - 14) + 2 * u * t * ((a.y0 + a.y1) / 2 - 6) + t * t * (a.y1 - 14);
    R(ctx, cx - 0.5, cy, 1, 3, '#2e2e2e'); R(ctx, cx - 3, cy + 3, 6, 5, '#c0392b'); R(ctx, cx - 2, cy + 4, 4, 2, '#bfe0f0');
  }
}
function lugaresInteractables(out) {
  for (const l of PONTOS) out.push({ x: l.ir[0] * TILE, y: l.ir[1] * TILE, label: l.nome, icon: '📸', fn: () => visitarLugar(l) });
}
function visitarLugar(l) {
  if (!albumAberto()) {   // o álbum só abre depois da missão especial do Rio Pacoti
    say(l.fatos.map(t => ({ who: 'sistema', text: `${l.icon} ${t}` })), () => toast('💛 Complete a <b>missão especial</b> da agenda para guardar os lugares no seu álbum de memórias.', 4500));
    return;
  }
  const novo = !S.postais.includes(l.id);
  if (novo) S.postais.push(l.id);
  save();
  const lines = l.fatos.map(t => ({ who: 'sistema', text: `${l.icon} ${t}` }));
  if (novo) lines.push({ who: 'marina', text: S.postais.length === PONTOS.length ? 'Completei todos os cartões-postais do Ceará! 🥹💚' : 'Que lugar lindo! Vou guardar essa lembrança. 📸' });
  say(lines, () => { if (novo) { sfx.ok(); toast(`📸 Cartão-postal guardado: <b>${l.nome}</b> (${S.postais.length}/${PONTOS.length})`, 3500); } });
}
function postaisHTML() {
  if (!albumAberto()) return `<h3>📸 Álbum de memórias</h3><div class="box warn small">🔒 Complete a <b>missão especial 💛</b> da agenda para abrir o álbum.</div>`;
  return `<h3>📸 Álbum de memórias (${S.postais.length + 1}/${PONTOS.length + 1})</h3><div class="postais"><button class="postal on memo" id="memPacoti"><span>💛</span><b>Foz do Rio Pacoti</b><small>toque para relembrar</small></button>${PONTOS.map(l => S.postais.includes(l.id)
    ? `<div class="postal on"><span>${l.icon}</span><b>${l.nome}</b><small>${l.regiao}</small></div>`
    : `<div class="postal"><span>❔</span><b>???</b><small>${l.regiao}</small></div>`).join('')}</div>`;
}
