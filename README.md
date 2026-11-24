# Marina • Guardiã do Ceará 🌵

Jogo educativo para navegador (funciona no iPhone e no computador) sobre licenciamento ambiental, compensação ambiental e economia ecológica no Ceará.

## Como jogar
- **Andar:** arraste o dedo na metade esquerda da tela (ou setas/WASD no teclado)
- **Interagir:** botão **A** (ou Espaço/E)
- **📋 Agenda:** lista de tarefas com botão "Ir 🚙"
- **🗺️ Mapa:** viajar entre as regiões do Ceará (tecla M)

Fluxo: pegar processo na SEMA → (opcional) vistoria no 📍 → escolher a conclusão → assinar o parecer com o dedo → se a obra for liberada, plantar as mudas **nativas** certas nas covas da compensação.

## Estrutura
```
index.html            página e interface
css/style.css         visual da interface
js/data.js            regiões, processos, espécies, NPCs (o conteúdo educativo fica aqui)
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

Ao publicar uma versão nova, aumente `CACHE` em `sw.js` (ex.: `marina-ceara-v2`).
