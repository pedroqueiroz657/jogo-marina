# Marina • Guardiã do Ceará 🌵

Jogo educativo para navegador (funciona no iPhone e no computador) sobre licenciamento ambiental, compensação ambiental e economia ecológica no Ceará.

## Como jogar
- **Andar:** arraste o dedo na metade esquerda da tela (ou setas/WASD no teclado)
- **Interagir:** botão **A** (ou Espaço/E)
- **📋 Agenda:** lista de tarefas com botão "Ir 🚙"
- **🗺️ Mapa:** viajar entre as regiões do Ceará (tecla M)

- **👛 Carteira / 👗 guarda-roupa:** trocar de visual (tecla V)
- **⚙️ Menu:** backup do progresso, relatórios anteriores, estação, novo jogo (tecla G)

Fluxo: pegar processo na SEMA → (opcional) vistoria no 📍 → escolher a conclusão → assinar o parecer com o dedo → se a obra for liberada, plantar as mudas **nativas** certas nas covas da compensação e cuidar delas até virarem árvores.

## Mundo vivo (o jogo não tem fim)
- **Ano de gestão:** o 1º ano são os 7 processos da campanha; depois, a cada 5 pareceres sai um **Relatório Anual** com promoção de cargo (Analista → … → Secretária). A dificuldade sobe a cada ano.
- **Processos gerados:** depois da campanha, a SEMA recebe pedidos novos sem fim (modelos × região × porte em `js/data-mundo.js`).
- **Estações reais:** o mês do aparelho define a estação do Ceará (quadra chuvosa, fim das chuvas, seca/B-R-O-BRÓ, pré-estação). Muda a cor da Caatinga, a chuva, a sede das mudas e o risco de fogo.
- **Queimadas:** focos surgem (mais na seca e com 🌳 baixo), se espalham com o vento leste, queimam mudas jovens e deixam cicatriz que se recupera em dias reais. A Marina aciona a brigada, abafa o fogo e faz o laudo da causa.
- **Mudas:** precisam de rega fora da quadra chuvosa; morrem de sede ou no fogo e a cova reabre. A compensação só é cumprida quando todas viram árvores (taxa de sobrevivência).
- **Condicionantes que voltam:** licenças concedidas são fiscalizadas depois; decisões ruins viram denúncias.
- **Ocorrências:** óleo na praia, lixo no mangue, desmatamento, andada do caranguejo, brigada comunitária, fauna na cidade.
- **Salário e visual:** a cada 2 pareceres cai um salário (R$ 3.500 a R$ 13.000, conforme o cargo), mais diárias de campo por vistoria fora de Fortaleza e combate a queimada. O dinheiro compra roupas, artesanato e penteados no **Mercado Central** e no **Brechó do Benfica** (cada compra lá dá +1 🌳), em Fortaleza. Catálogo e valores em `js/loja.js`.
- **Lugares reais e cartões-postais:** Catedral, Theatro José de Alencar, Dragão do Mar, Praça do Ferreira, Ponte dos Ingleses (dá para andar nela), Iracema, jangadas e Farol do Mucuripe em Fortaleza; Pedra Furada, teleférico de Ubajara, falésias de Canoa Quebrada, Galinha Choca, Castanhão e Padre Cícero no interior. Cada visita mostra curiosidades reais e guarda um cartão-postal (menu ⚙️). Lista em `js/lugares.js`.
- **Missões especiais (memórias da vida real):** a primeira, "Um dia no Rio Pacoti", leva a Marina com o Pedro de Fortaleza até a Foz do Rio Pacoti (Aquiraz): banho de rio, peixinhos, uvas e uma mensagem no fim. Completar abre o Álbum de memórias; só então os lugares reais viram lembranças. Código em `js/missoes.js`; a foto do retrato fica em `assets/pedro.jpg`.
- **Enquanto ela está fora:** mudas crescem, a brigada apaga focos e pode ter havido uma queimada (perda limitada).

Para testar outra estação: `http://localhost:8000/?mes=3` (1 a 12).

## Save
- Salvo automaticamente no `localStorage` do aparelho (`marina-ceara-v1`), com versão (`v`, hoje 3, em `SAVE_V`) e migração de saves antigos em `migrate()`, mais uma cópia de segurança (`marina-ceara-bak`).
- Na primeira vez que uma versão nova abre um save antigo, uma cópia intocada dele fica em `marina-ceara-pre-v<versão>`.
- Se um save existir mas não abrir, a tela inicial avisa em vez de oferecer só "Começar"; se ela começar mesmo assim, o save antigo é guardado em `marina-ceara-quebrado-<data>`.
- Menu ⚙️ → **Gerar código** cria um código de backup que restaura o jogo em qualquer aparelho.
- No iPhone, instalar na Tela de Início evita que o Safari apague os dados após 7 dias sem uso.

## Estrutura
```
index.html            página e interface
css/style.css         visual da interface
js/data.js            regiões, processos, espécies, NPCs (o conteúdo educativo fica aqui)
js/data-mundo.js      biomas, modelos de processos, eventos, causas de queimada, estações, cargos
js/mundo.js           estações, queimadas, mudas, processos gerados, fiscalização, ano, backup
js/loja.js            salário, diárias, Mercado Central, Brechó, guarda-roupa (catálogo de roupas)
js/sprites.js         pixel art em alta resolução: Marina, moradores, árvores, prédios (tudo em código)
js/lugares.js         pontos turísticos reais, curiosidades e cartões-postais
js/missoes.js         missões especiais (Rio Pacoti com o Pedro) e álbum de memórias
js/game.js            mapa, chão em alta resolução (gerado em pedaços), movimento, diálogos, parecer, plantio, salvamento
sw.js + manifest      permite instalar na tela de início e jogar offline
tools/make-icons.js   gera os ícones PNG (node tools/make-icons.js)
```
Sem build, sem dependências: são arquivos estáticos.

## Testar localmente
```
npx serve .          # ou: python -m http.server 8000
```
Para testar no iPhone na mesma rede Wi-Fi, abra `http://IP-DO-PC:8000` no Safari.

## Deploy (recomendado: GitHub Pages)
1. Crie um repositório no GitHub e envie esta pasta.
2. Em **Settings → Pages**, escolha *Deploy from a branch* → `main` / `/root`.
3. O jogo fica em `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

Alternativa sem git: arraste a pasta em <https://app.netlify.com/drop>.

### No iPhone da Marina
Abrir o link no **Safari** → botão Compartilhar → **Adicionar à Tela de Início**. O jogo abre em tela cheia, com ícone, como um app, e funciona offline.

Ao publicar uma versão nova, aumente `CACHE` em `sw.js` (ex.: `marina-ceara-v6`) e inclua arquivos novos na lista `FILES`.

### Atualizar sem perder o save
1. Nunca mudar a chave `marina-ceara-v1` nem o endereço do jogo (nome do repositório): o `localStorage` é por endereço.
2. Campo novo no save: colocar em `mundoDefaults()`. Conversão de formato: aumentar `SAVE_V` e acrescentar um passo `if (from < N)` em `migrate()`.
3. Antes de publicar, testar abrindo um save da versão anterior.
4. Por garantia, pedir um código de backup (⚙️ → Gerar código) antes de publicar.
