// public/assets/js/database/create-db.js
import * as api from '../api.js';
// Importamos funciones específicas del modal
import { openImportModal, initializeImportModal } from '../import.js';
import * as setup from "../setupMiCuentaDropdown.js";

const protectedNames = ['stock','nombre','min_stock','stockmínimo','preciodeventa','preciodecompra', 'margendeganancia',
    'stockminimo','name','sale_price','receipt_price','hard_gain','percentage_gain'];

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializa el modal (busca sus elementos)
    //initializeImportModal();

    await checkUserStatus();
    const nav = document.getElementById('header-nav');
    const response = await api.checkUserAdmin();
    if (!response.success){
        alert('Ha ocurrido un error interno. Será deslogeado');
        window.location.href = '/StockiFy/logout.php';
    }
    const isAdmin = response.isAdmin;

    if (nav) nav.innerHTML = `<a href="/StockiFy/estadisticas.php" class="btn btn-secondary">Estadisticas</a>
                                   <div id="dropdown-container">
                <div class="btn btn-secondary" id="mi-cuenta-btn">Mi Cuenta</div>
                <div class="flex-column hidden" id="mi-cuenta-dropdown">
                    <a href="/StockiFy/configuracion.php" class="btn btn-secondary">Configuración</a>
                    <a href="/StockiFy/logout.php" class="btn btn-secondary">Cerrar Sesión</a>
                    ${isAdmin ? `<a href="/StockiFy/registros.php" class="btn btn-primary">Admin</a>` : ''}  
                </div>
            </div>   
                           `;

    setup.setupMiCuenta();
    prepareRecomendedColumns();


    const createDbForm = document.getElementById('createDbForm');
    const messageDiv = document.getElementById('message');
    //const prepareImportBtn = document.getElementById('prepare-import-btn');
    //const importStatusDiv = document.getElementById('import-prepared-status'); // Para mostrar si los datos están listos

    const addRowBtn = document.getElementById('add-row-btn');
    addRowBtn.addEventListener('click', handleAddRow);

    const userList = document.getElementById('user-column-list');

    // --- CÓDIGO PARA BLOQUEAR COMAS ---
    userList.addEventListener('input', (event) => {
        if (event.target.classList.contains('user-column')) {
            event.target.value = event.target.value.replace(/,/g, '');
        }
    });
    if (!createDbForm) return;
/*
    // --- Event Listener para ABRIR EL MODAL ---
    prepareImportBtn.addEventListener('click', () => {
        // Antes de abrir, podríamos pasarle las columnas actuales al modal si es necesario
        openImportModal();
    });*/

    // --- Event Listener para el ENVÍO FINAL ---
    createDbForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Detenemos el envío normal


        //CODIGO DE NANO, CONSIGO LAS PREFERENCIAS DEL USUARIO
        const preferences = getUserPreferences();

        const dbName = document.getElementById('dbNameInput').value.trim();
        const columnInputs = userList.querySelectorAll('.user-column');
        let columnList = [];
        const submitButton = createDbForm.querySelector('button[type="submit"]');

        columnInputs.forEach(input => {
            if (input.classList.contains('invalid-row')) return;

            const value = input.value.trim().replace(/,/g, '').toLowerCase().replace(/ /g, '');
            columnList.push(value);
        })

        const columns = columnList.join(',');

        if (!dbName) {
            messageDiv.textContent = 'Por favor, completa el nombre y las columnas.';
            return;
        }

        const response = await api.checkDbName(dbName);
        if (!response.success){
            messageDiv.textContent = 'Ha ocurrido un error interno';
            return;
        }

        if (response.exists){
            messageDiv.textContent = 'Ya existe una base de datos registrada con ese nombre';
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Creando...';
        messageDiv.textContent = '';

        try {
            const result = await api.createDatabase(dbName, columns, preferences);

            if (result.success) {
                messageDiv.textContent = result.message + "\nSerás redirigido al panel.";
                window.location.href = '/StockiFy/dashboard.php';
            } else {
                messageDiv.textContent = `Error: ${result.message}`;
            }
        } catch (error) {
            // Si hay un error de red o un 500
            messageDiv.textContent = `Error: ${error.message}`;
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Crear Base de Datos';
        }
    });
/*
    // Función global para que import.js pueda actualizar el estado
    window.updateImportStatus = (message) => {
        if(importStatusDiv) {
            importStatusDiv.textContent = message;
            prepareImportBtn.textContent = "Modificar Importación CSV";
        }
    }*/
});

async function checkUserStatus(){
    try {
        const profileData = await api.getUserProfile();
        if (!profileData.success) {
            window.location.href = '/StockiFy/index.php';
        }
    } catch (error) {
        console.error("Error:", error);
        // Si hay un error de sesión, lo mando al login
        window.location.href = '/StockiFy/index.php';
    }
}

/* ---------------------- FUNCIONES DE NANO  ---------------------- */


function prepareRecomendedColumns(){
    const columnsContainer = document.getElementById('recomended-columns-form');
    const openColumnasRecomendadasBtn = document.getElementById('open-columnas-recomendadas-btn');

    openColumnasRecomendadasBtn.addEventListener('click', () => {
        columnsContainer.classList.toggle('visible');
        openColumnasRecomendadasBtn.classList.toggle('is-rotated');
    })

    const gainCheckbox = document.getElementById('gain-input');
    const minStockCheckbox = document.getElementById('min-stock-input');
    const salePriceCheckbox = document.getElementById('sale-price-input');
    const receiptPriceCheckbox = document.getElementById('receipt-price-input');

    const autoPriceCheckbox = document.getElementById('auto-price-input');
    const autoIvaRadio = document.getElementById('auto-iva-input');
    const autoGainRadio = document.getElementById('auto-gain-input');
    const autoIvaGainRadio = document.getElementById('auto-iva-gain-input');

    const autoPriceTypeContainer = document.getElementById('auto-price-type-container');
    const autoPriceLabel = document.getElementById('auto-price-checkbox');

    function updateMinStockInput() {
        const isChecked = minStockCheckbox.checked;
        const defaultInput = document.getElementById('min-stock-default-input');

        defaultInput.disabled = !isChecked;

        if (!isChecked) {
            defaultInput.value = "";
            defaultInput.classList.remove('visible');
        }
        else{
            defaultInput.classList.add('visible');
        }
    }

    function updateSalePriceInput() {
        const isChecked = salePriceCheckbox.checked;
        const defaultInput = document.getElementById('sale-price-default-input');

        defaultInput.disabled = !isChecked;

        if (!isChecked) {
            defaultInput.value = "";
            defaultInput.classList.remove('visible');
            autoPriceCheckbox.checked = false;
            autoIvaRadio.checked = false;
            autoGainRadio.checked = false;
            autoIvaGainRadio.checked = false;
            autoPriceLabel.classList.remove('visible');
            autoPriceTypeContainer.classList.remove('visible');
        }
        else{
            defaultInput.classList.add('visible');
        }
        updateReceiptPriceInput();
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
            autoPriceCheckbox.disabled = true;
            autoPriceTypeContainer.classList.remove('visible');
        }
        else{
            defaultInput.classList.add('visible');
            if (salePriceCheckbox.checked){
                autoPriceLabel.classList.add('visible');
                autoPriceCheckbox.disabled = false;
            }
        }
        updateAutoPrice();
    }

    function updateGainInput() {
        const isChecked = gainCheckbox.checked;
        const defaultInput = document.getElementById('gain-default-input');

        const percentageRadio = document.getElementById('percentage-gain-input');
        const hardRadio = document.getElementById('hard-gain-input');
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
            percentageRadio.checked = true;
            hardRadio.checked = false;
            defaultInput.classList.add('visible');
            gainTypeContainer.classList.add('visible');
            autoIvaRadio.checked = true;
            autoGainRadio.checked = false;
            autoIvaGainRadio.checked = false;
        }
        updateAutoPrice();
    }

    function updateAutoPrice(){
        const isChecked = autoPriceCheckbox.checked;

        if (!isChecked){
            autoIvaRadio.checked = false;
            autoGainRadio.checked = false;
            autoIvaGainRadio.checked = false;
            autoGainRadio.disabled = true;
            autoIvaGainRadio.disabled = true;
            autoGainRadio.disabled = true;
            autoPriceTypeContainer.classList.remove('visible');
        }
        else{
            autoPriceTypeContainer.classList.add('visible');
            autoIvaRadio.checked = true;
            autoGainRadio.checked = false;
            autoIvaGainRadio.checked = false;

            if (!gainCheckbox.checked){
                autoGainRadio.disabled = true;
                autoIvaGainRadio.disabled = true;
            }
            else{
                autoGainRadio.disabled = false;
                autoIvaGainRadio.disabled = false;
            }
        }
    }

    gainCheckbox.addEventListener('change', updateGainInput);
    minStockCheckbox.addEventListener('change', updateMinStockInput);
    salePriceCheckbox.addEventListener('change', updateSalePriceInput);
    receiptPriceCheckbox.addEventListener('change', updateReceiptPriceInput);
    autoPriceCheckbox.addEventListener('change', updateAutoPrice);

    updateGainInput();
    updateMinStockInput();
    updateSalePriceInput();
    updateReceiptPriceInput();
    updateAutoPrice();
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
function handleAddRow(){
    const userList = document.getElementById('user-column-list');
    const newRow = document.createElement('div');
    newRow.classList.add('flex-column');
    newRow.classList.add('user-column-row');
    newRow.style.gap = '5px';
    newRow.innerHTML = `<div class="warning-msg" style="font-size: 10px; width: 100%"></div>
                        <div class="flex-row all-center">
                        <input type="text" class="user-column" placeholder="SKU, Color, Talle, Fecha de Vencimiento" required>
                        <div class="btn btn-secondary delete-row-btn" style="width: fit-content; height:fit-content; background-color: rgba(211,116,116,0.71); 
                        margin: 0; padding: 10px;">Borrar</div>
                        </div>`;

    const newDeleteBtn = newRow.querySelector('.delete-row-btn');
    const newColumnInput = newRow.querySelector('.user-column');
    const warningMsg = newRow.querySelector('.warning-msg');

    newColumnInput.addEventListener('input', () => checkRowValidity(newRow,newColumnInput,warningMsg));

    newDeleteBtn.addEventListener('click', () => handleDeleteRow(newDeleteBtn));
    userList.appendChild(newRow);
}

function handleDeleteRow(btn){
    const row = btn.closest('.user-column-row');
    row.remove();
}

function checkRowValidity(row,input,warningMsg){
    const value = input.value;
    const cleanValue = value.trim().toLowerCase().replace(/ /g, '').replace(/,/g, '');
    for (const name of protectedNames){
        if (cleanValue === name){
            warningMsg.innerHTML = 'Esta columna será ignorada ya que tiene el nombre de una columna interna/recomendada';
            input.classList.add('invalid-row');
            break;
        }
        else{
            warningMsg.innerHTML = '';
            input.classList.remove('invalid-row');
        }
    }
}

/* ---------------------- FIN DE FUNCIONES DE NANO  ---------------------- */