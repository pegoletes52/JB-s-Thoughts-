/* sw.js — JB's Thoughts
   Guarda una copia de la app para que abra sin internet.
   Solo se activa si algún día subes JBsThoughts_v2.html
   y este archivo a un hosting (https). En file:// el
   navegador nunca llega a leer este archivo.

   IMPORTANTE: cada vez que cambies index.html, sube en 1 el
   número de CACHE de aquí abajo (v1 -> v2 -> v3...). Si no lo
   haces, el móvil seguirá viendo la versión vieja para siempre,
   aunque subas el archivo correcto a GitHub. */

const CACHE = 'jb-thoughts-v2';
const APP_SHELL = ['./'];

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
