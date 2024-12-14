document.getElementById('agregarProducto').addEventListener('click', async () => {
    const plu = document.getElementById('pluInput').value;
    const quantity = document.getElementById('cantidad').value;

    if (!plu || !quantity || quantity <= 0) {
        alert("Por favor ingrese un PLU válido y una cantidad mayor a 0.");
        return;
    }

    const url = `https://api.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Dy=1&Ntt=sku00${plu}&format=json`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();

        // Accedemos a los datos del producto
        const product = data.contents[0]?.Main[2]?.contents[0]?.records?.[0]?.records?.[0];

        if (product) {
            const imageUrl = product.attributes["product.mediumImage.url"]?.[0];
            const productName = product.attributes["sku.displayName"]?.[0];
            const rawRepositoryId = product.attributes["product.repositoryId"]?.[0];
            const repositoryId = rawRepositoryId?.slice(-6); // Toma los últimos 6 caracteres del repositoryId

            // Agregar el producto al DOM
            addProductToList(repositoryId, productName, imageUrl, quantity);
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

    // Crear el card del producto usando clases de Bootstrap
    const productDiv = document.createElement('div');
    productDiv.classList.add('card', 'mb-3', 'shadow-sm');

    const productBody = document.createElement('div');
    productBody.classList.add('card-body', 'd-flex', 'align-items-center');

    // Imagen del producto
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = productName;
    img.classList.add('img-thumbnail', 'me-3');
    img.style.maxWidth = "100px";

    // Información del producto
    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info', 'flex-grow-1');
    productInfo.innerHTML = `
        <p class="mb-1"><strong>Nombre:</strong> ${productName}</p>
        <p class="mb-1"><strong>PLU:</strong> ${repositoryId}</p>
        <p class="mb-1"><strong>Cantidad:</strong> ${quantity}</p>
    `;

    // Botón para marcar como conseguido
    const checkButton = document.createElement('button');
    checkButton.textContent = "✔ Conseguido";
    checkButton.classList.add('btn', 'btn-success', 'ms-auto');
    checkButton.onclick = () => {
        productDiv.classList.add('border-success');
        productDiv.style.backgroundColor = "#d4edda";
        checkButton.disabled = true;
        checkButton.textContent = "Conseguido";
    };

    // Ensamblar la card
    productBody.appendChild(img);
    productBody.appendChild(productInfo);
    productBody.appendChild(checkButton);

    productDiv.appendChild(productBody);

    // Agregar el producto a la lista
    productList.appendChild(productDiv);
}
