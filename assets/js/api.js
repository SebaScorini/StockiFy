// public/assets/js/api.js
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Error del servidor: ${response.status}`;
        throw new Error(errorMessage);
    }
    return response.json(); // Si todo esta bien, devuelvo el JSON.
}

export async function loginUser(credentials) {
    const response = await fetch('/StockiFy/api/auth/login.php', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
}

export async function registerUser(userData) {
    const response = await fetch('/StockiFy/api/auth/register.php', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
}

export async function checkSessionStatus() {
    try {
        const response = await fetch('/StockiFy/api/auth/check-session.php');
        if (!response.ok) return false;
        const data = await response.json();
        return data.isLoggedIn;
    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        return false;
    }
}

export async function getDatabases() {
    const response = await fetch('/StockiFy/api/database/list');
    if (!response.ok) throw new Error('Error al conectar con el servidor.');
    return await response.json();
}

export async function selectDatabase(inventoryId) {
    const response = await fetch('/StockiFy/api/database/select.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryId }),
    });
    return handleResponse(response);
}


export async function getTableData() {
    const response = await fetch('/StockiFy/api/table/get.php');
    return handleResponse(response);
}


// --- FUNCIONES DEL PERFIL DE USUARIO ---
export async function getUserProfile() {
    const response = await fetch('/StockiFy/api/user/profile.php');
    return handleResponse(response);
}


//CODIGO DE NANO. AGREGUÉ EL CAMPO "preferences" CON LAS PREFERENCIAS Y DEFAULTS DEL USUARIO
//PARA LAS COLUMNAS RECOMENDADAS

export async function createDatabase(dbName, columns, preferences) {
    const requestBody = { dbName, columns, preferences };
    const response = await fetch('/StockiFy/api/database/create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });
    return handleResponse(response);
}

/**
 * Uploads a CSV file to get its headers and the target StockiFy columns.
 * @param {FormData} formData - The FormData object containing the 'csvFile'.
 * @returns {Promise<object>} Object with { success: bool, csvHeaders: [], stockifyColumns: [] }
 */
export async function getCsvHeaders(formData) {
    const response = await fetch('/StockiFy/api/import/get-csv-headers.php', {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed for FormData;
    });
    return handleResponse(response);
}

/**
 * Envía el archivo CSV y el mapeo para ser procesados y guardados en sesión.
 * @param {FormData} formData - FormData con 'csvFile', 'mapping' (JSON string), 'overwrite' (string 'true'/'false').
 * @returns {Promise<object>} Resultado de la preparación.
 */
export async function prepareCsvImport(formData) {
    const response = await fetch('/StockiFy/api/import/prepare-csv.php', {
        method: 'POST',
        body: formData,
    });
    return handleResponse(response);
}

// --- FUNCIONES DE STOCK ---
/**
 * Actualiza el stock de un item específico.
 * @param {number} itemId El ID del item a actualizar.
 * @param {string} action La acción a realizar: 'set', 'add', 'remove'.
 * @param {number} value El valor para 'set' o la cantidad para 'add'/'remove'.
 * @returns {Promise<object>} Objeto con { success: bool, newStock: number } o un error.
 */
export async function updateStock(itemId, action, value) {
    const response = await fetch('/StockiFy/api/stock/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action, value }),
    });
    return handleResponse(response);
}

/**
 * Añade una nueva fila de datos a la tabla activa.
 * @param {object} itemData - Objeto con { columna: valor, ... } para la nueva fila.
 * @returns {Promise<object>} Objeto con { success: bool, newItem: object } o un error.
 */
export async function addItemToTable(itemData) {
    const response = await fetch('/StockiFy/api/table/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
    });
    return handleResponse(response);
}



/**
 * Elimina la base de datos (inventario) activa actualmente en la sesión.
 * @returns {Promise<object>} Objeto con { success: bool, message: string }
 */
export async function deleteDatabase() {
    // No necesita body, el backend usa la sesión
    const response = await fetch('/StockiFy/api/database/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

// ---                        FUNCIONES DE NANO                               ---

// --- Funciones de estadistica

export async function updateStatistics(tableID, dates) {
    const response = await fetch('/StockiFy/api/statistics/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({tableID, dates}),
    });
    return handleResponse(response);
}

export async function getDailyStatistics(tableID){
    const response = await fetch('/StockiFy/api/statistics/update-daily.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({tableID}),
    });
    return handleResponse(response);
}

export async function getOrderedClients(){
    const response = await fetch('/StockiFy/api/customers/get-ordered-customers.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function getAllClients(){
    const response = await fetch('/StockiFy/api/customers/get-all-customers.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function createClient(client){
    const response = await fetch('/StockiFy/api/customers/create-customer.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({client}),
    });
    return handleResponse(response);
}

export async function getAllProviders(){
    const response = await fetch('/StockiFy/api/providers/get-all.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function getOrderedProviders(){
    const response = await fetch('/StockiFy/api/providers/get-ordered.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function createProvider(provider){
    const response = await fetch('/StockiFy/api/providers/create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({provider}),
    });
    return handleResponse(response);
}

export async function sendSaleEmail(emailInfo){
    const response = await fetch('/StockiFy/api/sales/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({emailInfo}),
    });
    return handleResponse(response);
}

export async function getCustomerById(id){
    const response = await fetch('/StockiFy/api/customers/get-by-id.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id}),
    });
    return handleResponse(response);
}

export async function createSale(saleInfo){
    const response = await fetch('/StockiFy/api/sales/create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleInfo),
    });
    return handleResponse(response);
}

export async function createReceipt(receiptInfo){
    const response = await fetch('/StockiFy/api/receipts/create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptInfo),
    });
    return handleResponse(response);
}

export async function getAllProducts(){
    const response = await fetch('/StockiFy/api/products/get-all.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function getSaleItemlist(saleId){
    const response = await fetch('/StockiFy/api/sales/get-product-list.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleId),
    });
    return handleResponse(response);
}

export async function getReceiptItemlist(receiptId){
    const response = await fetch('/StockiFy/api/receipts/get-product-list.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptId),
    });
    return handleResponse(response);
}

export async function getUserSales(){
    const response = await fetch('/StockiFy/api/sales/get-user-sales.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function getUserReceipts(){
    const response = await fetch('/StockiFy/api/receipts/get-user-receipts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function getCurrentInventoryPreferences(){
    const response = await fetch('/StockiFy/api/database/get-preferences-current.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function getCurrentInventoryDefaults(){
    const response = await fetch('/StockiFy/api/database/get-defaults-current.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function setCurrentInventoryPreferences(preferences){
    const response = await fetch('/StockiFy/api/database/set-preferences-current.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
    });
    return response;
}

export async function getUserVerifiedTables(){
    const response = await fetch('/StockiFy/api/database/get-verified-tables.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export async function getTableProducts(table){
    const response = await fetch('/StockiFy/api/products/get-all-from-table.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(table),
    });
    return handleResponse(response);
}

export async function getFullSaleInfo(saleID){
    const response = await fetch('/StockiFy/api/sales/get-info.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleID),
    });
    return handleResponse(response);
}

export async function getProductData(productID,tableID){
    const response = await fetch('/StockiFy/api/products/get-product-data.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({productID,tableID}),
    });
    return handleResponse(response);
}

export async function updateSaleList(productList){
    const response = await fetch('/StockiFy/api/sales/update-product-list.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productList),
    });
    return handleResponse(response);
}

export async function updateRececiptList(productList){
    const response = await fetch('/StockiFy/api/receipts/update-product-list.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productList),
    });
    return handleResponse(response);
}

export async function getFullReceiptInfo(receiptID){
    const response = await fetch('/StockiFy/api/receipts/get-info.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptID),
    });
    return handleResponse(response);
}

export async function getProdivderById(id){
    const response = await fetch('/StockiFy/api/providers/get-by-id.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id}),
    });
    return handleResponse(response);
}

export async function updateCustomer(customer){
    const response = await fetch('/StockiFy/api/customers/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
    })
    return handleResponse(response);
}


export async function updateProvider(provider){
    const response = await fetch('/StockiFy/api/providers/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider),
    })
    return handleResponse(response);
}

export async function verifyPassword(newPass,passwordHash){
    const response = await fetch('/StockiFy/api/auth/verify-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({newPass,passwordHash}),
    })
    return handleResponse(response);
}

export async function verifyUserName(userName){
    const response = await fetch('/StockiFy/api/auth/verify-username.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userName),
    })
    return handleResponse(response);
}

export async function updateUser(userData){
    const response = await fetch('/StockiFy/api/user/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    })
    return handleResponse(response);
}

export async function verifyEmail(email){
    const response = await fetch('/StockiFy/api/auth/verify-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email),
    })
    return handleResponse(response);
}

export async function checkUserAdmin(){
    const response = await fetch('/StockiFy/api/auth/check-admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse(response);
}

export async function registerContactForm(contactData){
    const response = await fetch('/StockiFy/api/contact/register-contact-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
    })
    return handleResponse(response);
}

export async function checkDbName(dbName){
    const response = await fetch('/StockiFy/api/database/check-name.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbName),
    })
    return handleResponse(response);
}

export async function updateTableRow(itemId, dataToUpdate) {
    const response = await fetch('/api/table/update-row.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, dataToUpdate }),
    });
    return handleResponse(response);
}

export async function getCsvHeaders(formData) {
    const response = await fetch('api/import/get-csv-headers.php', {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

export async function prepareCsvImport(formData) {
    const response = await fetch('api/import/prepare-csv.php', {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

export async function executeImport() {
    const response = await fetch('api/import/execute-import.php', {
        method: 'POST'
    });
    return await response.json();
}

/* ---------------------- FIN DE FUNCIONES DE NANO  ---------------------- */