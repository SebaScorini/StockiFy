// public/assets/js/main.js

import * as api from './api.js';
import * as setup from './setupMiCuentaDropdown.js';

function showView(viewId) {
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.add('hidden');
    });
    const viewToShow = document.getElementById(viewId);
    if (viewToShow) {
        viewToShow.classList.remove('hidden');
    }
}

async function checkInitialState() {
    try {
        const profileData = await api.getUserProfile();
        if (!profileData.success) throw new Error('Sesión inválida.');
        const activeInventoryId = profileData.activeInventoryId;

        if (activeInventoryId) {
            const activeDbNameEl = document.getElementById('active-db-name');
            if(activeDbNameEl) {
                //MOSTRAR VIEW "IR AL DASHBOARD"
                const activeInventory = profileData.databases.find(db => db.id == activeInventoryId);
                activeDbNameEl.textContent = activeInventory ? activeInventory.name : 'Desconocido';
            }
            showView('dashboard-view');
        } else if (profileData.databases && profileData.databases.length > 0) {
            //MOSTRAR VIEW "ELEGIR INVENTARIO"
            showView('select-db-view');
        } else {
            //MOSTRAR VIEW "CREAR DATABASE"
            showView('empty-state-view');
        }
    } catch (error) {
        console.error("Error al cargar el estado inicial:", error);
        alert("Hubo un error al cargar tus datos. Serás redirigido.");
        window.location.href = '/StockiFy/logout.php';
    }
}


function setupHeader(isLoggedIn) {
    const nav = document.getElementById('header-nav');
    if (!nav) return;

    if (isLoggedIn) {
        nav.innerHTML = `
            <a href="/StockiFy/dashboard.php" class="btn btn-primary">Ir al Panel</a> 
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
    } else {
        nav.innerHTML = `
            <a href="/StockiFy/login.php" class="btn btn-secondary">Iniciar Sesión</a>
            <a href="/StockiFy/register.php" class="btn btn-primary">Registrarse</a>
        `;
    }
}

async function handleCreateDatabase() {
    const dbNameInput = document.getElementById('dbNameInput');
    const columnsInput = document.getElementById('columnsInput');
    if (!dbNameInput || !columnsInput) return;

    const dbName = dbNameInput.value.trim();
    const columns = columnsInput.value.trim();

    if (!dbName || !columns) {
        alert('Por favor, completa el nombre y las columnas.');
        return;
    }

    try {
        const result = await api.createDatabase(dbName, columns);
        if (result.success) {
            alert(result.message);
            await checkInitialState();
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

function initializeEventListeners() {
    const createDbBtn = document.getElementById('createDbBtn');
    if (createDbBtn) {
        createDbBtn.addEventListener('click', handleCreateDatabase);
    }
}

async function init() {
    const isLoggedIn = await api.checkSessionStatus();
    setupHeader(isLoggedIn);

    if (isLoggedIn) {
        initializeEventListeners();
        await checkInitialState();
    } else {
        showView('welcome-view');
    }
}

document.addEventListener('DOMContentLoaded', init);

