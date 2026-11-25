# Marina • Guardiã do Ceará 🌵

Jogo educativo para navegador (funciona no iPhone e no computador) sobre licenciamento ambiental, compensação ambiental e economia ecológica no Ceará.

## Como jogar
- **Andar:** arraste o dedo na metade esquerda da tela (ou setas/WASD no teclado)
- **Interagir:** botão **A** (ou Espaço/E)
- **📋 Agenda:** lista de tarefas com botão "Ir 🚙"
- **🗺️ Mapa:** viajar entre as regiões do Ceará (tecla M)

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
- **Enquanto ela está fora:** mudas crescem, a brigada apaga focos e pode ter havido uma queimada (perda limitada).

Para testar outra estação: `http://localhost:8000/?mes=3` (1 a 12).

## Save
- Salvo automaticamente no `localStorage` do aparelho (`marina-ceara-v1`), com versão (`v`) e migração de saves antigos em `migrate()`, mais uma cópia de segurança (`marina-ceara-bak`).
- Menu ⚙️ → **Gerar código** cria um código de backup que restaura o jogo em qualquer aparelho.
- No iPhone, instalar na Tela de Início evita que o Safari apague os dados após 7 dias sem uso.

## Estrutura
```
index.html            página e interface
css/style.css         visual da interface
js/data.js            regiões, processos, espécies, NPCs (o conteúdo educativo fica aqui)
js/data-mundo.js      biomas, modelos de processos, eventos, causas de queimada, estações, cargos
js/mundo.js           estações, queimadas, mudas, processos gerados, fiscalização, ano, backup
js/sprites.js         pixel art da Marina, árvores, prédios (tudo em código)
js/game.js            mapa, movimento, diálogos, parecer, plantio, salvamento
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

Ao publicar uma versão nova, aumente `CACHE` em `sw.js` (ex.: `marina-ceara-v4`).
