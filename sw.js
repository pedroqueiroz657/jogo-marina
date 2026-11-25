// Service worker: permite jogar offline depois do primeiro acesso.
// Ao publicar uma nova versão, aumente o número abaixo.
const CACHE = 'marina-ceara-v3';
const FILES = ['./', 'index.html', 'css/style.css', 'js/data.js', 'js/data-mundo.js', 'js/mundo.js', 'js/sprites.js', 'js/game.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'assets/marina.jpg'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// rede primeiro (pega atualizações), cache como reserva offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request))
  );
});
