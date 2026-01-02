# StockiFy - Gestión Integral de Inventarios y Ventas 🚀

![PHP](https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)

## 📝 Descripción del Proyecto
**StockiFy** es una solución web robusta de control de inventario diseñada para centralizar la gestión comercial de pequeñas y medianas empresas. La plataforma permite no solo llevar un conteo exacto de existencias, sino también gestionar transacciones complejas con clientes y proveedores, ofreciendo estadísticas clave para la toma de decisiones estratégicas.

## 🌟 Características Principales
* **Gestión Dinámica de Inventarios:** Creación de inventarios personalizados donde el usuario define sus propias columnas según la necesidad del negocio.
* **Motor de Tablas Físicas:** Implementación de lógica avanzada para generar tablas de base de datos en tiempo real (con prefijo `user_{id}_`), garantizando la integridad mediante transacciones seguras (Rollbacks/Commits).
* **Control de Transacciones:** Registro detallado de Ventas y Compras vinculadas a productos, clientes y proveedores específicos.
* **Sistema de Alertas:** Avisos automáticos de stock crítico cuando las existencias caen por debajo del mínimo pautado.
* **Panel de Estadísticas:** Métricas diarias y filtros por fecha para monitorear ganancias, gastos y volumen operativo.
* **Facturación Automática:** Integración para el envío de facturas directamente al cliente vía email tras concretar una venta.

## 🛠️ Stack Tecnológico
### **Backend**
* **Lenguaje:** PHP 8.0+.
* **Arquitectura:** Patrón **MVC** (Model-View-Controller) para una separación clara de responsabilidades.
* **Base de Datos:** MySQL/MariaDB gestionado mediante **PDO** con patrón **Singleton** para optimizar conexiones.
* **Dependencias:** Composer (PHPMailer, PHP-Dotenv).

### **Frontend**
* **Interfaz:** HTML5 responsivo y CSS3 con preprocesador **SASS**.
* **Interactividad:** JavaScript moderno (ES6+) organizado en módulos.
* **Librerías de UI:** * `Shepherd.js` (Tour interactivo).
    * `Phosphor Icons` (Iconografía).
    * `Popper.js` (Posicionamiento dinámico).

## 🏗️ Arquitectura y Seguridad
El proyecto destaca por una estructura profesional y escalable:
* **Seguridad:** Uso de variables de entorno (`.env`) para proteger credenciales sensibles.
* **Autoloading:** Implementación del estándar **PSR-4** para la carga automática de clases.
* **Modularidad:** Controladores específicos (`AuthController`, `StockController`, `TableController`) para gestionar cada flujo de manera independiente.

## 🚀 Instalación y Configuración
1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/nanoBiglia2005/StockiFy.git](https://github.com/nanoBiglia2005/StockiFy.git)
    ```
2.  **Instalar dependencias:**
    ```bash
    composer install
    ```
3.  **Variables de Entorno:**
    * Renombrar `.env.example` a `.env`.
    * Configurar `DB_HOST`, `DB_DATABASE`, `DB_USERNAME` y `DB_PASSWORD`.
4.  **Requisitos del Servidor:**
    * Habilitar extensiones `ext-mysqli` y `ext-pdo` en la configuración de PHP.

## 👥 Desarrolladores
Este proyecto fue realizado por:
* **Stefano Biglia**
* **Franco Perez Lepera**
* **Sebastián Scorini Wizenberg**
* **Joaquin Sosa Makara**


---
*StockiFy © 2025 - Soluciones Inteligentes de Inventario*
