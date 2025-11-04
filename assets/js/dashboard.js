// public/assets/js/dashboard.js

import * as api from './api.js';
import * as setup from './setupMiCuentaDropdown.js';
import { openImportModal, initializeImportModal, setStockifyColumns } from './import.js';

let allData = [];
let currentTableColumns = [];

// -- Manejo de Stock --
async function handleStockUpdate(event) {
    const button = event.target.closest('.stock-btn');
    const input = event.target.closest('.stock-input');
    const cell = event.target.closest('.stock-cell');

    if (!cell || (!button && !input)) return;

    const itemId = cell.dataset.itemId;
    const stockInput = cell.querySelector('.stock-input');
    if (!itemId || !stockInput) {
        console.error("No se encontró itemId o stockInput para la celda.");
        return;
    }

    let action = null;
    let value = null;

    const originalRow = allData.find(row => (row.id ?? row.Id ?? row.ID) == itemId); // Busco ID case-insensitive
    const stockKey = originalRow ? Object.keys(originalRow).find(key => key.toLowerCase() === 'stock') : null;
    const originalValue = (originalRow && stockKey) ? originalRow[stockKey] : 0;

    if (button) {
        action = button.classList.contains('plus') ? 'add' : 'remove';
        value = 1;
    } else if (input && event.type === 'change') {
        action = 'set';
        value = parseInt(input.value, 10);
        if (isNaN(value) || value < 0) {
            alert("Ingresá un número de stock válido (mayor o igual a 0).");
            if(stockInput) stockInput.value = originalValue ?? 0;
            return;
        }
    } else {
        return;
    }

    cell.querySelectorAll('button, input').forEach(el => el.disabled = true);

    try {
        console.log(`Intentando updateStock: itemId=${itemId}, action=${action}, value=${value}`);
        const result = await api.updateStock(itemId, action, value); // LLAMO A LA API

        if (result.success) {
            stockInput.value = result.newStock;

            const rowIndex = allData.findIndex(row => (row.id ?? row.Id ?? row.ID) == itemId);
            if (rowIndex > -1 && stockKey) {
                allData[rowIndex][stockKey] = result.newStock;
                console.log("Dato local (allData) actualizado.");
            }
            console.log("Stock actualizado a:", result.newStock);
        } else {

            throw new Error(result.message || "Error desconocido del backend al actualizar stock.");
        }
    } catch (error) {
        console.error("Error al actualizar stock:", error);
        alert(`Error: ${error.message}`);

        if(stockInput) stockInput.value = originalValue ?? 0;
    } finally {
        cell.querySelectorAll('button, input').forEach(el => el.disabled = false);
    }
}
// -- Estadisticas --

async function setupInventoryPicker() {
    const user = await api.getUserProfile();
    if (user){
        const inventories = user['databases'];

        const inventoriesDropdown = document.getElementById('inventories-dropdown');

        inventories.forEach(inventory => {
            const inventoryBtn = document.createElement('div');

            inventoryBtn.className = 'inventory-btn';
            inventoryBtn.dataset.value = inventory.id;
            inventoryBtn.innerHTML = `<h4>${inventory.name}</h4>`;

                inventoriesDropdown.appendChild(inventoryBtn);
        })

        const inventoryPicker = document.getElementById('inventory-picker');


        const allBtns = inventoriesDropdown.querySelectorAll('.inventory-btn');
        allBtns.forEach(btn =>{
            btn.addEventListener('click', () => {
                console.log("Inventory selected:", btn.dataset.value);
                inventoryPicker.innerHTML = `<h4>${btn.innerHTML}</h4>`;
            })
        })


        inventoryPicker.addEventListener('click', () => {
            if(!inventoryPicker.classList.contains('clicked')){
                inventoriesDropdown.classList.remove('hidden');
                inventoryPicker.classList.add('clicked');
            }
            else{
                inventoriesDropdown.classList.add('hidden');
                inventoryPicker.classList.remove('clicked');
            }
        });

        window.addEventListener('click', (event) => {
            if (inventoryPicker.classList.contains('clicked') && !inventoryPicker.contains(event.target) &&
                !inventoriesDropdown.contains(event.target)) {
                inventoriesDropdown.classList.add('hidden');
                inventoryPicker.classList.remove('clicked');
            }
        });

        inventoriesDropdown.addEventListener('click', () => {
            if(!inventoryPicker.classList.contains('clicked')){
                inventoriesDropdown.classList.remove('hidden');
                inventoryPicker.classList.add('clicked');
            }
            else{
                inventoriesDropdown.classList.add('hidden');
                inventoryPicker.classList.remove('clicked');
            }
        });

    }
}


// -- Renderizado de Tabla --
function renderTable(columns, data) {
    const tableHead = document.querySelector('#data-table thead');
    const tableBody = document.querySelector('#data-table tbody');
    if (!tableHead || !tableBody) {
        console.error("Error crítico: No se encontraron los elementos thead o tbody.");
        return;
    }

    tableBody.removeEventListener('click', handleStockUpdate);
    tableBody.removeEventListener('change', handleStockUpdate);
    tableBody.addEventListener('click', handleStockUpdate);
    tableBody.addEventListener('change', handleStockUpdate);
    console.log("Listeners de stock (click y change) añadidos/actualizados en tbody.");

    if (!data || data.length === 0) {
        // Estado vacío
        tableHead.innerHTML = ''; // Limpio cabecera
        tableBody.innerHTML = `
            <tr>
                <td colspan="${columns.length || 1}" class="empty-table-message">
                    Aún no hay datos ingresados.
                    <button id="import-data-empty-btn" class="btn btn-primary btn-inline">¿Deseas importarlos?</button>
                </td>
            </tr>`;
        // Busco y conecto el botón DESPUÉS de insertarlo
        const importBtn = document.getElementById('import-data-empty-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                setStockifyColumns(currentTableColumns); // Le paso las columnas actuales
                openImportModal();
            });
            console.log("Listener añadido al botón 'import-data-empty-btn'.");
        } else {
            console.error("No se encontró el botón #import-data-empty-btn después de renderizar tabla vacía.");
        }
    } else {
        // Estado con datos
        // Renderizo cabeceras (con primera letra mayúscula)
        tableHead.innerHTML = `<tr>${columns.map(col => `<th>${col.charAt(0).toUpperCase() + col.slice(1)}</th>`).join('')}</tr>`;
        // Renderizo filas
        tableBody.innerHTML = data.map(row => {
            const rowId = row['id'] ?? row['Id'] ?? row['ID']; // Busco ID case-insensitive
            if (rowId === undefined) console.warn("Fila sin ID encontrada:", row); // Aviso si falta ID

            return `<tr>
                ${columns.map(col => {
                let value = row[col];
                // Fallback ID minúscula (por si acaso)
                if (value === undefined && col.toLowerCase() === 'id') { value = row['id']; }

                // Genero controles de stock si la columna es 'stock' (case-insensitive)
                if (col.toLowerCase() === 'stock') {
                    return `<td class="stock-cell" data-item-id="${rowId}"><button class="stock-btn minus">-</button><input type="number" class="stock-input" value="${value ?? 0}" min="0"><button class="stock-btn plus">+</button></td>`;
                } else {
                    // Para otras columnas, muestro el valor
                    return `<td>${value ?? ''}</td>`;
                }
            }).join('')}
            </tr>`;
        }).join('');
    }
}

// -- Filtrado --
function filterTable() {
    const searchInput = document.getElementById('search-input');
    // Verifico si el input existe antes de usarlo
    if (!searchInput) return;
    const searchTerm = searchInput.value.toLowerCase();

    const filteredData = allData.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm)
        )
    );
    // Vuelvo a renderizar con los datos filtrados, usando las columnas originales
    renderTable(currentTableColumns, filteredData);
}

// -- Navegación --
function showDashboardView(viewId) {
    document.querySelectorAll('.dashboard-view').forEach(view => view.classList.add('hidden'));
    const viewToShow = document.getElementById(viewId);
    if (viewToShow) { viewToShow.classList.remove('hidden'); }
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.targetView === viewId);
    });
}

function setupMenuNavigation() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetView = button.dataset.targetView;
            if (targetView) { showDashboardView(targetView); }
            else { alert("Funcionalidad aún no implementada."); }
        });
    });
    console.log("Navegación del menú lateral configurada.");
}

function setupOrderBy(){

    //SECCION DE "SALES"

    //DECLARACION DE VARIABLES IMPORTANTES
    const orderBySalesBtn = document.getElementById('sale-order-by-btn');
    const orderBySalesContainer = document.getElementById('sale-order-by-container');
    const orderBySalesDropdown = document.getElementById('sale-order-by-dropdown');
    const salesDirectionBtn = document.getElementById('sales-direction-btn');
    let viewOrderSales = 'sales-table-date';
    let viewDirectionSales = 'descending';
    const orderButtonsSales = document.querySelectorAll('#sale-order-by-dropdown .order-btn');

    //COMPORTAMIENTOS DEL DROPDOWN

    orderBySalesBtn.addEventListener('click', (e) =>{
        e.stopPropagation();
        if(orderBySalesContainer.classList.contains('clicked')) {
            orderBySalesContainer.classList.remove('clicked');
            orderBySalesDropdown.classList.add('hidden');
        }
        else{
            orderBySalesContainer.classList.add('clicked');
            orderBySalesDropdown.classList.remove('hidden');
        }
        orderBySalesDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        })
        window.addEventListener('click', () => {
            if (orderBySalesContainer.classList.contains('clicked')) {
                orderBySalesContainer.classList.remove('clicked');
                orderBySalesDropdown.classList.add('hidden');
            }
        })
    })

    //SELECCION DE ORDEN

    orderButtonsSales.forEach(button =>{
        button.addEventListener('click', () =>{
            viewOrderSales = button.dataset.order;
            showSalesView(viewOrderSales,viewDirectionSales);
        })
    })

    //SELECCION DE DIRECCION

    salesDirectionBtn.addEventListener('click', () =>{
        if (salesDirectionBtn.dataset.direction === 'descending') {
            salesDirectionBtn.innerHTML = `<i class="ph ph-arrow-up" style="margin-right: 5px"></i>
                                        <i class="ph ph-arrow-down hidden" style="margin-right: 5px"></i>`;
            viewDirectionSales = 'ascending';
            salesDirectionBtn.dataset.direction = 'ascending';
        }
        else {
            salesDirectionBtn.innerHTML = `<i class="ph ph-arrow-up hidden" style="margin-right: 5px"></i>
                                        <i class="ph ph-arrow-down" style="margin-right: 5px"></i>`;
            viewDirectionSales = 'descending';
            salesDirectionBtn.dataset.direction = 'descending';
        }
        showSalesView(viewOrderSales,viewDirectionSales);
    })


    //SECCION DE "COMPRAS"

    const orderByReceiptsBtn = document.getElementById('receipts-order-by-btn');
    const orderByReceiptsContainer = document.getElementById('receipts-order-by-container');
    const orderByReceiptsDropdown = document.getElementById('receipts-order-by-dropdown');
    const receiptsDirectionBtn = document.getElementById('receipts-direction-btn');
    let viewOrderReceipts = 'receipts-table-date';
    let viewDirectionReceipts = 'descending';
    const orderButtonsReceipts = document.querySelectorAll('#receipts-order-by-dropdown .order-btn');

    //COMPORTAMIENTOS DEL DROPDOWN

    orderByReceiptsBtn.addEventListener('click', (e) =>{
        e.stopPropagation();
        if(orderByReceiptsContainer.classList.contains('clicked')) {
            orderByReceiptsContainer.classList.remove('clicked');
            orderByReceiptsDropdown.classList.add('hidden');
        }
        else{
            orderByReceiptsContainer.classList.add('clicked');
            orderByReceiptsDropdown.classList.remove('hidden');
        }
        orderByReceiptsDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        })
        window.addEventListener('click', () => {
            if (orderByReceiptsContainer.classList.contains('clicked')) {
                orderByReceiptsContainer.classList.remove('clicked');
                orderByReceiptsDropdown.classList.add('hidden');
            }
        })
    })

    //SELECCION DE ORDEN

    orderButtonsReceipts.forEach(button =>{
        button.addEventListener('click', () =>{
            viewOrderReceipts = button.dataset.order;
            showReceiptsView(viewOrderReceipts,viewDirectionReceipts);
        })
    })

    //SELECCION DE DIRECCION

    receiptsDirectionBtn.addEventListener('click', () =>{
        if (receiptsDirectionBtn.dataset.direction === 'descending') {
            receiptsDirectionBtn.innerHTML = `<i class="ph ph-arrow-up" style="margin-right: 5px"></i>
                                        <i class="ph ph-arrow-down hidden" style="margin-right: 5px"></i>`;
            viewDirectionReceipts = 'ascending';
            receiptsDirectionBtn.dataset.direction = 'ascending';
        }
        else {
            receiptsDirectionBtn.innerHTML = `<i class="ph ph-arrow-up hidden" style="margin-right: 5px"></i>
                                        <i class="ph ph-arrow-down" style="margin-right: 5px"></i>`;
            viewDirectionReceipts = 'descending';
            receiptsDirectionBtn.dataset.direction = 'descending';
        }
        showReceiptsView(viewOrderReceipts,viewDirectionReceipts);
    })

}

//CAMBIO DE VIEW SEGUN VISTA SELECCIONADA
function showReceiptsView(viewOrder, viewDirection) {
    document.querySelectorAll('.receipts-view').forEach(view => view.classList.add('hidden'));
    const viewToShow =  document.getElementById(viewOrder + '-' + viewDirection);
    if (viewToShow) { viewToShow.classList.remove('hidden'); }
}

function showSalesView(viewOrder, viewDirection) {
    document.querySelectorAll('.sales-view').forEach(view => view.classList.add('hidden'));
    const viewToShow =  document.getElementById(viewOrder + '-' + viewDirection);
    if (viewToShow) { viewToShow.classList.remove('hidden'); }
}

function setupGreyBg(){
    const greyBg = document.getElementById('grey-background');
    greyBg.addEventListener('click', (event) =>{
        if (event.target === greyBg) {
            greyBg.classList.add('hidden');
        }
    })
}

function setupReturnBtn(){
    const returnBtn = document.getElementById('return-btn');
    const greyBg = document.getElementById('grey-background');

    returnBtn.addEventListener('click', () => {
        greyBg.classList.add('hidden');
    })
}

function setupTransactions(){
    const newTransacionButtons = document.querySelectorAll('.new-transaction-btn');
    const greyBg = document.getElementById('grey-background');

    setupReturnBtn();
    setupGreyBg();

    newTransacionButtons.forEach(button =>{
        button.addEventListener('click', () =>{
            greyBg.classList.remove('hidden');
            populateTransactionContainer(button.dataset.transaction);
        })
    })
}

function configAddProductBtn(){
    const addProductBtnList = document.querySelectorAll('.add-product-btn');
    const productPicker = document.getElementById('product-picker');

    addProductBtnList.forEach(btn =>{
        btn.addEventListener('click', (event) =>{
            event.stopPropagation();

            productPicker.classList.toggle('hidden');
        })
    })

    window.addEventListener('click', (event) => {
        // Si el picker está visible Y el clic fue FUERA del picker
        if (!productPicker.classList.contains('hidden') &&
            !productPicker.contains(event.target)) {
            productPicker.classList.add('hidden');
        }
    });
}

function createNewSaleRow (selectedProduct) {
    const newSaleRow = document.createElement('div');

    newSaleRow.className = 'flex-row';

    newSaleRow.innerHTML = `<div class="flex-column">
        <h3>Nombre</h3>
        <h4>${selectedProduct.name}</h4>
    </div>
    <div class="flex-column">
        <h3>Cantidad</h3>
        <h4>Cantidad</h4>
    </div>
    <div class="flex-column">
        <h3>Precio</h3>
        <h4>Precio</h4>
    </div>
    <div class="flex-column">
        <h3>Precio Total</h3>
        <h4>Precio Total</h4>
    </div>
    <button type="button" class="btn delete-product-btn" data-pID=${selectedProduct.pID} data-tID=${selectedProduct.tID}>
        Eliminar
    </button>`

    return newSaleRow;
}

function renderSalesProductList(saleItemList){
    const saleProductContainer = document.getElementById('sale-product-container');
    saleProductContainer.innerHTML = '';

    if (saleItemList.length === 0) {
        saleProductContainer.innerHTML = `<h3>No hay productos en la lista</h3>`;
        return;
    }

    saleItemList.forEach(item =>{
        const newSaleProductRow = createNewSaleRow(item);
        saleProductContainer.appendChild(newSaleProductRow);
    })
}

function addProduct(selectedProduct,saleItemList,receiptItemList) {
    const productPicker = document.getElementById('product-picker');
    productPicker.classList.add('hidden');

    saleItemList.push(selectedProduct);
    receiptItemList.push(selectedProduct);

    renderSalesProductList(saleItemList);
    //renderReceiptProductList(receiptItemList);
}

async function populateProductPicker(saleItemsList,receiptItemsList){
    const user = await api.getUserProfile();
    if (user){
        const tables = user['databases'];

        const productPicker = document.getElementById('product-picker');
        const inventoryPicker = document.createElement('div');

        productPicker.innerHTML = '';

        inventoryPicker.className = 'flex-column';
        const tableItem = document.createElement('div');
        tableItem.dataset.tID = 'all';
        tableItem.innerHTML = 'Todas';
        tableItem.className = 'product-table-picker';

        inventoryPicker.appendChild(tableItem);

        tables.forEach(table => {
            const tableItem = document.createElement('div');
            tableItem.dataset.tID = table.id;
            tableItem.innerHTML = table.name;
            tableItem.className = 'product-table-picker';

            inventoryPicker.appendChild(tableItem);
        })

        productPicker.appendChild(inventoryPicker);

        configureTablePickers();

        //LA VARIABLE PRODUCTOS DEBE HACER UN FETCH A LA API PARA OBTENER TODOS LOS PRODUCTOS DEL USUARIO

        const products = [{name :'Producto 1', pID : 1, tID : 2},{name :'Producto 2', pID : 2, tID : 11},
            {name :'Producto 3', pID : 3, tID : 9}];

        const allProductsDiv = document.createElement('div');
        allProductsDiv.className = 'hidden flex-column product-list';
        allProductsDiv.id = 'all';

        products.forEach(product => {
            const item = document.createElement('div');
            item.dataset.tID = product.tID;
            item.dataset.pID = product.pID;
            item.innerHTML = product.name;
            item.className = 'product-item';
            allProductsDiv.appendChild(item);
        })

        const productListWrapper = document.createElement('div');
        productListWrapper.className = 'hidden';
        productListWrapper.id = 'product-list-wrapper';

        productListWrapper.appendChild(allProductsDiv);

        tables.forEach(table => {
            const tableProductsDiv = document.createElement('div');
            tableProductsDiv.className = 'hidden flex-column product-list';
            tableProductsDiv.id = table.id;

            products.forEach(product => {
                if (product.tID !== table.id) return;
                const item = document.createElement('div');
                item.dataset.tID = product.tID;
                item.dataset.pID = product.pID;
                item.innerHTML = product.name;
                item.className = 'product-item';
                tableProductsDiv.appendChild(item);
            })
            productListWrapper.appendChild(tableProductsDiv);
        })
        productPicker.appendChild(productListWrapper);

        configureProductSelection(products,saleItemsList,receiptItemsList);
    }
}

function configureProductSelection(products,saleItemsList,receiptItemsList){
    const productItem = document.querySelectorAll('.product-item');
    productItem.forEach(item => {
        item.addEventListener('click', () => {
            const selectedProduct = products.find(product => product.pID === parseInt(item.dataset.pID,10) &&
                product.tID === parseInt(item.dataset.tID,10));

            addProduct(selectedProduct,saleItemsList,receiptItemsList);
        })
    })
}

function configureTablePickers(){
    const tablePickers = document.querySelectorAll('.product-table-picker');
    tablePickers.forEach(table => {
        table.addEventListener('click', () => {
            const tableID = table.dataset.tID;
            showProductList(tableID);
        })
    })
}

function showProductList(tableID){
    document.querySelectorAll('.product-list').forEach(wrapper => wrapper.classList.add('hidden'));
    const productListWrapper = document.getElementById('product-list-wrapper');
    const productListToShow = document.getElementById(tableID);

    productListWrapper.classList.remove('hidden');
    productListToShow.classList.remove('hidden');
}

function getSaleForm() {
    return `<form class="flex-column" method="get" action="/StockiFy/dashboard.php">
                                <div class="flex-row all-center">
                                    <h2>Productos</h2>
                                    <div class="product-picker-container">
                                    <btn class="btn add-product-btn">Agregar Producto</btn>
                                    <div id="product-picker"></div>    
                                    </div>
                                </div>
                                <div>
                                
                                </div>           
                                <div class="flex-column" id="sale-product-container"></div>
                                <input name="product-list" id="sale-product-list" hidden>
                                <input name="client-id" id="client-id-input">
                                <input name="price" id="price-input" value="0" readonly>
                                <btn type="submit" class="btn btn-primary">Agregar Venta</btn>
                                </form>`;
}

function configRemoveProduct(saleItemList, receiptItemList){
    const saleProductContainer = document.getElementById('sale-product-container');

    if (saleProductContainer){
        saleProductContainer.addEventListener('click', (event) =>{
            const deleteButton = event.target.closest('.delete-product-btn');
            if (!deleteButton) return;

            const itemID = parseInt(deleteButton.dataset.pid,10);
            const tableID = parseInt(deleteButton.dataset.tid,10);

            const saleItemIndex = saleItemList.findIndex(item => item.pID === itemID && item.tID === tableID);
            //const receiptItemIndex = receiptItemList.findIndex(item => item.pID === itemID && item.tID === tableID);

            if (saleItemIndex > -1) {
                saleItemList.splice(saleItemIndex, 1);
                renderSalesProductList(saleItemList);
            }
            /*
            if (receiptItemIndex > -1) {
                receiptItemList.splice(receiptItemIndex, 1);
                renderReceiptsProductList(saleItemList);
            }*/
        })
    }
}

function populateTransactionContainer(transactionType){
    const transactionFormContainer = document.getElementById('transaction-form-container');
    let transactionFromHTML, saleItemList = [], receiptItemList = [];
    switch (transactionType) {
        case 'sale':
            transactionFromHTML = getSaleForm();
            break;
        case 'receipt':
            transactionFromHTML = ``;
            break;
        case 'client':
            transactionFromHTML = ``;
            break;
        case 'provider':
            transactionFromHTML = ``;
            break;
    }


    transactionFormContainer.innerHTML = transactionFromHTML;
    populateProductPicker(saleItemList,receiptItemList);
    configRemoveProduct(saleItemList,receiptItemList);

    switch (transactionType) {
        case 'sale':
            configAddProductBtn(saleItemList);

            break;
        case 'receipt':
            transactionFromHTML = ``;
            break;
        case 'client':
            transactionFromHTML = ``;
            break;
        case 'provider':
            transactionFromHTML = ``;
            break;
    }

    renderSalesProductList(saleItemList);

}

// ---- 4. INICIALIZACIÓN ----
async function init() {
    console.log("[INIT] Iniciando dashboard...");
    const nav = document.getElementById('header-nav');
    if (nav) nav.innerHTML = `
                                <a href="/StockiFy/estadisticas.php" class="btn btn-secondary">Estadisticas</a>
                                   <div id="dropdown-container">
                <div class="btn btn-secondary" id="mi-cuenta-btn">Mi Cuenta</div>
                <div class="flex-column hidden" id="mi-cuenta-dropdown">
                    <a href="/StockiFy/configuracion.php" class="btn btn-secondary">Configuración</a>
                    <a href="/StockiFy/configuracion.php" class="btn btn-secondary">Modificaciones de Stock</a>
                    <a href="/StockiFy/configuracion.php" class="btn btn-secondary">Soporte</a>
                    <a href="/StockiFy/logout.php" class="btn btn-secondary">Cerrar Sesión</a>
                </div>
            </div>   
                           `;

    setup.setupMiCuenta();
    setupOrderBy();
    setupInventoryPicker();
    setupTransactions();

    const tableTitleElement = document.getElementById('table-title');

    initializeImportModal(); // Inicializo modal al principio
    console.log("[INIT] Modal inicializado.");

    // --- Selecciono Elementos del Modal de Eliminación ---
    deleteModal = document.getElementById('delete-confirm-modal');
    deleteConfirmInput = document.getElementById('delete-confirm-input');
    confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    deleteDbNameConfirmSpan = document.getElementById('delete-db-name-confirm');
    deleteErrorMsg = document.getElementById('delete-error-message');
    const closeDeleteBtn = document.getElementById('close-delete-modal-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const deleteDbBtn = document.getElementById('delete-db-btn'); // El botón que abre el modal

    // --- Conecto Eventos del Modal de Eliminación ---
    deleteDbBtn?.addEventListener('click', openDeleteModal);
    closeDeleteBtn?.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn?.addEventListener('click', closeDeleteModal);
    deleteConfirmInput?.addEventListener('input', handleDeleteConfirmInput); // Valida al escribir
    confirmDeleteBtn?.addEventListener('click', handleConfirmDelete);
    if(deleteModal) { // Cierro si se hace clic en el overlay
        deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) closeDeleteModal(); });
    }

    try {
        console.log("[INIT] Llamando a api.getTableData...");
        const result = await api.getTableData();
        console.log("[INIT] Respuesta de getTableData:", result);

        if (result && result.success === true) { // Verifico explícitamente success
            allData = result.data || []; // Aseguro que sea array
            currentTableColumns = result.columns || []; // Aseguro que sea array

            if (tableTitleElement) {
                tableTitleElement.textContent = result.inventoryName || 'Inventario';
            }

            console.log("[INIT] Llamando a renderTable...");
            renderTable(currentTableColumns, allData);
            console.log("[INIT] renderTable completado.");

            // Añado listener SOLO si el input existe
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', filterTable);
                console.log("[INIT] Listener de búsqueda añadido.");
            } else {
                console.warn("[INIT] Input de búsqueda no encontrado.");
            }
            setupMenuNavigation(); // Configuro menú lateral
            showDashboardView('view-db'); // Muestro la vista de tabla por defecto
            document.getElementById('add-row-btn')?.addEventListener('click', handleAddRowClick);
        } else {
            console.error("[INIT] getTableData devolvió success: false o respuesta inválida.");
            throw new Error(result?.message || 'Error al obtener datos de tabla.');
        }
    } catch (error) {
        console.error("[INIT] Error CATCH:", error);
        alert(`Error al cargar el panel: ${error.message}. Serás redirigido.`);
        if (error.message.includes('No autorizado')) {
            window.location.href = '/login.php';
        } else {
            window.location.href = '/select-db.php';
        }
    }
}

function createEditableRow(columns) {
    const tr = document.createElement('tr');
    tr.classList.add('editing-row'); // Clase para estilos específicos

    columns.forEach(col => {
        const td = document.createElement('td');
        if (col.toLowerCase() === 'id' || col.toLowerCase() === 'created_at') {
            td.textContent = ''; // Celda vacía para columnas automáticas
        } else if (col.toLowerCase() === 'stock') {
            td.classList.add('stock-cell'); // Aplico estilo flex
            td.innerHTML = `
                 <button class="stock-btn minus" disabled>-</button>
                 <input type="number" class="stock-input" value="0" min="0" data-column="${col}"> 
                 <button class="stock-btn plus" disabled>+</button>
             `;
        }

        else {
            // Input de texto genérico para otras columnas
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = col.charAt(0).toUpperCase() + col.slice(1);
            input.dataset.column = col; // Guardo el nombre de la columna acá
            td.appendChild(input);
        }
        tr.appendChild(td);
    });

    const actionTd = document.createElement('td');
    actionTd.classList.add('action-buttons');
    actionTd.innerHTML = `
        <button class="btn btn-primary save-new-row-btn">Guardar</button>
        <button class="btn btn-secondary cancel-new-row-btn">Cancelar</button>
    `;
    tr.appendChild(actionTd);

    return tr;
}

function handleAddRowClick() {
    const tableBody = document.querySelector('#data-table tbody');
    if (!tableBody || tableBody.querySelector('.editing-row')) {
        // Si no hay body o ya hay una fila editándose, no hago nada
        return;
    }
    // Creo la nueva fila editable
    const newRow = createEditableRow(currentTableColumns);
    // La inserto al PRINCIPIO del tbody
    tableBody.prepend(newRow);

    // Conecto los botones Guardar/Cancelar de ESTA fila
    newRow.querySelector('.save-new-row-btn')?.addEventListener('click', handleSaveNewRow);
    newRow.querySelector('.cancel-new-row-btn')?.addEventListener('click', handleCancelNewRow);
}

/**
 * Maneja el clic en el botón "Guardar" de la nueva fila.
 */
async function handleSaveNewRow(event) {
    const saveButton = event.target;
    const newRowElement = saveButton.closest('.editing-row');
    if (!newRowElement) return;

    const newItemData = {};
    let isValid = true;

    // Recopilo los datos de los inputs de la fila
    newRowElement.querySelectorAll('input[data-column]').forEach(input => {
        const colName = input.dataset.column;
        const value = input.value.trim();
        newItemData[colName] = value;
    });

    console.log("Datos a guardar:", newItemData); // Para depurar

    saveButton.disabled = true;
    saveButton.textContent = 'Guardando...';
    try {

        const result = await api.addItemToTable(newItemData); // Llamo a la API
        if (result.success && result.newItem) {
            allData.unshift(result.newItem); // Añado el nuevo item al principio de mis datos locales
            renderTable(currentTableColumns, allData); // Vuelvo a renderizar toda la tabla
        } else {
            throw new Error(result.message || "Error al guardar la fila.");
        }
    } catch (error) {
        alert(`Error al guardar: ${error.message}`);
        saveButton.disabled = false;
        saveButton.textContent = 'Guardar';
    }
}

function handleCancelNewRow(event) {
    const cancelButton = event.target;
    const newRowElement = cancelButton.closest('.editing-row');
    if (newRowElement) {
        newRowElement.remove(); // Simplemente elimino la fila
    }
}

let deleteModal, deleteConfirmInput, confirmDeleteBtn, deleteDbNameConfirmSpan, deleteErrorMsg;
let currentDbNameToDelete = '';

function openDeleteModal() {
    currentDbNameToDelete = document.getElementById('table-title')?.textContent || ''; // Tomo el nombre actual
    if (!currentDbNameToDelete || !deleteModal) return;

    deleteDbNameConfirmSpan.textContent = currentDbNameToDelete; // Muestro el nombre en el modal
    deleteConfirmInput.value = ''; // Limpio el input
    confirmDeleteBtn.disabled = true; // Deshabilito el botón final
    deleteErrorMsg.textContent = ''; // Limpio errores
    deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    if (deleteModal) deleteModal.classList.add('hidden');
}

function handleDeleteConfirmInput() {
    // Habilito el botón solo si el texto coincide exactamente
    if (deleteConfirmInput.value === currentDbNameToDelete) {
        confirmDeleteBtn.disabled = false;
        deleteErrorMsg.textContent = '';
    } else {
        confirmDeleteBtn.disabled = true;
        // Muestro un error sutil si empiezan a escribir mal
        if (deleteConfirmInput.value.length > 0) {
            deleteErrorMsg.textContent = 'El nombre no coincide.';
        } else {
            deleteErrorMsg.textContent = '';
        }
    }
}

async function handleConfirmDelete() {
    if (deleteConfirmInput.value !== currentDbNameToDelete) return; // Doble chequeo

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = 'Eliminando...';

    try {
        const result = await api.deleteDatabase(); // Llamo a la API
        if (result.success) {
            alert(result.message);
            window.location.href = '/select-db.php'; // Redirijo a la selección
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        deleteErrorMsg.textContent = `Error: ${error.message}`;
        confirmDeleteBtn.disabled = false; // Rehabilito si falla
        confirmDeleteBtn.textContent = 'Eliminar Permanentemente';
    }
}

document.addEventListener('DOMContentLoaded', init);