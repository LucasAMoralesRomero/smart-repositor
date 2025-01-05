document.getElementById('agregarProducto').addEventListener('click', async () => {
    const pluInput = document.getElementById('pluInput').value.trim();
    const quantity = parseInt(document.getElementById('cantidad').value, 10);

    if (!pluInput || isNaN(quantity) || quantity <= 0) {
        alert("Por favor ingrese un PLU válido y una cantidad mayor a 0.");
        return;
    }

    // Generar la URL para el servidor
    const plu = pluInput.padStart(6, '0'); // Asegurar que el PLU tenga 6 dígitos
    const url = `https://smart-repositor-server.vercel.app/product/${plu}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const product = await response.json();

        if (!product.valid) {
            alert("Producto no encontrado en el servidor.");
            return;
        }

        // Agregar el producto a la lista
        addProductToList(product.plu, product.description, product.image, quantity);
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        alert('Hubo un error al buscar el producto.');
    }
});

function addProductToList(plu, productName, imageUrl, quantity) {
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
        <p class="mb-1"><strong>PLU:</strong> ${plu}</p>
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
