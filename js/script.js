document.getElementById('agregarProducto').addEventListener('click', async () => {
    const pluInput = document.getElementById('pluInput').value.trim();
    const quantity = parseInt(document.getElementById('cantidad').value, 10);

    if (!pluInput || isNaN(quantity) || quantity <= 0) {
        alert("Por favor ingrese un PLU válido y una cantidad mayor a 0.");
        return;
    }

    // Asegurar que el PLU tenga 6 dígitos
    const plu = pluInput.padStart(6, '0'); // Completar con ceros al inicio si tiene menos de 6 dígitos

    const url = `https://api.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Dy=1&Ntt=sku00${plu}&format=json`;

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
        return response.text(); // Devuelve el texto sin procesar.
    })
    .then(rawData => {
        let data;
        try {
            data = JSON.parse(rawData); // Intenta convertirlo a JSON.
        } catch (error) {
            console.warn('No es un JSON válido. Procesando como texto plano.', error);
            return alert('La respuesta no es un JSON válido.');
        }

        // Navegar por el JSON para encontrar los datos necesarios.
        const mainContents = data?.contents?.[0]?.Main;
        if (!mainContents || mainContents.length < 3) {
            alert('Producto no encontrado en la respuesta.');
            return;
        }

        const productAttributes = mainContents[2]?.contents?.[0]?.records?.[0]?.attributes;
        if (!productAttributes) {
            alert('No se encontraron atributos del producto.');
            return;
        }

        const productName = productAttributes['product.displayName']?.[0] || 'Nombre no disponible';
        const repositoryId = productAttributes['product.repositoryId']?.[0] || 'ID no disponible';
        // Generar URL dinámica de la imagen
        const fullPLU = `00${plu}`; // Agregar prefijo 00 al PLU completo
        const folder = fullPLU.slice(0, 6) + "00"; // Carpeta: primeros 6 dígitos + '00'
        const imageUrl = `https://static.cotodigital3.com.ar/sitios/fotos/medium/${folder}/${fullPLU}.jpg`;

        
        addProductToList(repositoryId, productName, imageUrl, quantity); // Aquí usamos "quantity".
    })
    .catch(error => {
        console.error('Error al procesar la solicitud:', error);
        alert('Hubo un error al buscar el producto.');
    });
});

function addProductToList(repositoryId, productName, imageUrl, quantity) {
const productList = document.getElementById('lista');

const productDiv = document.createElement('div');
productDiv.classList.add('card', 'mb-3', 'shadow-sm');

const productBody = document.createElement('div');
productBody.classList.add('card-body', 'd-flex', 'align-items-center');

const img = document.createElement('img');
img.src = imageUrl;
img.alt = productName;
img.classList.add('img-thumbnail', 'me-3');
img.style.maxWidth = "100px";
// Procesar el PLU: eliminar "prod" y ceros iniciales
const cleanedPLU = repositoryId.replace(/^prod0*/, ''); // Quita "prod" y los ceros iniciales.

const productInfo = document.createElement('div');
productInfo.classList.add('product-info', 'flex-grow-1');
productInfo.innerHTML = `
    <p class="mb-1"><strong>Nombre:</strong> ${productName}</p>
    <p class="mb-1"><strong>PLU:</strong> ${cleanedPLU}</p>
    <p class="mb-1"><strong>Cantidad:</strong> ${quantity}</p>
`;

const checkButton = document.createElement('button');
checkButton.textContent = "✔ Conseguido";
checkButton.classList.add('btn', 'btn-success', 'ms-auto');
checkButton.onclick = () => {
    productDiv.classList.add('border-success');
    productDiv.style.backgroundColor = "#d4edda";
    checkButton.disabled = true;
    checkButton.textContent = "Conseguido";
};

productBody.appendChild(img);
productBody.appendChild(productInfo);
productBody.appendChild(checkButton);

productDiv.appendChild(productBody);

productList.appendChild(productDiv);
}