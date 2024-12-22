const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Abrimos la página web
        await page.goto('https://smart-repositor.netlify.app/');
        console.log('Página cargada correctamente.');

        // Completamos los campos para realizar la consulta
        await page.fill('#pluInput', '590296');
        await page.fill('#cantidad', '1');

        // Clickeamos en agregar el producto
        await page.click('#agregarProducto');
        console.log('Formulario enviado, esperando respuesta...');

        // Verificamos que el contenedor #lista tenga hijos
        await page.waitForFunction(() => {
            const lista = document.querySelector('#lista');
            return lista && lista.children.length > 0;
        }, { timeout: 60000 });
        console.log('Contenido de #lista cargado.');

        // Imprimimos el contenido actual de #lista
        const listaContent = await page.evaluate(() => {
            const lista = document.querySelector('#lista');
            return lista ? lista.outerHTML : 'No encontrado';
        });
        console.log('Estado de #lista:', listaContent);

        // Verificamos el contenido de #lista .product-info
        const productInfo = await page.textContent('#lista .product-info');
        if (productInfo.includes('590296')) {
            console.log('✅ Prueba exitosa: Se agregó correctamente el producto.');
            process.exit(0); // Salida exitosa
        } else {
            console.log('❌ ERROR: Prueba fallida: No se agregó el producto.');
            process.exit(1); // Salida con error
        }
    } catch (error) {
        console.error('❌ ERROR AL EJECUTAR LA PRUEBA:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
