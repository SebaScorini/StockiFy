// public/assets/js/import.js
import * as api from './api.js';
import { loadTableData } from "./dashboard.js";
import {pop_ups} from "./notifications/pop-up.js";

let modalElement, closeModalBtn, importCancelBtn, dropZone, fileInput, importStatus;
let step1, step2, mappingForm, validatePrepareBtn;
let uploadedFile = null;
let currentStockifyColumns = [];

function setStockifyColumns(columns) {
    currentStockifyColumns = columns;
    // console.log("Columnas de StockiFy actualizadas:", currentStockifyColumns);
}

function openImportModal() {
    if (!modalElement) return;
    modalElement.classList.remove('hidden');
    showStep(1);
    importStatus.textContent = '';
    uploadedFile = null;
    if (fileInput) fileInput.value = '';
}

function closeImportModal() {
    if (!modalElement) return;
    modalElement.classList.add('hidden');
}

function showStep(stepNumber) {
    if (!step1 || !step2 || !validatePrepareBtn) return;
    step1.classList.toggle('hidden', stepNumber !== 1);
    step2.classList.toggle('hidden', stepNumber !== 2);
    validatePrepareBtn.classList.toggle('hidden', stepNumber !== 2);
    if (mappingForm) mappingForm.classList.toggle('hidden', stepNumber !== 2);
}

// --- Manejo de Archivo ---
function handleFileSelect(file) {
    if (!file || !file.type.match('text/csv')) {
        pop_ups.error("Por favor, selecciona un archivo CSV válido.");
        return;
    }
    uploadedFile = file;
    importStatus.textContent = `Archivo: ${file.name}`;
    importStatus.style.color = 'var(--accent-green)';
    fetchHeaders();
}

async function fetchHeaders() {
    if (!uploadedFile) return;
    importStatus.textContent = 'Analizando archivo...';

    const formData = new FormData();
    formData.append('csvFile', uploadedFile);

    try {
        const result = await api.getCsvHeaders(formData);
        if (result.success) {
            populateMappingUI(result.csvHeaders, currentStockifyColumns);
            showStep(2);
            importStatus.textContent = '';
        } else {
            throw new Error(result.message || 'Error al leer el CSV.');
        }
    } catch (error) {
        importStatus.textContent = `Error: ${error.message}`;
        importStatus.style.color = 'var(--accent-red)';
    }
}

// --- Mapeo y Preparación ---

// Función auxiliar para llenar el select (Aquí está la opción VACIAR DATOS)
function generateMappingOptions(select, csvHeaders, dbColumn) {
    select.innerHTML = '';

    // 1. Opción Default
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Ignorar esta columna";
    select.appendChild(defaultOption);

    // 2. Opción Vaciar Datos
    const emptyOption = document.createElement('option');
    emptyOption.value = "__EMPTY__";
    emptyOption.textContent = "Vaciar Datos";
    emptyOption.style.color = 'var(--accent-red)'; // Rojo para destacar
    select.appendChild(emptyOption);

    // 3. Opciones del CSV
    csvHeaders.forEach((header, index) => {
        const option = document.createElement('option');
        // Enviamos el NOMBRE del header, no el índice, para que el backend lo encuentre fácil
        option.value = header;
        option.textContent = header;

        // Auto-match (Fuzzy)
        const normHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normDb = dbColumn.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (normHeader === normDb) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function populateMappingUI(csvHeaders, stockifyColumns) {
    if (!mappingForm) return;
    mappingForm.innerHTML = '';

    // Cabeceras visuales
    mappingForm.insertAdjacentHTML('beforeend', `
        <div style="text-align: left; font-weight: bold; color: var(--color-gray);">Columna CSV</div>
        <div></div> 
        <div style="text-align: left; font-weight: bold; color: var(--color-gray);">Destino StockiFy</div>
    `);

    stockifyColumns.forEach(stockifyCol => {
        // Filtramos columnas de sistema
        if (['id', 'created_at', 'updated_at'].includes(stockifyCol.toLowerCase())) return;

        // Crear Select
        const select = document.createElement('select');
        select.dataset.column = stockifyCol; // Usamos data attribute para identificar
        select.classList.add('mapping-select'); // Clase para buscar luego

        // ¡AQUÍ ESTÁ LA CORRECCIÓN! Usamos la función auxiliar
        generateMappingOptions(select, csvHeaders, stockifyCol);

        const csvColDiv = document.createElement('div');
        csvColDiv.appendChild(select);

        const arrowDiv = document.createElement('div');
        arrowDiv.innerHTML = '<i class="ph ph-arrow-right"></i>';
        arrowDiv.style.textAlign = 'center';
        arrowDiv.style.color = 'var(--accent-color)';

        switch (stockifyCol){
            case 'name':
                stockifyCol = 'Nombre';
                break;
            case 'min_stock':
                stockifyCol = 'Stock Mínimo';
                break;
            case 'sale_price':
                stockifyCol = 'Venta';
                break;
            case 'receipt_price':
                stockifyCol = 'Compra';
                break;
            case 'hard_gain':
                stockifyCol = 'Ganancia';
                break;
            case 'percentage_gain':
                stockifyCol = 'Ganancia (%)';
                break;
            default:
                break;
        }

        const stockifyColDiv = document.createElement('div');
        stockifyColDiv.textContent = stockifyCol.charAt(0).toUpperCase() + stockifyCol.slice(1).replace(/_/g, ' ');
        stockifyColDiv.style.fontWeight = '600';

        mappingForm.appendChild(csvColDiv);
        mappingForm.appendChild(arrowDiv);
        mappingForm.appendChild(stockifyColDiv);
    });

    // Checkbox de Reemplazo (Con la estructura CSS correcta)
    const overwriteHTML = `
        <div style="grid-column: 1 / -1;">
            <div class="checkbox-align-wrapper">
                <input type="checkbox" id="overwrite-data" name="overwrite">
                <label for="overwrite-data">
                    Reemplazar todos los datos existentes
                    <span style="display:block; font-size:0.8em; color:#666; font-weight:400; margin-top:4px;">
                        ⚠ Borrará todo el contenido actual de la tabla antes de importar.
                    </span>
                </label>
            </div>
        </div>
    `;
    mappingForm.insertAdjacentHTML('beforeend', overwriteHTML);
}

// --- Lógica Principal de Envío ---
async function handleValidateAndPrepare(event) {
    event.preventDefault();

    if (!uploadedFile) return;

    validatePrepareBtn.disabled = true;
    validatePrepareBtn.textContent = 'Procesando...';
    importStatus.textContent = 'Subiendo y analizando datos...';

    // 1. Recopilar Mapeo
    const mapping = {};
    document.querySelectorAll('.mapping-select').forEach(select => {
        if (select.value) {
            mapping[select.dataset.column] = select.value;
        }
    });

    // 2. Recopilar Checkbox
    const overwriteCheck = document.getElementById('overwrite-data');
    const overwrite = overwriteCheck ? overwriteCheck.checked : false;

    // 3. Preparar FormData
    const formData = new FormData();
    formData.append('csvFile', uploadedFile); // Nota: PHP espera 'csvFile' (CamelCase)
    formData.append('mapping', JSON.stringify(mapping));
    // Enviamos 'true' o 'false' como texto para que PHP lo entienda fácil
    formData.append('overwrite', overwrite ? 'true' : 'false');

    try {
        // PASO 1: SIEMPRE PREPARAR (Guardar en sesión)
        // Esto valida el CSV y lo deja listo en el servidor
        console.log("Enviando a preparar...");
        const resultPrepare = await api.prepareCsvImport(formData);

        if (!resultPrepare.success) {
            throw new Error(resultPrepare.message);
        }

        console.log("Preparación exitosa. Filas:", resultPrepare.rowCount);

        // PASO 2: DECIDIR QUÉ HACER
        // Si existe esta función, estamos en "Crear DB" -> Solo avisamos y cerramos
        if (typeof window.updateImportStatus === 'function') {
            window.updateImportStatus(`${resultPrepare.rowCount} filas listas para importar.`);
            pop_ups.success("Datos validados correctamente.");
            closeImportModal();
        }
        // Si NO existe, estamos en "Dashboard" -> EJECUTAR INSERCIÓN AHORA
        else {
            importStatus.textContent = 'Insertando en base de datos...';
            const resultExecute = await api.executeImport(); // Llamada sin args, usa la sesión

            if (resultExecute.success) {
                pop_ups.success(resultExecute.message, "Importación Exitosa");
                closeImportModal();
    
                // Recargar tabla
                if (typeof loadTableData === 'function') {
                    await loadTableData();
                    window.location.href = "/StockiFy/dashboard.php";
                } else {
                    window.location.reload();
                }
            } else {
                throw new Error(resultExecute.message);
            }
        }

    } catch (error) {
        console.error(error);
        pop_ups.error(`Error: ${error.message}`, "Fallo en Importación");
        importStatus.textContent = "Error al procesar.";
        importStatus.style.color = 'var(--accent-red)';
    } finally {
        validatePrepareBtn.disabled = false;
        validatePrepareBtn.textContent = 'Importar Datos';
    }
}

// --- Inicialización ---
function initializeImportModal() {
    modalElement = document.getElementById('import-modal');
    closeModalBtn = document.getElementById('close-modal-btn');
    importCancelBtn = document.getElementById('import-cancel-btn');
    dropZone = document.getElementById('drop-zone');
    fileInput = document.getElementById('csv-file-input');
    importStatus = document.getElementById('import-status');
    step1 = document.getElementById('import-step-1');
    step2 = document.getElementById('import-step-2');
    mappingForm = document.getElementById('mapping-form');
    validatePrepareBtn = document.getElementById('validate-prepare-btn');

    if (!modalElement) return;

    modalElement.classList.add('hidden');
    showStep(1);

    closeModalBtn?.addEventListener('click', closeImportModal);
    importCancelBtn?.addEventListener('click', closeImportModal);

    modalElement.addEventListener('click', (event) => {
        if (event.target === modalElement) closeImportModal();
    });

    dropZone?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (event) => {
        if (event.target.files.length > 0) handleFileSelect(event.target.files[0]);
    });

    dropZone?.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
    });

    validatePrepareBtn?.addEventListener('click', handleValidateAndPrepare);
}

export { openImportModal, initializeImportModal, setStockifyColumns };