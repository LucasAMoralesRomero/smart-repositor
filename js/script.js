document.getElementById('agregarProducto').addEventListener('click', async () => {
    const pluInput = document.getElementById('pluInput').value.trim();
    const quantity = parseInt(document.getElementById('cantidad').value, 10);

    if (!pluInput || isNaN(quantity) || quantity <= 0) {
        alert("Por favor ingrese un PLU válido y una cantidad mayor a 0.");
        return;
    }

    // Nos aseguramos que el PLU tenga 6 dígitos
    const plu = pluInput.padStart(6, '0'); // Completar con ceros al inicio si tiene menos de 6 dígitos
    const url = `https://smart-repositor-server.vercel.app/product/${plu}`; //llamamos al server

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();

        // Verificar si la respuesta es válida
        if (!data.valid) {
            alert("El producto no fue encontrado en el servidor.");
            return;
        }

        const { plu: repositoryId, description: productName, image: imageUrl } = data;

        addProductToList(repositoryId, productName, imageUrl, quantity);
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        alert("Hubo un error al buscar el producto.");
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

    // Procesar el PLU para mostrarlo correctamente
    const cleanedPLU = repositoryId.replace(/^sku0*/, ''); // Quita "sku" y ceros iniciales.

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
    checkNoDisponible.disabled = true; // Desactiva el otro botón
    checkButton.textContent = "Conseguido";
};

// Se agrega el botón de "No conseguido"
const checkNoDisponible = document.createElement('button');
checkNoDisponible.textContent = "❌ No conseguido";
checkNoDisponible.classList.add('btn', 'btn-danger', 'ms-2');
checkNoDisponible.onclick = () => {
    productDiv.classList.add('border-danger');
    productDiv.style.backgroundColor = "#f8d7da";
    checkNoDisponible.disabled = true;
    checkButton.disabled = true; // Desactiva el otro botón
    checkNoDisponible.textContent = "No conseguido";
};

    productBody.appendChild(img);
    productBody.appendChild(productInfo);
    productBody.appendChild(checkButton);
    productBody.appendChild(checkNoDisponible);

    productDiv.appendChild(productBody);

    productList.appendChild(productDiv);
}