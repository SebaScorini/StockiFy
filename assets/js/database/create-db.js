// public/assets/js/database/create-db.js
import * as api from '../api.js';
// Importamos funciones específicas del modal
import { openImportModal, initializeImportModal } from '../import.js';
import * as setup from "../setupMiCuentaDropdown.js";

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa el modal (busca sus elementos)
    initializeImportModal();

    checkUserStatus();
    const nav = document.getElementById('header-nav');
    if (nav) nav.innerHTML = `<a href="/StockiFy/estadisticas.php" class="btn btn-secondary">Estadisticas</a>
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
    prepareRecomendedColumns();


    const createDbForm = document.getElementById('createDbForm');
    const messageDiv = document.getElementById('message');
    const prepareImportBtn = document.getElementById('prepare-import-btn');
    const importStatusDiv = document.getElementById('import-prepared-status'); // Para mostrar si los datos están listos

    if (!createDbForm || !prepareImportBtn) return;

    // --- Event Listener para ABRIR EL MODAL ---
    prepareImportBtn.addEventListener('click', () => {
        // Antes de abrir, podríamos pasarle las columnas actuales al modal si es necesario
        openImportModal();
    });

    // --- Event Listener para el ENVÍO FINAL ---
    createDbForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Detenemos el envío normal


        const preferences = getUserPreferences();

        const dbName = document.getElementById('dbNameInput').value.trim();
        const columns = document.getElementById('columnsInput').value.trim();
        const submitButton = createDbForm.querySelector('button[type="submit"]');

        console.log(dbName);

        if (!dbName) {
            messageDiv.textContent = 'Por favor, completa el nombre y las columnas.';
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

    // Función global para que import.js pueda actualizar el estado
    window.updateImportStatus = (message) => {
        if(importStatusDiv) {
            importStatusDiv.textContent = message;
            prepareImportBtn.textContent = "Modificar Importación CSV";
        }
    }
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

function prepareRecomendedColumns(){
    const gainCheckbox = document.getElementById('gain-input');
    const minStockCheckbox = document.getElementById('min-stock-input');
    const salePriceCheckbox = document.getElementById('sale-price-input');
    const receiptPriceCheckbox = document.getElementById('receipt-price-input');

    const percentageRadio = document.getElementById('percentage-gain-input');
    const hardRadio = document.getElementById('hard-gain-input');

    percentageRadio.addEventListener('change', updatePercentageRadio);
    hardRadio.addEventListener('change', updateHardRadio);
    function updatePercentageRadio() {
        percentageRadio.value = 1;
        percentageRadio.checked = true;
        hardRadio.value = 0;
        hardRadio.checked = false;
    }

    function updateHardRadio(){
        hardRadio.value = 1;
        hardRadio.checked = true;
        percentageRadio.value = 0;
        percentageRadio.checked = false;
    }

    function updateMinStockInput() {
        const isChecked = minStockCheckbox.checked;
        const defaultInput = document.getElementById('min-stock-default-input');

        defaultInput.disabled = !isChecked;

        minStockCheckbox.value = isChecked ? "1" : "0";

        if (!isChecked) {
            defaultInput.value = "";
        }
    }

    function updateSalePriceInput() {
        const isChecked = salePriceCheckbox.checked;
        const defaultInput = document.getElementById('sale-price-default-input');

        defaultInput.disabled = !isChecked;

        salePriceCheckbox.value = isChecked ? "1" : "0";

        if (!isChecked) {
            defaultInput.value = "";
        }
    }

    function updateReceiptPriceInput() {
        const isChecked = receiptPriceCheckbox.checked;
        const defaultInput = document.getElementById('receipt-price-default-input');

        defaultInput.disabled = !isChecked;

        receiptPriceCheckbox.value = isChecked ? "1" : "0";

        if (!isChecked) {
            defaultInput.value = "";
        }
    }

    function updateGainInput() {
        const isChecked = gainCheckbox.checked;
        const defaultInput = document.getElementById('gain-default-input');

        const percentageRadio = document.getElementById('percentage-gain-input');
        const hardRadio = document.getElementById('hard-gain-input');

        percentageRadio.disabled = !isChecked;
        hardRadio.disabled = !isChecked;
        defaultInput.disabled = !isChecked;

        gainCheckbox.value = isChecked ? "1" : "0";

        if (isChecked) {
            percentageRadio.checked = true;
            percentageRadio.value = "1";
            hardRadio.checked = false;
            hardRadio.value = "0";
        } else {
            percentageRadio.checked = false;
            hardRadio.checked = false;
            percentageRadio.value = "0";
            hardRadio.value = "0";
            defaultInput.value = "";
        }
    }

    updateGainInput();
    updateMinStockInput();
    updateSalePriceInput();
    updateReceiptPriceInput();

    gainCheckbox.addEventListener('change', updateGainInput);
    minStockCheckbox.addEventListener('change', updateMinStockInput);
    salePriceCheckbox.addEventListener('change', updateSalePriceInput);
    receiptPriceCheckbox.addEventListener('change', updateReceiptPriceInput);
}

function getUserPreferences(){
    const minStockCheckbox = document.getElementById('min-stock-input');
    const salePriceCheckbox = document.getElementById('sale-price-input');
    const receiptPriceCheckbox = document.getElementById('receipt-price-input');
    const percentageRadio = document.getElementById('percentage-gain-input');
    const hardRadio = document.getElementById('hard-gain-input');

    const gainDefaultInput = document.getElementById('gain-default-input');
    const minStockDefaultInput = document.getElementById('min-stock-default-input');
    const salePriceDefaultInput = document.getElementById('sale-price-default-input');
    const receiptPriceDefaultInput = document.getElementById('receipt-price-default-input');

    const gainDefault = (gainDefaultInput.value === '') ? 0 : parseFloat(gainDefaultInput.value);
    const minStockDefault = (minStockDefaultInput.value === '') ? 0 : parseFloat(minStockDefaultInput.value);
    const salePriceDefault = (salePriceDefaultInput.value === '') ? 0 : parseFloat(salePriceDefaultInput.value);
    const receiptPriceDefault = (receiptPriceDefaultInput.value === '') ? 0 : parseFloat(receiptPriceDefaultInput.value);


    const preferences = {
        min_stock: {active: parseInt(minStockCheckbox.value,10), default: minStockDefault},
        sale_price: {active: parseInt(salePriceCheckbox.value,10), default: salePriceDefault},
        receipt_price: {active: parseInt(receiptPriceCheckbox.value,10), default: receiptPriceDefault},
        percentage_gain: {active: parseInt(percentageRadio.value,10), default: gainDefault},
        hard_gain: {active: parseInt(hardRadio.value,10), default: gainDefault}
    }

    return preferences;
}