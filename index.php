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
    <script src="assets/js/index/index.js"></script>
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="stylesheet" href="assets/css/about-section.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/regular/style.css" />
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css" />
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
        <div style="width: 100%; border-top: 2px solid black; margin-top: 190px"></div>
        <div class="flex-column all-center" id="acerca-de-container">
            <p class="about-title">
                <span style="color: var(--accent-color)">StockiFy</span> es una aplicación web de control de inventario diseñada para funcionar con tus necesidades.
            </p>
            <p class="about-subtitle">
                Nuestro sistema fue creado a <span style="color: var(--accent-color)">tu</span> medida.
            </p>
            <div class="flex-row justify-between about-container">
                <div class="options-wrapper flex-column all-center">
                    <div class="flex-row about-option active" data-option="content-1">
                        <p>Interfáz simple e intuitiva para facilitar tu gestión de stock.</p>
                    </div>
                    <div class="flex-row about-option" data-option="content-2">
                        <p>Poderosas herramientas para registrar transacciones y obtener estadísticas clave para tu negocio.</p>
                    </div>
                    <div class="flex-row about-option" style="border-bottom: none" data-option="content-3">
                        <p>Control Completo.</p>
                    </div>
                </div>
                <div style="width: 100%">
                    <div class="content-panel active" id="content-1">
                        <h3>Diseñado para la velocidad</h3>
                        <p>
                            Dile adiós a las hojas de cálculo complicadas y al software obsoleto. <span style="color: var(--accent-color); font-weight: 600">StockiFy</span>
                            está diseñado pensando en ti.<br>Nuestra interfaz <span style="color: var(--accent-color); font-weight: 600">limpia</span> y
                            <span style="color: var(--accent-color); font-weight: 600">moderna</span> te permite agregar productos, gestionar inventarios
                            y ver tu stock de un solo vistazo <br>Menos tiempo aprendiendo cómo usar la herramienta, más tiempo gestionando tu negocio.
                        </p>
                    </div>

                    <div class="content-panel" id="content-2">
                        <h3>Decisiones basadas en datos</h3>
                        <p>
                            Registra cada venta y cada compra en segundos.  <span style="color: var(--accent-color); font-weight: 600">StockiFy</span>
                            actualiza automáticamente tu inventario en tiempo real
                            y genera reportes vitales.<br>Analiza cuanto vendiste y compraste, monitorea tus ganancias y gastos,
                            y <span style="color: var(--accent-color); font-weight: 600">toma decisiones informadas</span> con
                            estadísticas claras y precisas.
                        </p>
                    </div>

                    <div class="content-panel" id="content-3">
                        <h3>Todo tu negocio centralizado</h3>
                        <p>
                            Toma el control total. Desde la gestión de <span style="color: var(--accent-color); font-weight: 600">clientes</span>
                            y <span style="color: var(--accent-color); font-weight: 600">proveedores</span>  hasta la creación de
                            <span style="color: var(--accent-color); font-weight: 600">múltiples inventarios</span> para
                            diferentes sucursales, todo está centralizado.<br>Recibe alertas de stock bajo, revisa el historial
                            de tus compras y ventas, y obtén una <span style="color: var(--accent-color); font-weight: 600">visión de 360°</span>
                            de tu operación.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div class="other-info-wrapper">
            <div class="flex-column other-info-item">
                <div class="flex-row all-center other-info-header"><i class="ph ph-database" style="transform: scale(1.3)"></i><p>Inventarios</p></div>
                <div class="other-info-body">
                    <p class="info-main-text">Lleva un conteo extacto de la cantidad de productos que tenés en stock con nuestros <span style="color: var(--accent-color)">Inventarios.</span></p>
                    <p class="info-secondary-text">Crea la cantidad que necesites, identificalos con el nombre que quieras, y agregale tus propios campos.</p>
                    <p class="info-secondary-text">Utilizá nuestras <span style="color: var(--accent-color); font-weight: 600">columnas recomendadas</span> para indicar cuando queres que te avisemos que un producto está por abajo
                        de una cantidad de stock pautada y establecer precios compra y venta, <span style="color: var(--accent-color); font-weight: 600">¡Descubrí las posibilidades!</span></p>
                </div>
            </div>
            <div class="flex-column other-info-item">
                <div class="flex-row all-center other-info-header"><i class="ph ph-money" style="transform: scale(1.3)"></i><p>Transacciones</p></div>
                <div class="other-info-body">
                    <p class="info-main-text">Registra <span style="color: var(--accent-color); font-weight: 600">Ventas</span> y <span style="color: var(--accent-color); font-weight: 600">Compras</span>, crea <span style="color: var(--accent-color); font-weight: 600">Clientes</span> y <span style="color: var(--accent-color); font-weight: 600">Proveedores</span>, y junta ambas.</p>
                    <p class="info-secondary-text">Con solo habilitar las Columnas Recomendadas <span style="color: var(--accent-color); font-weight: 600">"Precio de Venta"</span> y <span style="color: var(--accent-color); font-weight: 600">"Precio de Compra"</span>
                        podés comenzar a gestionar <span style="color: var(--accent-color); font-weight: 600">Transacciones</span> con tus productos.</p>
                    <p class="info-secondary-text">Añadí <span style="color: var(--accent-color); font-weight: 600">Clientes</span>
                        recurrentes a tu negocio, asignalos a una venta y mandales la factura por mail; o registra un <span style="color: var(--accent-color); font-weight: 600">Proveedor</span> para
                    asignarlo a una Compra que hayas hecho.</p>
                </div>
            </div>
            <div class="flex-column other-info-item">
                <div class="flex-row all-center other-info-header"><i class="ph ph-chart-bar" style="transform: scale(1.3)"></i><p>Estadísticas</p></div>
                <div class="other-info-body">
                    <p class="info-main-text">¿Estuviste registrando Ventas y Compras? Utiliza nuestras <span style="color: var(--accent-color); font-weight: 600">Estadísticas</span> automaticas para llevar tu negocio al próximo nivel.</p>
                    <p class="info-secondary-text">Podrás ver tus <span style="color: var(--accent-color); font-weight: 600">estadisticas diarías</span> desde el Panel, o filtra entre ciertas fechas desde
                        la <span style="color: var(--accent-color); font-weight: 600">página dedicada de estadísticas.</span></p>
                    <p class="info-secondary-text">Averiguá tu cantidad de stock ingresado y vendido, cuanto dinero ganaste y perdiste, cuantas ventas realizaste, y <span style="color: var(--accent-color); font-weight: 600">mucho más.</span></p>
                </div>
            </div>
        </div>
        <div style="width: 100%; border-top: 2px solid black; margin-top: 190px"></div>
        <div class="flex-row all-center" id="contact-container" style="margin: 60px 0">
            <div class="contact-wrapper flex-row">
                <form id="contact-form">
                    <div class="flex-row all-center contact-form-header">
                        <h2>Contacta con nosotros</h2>
                    </div>
                    <label for="name">Nombre</label>
                    <input type="text" name="name" id="name" placeholder="Nombre" required>
                    <label for="email">E-Mail</label>
                    <input type="email" name="email" id="email" placeholder="E-Mail" required>
                    <label for="phone">Teléfono (Opcional)</label>
                    <input type="text" name="phone" id="phone" placeholder="Telefono." minlength="8" pattern="[0-9]+">
                    <label for="subject">Asunto (Opcional)</label>
                    <input type="text" name="subject" id="subject" placeholder="Asunto" maxlength="30">
                    <label for="message">Mensaje</label>
                    <textarea name="message" id="message" placeholder="Mensaje" rows="5" required></textarea>
                    <button type="submit" class="btn btn-primary">Enviar</button>
                </form>
                <iframe id="contact-map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.5591441865326!2d-58.604605923529405!3d-34.64057945944709!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bc951c0fe2d9f5%3A0x9f1c540898efecbe!2sUTN%20HAEDO!5e0!3m2!1ses!2sar!4v1762984923168!5m2!1ses!2sar" width="600" height="450" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
        </div>
    </main>
    <footer style="height: 50px; border-top: 2px solid black" class="flex-row all-center">
        <p>StockiFy &copy; 2025</p>
    </footer>
<script type="module" src="assets/js/main.js"></script>
</body>
</html>

