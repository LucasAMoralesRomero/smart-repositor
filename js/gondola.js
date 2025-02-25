/********************************************
 * Configuración de IndexedDB
 ********************************************/
const dbName = "SmartRepositorDB";
const storeName = "gondolas";

function openDB(callback) {
  let request = indexedDB.open(dbName, 1);

  request.onupgradeneeded = function (event) {
    let db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: "id_gondola", autoIncrement: true });
    }
  };

  request.onsuccess = function (event) {
    callback(event.target.result);
  };

  request.onerror = function (event) {
    console.error("Error abriendo la base de datos", event);
  };
}

/********************************************
 * CRUD Góndolas
 ********************************************/

/**
 * Agrega una nueva góndola, con un nombre y un array vacío de productos.
 */
function agregarGondola() {
  const nombreGondola = document.getElementById("nombreGondola").value.trim();
  if (!nombreGondola) {
    alert("Ingrese un nombre válido para la góndola.");
    return;
  }

  openDB((db) => {
    let transaction = db.transaction(storeName, "readwrite");
    let store = transaction.objectStore(storeName);

    store.add({ nombreGondola, productos: [] });

    transaction.oncomplete = function () {
      console.log("Góndola agregada correctamente");
      document.getElementById("nombreGondola").value = "";
      listarGondolas(); // refrescar la lista
    };

    transaction.onerror = function (event) {
      console.error("Error al agregar góndola", event.target.error);
    };
  });
}

/**
 * Lista todas las góndolas y sus productos,
 * además de rellenar el <select> para agregar productos.
 */
function listarGondolas() {
  openDB((db) => {
    let transaction = db.transaction(storeName, "readonly");
    let store = transaction.objectStore(storeName);
    let request = store.getAll();

    request.onsuccess = function () {
      const gondolas = request.result; // array de {id_gondola, nombreGondola, productos[]}
      let listaGondolas = document.getElementById("listaGondolas");
      listaGondolas.innerHTML = "";

      // Construimos las tarjetas
      gondolas.forEach((gondola) => {
        let gondolaContainer = document.createElement("div");
        gondolaContainer.classList.add("card", "mb-3", "shadow-sm");

        // Botón para borrar toda la góndola
        gondolaContainer.innerHTML = `
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0">${gondola.nombreGondola}</h5>
            <button class="btn btn-sm btn-danger" onclick="borrarGondola(${gondola.id_gondola})">
              Borrar Góndola
            </button>
          </div>
          <div class="card-body">
            <ul class="list-group" id="productos-${gondola.id_gondola}"></ul>
          </div>
        `;
        listaGondolas.appendChild(gondolaContainer);

        // Listar los productos de esta góndola
        listarProductos(gondola.id_gondola);
      });

      // Rellenar el <select> de góndolas
      actualizarSelectGondolas(gondolas);
    };

    transaction.onerror = function (event) {
      console.error("Error al listar góndolas", event.target.error);
    };
  });
}

/**
 * Actualiza el <select> de góndolas para el formulario de "Agregar Producto".
 */
function actualizarSelectGondolas(gondolas) {
  const select = document.getElementById("selectGondolaProducto");
  select.innerHTML = "";

  // Opción por defecto
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Seleccione una góndola";
  select.appendChild(defaultOption);

  // Agregar cada góndola
  gondolas.forEach((gondola) => {
    const option = document.createElement("option");
    option.value = gondola.id_gondola;
    option.textContent = gondola.nombreGondola;
    select.appendChild(option);
  });
}

/**
 * Elimina una góndola completa (por su ID autoincrement).
 */
function borrarGondola(idGondola) {
  if (!confirm("¿Seguro que quieres borrar esta góndola?")) return;

  openDB((db) => {
    let transaction = db.transaction(storeName, "readwrite");
    let store = transaction.objectStore(storeName);
    store.delete(idGondola);

    transaction.oncomplete = function () {
      console.log("Góndola borrada con ID:", idGondola);
      listarGondolas();
    };

    transaction.onerror = function (event) {
      console.error("Error al borrar góndola", event.target.error);
    };
  });
}

/********************************************
 * CRUD Productos
 ********************************************/

/**
 * Lista los productos de una góndola específica.
 */
function listarProductos(idGondola) {
  openDB((db) => {
    let transaction = db.transaction(storeName, "readonly");
    let store = transaction.objectStore(storeName);

    let request = store.get(idGondola);
    request.onsuccess = function () {
      let gondola = request.result;
      let productosList = document.getElementById(`productos-${idGondola}`);
      if (!productosList) return;
      productosList.innerHTML = "";

      if (gondola && gondola.productos.length > 0) {
        gondola.productos.forEach((producto) => {
          let li = document.createElement("li");
          li.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between",
            "align-items-center"
          );

          li.innerHTML = `
            <span>
              ${producto.nombre} (PLU: ${producto.plu})
              - <strong>${producto.cantidad} unidades</strong>
            </span>
            <div>
              <button
                class="btn btn-sm btn-warning me-2"
                onclick="pedirNuevaCantidad(${idGondola}, '${producto.plu}')"
              >
                Modificar
              </button>
              <button
                class="btn btn-sm btn-danger"
                onclick="borrarProducto(${idGondola}, '${producto.plu}')"
              >
                Borrar
              </button>
            </div>
          `;
          productosList.appendChild(li);
        });
      } else {
        productosList.innerHTML = `
          <li class="list-group-item text-muted">
            No hay productos en esta góndola
          </li>
        `;
      }
    };

    transaction.onerror = function (event) {
      console.error("Error al listar productos", event.target.error);
    };
  });
}

/**
 * Muestra un prompt para actualizar la cantidad de un producto (por PLU).
 */
function pedirNuevaCantidad(idGondola, plu) {
  let nuevaCantidad = prompt("Ingrese la nueva cantidad:");
  nuevaCantidad = parseInt(nuevaCantidad, 10);

  if (!isNaN(nuevaCantidad) && nuevaCantidad >= 0) {
    modificarCantidadProducto(idGondola, plu, nuevaCantidad);
  }
}

/**
 * Modifica la cantidad de un producto (por su PLU) en la góndola indicada.
 */
function modificarCantidadProducto(idGondola, plu, nuevaCantidad) {
  openDB((db) => {
    let transaction = db.transaction(storeName, "readwrite");
    let store = transaction.objectStore(storeName);

    let request = store.get(idGondola);
    request.onsuccess = function () {
      let gondola = request.result;
      if (gondola) {
        let producto = gondola.productos.find((p) => p.plu === plu);
        if (producto) {
          producto.cantidad = nuevaCantidad;
          store.put(gondola);
        }
      }
    };

    transaction.oncomplete = function () {
      console.log(`Cantidad modificada para producto ${plu} en góndola ${idGondola}`);
      listarProductos(idGondola);
    };

    transaction.onerror = function (event) {
      console.error("Error al modificar producto", event.target.error);
    };
  });
}

/**
 * Elimina un producto (por PLU) dentro de una góndola.
 */
function borrarProducto(idGondola, plu) {
  if (!confirm(`¿Seguro que quieres borrar el producto PLU: ${plu}?`)) return;

  openDB((db) => {
    let transaction = db.transaction(storeName, "readwrite");
    let store = transaction.objectStore(storeName);

    let request = store.get(idGondola);
    request.onsuccess = function () {
      let gondola = request.result;
      if (gondola) {
        gondola.productos = gondola.productos.filter((p) => p.plu !== plu);
        store.put(gondola);
      }
    };

    transaction.oncomplete = function () {
      console.log(`Producto con PLU ${plu} borrado de la góndola ${idGondola}`);
      listarProductos(idGondola);
    };

    transaction.onerror = function (event) {
      console.error("Error al borrar producto", event.target.error);
    };
  });
}

/********************************************
 * BÚSQUEDA AL SERVIDOR POR PLU
 ********************************************/

/**
 * 1) Toma el PLU y la cantidad del formulario.
 * 2) Hace fetch al endpoint del servidor para obtener la descripción.
 * 3) Llena el campo "nombreProducto" y registra el producto en IndexedDB.
 */
async function buscarYAgregarProducto() {
  const idGondola = Number(document.getElementById("selectGondolaProducto").value);
  const pluInput = document.getElementById("pluProducto").value.trim();
  const quantity = parseInt(document.getElementById("cantidadProducto").value, 10);

  // Validaciones básicas
  if (!idGondola) {
    alert("Por favor seleccione una góndola.");
    return;
  }
  if (!pluInput) {
    alert("Ingrese un PLU válido.");
    return;
  }
  if (isNaN(quantity) || quantity <= 0) {
    alert("Ingrese una cantidad numérica mayor a 0.");
    return;
  }

  // Ajustar PLU a 6 dígitos (opcional, según tu API)
  const plu = pluInput.padStart(6, '0');

  // Endpoint del API
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

    // Aquí obtenemos la descripción del producto
    // (Segun tu API, viene en el campo "description")
    const productName = data.description || "Sin descripción";

    // Mostramos el nombre en el campo 'nombreProducto' (solo para visualizar)
    document.getElementById("nombreProducto").value = productName;

    // Ahora guardamos en IndexedDB
    // Podríamos llamar a 'agregarProducto()' o meter la lógica aquí directamente:
    openDB((db) => {
      let transaction = db.transaction(storeName, "readwrite");
      let store = transaction.objectStore(storeName);

      // 1) Obtenemos la góndola
      let request = store.get(idGondola);
      request.onsuccess = function () {
        let gondola = request.result;
        if (gondola) {
          // 2) Agregamos el producto a su array
          gondola.productos.push({
            plu: plu,         // PLU normalizado
            nombre: productName,
            cantidad: quantity
          });
          // 3) Guardamos la góndola de nuevo
          store.put(gondola);
        }
      };

      transaction.oncomplete = function () {
        console.log(`Producto ${plu} (${productName}) agregado a góndola ${idGondola}`);
        // Limpiamos el PLU y la cantidad para un nuevo uso
        // Nota: 'nombreProducto' lo dejo para que veas el último que agregaste
        document.getElementById("pluProducto").value = "";
        document.getElementById("cantidadProducto").value = "";

        // Refrescamos el listado de productos en esa góndola
        listarProductos(idGondola);
      };

      transaction.onerror = function (event) {
        console.error("Error al agregar producto", event.target.error);
      };
    });

  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    alert("Hubo un error al buscar el producto en el servidor.");
  }
}

/********************************************
 * Inicializar al cargar
 ********************************************/
document.addEventListener("DOMContentLoaded", listarGondolas);