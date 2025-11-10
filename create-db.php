<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear Base de Datos - StockiFy</title>
    <base href="/StockiFy/">
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/auth.css">
    <script src="assets/js/theme.js"></script>
</head>
<body>

<header>
    <a href="index.php" id="header-logo">
        <img src="assets/img/LogoE.png" alt="StockiFy Logo">
    </a>
    <nav id="header-nav">
    </nav>
</header>

<div class="auth-wrapper">
    <div class="auth-form-container"> <div class="auth-header">
            <h1>Nueva Base de Datos</h1>
            <p>Define la estructura y, opcionalmente, importa datos.</p>
        </div>

        <form id="createDbForm" class="auth-form">

            <div class="form-group">
                <label for="dbNameInput">Nombre de la Base de Datos:</label>
                <input type="text" id="dbNameInput" name="dbName" placeholder="Ej: Inventario Principal" required>
            </div>


            <h2>Columnas Recomendadas</h2>

            <div class="form-group flex-column" style="align-items: start;">
                <div class="flex-row">
                    <input type="checkbox" id="min-stock-input" name="min-stock" value="0">
                    <h4 style="height: fit-content;">Stock Mínimo</h4>
                </div>
                <input style="width: 180px; justify-self: right;" type="text" id="min-stock-default-input" name="min-stock-default" placeholder="Valor por Defecto (0)">
            </div>
            <div class="form-group flex-column" style="align-items: start;">
                <div class="flex-row">
                    <input type="checkbox" id="sale-price-input" name="sale-price" value="0">
                    <h4 style="height: fit-content;">Precio de Venta</h4>
                </div>
                <input style="width: 180px; justify-self: right;" type="text" id="sale-price-default-input" name="sale-price-default" placeholder="Valor por Defecto (0)">
            </div>
            <div class="form-group flex-column" style="align-items: start;">
                <div class="flex-row">
                    <input type="checkbox" id="receipt-price-input" name="receipt-price" value="0">
                    <h4 style="height: fit-content;">Precio de Compra</h4>
                </div>
                <input style="width: 180px; justify-self: right;" type="text" id="receipt-price-default-input" name="receipt-price-default" placeholder="Valor por Defecto (0)">
            </div>
            <div class="form-group flex-column" style="align-items: start;">
                <div class="flex-row">
                    <input type="checkbox" id="gain-input" name="gain" value="0">
                    <h4 style="height: fit-content;">Margen de Ganancia</h4>
                </div>
                <div class="flex-row">
                    <input style="width: 180px; justify-self: right;" type="text" id="gain-default-input" name="gain-default" placeholder="Valor por Defecto (0)">
                    <div class="form-group flex-column" style="align-items: start;">
                        <div class="flex-row">
                            <input type="radio" id="percentage-gain-input" name="gain-type" value="0">
                            <p>Porcentaje</p>
                        </div>
                        <div class="flex-row">
                            <input type="radio" id="hard-gain-input" name="gain-type" value="0">
                            <p>Valor Fijo</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="columnsInput">Nombres de las Columnas (separados por coma):</label>
                <textarea id="columnsInput" name="columns" rows="3" placeholder="Ej: SKU, Producto, Precio, Cantidad"></textarea>
                <small style="color: var(--color-gray); display: block; margin-top: 5px;">Podrás importar datos para estas columnas más adelante.</small>
            </div>

            <hr> <div class="form-group">
                <label>Importar Datos (Opcional):</label>
                <button type="button" id="prepare-import-btn" class="btn btn-secondary">Preparar Importación desde CSV</button>
                <div id="import-prepared-status" style="margin-top: 10px; color: green); font-weight: 500;"></div>
            </div>

            <div id="message" style="margin-top: 1rem; color: red);"></div>

            <button type="submit" class="btn btn-primary">Crear Base de Datos</button>

        </form>
    </div>
</div>

<div id="import-modal" class="modal-overlay hidden">
    <div class="modal-content view-container">
        <button id="close-modal-btn" class="modal-close-btn">&times;</button>
        <div class="modal-header">
            <h2>Importar Datos desde CSV</h2>
            <p>Selecciona o arrastra tu archivo CSV.</p>
        </div>
        <div class="modal-body">
            <div id="import-step-1">
                <div id="drop-zone" class="drop-zone">
                    <p>Arrastra tu archivo CSV aquí o haz clic para seleccionar</p>
                    <input type="file" id="csv-file-input" accept=".csv" style="display: none;">
                </div>
                <div id="import-status" style="margin-top: 1rem;"></div>
            </div>
            <div id="import-step-2" class="hidden">
                <h3>Mapea las Columnas</h3>
                <p>Asigna las columnas de tu archivo a las de StockiFy.</p>
                <form id="mapping-form" style="max-height: 40vh; overflow-y: auto; padding-right: 10px;"></form>
            </div>
        </div>
        <div class="modal-footer">
            <button id="import-cancel-btn" class="btn btn-secondary">Cancelar</button>
            <button id="validate-prepare-btn" class="btn btn-primary hidden">Validar y Preparar Datos</button>
        </div>
    </div>
</div>


<script type="module" src="assets/js/database/create-db.js"></script>
<script type="module" src="assets/js/import.js"></script>
<script type="module" src="assets/js/api.js"></script>
</body>
</html>