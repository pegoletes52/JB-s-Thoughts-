// ✨ JB Design System v2 — Service Worker de JBsThoughts
// Sube este archivo en la MISMA carpeta que JBsThoughts_v2.html en GitHub.
// Si en el futuro cambias mucho la app, sube el número de CACHE (v1 -> v2)
// para que los teléfonos descarten la versión vieja guardada.
const CACHE = 'jbthoughts-v3';

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

// Estrategia según el tipo de recurso:
// - La página principal (el HTML) usa "red primero": si hay internet, siempre
//   trae la versión más reciente (así el ícono y los cambios se ven al toque,
//   sin depender de subir el número de CACHE cada vez). Si no hay internet,
//   cae en lo guardado, para que la app siga abriendo sin conexión.
// - El resto de recursos (fuentes, imágenes) sigue usando lo guardado al
//   instante y actualizando en paralelo, que es más rápido para esos casos.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
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
