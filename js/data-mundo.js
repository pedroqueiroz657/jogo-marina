// =====================================================================
//  MUNDO VIVO: biomas, processos gerados, eventos, queimadas e carreira
// =====================================================================
SPECIES.cedro = { name: 'Cedro', sci: 'Cedrela odorata', color: '#3a7a3e', fruit: '#8a5a2a', info: 'Nativo das matas úmidas das serras cearenses e ameaçado pela extração de madeira.' };
SPECIES.angico = { name: 'Angico', sci: 'Anadenanthera colubrina', color: '#5a9a44', fruit: '#c9a24a', info: 'Leguminosa nativa de crescimento rápido, ótima para recuperar áreas degradadas.' };

const BIOMAS = {
  restinga: { nome: 'Restinga e dunas', ok: ['cajueiro', 'murici', 'guajiru'], bad: ['coqueiro', 'eucalipto', 'leucena'] },
  tabuleiro: { nome: 'Tabuleiro costeiro', ok: ['cajueiro', 'murici', 'ipeRoxo'], bad: ['nim', 'leucena', 'eucalipto'] },
  serra: { nome: 'Mata úmida de serra (Mata Atlântica)', ok: ['cedro', 'jatoba', 'ipeAmarelo'], bad: ['pinus', 'eucalipto', 'leucena'] },
  caatinga: { nome: 'Caatinga', ok: ['juazeiro', 'aroeira', 'sabia', 'ipeRoxo', 'angico'], bad: ['algaroba', 'nim'] },
  ciliar: { nome: 'Mata ciliar', ok: ['carnauba', 'oiticica', 'mulungu'], bad: ['algaroba', 'eucalipto', 'leucena'] },
  chapada: { nome: 'Matas e cerrado da chapada', ok: ['pequizeiro', 'jatoba', 'ipeAmarelo'], bad: ['pinus', 'eucalipto', 'leucena'] },
  mangue: { nome: 'Manguezal (APP)', ok: ['mangueVermelho', 'mangueBranco', 'manguePreto'], bad: ['coqueiro', 'nim', 'leucena'] },
};

// Uma área de compensação por região para os processos gerados (x,y = canto das covas)
const GEN_SPOTS = {
  fortaleza: { x: 39, y: 25, bioma: 'tabuleiro' },
  camocim: { x: 24, y: 12, bioma: 'restinga' },
  ibiapaba: { x: 8, y: 27, bioma: 'serra' },
  aracati: { x: 76, y: 31, bioma: 'restinga' },
  baturite: { x: 38, y: 30, bioma: 'serra' },
  quixada: { x: 37, y: 50, bioma: 'caatinga' },
  jaguaribe: { x: 67, y: 44, bioma: 'ciliar' },
  taua: { x: 25, y: 40, bioma: 'caatinga' },
  araripe: { x: 46, y: 60, bioma: 'chapada' },
};

const PORTES = [
  { nome: 'pequeno porte', fx: 0.7, n: 0 },
  { nome: 'médio porte', fx: 1, n: 1 },
  { nome: 'grande porte', fx: 1.4, n: 2 },
];

// Modelos de processos: o jogo sorteia região, porte e empreendedor e gera casos novos sem fim.
// A melhor opção tem soma de efeitos > 10.
const TEMPLATES = [
  {
    id: 'loteamento', tipo: 'Parcelamento do solo urbano', regions: ['fortaleza', 'quixada', 'jaguaribe', 'taua'],
    titulo: 'Loteamento residencial em {lugar}', emp: ['Construtora Horizonte', 'Morada Nova Imóveis', 'Residencial Sol Nascente'],
    resumo: 'Um loteamento de {porte} com centenas de lotes. O projeto não prevê área verde nem rede de esgoto, e há um riacho temporário no terreno.',
    vistoria: 'Na vistoria você viu o riacho com mata ciliar ainda preservada e moradores vizinhos que já sofrem com alagamentos.',
    opcoes: [
      { k: 'cond', txt: 'Deferir com condicionantes: manter a APP do riacho, reservar área verde, implantar rede de esgoto e drenagem.', fx: { amb: -3, eco: +10, soc: +10 }, comp: 4, fb: 'Isso! Moradia é necessidade real, e a cidade cresce melhor com área verde, saneamento e a APP do riacho protegida.' },
      { k: 'ruim', txt: 'Deferir como está, sem área verde e com lotes até a beira do riacho.', fx: { amb: -14, eco: +12, soc: -6 }, comp: 6, fb: 'Lote na beira do riacho vira casa alagada. A conta do improviso chega para os moradores e para a prefeitura.' },
      { k: 'indef', txt: 'Indeferir o loteamento.', fx: { amb: +2, eco: -8, soc: -8 }, comp: 0, fb: 'Sem loteamento regular, a ocupação costuma acontecer de forma irregular e ainda pior para o ambiente.' },
    ],
    fato: 'Pelo Código Florestal, riachos têm Área de Preservação Permanente (APP) mesmo dentro das cidades.',
    retorno: { ruim: 'Choveu forte e as casas da beira do riacho alagaram. O loteador aterrou a APP sem autorização.', nc: 'O loteador entregou a drenagem, mas a área verde virou estacionamento.' },
  },
  {
    id: 'posto', tipo: 'Posto de combustível', regions: ['fortaleza', 'quixada', 'taua', 'jaguaribe', 'araripe'],
    titulo: 'Posto de combustível na entrada de {lugar}', emp: ['Auto Posto Rota do Sol', 'Posto Carnaúba', 'Rede Combustível Sertão'],
    resumo: 'Posto com tanques subterrâneos a 80 metros de um poço que abastece a comunidade.',
    vistoria: 'Na vistoria você confirmou o poço comunitário e o solo arenoso, que deixa vazamentos chegarem rápido à água subterrânea.',
    opcoes: [
      { k: 'cond', txt: 'Deferir com condicionantes: tanques de parede dupla, sensores de vazamento, caixa separadora de água e óleo e monitoramento do poço.', fx: { amb: -1, eco: +8, soc: +6 }, comp: 0, fb: 'Correto! A Resolução CONAMA 273/2000 trata justamente do licenciamento de postos e exige essas proteções.' },
      { k: 'ruim', txt: 'Deferir sem exigências: posto é obra simples.', fx: { amb: -12, eco: +9, soc: -8 }, comp: 0, fb: 'Um vazamento de combustível pode contaminar o poço por anos. Prevenir é muito mais barato que remediar.' },
      { k: 'indef', txt: 'Indeferir o posto.', fx: { amb: +2, eco: -6, soc: -2 }, comp: 0, fb: 'Dava para licenciar com segurança. Indeferir sem motivo técnico forte não protege ninguém.' },
    ],
    fato: 'Postos de combustível são atividades potencialmente poluidoras e precisam de licença ambiental (Resolução CONAMA 273/2000).',
    retorno: { ruim: 'Moradores sentiram cheiro de gasolina na água do poço comunitário.', nc: 'O sensor de vazamento está desligado há semanas.' },
  },
  {
    id: 'carcinicultura', tipo: 'Aquicultura', regions: ['camocim', 'aracati', 'fortaleza'], bioma: 'mangue',
    titulo: 'Fazenda de camarão no estuário de {lugar}', emp: ['Camarões do Atlântico', 'AquaNordeste', 'Maricultura Litoral'],
    resumo: 'Viveiros de camarão de {porte}. Parte dos tanques avança sobre o apicum e o manguezal do estuário.',
    vistoria: 'Na vistoria você viu marisqueiras trabalhando no mangue e um canal de efluente sem tratamento indo direto para o rio.',
    opcoes: [
      { k: 'cond', txt: 'Deferir só fora do manguezal e do apicum, com tratamento de efluentes e recuperação do mangue.', fx: { amb: -3, eco: +10, soc: +6 }, comp: 5, fb: 'Ótimo! A carcinicultura é forte no Ceará, mas o mangue é APP e sustenta marisqueiras e pescadores.' },
      { k: 'ruim', txt: 'Deferir o projeto completo, inclusive sobre o manguezal.', fx: { amb: -22, eco: +14, soc: -10 }, comp: 8, fb: 'Viveiro sobre mangue destrói o berçário de peixes e a renda de quem vive da maré. É uma perda difícil de reverter.' },
      { k: 'indef', txt: 'Indeferir toda a fazenda.', fx: { amb: +4, eco: -10, soc: -3 }, comp: 0, fb: 'Protetivo, mas havia como produzir fora da APP. A economia ecológica busca o caminho que cabe no ecossistema.' },
    ],
    fato: 'O apicum, a parte mais alta e salgada do mangue, também é protegido e é essencial para o caranguejo-uçá.',
    retorno: { ruim: 'Os viveiros despejaram efluente e houve mortandade de peixes no estuário.', nc: 'A lagoa de tratamento de efluentes ainda não foi construída.' },
  },
  {
    id: 'pousada', tipo: 'Turismo', regions: ['camocim', 'aracati'],
    titulo: 'Pousada nas dunas de {lugar}', emp: ['Pousada Brisa Mar', 'Eco Dunas Hotel', 'Vila dos Ventos'],
    resumo: 'Pousada de {porte} sobre duna móvel, a poucos metros de uma lagoa interdunar.',
    vistoria: 'Na vistoria você viu a duna avançando com o vento e a lagoa sendo usada para banho e pesca pelas famílias locais.',
    opcoes: [
      { k: 'cond', txt: 'Deferir com recuo da duna e da lagoa, fossa adequada e trilhas suspensas.', fx: { amb: -3, eco: +11, soc: +6 }, comp: 4, fb: 'Turismo que respeita a paisagem é o que mantém os turistas voltando. Boa decisão!' },
      { k: 'ruim', txt: 'Deferir sobre a duna, como no projeto.', fx: { amb: -16, eco: +12, soc: -5 }, comp: 6, fb: 'Duna móvel anda! Prédio sobre ela é soterrado ou trava a duna e muda toda a dinâmica da praia.' },
      { k: 'indef', txt: 'Indeferir a pousada.', fx: { amb: +2, eco: -8, soc: -4 }, comp: 0, fb: 'A comunidade perde renda do turismo. Dava para ajustar a localização.' },
    ],
    fato: 'As dunas móveis se deslocam com o vento e alimentam de areia as praias vizinhas.',
    retorno: { ruim: 'A areia da duna invadiu a estrada e a pousada começou a jogar esgoto na lagoa.', nc: 'As trilhas suspensas não foram feitas e os hóspedes pisoteiam a vegetação da duna.' },
  },
  {
    id: 'linha', tipo: 'Linha de transmissão de energia', regions: ['ibiapaba', 'baturite', 'araripe', 'quixada'],
    titulo: 'Linha de transmissão cruzando {lugar}', emp: ['Transmissora Nordeste', 'Energia Integrada', 'Linhas do Sertão'],
    resumo: 'Linha de {porte} para escoar energia eólica e solar. A faixa de servidão corta um trecho de mata nativa.',
    vistoria: 'Na vistoria você viu que as torres podem ficar mais altas e passar por cima da mata sem cortar tudo.',
    opcoes: [
      { k: 'cond', txt: 'Deferir com torres alteadas sobre a mata, faixa de corte mínima e resgate de flora.', fx: { amb: -3, eco: +11, soc: +6 }, comp: 5, fb: 'Perfeito! A energia renovável precisa chegar às cidades, e a engenharia reduz o desmatamento.' },
      { k: 'ruim', txt: 'Deferir com corte raso de toda a faixa.', fx: { amb: -15, eco: +12, soc: -3 }, comp: 8, fb: 'Corte raso fragmenta a mata e isola populações de animais. Existia alternativa técnica.' },
      { k: 'indef', txt: 'Indeferir a linha.', fx: { amb: +2, eco: -12, soc: -4 }, comp: 0, fb: 'Sem transmissão, a energia limpa fica presa no interior. Ajustar era melhor que barrar.' },
    ],
    fato: 'O Ceará produz muito mais energia eólica do que consome e precisa de linhas para escoar essa energia.',
    retorno: { ruim: 'A faixa desmatada virou erosão e as aves pararam de cruzar a mata.', nc: 'A empresa cortou uma faixa 10 metros maior que a autorizada.' },
  },
  {
    id: 'areia', tipo: 'Mineração (areia)', regions: ['jaguaribe', 'quixada', 'taua'],
    titulo: 'Extração de areia no leito do rio em {lugar}', emp: ['Areal Boa Vista', 'Mineração Rio Seco', 'Extração Vale Verde'],
    resumo: 'Retirada de areia com máquinas dentro do leito e da APP do rio, por vários anos.',
    vistoria: 'Na vistoria você viu barrancos desabando e carnaúbas com raízes expostas. A comunidade usa o rio para beber água.',
    opcoes: [
      { k: 'indef', txt: 'Indeferir: a lavra no leito e na APP compromete o rio. Indicar jazidas fora da calha.', fx: { amb: +12, eco: -4, soc: +4 }, comp: 0, fb: 'Correto! Tirar areia do leito acelera a erosão e baixa o nível de água. Há areais fora da APP.' },
      { k: 'cond', txt: 'Deferir com limite de volume e recuperação das margens.', fx: { amb: -6, eco: +8, soc: 0 }, comp: 5, fb: 'Aceitável no papel, mas é difícil fiscalizar o volume. O rio já estava fragilizado.' },
      { k: 'ruim', txt: 'Deferir como pedido.', fx: { amb: -20, eco: +10, soc: -8 }, comp: 7, fb: 'O rio vai assorear e secar mais cedo. Quem mora abaixo paga a conta.' },
    ],
    fato: 'A mineração de areia em rios é uma das principais causas de erosão de margens e assoreamento no semiárido.',
    retorno: { ruim: 'O barranco desabou e o rio mudou de curso perto da comunidade.', nc: 'As máquinas estão tirando areia além do volume autorizado.' },
  },
  {
    id: 'pedreira', tipo: 'Mineração (brita)', regions: ['quixada'],
    titulo: 'Pedreira ao lado dos monólitos de Quixadá', emp: ['Britagem Central', 'Pedras do Sertão'],
    resumo: 'Exploração de rocha com explosivos a 500 m de um monólito do Monumento Natural.',
    vistoria: 'Na vistoria você viu escaladores, uma pintura rupestre e ninhos de gavião nas paredes do monólito.',
    opcoes: [
      { k: 'indef', txt: 'Indeferir: área de entorno de Unidade de Conservação e patrimônio geológico.', fx: { amb: +14, eco: -5, soc: +4 }, comp: 0, fb: 'Isso mesmo! Os monólitos de Quixadá são protegidos como Monumento Natural, e explosões podem rachar a rocha.' },
      { k: 'cond', txt: 'Deferir com explosões menores e horário controlado.', fx: { amb: -10, eco: +8, soc: -4 }, comp: 6, fb: 'Vibração constante danifica monólitos e afasta o turismo. Não era o caso de liberar.' },
      { k: 'ruim', txt: 'Deferir como proposto.', fx: { amb: -24, eco: +10, soc: -8 }, comp: 8, fb: 'Patrimônio geológico de milhões de anos não tem reposição. Isso é capital natural crítico.' },
    ],
    fato: 'O Monumento Natural dos Monólitos de Quixadá é uma Unidade de Conservação estadual.',
    retorno: { ruim: 'Uma explosão rachou a base do monólito e o turismo de escalada foi interditado.', nc: 'A pedreira detonou explosivos fora do horário autorizado.' },
  },
  {
    id: 'ceramica', tipo: 'Indústria cerâmica', regions: ['taua', 'jaguaribe', 'quixada'],
    titulo: 'Cerâmica de telhas em {lugar}', emp: ['Cerâmica São José', 'Olaria Boa Esperança', 'Telhas do Vale'],
    resumo: 'Cerâmica de {porte} que vai queimar lenha nos fornos. A origem da lenha não foi informada.',
    vistoria: 'Na vistoria você encontrou pilhas de lenha de Caatinga nativa sem nenhum documento de origem.',
    opcoes: [
      { k: 'cond', txt: 'Deferir exigindo lenha de Plano de Manejo Florestal Sustentável, com documento de origem, e filtros na chaminé.', fx: { amb: -2, eco: +10, soc: +7 }, comp: 4, fb: 'Excelente! O manejo florestal sustentável da Caatinga gera renda e mantém a floresta em pé.' },
      { k: 'ruim', txt: 'Deferir sem exigir a origem da lenha.', fx: { amb: -16, eco: +11, soc: -3 }, comp: 6, fb: 'Lenha sem origem quase sempre é desmatamento ilegal. A Caatinga é a principal fonte de energia de muitas indústrias do sertão.' },
      { k: 'indef', txt: 'Indeferir a cerâmica.', fx: { amb: +2, eco: -9, soc: -7 }, comp: 0, fb: 'As cerâmicas empregam muita gente no interior. O caminho era exigir manejo sustentável.' },
    ],
    fato: 'Lenha e carvão de Caatinga respondem por boa parte da energia usada na indústria do Nordeste.',
    retorno: { ruim: 'A fiscalização flagrou caminhões com lenha de desmatamento ilegal entrando na cerâmica.', nc: 'Parte da lenha está chegando sem o documento de origem.' },
  },
  {
    id: 'padaria', tipo: 'Licença simplificada', regions: ['fortaleza'],
    titulo: 'Padaria de bairro em {lugar}', emp: ['Padaria Pão Quente', 'Panificadora Bom Dia'],
    resumo: 'Pequena padaria com forno elétrico em área urbana já consolidada. Impacto muito baixo.',
    vistoria: 'Na vistoria você confirmou: imóvel comercial antigo, forno elétrico e coleta de resíduos da prefeitura.',
    opcoes: [
      { k: 'simples', txt: 'Emitir licença simplificada, orientando a separação dos resíduos e do óleo de cozinha.', fx: { amb: 0, eco: +8, soc: +6 }, comp: 0, fb: 'Perfeito! O licenciamento deve ser proporcional ao impacto. Energia da equipe vai para os casos grandes.' },
      { k: 'eia', txt: 'Exigir EIA/RIMA completo.', fx: { amb: 0, eco: -6, soc: -4 }, comp: 0, fb: 'EIA/RIMA para padaria? Exagero que trava o pequeno negócio e congestiona o órgão ambiental.' },
      { k: 'indef', txt: 'Indeferir.', fx: { amb: 0, eco: -6, soc: -5 }, comp: 0, fb: 'Não havia motivo ambiental para negar.' },
    ],
    fato: 'O óleo de cozinha usado não deve ir para o ralo: 1 litro pode contaminar milhares de litros de água.',
    retorno: null,
  },
  {
    id: 'trilha', tipo: 'Ecoturismo', regions: ['ibiapaba', 'baturite', 'araripe'],
    titulo: 'Tirolesa e trilhas em {lugar}', emp: ['Aventura Serra Verde', 'EcoTrilhas Ceará'],
    resumo: 'Empreendimento de ecoturismo com tirolesa, mirante e trilhas na mata da encosta.',
    vistoria: 'Na vistoria você encontrou uma nascente perto da trilha principal e sinais de erosão em trilhas abertas sem planejamento.',
    opcoes: [
      { k: 'cond', txt: 'Deferir com limite de visitantes, trilhas planejadas longe da nascente e guias locais.', fx: { amb: -1, eco: +9, soc: +8 }, comp: 3, fb: 'Ótimo! Ecoturismo bem planejado dá renda à comunidade e motivos para conservar a serra.' },
      { k: 'ruim', txt: 'Deferir sem limite de visitantes.', fx: { amb: -10, eco: +10, soc: -2 }, comp: 5, fb: 'Turismo de massa na mata vira trilha erodida e lixo na nascente.' },
      { k: 'indef', txt: 'Indeferir.', fx: { amb: +1, eco: -7, soc: -5 }, comp: 0, fb: 'Ecoturismo responsável é aliado da conservação. Indeferir tirou renda da comunidade.' },
    ],
    fato: 'A capacidade de carga define quantos visitantes uma área natural suporta sem se degradar.',
    retorno: { ruim: 'Lixo e erosão chegaram à nascente perto da trilha.', nc: 'A empresa ultrapassou o limite de visitantes nos feriados.' },
  },
  {
    id: 'aviario', tipo: 'Agropecuária', regions: ['taua', 'quixada', 'jaguaribe'],
    titulo: 'Granja de aves em {lugar}', emp: ['Avícola Sertaneja', 'Granja Bom Sucesso'],
    resumo: 'Granja de {porte} com galpões e lagoa de dejetos perto de um açude.',
    vistoria: 'Na vistoria você sentiu o cheiro forte e viu que a lagoa de dejetos fica a 40 metros do açude.',
    opcoes: [
      { k: 'cond', txt: 'Deferir com lagoa impermeabilizada longe do açude, compostagem dos dejetos e cinturão verde.', fx: { amb: -2, eco: +10, soc: +7 }, comp: 4, fb: 'Muito bem! Dejeto bem tratado vira adubo, e não poluição do açude.' },
      { k: 'ruim', txt: 'Deferir com a lagoa onde está.', fx: { amb: -14, eco: +11, soc: -7 }, comp: 5, fb: 'Uma lagoa de dejetos junto ao açude causa proliferação de algas e mata os peixes.' },
      { k: 'indef', txt: 'Indeferir a granja.', fx: { amb: +2, eco: -8, soc: -6 }, comp: 0, fb: 'Dava para licenciar com tratamento adequado e gerar empregos no sertão.' },
    ],
    fato: 'O excesso de nutrientes nos açudes, chamado eutrofização, é um dos maiores problemas da água no Ceará.',
    retorno: { ruim: 'O açude ficou verde de algas e houve mortandade de peixes.', nc: 'A compostagem dos dejetos não está funcionando.' },
  },
];

// Retorno das decisões da campanha: o que acontece meses depois
const RETORNOS = {
  coco: { ruim: 'O aterro no mangue piorou os alagamentos nos bairros vizinhos ao Cocó.', nc: 'O viaduto ficou pronto, mas a passagem de fauna não foi construída.' },
  adutora: { ruim: 'Moradores encontraram animais mortos na faixa da adutora: não houve resgate de fauna.', nc: 'A empresa desviou das aroeiras, mas não entregou o relatório de resgate de fauna.' },
  eolico: { ruim: 'As lagoas interdunares baixaram e os pescadores protestaram na frente do parque eólico.', nc: 'O monitoramento de aves está atrasado há dois meses.' },
  resort: { ruim: 'Um trecho da falésia desabou perto do resort e apareceu esgoto na praia.', nc: 'A estação de esgoto funciona, mas a contratação local ficou abaixo do combinado.' },
  irrigacao: { ruim: 'Peixes mortos apareceram no Jaguaribe, abaixo do perímetro irrigado.', nc: 'A mata ciliar foi plantada, mas as embalagens de agrotóxico não estão sendo recolhidas.' },
  mineracao: { ruim: 'Uma nascente da encosta secou e o soldadinho-do-araripe sumiu da área.', nc: 'A lavra fora da encosta segue, mas o apoio à Unidade de Conservação não foi pago.' },
  solar: { ruim: null, nc: 'A drenagem da usina está levando areia para o riacho.' },
};

// Escolhas para fiscalização de condicionantes
const FISCAL_RUIM = [
  { txt: 'Lavrar auto de infração, exigir um Plano de Recuperação de Área Degradada (PRAD) e rever as condicionantes da licença.', fx: { amb: +6, eco: -2, soc: +4 }, ok: true, fb: 'Isso! A licença não é um cheque em branco: o órgão ambiental pode modificar condicionantes, suspender ou cancelar (Resolução CONAMA 237/97, art. 19).' },
  { txt: 'Suspender a licença até o dano ser corrigido.', fx: { amb: +6, eco: -6, soc: +1 }, fb: 'Medida forte e possível. Funciona, mas pesa na economia. Às vezes o auto com PRAD resolve sem parar tudo.' },
  { txt: 'Arquivar: a licença já foi emitida.', fx: { amb: -6, eco: +1, soc: -5 }, fb: 'Não! O licenciamento continua depois da assinatura. Quem causa dano ambiental responde, mesmo com licença (Lei 9.605/98).' },
];
const FISCAL_NC = [
  { txt: 'Notificar a empresa com prazo para cumprir a condicionante.', fx: { amb: +3, eco: 0, soc: +3 }, ok: true, fb: 'Boa! Para uma falha parcial, a notificação com prazo costuma resolver. Se não cumprir, vem a multa.' },
  { txt: 'Aplicar multa máxima imediatamente.', fx: { amb: +2, eco: -4, soc: 0 }, fb: 'Proporcionalidade importa: uma falha parcial pede notificação primeiro.' },
  { txt: 'Deixar para lá, foi só um detalhe.', fx: { amb: -4, eco: 0, soc: -3 }, fb: 'Condicionante descumprida e ignorada vira regra. A fiscalização dá credibilidade à licença.' },
];

// Estações do Ceará
const ESTACOES = {
  chuvosa: { nome: 'Quadra chuvosa', icon: '🌧️', risco: 0.05, sede: 0, txt: 'De fevereiro a maio chove no sertão. A Caatinga fica verde em poucos dias, os açudes enchem e as mudas não precisam ser regadas. O risco de queimadas é baixíssimo.' },
  transicao: { nome: 'Fim das chuvas', icon: '⛅', risco: 0.35, sede: 1 / 200, txt: 'Junho e julho: as chuvas acabam e a vegetação começa a secar. É a hora certa de prevenir: aceiros, brigadas comunitárias e campanhas contra a queima de roçado.' },
  seca: { nome: 'Seca • B-R-O-BRÓ', icon: '🔥', risco: 1, sede: 1 / 100, txt: 'De agosto a dezembro, nos meses terminados em “bro”, a Caatinga perde as folhas (a “mata branca”), o calor aperta e as queimadas se multiplicam. As mudas precisam de rega!' },
  preChuva: { nome: 'Pré-estação chuvosa', icon: '🌦️', risco: 0.3, sede: 1 / 160, txt: 'Em janeiro o sertanejo olha o céu esperando as primeiras chuvas. As experiências dos profetas da chuva fazem parte da cultura cearense.' },
};
function estacaoDoMes(m) { return m >= 2 && m <= 5 ? 'chuvosa' : (m === 6 || m === 7) ? 'transicao' : m === 1 ? 'preChuva' : 'seca'; }

// Causas das queimadas e o que fazer depois (laudo)
const CAUSAS_FOGO = [
  { causa: 'queima de roçado para plantio, sem autorização', opcoes: [
    { txt: 'Autuar e orientar o agricultor: a queima controlada só pode ser feita com autorização do órgão ambiental. Apresentar o roçado sem fogo e a agroecologia.', fx: { amb: +3, soc: +3 }, ok: true, fb: 'Perfeito! Educação e fiscalização juntas. Existem técnicas de preparo do solo sem fogo que mantêm a fertilidade.' },
    { txt: 'Prender o agricultor na hora.', fx: { soc: -4 }, fb: 'Desproporcional. O agricultor familiar precisa de orientação e alternativas, além da autuação.' },
    { txt: 'Deixar pra lá, é costume da região.', fx: { amb: -3 }, fb: 'O costume não torna o fogo seguro: a queima sem controle é a maior causa de incêndios no sertão.' }] },
  { causa: 'bituca de cigarro jogada na beira da estrada', opcoes: [
    { txt: 'Pedir aceiros (faixas sem vegetação) nas margens da rodovia e campanha educativa com o DER e a Polícia Rodoviária.', fx: { amb: +3, soc: +2 }, ok: true, fb: 'Isso! O aceiro impede o fogo de passar, e a campanha atinge quem dirige.' },
    { txt: 'Asfaltar toda a vegetação da margem.', fx: { amb: -3, eco: -2 }, fb: 'Exagero caro que destrói vegetação. Aceiro e manutenção resolvem.' },
    { txt: 'Não há o que fazer.', fx: { amb: -2 }, fb: 'Há sim: prevenção é a principal arma contra incêndios florestais.' }] },
  { causa: 'balão solto numa festa junina', opcoes: [
    { txt: 'Registrar ocorrência: fabricar, vender, transportar ou soltar balão é crime ambiental (Lei 9.605/98, art. 42). Fazer campanha nas escolas.', fx: { amb: +3, soc: +3 }, ok: true, fb: 'Exato! Soltar balão é crime porque pode causar incêndios em matas e cidades.' },
    { txt: 'Proibir festas juninas no município.', fx: { soc: -5 }, fb: 'A festa é patrimônio cultural! O problema é o balão, não o São João.' },
    { txt: 'Ignorar, foi só um balão.', fx: { amb: -3 }, fb: 'Um só balão pode queimar centenas de hectares.' }] },
  { causa: 'queima de lixo no quintal de uma casa', opcoes: [
    { txt: 'Orientar a família e cobrar coleta de lixo da prefeitura: queimar resíduos a céu aberto é proibido (Política Nacional de Resíduos Sólidos).', fx: { amb: +2, soc: +4 }, ok: true, fb: 'Isso! Sem coleta, as pessoas queimam lixo. A solução é coleta regular e coleta seletiva com os catadores.' },
    { txt: 'Multar a família com o valor máximo.', fx: { soc: -4 }, fb: 'Sem coleta disponível, multar não resolve o problema de fundo.' },
    { txt: 'Mandar enterrar o lixo.', fx: { amb: -2 }, fb: 'Enterrar lixo contamina o solo e a água. Destinação correta é aterro sanitário ou reciclagem.' }] },
  { causa: 'incêndio criminoso para abrir pasto', opcoes: [
    { txt: 'Lavrar auto de infração, embargar a área queimada e comunicar o Ministério Público (crime, Lei 9.605/98, art. 41).', fx: { amb: +4, soc: +2 }, ok: true, fb: 'Correto! Embargar impede que o criminoso lucre com a área queimada, e o MP cuida da parte criminal.' },
    { txt: 'Só advertir o fazendeiro.', fx: { amb: -2 }, fb: 'Incêndio criminoso é crime ambiental grave. Advertência não basta.' },
    { txt: 'Liberar o pasto, já que a área queimou mesmo.', fx: { amb: -5, eco: +2 }, fb: 'Isso premia o crime! A área tem que ser recuperada, não ocupada.' }] },
];

const ESCOLHA_FOGO = {
  q: 'Foco de queimada! Qual o jeito certo de agir?',
  a: [
    { txt: 'Ligar 193, acionar a brigada e atacar as bordas do fogo com abafador, de costas para o vento.', ok: true, fb: 'Isso! Bombeiros e brigadistas estão a caminho. Combata pelas bordas, nunca de frente para o vento.' },
    { txt: 'Correr para o meio do fogo com um balde de água.', fb: 'Perigoso! Ninguém combate o centro do fogo. Vou ligar 193 e atacar pelas bordas.' },
    { txt: 'Esperar o fogo apagar sozinho.', fb: 'Na seca o fogo cresce rápido. Melhor chamar a brigada agora.' },
  ],
};

// Eventos que surgem no mapa
const EVENTOS = {
  oleo: { titulo: 'Manchas de óleo na praia', icon: '🛢️', tipo: 'coleta', n: 5, tiles: ['SAND'], regions: ['camocim', 'aracati', 'fortaleza'], meses: null,
    intro: 'Pescadores avisaram: manchas de óleo chegaram à praia!',
    q: 'Como recolher o óleo com segurança?',
    a: [
      { txt: 'Isolar a área, usar luvas, botas e máscara, recolher com pás e sacos e avisar o IBAMA e a Marinha.', ok: true, fb: 'Correto! O óleo cru é tóxico: nada de mãos desprotegidas. Os órgãos federais rastreiam a origem.' },
      { txt: 'Recolher rápido com as mãos mesmo.', fb: 'Nunca! O óleo tem substâncias tóxicas que passam pela pele. Use sempre EPI.' },
      { txt: 'Enterrar o óleo na areia.', fb: 'Isso só esconde o problema e contamina o lençol freático.' },
    ],
    coletaLabel: 'Recolher óleo', fim: 'Praia limpa! Em 2019, o maior desastre de óleo do litoral brasileiro atingiu o Ceará, e voluntários e pescadores foram fundamentais na limpeza.', fx: { amb: +4, soc: +3 } },
  lixo: { titulo: 'Lixo no manguezal do Cocó', icon: '🗑️', tipo: 'coleta', n: 6, tiles: ['MANGUE', 'PARK'], regions: ['coco'], meses: null,
    intro: 'Depois de uma maré alta, muito lixo ficou preso nas raízes do mangue do Cocó.',
    q: 'Como organizar a limpeza?',
    a: [
      { txt: 'Fazer um mutirão com Agentes Jovens Ambientais e catadores e mandar os recicláveis para a associação de catadores.', ok: true, fb: 'Perfeito! Limpeza com inclusão social: o reciclável vira renda para quem cata.' },
      { txt: 'Juntar tudo e queimar ali mesmo.', fb: 'Queimar lixo é proibido e solta fumaça tóxica no parque.' },
      { txt: 'Esperar a próxima maré levar embora.', fb: 'A maré leva o lixo para o mar, onde ele mata tartarugas e peixes.' },
    ],
    coletaLabel: 'Recolher lixo', fim: 'Mangue limpo! Os recicláveis foram para a associação de catadores.', fx: { amb: +3, soc: +4 } },
  desmate: { titulo: 'Denúncia de desmatamento ilegal', icon: '🪓', tipo: 'decisao', tiles: ['CAAT', 'CAAT2', 'SERRA', 'CHAPADA'], regions: ['taua', 'quixada', 'ibiapaba', 'araripe', 'jaguaribe', 'baturite'], meses: null,
    intro: 'Uma denúncia anônima chegou: estão derrubando a mata com motosserra!',
    q: 'Você flagrou o desmatamento. O que fazer?',
    a: [
      { txt: 'Lavrar auto de infração, embargar a área, apreender a motosserra e exigir a recuperação (PRAD).', ok: true, fx: { amb: +5, soc: +2, eco: -1 }, fb: 'Correto! Embargo impede o lucro com a área desmatada, e o PRAD obriga a recuperação.' },
      { txt: 'Só dar uma advertência verbal.', fx: { amb: -3 }, fb: 'Advertência verbal não gera registro nem obrigação de recuperar.' },
      { txt: 'Ignorar: é propriedade particular.', fx: { amb: -6, soc: -2 }, fb: 'Não! Reserva Legal e APP valem em propriedade privada (Código Florestal). Na Caatinga, a Reserva Legal é de 20% do imóvel.' },
    ] },
  andada: { titulo: 'Caranguejos na andada', icon: '🦀', tipo: 'decisao', tiles: ['MANGUE'], regions: ['coco', 'camocim', 'aracati'], meses: [1, 2, 3, 4],
    intro: 'É época da andada: os caranguejos-uçá saem das tocas para se reproduzir. Há gente capturando em grande quantidade.',
    q: 'O que fazer na andada?',
    a: [
      { txt: 'Orientar os catadores sobre o defeso e fiscalizar o comércio nas feiras e estradas.', ok: true, fx: { amb: +4, soc: +3 }, fb: 'Isso! No defeso da andada, a captura e o comércio são proibidos para garantir a reprodução.' },
      { txt: 'Liberar: é tradição e renda.', fx: { amb: -5, soc: -1 }, fb: 'Sem a andada protegida, o caranguejo some, e a renda vai junto.' },
      { txt: 'Prender todos os catadores.', fx: { soc: -5 }, fb: 'Catadores tradicionais precisam de orientação e do seguro-defeso, não de prisão.' },
    ] },
  brigada: { titulo: 'Formar brigada comunitária', icon: '🧑‍🚒', tipo: 'decisao', tiles: ['CAAT', 'CAAT2', 'SERRA', 'CHAPADA'], regions: ['taua', 'quixada', 'ibiapaba', 'araripe', 'jaguaribe', 'baturite'], meses: [6, 7, 8, 9, 1],
    intro: 'Líderes comunitários querem se preparar contra as queimadas.',
    q: 'Qual a melhor forma de prevenir incêndios aqui?',
    a: [
      { txt: 'Treinar uma brigada voluntária, abrir aceiros e criar um calendário de queima controlada com autorização.', ok: true, prev: true, fx: { amb: +3, soc: +4 }, fb: 'Excelente! Essa região agora tem brigada: o risco de queimadas aqui caiu pela metade.' },
      { txt: 'Comprar só um caminhão-pipa.', fx: { eco: -2, amb: +1 }, fb: 'Ajuda no combate, mas prevenção e gente treinada valem mais.' },
      { txt: 'Não precisa, o Corpo de Bombeiros resolve.', fx: { amb: -1 }, fb: 'Os bombeiros podem demorar horas para chegar ao interior. A brigada local chega em minutos.' },
    ] },
  fauna: { titulo: 'Animal silvestre na cidade', icon: '🐍', tipo: 'decisao', tiles: ['CITY', 'PARK'], regions: ['fortaleza'], meses: null,
    intro: 'Moradores encontraram uma jiboia dentro de um quintal e querem matar a cobra.',
    q: 'O que fazer com o animal?',
    a: [
      { txt: 'Acalmar os moradores, acionar o resgate de fauna e levar a jiboia ao CETAS para avaliação e soltura.', ok: true, fx: { amb: +3, soc: +3 }, fb: 'Isso! A jiboia não é peçonhenta e controla ratos. O CETAS cuida da reabilitação e da soltura.' },
      { txt: 'Deixar os moradores matarem a cobra.', fx: { amb: -4 }, fb: 'Matar animal silvestre é crime (Lei 9.605/98, art. 29). E a jiboia nem é venenosa!' },
      { txt: 'Levar a jiboia para casa como pet.', fx: { amb: -3, soc: -1 }, fb: 'Ter animal silvestre sem autorização também é crime.' },
    ] },
};

const CARGOS = ['Analista Ambiental', 'Analista Ambiental Sênior', 'Coordenadora de Licenciamento', 'Diretora de Fiscalização', 'Secretária do Meio Ambiente'];

NPCS.push({ id: 'bombeiro', name: 'Sargento Cícero', role: 'Corpo de Bombeiros • Brigada', x: 50, y: 19, look: { skin: '#8a5a3a', hair: '#222', shirt: '#c8302a' },
  lines: [
    'Marina, na seca a gente vive correndo atrás de fogo. Quanto antes avisarem, mais fácil apagar.',
    'Fogo se combate pelas bordas, de costas para o vento. Estrada e rio funcionam como aceiros naturais.',
    'Quando aparecer 🔥 na sua agenda, vá rápido! Fogo não espera.',
  ] });
