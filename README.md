StockiFy - Gestión Integral de Inventarios y Ventas 🚀
StockiFy es una solución web robusta de control de inventario diseñada para centralizar la gestión comercial de pequeñas y medianas empresas. La plataforma permite no solo llevar un conteo exacto de existencias, sino también gestionar transacciones complejas, clientes, proveedores y obtener estadísticas clave para la toma de decisiones.

🌟 Características Principales
Gestión Dinámica de Inventarios: creación de múltiples inventarios personalizados donde el usuario puede definir sus propias columnas según la necesidad del negocio.

Motor de Tablas Físicas: implementación de lógica avanzada para generar tablas de base de datos en tiempo real (prefijo user_{id}_), garantizando la integridad de los datos mediante transacciones seguras (Rollbacks/Commits).

Control de Transacciones: registro detallado de Ventas y Compras, permitiendo asociar productos a clientes y proveedores específicos.

Sistema de Notificaciones y Alertas: avisos automáticos cuando el stock cae por debajo del mínimo pautado.

Estadísticas e Informes: panel dedicado con métricas diarias y filtros por fechas para monitorear ganancias, gastos y volumen de ventas.

Facturación por Email: integración con servicios de correo para enviar facturas directamente a los clientes tras una venta.

🛠️ Stack Tecnológico
Backend
Lenguaje: PHP 8.0+.

Arquitectura: Patrón MVC (Model-View-Controller) para una separación clara de responsabilidades.

Base de Datos: MySQL/MariaDB gestionado a través de PDO con patrón Singleton para optimizar conexiones.

Gestión de Dependencias: Composer.

Frontend
Interfaz: HTML5 responsivo y CSS3 avanzado con uso de SASS.

Interactividad: JavaScript moderno (ES6+) organizado en módulos.

Librerías de UI:

Shepherd.js: para el tour interactivo de bienvenida.

Phosphor Icons: set de iconos estilizados.

Floating UI / Popper.js: para el manejo de posicionamiento de elementos dinámicos.

🏗️ Arquitectura y Diseño
El proyecto destaca por una estructura profesional y escalable:

Seguridad: uso de vlucas/phpdotenv para proteger credenciales y variables de entorno.

Autoloading: implementación del estándar PSR-4 para la carga automática de clases.

Lógica de Negocio:

InventoryModel.php: gestiona la creación dinámica de esquemas de datos y metadatos de usuario.

Database.php: centraliza la conexión segura y configuración del charset.

Modularidad: uso de controladores específicos (AuthController, StockController, TableController) para gestionar cada flujo del sistema.

🚀 Instalación y Configuración
Clonar el repositorio:

Bash

git clone https://github.com/tu-usuario/StockiFy.git
Instalar dependencias de PHP:

Bash

composer install
Configurar variables de entorno:

Renombrar el archivo .env.example a .env.

Configurar las credenciales de tu base de datos (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD).

Servidor Web:

Asegúrate de tener habilitadas las extensiones ext-mysqli y ext-pdo en tu configuración de PHP.

📧 Contacto e Integración
El sistema cuenta con un formulario de contacto integrado que utiliza PHPMailer para la gestión de envíos de correos electrónicos profesionales.

Desarrollado por: Stefano Biglia, Franco Perez Lepera, Sebastián Scorini Wizenberg, Joaquin Sosa Makara
