// public/assets/js/dashboard.js

import * as api from './api.js';
import * as setup from './setupMiCuentaDropdown.js';
import { openImportModal, initializeImportModal, setStockifyColumns } from './import.js';
import {getCustomerById, getProductData} from "./api.js";

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


// -- Renderizado de Tabla --
async function renderTable(columns, data) {
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

    const inventoryPreferences = await api.getCurrentInventoryPreferences();

    if (!inventoryPreferences.success) {
        console.error("Error crítico: No se encontraron las preferencias del inventario.");
        return;
    }

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


        /* ---------------------- CODIGO DE NANO  ---------------------- */


        //Genere switch-cases para las columnas recomendadas de la tabla actual.
        tableHead.innerHTML = `<tr>${columns.map(col => {
            switch (col.toLowerCase()) {
                case 'id':
                    return '';
                case 'created_at':
                    return '';
                case 'name':
                    return `<th>Nombre</th>`;
                case 'min_stock':
                    if (inventoryPreferences.min_stock === 1) {
                        return `<th>Stock Mínimo</th>`;
                    }
                    return '';
                case 'sale_price':
                    if (inventoryPreferences.sale_price === 1) {
                        return `<th>Precio de Venta</th>`;
                    }
                    return '';
                case 'receipt_price':
                    if (inventoryPreferences.receipt_price === 1) {
                        let autoType;
                        switch (inventoryPreferences.auto_price_type) {
                            case 'iva':
                                autoType = 'IVA';
                                break;
                            case 'gain':
                                autoType = 'Margen de Ganancia';
                                break;
                            default:
                                autoType = 'IVA + Margen de Ganancia';
                                break
                        }
                        return `<th>Precio de Compra ${(inventoryPreferences.auto_price === 1) ? '<br>(Calculado con ' + autoType  + ')' : ''}</th>`;
                    }
                    return '';
                case 'hard_gain':
                    if (inventoryPreferences.hard_gain === 1) {
                        return `<th>Margen de Ganancia (Valor Fijo)</th>`;
                    }
                    return '';
                case 'percentage_gain':
                    if (inventoryPreferences.percentage_gain === 1) {
                        return `<th>Margen de Ganancia (Porcentaje)</th>`;
                    }
                    return '';
                default:
                    return `<th>${col.charAt(0).toUpperCase() + col.slice(1)}</th>`;
            }
        }).join('')}</tr>`;
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
                
                switch (col.toLowerCase()) {
                    case 'id':
                        return '';
                    case 'created_at':
                        return '';
                    case 'stock':
                        return `<td class="stock-cell" data-item-id="${rowId}"><button class="stock-btn minus">-</button><input type="number" class="stock-input" value="${value ?? 0}" min="0"><button class="stock-btn plus">+</button></td>`;
                    case 'min_stock':
                        if (inventoryPreferences.min_stock === 1) {
                            return `<td>${value ?? ''}</td>`;
                        }
                        return '';
                    case 'sale_price':
                        if (inventoryPreferences.sale_price === 1) {
                            return `<td>${value ?? ''}</td>`;
                        }
                        return '';
                    case 'receipt_price':
                        if (inventoryPreferences.receipt_price === 1) {
                            return `<td>${value ?? ''}</td>`;
                        }
                        return '';
                    case 'hard_gain':
                        if (inventoryPreferences.hard_gain === 1) {
                            return `<td>${value ?? ''}</td>`;
                        }
                        return '';
                    case 'percentage_gain':
                        if (inventoryPreferences.percentage_gain === 1) {
                            return `<td>${value ?? ''}</td>`;
                        }
                        return '';
                    default:
                        return `<td>${value ?? ''}</td>`;
                }
            }).join('')}
            </tr>`;
        }).join('');

        /* ---------------------- FIN CODIGO DE NANO  ---------------------- */
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
    const transactionViews = ['sales','receipts', 'customers','providers'];

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

// ---- 4. INICIALIZACIÓN ----
async function init() {
    console.log("[INIT] Iniciando dashboard...");

    /* ---------------------- CODIGO DE NANO  ---------------------- */

    //PREPARA EL HEADER CORRECTAMENTE

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

    //PREPARA LOS FONDOS GRISES DE LOS MODALES
    setupReturnBtn();
    setupGreyBg();

    //PREPARA EL DROPDOWN DE "MI CUENTA"
    setup.setupMiCuenta();

    /* ---------------------- FIN CODIGO DE NANO  ---------------------- */

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

    /* ---------------------- CODIGO DE NANO  ---------------------- */


    //PREPARO FUNCIONALIDADES EXTRA

    //Lo voy a acomodar mejor despues!!

    setupOrderBy();

    await setupClients();
    await setupProviders();
    await setupSaleList();
    await setupReceiptList();

    setupTransactions();

    createCharts();
    setupStatPickers();

    await setupInventoryPicker();
    await updateDailyStatistics('all');
    await setupRecomendedColumns();

    getReloadVariables();

    /* ---------------------- FIN CODIGO DE NANO  ---------------------- */
}

async function createEditableRow(columns) {
    const tr = document.createElement('tr');
    tr.classList.add('editing-row'); // Clase para estilos específicos

    /* ---------------------- CODIGO DE NANO  ---------------------- */

    //Consigo preferencias y defaults para columnas recomendadas de la tabla actual

    const inventoryPreferences = await api.getCurrentInventoryPreferences();
    if (!inventoryPreferences.success) {
        console.error("Error crítico: No se encontraron las preferencias del inventario.");
        return;
    }

    const inventoryDefaults = await api.getCurrentInventoryDefaults();
    if (!inventoryDefaults.success) {
        console.error("Error crítico: No se encontraron los defaults del inventario.");
        return;
    }

    //Declaro variables para la asignación automatica de precio de Compra

    let receiptPrice = parseFloat(inventoryDefaults.receipt_price);
    let salePrice = parseFloat(inventoryDefaults.sale_price);
    let gainValue = parseFloat(inventoryDefaults.hard_gain);

    let receiptPriceInput = null;
    let salePriceInput = null;
    let gainValueInput = null;

    function getAutoPrice(){
        let autoPrice;
        const type = inventoryPreferences.auto_price_type;

        try{
            switch (type) {
                case 'iva':
                    autoPrice = parseFloat(salePrice) * 1.21;
                    break;
                case 'gain':
                    if (inventoryPreferences.percentage_gain === 1) {
                        autoPrice = parseFloat(salePrice) * (1 + (parseFloat(gainValue) / 100));
                    }
                    else {autoPrice = parseFloat(salePrice) + parseFloat(gainValue);}
                    break;
                default:
                    autoPrice = parseFloat(salePrice) * 1.21;
                    if (inventoryPreferences.percentage_gain === 1) {
                        autoPrice = autoPrice * (1 + (parseFloat(gainValue) / 100));
                    }
                    else {autoPrice += parseFloat(gainValue);}
                    break;
            }
            if (isNaN(autoPrice)){autoPrice = inventoryDefaults.receipt_price;}
            return autoPrice;
        }
        catch(error){
            //Si algo salió mal, devuelvo el valor por defecto.
            console.log('Entrada Invalida. Valor de Compra no actualizado');
            return inventoryDefaults.receipt_price;
        }
    }

    // CREE EL SWITCH para cada columna recomendada, se le asignan sus valores por defecto automaticamente.

    columns.forEach(col => {
        const td = document.createElement('td');
        switch (col.toLowerCase()) {
            case 'id':
            case 'created_at':
                td.textContent = '';
                break;
            case 'stock':
                td.classList.add('stock-cell'); // Aplico estilo flex
                td.innerHTML = `
                 <button class="stock-btn minus" disabled>-</button>
                 <input type="number" class="stock-input" value="0" min="0" data-column="${col}"> 
                 <button class="stock-btn plus" disabled>+</button>`;
                break;
            case 'name':
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.placeholder = 'Nombre';
                nameInput.dataset.column = col; // Guardo el nombre de la columna acá
                td.appendChild(nameInput);
                break;
            case 'min_stock':
                if (inventoryPreferences.min_stock === 1) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Stock Mínimo';
                    input.value = inventoryDefaults.min_stock;
                    input.dataset.column = col; // Guardo el nombre de la columna acá
                    td.appendChild(input);
                }
                else{return}
                break;
            case 'sale_price':
                if (inventoryPreferences.sale_price === 1) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Precio de Venta';
                    input.value = salePrice;
                    input.dataset.column = col; // Guardo el nombre de la columna acá
                    td.appendChild(input);

                    //Guardo el input en variables globales para utilizarlos en el calculo del precio de compra
                    salePriceInput = input;
                }
                else{return}
                break;
            case 'receipt_price':
                if (inventoryPreferences.receipt_price === 1) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Precio de Compra';
                    console.log(receiptPrice);
                    input.value = receiptPrice;

                    //Guardo el input en variables globales para utilizarlos en el calculo del precio de compra
                    receiptPriceInput = input;

                    input.dataset.column = col; // Guardo el nombre de la columna acá
                    td.appendChild(input);
                }
                else{return}
                break;
            case 'hard_gain':
                if (inventoryPreferences.hard_gain === 1) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Margen de Ganancia';
                    input.value = gainValue;

                    //Guardo el input en variables globales para utilizarlos en el calculo del precio de compra
                    gainValueInput = input;

                    input.dataset.column = col; // Guardo el nombre de la columna acá
                    td.appendChild(input);
                }
                else{return}
                break;
            case 'percentage_gain':
                if (inventoryPreferences.percentage_gain === 1) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.placeholder = 'Margen de Ganancia';
                    input.value = gainValue;

                    //Guardo el input en variables globales para utilizarlos en el calculo del precio de compra
                    gainValueInput = input;

                    input.dataset.column = col; // Guardo el nombre de la columna acá
                    td.appendChild(input);
                }
                else{return}
                break;
            default:
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = col.charAt(0).toUpperCase() + col.slice(1);
                input.dataset.column = col; // Guardo el nombre de la columna acá
                td.appendChild(input);
                break;
        }
        tr.appendChild(td);
    });

    //Si el usuario tiene activo el calculo automático de precio de compra, lo calculo

    if (inventoryPreferences.auto_price === 1) {
        const updateReceiptPrice = () => {
            salePrice = salePriceInput.value;
            if (gainValueInput){gainValue = gainValueInput.value;}
            else {gainValue = 0;}

            if (gainValue === ''){gainValue = 0;}
            if (salePrice === ''){salePrice = 0;}
            receiptPrice = getAutoPrice();
            receiptPriceInput.value = receiptPrice.toFixed(2);
        };

        salePriceInput.addEventListener('input', updateReceiptPrice);
        if (gainValueInput){gainValueInput.addEventListener('input', updateReceiptPrice)};

        updateReceiptPrice();
    }

    /* ---------------------- FIN CODIGO DE NANO  ---------------------- */

    const actionTd = document.createElement('td');
    actionTd.classList.add('action-buttons');
    actionTd.innerHTML = `
        <button class="btn btn-primary save-new-row-btn">Guardar</button>
        <button class="btn btn-secondary cancel-new-row-btn">Cancelar</button>
    `;
    tr.appendChild(actionTd);

    return tr;
}

async function handleAddRowClick() {
    const tableBody = document.querySelector('#data-table tbody');
    if (!tableBody || tableBody.querySelector('.editing-row')) {
        // Si no hay body o ya hay una fila editándose, no hago nada
        return;
    }
    // Creo la nueva fila editable
    const newRow = await createEditableRow(currentTableColumns);
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
        if (value !== ''){
            newItemData[colName] = value;
        }
    });

    console.log("Datos a guardar:", newItemData); // Para depurar

    saveButton.disabled = true;
    saveButton.textContent = 'Guardando...';
    try {

        const result = await api.addItemToTable(newItemData); // Llamo a la API
        if (result.success && result.newItem) {
            allData.unshift(result.newItem); // Añado el nuevo item al principio de mis datos locales
            await renderTable(currentTableColumns, allData); // Vuelvo a renderizar toda la tabla
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



/* ---------------------- FUNCIONES DE NANO  ---------------------- */



function getReloadVariables(){
    const urlParams = new URLSearchParams(window.location.search);
    const menuToOpen = urlParams.get('location');
    if (!menuToOpen) return;

    const menuToClick = document.querySelector(`.menu-btn[data-target-view="${menuToOpen}"]`);
    console.log(menuToClick);

    menuToClick.click();
}

async function setupSaleList(){
    const response = await api.getUserSales();
    if (response.success) {
        const saleList = response.saleList;
        await populateSaleView(saleList);
    }
}

async function populateSaleView(saleList) {
    const dateDescendingContainer = document.getElementById('sales-table-date-descending');
    const dateAscendingContainer = document.getElementById('sales-table-date-ascending');
    const idDescendingContainer = document.getElementById('sales-table-id-descending');
    const idAscendingContainer = document.getElementById('sales-table-id-ascending');
    const customerDescendingContainer = document.getElementById('sales-table-client-descending');
    const customerAscendingContainer = document.getElementById('sales-table-client-ascending');
    const priceDescendingContainer = document.getElementById('sales-table-price-descending');
    const priceAscendingContainer = document.getElementById('sales-table-price-ascending');

    const dateDescendingList = saleList.date.descending;
    const dateAscendingList = saleList.date.ascending;
    const idDescendingList = saleList.id.descending;
    const idAscendingList = saleList.id.ascending;
    const customerDescendingList = saleList.customer.descending;
    const customerAscendingList = saleList.customer.ascending;
    const priceDescendingList = saleList.price.descending;
    const priceAscendingList = saleList.price.ascending;


    for (const sale of dateDescendingList) {
        const saleDiv = await createSaleRow(sale);
        dateDescendingContainer.appendChild(saleDiv);
    }

    for (const sale of dateAscendingList) {
        const saleDiv = await createSaleRow(sale);
        dateAscendingContainer.appendChild(saleDiv);
    }

    for (const sale of idDescendingList) {
        const saleDiv = await createSaleRow(sale);
        idDescendingContainer.appendChild(saleDiv);
    }

    for (const sale of idAscendingList) {
        const saleDiv = await createSaleRow(sale);
        idAscendingContainer.appendChild(saleDiv);
    }

    for (const sale of customerDescendingList) {
        const saleDiv = await createSaleRow(sale);
        customerDescendingContainer.appendChild(saleDiv);
    }

    for (const sale of customerAscendingList) {
        const saleDiv = await createSaleRow(sale);
        customerAscendingContainer.appendChild(saleDiv);
    }

    for (const sale of priceDescendingList) {
        const saleDiv = await createSaleRow(sale);
        priceDescendingContainer.appendChild(saleDiv);
    }

    for (const sale of priceAscendingList) {
        const saleDiv = await createSaleRow(sale);
        priceAscendingContainer.appendChild(saleDiv);

    }

}

async function createSaleRow(sale){
    let customerName;

    if (sale.customer_id === null){customerName = "No asignado";}
    else{
        const result = await api.getCustomerById(sale.customer_id);
        const customer = result.clientInfo;
        customerName = customer.full_name;
    }

    const saleDiv = document.createElement('div');
    saleDiv.classList.add('sale-row');
    saleDiv.dataset.saleId = sale.id;
    saleDiv.innerHTML = `<div class="flex-column" style="width: fit-content; justify-content: space-between">
                            <h3>Número = ${sale.id}</h3>
                            <h2>$${sale.total_amount}</h2>   
                        </div>
                        <div class="flex-column" style="width: fit-content; text-align: right">
                            <p>${sale.sale_date}</p>
                            <p class="customer-name">Cliente = ${customerName}</p>   
                        </div>`;
    saleDiv.addEventListener('click', async () => {
        const saleInfo = await api.getFullSaleInfo(sale.id);
        showSaleModal(saleInfo);
    });
    return saleDiv;
}

function showSaleModal(saleInfo){
    const modal = document.getElementById('transaction-info-modal');

    modal.originalSaleInfo = JSON.parse(JSON.stringify(saleInfo));

    const itemList = saleInfo.itemList;
    let customerInfo;
    if (!saleInfo.customerInfo){
        customerInfo = `<div class="flex-row justify-between">
                                    <p>Cliente</p>
                                    <p>'No asignado'</p>
                                </div>`;
    }
    else{customerInfo = newCustomerInfo(saleInfo.customerInfo);}

    const saleList = itemList.map((item, index) => {
        const name = item.product_name;
        const amount = item.quantity;
        const price = item.unit_price;
        const totalPrice = item.total_price;

        return `<div class="flex-row sale-item-row" style="gap: 15px;" data-index="${index}">
                    <p style="width: 100px;overflow: hidden; text-wrap: nowrap; text-overflow: ellipsis">${name}</p>
                    <p style="width: 70px;" class="item-quantity">${amount}</p>
                    <p style="width: 65px;" class="item-price">${price}$</p>
                    <p style="width: 80px;" class="item-total">${totalPrice}$</p>
                 </div>`;
    }).join('');

    const saleTicket = `<div class="flex-column" style="gap: 15px; margin-top:10px">    
         <div class="flex-row" style="gap: 15px;"><h4 style="width: 100px">Nombre</h4>
         <h4 style="width: 70px">Cantidad</h4><h4 style="width: 65px">Precio de Venta</h4><h4 style="width: 80px">Precio Total</h4></div>
         <div id="sale-item-list-wrapper" class="flex-column" style="max-height: 200px; overflow-y: auto;">${saleList}</div>
         <hr>
    </div>`;

    modal.innerHTML = `<div class="flex-row justify-between"><p></p><div>X</div></div>
                       <div class="product-list-container">
                       <div class="flex-row" style="justify-content: space-between; align-items: center">
                        <h3>Lista de Productos</h3>
                        <div class="flex-row all-center" style="gap: 10px;">
                            <div id="edit-controls-container" class="flex-row hidden" style="gap: 10px;">
                                <button id="save-sale-btn" class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem; margin-top: 0;" disabled>Guardar</button>
                                <button id="cancel-sale-btn" class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem; margin-top: 0;">Cancelar</button>
                            </div>
                            <button id="edit-sale-btn" class="btn btn-secondary hidden" style="padding: 5px 10px; font-size: 0.8rem; margin-top: 0;">Editar</button>
                            <img src="./assets/img/arrow-pointing-down.png" alt="Flecha" height="30px" id="product-list-btn" class="dropdown-arrow"/>
                        </div>
                        </div>
                        <div id="product-list-dropdown">${saleTicket}</div>
                        </div>
                        <div class="client-info-container">${customerInfo}</div>
                        <div id="final-total-container" style="margin-top: auto; text-align:right;" class="flex-column;">
                            <p style="font-size: 20px; font-weight: 600">Id = <span style="font-size: 17px; font-weight: 400">${saleInfo.id}</span></p>
                            <p style="font-size: 20px; font-weight: 600">Fecha = <span style="font-size: 17px; font-weight: 400">${saleInfo.saleDate}</span></p>
                            <h2 style="margin-bottom: 20px; text-align: right">Precio Total = $<span id="final-total-amount">${saleInfo.totalAmount}</span></h2>
                        </div>
                        `;

    modal.dataset.isEditing = 'false';

    const productListBtn = document.getElementById('product-list-btn');
    const listDropdown = document.getElementById('product-list-dropdown');
    const editBtn = document.getElementById('edit-sale-btn');

    productListBtn.addEventListener('click', () => {
        if (modal.dataset.isEditing === 'true') return;

        listDropdown.classList.toggle('visible');
        productListBtn.classList.toggle('rotated');

        if (listDropdown.classList.contains('visible')) {
            editBtn.classList.remove('hidden');
        } else {
            editBtn.classList.add('hidden');
        }
    })

    const customerInfoBtn = document.getElementById('customer-info-btn');

    if (customerInfoBtn){
        customerInfoBtn.addEventListener('click', () => {
            if (modal.dataset.isEditing === 'true') return;

            const infoDropdown = document.getElementById('customer-info-dropdown');
            infoDropdown.classList.toggle('visible');
            customerInfoBtn.classList.toggle('rotated');
        })
    }

    document.getElementById('edit-sale-btn').addEventListener('click', enableSaleEditing);
    document.getElementById('cancel-sale-btn').addEventListener('click', handleCancelSale);
    document.getElementById('save-sale-btn').addEventListener('click', handleSaveSale);

    modal.classList.remove('hidden');
}

function newCustomerInfo(clientInfo) {
    return `<div class="flex-row justify-between" style="align-items: center">     
                <div class="flex-row all-center" style="width: fit-content; gap: 10px">
                    <h3>Cliente: </h3>
                    <p style="font-weight: 600">${clientInfo.full_name}</p>
                </div>    
                <img src="./assets/img/arrow-pointing-down.png" alt="Flecha" height="30px" id="customer-info-btn" class="dropdown-arrow"/> 
            </div>
            <div class="flex-column" id="customer-info-dropdown">  
                <p>Email = ${(clientInfo.email !== null) ? clientInfo.email : 'No asignado'}</p>
                <p>Telefono = ${(clientInfo.phone !== null) ? clientInfo.phone : 'No asignado'}</p>
                <p>Dirección = ${(clientInfo.address !== null) ? clientInfo.address : 'No asignado'}</p>
                <p>DNI = ${(clientInfo.tax_id !== null) ? clientInfo.tax_id : 'No asignado'}</p>
                <p>Fecha de Creación = ${clientInfo.created_at}</p>
            </div>`;
}

// --- NUEVAS FUNCIONES PARA EDICIÓN DE VENTAS ---

async function enableSaleEditing() {
    const modal = document.getElementById('transaction-info-modal');
    modal.dataset.isEditing = 'true';
    const originalSaleInfo = modal.originalSaleInfo;

    document.getElementById('edit-sale-btn').classList.add('hidden');
    document.getElementById('product-list-btn').classList.add('hidden');
    document.getElementById('edit-controls-container').classList.remove('hidden');

    const listWrapper = document.getElementById('sale-item-list-wrapper');
    const itemRows = listWrapper.querySelectorAll('.sale-item-row');

    for (const row of itemRows){
        const index = row.dataset.index;
        const itemData = originalSaleInfo.itemList[index];

        const response = await getProductData(itemData.item_id,itemData.inventory_id);
        if (!response.success) return;

        const productInfo = response.productInfo;

        const quantityCell = row.querySelector('.item-quantity');
        const priceCell = row.querySelector('.item-price');
        const totalCell = row.querySelector('.item-total');

        const itemMax = itemData.quantity + productInfo.stock;

        quantityCell.innerHTML = `<input type="number" class="edit-quantity" value="${itemData.quantity}" min="1" max="${itemMax}" xstyle="width: 70px; text-align: right; padding: 4px;">`;
        priceCell.innerHTML = `<input type="number" class="edit-price" value="${itemData.unit_price}" min="0" step="0.01" style="width: 65px; text-align: right; padding: 4px;">$`;
        totalCell.innerHTML = `<input type="text" class="edit-total" value="${itemData.total_price.toFixed(2)}" style="width: 80px; border:none; background: #eee; text-align: right; padding: 4px; height: fit-content;" readonly>$`;
    }

    const finalTotalContainer = document.getElementById('final-total-container');
    finalTotalContainer.innerHTML = `<h2 style="margin-top:auto; margin-bottom: 20px; text-align: right">Precio Total = <input type="text" id="final-total-input" value="${originalSaleInfo.totalAmount.toFixed(2)}" style="width: fit-content; border:none; background: #eee; text-align: right; font-weight: 900; color: var(--color-black);" readonly></h2>`;

    modal.addEventListener('input', handleSaleEdit);
}

function handleSaleEdit(event) {
    if (!event.target.classList.contains('edit-quantity') && !event.target.classList.contains('edit-price')) {
        return;
    }

    const row = event.target.closest('.sale-item-row');
    if (!row) return;

    const quantityInput = row.querySelector('.edit-quantity');
    const priceInput = row.querySelector('.edit-price');
    const totalInput = row.querySelector('.edit-total');

    let newQuantity = parseInt(quantityInput.value) || 0;


    if (event.target.classList.contains('edit-quantity')) {
        const maxStock = parseInt(quantityInput.max, 10);

        if (!isNaN(maxStock) && newQuantity > maxStock) {

            newQuantity = maxStock;
            quantityInput.value = maxStock;
        }
    }
    const newPrice = parseFloat(priceInput.value) || 0;
    const newRowTotal = newQuantity * newPrice;

    totalInput.value = newRowTotal.toFixed(2);

    let overallTotal = 0;
    document.querySelectorAll('.edit-total').forEach(input => {
        overallTotal += parseFloat(input.value) || 0;
    });

    document.getElementById('final-total-input').value = overallTotal.toFixed(2);

    checkSaleChanges();
}

function checkSaleChanges() {
    const modal = document.getElementById('transaction-info-modal');
    const originalSaleInfo = modal.originalSaleInfo;
    let hasChanged = false;

    document.querySelectorAll('.sale-item-row').forEach(row => {
        const index = row.dataset.index;
        const originalItem = originalSaleInfo.itemList[index];

        const currentQuantity = row.querySelector('.edit-quantity').value;
        const currentPrice = row.querySelector('.edit-price').value;

        if (parseFloat(currentQuantity) !== originalItem.quantity) {
            hasChanged = true;
        }
        if (parseFloat(currentPrice) !== originalItem.unit_price) {
            hasChanged = true;
        }
    });

    document.getElementById('save-sale-btn').disabled = !hasChanged;
}

async function handleSaveSale() {
    const modal = document.getElementById('transaction-info-modal');
    const originalSaleInfo = modal.originalSaleInfo;

    const updatedSaleData = {
        sale_id: originalSaleInfo.id,
        items: [],
        newTotal: document.getElementById('final-total-input').value
    };
    document.querySelectorAll('.sale-item-row').forEach(row => {
        const index = row.dataset.index;
        const originalItem = originalSaleInfo.itemList[index];

        updatedSaleData.items.push({
            sale_item_id: originalItem.sale_id,
            product_id: originalItem.item_id,
            inventory_id: originalItem.inventory_id,
            product_name: originalItem.product_name,
            original_quantity: originalItem.quantity,
            new_quantity: row.querySelector('.edit-quantity').value,
            original_unit_price: originalItem.unit_price,
            new_unit_price: row.querySelector('.edit-price').value,
            new_total_price: row.querySelector('.edit-total').value
        });
    });

    console.log("Datos de Venta Modificados (listos para enviar al backend):", updatedSaleData);

    const response = await api.updateSaleList(updatedSaleData);
    if (response.success){alert("Se han guardados los cambios. Será redirigido."); window.location.reload();}
    else{alert("Ha ocurrido un error. No se pudieron guardar los cambios");console.log(response.error);}

    handleCancelSale();
}
function handleCancelSale() {
    const modal = document.getElementById('transaction-info-modal');
    const originalSaleInfo = modal.originalSaleInfo;

    modal.removeEventListener('input', handleSaleEdit);

    showSaleModal(originalSaleInfo);
}


async function setupReceiptList(){
    const response = await api.getUserReceipts();
    if (response.success) {
        const itemList = response.receiptList;
        await populateReceiptView(itemList);
    }
}

async function populateReceiptView(itemList) {
    const dateDescendingContainer = document.getElementById('receipts-table-date-descending');
    const dateAscendingContainer = document.getElementById('receipts-table-date-ascending');
    const idDescendingContainer = document.getElementById('receipts-table-id-descending');
    const idAscendingContainer = document.getElementById('receipts-table-id-ascending');
    const providerDescendingContainer = document.getElementById('receipts-table-provider-descending');
    const providerAscendingContainer = document.getElementById('receipts-table-provider-ascending');
    const priceDescendingContainer = document.getElementById('receipts-table-price-descending');
    const priceAscendingContainer = document.getElementById('receipts-table-price-ascending');

    const dateDescendingList = itemList.date.descending;
    const dateAscendingList = itemList.date.ascending;
    const idDescendingList = itemList.id.descending;
    const idAscendingList = itemList.id.ascending;
    const providerDescendingList = itemList.provider.descending;
    const providerAscendingList = itemList.provider.ascending;
    const priceDescendingList = itemList.price.descending;
    const priceAscendingList = itemList.price.ascending;


    for (const receipt of dateDescendingList) {
        const receiptDiv = await createReceiptRow(receipt);
        dateDescendingContainer.appendChild(receiptDiv);
    }

    for (const receipt of dateAscendingList) {
        const receiptDiv = await createReceiptRow(receipt);
        dateAscendingContainer.appendChild(receiptDiv);
    }

    for (const receipt of idDescendingList) {
        const receiptDiv = await createReceiptRow(receipt);
        idDescendingContainer.appendChild(receiptDiv);
    }

    for (const receipt of idAscendingList) {
        const receiptDiv = await createReceiptRow(receipt);
        idAscendingContainer.appendChild(receiptDiv);
    }

    for (const receipt of providerDescendingList) {
        const receiptDiv = await createReceiptRow(receipt);
        providerDescendingContainer.appendChild(receiptDiv);
    }

    for (const receipt of providerAscendingList) {
        const receiptDiv = await createReceiptRow(receipt);
        providerAscendingContainer.appendChild(receiptDiv);
    }

    for (const receipt of priceDescendingList) {
        const receiptDiv = await createReceiptRow(receipt);
        priceDescendingContainer.appendChild(receiptDiv);
    }

    for (const receipt of priceAscendingList) {
        const receiptDiv = await createReceiptRow(receipt);
        priceAscendingContainer.appendChild(receiptDiv);

    }

}

async function createReceiptRow(receipt){
    let providerName;

    if (receipt.provider_id === null){providerName = "No asignado";}
    else{
        const result = await api.getProdivderById(receipt.provider_id);
        const provider = result.providerInfo;
        providerName = provider.full_name;
    }

    const receiptDiv = document.createElement('div');
    receiptDiv.classList.add('receipt-row');
    receiptDiv.dataset.receiptId = receipt.id;
    receiptDiv.innerHTML = `<div class="flex-column" style="width: fit-content; justify-content: space-between">
                            <h3>Número = ${receipt.id}</h3>
                            <h2>$${receipt.total_amount}</h2>   
                        </div>
                        <div class="flex-column" style="width: fit-content; text-align: right">
                            <p>${receipt.receipt_date}</p>
                            <p class="customer-name">Proveedor = ${providerName}</p>   
                        </div>`;
    receiptDiv.addEventListener('click', async () => {
        const receiptInfo = await api.getFullReceiptInfo(receipt.id);
        showReceiptModal(receiptInfo);
    });
    return receiptDiv;
}

function showReceiptModal(receiptInfo){
    const modal = document.getElementById('transaction-info-modal');

    modal.originalReceiptInfo = JSON.parse(JSON.stringify(receiptInfo));

    const itemList = receiptInfo.itemList;
    let providerInfo;
    if (!receiptInfo.providerInfo){
        providerInfo = `<div class="flex-row justify-between">
                                    <p>Proveedor</p>
                                    <p>'No asignado'</p>
                                </div>`;
    }
    else{providerInfo = newProviderInfo(receiptInfo.providerInfo);}

    const receiptList = itemList.map((item, index) => {
        const name = item.product_name;
        const amount = item.quantity;
        const price = item.unit_price;
        const totalPrice = item.total_price;

        return `<div class="flex-row receipt-item-row" style="gap: 15px;" data-index="${index}">
                    <p style="width: 100px;overflow: hidden; text-wrap: nowrap; text-overflow: ellipsis">${name}</p>
                    <p style="width: 70px;" class="item-quantity">${amount}</p>
                    <p style="width: 65px;" class="item-price">${price}$</p>
                    <p style="width: 80px;" class="item-total">${totalPrice}$</p>
                 </div>`;
    }).join('');

    const receiptTicket = `<div class="flex-column" style="gap: 15px; margin-top:10px">    
         <div class="flex-row" style="gap: 15px;"><h4 style="width: 100px">Nombre</h4>
         <h4 style="width: 70px">Cantidad</h4><h4 style="width: 65px">Precio de Venta</h4><h4 style="width: 80px">Precio Total</h4></div>
         <div id="receipt-item-list-wrapper" class="flex-column" style="max-height: 200px; overflow-y: auto;">${receiptList}</div>
         <hr>
    </div>`;

    modal.innerHTML = `<div class="flex-row justify-between"><p></p><div class="return-btn" style="top: 0; left: 0" id="close-info-modal">Volver</div></div>
                       <div class="product-list-container">
                       <div class="flex-row" style="justify-content: space-between; align-items: center">
                        <h3>Lista de Productos</h3>
                        <div class="flex-row all-center" style="gap: 10px;">
                            <div id="edit-controls-container" class="flex-row hidden" style="gap: 10px;">
                                <button id="save-receipt-btn" class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem; margin-top: 0;" disabled>Guardar</button>
                                <button id="cancel-receipt-btn" class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem; margin-top: 0;">Cancelar</button>
                            </div>
                            <button id="edit-receipt-btn" class="btn btn-secondary hidden" style="padding: 5px 10px; font-size: 0.8rem; margin-top: 0;">Editar</button>
                            <img src="./assets/img/arrow-pointing-down.png" alt="Flecha" height="30px" id="product-list-btn" class="dropdown-arrow"/>
                        </div>
                        </div>
                        <div id="product-list-dropdown">${receiptTicket}</div>
                        </div>
                        <div class="provider-info-container">${providerInfo}</div>
                        <div id="final-total-container" style="margin-top: auto; text-align:right;" class="flex-column;">
                            <p style="font-size: 20px; font-weight: 600">Id = <span style="font-size: 17px; font-weight: 400">${receiptInfo.id}</span></p>
                            <p style="font-size: 20px; font-weight: 600">Fecha = <span style="font-size: 17px; font-weight: 400">${receiptInfo.receiptDate}</span></p>
                            <h2 style="margin-bottom: 20px; text-align: right">Precio Total = $<span id="final-total-amount">${receiptInfo.totalAmount}</span></h2>
                        </div>
                        `;

    modal.dataset.isEditing = 'false';

    const closeBtn = document.getElementById('close-info-modal');

    closeBtn.addEventListener('click', closeTransactionInfoModal );

    const productListBtn = document.getElementById('product-list-btn');
    const listDropdown = document.getElementById('product-list-dropdown');
    const editBtn = document.getElementById('edit-receipt-btn');

    productListBtn.addEventListener('click', () => {
        if (modal.dataset.isEditing === 'true') return;

        listDropdown.classList.toggle('visible');
        productListBtn.classList.toggle('rotated');

        if (listDropdown.classList.contains('visible')) {
            editBtn.classList.remove('hidden');
        } else {
            editBtn.classList.add('hidden');
        }
    })

    const providerInfoBtn = document.getElementById('provider-info-btn');

    if (providerInfoBtn){
        providerInfoBtn.addEventListener('click', () => {
            if (modal.dataset.isEditing === 'true') return;

            const infoDropdown = document.getElementById('provider-info-dropdown');
            infoDropdown.classList.toggle('visible');
            providerInfoBtn.classList.toggle('rotated');
        })
    }

    document.getElementById('edit-receipt-btn').addEventListener('click', enableReceiptEditing);
    document.getElementById('cancel-receipt-btn').addEventListener('click', handleCancelReceipt);
    document.getElementById('save-receipt-btn').addEventListener('click', handleSaveReceipt);

    showTransactionInfoModal();
}

function showTransactionInfoModal(){
    const modal = document.getElementById('transaction-info-modal');
    const greyBg = document.getElementById('grey-background');
    const pickerModal = document.getElementById('transaction-picker-modal');
    const successModal = document.getElementById('transaction-success-modal');
    const transactionModal = document.getElementById('new-transaction-container');

    pickerModal.classList.add('hidden');
    successModal.classList.add('hidden');
    transactionModal.classList.add('hidden');

    modal.classList.remove('hidden');
    greyBg.classList.remove('hidden');
}

function closeTransactionInfoModal(){
    const modal = document.getElementById('transaction-info-modal');
    const greyBg = document.getElementById('grey-background');
    modal.classList.add('hidden');
    greyBg.classList.add('hidden');
}

function newProviderInfo(providerInfo) {
    return `<div class="flex-row justify-between" style="align-items: center">     
                <div class="flex-row all-center" style="width: fit-content; gap: 10px">
                    <h3>Proveedor: </h3>
                    <p style="font-weight: 600">${providerInfo.full_name}</p>
                </div>    
                <img src="./assets/img/arrow-pointing-down.png" alt="Flecha" height="30px" id="provider-info-btn" class="dropdown-arrow"/> 
            </div>
            <div class="flex-column" id="provider-info-dropdown">  
                <p>Email = ${(providerInfo.email !== null) ? providerInfo.email : 'No asignado'}</p>
                <p>Telefono = ${(providerInfo.phone !== null) ? providerInfo.phone : 'No asignado'}</p>
                <p>Dirección = ${(providerInfo.address !== null) ? providerInfo.address : 'No asignado'}</p>
                <p>Fecha de Creación = ${providerInfo.created_at}</p>
            </div>`;
}

// --- NUEVAS FUNCIONES PARA EDICIÓN DE COMPRAS ---

async function enableReceiptEditing() {
    const modal = document.getElementById('transaction-info-modal');
    modal.dataset.isEditing = 'true';
    const originalReceiptInfo = modal.originalReceiptInfo;

    document.getElementById('edit-receipt-btn').classList.add('hidden');
    document.getElementById('product-list-btn').classList.add('hidden');
    document.getElementById('edit-controls-container').classList.remove('hidden');



    const listWrapper = document.getElementById('receipt-item-list-wrapper');
    const itemRows = listWrapper.querySelectorAll('.receipt-item-row');

    for (const row of itemRows){
        const index = row.dataset.index;
        const itemData = originalReceiptInfo.itemList[index];

        const response = await api.getProductData(itemData.item_id, itemData.inventory_id);
        if (!response.success) return;

        const itemInfo = response.productInfo;

        let minStock = itemData.quantity - itemInfo.stock;
        if (minStock < 1) minStock = 1;

        const quantityCell = row.querySelector('.item-quantity');
        const priceCell = row.querySelector('.item-price');
        const totalCell = row.querySelector('.item-total');

        quantityCell.innerHTML = `<input type="number" class="edit-quantity" value="${itemData.quantity}" min="${minStock}" style="width: 70px; text-align: right; padding: 4px;">`;
        priceCell.innerHTML = `<input type="number" class="edit-price" value="${itemData.unit_price}" min="0" step="0.01" style="width: 65px; text-align: right; padding: 4px;">$`;
        totalCell.innerHTML = `<input type="text" class="edit-total" value="${itemData.total_price.toFixed(2)}" style="width: 80px; border:none; background: #eee; text-align: right; padding: 4px; height: fit-content;" readonly>$`;
    }

    const finalTotalContainer = document.getElementById('final-total-container');
    finalTotalContainer.innerHTML = `<h2 style="margin-top:auto; margin-bottom: 20px; text-align: right">Precio Total = <input type="text" id="final-total-input" value="${originalReceiptInfo.totalAmount.toFixed(2)}" style="width: fit-content; border:none; background: #eee; text-align: right; font-weight: 900; color: var(--color-black);" readonly></h2>`;

    modal.addEventListener('input', handleReceiptEdit);
}

function handleReceiptEdit(event) {
    if (!event.target.classList.contains('edit-quantity') && !event.target.classList.contains('edit-price')) {
        return;
    }

    const row = event.target.closest('.receipt-item-row');
    if (!row) return;

    const quantityInput = row.querySelector('.edit-quantity');
    const priceInput = row.querySelector('.edit-price');
    const totalInput = row.querySelector('.edit-total');

    let newQuantity = parseInt(quantityInput.value) || 0;
    const newPrice = parseFloat(priceInput.value) || 0;
    const newRowTotal = newQuantity * newPrice;

    totalInput.value = newRowTotal.toFixed(2);

    let overallTotal = 0;
    document.querySelectorAll('.edit-total').forEach(input => {
        overallTotal += parseFloat(input.value) || 0;
    });

    document.getElementById('final-total-input').value = overallTotal.toFixed(2);

    checkReceiptChanges();
}

function checkReceiptChanges() {
    const modal = document.getElementById('transaction-info-modal');
    const originalReceiptInfo = modal.originalReceiptInfo;
    let hasChanged = false;

    document.querySelectorAll('.receipt-item-row').forEach(row => {
        const index = row.dataset.index;
        const originalItem = originalReceiptInfo.itemList[index];

        const currentQuantity = row.querySelector('.edit-quantity').value;
        const currentPrice = row.querySelector('.edit-price').value;

        if (parseFloat(currentQuantity) !== originalItem.quantity) {
            hasChanged = true;
        }
        if (parseFloat(currentPrice) !== originalItem.unit_price) {
            hasChanged = true;
        }
    });

    document.getElementById('save-receipt-btn').disabled = !hasChanged;
}

async function handleSaveReceipt() {
    const modal = document.getElementById('transaction-info-modal');
    const originalReceiptInfo = modal.originalReceiptInfo;

    const updatedReceiptData = {
        receipt_id: originalReceiptInfo.id,
        items: [],
        newTotal: document.getElementById('final-total-input').value
    };
    document.querySelectorAll('.receipt-item-row').forEach(row => {
        const index = row.dataset.index;
        const originalItem = originalReceiptInfo.itemList[index];

        updatedReceiptData.items.push({
            receipt_item_id: originalItem.receipt_id,
            product_id: originalItem.item_id,
            inventory_id: originalItem.inventory_id,
            product_name: originalItem.product_name,
            original_quantity: originalItem.quantity,
            new_quantity: row.querySelector('.edit-quantity').value,
            original_unit_price: originalItem.unit_price,
            new_unit_price: row.querySelector('.edit-price').value,
            new_total_price: row.querySelector('.edit-total').value
        });
    });

    console.log("Datos de Compra Modificados (listos para enviar al backend):", updatedReceiptData);

    const response = await api.updateRececiptList(updatedReceiptData);

    if (response.success){alert("Se han guardados los cambios. Será redirigido."); window.location.reload();}
    else{alert("Ha ocurrido un error. No se pudieron guardar los cambios");console.log(response.error);}

    handleCancelReceipt();
}
function handleCancelReceipt() {
    const modal = document.getElementById('transaction-info-modal');
    const originalReceiptInfo = modal.originalReceiptInfo;

    modal.removeEventListener('input', handleReceiptEdit);

    showReceiptModal(originalReceiptInfo);
}

function setupOrderBy(){

    //DECLARACION DE VARIABLES IMPORTANTES

    const orderByBtns = document.querySelectorAll('.order-by-btn');
    const directionBtns = document.querySelectorAll('.direction-btn');
    const orderButtons = document.querySelectorAll('.order-btn');

    let viewOrder = '';
    let viewDirection = 'descending';

    //COMPORTAMIENTOS DEL DROPDOWN

    orderByBtns.forEach(button =>{
        button.addEventListener('click', (e) =>{
            e.stopPropagation();
            const currentContainer = button.closest('.order-by-container');
            const currentDropdown = currentContainer.querySelector('.order-by-dropdown');

            if(currentContainer.classList.contains('clicked')) {
                currentContainer.classList.remove('clicked');
                currentDropdown.classList.add('hidden');
            }
            else{
                currentContainer.classList.add('clicked');
                currentDropdown.classList.remove('hidden');
            }
            currentDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            })
            window.addEventListener('click', () => {
                if (currentContainer.classList.contains('clicked')) {
                    currentContainer.classList.remove('clicked');
                    currentDropdown.classList.add('hidden');
                }
            })
        })
    })


    //SELECCION DE ORDEN
    orderButtons.forEach(button =>{
        button.addEventListener('click', () =>{
            const menuContainer = button.closest('.menu-container');
            const directionButton = menuContainer.querySelector('.direction-btn');

            viewOrder = button.dataset.order;
            directionButton.dataset.order = viewOrder;

            showTransactionView(viewOrder,viewDirection,menuContainer);
        })
    })

    //SELECCION DE DIRECCION

    directionBtns.forEach(button =>{
        button.addEventListener('click', () =>{
            const menuContainer = button.closest('.menu-container');

            if (button.dataset.order === 'none'){
                const orderButton = menuContainer.querySelector('.order-btn');
                button.dataset.order = orderButton.dataset.order;
            }

            viewOrder = button.dataset.order;

            if (button.dataset.direction === 'descending') {
                button.innerHTML = `<i class="ph ph-arrow-up" style="margin-right: 5px"></i>
                                        <i class="ph ph-arrow-down hidden" style="margin-right: 5px"></i>`;
                viewDirection = 'ascending';
                button.dataset.direction = 'ascending';
            }
            else {
                button.innerHTML = `<i class="ph ph-arrow-up hidden" style="margin-right: 5px"></i>
                                        <i class="ph ph-arrow-down" style="margin-right: 5px"></i>`;
                viewDirection = 'descending';
                button.dataset.direction = 'descending';
            }

            showTransactionView(viewOrder,viewDirection,menuContainer);
        })
    })
}

//CAMBIO DE VIEW SEGUN EL ORDEN SELECCIONADO

function showTransactionView(viewOrder, viewDirection,menuContainer) {
    menuContainer.querySelectorAll('.transaction-view').forEach(view => view.classList.add('hidden'));
    const viewToShow =  document.getElementById(viewOrder + '-' + viewDirection);
    if (viewToShow) { viewToShow.classList.remove('hidden'); }
}


/* -------------------- FUNCIONES GENERALES PARA MODALES -------------------- */

//PREPARO EL FONDO GRIS PARA LOS MODALES
function setupGreyBg(){
    const greyBg = document.getElementById('grey-background');
    const transactionModal = document.getElementById('transaction-picker-modal');
    greyBg.addEventListener('click', (event) =>{
        if (event.target === greyBg) {
            if (!transactionModal.classList.contains('hidden')) {
                hideTransactionModal();
            }
            else{greyBg.classList.add('hidden'); hideTransactionSuccess();}
        }
    })
}

//PREPARO EL BOTON DE "VOLVER" DE LOS MODALES
function setupReturnBtn(){
    const returnBtn = document.getElementById('return-btn');
    const greyBg = document.getElementById('grey-background');

    returnBtn.addEventListener('click', () => {
        greyBg.classList.add('hidden');
        hideTransactionSuccess();
        hideTransactionModal();
    })
}

/* -------------------- FUNCIONES DE TRANSACCIONES -------------------- */

//Detecta la transaccion que se quiere agregar
function setupTransactions(){
    const newTransacionButtons = document.querySelectorAll('.new-transaction-btn');
    const greyBg = document.getElementById('grey-background');

    configTransactionModalsReturn();
    configureTablePickerDropdown();

    newTransacionButtons.forEach(button =>{
        button.addEventListener('click', async () =>{
            const transactionModal = document.getElementById('new-transaction-container');
            const pickerModal = document.getElementById('transaction-picker-modal');
            const successModal = document.getElementById('transaction-success-modal');
            const infoModal = document.getElementById('transaction-info-modal');
            infoModal.classList.add('hidden');
            successModal.classList.add('hidden');
            pickerModal.classList.add('hidden');
            transactionModal.classList.remove('hidden');
            greyBg.classList.remove('hidden');
            await populateTransactionContainer(button.dataset.transaction);
        })
    })
}

//Llena el modal de transacción segun la transacción elegida
async function populateTransactionContainer(transactionType){
    const transactionFormContainer = document.getElementById('transaction-form-container');
    let itemList= [];

    transactionFormContainer.innerHTML = getForm(transactionType);

    if (transactionType === 'sale' || transactionType ===  'receipt'){
            //Prepara el selector de productos
            await populateProductPicker(transactionType);
            //Prepara el selector de clientes
            await populateTransactionClientList();
            //Prepara el selector de provedores
            await populateTransactionProviderList();
            //Prepara los botones para subir/bajar la cantidad de productos
            setupQuantityBtns(transactionType,itemList);
            //Prepara los botones para eliminar items de la lista
            configRemoveProduct(itemList,transactionType);
            //Prepara los botones que abren los modales de productos/clientes/proveedores
            configurePickerBtns();
            //Renderiza la lista de productos
            renderProductList(itemList,transactionType);
    }

    else if (transactionType === 'customer') {configCreateClientBtn(); }
    else {configCreateProviderBtn(); }

    setupPickerConfirmBtns(itemList,transactionType);

    //Prepara los botones que completan las transacciones de compra/venta
    setupCompleteTransactionBtn(itemList);
}

function configTransactionModalsReturn(){
    const returnBtn = document.getElementById('modal-return-btn');
    const itemPickerHeader = document.getElementById('item-picker-header');

    returnBtn.addEventListener('click', () => {
        itemPickerHeader.classList.add('hidden');
        hideTransactionModal();
    })
}

function configRemoveProduct(itemList){
    const productListContainer = document.getElementById('product-list-container');

    if (productListContainer){
        productListContainer.addEventListener('click', (event) =>{
            const deleteButton = event.target.closest('.delete-product-btn');
            if (!deleteButton) return;

            const transactionType = deleteButton.dataset.type;

            const itemID = parseInt(deleteButton.dataset.pid,10);
            const tableID = parseInt(deleteButton.dataset.tid,10);

            const itemIndex = itemList.findIndex(item => item.pID === itemID && item.tID === tableID);

            if (itemIndex > -1) {
                itemList.splice(itemIndex, 1);
                renderProductList(itemList,transactionType);
            }
        })
    }
}

function configurePickerBtns(){
    const pickerBtns = document.querySelectorAll('.picker-btn');
    const pickerModalContainer = document.getElementById('transaction-picker-modal');

    pickerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalID = btn.dataset.modalTarget;
            pickerModalContainer.classList.remove('hidden');
            showPickerModal(modalID);
        })
    })

    window.addEventListener('click', (event) => {

        const isPickerBtn = event.target.closest('.picker-btn');
        // Si el picker está visible Y el clic fue FUERA del picker
        if (!pickerModalContainer.classList.contains('hidden') &&
            !pickerModalContainer.contains(event.target) &&
            !isPickerBtn === null) {
            hideTransactionModal();
        }
    });
}

function setupQuantityBtns(transactionType, itemList){
    const productListContainer = document.getElementById('product-list-container');

    productListContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.modify-quantity-btn');
        if (!button) return;

        const productID = parseInt(button.dataset.pid,10);
        const tableID = parseInt(button.dataset.tid,10);
        const type = button.dataset.type;

        hideTransactionError();
        let item = itemList.find(item => item.pID === productID && item.tID === tableID);
        if (!item) return;

        if (type === 'add') {
            if (item.amount === (item.stock) && transactionType === 'sale') {
                const errorMessage = 'La cantidad de un producto no puede ser mayor a su stock actual';
                showTransactionError(errorMessage);
            }
            else{item.amount++;}
        }
        else {if (item.amount > 1) {item.amount--;}
        else{
            const errorMessage = 'La cantidad de un producto no puede ser menor a 1';
            showTransactionError(errorMessage);
        }
        }
        renderProductList(itemList,transactionType);
    })
}

function createNewSaleRow (selectedProduct) {
    const newSaleRow = document.createElement('div');

    newSaleRow.className = 'flex-row';
    newSaleRow.style.borderWidth = '1px 0';
    newSaleRow.style.borderStyle = 'solid';
    newSaleRow.style.borderColor = 'black';
    newSaleRow.style.padding = '5px 0';

    newSaleRow.innerHTML = `<div class="flex-column">
        <p style="font-weight: 600">Nombre</p>
        <p style="font-weight: 400; text-wrap: nowrap; text-overflow: ellipsis; overflow: hidden">${selectedProduct.name}</p>
    </div>
    <div class="flex-column">
        <p style="font-weight: 600">Stock Disponible</p>
        <p style="font-weight: 400">${selectedProduct.stock}</p>
    </div>
    <div class="flex-column">
        <p style="font-weight: 600">Cantidad</p>
        <div style="font-weight: 400; gap: 10px" class="flex-row">
            <div class="modify-quantity-btn ph ph-minus-square" data-pID=${selectedProduct.pID} data-tID=${selectedProduct.tID} data-type="subtract"></div>
            <p style="width: fit-content">${selectedProduct.amount}</p>
            <div class="modify-quantity-btn ph ph-plus-square" data-pID=${selectedProduct.pID} data-tID=${selectedProduct.tID} data-type="add"></div>
        </div>
    </div>
    <div class="flex-column">
        <p style="font-weight: 600">Precio de Venta</p>
        <p style="font-weight: 400">${selectedProduct.salePrice}</p>
    </div>
    <div class="flex-column">
        <p style="font-weight: 600; width: 50px;">Precio Total</p>
        <p style="font-weight: 400; width: 50px;">${selectedProduct.totalPrice}</p>
    </div>
    <button type="button" class="btn delete-product-btn" data-type="sale" data-pID=${selectedProduct.pID} data-tID=${selectedProduct.tID}>
        X
    </button>`

    return newSaleRow;
}

function createNewReceiptRow (selectedProduct) {
    const newReceiptRow = document.createElement('div');

    newReceiptRow.className = 'flex-row';
    newReceiptRow.style.borderWidth = '1px 0';
    newReceiptRow.style.borderStyle = 'solid';
    newReceiptRow.style.borderColor = 'black';
    newReceiptRow.style.padding = '5px 0';

    newReceiptRow.innerHTML = `<div class="flex-column">
        <p style="font-weight: 600">Nombre</p>
        <p style="font-weight: 400; text-wrap: nowrap; text-overflow: ellipsis; overflow: hidden">${selectedProduct.name}</p>
    </div>
    <div class="flex-column">
        <p style="font-weight: 600">Stock Disponible</p>
        <p style="font-weight: 400">${selectedProduct.stock}</p>
    </div>
    <div class="flex-column">
        <p style="font-weight: 600">Cantidad</p>
        <div style="font-weight: 400; gap: 10px" class="flex-row">
            <div class="modify-quantity-btn ph ph-minus-square" data-pID=${selectedProduct.pID} data-tID=${selectedProduct.tID} data-type="subtract"></div>
            <p style="width: fit-content">${selectedProduct.amount}</p>
            <div class="modify-quantity-btn ph ph-plus-square" data-pID=${selectedProduct.pID} data-tID=${selectedProduct.tID} data-type="add"></div>
        </div>
    </div>
    <div class="flex-column">
        <p style="font-weight: 600">Precio de Compra</p>
        <p style="font-weight: 400">${selectedProduct.receiptPrice}</p>
    </div>
    <div class="flex-column">
        <p style="font-weight: 600; width: 50px;">Precio Total</p>
        <p style="font-weight: 400; width: 50px;">${selectedProduct.totalPrice}</p>
    </div>
    <button type="button" class="btn delete-product-btn" data-type="receipt" data-pID=${selectedProduct.pID} data-tID=${selectedProduct.tID}>
        X
    </button>`


    return newReceiptRow;
}


function renderProductList(itemList,transactionType){
    const productListContainer = document.getElementById('product-list-container');
    const totalPriceInput = document.getElementById('price-input');
    const totalPriceText = document.getElementById('price-text');
    let priceAcum = 0;

    productListContainer.innerHTML = '';

    if (itemList.length === 0) {
        productListContainer.innerHTML = `<h3>No hay productos en la lista</h3>`;
        totalPriceInput.value = priceAcum;
        totalPriceText.textContent = priceAcum;
        return;
    }

    itemList.forEach(item =>{
        priceAcum += item.totalPrice;
        let newProductRow;
        if (transactionType === 'sale') {
            newProductRow = createNewSaleRow(item);
        }
        else{
            newProductRow = createNewReceiptRow(item);
        }

        productListContainer.appendChild(newProductRow);
    })

    totalPriceText.textContent = priceAcum;
    totalPriceInput.value = priceAcum;
}

async function populateTransactionClientList(){
    const response = await api.getAllClients();
    const clientes = response.clientList;

    const clientModal = document.getElementById('client-list');

    clientModal.innerHTML = '';

    const none = {full_name: 'No Asignado', id: null};
    const noneSelected = createPersonItem(none,'sale');
    clientModal.appendChild(noneSelected);

    clientes.forEach(client => {
        const newClientItem = createPersonItem(client,'sale');
        clientModal.appendChild(newClientItem);
    })

    configureClientSelection();
}

function configureClientSelection(){
    const clientPickers = document.querySelectorAll('.client-picker-item');
    clientPickers.forEach(client => {
        client.addEventListener('click', () => {
            const clientID = parseInt(client.dataset.id);
            const clientName = client.dataset.name;

            const modalBody = client.closest('.picker-modal');
            if (!modalBody) return;

            modalBody.querySelectorAll('.client-picker-item').forEach(item => item.classList.remove('selected'));
            client.classList.add('selected');

            const confirmBtn = modalBody.querySelector('.picker-confirm-btn');

            confirmBtn.dataset.data = JSON.stringify({id: clientID, name: clientName});
            confirmBtn.disabled = false;
        })
    })
}

function selectClient(clientID, clientName){
    const clientFormInput = document.getElementById('client-id-input');
    const formText = document.getElementById('sale-client-name');

    formText.innerHTML = (isNaN(clientID)) ? 'Ninguno' : clientName;
    clientFormInput.value = clientID;

    hideTransactionModal();
}

function setupPickerConfirmBtns(itemList, transactionType){
    const allBtns = document.querySelectorAll('.picker-confirm-btn');

    allBtns.forEach(btn => {
        btn.onclick = () => {
            if (btn.disabled) return;

            const confirmType = btn.dataset.type;
            const selectedData = JSON.parse(btn.dataset.data);

            switch (confirmType) {
                case 'item':
                    const selectedProduct = selectedData;
                    selectedProduct.amount = 1;
                    Object.defineProperty(selectedProduct, 'totalPrice', {
                        get() {
                            if (transactionType === "sale") { return this.salePrice * this.amount }
                            else { return this.receiptPrice * this.amount }
                        }
                    });
                    addProduct(selectedProduct, itemList, transactionType);
                    break;

                case 'client':
                    selectClient(selectedData.id, selectedData.name);
                    break;

                case 'provider':
                    selectProvider(selectedData.id, selectedData.name);
                    break;
            }

            hideTransactionModal();
            btn.disabled = true;
            delete btn.dataset.item;
            document.querySelectorAll('.product-item.selected, .client-picker-item.selected, .provider-picker-item.selected').forEach(i => i.classList.remove('selected'));
        };
    })
}

async function populateTransactionProviderList(){

    const response = await api.getAllProviders();
    const providers = response.providerList;

    const providerModal = document.getElementById('provider-list');

    providerModal.innerHTML = '';

    const none = {full_name: 'Ninguno', id: null};
    const noneSelected = createPersonItem(none,'receipt')
    providerModal.appendChild(noneSelected);

    providers.forEach(provider => {
        const newProviderItem = createPersonItem(provider,'receipt')
        providerModal.appendChild(newProviderItem);
    })

    configureProviderSelection();
}

function configureProviderSelection(){
    const providerPickers = document.querySelectorAll('.provider-picker-item');
    providerPickers.forEach(provider => {
        provider.addEventListener('click', () => {
            const providerID = parseInt(provider.dataset.id, 10);
            const providerName = provider.dataset.name;

            const modalBody = provider.closest('.picker-modal');
            if (!modalBody) return;

            modalBody.querySelectorAll('.provider-picker-item').forEach(i => i.classList.remove('selected'));
            provider.classList.add('selected');

            const confirmBtn = modalBody.querySelector('.picker-confirm-btn');

            confirmBtn.dataset.data = JSON.stringify({ id: providerID, name: providerName });
            confirmBtn.disabled = false;
        })
    })
}

function selectProvider(providerID,providerName){
    const providerFormInput = document.getElementById('provider-id-input');
    const formText = document.getElementById('receipt-provider-name');

    formText.innerHTML = (isNaN(providerID)) ? 'Ninguno' : providerName;
    providerFormInput.value = providerID;

    hideTransactionModal();
}

function addProduct(selectedProduct,itemList,transactionType) {
    if (itemList.find(item => item.pID === selectedProduct.pID && item.tID === selectedProduct.tID)){
        showTransactionError('El producto ya se encuentra en la lista');
        hideTransactionModal();
        return;
    }
    hideTransactionError();

    itemList.push(selectedProduct);

    renderProductList(itemList,transactionType);
    hideTransactionModal();
}

async function populateProductPicker(transactionType){
    const response = await api.getUserVerifiedTables();
    if (!response.success) {showTransactionError(response.error); return;}

    const tables = response['verifiedInventories'];

    populateTablePicker(tables);
    configureTablePickers();

    let products = [];

    try {
        for (const table of tables){
            const response = await api.getTableProducts(table.id);
            if (!response.success) {showTransactionError(response.error);return;}

            const tableProducts = response.productList;
            if (tableProducts.length === 0) {continue;}

            products.push(...tableProducts);
        }
    } catch (error) {
        console.error("Error al procesar los inventarios del usuario:", error);
        showTransactionError("Error inesperado de conexión.");
        return;
    }

    populateProductModal(products,tables,transactionType);
    configureProductSelection(products);
}

function populateTablePicker(tables){
    const itemPickerHeader = document.getElementById('item-picker-header');
    const inventoryPicker = document.createElement('div');

    itemPickerHeader.innerHTML = '';
    inventoryPicker.className = 'flex-column';

    const tableItem = document.createElement('div');

    tableItem.dataset.tID = 'all';
    tableItem.innerHTML = 'Todos';
    tableItem.className = 'product-table-picker';

    inventoryPicker.appendChild(tableItem);

    tables.forEach(table => {
        const tableItem = document.createElement('div');
        tableItem.dataset.tID = table.id;
        tableItem.innerHTML = table.name;
        tableItem.className = 'product-table-picker';

        inventoryPicker.appendChild(tableItem);
    })

    itemPickerHeader.appendChild(inventoryPicker);
}

function populateProductModal(products, tables, transactionType){
    const itemPickerBody = document.getElementById('item-list');

    itemPickerBody.innerHTML = '';

    const allProductsDiv = document.createElement('div');
    allProductsDiv.className = 'flex-column product-list';
    allProductsDiv.id = 'all';

    let emptyList = true;

    products.forEach(product => {
        emptyList = false;
        const item = createProductItem(product,transactionType);
        allProductsDiv.appendChild(item);
    })

    if (emptyList) {allProductsDiv.innerHTML = '<h3>No hay productos en el inventario</h3>';}

    const productListWrapper = document.createElement('div');
    productListWrapper.className = 'hidden';
    productListWrapper.id = 'product-list-wrapper';

    itemPickerBody.appendChild(allProductsDiv);

    tables.forEach(table => {
        emptyList = true;
        const tableProductsDiv = document.createElement('div');
        tableProductsDiv.className = 'hidden flex-column product-list';
        tableProductsDiv.id = table.id;

        products.forEach(product => {
            if (product.tID !== table.id) return;
            emptyList = false;
            const item = createProductItem(product,transactionType);
            tableProductsDiv.appendChild(item);
        })
        if (emptyList) {tableProductsDiv.innerHTML = '<h3>No hay productos en el inventario</h3>';}
        productListWrapper.appendChild(tableProductsDiv);
    })
    itemPickerBody.appendChild(productListWrapper);
}

function createProductItem(product,transactionType){
    const item = document.createElement('div');
    let price;
    if (transactionType === 'sale'){price = product.salePrice;}
    else {price = product.receiptPrice;}

    item.innerHTML = `<div class="flex-column">
                            <div class="product-name">${product.name}</div>
                            <div class="product-stock">Stock Disponible: <span>${product.stock}</span></div>
                      </div>
                      <div class="flex-colum" style="text-align: right; width: 100%;">
                            <div class="product-inventory-name">${product.tableName}</div>
                            <div class="product-price">$${price}</div>
                      </div>`
    ;
    item.dataset.tID = product.tID;
    item.dataset.pID = product.pID;
    item.className = 'flex-row product-item';

    if (product.stock === 0 && transactionType === 'sale') {item.classList.add('no-stock');}

    return item;
}

function createPersonItem(person, transactionType){
    const item = document.createElement('div');

    item.innerHTML = `<div class="flex-column">
                            <div class="person-name">${person.full_name}</div>
                      </div>
                      <div class="flex-colum" style="text-align: right; width: 100%;">
                            <div class="person-id">${person.id || ''}</div>
                      </div>`
    ;
    item.dataset.id = person.id;
    item.dataset.name = person.full_name;
    item.className = 'flex-row';
    transactionType === 'sale' ? item.classList.add('client-picker-item') : item.classList.add('provider-picker-item');

    return item;
}

function configureProductSelection(products){
    const productItem = document.querySelectorAll('.product-item');
    productItem.forEach(item => {
        if (item.classList.contains('no-stock')) return;
        item.addEventListener('click', () => {
            const findProduct = products.find(product => product.pID === parseInt(item.dataset.pID,10) &&
                product.tID === parseInt(item.dataset.tID,10));
            if (!findProduct){
                showTransactionError('El producto no existe');
                return;
            }

            const modalBody = item.closest('.picker-modal');
            if (!modalBody) return;

            modalBody.querySelectorAll('.product-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');

            const selectedProduct = { ... findProduct };
            const confirmBtn = modalBody.querySelector('.picker-confirm-btn');

            confirmBtn.disabled = false;
            confirmBtn.dataset.data = JSON.stringify(selectedProduct);
        })
    })
}

function configureTablePickerDropdown(){
    const inventoryPickerName = document.getElementById('inventory-picker-name');
    const itemPickerHeader = document.getElementById('item-picker-header');

    inventoryPickerName.addEventListener('click', () => {
        itemPickerHeader.classList.toggle('hidden');
    })
}

function configureTablePickers(){
    const tablePickers = document.querySelectorAll('.product-table-picker');

    tablePickers.forEach(table => {
        table.addEventListener('click', () => {
            const tableID = table.dataset.tID;
            const itemPickerHeader = document.getElementById('item-picker-header');
            const inventoryPickerName = document.getElementById('inventory-picker-name');

            itemPickerHeader.classList.add('hidden');
            inventoryPickerName.innerHTML = table.innerHTML;
            showProductList(tableID);
        })
    })
}

function setupCompleteTransactionBtn(itemList){

    const buttons = document.querySelectorAll('.complete-transaction-btn');

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const transactionType = button.dataset.type;

            if (transactionType ==='sale'){
                const emailInfo = await completeSale(itemList);
                if (emailInfo) {setupSendEmailBtn(emailInfo);}

            }
            else if (transactionType ==='receipt'){ completeReceipt(itemList);}
        })
    })
}

async function completeSale(itemList){
    if (itemList.length === 0) {showTransactionError('Agregar al menos un producto.'); return;}

    let clientID = document.getElementById('client-id-input').value;
    const totalPrice = document.getElementById('price-input').value;
    const clientName = document.getElementById('sale-client-name').innerHTML;

    if (clientID === '' || isNaN(clientID)) {clientID = null;}

    const saleInfo = {'itemList' : itemList, 'clientID' : clientID, 'totalPrice' : totalPrice};

    var response = await api.createSale(saleInfo);
    if (!response.success) {showTransactionError('Ha ocurrido un error interno = ' + response.error); return;}

    const saleID = response.saleId;

    response = await api.getCustomerById(clientID);
    if (!response.success) {showTransactionError('Ha ocurrido un error interno = ' + response.error); return;}

    const client = response.clientInfo;
    var hasEmail = false, emailInfo = null;

    if (client){
        hasEmail = (client.email!==null);
    }

    const saleList = itemList.map(item => {
        const name = item.name;
        const amount = item.amount;
        const price = item.salePrice;
        const totalPrice = item.totalPrice;

        return `<div class="flex-row" style="gap: 15px;">
                <p style="width: 100px; text-align: right; overflow: hidden; text-wrap: nowrap; text-overflow: ellipsis">${name}</p>
                <p style="width: 70px; text-align: right">${amount}</p>
                <p style="width: 65px; text-align: right">${price}$</p>
                <p style="width: 80px; text-align: right">${totalPrice}$</p>
             </div>`;
    }).join('');

    const saleTicket = `<div style="margin-top: 20px; padding: 5px; border: var(--border-strong); border-radius: var(--border-radius)">
    <hr> <div class="flex-row" style="justify-content: space-between"><p>N° ${saleID}</p><h2 style="text-align: right">Lista de Productos</h2></div>
    
    <div class="flex-column" style="gap: 15px; margin-top: 15px;"> 
         
         <div class="flex-row" style="text-align: right; gap: 15px;"><h4 style="width: 100px">Nombre</h4>
         <h4 style="width: 70px">Cantidad</h4><h4 style="width: 65px">Precio de Venta</h4><h4 style="width: 80px">Precio Total</h4></div>
         <div class="flex-column" style="max-height: 200px; overflow-y: auto;">${saleList}</div>
         <hr>
         <div class="flex-column" style="text-align: right"><h4>Cliente</h4><p>${clientName}</p></div>
         <div class="flex-row" style="justify-content: right; gap:10px;"><h2>Precio Final =</h2><h1>${totalPrice}$</h1></div>
    </div></div>`;

    const transactionSuccessBody = `
    <h3 class="flex-row all-center" style="margin-top: 10px">Se ha registrado la venta con exito.</h3>
    <div>${saleTicket}</div>
    ${(hasEmail) ? `<div class="flex-row" style="justify-content: end">
<div class="btn btn-primary"  id="send-sale-email-btn" style="width: 50%; background-color: var(--accent-color-medium-opacity); font-size: 0.85rem">Enviar Factura a Cliente</div></div>` 
        : ''}
    <p style="margin-top: 15px; font-size: 0.75rem">Actualiza la pagina para ver tus cambios.</p>
    <div class="flex-column all-center">
        <div class="btn btn-primary reload-btn" data-location="sales">Actualizar Pagina</div>
        <div class="btn btn-secondary" id="success-return-btn">Cerrar</div>
    </div>`;

    if (hasEmail) {
        // Construir emailInfo en el formato esperado por send-email.php
        emailInfo = {
            to: client.email,
            subject: `Factura de su compra - Venta #${saleID}`,
            sale: {
                id: saleID,
                date: new Date().toISOString().slice(0,19).replace('T',' '),
                customer: client.name,
                items: itemList.map(item => ({
                    name: item.name,
                    quantity: item.amount,
                    unit_price: item.salePrice,
                    total: item.totalPrice
                })),
                total: totalPrice
            }
        };
    }

    showTransactionSuccess(transactionSuccessBody);
    return emailInfo;
}

async function completeReceipt(itemList){

    if (itemList.length === 0) {showTransactionError('Agregar al menos un producto.'); return;}

    let providerID = document.getElementById('provider-id-input').value;
    const providerName = document.getElementById('receipt-provider-name').innerHTML;
    const totalPrice = document.getElementById('price-input').value;

    if (providerID === '' || isNaN(providerID)) {providerID = null;}

    const receiptInfo = {'itemList' : itemList, 'providerID' : providerID, 'totalPrice' : totalPrice};

    var response = await api.createReceipt(receiptInfo);
    if (!response.success) {showTransactionError('Ha ocurrido un error interno = ' + response.error); return;}

    const receiptID = response.receiptId;

    const receiptList = itemList.map(item => {
        const name = item.name;
        const amount = item.amount;
        const price = item.receiptPrice;
        const totalPrice = item.totalPrice;

        return `<div class="flex-row" style="gap: 15px;">
                <p style="width: 100px; text-align: right; overflow: hidden; text-wrap: nowrap; text-overflow: ellipsis">${name}</p>
                <p style="width: 70px; text-align: right">${amount}</p>
                <p style="width: 65px; text-align: right">${price}$</p>
                <p style="width: 80px; text-align: right">${totalPrice}$</p>
             </div>`;
    }).join('');

    const receiptTicket = `<div style="margin-top: 20px; padding: 5px; border: var(--border-strong); border-radius: var(--border-radius)">
    <hr> <div class="flex-row" style="justify-content: space-between"><p>N° ${receiptID}</p><h2 style="text-align: right">Lista de Productos</h2></div>
    
    <div class="flex-column" style="gap: 15px; margin-top: 15px;"> 
         
         <div class="flex-row" style="text-align: right; gap: 15px;"><h4 style="width: 100px">Nombre</h4>
         <h4 style="width: 70px">Cantidad</h4><h4 style="width: 65px">Precio de Venta</h4><h4 style="width: 80px">Precio Total</h4></div>
         <div class="flex-column" style="max-height: 200px; overflow-y: auto;">${receiptList}</div>
         <hr>
         <div class="flex-column" style="text-align: right"><h4>Proveedor</h4><p>${providerName}</p></div>
         <div class="flex-row" style="justify-content: right; gap:10px;"><h2>Precio Final =</h2><h1>${totalPrice}$</h1></div>
    </div></div>`;

    const transactionSuccessBody = `
    <h3 class="flex-row all-center" style="margin-top: 10px">Se ha registrado la venta con exito.</h3>
    <div>${receiptTicket}</div>
    <p style="margin-top: 15px; font-size: 0.75rem">Actualiza la pagina para ver tus cambios.</p>
    <div class="flex-column all-center">
        <div class="btn btn-primary reload-btn" data-location="receipts">Actualizar Pagina</div>
        <div class="btn btn-secondary" id="success-return-btn">Cerrar</div>
    </div>`;

    showTransactionSuccess(transactionSuccessBody);
}

function configCreateClientBtn(){
    const customerForm = document.getElementById('customer-form');

    customerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!customerForm.checkValidity()) {
            showTransactionError('Verifique que los campos ingresados tengan el formato indicado'); return;
        }
        completeCustomer();
    })
}

function configCreateProviderBtn(){
    const providerForm = document.getElementById('provider-form');

    providerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!providerForm.checkValidity()) {
            showTransactionError('Verifique que los campos ingresados tengan el formato indicado'); return;
        }
        completeProvider();
    })
}

async function completeCustomer(){
    const clientName = document.getElementById('client-name').value;

    if (clientName === ''){showTransactionError('Es obligatorio asignarle un nombre al cliente.'); return;}

    var clientEmail = document.getElementById('client-email').value;
    var clientPhone = document.getElementById('client-phone').value;
    var clientAddress = document.getElementById('client-address').value;
    var clientDNI = document.getElementById('client-dni').value;

    const clientList = await api.getAllClients();

    if (!clientList.success){
        {showTransactionError('Ha ocurrido un error interno.' + clientList.error); return;}
    }

    if (clientList.clientList.find(client => client.email === clientEmail) && clientEmail !== ''){
        showTransactionError('Ya existe un cliente registrado con ese email.'); return;
    }
    if (clientList.clientList.find(client => parseInt(client.phone,10) === parseInt(clientPhone,10)) && clientPhone !== ''){
        showTransactionError('Ya existe un cliente registrado con ese telefono.'); return;
    }
    if (clientList.clientList.find(client => client.tax_id === clientDNI) && clientDNI !== ''){
        showTransactionError('Ya existe un cliente registrado con ese dni.'); return;
    }

    clientEmail = (clientEmail === '') ? null : clientEmail;
    clientPhone = (clientPhone === '') ? null : clientPhone;
    clientAddress = (clientAddress === '') ? null : clientAddress;
    clientDNI = (clientDNI === '') ? null : clientDNI;

    const client = {'name' : clientName, 'email' : clientEmail, 'phone' : clientPhone, 'address' : clientAddress, 'dni' : clientDNI};

    const result = await api.createClient(client);

    if (!result.success){
        {showTransactionError('Ha ocurrido un error interno. No se pudo registrar el cliente'); return;}
    }

    console.log('Cliente registrado');

    clientEmail = (clientEmail === null) ? 'No asignado' : clientEmail;
    clientPhone = (clientPhone === null) ? 'No asignado' : clientPhone;
    clientAddress = (clientAddress === null) ? 'No asignado' : clientAddress;
    clientDNI = (clientDNI === null) ? 'No asignado' : clientDNI;

    const transactionSuccessBody = `
    <h3 class="flex-row all-center" style="margin-top: 10px">Se ha creado el cliente con éxito.</h3>
    <div class="flex-column" style="flex-wrap: wrap; gap: 15px; margin-top: 25px; overflow: hidden"> 
        <div class="flex-column"><h4>Nombre</h4><p>${clientName}</p></div>
        <div class="flex-column"><h4>Email</h4><p>${clientEmail}</p></div>
        <div class="flex-column"><h4>Telefono</h4><p>${clientPhone}</p></div>
        <div class="flex-column"><h4>Direccion</h4><p>${clientAddress}</p></div>
        <div class="flex-column"><h4>DNI</h4><p>${clientDNI}</p></div>
    </div>
    <p style="margin-top: 15px; font-size: 0.75rem">Actualiza la pagina para ver tus cambios.</p>
    <div class="flex-column all-center">
        <div class="btn btn-primary reload-btn" data-location="customers">Actualizar Pagina</div>
        <div class="btn btn-secondary" id="success-return-btn">Cerrar</div>
    </div>`;

    showTransactionSuccess(transactionSuccessBody);
}

async function setupProviders(){
    const response = await api.getOrderedProviders();
    if (response.success){
        const providers = response.providerList;
        console.log(providers);
        if (providers.date.descending.length === 0){ populateEmptyProviderModal(); return; }
        populateProviderModal(providers);
    }
    else{
        console.log('no salio bien' + response.error);
    }
}

function populateEmptyProviderModal(){
    const providerModals = document.querySelectorAll('.provider-view');
    providerModals.forEach(modal => {
        modal.innerHTML = `<div class="flex-row"><div class="flex-column">
            <h2>No has creado ningun Proveedor</h2>
            <button class="btn btn-primary new-transaction-btn" data-transaction="provider">Crea tu Primer Proveedor</button>
            </div></div>`;
    })
}

function populateProviderModal(providers){
    const providersByNameDesc = providers.name.descending;
    const providersByNameAsc = providers.name.ascending;
    const providersByEmailDesc = providers.email.descending;
    const providersByEmailAsc = providers.email.ascending;
    const providersByDateDesc = providers.date.descending;
    const providersByDateAsc = providers.date.ascending;
    const providersByPhoneDesc = providers.phone.descending;
    const providersByPhoneAsc = providers.phone.ascending;
    const providersByAddressDesc = providers.address.descending;
    const providersByAddressAsc = providers.address.ascending;

    const providerEmailDescending = document.getElementById('providers-table-email-descending');
    const providerEmailAscending = document.getElementById('providers-table-email-ascending');
    const providerDateDescending = document.getElementById('providers-table-date-descending');
    const providerDateAscending = document.getElementById('providers-table-date-ascending');
    const providerNameDescending = document.getElementById('providers-table-name-descending');
    const providerNameAscending = document.getElementById('providers-table-name-ascending');
    const providerPhoneDescending = document.getElementById('providers-table-phone-descending');
    const providerPhoneAscending = document.getElementById('providers-table-phone-ascending');
    const providerAddressDescending = document.getElementById('providers-table-address-descending');
    const providerAddressAscending = document.getElementById('providers-table-address-ascending');

    providersByNameDesc.forEach(provider =>{
        providerNameDescending.innerHTML += createProviderRow(provider);
    })
    providersByNameAsc.forEach(provider =>{
        providerNameAscending.innerHTML += createProviderRow(provider);
    })
    providersByEmailDesc.forEach(provider=>{
        providerEmailDescending.innerHTML += createProviderRow(provider);
    })
    providersByEmailAsc.forEach(provider =>{
        providerEmailAscending.innerHTML += createProviderRow(provider);
    })
    providersByDateDesc.forEach(provider =>{
        providerDateDescending.innerHTML += createProviderRow(provider);
    })
    providersByDateAsc.forEach(provider =>{
        providerDateAscending.innerHTML += createProviderRow(provider);
    })
    providersByPhoneDesc.forEach(provider =>{
        providerPhoneDescending.innerHTML += createProviderRow(provider);
    })
    providersByPhoneAsc.forEach(provider =>{
        providerPhoneAscending.innerHTML += createProviderRow(provider);
    })
    providersByAddressDesc.forEach(provider =>{
        providerAddressDescending.innerHTML += createProviderRow(provider);
    })
    providersByAddressAsc.forEach(provider =>{
        providerAddressAscending.innerHTML += createProviderRow(provider);
    })
}

function createProviderRow (provider){
    const text = 'Nombre : ' + provider.full_name;
    return text;
}

async function setupClients(){
    const response = await api.getOrderedClients();
    if (response.success){
        const clients = response.clientList;
        if (clients.date.descending.length === 0){ populateEmptyClientModal(); return; }
        populateClientModal(clients);
    }
    else{
        console.log('no salio bien' + response.error);
    }
}

function populateEmptyClientModal(){
    const clientModals = document.querySelectorAll('.customer-view');
    clientModals.forEach(modal => {
        modal.innerHTML = `<div class="flex-row"><div class="flex-column">
            <h2>No has creado ningun cliente</h2>
            <button class="btn btn-primary new-transaction-btn" data-transaction="customer">Crea tu Primer Cliente</button>
            </div></div>`;
    })
}

function populateClientModal(clients){
    const clientsByNameDesc = clients.name.descending;
    const clientsByNameAsc = clients.name.ascending;
    const clientsByEmailDesc = clients.email.descending;
    const clientsByEmailAsc = clients.email.ascending;
    const clientsByDateDesc = clients.date.descending;
    const clientsByDateAsc = clients.date.ascending;
    const clientsByPhoneDesc = clients.phone.descending;
    const clientsByPhoneAsc = clients.phone.ascending;
    const clientsByAddressDesc = clients.address.descending;
    const clientsByAddressAsc = clients.address.ascending;
    const clientsByDniDesc = clients.tax_id.descending;
    const clientsByDniAsc = clients.tax_id.ascending;

    const customerEmailDescending = document.getElementById('customers-table-email-descending');
    const customerEmailAscending = document.getElementById('customers-table-email-ascending');
    const customerDateDescending = document.getElementById('customers-table-date-descending');
    const customerDateAscending = document.getElementById('customers-table-date-ascending');
    const customerNameDescending = document.getElementById('customers-table-name-descending');
    const customerNameAscending = document.getElementById('customers-table-name-ascending');
    const customerPhoneDescending = document.getElementById('customers-table-phone-descending');
    const customerPhoneAscending = document.getElementById('customers-table-phone-ascending');
    const customerAddressDescending = document.getElementById('customers-table-address-descending');
    const customerAddressAscending = document.getElementById('customers-table-address-ascending');
    const customerDniDescending = document.getElementById('customers-table-dni-descending');
    const customerDniAscending = document.getElementById('customers-table-dni-ascending');

    clientsByNameDesc.forEach(client =>{
        customerNameDescending.innerHTML += createClientRow(client);
    })
    clientsByNameAsc.forEach(client =>{
        customerNameAscending.innerHTML += createClientRow(client);
    })
    clientsByEmailDesc.forEach(client =>{
        customerEmailDescending.innerHTML += createClientRow(client);
    })
    clientsByEmailAsc.forEach(client =>{
        customerEmailAscending.innerHTML += createClientRow(client);
    })
    clientsByDateDesc.forEach(client =>{
        customerDateDescending.innerHTML += createClientRow(client);
    })
    clientsByDateAsc.forEach(client =>{
        customerDateAscending.innerHTML += createClientRow(client);
    })
    clientsByPhoneDesc.forEach(client =>{
        customerPhoneDescending.innerHTML += createClientRow(client);
    })
    clientsByPhoneAsc.forEach(client =>{
        customerPhoneAscending.innerHTML += createClientRow(client);
    })
    clientsByAddressDesc.forEach(client =>{
        customerAddressDescending.innerHTML += createClientRow(client);
    })
    clientsByAddressAsc.forEach(client =>{
        customerAddressAscending.innerHTML += createClientRow(client);
    })
    clientsByDniDesc.forEach(client =>{
        customerDniDescending.innerHTML += createClientRow(client);
    })
    clientsByDniAsc.forEach(client =>{
        customerDniAscending.innerHTML += createClientRow(client);
    })
}

function createClientRow (client){
    const text = `<div class="client-row">
                            <div style="height: 100%" class="flex-row">
                                <h3></h3>
                            </div>
                        <div>`
    return text;
}

async function completeProvider(){
    const providerName = document.getElementById('provider-name').value;

    if (providerName === ''){showTransactionError('Es obligatorio asignarle un nombre al proveedor.'); return;}

    var providerEmail = document.getElementById('provider-email').value;
    var providerPhone = document.getElementById('provider-phone').value;
    var providerAddress = document.getElementById('provider-address').value;

    const providerList = await api.getAllProviders();

    if (!providerList.success){
        {showTransactionError('Ha ocurrido un error interno.' + providerList.error); return;}
    }

    if (providerList.providerList.find(provider => provider.email === providerEmail) && providerEmail !== ''){
        showTransactionError('Ya existe un provedor registrado con ese email.'); return;
    }
    if (providerList.providerList.find(provider => parseInt(provider.phone,10) === parseInt(providerPhone,10)) && providerPhone !== ''){
        showTransactionError('Ya existe un provedor registrado con ese telefono.'); return;
    }

    providerEmail = (providerEmail === '') ? null : providerEmail;
    providerPhone = (providerPhone === '') ? null : providerPhone;
    providerAddress = (providerAddress === '') ? null : providerAddress;


    const provider = {'name' : providerName, 'email' : providerEmail, 'phone' : providerPhone, 'address' : providerAddress};

    const result = await api.createProvider(provider);

    if (!result.success){
        {showTransactionError('Ha ocurrido un error interno. No se pudo registrar el provedor '); return;}
    }

    providerEmail = (providerEmail === null) ? 'No asignado' : providerEmail;
    providerPhone = (providerPhone === null) ? 'No asignado' : providerPhone;
    providerAddress = (providerAddress === null) ? 'No asignado' : providerAddress;

    const transactionSuccessBody = `
    <h3 class="flex-row all-center" style="margin-top: 10px">Se ha creado el proveedor con éxito.</h3>
    <div class="flex-column" style="flex-wrap: wrap; gap: 15px; margin-top: 25px; overflow: hidden"> 
        <div class="flex-column"><h4>Nombre</h4><p>${providerName}</p></div>
        <div class="flex-column"><h4>Email</h4><p>${providerEmail}</p></div>
        <div class="flex-column"><h4>Telefono</h4><p>${providerPhone}</p></div>
        <div class="flex-column"><h4>Direccion</h4><p>${providerAddress}</p></div>
    </div>
    <p style="margin-top: 15px; font-size: 0.75rem">Actualiza la pagina para ver tus cambios.</p>
    <div class="flex-column all-center">
        <div class="btn btn-primary reload-btn" data-location="providers">Actualizar Pagina</div>
        <div class="btn btn-secondary" id="success-return-btn">Cerrar</div>
    </div>`;

    showTransactionSuccess(transactionSuccessBody);
}

function setupReloadBtns(){
    const reloadBtns = document.querySelectorAll('.reload-btn');
    const successReturnBtn = document.getElementById('success-return-btn');

    successReturnBtn.addEventListener('click', () => {
        hideTransactionSuccess();
    })
    reloadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const menuToOpen = btn.dataset.location;
            const url = window.location.pathname + '?location=' + menuToOpen;
            window.location.href = url;
        })
    })
}

function setupSendEmailBtn(emailInfo){
    const sendEmailBtn = document.getElementById('send-sale-email-btn');
    if (!sendEmailBtn) {return; }

    sendEmailBtn.addEventListener('click',() =>{
        sendSaleEmail(emailInfo);
    })
}

async function sendSaleEmail(emailInfo){
    const sendEmailBtn = document.getElementById('send-sale-email-btn');
    const originalText = sendEmailBtn.textContent;
    
    try {
        sendEmailBtn.textContent = 'Enviando...';
        sendEmailBtn.disabled = true;
        
        const response = await api.sendSaleEmail(emailInfo);
        
        if (response.success) {
            sendEmailBtn.textContent = '✓ Enviado';
            sendEmailBtn.style.backgroundColor = 'var(--success-color)';
            // Deshabilitar permanentemente después de éxito
            sendEmailBtn.onclick = null;
        } else {
            throw new Error(response.error || 'Error al enviar el email');
        }
    } catch (error) {
        console.error('Error:', error);
        sendEmailBtn.textContent = '✗ Error al enviar';
        sendEmailBtn.style.backgroundColor = 'var(--error-color)';
        // Permitir reintentar después de 2 segundos
        setTimeout(() => {
            sendEmailBtn.textContent = originalText;
            sendEmailBtn.style.backgroundColor = 'var(--accent-color-medium-opacity)';
            sendEmailBtn.disabled = false;
        }, 2000);
    }
}

function showTransactionSuccess(body){
    const transactionModal = document.getElementById('new-transaction-container');
    const modalContainer = document.getElementById('transaction-success-modal');
    const modalContainerBody = document.getElementById('success-modal-body');

    modalContainerBody.innerHTML = body;
    modalContainer.classList.remove('hidden');
    transactionModal.classList.add('hidden');
    setupReloadBtns();
}


//  ---- Funciones auxiliares de Transacciones ----


function getForm(transactionType){
    let HTML;

    switch (transactionType) {
    case 'sale':
        HTML = getSaleForm();
        break;
    case 'receipt':
        HTML = getReceiptForm();
        break;
    case 'customer':
        HTML = getCustomerForm();
        break;
    case 'provider':
        HTML = getProviderForm();
        break;
    }

    return HTML;
}

function getSaleForm() {
    return `<form class="flex-column" method="get" action="/StockiFy/dashboard.php">
                                <h4 class="transaction-error-message hidden" style="color: var(--accent-red)"></h4>
                                <hr>
                                <div class="flex-row" style="gap: 50px; justify-content: space-between; align-items: center">
                                    <h3>Productos</h3>
                                    <div class="btn picker-btn" data-modal-target="item-picker-modal" data-type="sale">
                                        Agregar Producto
                                    </div>
                                </div>       
                                <div class="flex-column" id="product-list-container"></div>
                                <hr style="margin-top: 50px">
                                <div class="flex-row" style="justify-content: space-between; align-items: center">
                                    <div>
                                    <h3>Cliente</h3>
                                    <p id="sale-client-name">Ninguno</p>
                                    </div>
                                    <div class="btn picker-btn" data-modal-target="client-picker-modal">Cambiar</div>
                                </div>
                                <div class="flex-row" style="justify-content: space-between; align-items: center">
                                <h2 style="margin-top: 50px">Total = $<span id="price-text">0</h2>
                                </div>
                                <input name="price" id="price-input" value="0" hidden>
                                <input name="product-list" id="product-list" hidden>
                                <input name="client-data" id="client-id-input" hidden>
                                <input name="price" id="price-input" value="0" hidden>            
                                <div class="btn btn-primary complete-transaction-btn" data-type="sale">Confirmar Venta</div>
                                </form>`;
}

function getReceiptForm() {
    return `<form class="flex-column" method="get" action="/StockiFy/dashboard.php">
                                <h4 class="transaction-error-message hidden" style="color: var(--accent-red)"></h4>
                                <hr>
                                <div class="flex-row" style="gap: 50px; justify-content: space-between; align-items: center">
                                    <h3>Productos</h3>
                                    <div class="btn picker-btn" data-modal-target="item-picker-modal" data-type="receipt">
                                        Agregar Producto
                                    </div>
                                </div>       
                                <div class="flex-column" id="product-list-container"></div>
                                <hr style="margin-top: 50px">
                                <div class="flex-row" style="justify-content: space-between; align-items: center">
                                    <div>
                                    <h3>Proveedor</h3>
                                    <p id="receipt-provider-name">Ninguno</p>
                                    </div>
                                    <div class="btn picker-btn" data-modal-target="provider-picker-modal">Cambiar</div>
                                </div>
                                <div class="flex-row" style="justify-content: space-between; align-items: center">
                                <h2 style="margin-top: 50px">Total = $<span id="price-text">0</h2>
                                </div>
                                <input name="price" id="price-input" value="0" hidden>
                                <input name="product-list" id="product-list" hidden>
                                <input name="provider-id" id="provider-id-input" hidden>
                                <input name="price" id="price-input" value="0" hidden>          
                                <div class="btn btn-primary complete-transaction-btn" data-type="receipt">Confirmar Compra</div>
                                </form>`;
}

function getCustomerForm() {
    return `<form class="flex-column" method="get" action="/StockiFy/dashboard.php" id="customer-form">
                                <h4 class="transaction-error-message hidden" style="color: var(--accent-red)"></h4>
                                <label for="client-name"><h2>Nombre</h2></label>
                                <input type="text" name="name" id="client-name" placeholder="Juan Perez" value="" required>
                                <hr>
                                <label for="client-email" class="flex-row" style="gap: 5px"><h2>Email</h2><p>(Opcional)</p></label>
                                <input type="email" name="email" id="client-email" placeholder="cliente@gmail.com" value="">
                                <label for="client-phone" class="flex-row" style="gap: 5px"><h2>Telefono </h2><p>(Opcional)</p></label>
                                <input type="text" name="phone" id="client-phone" placeholder="Numero sin espacios." 
                                value="" minlength="8" pattern="[0-9]+">
                                <label for="client-address" class="flex-row" style="gap: 5px"><h2>Dirección </h2><p>(Opcional)</p></label>
                                <input type="text" name="address" id="client-address" placeholder="Calle 1085, Localidad" value="">
                                <label for="client-dni" class="flex-row" style="gap: 5px"><h2>D.N.I </h2><p>(Opcional)</p></label>
                                <input type="text" name="tax-id" id="client-dni" placeholder="11.111.111" value="" 
                                pattern="\\d{1,2}\\.\\d{3}\\.\\d{3}">           
                                <button class="btn btn-primary complete-transaction-btn" data-type="customer">Crear Cliente</button>
                                </form>`;
}

function getProviderForm() {
    return `<form class="flex-column" method="get" action="/StockiFy/dashboard.php" id="provider-form">
                                <h4 class="transaction-error-message hidden" style="color: var(--accent-red)"></h4>
                                <label for="client-name"><h2>Nombre</h2></label>
                                <input type="text" name="name" id="provider-name" placeholder="Distribuidora 1" value="" required>
                                <hr>
                                <label for="client-email" class="flex-row" style="gap: 5px"><h2>Email</h2><p>(Opcional)</p></label>
                                <input type="email" name="email" id="provider-email" placeholder="cliente@gmail.com" value="">
                                <label for="client-phone" class="flex-row" style="gap: 5px"><h2>Telefono </h2><p>(Opcional)</p></label>
                                <input type="text" name="phone" id="provider-phone" placeholder="Numero sin espacios." 
                                value="" minlength="8" pattern="[0-9]+">
                                <label for="client-address" class="flex-row" style="gap: 5px"><h2>Dirección </h2><p>(Opcional)</p></label>
                                <input type="text" name="address" id="provider-address" placeholder="Calle 1085, Localidad" value="">       
                                <button class="btn btn-primary complete-transaction-btn" data-type="customer">Crear Proveedor</button>
                                </form>`;
}

function showTransactionError(message){
    const transactionError = document.querySelectorAll('.transaction-error-message');

    transactionError.forEach(error => {
        error.innerHTML = message;
        error.classList.remove('hidden')
    });
}

//'Picker modal' Son los container para seleccionar productos y clientes/proveedores para agregar a la transaccion.
function showPickerModal(pickerModalID){
    document.querySelectorAll('.picker-modal').forEach(modal => modal.classList.add('hidden'));
    const allBtns = document.querySelectorAll('.picker-confirm-btn');

    allBtns.forEach(btn => btn.disabled = true);

    const pickerToShow = document.getElementById(pickerModalID);
    const transactionModal = document.getElementById('transaction-picker-modal');
    const transactionContainer = document.getElementById('new-transaction-container');

    if (pickerModalID !== 'item-picker-modal'){
        const inventoryPickerContainer = document.getElementById('inventory-picker-container');
        inventoryPickerContainer.classList.add('hidden');
    }
    else{
        const inventoryPickerContainer = document.getElementById('inventory-picker-container');
        inventoryPickerContainer.classList.remove('hidden');
    }

    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => item.classList.remove('selected'));

    transactionContainer.classList.add('hidden');
    pickerToShow.classList.remove('hidden');
    transactionModal.classList.remove('hidden');
}

function showProductList(tableID){
    document.querySelectorAll('.product-list').forEach(wrapper => wrapper.classList.add('hidden'));
    const productListWrapper = document.getElementById('product-list-wrapper');
    const productListToShow = document.getElementById(tableID);

    productListWrapper.classList.remove('hidden');
    productListToShow.classList.remove('hidden');
}

function hideTransactionError(){
    const transactionError = document.querySelectorAll('.transaction-error-message');

    transactionError.forEach(error => {
        error.classList.add('hidden')
    });
}

function hideTransactionModal(){
    const transactionModal = document.getElementById('transaction-picker-modal');
    transactionModal.classList.add('hidden');
    const transactionContainer = document.getElementById('new-transaction-container');
    transactionContainer.classList.remove('hidden');
}

function hideTransactionSuccess(){
    const modalContainer = document.getElementById('transaction-success-modal');
    const greyBg = document.getElementById('grey-background');

    modalContainer.classList.add('hidden');
    greyBg.classList.add('hidden');
}

async function setupRecomendedColumns(){
    const preferences = await api.getCurrentInventoryPreferences();
    const form = document.getElementById('recomended-columns-form');

    if (!preferences.success) {
        console.error("Error crítico: No se encontraron las preferencias del inventario." + preferences.error);
        return;
    }

    const defaults = await api.getCurrentInventoryDefaults();
    if (!defaults.success) {
        console.error("Error crítico: No se encontraron los valores por defecto del inventario." + defaults.error);
        return;
    }

    const openColumnasRecomendadasBtn = document.getElementById('open-columnas-recomendadas-btn');

    openColumnasRecomendadasBtn.addEventListener('click', () => {
        form.classList.toggle('visible');
        openColumnasRecomendadasBtn.classList.toggle('is-rotated');
    })

    const gainCheckbox = document.getElementById('gain-input');
    const minStockCheckbox = document.getElementById('min-stock-input');
    const salePriceCheckbox = document.getElementById('sale-price-input');
    const receiptPriceCheckbox = document.getElementById('receipt-price-input');
    const percentageRadio = document.getElementById('percentage-gain-input');
    const hardRadio = document.getElementById('hard-gain-input');

    const autoPriceCheckbox = document.getElementById('auto-price-input');
    const autoIvaRadio = document.getElementById('auto-iva-input');
    const autoGainRadio = document.getElementById('auto-gain-input');
    const autoIvaGainRadio = document.getElementById('auto-iva-gain-input');

    const autoPriceLabel = document.getElementById('auto-price-checkbox');

    const autoPriceTypeContainer = document.getElementById('auto-price-type-container');

    autoPriceCheckbox.checked = (preferences.auto_price === 1);

    gainCheckbox.checked = (preferences.percentage_gain === 1 || preferences.hard_gain === 1);
    minStockCheckbox.checked = (preferences.min_stock === 1);
    salePriceCheckbox.checked = (preferences.sale_price === 1);
    receiptPriceCheckbox.checked = (preferences.receipt_price === 1);
    percentageRadio.checked = (preferences.percentage_gain === 1);
    hardRadio.checked = (preferences.hard_gain === 1);

    const minStockDefaultInput = document.getElementById('min-stock-default-input');
    minStockDefaultInput.value = (minStockCheckbox.checked) ? defaults.min_stock : '';

    const gainDefaultInput = document.getElementById('gain-default-input');
    gainDefaultInput.value = (gainCheckbox.checked) ? defaults.hard_gain : '';

    const salePriceDefaultInput = document.getElementById('sale-price-default-input');
    salePriceDefaultInput.value = (salePriceCheckbox.checked) ? defaults.sale_price : '';

    const receiptPriceDefaultInput = document.getElementById('receipt-price-default-input');
    receiptPriceDefaultInput.value = (receiptPriceCheckbox.checked) ? defaults.receipt_price : '';

    function updateMinStockInput() {
        const isChecked = minStockCheckbox.checked;
        const defaultInput = document.getElementById('min-stock-default-input');

        defaultInput.disabled = !isChecked;

        if (!isChecked) {
            defaultInput.value = "";
            defaultInput.classList.remove('visible');
        }
        else{
            defaultInput.value = defaults.min_stock;
            defaultInput.classList.add('visible');
        }

        checkFormState();
    }

    function updateSalePriceInput() {
        const isChecked = salePriceCheckbox.checked;
        const defaultInput = document.getElementById('sale-price-default-input');

        defaultInput.disabled = !isChecked;

        if (!isChecked) {
            defaultInput.classList.remove('visible');
            autoPriceCheckbox.checked = false;
            autoIvaRadio.checked = false;
            autoGainRadio.checked = false;
            autoIvaGainRadio.checked = false;
            autoPriceLabel.classList.remove('visible');
            autoPriceTypeContainer.classList.remove('visible');
        }
        else{
            defaultInput.value = defaults.sale_price;
            defaultInput.classList.add('visible');
            updateReceiptPriceInput();
        }
        checkFormState();

    }

    function updateReceiptPriceInput() {
        const isChecked = receiptPriceCheckbox.checked;
        const defaultInput = document.getElementById('receipt-price-default-input');

        defaultInput.disabled = !isChecked;

        if (!isChecked) {
            defaultInput.value = "";
            defaultInput.classList.remove('visible');
            autoPriceLabel.classList.remove('visible');
            autoPriceCheckbox.checked = false;
            autoPriceTypeContainer.classList.remove('visible');
        }
        else{
            defaultInput.value = defaults.receipt_price;
            defaultInput.classList.add('visible');
            if (salePriceCheckbox.checked){autoPriceLabel.classList.add('visible');}
            if (preferences.auto_price === 1) {autoPriceCheckbox.checked = true;}
            updateAutoPrice();
        }
        checkFormState();
    }

    function updateGainInput() {
        const isChecked = gainCheckbox.checked;
        const defaultInput = document.getElementById('gain-default-input');
        const gainTypeContainer = document.getElementById('gain-type-container');

        percentageRadio.disabled = !isChecked;
        hardRadio.disabled = !isChecked;
        defaultInput.disabled = !isChecked;

        if (!isChecked) {
            percentageRadio.checked = false;
            hardRadio.checked = false;
            defaultInput.value = "";
            defaultInput.classList.remove('visible');
            gainTypeContainer.classList.remove('visible');
        } else {
            percentageRadio.checked = (preferences.percentage_gain === 1);
            hardRadio.checked = (preferences.hard_gain === 1);

            if (!percentageRadio.checked && !hardRadio.checked) {
                percentageRadio.checked = true;
            }

            gainTypeContainer.classList.add('visible');
            autoIvaRadio.checked = true;
            autoGainRadio.checked = false;
            autoIvaGainRadio.checked = false;

            defaultInput.value = defaults.hard_gain;
            defaultInput.classList.add('visible');
            gainTypeContainer.classList.add('visible');
        }
        updateAutoPrice();
        checkFormState();
    }

    function updateAutoPrice(){
        const isChecked = autoPriceCheckbox.checked;

        if (!isChecked){
            autoIvaRadio.checked = false;
            autoGainRadio.checked = false;
            autoIvaGainRadio.checked = false;
            autoPriceTypeContainer.classList.remove('visible');
        }
        else{
            if (preferences.auto_price !== 1 || !gainCheckbox.checked){
                autoIvaRadio.checked = true;
                autoGainRadio.checked = false;
                autoIvaGainRadio.checked = false;
            }
            else{
                console.log(preferences.auto_price_type);
                autoIvaRadio.checked = (preferences.auto_price_type === 'iva');
                autoGainRadio.checked = (preferences.auto_price_type === 'gain');
                autoIvaGainRadio.checked = (preferences.auto_price_type === 'gain-iva');
            }
            if (!gainCheckbox.checked){
                autoGainRadio.disabled = true;
                autoIvaGainRadio.disabled = true;
            }
            else{
                autoGainRadio.disabled = false;
                autoIvaGainRadio.disabled = false;
            }


            autoPriceTypeContainer.classList.add('visible');
        }
        checkFormState();
    }

    gainCheckbox.addEventListener('change', updateGainInput);
    minStockCheckbox.addEventListener('change', updateMinStockInput);
    salePriceCheckbox.addEventListener('change', updateSalePriceInput);
    receiptPriceCheckbox.addEventListener('change', updateReceiptPriceInput);
    autoPriceCheckbox.addEventListener('change', updateAutoPrice);

    const saveBtn = document.getElementById('save-changes-btn');

    const allTrackedInputs = [
        gainCheckbox, minStockCheckbox, salePriceCheckbox, receiptPriceCheckbox,
        percentageRadio, hardRadio,
        gainDefaultInput, minStockDefaultInput, salePriceDefaultInput, receiptPriceDefaultInput, autoPriceCheckbox,
        autoIvaRadio, autoGainRadio, autoIvaGainRadio
    ];

    let initialState = {};

    function captureInitialState() {
        initialState = {};
        allTrackedInputs.forEach(input => {
            const prop = (input.type === 'checkbox' || input.type === 'radio') ? 'checked' : 'value';
            initialState[input.id] = input[prop];
        });
    }

    function checkFormState() {
        let isChanged = false;

        for (const input of allTrackedInputs) {
            const prop = (input.type === 'checkbox' || input.type === 'radio') ? 'checked' : 'value';
            if (input[prop] !== initialState[input.id]) {
                isChanged = true;
                break;
            }
        }
        saveBtn.disabled = !isChanged;
    }

    updateGainInput();
    updateMinStockInput();
    updateSalePriceInput();
    updateReceiptPriceInput();
    updateAutoPrice();

    captureInitialState();
    saveBtn.disabled = true;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const setPreferences = getUserPreferences();

        const response = await api.setCurrentInventoryPreferences(setPreferences);

        if (response){
            saveBtn.textContent = 'Guardado!';

            alert('Preferencias guardadas correctamente.');
            window.location.href = '/StockiFy/dashboard.php';
        }
        else{
            alert('Ha ocurrido un error al guardar las preferencias del inventario.');
        }
    })

    form.addEventListener('input', checkFormState);
}

function getUserPreferences(){
    const minStockCheckbox = document.getElementById('min-stock-input');
    const salePriceCheckbox = document.getElementById('sale-price-input');
    const receiptPriceCheckbox = document.getElementById('receipt-price-input');
    const percentageRadio = document.getElementById('percentage-gain-input');
    const hardRadio = document.getElementById('hard-gain-input');
    const autoPrice = document.getElementById('auto-price-input');

    const gainDefaultInput = document.getElementById('gain-default-input');
    const minStockDefaultInput = document.getElementById('min-stock-default-input');
    const salePriceDefaultInput = document.getElementById('sale-price-default-input');
    const receiptPriceDefaultInput = document.getElementById('receipt-price-default-input');

    const gainDefault = (gainDefaultInput.value === '') ? 0 : parseFloat(gainDefaultInput.value);
    const minStockDefault = (minStockDefaultInput.value === '') ? 0 : parseFloat(minStockDefaultInput.value);
    const salePriceDefault = (salePriceDefaultInput.value === '') ? 0 : parseFloat(salePriceDefaultInput.value);
    const receiptPriceDefault = (receiptPriceDefaultInput.value === '') ? 0 : parseFloat(receiptPriceDefaultInput.value);

    let auto_price_type;

    if (autoPrice.checked){auto_price_type = document.querySelector('input[name="price-type"]:checked').value;}
    else{auto_price_type = null;}


    const preferences = {
        min_stock: {active: (minStockCheckbox.checked) ? 1 : 0, default: minStockDefault},
        sale_price: {active: (salePriceCheckbox.checked) ? 1 : 0, default: salePriceDefault},
        receipt_price: {active: (receiptPriceCheckbox.checked) ? 1 : 0, default: receiptPriceDefault},
        percentage_gain: {active: (percentageRadio.checked) ? 1 : 0, default: gainDefault},
        hard_gain: {active: (hardRadio.checked) ? 1 : 0, default: gainDefault},
        auto_price: (autoPrice.checked) ? 1 : 0,
        auto_price_type: auto_price_type
    }

    return preferences;
}

// -- Estadisticas --

async function updateDailyStatistics(inventoryId) {
    const hourlyStatistics = await api.getDailyStatistics(inventoryId);
    if (hourlyStatistics){
        const groupedStatistics = groupHourlyData(hourlyStatistics);
        populateGroupedStatistics(groupedStatistics);
        populateHourlyGraphs(hourlyStatistics);
    }
}

function createCharts(){
    const stockIngresado = document.getElementById('stock-ingresado-graph');
    const stockVendido = document.getElementById('stock-vendido-graph');
    const ventas = document.getElementById('ventas-graph');
    const compras = document.getElementById('compras-graph');
    const gastos = document.getElementById('gastos-graph');
    const ingresos = document.getElementById('ingresos-graph');
    const ganancias = document.getElementById('ganancias-graph');
    const clientes = document.getElementById('clientes-graph');
    const proveedores = document.getElementById('proveedores-graph');

    var options = {
        name:{
        },
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [],
        xaxis: {
            categories: []
        },
        noData: {
            text: "Cargando datos..." // Mensaje mientras no hay datos
        }
    };

    const stockIngresadoChart = new ApexCharts(stockIngresado,options);
    stockIngresadoChart.render();
    stockIngresado.myChartInstance = stockIngresadoChart;

    const stockVendidoChart = new ApexCharts(stockVendido,options);
    stockVendidoChart.render();
    stockVendido.myChartInstance = stockVendidoChart;

    const gastosChart = new ApexCharts(gastos,options);
    gastosChart.render();
    gastos.myChartInstance = gastosChart;

    const ingresosChart = new ApexCharts(ingresos,options);
    ingresosChart.render();
    ingresos.myChartInstance = ingresosChart;

    const gananciasChart = new ApexCharts(ganancias,options);
    gananciasChart.render();
    ganancias.myChartInstance = gananciasChart;

    const clientesChart = new ApexCharts(clientes,options);
    clientesChart.render();
    clientes.myChartInstance = clientesChart;

    const proveedoresChart = new ApexCharts(proveedores,options);
    proveedoresChart.render();
    proveedores.myChartInstance = proveedoresChart;

    const ventasChart = new ApexCharts(ventas,options);
    ventasChart.render();
    ventas.myChartInstance = ventasChart;

    const comprasChart = new ApexCharts(compras,options);
    comprasChart.render();
    compras.myChartInstance = comprasChart;

}

function setupStatPickers(){
    const statPickers = document.querySelectorAll('.daily-stat-item');
    statPickers.forEach(picker => {
        picker.addEventListener('click', () => {
            document.querySelectorAll('.stat-graph').forEach(graph => graph.classList.add('hidden'));

            const graphContainerID = picker.dataset.graph + '-container';
            console.log(graphContainerID);

            const containerToShow = document.getElementById(graphContainerID);
            containerToShow.classList.remove('hidden');

        })
    })
}

function populateHourlyGraphs(hourlyStatistics){

    const hours = [];
    const currentHour = new Date().getHours();
    var i;

    for (i = 0; i <= currentHour ; i++){
        hours.push(i + " hs");
    }

    const stockIngresado = document.getElementById('stock-ingresado-graph');
    const stockVendido = document.getElementById('stock-vendido-graph');
    const ventas = document.getElementById('ventas-graph');
    const compras = document.getElementById('compras-graph');
    const gastos = document.getElementById('gastos-graph');
    const ingresos = document.getElementById('ingresos-graph');
    const ganancias = document.getElementById('ganancias-graph');
    const clientes = document.getElementById('clientes-graph');
    const proveedores = document.getElementById('proveedores-graph');

    var options = {
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [{
            data: hourlyStatistics.stock.stockIngresado
        }],
        xaxis: {
            categories: hours
        }
    };

    const stockIngresadoChart = stockIngresado.myChartInstance;
    stockIngresadoChart.updateOptions(options);

    options = {
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [{
            data: hourlyStatistics.stock.stockVendido
        }],
        xaxis: {
            categories: hours
        }
    };
    const stockVendidoChart = stockVendido.myChartInstance;
    stockVendidoChart.updateOptions(options);

    options = {
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [{
            data: hourlyStatistics.monetarias.gastos
        }],
        xaxis: {
            categories: hours
        }
    };
    const gastosChart = gastos.myChartInstance;
    gastosChart.updateOptions(options);

    options = {
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [{
            data: hourlyStatistics.monetarias.ingresos
        }],
        xaxis: {
            categories: hours
        }
    };
    const ingresosChart = ingresos.myChartInstance;
    ingresosChart.updateOptions(options);

    options = {
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [{
            data: hourlyStatistics.monetarias.ganancias
        }],
        xaxis: {
            categories: hours
        }
    };
    const gananciasChart = ganancias.myChartInstance;
    gananciasChart.updateOptions(options);

    options = {
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [{
            data: hourlyStatistics.transacciones.ventasRealizadas
        }],
        xaxis: {
            categories: hours
        }
    };
    const ventasChart = ventas.myChartInstance;
    ventasChart.updateOptions(options);

    options = {
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [{
            data: hourlyStatistics.transacciones.comprasRealizadas
        }],
        xaxis: {
            categories: hours
        }
    };
    const comprasChart = compras.myChartInstance;
    comprasChart.updateOptions(options);

    options = {
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [{
            data: hourlyStatistics.conexiones.nuevosClientes
        }],
        xaxis: {
            categories: hours
        }
    };
    const clientesChart = clientes.myChartInstance;
    clientesChart.updateOptions(options);

    options = {
        chart: {
            type: 'area',
            height: 600,
            width: 500
        },
        series: [{
            data: hourlyStatistics.conexiones.nuevosProveedores
        }],
        xaxis: {
            categories: hours
        }
    };
    const proveedoresChart = proveedores.myChartInstance;
    proveedoresChart.updateOptions(options);
}

function populateGroupedStatistics(stats){
    const stockIngresado = document.getElementById('daily-stock-ingresado');
    const stockVendido = document.getElementById('daily-stock-vendido');
    const gastos = document.getElementById('daily-gastos');
    const ingresos = document.getElementById('daily-ingresos');
    const ganancias = document.getElementById('daily-ganancias');
    const clientes = document.getElementById('daily-clientes');
    const proveedores = document.getElementById('daily-proveedores');
    const ventas = document.getElementById('daily-ventas');
    const compras = document.getElementById('daily-compras');

    stockIngresado.innerHTML = stats.stock.stockIngresado;
    stockVendido.innerHTML = stats.stock.stockVendido;
    gastos.innerHTML = stats.monetarias.gastos;
    ingresos.innerHTML = stats.monetarias.ingresos;
    ganancias.innerHTML = stats.monetarias.ganancias;
    clientes.innerHTML = stats.conexiones.nuevosClientes;
    proveedores.innerHTML = stats.conexiones.nuevosProveedores;
    ventas.innerHTML = stats.transacciones.ventasRealizadas;
    compras.innerHTML = stats.transacciones.comprasRealizadas;
}

function groupHourlyData(hourlyData) {
    var groupedData = {
        conexiones: {
            nuevosClientes: 0,
            nuevosProveedores: 0
        },
        transacciones: {
            ventasRealizadas: 0,
            comprasRealizadas: 0
        },
        stock: {
            stockIngresado: 0,
            stockVendido: 0
        },
        monetarias: {
            gastos: 0,
            ingresos: 0,
            ganancias: 0
        }
    };

    groupedData.conexiones.nuevosClientes = hourlyData.conexiones.nuevosClientes.reduce((acum,valor) => {
        return acum + valor;
    })
    groupedData.conexiones.nuevosProveedores = hourlyData.conexiones.nuevosProveedores.reduce((acum,valor) => {
        return acum + valor;
    })
    groupedData.transacciones.ventasRealizadas = hourlyData.transacciones.ventasRealizadas.reduce((acum,valor) => {
        return acum + valor;
    })
    groupedData.transacciones.comprasRealizadas = hourlyData.transacciones.comprasRealizadas.reduce((acum,valor) => {
        return acum + valor;
    })
    groupedData.stock.stockIngresado = hourlyData.stock.stockIngresado.reduce((acum,valor) => {
        return acum + valor;
    })
    groupedData.stock.stockVendido = hourlyData.stock.stockVendido.reduce((acum,valor) => {
        return acum + valor;
    })
    groupedData.monetarias.gastos = hourlyData.monetarias.gastos.reduce((acum,valor) => {
        return acum + valor;
    })
    groupedData.monetarias.ingresos = hourlyData.monetarias.ingresos.reduce((acum,valor) => {
        return acum + valor;
    })
    groupedData.monetarias.ganancias = hourlyData.monetarias.ganancias.reduce((acum,valor) => {
        return acum + valor;
    })

    return groupedData;
}

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
                updateDailyStatistics(btn.dataset.value);
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





/* ---------------------- FIN DE FUNCIONES DE NANO  ---------------------- */






document.addEventListener('DOMContentLoaded', init);