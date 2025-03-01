const CACHE_NAME = 'smart-repositor-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/gondola.js',
  '/js/script.js',
  '/js/version.js',
  '/js/registerSW.js',
  '/icons/smart-repositor-32-32.png',
  '/icons/smart-repositor-128-128.png',
  '/icons/smart-repositor-512-512.png',
  '/pages/gondolas.html',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
];

// Instalación: Cachear archivos
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

// Activación: Elimina cachés antiguas
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

// Intercepción de peticiones: Mejora para manejar múltiples páginas y offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Devuelve desde caché si está disponible
      if (response) {
        return response;
      }
      // Intenta la solicitud desde la red si no está en caché
      return fetch(event.request).catch(() => {
        // Muestra index.html si es una solicitud de navegación y la red falla
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // Retorna una respuesta de error si es necesario
        return new Response('Sin conexión y recurso no encontrado en caché.', {
          status: 404,
          statusText: 'Sin conexión y recurso no encontrado en caché.'
        });
      });
    })
  );
});

// Escuchar el mensaje 'SKIP_WAITING'
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});