// ✨ JB Design System v2 — Service Worker de JBsThoughts
// Sube este archivo en la MISMA carpeta que JBsThoughts_v2.html en GitHub.
// Si en el futuro cambias mucho la app, sube el número de CACHE (v1 -> v2)
// para que los teléfonos descarten la versión vieja guardada.
const CACHE = 'jbthoughts-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.add('./').catch(() => {}))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: usa lo guardado al instante y, en paralelo, actualiza el
// caché con la versión más reciente de internet para la próxima vez.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fresh = fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
