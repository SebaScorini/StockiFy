<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StockiFy</title>
    <base href="/StockiFy/">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="assets/css/main.css">
    <script src="assets/js/theme.js"></script>
    <script src="assets/js/estadisticas-handler.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <link rel="stylesheet" href="/node_modules/shepherd.js/dist/css/shepherd.css">
</head>
<body id="page-index" data-user-id="">

<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/auth_helper.php';
$currentUser = getCurrentUser();

if (!isset($_SESSION['user_id'])){
    header("Location: login.php");
}
?>

<div id="grey-background" class="hidden">
    <p id="msj-bubble" class="view-container"></p>
    <div id="inventory-info-modal" class="hidden">
        Solo se permite seleccionar los inventarios (y productos) que tienen activadas las columnas recomendadas de "Precio de Compra" y "Precio de Venta".
        <br>
        <br>
        ¡Activalas en la seccion de "Configurar Tabla"!
        <br>
        <button class="btn btn-primary" id="close-inventory-info-modal">Cerrar</button>
    </div>
</div>
<header>
    <a href="/StockiFy/index.php" id="header-logo">
        <img src="assets/img/LogoE.png" alt="Stocky Logo">
    </a>
    <nav id="header-nav">
    </nav>
</header>
<div id="grey-background" class="hidden"></div>
<div id="grafico-estadistica-container" class="view-container hidden">
    <p class="return-btn">X</p>
    <h3></h3>
    <div id="grafico-estadistica" style="margin-top: 2rem"></div>
</div>
<input type="date" class="hidden fecha-container" id="fecha-desde-elegida">
<input type="date" class="hidden fecha-container" id="fecha-hasta-elegida">


<main class="text-left" style="padding: 0 0 3rem 0; overflow: hidden; align-items: stretch">
    <div class="flex-column" id="estadisticas-main-container">
        <div id="estadisticas-fecha-container">
            <div class="flex-row justify-between" id="estadisticas-fecha">
            </div>
        </div>
        <div class="estadisticas-container" id="general-stats-section">
            <div class="flex-column" id="select-tabla-container">
                <p style="font-size: 13px; text-align: right;" class="inventory-info-btn">¿Donde están mis inventarios?</p>
                <div class="btn btn-primary" id="selected-table-general"></div>
                <div id="table-list-general" class="flex-column hidden"></div>
            </div>
            <h1>Estadisticas Generales</h1>
            <h4>(Todas tus bases de datos, todos tus productos)</h4>
            <div class="stat-grid">
                <div class="flex-column estadistica-item-container" id="ganancias-general">
                    <h1>Ganancias</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="ingresos-brutos-general">
                    <h1>Ingresos Brutos</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="gastos-general">
                    <h1>Gastos</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="ventas-general">
                    <h1>Stock Vendido</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="ingresos-stock-general">
                    <h1>Stock Ingresado</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="promedio-venta-general">
                    <h1>Precio Promedio por Venta</h1>
                    <h3></h3>
                </div>
            </div>
        </div>
        <div class="estadisticas-container hidden"  id="inventory-stats-section">
            <div class="flex-column" id="select-tabla-container">
                <p style="font-size: 13px; text-align: right;" class="inventory-info-btn">¿Donde están mis inventarios?</p>
                <div class="btn btn-primary" id="selected-table-inventory"></div>
                <div id="table-list-inventory" class="flex-column hidden"></div>
            </div>
            <h1 style="width: 80%">Estadisticas de </h1>
            <h4>(Todas las ventas realizadas sobre el inventario seleccionado)</h4>
            <div class="stat-grid">
                <div class="flex-column estadistica-item-container" id="ganancias-tabla">
                    <h1>Ganancias</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="ingresos-brutos-tabla">
                    <h1>Ingresos Brutos</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="gastos-tabla">
                    <h1>Gastos</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="ventas-tabla">
                    <h1>Stock Vendido</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="ingresos-stock-tabla">
                    <h1>Stock Ingresado</h1>
                    <h3></h3>
                </div>
                <div class="flex-column estadistica-item-container" id="promedio-venta-tabla">
                    <h1>Precio Promedio por producto</h1>
                    <h3></h3>
                </div>
            </div>
        </div>
    </div>
</main>
<script type="module" src="assets/js/estadisticas-handler.js"></script>
<script src="https://cdn.jsdelivr.net/npm/shepherd.js@latest/dist/js/shepherd.min.js"></script>
<script src="assets/js/tourStats.js"></script>
</body>
</html>
