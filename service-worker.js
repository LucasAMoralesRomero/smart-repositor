// service-worker.js

const CACHE_NAME = 'smart-repositor-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './js/script.js',
  './js/version.js',
  './js/registerSW.js',
  './icons/smart-repositor-32-32.png',
  './icons/smart-repositor-128-128.png',
  './icons/smart-repositor-512-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
];

//1. Instalación: Cachear archivos
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Archivos cacheados');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activa inmediatamente la nueva versión
});

//2. Activación: Elimina cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[Service Worker] Borrando caché antigua:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim(); // Aplica el SW inmediatamente
});

//3. Intercepción de peticiones: Offline Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en caché, devuelve desde allí
      if (response) {
        return response;
      }

      // Si es una solicitud de página y no hay red, muestra el index.html
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }

      // Si no está en caché y es otro recurso, intenta desde la red
      return fetch(event.request).catch(() => {
        return new Response('Sin conexión y recurso no encontrado en caché.');
      });
    })
  );
});

//4. Actualización automática: Escuchar el mensaje 'SKIP_WAITING'
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});