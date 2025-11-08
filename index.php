<!--


EN EL INDEX MODIFIQUE UN POCO A LO EXISTENTE Y LE AGREGUE CASI TODAS COSAS NUEVAS,
DEBERIA FUNCIONAR SIN PROBLEMAS


-->



<?php
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/auth_helper.php';
$currentUser = getCurrentUser();

if ($currentUser):
    $name = htmlspecialchars($currentUser['full_name']);
    $nombre = explode(' ', $name)[0];
endif
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StockiFy</title>
    <script src="assets/js/theme.js"></script>
    <script src="assets/js/cycling-text.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
</head>

<body id="page-index">

    <header>
        <a href="/StockiFy/index.php" id="header-logo">
            <img src="assets/img/LogoE.png" alt="Stocky Logo">
        </a>
        <nav id="header-nav">
        </nav>
    </header>

    <main class="flex-column">
        <div class="flex-row all-center" id="welcome-container">
            <div class="flex-column">
                <h1>Tu <span style="color: var(--accent-color); ">solución</span> para la <span style="color: var(--accent-color)">gestión de inventario</span></h1>
                <h2>Te ayudamos con tus
                    <span id="cycling-text-container">
                        <span style="color: var(--accent-color)" id="cycling-text">Ventas.</span>
                    </span>
                </h2>
            </div>
            <div class="flex-column all-center" style="padding: 20px;">
                <div id="welcome-view" class="view-container hidden">
                    <h2>¡Bienvenido!</h2>
                    <h3>Vemos que aún no has iniciado sesión.</h3>
                    <p>Inicia sesión o regístrate para comenzar.</p>
                    <div id="welcome-buttons" class="menu-buttons">
                        <a href="/StockiFy/login.php" class="btn btn-secondary">Iniciar Sesión</a>
                        <a href="/StockiFy/register.php" class="btn btn-primary">Crear una Cuenta</a>
                    </div>
                </div>

                <div id="empty-state-view" class="view-container hidden">
                    <h2>¡Bienvenido, <?php echo $nombre ?>!</h2>
                    <p>Aún no has creado ninguna base de datos. ¡Crea la primera para empezar a organizarte!</p>
                    <div class="menu-buttons">
                        <a href="/StockiFy/create-db.php" class="btn btn-primary">Crear mi Primera Base de Datos</a>
                    </div>
                </div>

                <div id="dashboard-view" class="view-container hidden">
                    <h2>¡Bienvenido de nuevo, <?php echo $nombre ?>!</h2>
                    <p>Estamos felices por volver a verte. ¡Hora de trabajar!</p>
                    <div class="menu-buttons">
                        <a href="/StockiFy/dashboard.php" class="btn btn-primary">Ir al Panel</a>
                    </div>
                </div>

                <div id="select-db-view" class="view-container hidden">
                    <h2>¡Bienvenido, <?php echo $nombre ?>!</h2>
                    <p>Estamos felices por verte. ¡Selecciona una base de datos y comienza a trabajar!</p>
                    <div class="menu-buttons">
                        <a href="/StockiFy/select-db.php" class="btn btn-primary">Seleccionar Base de Datos</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-row" id="index-sections-container">
            <h3>Acerca De</h3>
            <h3>Inventarios</h3>
            <h3>Clientes</h3>
            <h3>Estadisticas</h3>
            <h3>Contacto</h3>
        </div>
        <div class="flex-column" id="acerca-de-container">
            <p>
                StockiFy es una aplicación web de control de inventario diseñada para funcionar con tus necesidades.<br><br>
                En su nivel más minimo, te permitirá llevar un conteo detallado de tus productos; pero nuestro sistema cuenta con
                poderosas herramientas que te ayudarán a llevar tu negocio al proximo nivel.
            </p>
        </div>
    </main>

<script type="module" src="assets/js/main.js"></script>
</body>
</html>

