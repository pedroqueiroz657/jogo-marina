'use strict';
// =====================================================================
//  Mundo vivo: estações reais do Ceará, queimadas, cuidado das mudas,
//  processos sem fim, eventos, fiscalização de condicionantes,
//  ano de gestão e progresso enquanto a jogadora está fora.
//  (usa as funções e o estado globais de game.js, chamadas só em tempo de jogo)
// =====================================================================
const URLP = new URLSearchParams(location.search);
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const LUGARES = { fortaleza: 'Fortaleza', camocim: 'Camocim', ibiapaba: 'Tianguá', aracati: 'Aracati', baturite: 'Baturité', quixada: 'Quixadá', jaguaribe: 'Limoeiro do Norte', taua: 'Tauá', araripe: 'Crato' };
const FIRE_REGIONS = ['taua', 'quixada', 'jaguaribe', 'araripe', 'ibiapaba', 'baturite'];
const DAY = 864e5;
const K = (x, y) => x + ',' + y;

function mesAtual() { const m = +URLP.get('mes'); return m >= 1 && m <= 12 ? m : new Date().getMonth() + 1; }
function estacaoId() { return estacaoDoMes(mesAtual()); }
function estacao() { return ESTACOES[estacaoId()]; }
function raining() {
  const id = estacaoId();
  if (id === 'chuvosa') return Math.sin(S.play / 37) > -0.3;
  if (id === 'preChuva') return Math.sin(S.play / 53) > 0.75;
  return false;
}
let FLAMV = null;
function flamOf(t) {
  if (!FLAMV) FLAMV = { [T.CAAT]: 1, [T.CAAT2]: 1, [T.SERRA]: 0.6, [T.CHAPADA]: 0.85, [T.AGRI]: 1.2, [T.PARK]: 0.5 };
  return FLAMV[t] || 0;
}
function inPlotArea(x, y, pad = 0) { return plotAreas.some(a => x >= a.x0 - pad && x <= a.x1 + pad && y >= a.y0 - pad && y <= a.y1 + pad); }

// ---------------------------------------------------------------------
//  Estado novo / migração de saves antigos
// ---------------------------------------------------------------------
function newProcState() { return { status: 'pendente', choice: null, visited: false, planted: [], errors: 0, done: false, order: shuffle([0, 1, 2]) }; }
function anoZerado() { return { dec: 0, mudas: 0, comp: 0, focos: 0, ha: 0, eventos: 0, fisc: 0, ganhos: 0, gastos: 0 }; }
// Versão do formato do save. Ao mudar o formato: aumente aqui e acrescente um passo em migrate().
const SAVE_V = 3;
function mundoDefaults() {
  return {
    v: SAVE_V, gen: [], genCount: 0, play: 0, year: 1, cargo: 0, ys: anoZerado(), hist: [],
    fires: [], burned: {}, events: [], followups: [], prev: {}, forest: [],
    lastSeen: Date.now(), season: estacaoId(), nextProcAt: 0, nextEventAt: 200, nextFireAt: 40,
    decTotal: 0, dead: 0, uid: 1, fogoTutorial: false, dicaRega: false,
    // v3: salário e visual (js/loja.js)
    carteira: 0, trab: 0, visual: visualPadrao(), roupas: roupasIniciais(), lojasVistas: [],
    dicaSalario: false, dicaBrecho: false, novidadeSalario: 0,
    postais: [],   // cartões-postais dos lugares visitados (js/lugares.js)
    missoes: {}, avisoPacoti: false,   // missões especiais (js/missoes.js)
  };
}
// Recebe qualquer save antigo e devolve no formato atual, sem perder nada.
// Regra: só ACRESCENTAR campos e converter; nunca apagar progresso.
function migrate(s) {
  const from = s.v || 1;   // versão ANTES de preencher os campos novos
  const d = mundoDefaults();
  for (const k in d) if (s[k] === undefined) s[k] = d[k];
  for (const k in d.ys) if (s.ys[k] === undefined) s.ys[k] = 0;
  for (const p of PROCESSOS) if (!s.procs[p.id]) s.procs[p.id] = newProcState();
  if (from < 2) {
    for (const id in s.procs) if (s.procs[id].status !== 'pendente') s.decTotal++;
    if (s.ended) { s.year = 2; s.ys = anoZerado(); }
  }
  // mudas sem dados de crescimento (vale também para saves que pularam o passo da v2)
  for (const id in s.procs) for (const pl of s.procs[id].planted || []) if (pl && pl.g === undefined) { pl.g = Math.min(400, (Date.now() - (pl.t || Date.now())) / 1000 * 2); pl.w = 1; pl.d = 0; }
  if (from < 3) {
    // v3: salário. Quem já jogava recebe os salários atrasados dos pareceres já assinados.
    s.trab = s.decTotal % PARECERES_POR_SALARIO;
    if (s.introDone) {
      // acerto limitado a 2 salários, para sobrar o que conquistar comprando aos poucos
      const atrasado = Math.min(2, Math.max(1, Math.floor(s.decTotal / PARECERES_POR_SALARIO))) * SALARIOS[Math.min(s.cargo, SALARIOS.length - 1)];
      s.carteira += atrasado; s.novidadeSalario = atrasado;
    }
  }
  // visual sempre válido (mesmo se um item sair do catálogo no futuro)
  if (!s.visual || typeof s.visual !== 'object') s.visual = visualPadrao();
  if (!Array.isArray(s.roupas)) s.roupas = roupasIniciais();
  for (const id of roupasIniciais()) if (!s.roupas.includes(id)) s.roupas.push(id);
  const vp = visualPadrao();
  for (const slot in SLOTS) {
    const it = itemById(s.visual[slot]);
    if (!it || it.slot !== slot || !s.roupas.includes(it.id)) s.visual[slot] = vp[slot];
  }
  if (!Number.isFinite(s.carteira)) s.carteira = 0;
  s.v = SAVE_V;
  return s;
}

// Mensagens que esperam a tela ficar livre
const msgQ = [];
function queue(fn) { msgQ.push(fn); }
function queueSay(lines, cb) { queue(() => say(lines, cb)); }

// Escolha genérica (botões embaralhados + feedback)
function escolha(titulo, html, choices, onPick, after) {
  const order = shuffle(choices.map((_, i) => i));
  const m = openModal(`<div class="mHead"><h2>${titulo}</h2></div><p>${html}</p>${order.map(i => `<button class="btn block ghost" data-c="${i}">${choices[i].txt}</button>`).join('')}`);
  m.querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => {
    const c = choices[+b.dataset.c];
    closeModal();
    if (c.fx) addStats(c.fx);
    c.ok ? sfx.ok() : sfx.bad();
    if (onPick) onPick(c);
    save();
    say([{ who: 'sistema', text: (c.ok ? '✅ ' : '⚠️ ') + c.fb }], () => { updateHUD(); if (after) after(c); });
  }));
}

// ---------------------------------------------------------------------
//  Processos gerados (sem fim)
// ---------------------------------------------------------------------
function ambOf(p) { return p.ambiente || AMBIENTE[p.id]; }
function spotBusy(r) {
  return S.gen.some(p => {
    const st = S.procs[p.id];
    return p.region === r && !st.archived && (st.status === 'pendente' || (compOf(p) && !st.done));
  });
}
function genProcesso() {
  const lastT = S.gen.slice(-2).map(p => p.tpl);
  const opts = [];
  for (const t of TEMPLATES) { if (lastT.includes(t.id)) continue; for (const r of t.regions) if (!spotBusy(r)) opts.push([t, r]); }
  if (!opts.length) return null;
  const [t, r] = opts[Math.floor(Math.random() * opts.length)];
  // área já usada por compensação concluída: as árvores viram parte da mata ao redor
  for (const old of S.gen) if (old.region === r && !S.procs[old.id].archived && S.procs[old.id].done) toForest(old);
  const w = S.year <= 1 ? [0.5, 0.4, 0.1] : S.year === 2 ? [0.3, 0.5, 0.2] : [0.2, 0.4, 0.4];
  let u = Math.random(), pi = 0; while (pi < 2 && u > w[pi]) { u -= w[pi]; pi++; }
  const porte = PORTES[pi], spot = GEN_SPOTS[r], bi = BIOMAS[t.bioma || spot.bioma];
  const fill = s => s.replace('{lugar}', LUGARES[r]).replace('{porte}', porte.nome);
  const sc = v => Math.round(v * porte.fx);
  S.genCount++;
  const id = 'g' + S.genCount;
  const p = {
    id, gen: true, tpl: t.id, numero: `${String(200 + S.genCount * 3).padStart(4, '0')}/${new Date().getFullYear()}`,
    titulo: fill(t.titulo), requerente: t.emp[Math.floor(Math.random() * t.emp.length)] + ' (fictícia)', region: r,
    site: { x: spot.x + 6, y: spot.y - 1 }, plots: { x: spot.x, y: spot.y }, tipo: `${t.tipo} • ${porte.nome}`,
    resumo: fill(t.resumo), vistoria: t.vistoria, fato: t.fato, ambiente: bi.nome, retorno: t.retorno,
    opcoes: t.opcoes.map(o => ({ k: o.k, txt: o.txt, fb: o.fb, fx: { amb: sc(o.fx.amb), eco: sc(o.fx.eco), soc: sc(o.fx.soc) }, comp: o.comp ? { n: Math.min(10, o.comp + porte.n), ok: bi.ok, bad: bi.bad } : null })),
  };
  S.gen.push(p); S.procs[id] = newProcState();
  return p;
}
function pendentes() { return unlockedProcs().filter(p => S.procs[p.id].status === 'pendente').length; }
function ensureProcs() {
  if (S.unlocked < PROCESSOS.length) return;
  const n = pendentes();
  if (n >= 3 || (n > 0 && S.play < S.nextProcAt)) return;
  const p = genProcesso();
  S.nextProcAt = S.play + 150 + Math.random() * 120;
  if (p) { toast(`📥 Novo processo na SEMA: <b>${p.titulo}</b>`, 3800); updateHUD(); save(); }
}
// limpa processos antigos já resolvidos para o save não crescer sem fim
function pruneGen() {
  const keep = new Set(S.followups.filter(f => !f.done).map(f => f.pid));
  const active = S.gen.filter(p => { const st = S.procs[p.id]; return st.status === 'pendente' || (compOf(p) && !st.archived) || keep.has(p.id); });
  const old = S.gen.filter(p => !active.includes(p));
  const drop = old.slice(0, Math.max(0, old.length - 8));
  for (const p of drop) delete S.procs[p.id];
  S.gen = S.gen.filter(p => !drop.includes(p));
  S.followups = S.followups.filter(f => !f.done);
}
function isGood(p, idx) { const sums = p.opcoes.map(o => o.fx.amb + o.fx.eco + o.fx.soc); return sums[idx] === Math.max(...sums); }

// ---------------------------------------------------------------------
//  Condicionantes que voltam (fiscalização)
// ---------------------------------------------------------------------
function agendarRetorno(p, idx) {
  const st = S.procs[p.id];
  if (st.status !== 'deferido') return;
  const ret = p.retorno || RETORNOS[p.id];
  if (!ret) return;
  const tipo = !isGood(p, idx) && ret.ruim ? 'ruim' : 'monit';
  S.followups.push({ id: S.uid++, pid: p.id, tipo, due: S.play + 180 + Math.random() * 240, on: false, done: false });
}
function doFiscal(fu) {
  const p = procById(fu.pid), ret = p.retorno || RETORNOS[p.id];
  let kind = fu.tipo;
  if (kind === 'monit') kind = ret.nc && Math.random() < 0.3 + 0.05 * S.year ? 'nc' : 'ok';
  if (kind === 'ok') {
    fu.done = true; S.ys.fisc++; sfx.ok(); addStats({ soc: 2, amb: 1 }); save();
    say([
      { who: 'marina', text: 'Vistoria de acompanhamento: vamos conferir as condicionantes…' },
      { who: 'sistema', text: `✔️ ${p.requerente} cumpriu todas as condicionantes de “${p.titulo}”. Licença bem feita + fiscalização = confiança.` },
    ], updateHUD);
    return;
  }
  const txt = kind === 'ruim' ? ret.ruim : ret.nc;
  say([
    { who: 'sistema', text: (kind === 'ruim' ? '📣 ' : '🔎 ') + txt },
    { who: 'marina', text: kind === 'ruim' ? 'Isso é consequência daquela licença… Preciso agir.' : 'Encontrei uma condicionante descumprida.' },
  ], () => escolha('⚖️ Fiscalização', `<b>${p.titulo}</b><br>${txt}`, kind === 'ruim' ? FISCAL_RUIM : FISCAL_NC, () => { fu.done = true; S.ys.fisc++; }));
}

// ---------------------------------------------------------------------
//  Mudas: rega, crescimento, morte, conclusão
// ---------------------------------------------------------------------
function stageOf(pl) { return pl.g < 60 ? 0 : pl.g < 180 ? 1 : 2; }
function killMuda(p, i, why) {
  const st = S.procs[p.id], reg = regionById(p.region);
  st.planted[i] = null; st.plantedAll = false; S.dead++;
  addStats({ amb: -1 });
  toast(why === 'seca' ? `🥀 Uma muda morreu de sede em ${reg.name}. A cova foi reaberta para replantio.` : `🔥 O fogo matou uma muda jovem em ${reg.name}. Replante!`, 4200);
}
function plantsUpdate(dt) {
  const est = estacao(), rain = raining();
  for (const p of unlockedProcs()) {
    const st = S.procs[p.id], c = compOf(p);
    if (!c || st.archived) continue;
    let thirsty = false;
    for (let i = 0; i < c.n; i++) {
      const pl = st.planted[i];
      if (!pl || stageOf(pl) >= 2) continue;
      if (rain) { pl.w = 1; pl.d = 0; } else pl.w = Math.max(0, pl.w - est.sede * dt);
      if (pl.w > 0) { pl.g += dt; pl.d = 0; } else { pl.d += dt; if (pl.d > 120) { killMuda(p, i, 'seca'); continue; } }
      if (pl.w < 0.35) thirsty = true;
    }
    if (thirsty && !st.sedeAvisada) { st.sedeAvisada = true; toast(`💧 As mudas em <b>${regionById(p.region).name}</b> estão com sede! Vá regar.`, 4200); }
    if (!st.done && plantedCount(p) >= c.n && st.planted.slice(0, c.n).every(pl => pl && stageOf(pl) >= 2)) compConcluida(p);
  }
}
function needsWater(p) {
  const st = S.procs[p.id], c = compOf(p);
  return c && !st.archived && st.planted.some(pl => pl && stageOf(pl) < 2 && pl.w < 0.6);
}
function regar(p) {
  const st = S.procs[p.id];
  for (const pl of st.planted) if (pl) { pl.w = 1; pl.d = 0; }
  st.sedeAvisada = false; sfx.plant();
  const c = compOf(p);
  for (let i = 0; i < c.n; i++) if (st.planted[i]) { const pp = plotPos(p, i); for (let k = 0; k < 4; k++) parts.push({ x: pp.x, y: pp.y - 10, vx: (Math.random() - 0.5) * 30, vy: -Math.random() * 30, life: 0.8, c: '#5ab4f0' }); }
  if (!S.dicaRega) { S.dicaRega = true; queueSay([{ who: 'sistema', text: '💧 Mudas regadas! No semiárido, regar nos primeiros meses é o que garante a sobrevivência. Muda que morre não conta para a compensação.' }]); }
  else toast('💧 Mudas regadas!');
  save();
}
function compConcluida(p) {
  const st = S.procs[p.id], reg = regionById(p.region), c = compOf(p);
  st.done = true; S.ys.comp++;
  const bonus = st.errors === 0 ? 6 : 3;
  addStats({ amb: bonus, soc: 2 }); sfx.ok(); save();
  queueSay([
    { who: 'sistema', text: `🌳 Compensação concluída em ${reg.name}! As ${c.n} mudas viraram árvores: Termo de Compromisso cumprido${st.errors === 0 ? ' sem nenhum erro de espécie. Excelente!' : '.'}` },
    { who: 'marina', text: 'Isso é o que importa: árvore viva, não só muda plantada. 💚' },
    { who: 'sistema', text: '💡 ' + DICAS_PLANTIO[Math.floor(Math.random() * DICAS_PLANTIO.length)] },
  ], () => { updateHUD(); checkAno(); });
}
function toForest(p) {
  const st = S.procs[p.id], c = compOf(p);
  if (c) for (let i = 0; i < c.n; i++) {
    const pl = st.planted[i]; if (!pl) continue;
    for (let tries = 0; tries < 50; tries++) {
      const a = Math.random() * Math.PI * 2, r = 5 + Math.random() * 4;
      const tx = Math.floor(p.plots.x + 3 + Math.cos(a) * r), ty = Math.floor(p.plots.y + 1.5 + Math.sin(a) * r * 0.8);
      if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
      const t = tiles[ty * W + tx];
      if (SOLID.has(t) || t === T.ROAD || t === T.BRIDGE || t === T.CITY || inPlotArea(tx, ty, 1)) continue;
      S.forest.push({ sp: pl.sp, x: tx * TILE + 8, y: ty * TILE + 12 });
      break;
    }
  }
  st.archived = true; st.planted = [];
  if (S.forest.length > 400) S.forest.splice(0, S.forest.length - 400);
}

// ---------------------------------------------------------------------
//  Queimadas
// ---------------------------------------------------------------------
let fireSet = new Set(), fireAcc = 0;
const smoke = [];
function scarStage(x, y, now = Date.now()) {
  const t = S.burned[K(x, y)];
  if (!t) return 0;
  const days = (now - t) / DAY * (estacaoId() === 'chuvosa' ? 2 : 1);
  return days < 2 ? 1 : days < 6 ? 2 : 0;
}
function flammable(x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return 0;
  const f = flamOf(tiles[y * W + x]);
  return !f || scarStage(x, y) ? 0 : f;
}
function rebuildFireSet() { fireSet = new Set(); for (const f of S.fires) for (const c of f.cells) fireSet.add(K(c.x, c.y)); }
function spawnFire() {
  const regs = FIRE_REGIONS.map(id => ({ r: regionById(id), w: S.prev[id] ? 0.4 : 1 }));
  let tot = regs.reduce((a, b) => a + b.w, 0), u = Math.random() * tot, r = regs[0].r;
  for (const g of regs) { if (u < g.w) { r = g.r; break; } u -= g.w; }
  for (let tries = 0; tries < 120; tries++) {
    const x = Math.round(r.x + (Math.random() * 2 - 1) * r.r), y = Math.round(r.y + (Math.random() * 2 - 1) * r.r);
    if (!flammable(x, y) || inPlotArea(x, y, 1) || fireSet.has(K(x, y))) continue;
    if (dist(x, y, P.x / TILE, P.y / TILE) < 8) continue;
    const f = { id: S.uid++, region: r.id, cells: [{ x, y, a: 0 }], burnt: 0, apag: 0, met: false, brig: false, brigT: 0, crew: [], causa: Math.floor(Math.random() * CAUSAS_FOGO.length), cap: 36 + 8 * Math.min(3, S.year - 1) };
    for (const [dx, dy] of [[1, 0], [0, 1]]) if (flammable(x + dx, y + dy)) f.cells.push({ x: x + dx, y: y + dy, a: 0 });
    S.fires.push(f); rebuildFireSet();
    toast(`🔥 <b>Queimada!</b> Foco de incêndio em ${r.name}. Veja a agenda 📋`, 4800); sfx.bad(); updateHUD(); save();
    return f;
  }
  return null;
}
function maybeSpawnFire() {
  if (S.decTotal < 1 || S.play < S.nextFireAt || S.fires.length >= (S.year >= 3 ? 2 : 1)) return;
  const est = estacao();
  const risk = est.risco * (1 + Math.max(0, 55 - S.stats.amb) / 50) * Math.min(1.6, 1 + 0.15 * (S.year - 1));
  const tutorial = !S.fogoTutorial && est.risco >= 0.3;
  if (tutorial || Math.random() < risk * 0.25) { if (spawnFire()) S.nextFireAt = S.play + 120 + Math.random() * 120; else S.nextFireAt = S.play + 20; }
  else S.nextFireAt = S.play + 20;
}
function burnPlantsAt(x, y) {
  for (const p of unlockedProcs()) {
    const st = S.procs[p.id], c = compOf(p);
    if (!c || st.archived) continue;
    for (let i = 0; i < c.n; i++) {
      const pl = st.planted[i]; if (!pl || stageOf(pl) >= 2) continue;
      const pp = plotPos(p, i);
      if (Math.floor(pp.x / TILE) === x && Math.floor((pp.y - 4) / TILE) === y) killMuda(p, i, 'fogo');
    }
  }
}
function extinguish(f, c, byCrew) {
  c.out = true; f.apag++;
  S.burned[K(c.x, c.y)] = Date.now() - 2.2 * DAY; // chamuscado: já em rebrota
  f.cells = f.cells.filter(z => !z.out); rebuildFireSet();
  for (let k = 0; k < 8; k++) smoke.push({ x: c.x * TILE + 8 + (Math.random() - 0.5) * 10, y: c.y * TILE + 8, vx: (Math.random() - 0.5) * 16, vy: -14 - Math.random() * 10, life: 1.6, w: 1 });
  if (!byCrew) { beep(180 + Math.random() * 60, 0.12, 'triangle', 0.06); }
}
function firesUpdate(dt) {
  for (const f of S.fires.slice()) {
    // brigada
    if (f.brig && S.play >= f.brigT && !f.crew.length && f.cells.length) {
      const c0 = f.cells[0];
      for (let k = 0; k < 2; k++) { const p = nearestWalkable(c0.x * TILE + 8 + (k ? 40 : -40), c0.y * TILE + 30); f.crew.push({ x: p.x, y: p.y, cd: 0 }); }
      toast('🧑‍🚒 A brigada chegou para ajudar!');
    }
    for (const m of f.crew) {
      let best = null, bd = 1e9;
      for (const c of f.cells) { const d = dist(m.x, m.y, c.x * TILE + 8, c.y * TILE + 14); if (d < bd) { bd = d; best = c; } }
      if (!best) break;
      if (bd > 10) { const sp = 42 * dt; m.x += (best.x * TILE + 8 - m.x) / bd * sp; m.y += (best.y * TILE + 14 - m.y) / bd * sp; m.moving = true; }
      else { m.moving = false; m.cd += dt; if (m.cd > 1.6) { m.cd = 0; extinguish(f, best, true); } }
    }
  }
  fireAcc += dt;
  if (fireAcc >= 2.5) {
    fireAcc -= 2.5;
    const seca = estacaoId() === 'seca';
    for (const f of S.fires) {
      const next = [];
      for (const c of f.cells) {
        c.a += 2.5;
        if (c.a > 26) { c.out = true; f.burnt++; S.burned[K(c.x, c.y)] = Date.now(); burnPlantsAt(c.x, c.y); continue; }
        if (f.cells.length + next.length + f.burnt + f.apag >= f.cap) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = c.x + dx, ny = c.y + dy, fl = flammable(nx, ny);
          if (!fl || fireSet.has(K(nx, ny))) continue;
          const wind = dx < 0 ? 1.6 : dx > 0 ? 0.5 : 1; // alísios de leste empurram o fogo para oeste
          if (Math.random() < 0.2 * fl * wind * (seca ? 1 : 0.5)) { next.push({ x: nx, y: ny, a: 0 }); fireSet.add(K(nx, ny)); }
        }
      }
      f.cells = f.cells.filter(c => !c.out).concat(next);
    }
    rebuildFireSet();
  }
  for (const f of S.fires.slice()) if (!f.cells.length) endFire(f);
  for (let i = smoke.length - 1; i >= 0; i--) { const s = smoke[i]; s.x += (s.vx - 8) * dt; s.y += s.vy * dt; s.life -= dt; if (s.life <= 0) smoke.splice(i, 1); }
}
function endFire(f, silent) {
  S.fires = S.fires.filter(x => x !== f); rebuildFireSet();
  const reg = regionById(f.region), ha = (f.burnt + f.apag) * 25, pen = Math.ceil(f.burnt / 5);
  S.ys.focos++; S.ys.ha += ha;
  if (pen) addStats({ amb: -pen });
  save(); updateHUD();
  if (silent) return;
  if (!f.met) { toast(`🔥 O foco em ${reg.name} apagou sozinho depois de queimar ~${ha} ha. Ninguém da SEMA foi lá.`, 5000); return; }
  addStats({ soc: 2 });
  diaria(DIARIA_FOGO, 'diária de campo');
  const cz = CAUSAS_FOGO[f.causa];
  queueSay([
    { who: 'sistema', text: `🔥 Fogo controlado em ${reg.name}! Área atingida: ~${ha} hectares. Você e a brigada apagaram ${f.apag} focos.` },
    { who: 'sistema', text: `🔎 Laudo: a perícia indicou que o fogo começou por ${cz.causa}.` },
  ], () => escolha('📝 Laudo da queimada', `O fogo começou por <b>${cz.causa}</b>. Qual o encaminhamento?`, cz.opcoes));
}
function fightFire(f, c) {
  if (!f.met) {
    escolha('🔥 ' + regionById(f.region).name, ESCOLHA_FOGO.q, ESCOLHA_FOGO.a, ch => {
      f.met = true; f.brig = true; f.brigT = S.play + (ch.ok ? 6 : 16); S.fogoTutorial = true;
    }, () => toast(inputMode === 'touch' ? '🔥 Toque <b>A</b> perto das chamas para abafar o fogo' : '🔥 Aperte <b>Espaço</b> perto das chamas para abafar o fogo', 4500));
    return;
  }
  extinguish(f, c);
}

// ---------------------------------------------------------------------
//  Eventos no mapa
// ---------------------------------------------------------------------
function okTile(tx, ty, types) {
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return false;
  return types.includes(tiles[ty * W + tx]) && canStand(tx * TILE + 8, ty * TILE + 12) && !inPlotArea(tx, ty, 1) && !fireSet.has(K(tx, ty));
}
function spawnEvent(k) {
  const E = EVENTOS[k], types = E.tiles.map(n => T[n]);
  for (const rid of shuffle(E.regions.filter(r => !(k === 'brigada' && S.prev[r])))) {
    const r = regionById(rid);
    for (let tries = 0; tries < 150; tries++) {
      const tx = Math.round(r.x + (Math.random() * 2 - 1) * r.r), ty = Math.round(r.y + (Math.random() * 2 - 1) * r.r);
      if (!okTile(tx, ty, types)) continue;
      const ev = { id: S.uid++, kind: k, region: rid, x: tx, y: ty, spots: [], met: false, done: false };
      if (E.tipo === 'coleta') {
        const cand = [];
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) if ((dx || dy) && okTile(tx + dx, ty + dy, types)) cand.push({ x: tx + dx, y: ty + dy, done: false });
        if (cand.length < E.n - 1) continue;
        ev.spots = [{ x: tx, y: ty, done: false }].concat(shuffle(cand).slice(0, E.n - 1));
      }
      S.events.push(ev);
      toast(`${E.icon} <b>${E.titulo}</b> em ${r.name}. Veja a agenda 📋`, 4500); sfx.talk(); updateHUD(); save();
      return ev;
    }
  }
  return null;
}
function maybeSpawnEvent() {
  if (S.decTotal < 2 || S.play < S.nextEventAt || S.events.length >= 2) return;
  S.nextEventAt = S.play + 150 + Math.random() * 180;
  const m = mesAtual();
  const kinds = Object.keys(EVENTOS).filter(k => {
    const E = EVENTOS[k];
    if (E.meses && !E.meses.includes(m)) return false;
    if (S.events.some(x => x.kind === k)) return false;
    if (k === 'brigada' && E.regions.every(r => S.prev[r])) return false;
    return true;
  });
  for (const k of shuffle(kinds)) if (spawnEvent(k)) return;
}
function finishEvent(ev) {
  const E = EVENTOS[ev.kind];
  ev.done = true; S.ys.eventos++;
  S.events = S.events.filter(x => x !== ev);
  if (E.tipo === 'coleta') { addStats(E.fx); sfx.ok(); queueSay([{ who: 'sistema', text: '✨ ' + E.fim }], updateHUD); }
  save(); updateHUD();
}
function atenderEvento(ev, spot) {
  const E = EVENTOS[ev.kind];
  if (E.tipo === 'decisao') {
    say([{ who: 'sistema', text: `${E.icon} ${E.intro}` }], () => escolha(`${E.icon} ${E.titulo}`, E.q, E.a, c => { if (c.prev) S.prev[ev.region] = true; finishEvent(ev); }));
    return;
  }
  if (!ev.met) {
    say([{ who: 'sistema', text: `${E.icon} ${E.intro}` }], () => escolha(`${E.icon} ${E.titulo}`, E.q, E.a.map(a => a.ok ? Object.assign({ fx: { soc: 1 } }, a) : a), () => { ev.met = true; },
      c => toast(c.ok ? `Agora é só recolher: ${E.n} pontos marcados no mapa.` : `Vou fazer do jeito certo. ${E.n} pontos para recolher.`, 3600)));
    return;
  }
  spot.done = true; sfx.plant();
  for (let k = 0; k < 10; k++) parts.push({ x: spot.x * TILE + 8, y: spot.y * TILE + 10, vx: (Math.random() - 0.5) * 40, vy: -Math.random() * 50, life: 0.7, c: ev.kind === 'oleo' ? '#2a2420' : '#c9c1b2' });
  const left = ev.spots.filter(s => !s.done).length;
  if (!left) finishEvent(ev); else { toast(`${E.icon} Faltam ${left}`); save(); }
}

// ---------------------------------------------------------------------
//  Ano de gestão e relatório anual
// ---------------------------------------------------------------------
let relTimer = null;
function checkAno() {
  if (relTimer) return;
  if (S.year === 1) { if (S.unlocked < PROCESSOS.length || PROCESSOS.some(p => S.procs[p.id].status === 'pendente')) return; }
  else if (S.ys.dec < 5) return;
  relTimer = setTimeout(() => { relTimer = null; queue(openRelatorio); }, 500);
}
function classificar() {
  const { amb, eco, soc } = S.stats;
  const avg = (amb + eco + soc) / 3, min = Math.min(amb, eco, soc);
  if (min >= 55 && avg >= 62) return ['🏅 Guardiã do Desenvolvimento Sustentável', 'Você equilibrou natureza, economia e pessoas. É exatamente isso que a economia ecológica propõe: a economia funcionando dentro dos limites do ecossistema, com justiça social.'];
  if (amb < 40) return ['🏗️ Desenvolvimento a qualquer custo', 'A economia cresceu, mas o capital natural do Ceará pagou a conta. Para a economia ecológica, perdas irreversíveis (espécies, nascentes, mangues) não se compensam só com dinheiro.'];
  if (eco < 40 || soc < 40) return ['🛑 Conservação sem diálogo', 'A natureza foi protegida, mas as pessoas ficaram sem água, energia ou emprego. Sustentabilidade forte também precisa cuidar do bem-estar humano.'];
  return ['🌿 Analista em formação', 'Bom trabalho! Algumas decisões podiam equilibrar melhor os três pilares. O próximo ano é uma nova chance.'];
}
function openRelatorio() {
  const { amb, eco, soc } = S.stats;
  const avg = (amb + eco + soc) / 3, min = Math.min(amb, eco, soc);
  const [title, txt] = classificar();
  const ys = S.ys, ano = S.year;
  let promo = '';
  if (min >= 40 && avg >= 55 && S.cargo < CARGOS.length - 1) { S.cargo++; promo = `<div class="box ok">🎉 <b>Promoção!</b> Marina agora é <b>${CARGOS[S.cargo]}</b>. Novo salário: <b>${fmtR(SALARIOS[S.cargo])}</b> 💸</div>`; }
  else if (S.cargo < CARGOS.length - 1) promo = `<div class="box warn">Para ser promovida: média dos indicadores ≥ 55 e nenhum abaixo de 40.</div>`;
  else promo = `<div class="box ok">👑 Marina está no topo da carreira: <b>${CARGOS[S.cargo]}</b>!</div>`;
  S.hist.push(Object.assign({ year: ano, amb: Math.round(amb), eco: Math.round(eco), soc: Math.round(soc), title, cargo: S.cargo }, ys));
  S.year++; S.ys = anoZerado(); S.ended = true;
  pruneGen(); save(); updateHUD();
  openModal(`<div class="final">
    <div class="finalPortrait">${MARINA_PHOTO}</div>
    <h2>📊 Relatório Anual • Ano ${ano}</h2>
    <h3>${title}</h3>
    <div class="finalStats"><div>🌳<b>${Math.round(amb)}</b><span>Ambiente</span></div><div>💰<b>${Math.round(eco)}</b><span>Economia</span></div><div>🤝<b>${Math.round(soc)}</b><span>Sociedade</span></div><div>🌱<b>${S.trees}</b><span>Mudas</span></div></div>
    <div class="relGrid">
      <div>📄<b>${ys.dec}</b><span>pareceres</span></div><div>🌱<b>${ys.mudas}</b><span>mudas plantadas</span></div><div>🌳<b>${ys.comp}</b><span>compensações cumpridas</span></div>
      <div>🔥<b>${ys.focos}</b><span>queimadas</span></div><div>🔥<b>${ys.ha}</b><span>hectares queimados</span></div><div>⚖️<b>${ys.fisc}</b><span>fiscalizações</span></div>
    </div>
    <p>${txt}</p>${promo}
    <p class="muted">No Ano ${ano + 1}: processos maiores, mais fiscalização e o fogo mais forte. O Ceará conta com você!</p>
    <p class="love">Feito com carinho para a Marina 💚</p>
    <div class="row"><button class="btn" data-close>Começar o Ano ${ano + 1} ▶</button></div>
  </div>`);
}

// ---------------------------------------------------------------------
//  Enquanto você estava fora
// ---------------------------------------------------------------------
function progressoAusencia() {
  const now = Date.now(), away = now - (S.lastSeen || now);
  S.lastSeen = now;
  const notes = [];
  const est = estacao();
  if (S.season !== estacaoId()) { S.season = estacaoId(); notes.push(`${est.icon} O tempo mudou: agora é <b>${est.nome}</b>. ${est.txt}`); }
  if (away < 20 * 60e3) return notes.length ? notes : null;
  // focos ativos foram combatidos pela brigada
  for (const f of S.fires.slice()) { for (const c of f.cells) { S.burned[K(c.x, c.y)] = now; f.burnt++; } f.cells = []; endFire(f, true); notes.push(`🔥 A brigada controlou o foco em ${regionById(f.region).name}, mas ele queimou ~${f.burnt * 25} ha.`); }
  // mudas cresceram (a comunidade ajudou a regar)
  let grown = 0;
  for (const p of unlockedProcs()) {
    const st = S.procs[p.id];
    if (st.archived) continue;
    for (const pl of st.planted) if (pl) { const before = stageOf(pl); pl.g += Math.min(away / 1000, 400); pl.w = 1; pl.d = 0; if (stageOf(pl) > before) grown++; }
  }
  if (grown) notes.push(`🌱 ${grown} muda${grown > 1 ? 's' : ''} cresce${grown > 1 ? 'ram' : 'u'} enquanto você estava fora. A comunidade ajudou a regar!`);
  // queimada enquanto ela estava fora (perda limitada, nunca mata mudas)
  const hours = away / 36e5;
  if (hours > 4 && S.decTotal >= 1 && Math.random() < Math.min(0.7, est.risco * hours / 24)) {
    const r = regionById(FIRE_REGIONS[Math.floor(Math.random() * FIRE_REGIONS.length)]);
    let n = 0;
    for (let tries = 0; tries < 200 && n < 10; tries++) {
      const x = Math.round(r.x + (Math.random() * 2 - 1) * r.r * 0.6), y = Math.round(r.y + (Math.random() * 2 - 1) * r.r * 0.6);
      if (flammable(x, y) && !inPlotArea(x, y, 1)) { S.burned[K(x, y)] = now - Math.random() * Math.min(away, DAY); n++; }
    }
    if (n) { addStats({ amb: -2 }); S.ys.focos++; S.ys.ha += n * 25; notes.push(`🔥 Houve uma queimada em ${r.name} (~${n * 25} ha). Os bombeiros apagaram. A cicatriz vai se recuperar aos poucos.`); }
  }
  const pend = pendentes();
  if (pend) notes.push(`📥 ${pend} processo${pend > 1 ? 's' : ''} esperando parecer na SEMA.`);
  const fus = S.followups.filter(f => !f.done && f.on).length;
  if (fus) notes.push(`📣 ${fus} ${fus > 1 ? 'fiscalizações pendentes' : 'fiscalização pendente'}.`);
  const d = Math.floor(hours / 24);
  notes.unshift(`<b>Você ficou ${d >= 1 ? d + (d > 1 ? ' dias' : ' dia') : Math.max(1, Math.round(hours)) + (Math.round(hours) > 1 ? ' horas' : ' hora')} fora.</b>`);
  return notes;
}
function mostrarAusencia(notes) {
  if (!notes || !notes.length) return;
  queue(() => openModal(`<div class="mHead"><h2>🗞️ Enquanto você estava fora…</h2><button class="x" data-close>✕</button></div>
    ${notes.map(n => `<p>${n}</p>`).join('')}<div class="row"><button class="btn" data-close>Bora trabalhar!</button></div>`));
}

// ---------------------------------------------------------------------
//  Menu, backup e estação
// ---------------------------------------------------------------------
function codigoBackup() { save(); return 'MARINA1:' + btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
function lerBackup(code) {
  const raw = code.trim().replace(/^MARINA1:/, '');
  const s = JSON.parse(decodeURIComponent(escape(atob(raw))));
  if (!s || !s.procs || !s.stats) throw new Error('inválido');
  return migrate(s);
}
function openMenu() {
  const h = Math.floor(S.play / 3600), mi = Math.floor(S.play % 3600 / 60);
  const est = estacao();
  const m = openModal(`<div class="mHead"><h2>⚙️ Marina • ${CARGOS[S.cargo]}</h2><button class="x" data-close>✕</button></div>
    <div class="kv"><span>Carteira</span><b>👛 ${fmtR(S.carteira)} • salário ${fmtR(SALARIOS[S.cargo])}</b></div>
    <div class="kv"><span>Ano de gestão</span><b>${S.year} (${S.ys.dec} pareceres este ano)</b></div>
    <div class="kv"><span>Tempo de jogo</span><b>${h}h ${mi}min</b></div>
    <div class="kv"><span>Árvores vivas</span><b>${countVivas()} (${S.dead} mudas perdidas)</b></div>
    <div class="kv"><span>Estação</span><b>${est.icon} ${est.nome} • ${MESES[mesAtual() - 1]}</b></div>
    <div class="box ok small">💾 O jogo salva sozinho neste aparelho. Para não perder: no iPhone, use <b>Compartilhar → Adicionar à Tela de Início</b> e guarde um código de backup de vez em quando.</div>
    <h3>Backup</h3>
    <textarea id="bk" rows="3" placeholder="Cole aqui um código de backup para restaurar"></textarea>
    <div class="row"><button class="btn ghost" id="bkCopy">📋 Gerar código</button><button class="btn ghost" id="bkLoad">📥 Restaurar</button></div>
    ${postaisHTML()}
    ${S.hist.length ? `<h3>Relatórios anteriores</h3>${S.hist.map(r => `<div class="task"><span class="ti">📊</span><div><div><b>Ano ${r.year}</b>: ${r.title}</div><small class="muted">🌳${r.amb} 💰${r.eco} 🤝${r.soc} • ${r.dec} pareceres • ${r.ha} ha queimados</small></div></div>`).join('')}` : ''}
    <div class="row"><button class="btn ghost" id="visual">👗 Guarda-roupa</button><button class="btn ghost" id="season">${est.icon} Sobre a estação</button><button class="btn ghost danger" id="reset">🔄 Novo jogo</button></div>`);
  const ta = m.querySelector('#bk');
  m.querySelector('#bkCopy').onclick = () => {
    const c = codigoBackup(); ta.value = c; ta.select();
    try { navigator.clipboard.writeText(c).then(() => toast('📋 Código copiado! Guarde num lugar seguro (WhatsApp, notas…)'), () => toast('Selecione e copie o código acima')); } catch (e) { toast('Selecione e copie o código acima'); }
  };
  m.querySelector('#bkLoad').onclick = () => {
    try { S = lerBackup(ta.value); save(); closeModal(); startGame(false); toast('✅ Backup restaurado!'); } catch (e) { toast('❌ Código inválido'); }
  };
  m.querySelector('#season').onclick = openEstacao;
  m.querySelector('#visual').onclick = openVisual;
  const mem = m.querySelector('#memPacoti'); if (mem) mem.onclick = () => openMemoriaPacoti(false);
  let armed = false;
  m.querySelector('#reset').onclick = e => {
    if (!armed) { armed = true; e.target.textContent = 'Toque de novo para apagar tudo'; return; }
    closeModal(); resetGame();
  };
}
function openEstacao() {
  const est = estacao(), m = mesAtual();
  openModal(`<div class="mHead"><h2>${est.icon} ${est.nome}</h2><button class="x" data-close>✕</button></div>
    <p>${est.txt}</p>
    <div class="kv"><span>Mês</span><b>${MESES[m - 1]} (calendário real)</b></div>
    <div class="kv"><span>Risco de queimadas</span><b>${est.risco >= 0.8 ? '🔴 Alto' : est.risco >= 0.3 ? '🟡 Médio' : '🟢 Baixo'}</b></div>
    <div class="kv"><span>Mudas</span><b>${est.sede ? '💧 precisam de rega' : '🌧️ a chuva rega'}</b></div>
    <div class="legend small">No jogo, as estações seguem o calendário de verdade do Ceará. Volte em outra época do ano e o sertão vai estar diferente!</div>`);
}
function countVivas() {
  let n = S.forest.length;
  for (const p of unlockedProcs()) { const st = S.procs[p.id]; if (!st.archived) n += st.planted.filter(Boolean).length; }
  return n;
}

// ---------------------------------------------------------------------
//  Tarefas, interações e marcadores do mundo vivo
// ---------------------------------------------------------------------
function tasksMundo(out) {
  for (const f of S.fires) { const c = f.cells[0]; out.unshift({ icon: '🔥', txt: `Queimada em ${regionById(f.region).name}! Combater o foco`, where: regionById(f.region).sub, go: { x: c.x * TILE + 8, y: c.y * TILE + 34 }, done: false, urgent: true }); }
  for (const ev of S.events) {
    const E = EVENTOS[ev.kind], left = ev.spots.filter(s => !s.done).length;
    out.push({ icon: E.icon, txt: E.titulo + (E.tipo === 'coleta' && ev.met ? ` (faltam ${left})` : ''), where: regionById(ev.region).name, go: { x: ev.x * TILE + 8, y: ev.y * TILE + 26 }, done: false });
  }
  for (const fu of S.followups) {
    if (!fu.on || fu.done) continue;
    const p = procById(fu.pid);
    out.push({ icon: fu.tipo === 'ruim' ? '📣' : '⚖️', txt: (fu.tipo === 'ruim' ? 'Denúncia sobre: ' : 'Fiscalizar condicionantes: ') + p.titulo, where: regionById(p.region).name, go: { x: p.site.x * TILE + 8, y: (p.site.y + 1) * TILE + 8 }, done: false });
  }
}
function mundoInteractables(out) {
  for (const f of S.fires) {
    let best = null, bd = 1e9;
    for (const c of f.cells) { const d = dist(P.x, P.y, c.x * TILE + 8, c.y * TILE + 12); if (d < bd) { bd = d; best = c; } }
    if (best && bd < 34) out.push({ x: P.x + (best.x * TILE + 8 - P.x) * 0.6, y: P.y + (best.y * TILE + 12 - P.y) * 0.6, label: f.met ? 'Abafar fogo' : 'Queimada!', icon: '🔥', fn: () => fightFire(f, best) });
  }
  for (const ev of S.events) {
    const E = EVENTOS[ev.kind];
    if (E.tipo === 'decisao') out.push({ x: ev.x * TILE + 8, y: ev.y * TILE + 12, label: 'Atender', icon: E.icon, fn: () => atenderEvento(ev) });
    else for (const s of ev.spots) if (!s.done) out.push({ x: s.x * TILE + 8, y: s.y * TILE + 12, label: ev.met ? E.coletaLabel : 'Atender', icon: E.icon, fn: () => atenderEvento(ev, s) });
  }
  for (const fu of S.followups) {
    if (!fu.on || fu.done) continue;
    const p = procById(fu.pid);
    out.push({ x: p.site.x * TILE + 8, y: p.site.y * TILE + 12, label: 'Fiscalizar', icon: '⚖️', fn: () => doFiscal(fu) });
  }
  for (const p of unlockedProcs()) {
    if (!needsWater(p)) continue;
    const st = S.procs[p.id];
    st.planted.forEach((pl, i) => { if (pl && stageOf(pl) < 2 && pl.w < 0.6) { const pp = plotPos(p, i); out.push({ x: pp.x, y: pp.y, label: 'Regar mudas', icon: '💧', fn: () => regar(p) }); } });
  }
}
function mundoMapMarkers(dot) {
  for (const p of unlockedProcs()) if (needsWater(p)) dot(p.plots.x * 4 + 8, p.plots.y * 4 + 6, '#5ab4f0', 4);
  for (const fu of S.followups) if (fu.on && !fu.done) { const p = procById(fu.pid); dot(p.site.x * 4, p.site.y * 4, '#8e4fb0'); }
  for (const ev of S.events) dot(ev.x * 4, ev.y * 4, '#f08a2a');
  for (const f of S.fires) for (const c of f.cells) dot(c.x * 4 + 2, c.y * 4 + 2, '#e2442f', 3);
}

// ---------------------------------------------------------------------
//  Atualização por frame
// ---------------------------------------------------------------------
let mundoAcc = 0;
function mundoUpdate(dt) {
  S.play += dt;
  if (uiBusy()) return;
  if (msgQ.length) { msgQ.shift()(); return; }
  plantsUpdate(dt);
  firesUpdate(dt);
  for (const fu of S.followups) if (!fu.on && !fu.done && S.play >= fu.due) {
    fu.on = true; const p = procById(fu.pid);
    toast(fu.tipo === 'ruim' ? `📣 <b>Denúncia!</b> Problemas em “${p.titulo}”. Veja a agenda 📋` : `⚖️ Hora de fiscalizar as condicionantes de “${p.titulo}”.`, 4800);
    sfx.talk(); updateHUD();
  }
  mundoAcc += dt;
  if (mundoAcc >= 3) {
    mundoAcc = 0;
    if (S.season !== estacaoId()) { S.season = estacaoId(); const e = estacao(); queueSay([{ who: 'sistema', text: `${e.icon} Começou: ${e.nome}. ${e.txt}` }]); }
    ensureProcs(); maybeSpawnFire(); maybeSpawnEvent();
    S.lastSeen = Date.now();
    updateHUD();
  }
}

// ---------------------------------------------------------------------
//  Desenho do mundo vivo
// ---------------------------------------------------------------------
const variantCache = new Map();
function spriteVariant(spr, kind) {
  let m = variantCache.get(spr); if (!m) { m = {}; variantCache.set(spr, m); }
  if (m[kind]) return m[kind];
  const c = mkCanvas(spr.width, spr.height, g => g.drawImage(spr, 0, 0)); c.hd = spr.hd;
  const g = c.getContext('2d'), id = g.getImageData(0, 0, c.width, c.height), d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const r = d[i], gg = d[i + 1], b = d[i + 2], l = (r + gg + b) / 3;
    if (kind === 'burnt') { const v = l * 0.28 + 18; d[i] = v + 6; d[i + 1] = v; d[i + 2] = v - 4; }
    else if (kind === 'dry' && gg > r && gg > b) { d[i] = l * 0.75 + 55; d[i + 1] = l * 0.62 + 45; d[i + 2] = l * 0.45 + 30; }
    else if (kind === 'wilt' && gg >= r) { d[i] = l * 0.8 + 60; d[i + 1] = l * 0.65 + 40; d[i + 2] = l * 0.35 + 20; }
  }
  g.putImageData(id, 0, 0);
  m[kind] = c; return c;
}
let crewSpr = null;
// mancha irregular (em vez de quadrado) cobrindo um tile, para fogo e cicatrizes
function blob(x, y, col, r = 7) {
  const h = hash2(x, y), X = x * TILE + 8, Y = y * TILE + 8;
  disc(ctx, X - 3 + (h * 4 | 0), Y - 2, r - 1, col); disc(ctx, X + 3 - (h * 13 % 4 | 0), Y + 2, r - 1, col); disc(ctx, X, Y, r - 2, col);
}
let tintCv = null;
function drawGroundMundo(tx0, ty0, tx1, ty1) {
  const id = estacaoId(), now = Date.now();
  // cor da estação só na Caatinga, seguindo as bordas orgânicas do chão
  const tint = id === 'seca' ? 'rgba(175,140,105,0.30)' : id === 'chuvosa' ? 'rgba(70,165,60,0.50)' : id === 'preChuva' ? 'rgba(120,160,80,0.18)' : null;
  if (tint && caatMask) {
    const x0 = Math.max(0, tx0 * TILE), y0 = Math.max(0, ty0 * TILE), w = Math.min(W * TILE, (tx1 + 1) * TILE) - x0, h = Math.min(H * TILE, (ty1 + 1) * TILE) - y0;
    if (w > 0 && h > 0) {
      if (!tintCv) tintCv = document.createElement('canvas');
      if (tintCv.width < w || tintCv.height < h) { tintCv.width = Math.max(w, tintCv.width); tintCv.height = Math.max(h, tintCv.height); }
      const tg = tintCv.getContext('2d');
      tg.globalCompositeOperation = 'copy'; tg.drawImage(caatMask, x0, y0, w, h, 0, 0, w, h);
      tg.globalCompositeOperation = 'source-in'; tg.fillStyle = tint; tg.fillRect(0, 0, w, h);
      tg.globalCompositeOperation = 'source-over';
      ctx.drawImage(tintCv, 0, 0, w, h, x0, y0, w, h);
    }
  }
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const sc = scarStage(x, y, now);
    if (sc === 1) {
      blob(x, y, 'rgba(38,30,26,0.55)');
      ctx.fillStyle = '#8a8078'; const h = hash2(x, y); ctx.fillRect(x * TILE + (h * 13 | 0), y * TILE + (h * 97 % 13 | 0), 2, 1); ctx.fillRect(x * TILE + (h * 41 % 14 | 0), y * TILE + (h * 7 % 14 | 0), 1, 1);
    } else if (sc === 2) {
      blob(x, y, 'rgba(80,66,50,0.25)');
      ctx.fillStyle = '#7ac25a'; const h = hash2(x, y); ctx.fillRect(x * TILE + (h * 13 | 0), y * TILE + (h * 97 % 13 | 0), 1, 2); ctx.fillRect(x * TILE + (h * 41 % 14 | 0), y * TILE + (h * 7 % 14 | 0), 1, 2);
    }
  }
  for (const f of S.fires) for (const c of f.cells) {
    blob(c.x, c.y, 'rgba(50,25,10,0.4)', 8);
    blob(c.x, c.y, `rgba(255,${(110 + Math.sin(time * 9 + c.x) * 40) | 0},30,0.25)`, 7);
  }
}
function decoSprite(d) {
  if (d.tx !== undefined) { const sc = scarStage(d.tx, d.ty); if (sc === 1) return spriteVariant(d.spr, 'burnt'); if (sc === 2 && d.dry) return spriteVariant(d.spr, 'dry'); }
  if (d.dry && estacaoId() === 'seca') return spriteVariant(d.spr, 'dry');
  return d.spr;
}
function plantDraw(pl) {
  let spr = plantedSprite(pl.sp, stageOf(pl));
  if (stageOf(pl) < 2 && pl.w <= 0) spr = spriteVariant(spr, 'wilt');
  return spr;
}
function mundoDraws(draws, inView) {
  for (const t of S.forest) {
    const spr = plantedSprite(t.sp, 2), w = dW(spr), h = dH(spr);
    if (!inView(t.x - 10, t.y - h, 20, h)) continue;
    const sc = scarStage(Math.floor(t.x / TILE), Math.floor((t.y - 4) / TILE));
    draws.push({ y: t.y, f: () => ctx.drawImage(sc === 1 ? spriteVariant(spr, 'burnt') : spr, Math.round(t.x - w / 2), Math.round(t.y - h + 2), w, h) });
  }
  for (const f of S.fires) for (const c of f.cells) {
    const x = c.x * TILE, y = c.y * TILE;
    if (!inView(x, y - 12, 16, 28)) continue;
    draws.push({ y: y + 13, f: () => {
      for (let k = 0; k < 3; k++) {
        const fx = x + 2 + k * 4 + ((hash2(c.x * 3 + k, c.y) * 3) | 0), h = 5 + Math.abs(Math.sin(time * 10 + k * 2 + c.x * 1.3 + c.y)) * 7;
        R(ctx, fx, y + 13 - h, 3, h, '#e2442f'); R(ctx, fx, y + 13 - h * 0.7, 3, h * 0.7, '#ff8a2a'); R(ctx, fx + 1, y + 13 - h * 0.4, 1, h * 0.4, '#ffdd55');
      }
    } });
    if (Math.random() < 0.06) smoke.push({ x: x + 8, y: y + 2, vx: (Math.random() - 0.5) * 6, vy: -12 - Math.random() * 8, life: 2.2, w: 0 });
  }
  if (!crewSpr) { const lk = { skin: '#8a5a3a', hair: '#222', shirt: '#d8a020', calca: '#3a3a3a', chapeu: { forma: 'bone', a: '#f2c230', b: '#c0392b', c: '#c0392b' } }; crewSpr = { parado: buildPerson(lk), andando: buildPerson(lk, true) }; }
  for (const f of S.fires) for (const m of f.crew) draws.push({ y: m.y, f: () => { shadow(m.x, m.y); ctx.drawImage(m.moving ? crewSpr.andando[Math.floor(time * 6) % 2] : crewSpr.parado[0], Math.round(m.x) - 8, Math.round(m.y) - 23.5, 16, 24); } });
  // manchas de óleo / lixo
  for (const ev of S.events) {
    const E = EVENTOS[ev.kind];
    if (E.tipo !== 'coleta') continue;
    for (const s of ev.spots) {
      if (s.done) continue;
      const x = s.x * TILE, y = s.y * TILE;
      if (ev.kind === 'oleo') { ctx.fillStyle = '#1e1a18'; ctx.fillRect(x + 3, y + 7, 9, 4); ctx.fillRect(x + 5, y + 5, 5, 8); ctx.fillStyle = '#4a4440'; ctx.fillRect(x + 5, y + 6, 2, 1); }
      else { R(ctx, x + 3, y + 8, 4, 3, '#e2e2e2'); R(ctx, x + 8, y + 6, 3, 5, '#3a7ac8'); R(ctx, x + 10, y + 10, 4, 2, '#e2553a'); R(ctx, x + 6, y + 4, 2, 2, '#f2c230'); }
    }
  }
}
function drawOverMundo(inView) {
  for (const s of smoke) { ctx.globalAlpha = Math.max(0, Math.min(1, s.life / 2)) * 0.55; ctx.fillStyle = s.w ? '#e8eef2' : '#5a5450'; ctx.fillRect(s.x, s.y, 4, 4); }
  ctx.globalAlpha = 1;
  // ícones de eventos e fiscalização
  ctx.textAlign = 'center'; ctx.font = '11px sans-serif';
  const bob = Math.sin(time * 4) * 2;
  for (const ev of S.events) { const x = ev.x * TILE + 8, y = ev.y * TILE - 10 + bob; if (!inView(x - 8, y - 12, 16, 16)) continue; ctx.fillStyle = 'rgba(255,255,255,.85)'; disc(ctx, x, y - 4, 8, 'rgba(255,255,255,.85)'); ctx.fillText(EVENTOS[ev.kind].icon, x, y); }
  for (const fu of S.followups) { if (!fu.on || fu.done) continue; const p = procById(fu.pid), x = p.site.x * TILE + 8, y = p.site.y * TILE - 10 + bob; if (!inView(x - 8, y - 12, 16, 16)) continue; disc(ctx, x, y - 4, 8, 'rgba(255,255,255,.85)'); ctx.fillText(fu.tipo === 'ruim' ? '📣' : '⚖️', x, y); }
  // gotinha nas mudas com sede
  for (const p of unlockedProcs()) {
    const st = S.procs[p.id], c = compOf(p);
    if (!c || st.archived) continue;
    for (let i = 0; i < c.n; i++) { const pl = st.planted[i]; if (!pl || stageOf(pl) >= 2 || pl.w >= 0.35) continue; const pp = plotPos(p, i); R(ctx, pp.x - 1, pp.y - 22 + bob, 3, 4, '#3a9ae0'); R(ctx, pp.x, pp.y - 24 + bob, 1, 2, '#3a9ae0'); }
  }
}
const rainDrops = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 0.6 }));
function drawScreenMundo() {
  if (!raining()) return;
  ctx.fillStyle = 'rgba(30,50,80,0.12)'; ctx.fillRect(0, 0, VW, VH);
  ctx.strokeStyle = 'rgba(200,225,255,0.55)'; ctx.lineWidth = 1; ctx.beginPath();
  for (const d of rainDrops) {
    const y = ((d.y + time * 1.4 * d.s) % 1) * VH, x = ((d.x - time * 0.15 * d.s) % 1 + 1) % 1 * VW;
    ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 10);
  }
  ctx.stroke();
}
