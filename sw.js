/* sw.js — JB's Thoughts
   Guarda una copia de la app para que abra sin internet.

   IMPORTANTE: cada vez que cambies index.html, manifest.json o
   los iconos, sube en 1 el número de CACHE de aquí abajo
   (v1 -> v2 -> v3...). Si no lo haces, el móvil seguirá viendo
   la versión vieja para siempre, aunque subas los archivos
   correctos a GitHub. */

const CACHE = 'jb-thoughts-v6';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Cache-first: si ya lo tenemos guardado, se sirve al instante y sin red.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});
