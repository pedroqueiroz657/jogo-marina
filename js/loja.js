// =====================================================================
//  Salário, lojas (Mercado Central e Brechó do Benfica) e visual da Marina.
//  - A cada 2 pareceres cai um salário, que cresce com o cargo.
//  - Diárias de campo pagam vistorias fora de Fortaleza e combate a queimadas.
//  - Roupas e penteados comprados ficam no guarda-roupa (S.roupas);
//    o que ela está vestindo fica em S.visual (um item por parte do corpo).
// =====================================================================

const SALARIOS = [3500, 5000, 7000, 9500, 13000];   // um por cargo (CARGOS em data-mundo.js)
const PARECERES_POR_SALARIO = 2;
const DIARIA_CAMPO = 150, DIARIA_FOGO = 250;

const LOJAS = {
  mercado: { nome: 'Mercado Central', icon: '🛍️', sub: 'Roupas, artesanato cearense e salão de beleza', x: 42.5 * TILE, y: 16 * TILE + 6 },
  brecho: { nome: 'Brechó do Benfica', icon: '♻️', sub: 'Roupa usada, estilo novo', x: 46 * TILE, y: 22 * TILE + 6 },
};
const SLOTS = { cabelo: '💇 Penteado', blusa: '👚 Blusa', baixo: '👖 Calça, saia e short', sapato: '👟 Sapatos', cabeca: '👒 Na cabeça', rosto: '🕶️ Óculos' };
const OPCIONAIS = ['cabeca', 'rosto'];   // partes que podem ficar sem nada

// pal: cores que trocam na paleta da Marina (ver MH em sprites.js)
//   blusa: C/c = tecido e sombra, U/Y/G/O = estampa • baixo: J/j • sapato: F/f
// loja: 'inicial' (já vem no guarda-roupa), 'mercado', 'salao' (no Mercado) ou 'brecho'
const ITENS = [
  // ----- penteados (salão do Mercado Central) -----
  { id: 'solto', slot: 'cabelo', loja: 'inicial', preco: 0, nome: 'Cabelo solto', desc: 'O jeitinho de sempre.' },
  { id: 'rabo', slot: 'cabelo', loja: 'salao', preco: 120, nome: 'Rabo de cavalo de lado', desc: 'Prático para vistoria debaixo do sol do sertão.' },
  { id: 'coque', slot: 'cabelo', loja: 'salao', preco: 180, nome: 'Coque alto', desc: 'Elegante para reunião do Conselho Estadual do Meio Ambiente.' },
  { id: 'chanel', slot: 'cabelo', loja: 'salao', preco: 350, nome: 'Corte chanel', desc: 'Na altura do queixo. Comprou uma vez, pode trocar quando quiser.' },

  // ----- blusas -----
  { id: 'estampada', slot: 'blusa', loja: 'inicial', preco: 0, nome: 'Blusa estampada', desc: 'A favorita, da foto.' },
  { id: 'camisaSema', slot: 'blusa', loja: 'inicial', preco: 0, nome: 'Camisa de campo da SEMA', desc: 'Uniforme de vistoria.', pal: { C: '#3f8f5a', c: '#2f7a46', U: '#3f8f5a', Y: '#3f8f5a', G: '#3f8f5a', O: '#f2f2e6' } },
  { id: 'rosaLinho', slot: 'blusa', loja: 'mercado', preco: 480, nome: 'Blusa rosa de linho', desc: 'Fresquinha para o calor de Fortaleza.', pal: { C: '#f2b3c0', c: '#d98fa0', U: '#f2b3c0', Y: '#f8d0d8', G: '#f2b3c0', O: '#f8d0d8' } },
  { id: 'chita', slot: 'blusa', loja: 'mercado', preco: 650, nome: 'Bata de chita', desc: 'Florida e colorida como festa junina.', pal: { C: '#d8433a', c: '#b5302a', U: '#2a5ba8', Y: '#f2c230', G: '#5fa84a', O: '#ffffff' },
    nota: 'A chita é um tecido de algodão barato e florido que virou símbolo da cultura nordestina, das quadrilhas juninas ao maracatu.' },
  { id: 'renda', slot: 'blusa', loja: 'mercado', preco: 1600, nome: 'Blusa de renda de bilro', desc: 'Feita à mão pelas rendeiras de Aquiraz.', pal: { C: '#fbfaf3', c: '#e6e0cf', U: '#ddd6c2', Y: '#ddd6c2', G: '#ddd6c2', O: '#ddd6c2' }, fx: { soc: 1 },
    nota: 'A renda de bilro é um saber passado de mãe para filha no litoral cearense. Comprar direto de quem faz mantém o dinheiro na comunidade: é a economia local girando.' },
  { id: 'listrada', slot: 'blusa', loja: 'brecho', preco: 90, nome: 'Blusa listrada marinheira', desc: 'Usada, mas novinha em folha.', pal: { C: '#f4f4ee', c: '#d8d8cf', U: '#2a3f7a', Y: '#2a3f7a', G: '#2a3f7a', O: '#2a3f7a' }, fx: { amb: 1 } },
  { id: 'amarela', slot: 'blusa', loja: 'brecho', preco: 70, nome: 'Blusa amarela vintage', desc: 'Achado dos anos 80, estampa riscada.', pal: { C: '#f2c230', c: '#d9a21e', U: '#fff6d0', Y: '#fff6d0', G: '#fff6d0', O: '#fff6d0' }, fx: { amb: 1 } },

  // ----- calças, saias e shorts -----
  { id: 'jeans', slot: 'baixo', loja: 'inicial', preco: 0, nome: 'Calça jeans', desc: 'Básica e resistente.', tipo: 'calca' },
  { id: 'calcaBege', slot: 'baixo', loja: 'mercado', preco: 380, nome: 'Calça de linho bege', desc: 'Para os dias de reunião.', tipo: 'calca', pal: { J: '#cbb68c', j: '#a8946a' } },
  { id: 'saiaChita', slot: 'baixo', loja: 'mercado', preco: 520, nome: 'Saia rodada de chita', desc: 'Rodada de verdade.', tipo: 'saia', pal: { J: '#e0703a', j: '#b5502a' } },
  { id: 'saiaJeans', slot: 'baixo', loja: 'brecho', preco: 60, nome: 'Saia jeans', desc: 'Garimpada no brechó.', tipo: 'saia', pal: { J: '#4a6a98', j: '#38557f' }, fx: { amb: 1 } },
  { id: 'shortBranco', slot: 'baixo', loja: 'brecho', preco: 50, nome: 'Short branco', desc: 'Para o fim de semana na praia.', tipo: 'short', pal: { J: '#eeeee6', j: '#cfcfc4' }, fx: { amb: 1 } },

  // ----- sapatos -----
  { id: 'botaMarrom', slot: 'sapato', loja: 'inicial', preco: 0, nome: 'Sapato marrom', desc: 'Confortável.', pal: { F: '#8a5232', f: '#5e3420' } },
  { id: 'tenis', slot: 'sapato', loja: 'mercado', preco: 320, nome: 'Tênis branco', desc: 'Para andar muito.', pal: { F: '#f4f4f0', f: '#c4c4bc' } },
  { id: 'sandaliaCouro', slot: 'sapato', loja: 'mercado', preco: 260, nome: 'Sandália de couro do Cariri', desc: 'Artesanato de Juazeiro do Norte.', pal: { F: '#c8894a', f: '#8a5226' }, fx: { soc: 1 },
    nota: 'O couro trabalhado do Cariri vem da tradição dos vaqueiros e sustenta muitas famílias artesãs em Juazeiro do Norte e no Crato.' },
  { id: 'botina', slot: 'sapato', loja: 'mercado', preco: 450, nome: 'Botina de campo', desc: 'Protege de espinho de jurema e de cobra.', pal: { F: '#3e2a1c', f: '#22160e' } },
  { id: 'rasteira', slot: 'sapato', loja: 'brecho', preco: 40, nome: 'Rasteirinha rosa', desc: 'Leve e sem salto.', pal: { F: '#e88aa8', f: '#c06a88' }, fx: { amb: 1 } },

  // ----- na cabeça -----
  { id: 'chapeuPalha', slot: 'cabeca', loja: 'mercado', preco: 220, nome: 'Chapéu de palha de carnaúba', desc: 'Trançado pelas artesãs do Jaguaribe.', acc: { forma: 'chapeu', a: '#e6c46a', b: '#c9a24a', c: '#8a5232' }, fx: { soc: 1 },
    nota: 'A palha da carnaúba, a “árvore da vida”, vira chapéu, bolsa e esteira. Usar a palha sem derrubar a palmeira é uso sustentável da Caatinga.' },
  { id: 'bone', slot: 'cabeca', loja: 'mercado', preco: 90, nome: 'Boné da SEMA', desc: 'Para o sol das vistorias.', acc: { forma: 'bone', a: '#2f7a46', b: '#225a34', c: '#f2c230' } },
  { id: 'chapeuCouro', slot: 'cabeca', loja: 'mercado', preco: 900, nome: 'Chapéu de couro de vaqueiro', desc: 'Com estrelinhas, do jeito dos Inhamuns.', acc: { forma: 'chapeu', a: '#8a5232', b: '#5e3420', c: '#3e2214', enfeite: '#f2c230' },
    nota: 'O chapéu de couro protegia o vaqueiro dos galhos da Caatinga. Hoje é símbolo do sertão e da cultura do Ceará.' },
  { id: 'flor', slot: 'cabeca', loja: 'brecho', preco: 25, nome: 'Flor de hibisco no cabelo', desc: 'Um toque de cor.', acc: { forma: 'flor', a: '#e2453a', c: '#f2c230' }, fx: { amb: 1 } },
  { id: 'tiara', slot: 'cabeca', loja: 'brecho', preco: 30, nome: 'Tiara de pérolas', desc: 'Da vovó de alguém.', acc: { forma: 'tiara', a: '#f4f0e6', c: '#ffffff' }, fx: { amb: 1 } },

  // ----- óculos -----
  { id: 'oculosSol', slot: 'rosto', loja: 'mercado', preco: 280, nome: 'Óculos escuros', desc: 'Indispensáveis no litoral.', acc: { forma: 'sol', a: '#1e1e2a' } },
  { id: 'oculosGrau', slot: 'rosto', loja: 'mercado', preco: 600, nome: 'Óculos de leitura', desc: 'Para ler os estudos de impacto (EIA/RIMA) até o fim.', acc: { forma: 'grau', a: '#6a2a2a' } },
];
const itemById = id => ITENS.find(i => i.id === id);
const NOTA_BRECHO = 'Brechó é economia circular: a roupa continua em uso em vez de virar lixo. Produzir uma única calça jeans pode gastar cerca de 7.500 litros de água, segundo a ONU. Comprar usado evita esse impacto.';

function visualPadrao() { return { cabelo: 'solto', blusa: 'estampada', baixo: 'jeans', sapato: 'botaMarrom', cabeca: null, rosto: null }; }
function roupasIniciais() { return ITENS.filter(i => i.loja === 'inicial').map(i => i.id); }

// Converte o visual salvo (ids) nas cores e formas que sprites.js desenha
function lookSpec(v = S.visual) {
  const spec = { cabelo: 'solto', baixo: 'calca', cabeca: null, rosto: null, pal: {} };
  for (const slot in SLOTS) {
    const it = itemById(v && v[slot]);
    if (!it || it.slot !== slot) continue;
    if (it.pal) Object.assign(spec.pal, it.pal);
    if (slot === 'cabelo') spec.cabelo = it.id;
    else if (slot === 'baixo') spec.baixo = it.tipo;
    else if (slot === 'cabeca' || slot === 'rosto') spec[slot] = it.acc;
  }
  return spec;
}
function vestirMarina() { MARINA = buildMarina(lookSpec()); }

// ---------------------------------------------------------------------
//  Dinheiro
// ---------------------------------------------------------------------
const fmtR = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
function ganhar(v, txt) {
  S.carteira += v; S.ys.ganhos = (S.ys.ganhos || 0) + v;
  updateHUD(); floatText(`👛 +${fmtR(v)}${txt ? ' • ' + txt : ''}`);
  beep(988, 0.06, 'square', 0.04); beep(1319, 0.12, 'square', 0.04, 0.07);
}
// chamada depois de cada parecer assinado
function contarParecer() {
  S.trab++;
  if (S.trab < PARECERES_POR_SALARIO) return;
  S.trab = 0;
  const v = SALARIOS[S.cargo];
  ganhar(v, 'salário');
  toast(`💸 <b>Caiu o salário!</b> ${CARGOS[S.cargo]}: +${fmtR(v)}`, 4200);
  if (!S.dicaSalario) {
    S.dicaSalario = true;
    queueSay([
      { who: 'sistema', text: `💸 Seu salário caiu: ${fmtR(v)}! A cada ${PARECERES_POR_SALARIO} pareceres entra um contracheque, e ele aumenta quando você é promovida.` },
      { who: 'marina', text: 'Opa! Acho que mereço uma roupinha nova… 🛍️' },
      { who: 'sistema', text: '🛍️ O Mercado Central e o Brechó do Benfica ficam em Fortaleza. Toque no 👛 para trocar de visual com o que já tem.' },
    ]);
  }
  save();
}
function diaria(v, txt) { ganhar(v, txt); save(); }

// ---------------------------------------------------------------------
//  Prévias
// ---------------------------------------------------------------------
const thumbCache = new Map();
function thumb(visual, dir = 'down') {
  const key = JSON.stringify(visual) + dir;
  if (!thumbCache.has(key)) {
    if (thumbCache.size > 300) thumbCache.clear();
    thumbCache.set(key, marinaPose(lookSpec(visual), dir).toDataURL());
  }
  return thumbCache.get(key);
}
function previewHTML(visual) {
  return `<div class="look4">${['down', 'right', 'up', 'left'].map(d => `<img src="${thumb(visual, d)}" alt="">`).join('')}</div>`;
}
function itemCardHTML(it, visual, actions) {
  const v = Object.assign({}, visual, { [it.slot]: it.id });
  return `<div class="item ${visual[it.slot] === it.id ? 'on' : ''}">
    <img class="itemImg" src="${thumb(v)}" alt="">
    <div class="itemTxt"><b>${it.nome}</b><small>${it.desc}</small></div>
    <div class="itemAct">${actions}</div></div>`;
}

// ---------------------------------------------------------------------
//  Lojas
// ---------------------------------------------------------------------
function openLoja(id) {
  const L = LOJAS[id];
  const prova = Object.assign({}, S.visual);   // o que ela está provando
  const itens = ITENS.filter(i => id === 'mercado' ? (i.loja === 'mercado' || i.loja === 'salao') : i.loja === id);
  if (!S.lojasVistas.includes(id)) S.lojasVistas.push(id);
  const m = openModal('', 'lojaModal');
  const render = () => {
    const sc = m.scrollTop;
    const slots = Object.keys(SLOTS).filter(s => itens.some(i => i.slot === s));
    m.innerHTML = `<div class="mHead"><h2>${L.icon} ${L.nome}</h2><button class="x" data-close>✕</button></div>
      <div class="lojaTop">${previewHTML(prova)}<div class="wallet big">👛 <b>${fmtR(S.carteira)}</b><small>Salário: ${fmtR(SALARIOS[S.cargo])} a cada ${PARECERES_POR_SALARIO} pareceres</small></div></div>
      ${id === 'brecho' ? `<div class="box ok small">♻️ ${NOTA_BRECHO}</div>` : ''}
      ${slots.map(s => `<h3>${s === 'cabelo' ? '💇 Salão de beleza' : SLOTS[s]}</h3>` + itens.filter(i => i.slot === s).map(it => {
        const tem = S.roupas.includes(it.id), vestindo = S.visual[it.slot] === it.id, provando = prova[it.slot] === it.id;
        let act;
        if (tem) act = vestindo ? `<span class="tag ok">Vestindo ✓</span>` : `<button class="btn sm" data-vestir="${it.id}">Vestir</button>`;
        else act = `${provando ? '<span class="tag">Provando</span>' : `<button class="btn sm ghost" data-provar="${it.id}">Provar</button>`}
          <button class="btn sm" data-comprar="${it.id}" ${S.carteira < it.preco ? 'disabled' : ''}>${fmtR(it.preco)}</button>`;
        return itemCardHTML(it, prova, act);
      }).join('')).join('')}
      <div class="row"><button class="btn ghost" data-close>Sair da loja</button></div>`;
    m.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
    m.querySelectorAll('[data-provar]').forEach(b => b.onclick = () => { const it = itemById(b.dataset.provar); prova[it.slot] = it.id; sfx.talk(); render(); });
    m.querySelectorAll('[data-vestir]').forEach(b => b.onclick = () => { const it = itemById(b.dataset.vestir); S.visual[it.slot] = it.id; prova[it.slot] = it.id; vestirMarina(); save(); sfx.ok(); render(); });
    m.querySelectorAll('[data-comprar]').forEach(b => b.onclick = () => comprar(itemById(b.dataset.comprar), id, prova, render));
    m.scrollTop = sc;
  };
  render();
}
function comprar(it, lojaId, prova, render) {
  if (S.roupas.includes(it.id) || S.carteira < it.preco) return;
  S.carteira -= it.preco; S.ys.gastos = (S.ys.gastos || 0) + it.preco;
  S.roupas.push(it.id);
  S.visual[it.slot] = it.id; prova[it.slot] = it.id;
  vestirMarina(); sfx.plant(); updateHUD();
  if (it.fx) addStats(it.fx);
  const notas = [];
  if (it.nota) notas.push(it.nota);
  if (lojaId === 'brecho' && !S.dicaBrecho) { S.dicaBrecho = true; notas.push(NOTA_BRECHO); }
  save(); render();
  toast(`🛍️ ${it.nome} comprado e já vestido!`);
  if (notas.length) { closeModal(); say(notas.map(t => ({ who: 'sistema', text: '💡 ' + t })), () => openLoja(lojaId)); }
}

// ---------------------------------------------------------------------
//  Guarda-roupa: trocar de visual com o que já tem
// ---------------------------------------------------------------------
function openVisual() {
  const m = openModal('', 'lojaModal');
  const render = () => {
    const sc = m.scrollTop;
    m.innerHTML = `<div class="mHead"><h2>👗 Guarda-roupa da Marina</h2><button class="x" data-close>✕</button></div>
      <div class="lojaTop">${previewHTML(S.visual)}<div class="wallet big">👛 <b>${fmtR(S.carteira)}</b><small>${CARGOS[S.cargo]} • ${fmtR(SALARIOS[S.cargo])} a cada ${PARECERES_POR_SALARIO} pareceres</small></div></div>
      ${Object.keys(SLOTS).map(s => {
        const meus = ITENS.filter(i => i.slot === s && S.roupas.includes(i.id));
        if (!meus.length) return '';
        const nada = OPCIONAIS.includes(s) ? `<button class="chip ${S.visual[s] ? '' : 'on'}" data-slot="${s}" data-id="">Nada</button>` : '';
        return `<h3>${SLOTS[s]}</h3><div class="wardrobe">${nada}${meus.map(it => `<button class="wItem ${S.visual[s] === it.id ? 'on' : ''}" data-slot="${s}" data-id="${it.id}"><img src="${thumb(Object.assign({}, S.visual, { [s]: it.id }))}" alt=""><span>${it.nome}</span></button>`).join('')}</div>`;
      }).join('')}
      <div class="legend small">🛍️ Mais roupas no <b>Mercado Central</b> e no <b>Brechó do Benfica</b>, em Fortaleza.</div>
      <div class="row">${S.lojasVistas.length ? '' : '<button class="btn ghost" id="irLoja">Ir ao Mercado 🚙</button>'}<button class="btn" data-close>Pronto!</button></div>`;
    m.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
    m.querySelectorAll('[data-slot]').forEach(b => b.onclick = () => { S.visual[b.dataset.slot] = b.dataset.id || null; vestirMarina(); save(); sfx.talk(); render(); });
    const ir = m.querySelector('#irLoja');
    if (ir) ir.onclick = () => { closeModal(); travelTo(LOJAS.mercado.x, LOJAS.mercado.y + 4); };
    m.scrollTop = sc;
  };
  render();
}

// ---------------------------------------------------------------------
//  Ligações com o resto do jogo
// ---------------------------------------------------------------------
function lojaInteractables(out) {
  for (const id in LOJAS) { const L = LOJAS[id]; out.push({ x: L.x, y: L.y, label: L.nome, icon: L.icon, fn: () => openLoja(id) }); }
}
function lojaTasks(out) {
  if (!S.lojasVistas.length && S.carteira >= 100) out.push({ icon: '🛍️', txt: `Gastar um pouco do salário (${fmtR(S.carteira)}) no Mercado Central`, where: 'Fortaleza', go: { x: LOJAS.mercado.x, y: LOJAS.mercado.y + 4 }, done: false, optional: true });
}
// mensagem para quem já jogava antes desta versão
function mostrarNovidadeSalario() {
  if (!S.novidadeSalario) return;
  const atrasado = S.novidadeSalario; S.novidadeSalario = 0; save();
  queue(() => { const m = openModal(`<div class="mHead"><h2>🎉 Novidade: salário e visual!</h2><button class="x" data-close>✕</button></div>
    <div class="lojaTop">${previewHTML(S.visual)}<div class="wallet big">👛 <b>${fmtR(S.carteira)}</b><small>salários atrasados 😉</small></div></div>
    <p>Agora a Marina recebe <b>salário</b>: ${fmtR(SALARIOS[S.cargo])} a cada ${PARECERES_POR_SALARIO} pareceres como <b>${CARGOS[S.cargo]}</b>. Cada promoção aumenta o contracheque.</p>
    <p>A SEMA acertou ${fmtR(atrasado)} de salários atrasados pelos pareceres que você já assinou. 💸</p>
    <p>Gaste no <b>🛍️ Mercado Central</b> (roupas, artesanato e salão de beleza) ou no <b>♻️ Brechó do Benfica</b>, os dois em Fortaleza. Para trocar de roupa, toque no 👛 lá em cima.</p>
    <p class="muted small">Seu progresso continua todo aqui: processos, mudas, cargo e relatórios.</p>
    <div class="row"><button class="btn ghost" data-close>Depois</button><button class="btn" id="irLoja">Ir ao Mercado 🚙</button></div>`);
    m.querySelector('#irLoja').onclick = () => { closeModal(); travelTo(LOJAS.mercado.x, LOJAS.mercado.y + 4); };
  });
}
