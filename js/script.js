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

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();

        const records = data.contents?.[0]?.Main?.[1]?.contents?.[0]?.records;
        const product = records?.[0]?.attributes;

        if (product) {
            // Generar URL dinámica de la imagen
            const fullPLU = `00${plu}`; // Agregar prefijo 00 al PLU completo
            const folder = fullPLU.slice(0, 6) + "00"; // Carpeta: primeros 6 dígitos + '00'
            const imageUrl = `https://static.cotodigital3.com.ar/sitios/fotos/medium/${folder}/${fullPLU}.jpg`;

            const productName = product["product.displayName"]?.[0] || 'Nombre no disponible';
            const repositoryId = product["product.repositoryId"]?.[0]?.slice(-6) || plu;

            console.log("PLU formateado:", plu);
            console.log("URL de imagen generada:", imageUrl);

            addProductToList(repositoryId, productName, imageUrl, quantity);

            document.getElementById('pluInput').value = '';
            document.getElementById('cantidad').value = '';
        } else {
            alert("Producto no encontrado.");
        }
    } catch (error) {
        console.error("Error al obtener los datos:", error);
        alert("Error al buscar el producto. Por favor intente de nuevo.");
    }
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

    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info', 'flex-grow-1');
    productInfo.innerHTML = `
        <p class="mb-1"><strong>Nombre:</strong> ${productName}</p>
        <p class="mb-1"><strong>PLU:</strong> ${repositoryId}</p>
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