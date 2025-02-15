// js/registerSW.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('[SW] Registrado correctamente:', registration);

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
                  // Nueva versión disponible, preguntar al usuario
                  showUpdateNotification(registration);
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error('[SW] Error al registrar:', error);
      });
  });
}

// Mostrar aviso de nueva versión
function showUpdateNotification(registration) {
  const userConfirmed = confirm(
    'Nueva versión disponible. ¿Quieres actualizar ahora?'
  );
  if (userConfirmed) {
    // Enviar mensaje al SW para saltar la espera
    if (registration.waiting) {
      registration.waiting.postMessage('SKIP_WAITING');
    }
    window.location.reload();
  }
}

// Actualiza automáticamente cuando se instala una nueva versión
if (navigator.serviceWorker && navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage('SKIP_WAITING');
}