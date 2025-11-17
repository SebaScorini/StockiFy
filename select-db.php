<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seleccionar Base de Datos - StockiFy</title>
    <base href="/StockiFy/">
    <script src="assets/js/theme.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
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

<main>
    <div id="selection-view" class="view-container">
        <h2>Selecciona una Base de Datos</h2>
        <p>Elige con qué base de datos quieres trabajar.</p>
        <div id="db-list">
            <li>Cargando...</li>
        </div>
        <hr>
        <a href="/StockiFy/create-db.php" class="btn btn-secondary">O crear una nueva</a>
    </div>
</main>

<script type="module" src="assets/js/database/select-db.js"></script>
</body>
</html>