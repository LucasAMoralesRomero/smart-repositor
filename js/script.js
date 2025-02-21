/****************************************************
 * Evento 'click' en el botón de "Buscar y Agregar"
 ****************************************************/
document.getElementById('agregarProducto').addEventListener('click', async () => {
    // Obtenemos los valores del input
    const pluInput = document.getElementById('pluInput').value.trim();
    const quantity = parseInt(document.getElementById('cantidad').value, 10);

    // Validaciones básicas
    if (!pluInput || isNaN(quantity) || quantity <= 0) {
        alert("Por favor ingrese un PLU válido y una cantidad mayor a 0.");
        return;
    }

    // Aseguramos que el PLU sea de 6 dígitos (opcional, depende de tu API)
    const plu = pluInput.padStart(6, '0');

    // Endpoint del API
    const url = `https://smart-repositor-server.vercel.app/product/${plu}`;
    
    try {
        // Llamada a la API para obtener los datos del producto
        const response = await fetch(url);
        
        // Si la respuesta no es OK, lanzamos error
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        // Transformamos la respuesta a JSON
        const data = await response.json();

        // Verificamos si la API devolvió datos válidos
        if (!data || !data.plu) {
            alert("El producto no fue encontrado en el servidor.");
            return;
        }

        // Extraemos la info relevante del producto
        const { plu: repositoryId, description: productName, image: imageUrl } = data;

        // Llamamos a la función que maneja la creación/actualización de la tarjeta
        addProductToList(repositoryId, productName, imageUrl, quantity);
        
    } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        alert("Hubo un error al buscar el producto.");
    }
});


/****************************************************
 * Función para añadir o actualizar productos en la lista
 ****************************************************/
function addProductToList(repositoryId, productName, imageUrl, quantity) {
    // 1) Localizamos el contenedor donde se mostrarán las tarjetas
    const productList = document.getElementById('lista');

    // 2) Normalizamos o limpiamos el PLU (por si el servidor envía 'sku0501615', etc.)
    //    - Quita el prefijo 'sku0...' al inicio
    //    - Quita ceros a la izquierda
    const cleanedPLU = repositoryId
        .replace(/^sku0*/i, '')  // Elimina "sku0" y más ceros del inicio (si existiese)
        .replace(/^0+/, '');     // Elimina ceros a la izquierda

    // 3) Construimos un ID único para la tarjeta, basado en el PLU limpio
    const cardId = `card-${cleanedPLU}`;

    // 4) Verificamos si ya existe la tarjeta en el DOM (es decir, si ya agregamos este PLU antes)
    let existingCard = document.getElementById(cardId);

    if (existingCard) {
        // (A) Si YA existe la tarjeta, simplemente ACTUALIZAMOS la cantidad total
        const totalQuantityElem = existingCard.querySelector('.total-quantity');

        // Leemos la cantidad total actual desde un data-attribute o texto
        const currentTotal = parseInt(totalQuantityElem.dataset.currentTotal, 10) || 0;

        // Sumamos la nueva cantidad
        const newTotal = currentTotal + quantity;
        
        // Guardamos la nueva cantidad en el data-attribute y actualizamos el texto
        totalQuantityElem.dataset.currentTotal = newTotal;
        totalQuantityElem.textContent = `Cantidad total: ${newTotal}`;

        // Retornamos para no crear una nueva tarjeta
        return;
    }

    // (B) Si NO existe la tarjeta, la creamos desde cero

    // 1) Creación del contenedor principal de la tarjeta
    const productDiv = document.createElement('div');
    productDiv.classList.add('card', 'mb-3', 'shadow-sm');
    productDiv.id = cardId;  // Asignamos el ID único

    // 2) Creación del cuerpo de la tarjeta (card-body)
    const productBody = document.createElement('div');
    productBody.classList.add('card-body', 'd-flex', 'align-items-center', 'flex-wrap');

    // 3) Imagen del producto
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = productName;
    img.classList.add('img-thumbnail', 'me-3');
    img.style.maxWidth = "100px";

    // 4) Info del producto
    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info', 'flex-grow-1');

    // Llenamos el contenido con Nombre y PLU (ya limpio)
    productInfo.innerHTML = `
        <p class="mb-1"><strong>Nombre:</strong> ${productName}</p>
        <p class="mb-1"><strong>PLU:</strong> ${cleanedPLU}</p>
    `;

    // 5) Cantidad total (guardamos la cantidad en un data-attribute)
    const totalQuantityElem = document.createElement('p');
    totalQuantityElem.classList.add('mb-1', 'total-quantity');
    totalQuantityElem.dataset.currentTotal = quantity; // aquí guardamos la cantidad real
    totalQuantityElem.innerHTML = `<strong>Cantidad total:</strong> ${quantity}`;

    // Añadimos la cantidad total al bloque de info
    productInfo.appendChild(totalQuantityElem);

    // 6) Cantidad conseguida (por defecto 0)
    const cantidadConseguidaElem = document.createElement('p');
    cantidadConseguidaElem.classList.add('mb-1');
    cantidadConseguidaElem.id = `cantidad-conseguida-${repositoryId}`;
    cantidadConseguidaElem.innerHTML = `<strong>Cantidad conseguida:</strong> 0`;

    // Añadimos también al bloque de info
    productInfo.appendChild(cantidadConseguidaElem);

    // 7) Creación del contenedor de botones
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('d-flex', 'justify-content-between', 'w-100', 'mt-2');

    /****************************************************
     * Botón "✅ Conseguido"
     ****************************************************/
    const checkButton = document.createElement('button');
    checkButton.textContent = "✅️ Conseguido";
    checkButton.classList.add('btn', 'btn-success', 'flex-grow-1', 'me-2');
    checkButton.onclick = () => {
        // Efecto de desvanecimiento antes de remover la tarjeta
        productDiv.style.transition = "opacity 0.5s ease-out";
        productDiv.style.opacity = "0";
        setTimeout(() => {
            productDiv.remove();
        }, 500);
    };

    /****************************************************
     * Botón "⚠️ Parcial"
     ****************************************************/
    const checkPartial = document.createElement('button');
    checkPartial.textContent = "⚠️ Parcial";
    checkPartial.classList.add('btn', 'btn-warning', 'flex-grow-1', 'me-2');
    checkPartial.onclick = () => {
        // Obtenemos la cantidad total del data-attribute
        const totalCantidad = parseInt(totalQuantityElem.dataset.currentTotal, 10);
        // Pedimos al usuario cuántos productos realmente consiguió
        const cantidadIngresada = prompt(`Ingresa la cantidad disponible (Máximo: ${totalCantidad})`);
        const cantidadParcial = parseInt(cantidadIngresada, 10);

        // Validamos que la cifra sea válida y ≤ al total
        if (!isNaN(cantidadParcial) && cantidadParcial > 0 && cantidadParcial <= totalCantidad) {
            // Actualizamos dinámicamente la "cantidad conseguida"
            cantidadConseguidaElem.innerHTML = `<strong>Cantidad conseguida:</strong> ${cantidadParcial}`;
            // Cambiamos el estilo a "parcial"
            productDiv.classList.add('border-warning');
            productDiv.style.backgroundColor = "#fff3cd"; // color amarillo
        } else {
            alert("Ingrese una cantidad válida menor o igual a la buscada.");
        }
    };

    /****************************************************
     * Botón "❌ No conseguido"
     ****************************************************/
    const checkNoDisponible = document.createElement('button');
    checkNoDisponible.textContent = "❌ No conseguido";
    checkNoDisponible.classList.add('btn', 'btn-danger', 'flex-grow-1');
    checkNoDisponible.onclick = () => {
        // Marcamos la tarjeta con bordes rojos, etc.
        productDiv.classList.add('border-danger');
        productDiv.style.backgroundColor = "#f8d7da";
        // Deshabilitamos todos los botones para que no se cambie el estado
        checkNoDisponible.disabled = true;
        checkButton.disabled = true;
        checkPartial.disabled = true;
    };

    // 8) Añadimos los 3 botones al contenedor
    buttonContainer.appendChild(checkButton);
    buttonContainer.appendChild(checkPartial);
    buttonContainer.appendChild(checkNoDisponible);

    // 9) Armamos la tarjeta final
    productBody.appendChild(img);
    productBody.appendChild(productInfo);
    productBody.appendChild(buttonContainer);

    productDiv.appendChild(productBody);

    // 10) Añadimos la tarjeta a la lista
    productList.appendChild(productDiv);
}
