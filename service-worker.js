const CACHE_NAME = 'smart-repositor-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/script.js',
  '/js/version.js',
  '/icons/smart-repositor-32-32.png',
  '/icons/smart-repositor-128-128.png',
  '/icons/smart-repositor-512-512.png',
];

// Instalación: cachea los archivos necesarios
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Archivos cacheados');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activación: limpia cachés viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  console.log('Cache actualizado');
});

// Intercepción de peticiones: sirve desde caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});