document.getElementById('agregarProducto').addEventListener('click', async () => {
    const pluInput = document.getElementById('pluInput').value.trim();
    const quantity = parseInt(document.getElementById('cantidad').value, 10);

    if (!pluInput || isNaN(quantity) || quantity <= 0) {
        alert("Por favor ingrese un PLU válido y una cantidad mayor a 0.");
        return;
    }

    // Convertimos a 6 dígitos
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

        // Agregamos o actualizamos el producto
        addProductToList(repositoryId, productName, imageUrl, quantity);
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        alert("Hubo un error al buscar el producto.");
    }
});

function addProductToList(repositoryId, productName, imageUrl, quantity) {
    const productList = document.getElementById('lista');

    // Creamos un ID único con el PLU (quitamos 'sku0' si es necesario).
    // Por ejemplo "card-012345".
    const cardId = `card-${repositoryId.replace(/^sku0*/, '')}`;

    // 1) Verificamos si ya existe el producto en la lista
    let existingCard = document.getElementById(cardId);
    if (existingCard) {
        // 2) Actualizar la cantidad total
        const totalQuantityElement = existingCard.querySelector('.total-quantity');
        
        // Intentamos obtener el valor actual (guardado en un data attribute o en el texto)
        const currentTotal = parseInt(totalQuantityElement.dataset.currentTotal, 10) || 0;
        const newTotal = currentTotal + quantity;
        
        // Actualizamos el dataset y el texto
        totalQuantityElement.dataset.currentTotal = newTotal; 
        totalQuantityElement.textContent = `Cantidad total: ${newTotal}`;
        
        // Podríamos también decidir resetear el "estado" de la tarjeta si estaba marcada parcial/no disponible, etc.
        // Por ejemplo:
        // existingCard.classList.remove('border-danger', 'border-warning');
        // existingCard.style.backgroundColor = '';
        // ... etc.

        return; // Evitamos crear una nueva tarjeta
    }

    // *** Si NO existe la tarjeta, la creamos ***

    const productDiv = document.createElement('div');
    productDiv.classList.add('card', 'mb-3', 'shadow-sm');
    productDiv.id = cardId;  // Para identificarla en el futuro

    const productBody = document.createElement('div');
    productBody.classList.add('card-body', 'd-flex', 'align-items-center', 'flex-wrap');

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = productName;
    img.classList.add('img-thumbnail', 'me-3');
    img.style.maxWidth = "100px";

    // Limpiamos el PLU si es necesario
    const cleanedPLU = repositoryId.replace(/^sku0*/, '');

    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info', 'flex-grow-1');
    
    // Creamos un elemento para mostrar la cantidad total con un "data" para guardar el número
    // (para luego poder actualizarlo fácilmente)
    const totalQuantityElem = document.createElement('p');
    totalQuantityElem.classList.add('mb-1', 'total-quantity');
    totalQuantityElem.dataset.currentTotal = quantity; // aquí guardamos la cantidad real en un data attribute
    totalQuantityElem.innerHTML = `<strong>Cantidad total:</strong> ${quantity}`;

    productInfo.innerHTML = `
        <p class="mb-1"><strong>Nombre:</strong> ${productName}</p>
        <p class="mb-1"><strong>PLU:</strong> ${cleanedPLU}</p>
    `;
    // Añadimos el elemento de cantidad total a "productInfo"
    productInfo.appendChild(totalQuantityElem);

    // Cantidad conseguida: arranca en 0
    const cantidadConseguidaElem = document.createElement('p');
    cantidadConseguidaElem.classList.add('mb-1');
    cantidadConseguidaElem.id = `cantidad-conseguida-${repositoryId}`;
    cantidadConseguidaElem.innerHTML = `<strong>Cantidad conseguida:</strong> 0`;
    productInfo.appendChild(cantidadConseguidaElem);

    // ===== Botones de acción =====
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('d-flex', 'justify-content-between', 'w-100', 'mt-2');

    // Botón "Conseguido"
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

    // Botón "Parcial"
    const checkPartial = document.createElement('button');
    checkPartial.textContent = "⚠️ Parcial";
    checkPartial.classList.add('btn', 'btn-warning', 'flex-grow-1', 'me-2');
    checkPartial.onclick = () => {
        const totalCantidad = parseInt(totalQuantityElem.dataset.currentTotal, 10);
        const cantidadIngresada = prompt(`Ingresa la cantidad disponible (Máximo: ${totalCantidad})`);
        const cantidadParcial = parseInt(cantidadIngresada, 10);

        if (!isNaN(cantidadParcial) && cantidadParcial > 0 && cantidadParcial <= totalCantidad) {
            // Actualizar dinámicamente el campo de cantidad conseguida
            cantidadConseguidaElem.innerHTML = `<strong>Cantidad conseguida:</strong> ${cantidadParcial}`;
            productDiv.classList.add('border-warning');
            productDiv.style.backgroundColor = "#fff3cd"; // Amarillo para estado parcial
        } else {
            alert("Ingrese una cantidad válida menor o igual a la buscada.");
        }
    };

    // Botón "No conseguido"
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

    // Agregar botones
    buttonContainer.appendChild(checkButton);
    buttonContainer.appendChild(checkPartial);
    buttonContainer.appendChild(checkNoDisponible);

    // Añadir al body de la tarjeta
    productBody.appendChild(img);
    productBody.appendChild(productInfo);
    productBody.appendChild(buttonContainer);

    // Añadir la tarjeta a la lista
    productDiv.appendChild(productBody);
    productList.appendChild(productDiv);
}