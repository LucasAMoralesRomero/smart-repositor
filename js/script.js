document.getElementById('agregarProducto').addEventListener('click', async () => {
    const pluInput = document.getElementById('pluInput').value.trim();
    const quantity = parseInt(document.getElementById('cantidad').value, 10);

    if (!pluInput || isNaN(quantity) || quantity <= 0) {
        alert("Por favor ingrese un PLU válido y una cantidad mayor a 0.");
        return;
    }

    const plu = pluInput.padStart(6, '0');
    const url = `https://smart-repositor-server.vercel.app/product/${plu}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.plu) {
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
    productBody.classList.add('card-body', 'd-flex', 'align-items-center', 'flex-wrap');

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = productName;
    img.classList.add('img-thumbnail', 'me-3');
    img.style.maxWidth = "100px";

    const cleanedPLU = repositoryId.replace(/^sku0*/, '');

    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info', 'flex-grow-1');
    productInfo.innerHTML = `
        <p class="mb-1"><strong>Nombre:</strong> ${productName}</p>
        <p class="mb-1"><strong>PLU:</strong> ${cleanedPLU}</p>
        <p class="mb-1"><strong>Cantidad total:</strong> ${quantity}</p>
        <p class="mb-1" id="cantidad-conseguida-${repositoryId}"><strong>Cantidad conseguida:</strong> 0</p>
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('d-flex', 'justify-content-between', 'w-100', 'mt-2');

    const checkButton = document.createElement('button');
    checkButton.textContent = "✅️ Conseguido";
    checkButton.classList.add('btn', 'btn-success', 'flex-grow-1', 'me-2');
    checkButton.onclick = () => {
        productDiv.style.transition = "opacity 0.5s ease-out";
        productDiv.style.opacity = "0";
        setTimeout(() => {
            productDiv.remove();
        }, 500);
    };

    const checkPartial = document.createElement('button');
    checkPartial.textContent = "⚠️ Parcial";
    checkPartial.classList.add('btn', 'btn-warning', 'flex-grow-1', 'me-2');
    checkPartial.onclick = () => {
        const cantidadIngresada = prompt(`Ingresa la cantidad disponible (Máximo: ${quantity})`);
        const cantidadParcial = parseInt(cantidadIngresada, 10);

        if (!isNaN(cantidadParcial) && cantidadParcial > 0 && cantidadParcial <= quantity) {
            // Actualizar dinámicamente el campo de cantidad conseguida
            const cantidadConseguidaElemento = document.getElementById(`cantidad-conseguida-${repositoryId}`);
            cantidadConseguidaElemento.textContent = `<strong>Cantidad conseguida: ${cantidadParcial}</strong>`;

            productDiv.classList.add('border-warning');
            productDiv.style.backgroundColor = "#fff3cd"; // Amarillo para estado parcial
        } else {
            alert("Ingrese una cantidad válida menor o igual a la buscada.");
        }
    };

    const checkNoDisponible = document.createElement('button');
    checkNoDisponible.textContent = "❌ No conseguido";
    checkNoDisponible.classList.add('btn', 'btn-danger', 'flex-grow-1');
    checkNoDisponible.onclick = () => {
        productDiv.classList.add('border-danger');
        productDiv.style.backgroundColor = "#f8d7da";
        checkNoDisponible.disabled = true;
        checkButton.disabled = true;
        checkPartial.disabled = true;
    };

    buttonContainer.appendChild(checkButton);
    buttonContainer.appendChild(checkPartial);
    buttonContainer.appendChild(checkNoDisponible);

    productBody.appendChild(img);
    productBody.appendChild(productInfo);
    productBody.appendChild(buttonContainer);

    productDiv.appendChild(productBody);
    productList.appendChild(productDiv);
}