// =====================================================================
//  Missões especiais: memórias da vida real da Marina, revividas no jogo.
//  A primeira é "Um dia no Rio Pacoti": completar abre o Álbum de memórias,
//  e daí em diante os lugares especiais do Ceará viram lembranças.
// =====================================================================

// Pedro: cabelo cacheado, bigode e cavanhaque (da foto), roupa de praia
const PEDRO_LOOK = { cabelo: 'cacheado', baixo: 'short', barba: true, boca: 'fechada', pal: {
  S: '#e6b496', s: '#cf9878', t: '#b98262', H: '#1a120e', h: '#2c1f18', L: '#4a372c', l: '#5e483a', R: '#b5675c', r: '#c98a7a', P: '#e6b496', B: '#5a3018',
  C: '#2f6f8f', c: '#24586f', U: '#f4f0e4', Y: '#f2c230', G: '#5fa84a', O: '#e2453a', J: '#d8c9a0', j: '#b8a880', F: '#2a2a2a', f: '#151515' } };
const PEDRO_PHOTO = '<img src="assets/pedro.jpg" alt="Pedro" class="photo">';
let PEDRO = null;

// posições (em tiles) na Foz do Rio Pacoti e em Fortaleza
const PACOTI = {
  encontro: [54.5, 16.7],        // Pedro espera no fim da Beira-Mar
  chegada: [67.6, 22.7],         // onde a viatura deixa a Marina
  pedroMargem: [68.5, 21.7],
  entrada: [67.2, 21.7],         // "Entrar no rio"
  noRio: [65.8, 21.7],           // Marina dentro d'água
  pedroRio: [65.2, 22.7],
  peixes: [[65.5, 20.6], [64.6, 22.6], [66.4, 23.5]],
  canga: [68.3, 23.0],           // canga com as uvas
  pedroCanga: [69.3, 22.9],
  agua: [64, 20, 66, 23],        // trecho de rio raso onde dá para entrar (tiles x0, y0, x1, y1)
};
const tp = ([x, y]) => ({ x: x * TILE, y: y * TILE });

function mp() { if (!S.missoes) S.missoes = {}; return S.missoes.pacoti || (S.missoes.pacoti = { etapa: 0, peixes: [] }); }
function albumAberto() { return !!(S && S.missoes && S.missoes.pacoti && S.missoes.pacoti.etapa >= 5); }

// rio raso liberado para banho durante a missão
function aguaLiberada(tx, ty) {
  if (!S || !S.missoes || !S.missoes.pacoti) return false;
  const e = S.missoes.pacoti.etapa, [x0, y0, x1, y1] = PACOTI.agua;
  return (e === 2 || e === 3) && tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1 && tiles[ty * W + tx] === T.RIVER;
}

// ---------------------------------------------------------------------
//  Cenas
// ---------------------------------------------------------------------
// tela de transição com texto (viagem, passagem de tempo)
function cena(txt, meio, fim) {
  const f = $('#fade');
  f.innerHTML = `<div class="cenaTxt">${txt}</div>`; f.classList.add('on', 'cena');
  setTimeout(() => {
    if (meio) meio();
    setTimeout(() => { f.classList.remove('on'); setTimeout(() => { f.innerHTML = ''; f.classList.remove('cena'); if (fim) fim(); }, 420); }, 2300);
  }, 420);
}
let porDoSol = 0, porDoSolAlvo = 0;   // luz dourada do fim da tarde no final da missão

function falarPedro(lines, cb) { say(lines.map(([who, text]) => ({ who: who === 'p' ? 'pedro' : who === 'm' ? 'marina' : 'sistema', text })), cb); }

function conviteRio() {
  falarPedro([
    ['p', 'Oi, Marina! 😄 Lembra daquele dia na Foz do Rio Pacoti, lá em Aquiraz?'],
    ['m', 'Como esquecer? Foi um dia lindo!'],
    ['p', 'Bora relembrar? Pega as tuas uvas que a gente vai daqui de Fortaleza até lá. 🚗'],
    ['m', 'Uvas na bolsa! Bora! 🍇'],
  ], () => cena('🚗 De Fortaleza até a Foz do Rio Pacoti, em Aquiraz…', () => {
    mp().etapa = 1;
    const c = nearestWalkable(PACOTI.chegada[0] * TILE, PACOTI.chegada[1] * TILE); P.x = c.x; P.y = c.y; P.dir = 'right';
    curRegion = null; save(); updateHUD();
  }));
}
function chegadaRio() {
  falarPedro([
    ['p', 'Chegamos! Aqui é onde o Rio Pacoti encontra o mar, entre Fortaleza e Aquiraz.'],
    ['p', 'Sabia que ele nasce lá na Serra de Baturité? Desce a serra, atravessa o sertão e vem terminar bem aqui.'],
    ['p', 'E essa região toda é a APA do Rio Pacoti, uma Área de Proteção Ambiental do estado. Ou seja: um pedacinho do teu trabalho na SEMA! 🌿'],
    ['m', 'Hoje eu tô de folga… mas de olho! 😄 Bora pro rio?'],
  ], () => { mp().etapa = 2; save(); updateHUD(); toast('🌊 Entre no rio pela margem e procure os peixes!', 4000); });
}
function entrarNoRio() {
  const p = tp(PACOTI.noRio); P.x = p.x; P.y = p.y; P.dir = 'down';
  sfx.plant(); save();
  falarPedro([['m', 'Que água gostosa! Tá geladinha e bem rasinha. 🌊'], ['p', 'Olha com calma… dá pra ver os peixinhos passando!']]);
}
const FALAS_PEIXES = [
  [['m', 'Pedro, olha! Peixinhos passando bem pertinho do meu pé! 🐟'], ['p', 'Eles adoram essa água rasinha. O mangue aqui da foz é um berçário: muito peixe nasce e cresce protegido entre as raízes.']],
  [['m', 'Ali tem mais! Parecem prateados com o sol batendo.'], ['p', 'Aqui a água é salobra: mistura a água doce do rio com a salgada do mar. Por isso aparece peixe de rio e peixe de mar no mesmo lugar.']],
  [['m', 'Um cardumezinho inteiro! Nem acredito que dá pra ver daqui de cima.'], ['p', 'E esse mesmo rio ajuda a matar a sede de Fortaleza: o Açude Pacoti, rio acima, faz parte do sistema que leva água pra cidade.']],
];
function verPeixes(i) {
  const m = mp();
  if (m.peixes.includes(i)) return;
  m.peixes.push(i); save(); sfx.ok();
  const fim = m.peixes.length >= PACOTI.peixes.length;
  falarPedro(FALAS_PEIXES[m.peixes.length - 1].concat(fim ? [['p', 'Que banho bom… mas já tô ficando com fome.'], ['m', 'Ainda bem que eu trouxe uvas! Vem, vamos sentar na canga. 🍇']] : []),
    () => { if (fim) { m.etapa = 3; save(); updateHUD(); toast('🍇 Saia do rio e vá até a canga dividir as uvas', 4000); } else updateHUD(); });
}
function dividirUvas() {
  const m = mp();
  falarPedro([
    ['m', 'Uvinhas pra gente! 🍇'],
    ['p', 'Banho de rio e uva depois… não tem combinação melhor. Valeu por lembrar de trazer!'],
    ['p', 'Olha como o sol fica bonito refletindo na água. Daqui dá pra ver o rio, o mangue e o mar ao mesmo tempo.'],
  ], () => {
    m.etapa = 4; save(); porDoSolAlvo = 1;
    setTimeout(() => falarPedro([
      ['p', 'Sabe, Marina… fiquei muito feliz de ter vivido esse dia aqui com você.'],
      ['p', 'No meio de tanta correria no dia a dia, reservar um tempo da nossa vida para as pessoas que amamos faz com que a vida seja mais linda e valiosa.'],
      ['p', 'E nada mais justo do que revisitar essas boas memórias e momentos felizes juntos, que vamos guardar para sempre, relembrando os bons sentimentos que sentimos.'],
      ['p', 'Vou guardar esse dia sempre na memória. 💛'],
      ['m', 'Eu também, Pedro. Foi um dia muito especial. 😊'],
    ], () => { m.etapa = 5; save(); sfx.ok(); updateHUD(); openMemoriaPacoti(true); setTimeout(() => { porDoSolAlvo = 0; }, 1500); }), 900);
  });
}

// ---------------------------------------------------------------------
//  A memória guardada (com uma "foto" desenhada do momento)
// ---------------------------------------------------------------------
function polaroidPacoti() {
  if (!PEDRO) PEDRO = buildMarina(PEDRO_LOOK);
  const cv = mkCanvas(240, 150, g => {
    g.imageSmoothingEnabled = false;
    const sky = g.createLinearGradient(0, 0, 0, 60); sky.addColorStop(0, '#f6b36a'); sky.addColorStop(1, '#ffe2a8');
    g.fillStyle = sky; g.fillRect(0, 0, 240, 60);
    disc(g, 180, 50, 14, '#fff2c0');
    R(g, 0, 52, 240, 18, '#3a8fc4'); R(g, 0, 52, 240, 2, '#f8d8a0'); for (let x = 4; x < 240; x += 14) R(g, x, 58 + (x % 3), 6, 1, '#bfe4f6');
    R(g, 0, 70, 240, 80, '#ecd89c'); R(g, 0, 70, 240, 3, '#f9edc4');
    // rio com os dois dentro
    g.fillStyle = '#3a95cf'; g.beginPath(); g.ellipse(100, 108, 70, 22, 0, 0, 7); g.fill();
    g.fillStyle = '#4aa6dc'; g.beginPath(); g.ellipse(96, 104, 56, 14, 0, 0, 7); g.fill();
    for (const [x, y] of [[60, 112], [130, 100], [92, 120], [118, 116]]) { R(g, x, y, 5, 2, '#f2d27a'); R(g, x - 2, y, 2, 2, '#d8b45a'); }
    const meio = (spr, x, y) => { g.drawImage(spr, 0, 0, 32, 31, x, y, 32 * 1.1, 31 * 1.1); R(g, x - 2, y + 33, 40, 2, 'rgba(255,255,255,0.7)'); };
    meio(MARINA.down[0], 70, 70); meio(PEDRO.down[0], 104, 72);
    // canga e uvas
    R(g, 178, 104, 46, 24, '#e2453a'); for (let x = 178; x < 224; x += 8) R(g, x, 104, 4, 24, '#fffdf4');
    for (const [x, y] of [[196, 110], [200, 110], [198, 114], [202, 114], [194, 114], [198, 118]]) disc(g, x, y, 2, '#6a2a7a');
    // mangue ao fundo
    for (const x of [6, 22, 214, 230]) { disc(g, x, 64, 9, '#2f6a3a'); disc(g, x - 2, 61, 5, '#4a8a4a'); }
  });
  return cv.toDataURL();
}
function openMemoriaPacoti(primeiraVez) {
  openModal(`<div class="memoria">
    <div class="polaroid"><img src="${polaroidPacoti()}" alt="Marina e Pedro no Rio Pacoti"><span>Rio Pacoti 💛</span></div>
    <h2>💛 Foz do Rio Pacoti</h2>
    <p class="muted center">Aquiraz, Ceará</p>
    <ul class="memList"><li>🚗 A ida de Fortaleza até o rio</li><li>🌊 O banho na água rasinha</li><li>🐟 Os peixinhos que a Marina viu</li><li>🍇 As uvas que ela levou</li></ul>
    <blockquote>“No meio de tanta correria no dia a dia, reservar um tempo da nossa vida para as pessoas que amamos faz com que a vida seja mais linda e valiosa. E nada mais justo do que revisitar essas boas memórias e momentos felizes juntos, que vamos guardar para sempre, relembrando os bons sentimentos que sentimos.”<cite>Pedro</cite></blockquote>
    ${primeiraVez ? '<div class="box ok small">📸 <b>Álbum de memórias aberto!</b> Agora cada lugar especial do Ceará que você visitar vira uma lembrança no álbum (menu ⚙️). Esta é a primeira.</div>' : ''}
    <div class="row"><button class="btn" data-close>Guardar no coração 💛</button></div>
  </div>`, 'memModal');
}

// ---------------------------------------------------------------------
//  Ligações com o jogo
// ---------------------------------------------------------------------
function pedroPos() {
  const e = mp().etapa;
  if (e === 0) return tp(PACOTI.encontro);
  if (e === 1) return tp(PACOTI.pedroMargem);
  if (e === 2) return tp(PACOTI.pedroRio);
  if (e === 3 || e === 4) return tp(PACOTI.pedroCanga);
  return null;
}
function emAgua(x, y) { const t = tileAt(x, y - 2); return t === T.RIVER || t === T.SHALLOW || t === T.LAKE; }
function missaoInteractables(out) {
  if (!S) return;
  const m = mp(), e = m.etapa, pp = pedroPos();
  if (e === 0) out.push({ x: pp.x, y: pp.y, label: 'Conversar • Pedro', icon: '💛', fn: conviteRio });
  if (e === 1) out.push({ x: pp.x, y: pp.y, label: 'Conversar • Pedro', icon: '💛', fn: chegadaRio });
  if (e === 2 && !emAgua(P.x, P.y)) { const p = tp(PACOTI.entrada); out.push({ x: p.x, y: p.y, label: 'Entrar no rio', icon: '🌊', fn: entrarNoRio }); }
  if (e === 2) PACOTI.peixes.forEach((f, i) => { if (!m.peixes.includes(i)) { const p = tp(f); out.push({ x: p.x, y: p.y + 4, label: 'Olhar os peixinhos', icon: '🐟', fn: () => verPeixes(i) }); } });
  const c = tp(PACOTI.canga);
  if (e === 3) out.push({ x: c.x, y: c.y + 6, label: 'Dividir as uvas', icon: '🍇', fn: dividirUvas });
  if (e >= 5) out.push({ x: c.x, y: c.y + 6, label: 'Relembrar o dia no Pacoti', icon: '💛', fn: () => openMemoriaPacoti(false) });
}
function missaoTasks(out) {
  if (!S) return;
  const m = mp(), e = m.etapa;
  if (e >= 5) return;
  const txt = ['encontrar o Pedro no fim da Beira-Mar', 'conversar com o Pedro na Foz do Rio Pacoti', `entrar no rio e procurar os peixinhos (${m.peixes.length}/3)`, 'dividir as uvas com o Pedro 🍇', 'aproveitar o fim de tarde'][e];
  const go = e === 0 ? tp(PACOTI.encontro) : tp(PACOTI.chegada);
  out.unshift({ icon: '💛', txt: `<b>Missão especial:</b> ${txt}`, where: e === 0 ? 'Fortaleza' : 'Foz do Rio Pacoti • Aquiraz', go: { x: go.x - 14, y: go.y + 2 }, done: false, especial: true });
}
function missaoMapMarkers(dot) { if (!S || mp().etapa >= 5) return; const p = mp().etapa === 0 ? PACOTI.encontro : PACOTI.chegada; dot(p[0] * 4, p[1] * 4, '#ff7ab0', 6); }
// convite em forma de carta, sem contar qual é o passeio
function avisarMissao() {
  if (!S || S.avisoPacoti || mp().etapa >= 5) return;
  queue(() => { S.avisoPacoti = true; save(); abrirCarta(); });
}
function abrirCarta() {
  const m = openModal(`<div class="envelope" id="envelope" role="button" aria-label="Abrir a carta">
      <div class="envAba"></div><div class="envSelo">💛</div>
      <div class="envPara">Para: <b>Marina</b></div>
      <div class="envDica">toque para abrir</div>
    </div>`, 'cartaModal');
  m.querySelector('#envelope').onclick = () => {
    sfx.ok();
    m.innerHTML = `<div class="carta">
      <p>Marina,</p>
      <p>No meio de tanto parecer, vistoria e correria, achei que valia uma pausa.</p>
      <p>Tenho um convite pra você: um passeio especial, daqueles que a gente guarda na memória.</p>
      <p>Me encontra no fim da Beira-Mar, em Fortaleza. O resto é surpresa. 😉</p>
      <p class="assina">Te espero lá,<br>Pedro 💛</p>
    </div>
    <div class="box small cartaDica">📋 O convite ficou na sua <b>agenda</b> como missão especial.</div>
    <div class="row"><button class="btn" data-close>Guardar a carta</button></div>`;
    m.querySelector('[data-close]').onclick = closeModal;
  };
}
// faixa fixa embaixo com o próximo passo do encontro (para ela não se perder)
let objTxt = null;
function atualizarObjetivo() {
  const el = $('#objetivo');
  let t = '';
  if (S && !uiBusy()) {
    const m = mp(), e = m.etapa;
    if (e === 1) t = '💬 Fale com o Pedro';
    else if (e === 2) t = emAgua(P.x, P.y) ? `🐟 Procure os peixes (${m.peixes.length}/3)` : '🌊 Entre no rio pela margem';
    else if (e === 3) t = emAgua(P.x, P.y) ? '🍇 Saia do rio e vá até a canga' : '🍇 Vá até a canga dividir as uvas';
    if (t && e >= 1 && dist(P.x, P.y, PACOTI.chegada[0] * TILE, PACOTI.chegada[1] * TILE) > 12 * TILE) t = '💛 Volte ao passeio: agenda 📋 → Ir 🚙';
  }
  if (t === objTxt) return;
  objTxt = t; el.textContent = t; el.hidden = !t;
}

// desenho de uma pessoa: na água aparece só da cintura pra cima, com marolinha
function drawPessoa(spr, x, y, lift = 0) {
  const X = Math.round(x * 2) / 2 - 8;
  if (emAgua(x, y)) {
    const b = Math.sin(time * 3 + x * 0.1) * 0.4;
    ctx.drawImage(spr, 0, 0, 32, 31, X, y - 17.5 + b, 16, 15.5);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(X - 1, y - 2.5 + b, 18, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(X - 3 + ((time * 6) % 4), y - 1.5 + b, 3, 1); ctx.fillRect(X + 15 - ((time * 5) % 4), y - 1.5 + b, 3, 1);
  } else { shadow(x, y); ctx.drawImage(spr, X, Math.round(y * 2) / 2 - 23.5 - lift, 16, 24); }
}
let cangaSpr = null;
function missaoDraws(draws, inView) {
  if (!S) return;
  const m = mp(), e = m.etapa;
  // peixinhos sempre nadando na foz
  PACOTI.peixes.forEach((f, i) => {
    const c = tp(f); if (!inView(c.x - 12, c.y - 8, 24, 16)) return;
    draws.push({ y: c.y - 6, f: () => {
      for (let k = 0; k < 4; k++) {
        const a = time * (1 + k * 0.17) + k * 1.7 + i, fx = c.x + Math.cos(a) * (5 + k), fy = c.y + Math.sin(a * 1.3) * 2.5 + 2, dir = -Math.sin(a) > 0 ? 1 : -1;
        R(ctx, fx - 1.5, fy, 3, 1, k % 2 ? '#e8d48a' : '#cfe0ea'); R(ctx, fx - 1.5 - dir * 1.5, fy - 0.5, 1, 2, '#9ab4c4');
      }
      if (e === 2 && !m.peixes.includes(i) && Math.sin(time * 5 + i) > 0.2) { R(ctx, c.x - 0.5, c.y - 9, 1, 3, '#fff'); R(ctx, c.x - 1.5, c.y - 8, 3, 1, '#fff'); }
    } });
  });
  // canga com as uvas (fica como lembrança depois da missão)
  if (e >= 3) {
    if (!cangaSpr) cangaSpr = mkHD(44, 28, g => {
      R(g, 0, 4, 44, 22, '#e2453a'); for (let x = 0; x < 44; x += 8) R(g, x, 4, 4, 22, '#fffdf4'); R(g, 0, 4, 44, 2, '#f2c230'); R(g, 0, 24, 44, 2, '#f2c230');
      disc(g, 30, 14, 6, '#c8a06a'); disc(g, 30, 13, 5, '#e0c08a');
      for (const [x, y] of [[28, 11], [31, 11], [29, 14], [32, 14], [27, 14], [30, 17], [33, 12]]) { disc(g, x, y, 1, '#6a2a7a'); R(g, x, y - 1, 1, 1, '#a868b8'); }
      R(g, 30, 7, 1, 3, '#5a8a3a');
      R(g, 6, 8, 12, 8, '#f4ecd8'); R(g, 6, 8, 12, 2, '#d8c8a8');
    });
    const c = tp(PACOTI.canga);
    if (inView(c.x - 12, c.y - 8, 24, 16)) draws.push({ y: c.y - 10, f: () => {
      ctx.drawImage(cangaSpr, c.x - 11, c.y - 7, 22, 14);
      if (e >= 5 && Math.sin(time * 3) > 0) { R(ctx, c.x - 1, c.y - 13, 1, 1, '#ff7ab0'); R(ctx, c.x + 1, c.y - 13, 1, 1, '#ff7ab0'); R(ctx, c.x - 2, c.y - 12, 5, 1, '#ff7ab0'); R(ctx, c.x - 1, c.y - 11, 3, 1, '#ff7ab0'); R(ctx, c.x, c.y - 10, 1, 1, '#ff7ab0'); }
    } });
  }
  // Pedro
  const pp = pedroPos();
  if (pp && inView(pp.x - 8, pp.y - 24, 16, 26)) {
    if (!PEDRO) PEDRO = buildMarina(PEDRO_LOOK);
    const dx = P.x - pp.x, dy = P.y - pp.y, dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    draws.push({ y: pp.y, f: () => drawPessoa(PEDRO[dir][0], pp.x, pp.y) });
  }
}
// brilho dourado do fim de tarde (por cima de tudo, em espaço de tela)
let porDoSolT = 0;
function missaoTela() {
  const now = performance.now(), dt = Math.min(0.2, (now - (porDoSolT || now)) / 1000); porDoSolT = now;
  porDoSol += (porDoSolAlvo - porDoSol) * Math.min(1, dt * 1.5);
  if (porDoSol < 0.01) return;
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, `rgba(255,140,60,${0.34 * porDoSol})`); g.addColorStop(1, `rgba(255,200,120,${0.12 * porDoSol})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}
