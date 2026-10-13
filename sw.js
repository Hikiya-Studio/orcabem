/* OrçaBem: guarda as páginas para funcionarem sem internet.
   Páginas e arquivos do site: busca na rede primeiro (para receber atualizações) e usa a cópia guardada se estiver offline.
   Fontes: usa a cópia guardada e atualiza em segundo plano. */
const VERSAO = 'orcabem-v6';
const ARQUIVOS = [
  './',
  './orcamento-pintura/',
  './quanto-cobrar-diarista/',
  './orcamento-eletricista/',
  './privacidade/',
  './assets/ferramenta.css',
  './assets/app.js',
  './assets/tema.js',
  './orcamento-pintura/calculo.js',
  './quanto-cobrar-diarista/calculo.js',
  './orcamento-eletricista/calculo.js',
  './favicon.svg',
  './apple-touch-icon.png',
  './icone-192.png',
  './icone-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const fonte = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !fonte) return;

  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(VERSAO).then((c) => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('./') : Response.error())))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((guardada) => {
      const rede = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copia = res.clone();
            caches.open(VERSAO).then((c) => c.put(req, copia));
          }
          return res;
        })
        .catch(() => guardada);
      return guardada || rede;
    })
  );
});
