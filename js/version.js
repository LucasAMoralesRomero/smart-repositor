// Cargar y mostrar la versión desde el manifest.json
fetch('../manifest.json')
    .then(response => response.json())
    .then(data => {
        const version = data.version || 'Desconocida';
        document.getElementById('manifestVersion').textContent = `Versión: ${version}`;
    })
    .catch(error => {
        console.error('Error al cargar el manifest.json:', error);
        document.getElementById('manifestVersion').textContent = 'Error al cargar la versión';
    });