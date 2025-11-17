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

<?php
    require_once __DIR__ . '/vendor/autoload.php';
    require_once __DIR__ . '/auth_helper.php';
    $currentUser = getCurrentUser();

    if (!isset($_SESSION['user_id'])){
    header("Location: login.php");
    }
?>

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

            <div style="border: var(--border-strong); border-radius: var(--border-radius); padding 0 5px;">
                <div class="flex-row" style="width: 100%; align-items: center; justify-content: space-between; padding: 10px">
                    <h5>Columnas Recomendadas</h5>
                    <img src="./assets/img/arrow-pointing-down.png" alt="Flecha para abir o cerrar menú de dropdown." id="open-columnas-recomendadas-btn" style="height: 30px; padding: 10px">
                </div>
                <div id="recomended-columns-form" style="padding-top: 0">
                    <div class="form-group flex-column recomended-column-group">
                        <input type="checkbox" class="hidden-checkbox" id="min-stock-input" name="min-stock" value="0">
                        <label for="min-stock-input" class="btn btn-secondary btn-checkbox-toggle" style="font-size: 13px;">
                            Stock Mínimo
                        </label>
                        <input style="width: 180px;" class="default-value-input" type="text" id="min-stock-default-input" name="min-stock-default" placeholder="Valor por Defecto (0)">
                    </div>
                    <div class="form-group flex-column recomended-column-group">
                        <input type="checkbox" class="hidden-checkbox" id="receipt-price-input" name="receipt-price" value="0">
                        <label for="receipt-price-input" class="btn btn-secondary btn-checkbox-toggle" style="font-size: 13px;">
                            Precio de Compra
                        </label>
                        <input style="width: 180px;" class="default-value-input" type="text" id="receipt-price-default-input" name="receipt-price-default" placeholder="Valor por Defecto (0)">
                    </div>
                    <div class="form-group flex-column recomended-column-group">
                        <div class="flex-column all-center" style="gap: 10px">
                            <input type="checkbox" class="hidden-checkbox" id="sale-price-input" name="sale-price" value="0">
                            <label for="sale-price-input" class="btn btn-secondary btn-checkbox-toggle" style="font-size: 13px;">
                                Precio de Venta
                            </label>
                        </div>
                        <input style="width: 180px;" class="default-value-input" type="text" id="sale-price-default-input" name="sale-price-default" placeholder="Valor por Defecto (0)">
                        <div class="flex-column" style="position: relative; z-index: 10;">
                            <input type="checkbox" class="hidden-checkbox" id="auto-price-input" name="auto-price" value="0">
                            <label for="auto-price-input" id="auto-price-checkbox" class="btn btn-secondary btn-checkbox-toggle" style="font-size: 11px;">
                                Calcular Automaticamente
                            </label>
                            <div class="form-group flex-column" id="auto-price-type-container" style="align-items: start;">
                                <div class="flex-row">
                                    <input type="radio" id="auto-iva-input" name="price-type" value="iva">
                                    <p>Precio de Compra + IVA 21%</p>
                                </div>
                                <div class="flex-row">
                                    <input type="radio" id="auto-gain-input" name="price-type" value="gain">
                                    <p>Precio de Compra + Margen de Ganancia</p>
                                </div>
                                <div class="flex-row">
                                    <input type="radio" id="auto-iva-gain-input" name="price-type" value="gain-iva">
                                    <p>Precio de Compra + Margen de Ganancia + IVA 21%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group flex-column recomended-column-group">
                        <input type="checkbox" class="hidden-checkbox" id="gain-input" name="gain" value="0">
                        <label for="gain-input" class="btn btn-secondary btn-checkbox-toggle" style="font-size: 13px;">
                            Margen de Ganancia
                        </label>
                        <div class="flex-row">
                            <input style="width: 180px;" class="default-value-input" type="text" id="gain-default-input" name="gain-default" placeholder="Valor por Defecto (0)">
                            <div class="form-group flex-column" id="gain-type-container" style="align-items: start;">
                                <div class="flex-row">
                                    <input type="radio" id="percentage-gain-input" name="gain-type">
                                    <p>Porcentaje</p>
                                </div>
                                <div class="flex-row">
                                    <input type="radio" id="hard-gain-input" name="gain-type">
                                    <p>Valor Fijo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="columnsInput">Nombres de tus Columnas:</label>
                <input id="columnsInput" type="text" placeholder="Nombre" disabled style="cursor: not-allowed; background-color: var(--color-gray);">
                <input type="text" placeholder="Stock" disabled style="margin-top: 10px; cursor: not-allowed; background-color: var(--color-gray);">
                <div id="user-column-list"></div>
                <btn id="add-row-btn" class="btn">Agregar</btn>
                <small style="color: var(--color-gray); display: block; margin-top: 5px;">Podrás agregar datos para estas columnas más adelante.</small>
            </div>

            <!--<hr> <div class="form-group">
                <label>Importar Datos (Opcional):</label>
                <button type="button" id="prepare-import-btn" class="btn btn-secondary">Preparar Importación desde CSV</button>
                <div id="import-prepared-status" style="margin-top: 10px; color: green); font-weight: 500;"></div>
            </div>-->

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