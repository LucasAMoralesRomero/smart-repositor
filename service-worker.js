// service-worker.js

const CACHE_NAME = 'smart-repositor-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/script.js',
  '/js/version.js',
  '/js/registerSW.js',
  '/icons/smart-repositor-32-32.png',
  '/icons/smart-repositor-128-128.png',
  '/icons/smart-repositor-512-512.png',
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

//3. Intercepción de peticiones: Servir desde caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      return new Response('Sin conexión y recurso no encontrado en caché.');
    })
  );
});

//4. Actualización automática: Escuchar el mensaje 'SKIP_WAITING'
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});