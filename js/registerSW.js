// js/registerSW.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registrado:', registration);

        // Verificar actualizaciones periódicamente
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Cada 1 hora

        // Escuchar actualizaciones
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nueva versión disponible
                  showUpdateNotification();
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error('Error al registrar el Service Worker:', error);
      });
  });
}

// Mostrar aviso al usuario para actualizar
function showUpdateNotification() {
  const userConfirmed = confirm(
    'Nueva versión disponible. ¿Quieres actualizar ahora?'
  );
  if (userConfirmed) {
    window.location.reload();
  }
}