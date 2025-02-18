if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js', { scope: './' })
      .then(registration => {
        console.log('[SW] Registrado con éxito:', registration);
        registration.update(); // Fuerza la actualización

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                alert('Nueva versión disponible. Recargando...');
                window.location.reload();
              }
            };
          }
        };
      })
      .catch(error => console.error('[SW] Error al registrar:', error));
  });
}