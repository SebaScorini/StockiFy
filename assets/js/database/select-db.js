// public/assets/js/database/select-db.js
import * as api from '../api.js';
import * as setup from '../setupMiCuentaDropdown.js';

// ---- MANEJADORES ----
async function handleSelectDatabase(event) {
    const target = event.target.closest('button.db-list-item');
    if (!target) return;

    const inventoryId = target.dataset.dbId;
    try {
        await api.selectDatabase(inventoryId);
        window.location.href = '/StockiFy/dashboard.php';
    } catch (error) {
        alert(`Error al seleccionar la base de datos: ${error.message}`);
    }
}

function populateDbList(databases, dbListElement) {
    dbListElement.innerHTML = ''; // Limpiamos la lista
    const container = document.createElement('div');
    container.classList.add('menu-buttons');
    databases.forEach(db => {
        const button = document.createElement('button');
        button.textContent = db.name;
        button.dataset.dbId = db.id;
        button.classList.add('btn', 'btn-secondary', 'db-list-item');
        dbListElement.appendChild(button);
    });
    dbListElement.appendChild(container);
}

// ---- INICIALIZACIÓN ----
async function init() {
    const response = await api.checkUserAdmin();
    if (!response.success){
        alert('Ha ocurrido un error interno. Será deslogeado');
        window.location.href = '/StockiFy/logout.php';
    }
    const isAdmin = response.isAdmin;

    const nav = document.getElementById('header-nav');
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

    const dbList = document.getElementById('db-list');
    if (!dbList) return;

    try {
        const profileData = await api.getUserProfile();
        if (profileData.success && profileData.databases.length > 0) {
            populateDbList(profileData.databases, dbList);
            dbList.addEventListener('click', handleSelectDatabase);
        } else {
            // Si por alguna razón llega aquí sin DBs, lo mando a crear una
            window.location.href = '/StockiFy/create-db.php';
        }
    } catch (error) {
        console.error("Error:", error);
        // Si hay un error de sesión, lo mando al login
        window.location.href = '/StockiFy/index.php';
    }
}

document.addEventListener('DOMContentLoaded', init);