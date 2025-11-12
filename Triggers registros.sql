
-- CREAR TABLAS DE REGISTRO (reg_<tabla>)

DROP TABLE IF EXISTS reg_customers;
CREATE TABLE reg_customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(20) NOT NULL,          -- 'Agregado' | 'Modificado' | 'Borrado'
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    customer_id VARCHAR(50),
    user_id VARCHAR(50),
    full_name VARCHAR(150),
    email VARCHAR(100),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(50),
    created_at VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS reg_inventories;
CREATE TABLE reg_inventories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(20) NOT NULL,
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    inventory_id VARCHAR(50),
    name VARCHAR(150),
    user_id VARCHAR(50),
    created_at VARCHAR(50),
    min_stock VARCHAR(50),
    sale_price VARCHAR(50),
    receipt_price VARCHAR(50),
    hard_gain VARCHAR(50),
    percentage_gain VARCHAR(50),
    auto_price VARCHAR(50),
    auto_price_type VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS reg_providers;
CREATE TABLE reg_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(20) NOT NULL,
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    provider_id VARCHAR(50),
    user_id VARCHAR(50),
    full_name VARCHAR(150),
    email VARCHAR(100),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(50),
    created_at VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS reg_receipts;
CREATE TABLE reg_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(20) NOT NULL,
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    receipt_id VARCHAR(50),
    user_id VARCHAR(50),
    provider_id VARCHAR(50),
    total_amount VARCHAR(50),
    receipt_date VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS reg_recitm;
CREATE TABLE reg_recitm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(20) NOT NULL,
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    receipt_item_id VARCHAR(50),
    item_id VARCHAR(50),
    inventory_id VARCHAR(50),
    receipt_id VARCHAR(50),
    product_name VARCHAR(255),
    product_sku VARCHAR(100),
    quantity VARCHAR(50),
    unit_price VARCHAR(50),
    total_price VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS reg_sales;
CREATE TABLE reg_sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(20) NOT NULL,
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sale_id VARCHAR(50),
    user_id VARCHAR(50),
    customer_id VARCHAR(50),
    total_amount VARCHAR(50),
    sale_date VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS reg_salitm;
CREATE TABLE reg_salitm (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(20) NOT NULL,
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sale_item_id VARCHAR(50),
    item_id VARCHAR(50),
    inventory_id VARCHAR(50),
    sale_id VARCHAR(50),
    product_name VARCHAR(255),
    product_sku VARCHAR(100),
    quantity VARCHAR(50),
    unit_price VARCHAR(50),
    total_price VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS reg_users;
CREATE TABLE reg_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(20) NOT NULL,
    `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50),
    username VARCHAR(100),
    email VARCHAR(100),
    full_name VARCHAR(150),
    cell VARCHAR(50),
    dni VARCHAR(50),
    is_admin VARCHAR(10),
    created_at VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- TRIGGERS

DELIMITER //

-- ---------- CUSTOMERS ----------
DROP TRIGGER IF EXISTS customers_insert;
CREATE TRIGGER customers_insert
AFTER INSERT ON customers
FOR EACH ROW
BEGIN
    INSERT INTO reg_customers (action, customer_id, user_id, full_name, email, phone, address, tax_id, created_at)
    VALUES ('Agregado', NEW.id, NEW.user_id, NEW.full_name, NEW.email, NEW.phone, NEW.address, NEW.tax_id, DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'));
END//

DROP TRIGGER IF EXISTS customers_update;
CREATE TRIGGER customers_update
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    DECLARE changes_made BOOLEAN DEFAULT FALSE;
    DECLARE v_customer_id VARCHAR(200) DEFAULT OLD.id;
    DECLARE v_user_id VARCHAR(200) DEFAULT '';
    DECLARE v_full_name VARCHAR(400) DEFAULT '';
    DECLARE v_email VARCHAR(400) DEFAULT '';
    DECLARE v_phone VARCHAR(200) DEFAULT '';
    DECLARE v_address TEXT DEFAULT '';
    DECLARE v_tax_id VARCHAR(200) DEFAULT '';
    DECLARE v_created_at VARCHAR(200) DEFAULT '';

    IF NOT (NEW.id <=> OLD.id) THEN
        SET v_customer_id = CONCAT(OLD.id, ' -> ', NEW.id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.user_id <=> OLD.user_id) THEN
        SET v_user_id = CONCAT(OLD.user_id, ' -> ', NEW.user_id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.full_name <=> OLD.full_name) THEN
        SET v_full_name = CONCAT(OLD.full_name, ' -> ', NEW.full_name);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.email <=> OLD.email) THEN
        SET v_email = CONCAT(IFNULL(OLD.email,'N/A'), ' -> ', IFNULL(NEW.email,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.phone <=> OLD.phone) THEN
        SET v_phone = CONCAT(IFNULL(OLD.phone,'N/A'), ' -> ', IFNULL(NEW.phone,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.address <=> OLD.address) THEN
        SET v_address = CONCAT(IFNULL(OLD.address,'N/A'), ' -> ', IFNULL(NEW.address,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.tax_id <=> OLD.tax_id) THEN
        SET v_tax_id = CONCAT(IFNULL(OLD.tax_id,'N/A'), ' -> ', IFNULL(NEW.tax_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT(NEW.created_at <=> OLD.created_at) THEN
    	  SET v_created_at = CONCAT(DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'), ' -> ', DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'));
		  SET changes_made = TRUE;
	 END IF;
    IF changes_made THEN
        INSERT INTO reg_customers (action, customer_id, user_id, full_name, email, phone, address, tax_id, created_at)
        VALUES ('Modificado', v_customer_id, v_user_id, v_full_name, v_email, v_phone, v_address, v_tax_id, v_created_at);
    END IF;
END//

DROP TRIGGER IF EXISTS customers_delete;
CREATE TRIGGER customers_delete
BEFORE DELETE ON customers
FOR EACH ROW
BEGIN
    INSERT INTO reg_customers (action, customer_id, user_id, full_name, email, phone, address, tax_id, created_at)
    VALUES ('Borrado', OLD.id, OLD.user_id, OLD.full_name, OLD.email, OLD.phone, OLD.address, OLD.tax_id, DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'));
END//

-- ---------- PROVIDERS ----------
DROP TRIGGER IF EXISTS providers_insert;
CREATE TRIGGER providers_insert
AFTER INSERT ON providers
FOR EACH ROW
BEGIN
    INSERT INTO reg_providers (action, provider_id, user_id, full_name, email, phone, address, tax_id, created_at)
    VALUES ('Agregado', NEW.id, NEW.user_id, NEW.full_name, NEW.email, NEW.phone, NEW.address, NEW.tax_id, DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'));
END//

DROP TRIGGER IF EXISTS providers_update;
CREATE TRIGGER providers_update
AFTER UPDATE ON providers
FOR EACH ROW
BEGIN
    DECLARE changes_made BOOLEAN DEFAULT FALSE;
    DECLARE v_provider_id VARCHAR(200) DEFAULT OLD.id;
    DECLARE v_user_id VARCHAR(200) DEFAULT '';
    DECLARE v_full_name VARCHAR(400) DEFAULT '';
    DECLARE v_email VARCHAR(400) DEFAULT '';
    DECLARE v_phone VARCHAR(200) DEFAULT '';
    DECLARE v_address TEXT DEFAULT '';
    DECLARE v_tax_id VARCHAR(200) DEFAULT '';
    DECLARE v_created_at VARCHAR(200) DEFAULT '';

    IF NOT (NEW.id <=> OLD.id) THEN
        SET v_provider_id = CONCAT(OLD.id, ' -> ', NEW.id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.user_id <=> OLD.user_id) THEN
        SET v_user_id = CONCAT(OLD.user_id, ' -> ', NEW.user_id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.full_name <=> OLD.full_name) THEN
        SET v_full_name = CONCAT(IFNULL(OLD.full_name,'N/A'), ' -> ', IFNULL(NEW.full_name,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.email <=> OLD.email) THEN
        SET v_email = CONCAT(IFNULL(OLD.email,'N/A'), ' -> ', IFNULL(NEW.email,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.phone <=> OLD.phone) THEN
        SET v_phone = CONCAT(IFNULL(OLD.phone,'N/A'), ' -> ', IFNULL(NEW.phone,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.address <=> OLD.address) THEN
        SET v_address = CONCAT(IFNULL(OLD.address,'N/A'), ' -> ', IFNULL(NEW.address,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.tax_id <=> OLD.tax_id) THEN
        SET v_tax_id = CONCAT(IFNULL(OLD.tax_id,'N/A'), ' -> ', IFNULL(NEW.tax_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT(NEW.created_at <=> OLD.created_at) THEN
    	  SET v_created_at = CONCAT(DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'), ' -> ', DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'));
		  SET changes_made = TRUE;
	 END IF;

    IF changes_made THEN
        INSERT INTO reg_providers (action, provider_id, user_id, full_name, email, phone, address, tax_id, created_at)
        VALUES ('Modificado', v_provider_id, v_user_id, v_full_name, v_email, v_phone, v_address, v_tax_id, v_created_at);
    END IF;
END//

DROP TRIGGER IF EXISTS providers_delete;
CREATE TRIGGER providers_delete
BEFORE DELETE ON providers
FOR EACH ROW
BEGIN
    INSERT INTO reg_providers (action, provider_id, user_id, full_name, email, phone, address, tax_id, created_at)
    VALUES ('Borrado', OLD.id, OLD.user_id, OLD.full_name, OLD.email, OLD.phone, OLD.address, OLD.tax_id, DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'));
END//

-- ---------- USERS ----------
DROP TRIGGER IF EXISTS users_insert;
CREATE TRIGGER users_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO reg_users (action, user_id, username, email, full_name, cell, dni, is_admin, created_at)
    VALUES ('Agregado', NEW.id, NEW.username, NEW.email, NEW.full_name, NEW.cell, NEW.dni, CAST(NEW.is_admin AS CHAR), DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'));
END//

DROP TRIGGER IF EXISTS users_update;
CREATE TRIGGER users_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    DECLARE changes_made BOOLEAN DEFAULT FALSE;
    DECLARE v_user_id VARCHAR(200) DEFAULT OLD.id;
    DECLARE v_username VARCHAR(300) DEFAULT '';
    DECLARE v_email VARCHAR(300) DEFAULT '';
    DECLARE v_full_name VARCHAR(400) DEFAULT '';
    DECLARE v_cell VARCHAR(200) DEFAULT '';
    DECLARE v_dni VARCHAR(200) DEFAULT '';
    DECLARE v_is_admin VARCHAR(50) DEFAULT '';
    DECLARE v_created_at VARCHAR(200) DEFAULT '';

    IF NOT (NEW.id <=> OLD.id) THEN
        SET v_user_id = CONCAT(OLD.id, ' -> ', NEW.id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.username <=> OLD.username) THEN
        SET v_username = CONCAT(IFNULL(OLD.username,'N/A'), ' -> ', IFNULL(NEW.username,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.email <=> OLD.email) THEN
        SET v_email = CONCAT(IFNULL(OLD.email,'N/A'), ' -> ', IFNULL(NEW.email,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.full_name <=> OLD.full_name) THEN
        SET v_full_name = CONCAT(IFNULL(OLD.full_name,'N/A'), ' -> ', IFNULL(NEW.full_name,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.cell <=> OLD.cell) THEN
        SET v_cell = CONCAT(IFNULL(OLD.cell,'N/A'), ' -> ', IFNULL(NEW.cell,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.dni <=> OLD.dni) THEN
        SET v_dni = CONCAT(IFNULL(OLD.dni,'N/A'), ' -> ', IFNULL(NEW.dni,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.is_admin <=> OLD.is_admin) THEN
        SET v_is_admin = CONCAT(OLD.is_admin, ' -> ', NEW.is_admin);
        SET changes_made = TRUE;
    END IF;
    IF NOT(NEW.created_at <=> OLD.created_at) THEN
    	  SET v_created_at = CONCAT(DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'), ' -> ', DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'));
		  SET changes_made = TRUE;
	 END IF;

    IF changes_made THEN
        INSERT INTO reg_users (action, user_id, username, email, full_name, cell, dni, is_admin, created_at)
        VALUES ('Modificado', v_user_id, v_username, v_email, v_full_name, v_cell, v_dni, v_is_admin, v_created_at);
    END IF;
END//

DROP TRIGGER IF EXISTS users_delete;
CREATE TRIGGER users_delete
BEFORE DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO reg_users (action, user_id, username, email, full_name, cell, dni, is_admin, created_at)
    VALUES ('Borrado', OLD.id, OLD.username, OLD.email, OLD.full_name, OLD.cell, OLD.dni, CAST(OLD.is_admin AS CHAR), DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'));
END//

-- ---------- INVENTORIES ----------
DROP TRIGGER IF EXISTS inventories_insert;
CREATE TRIGGER inventories_insert
AFTER INSERT ON inventories
FOR EACH ROW
BEGIN
    INSERT INTO reg_inventories (action, inventory_id, name, user_id, created_at, min_stock, sale_price, receipt_price, hard_gain, percentage_gain, auto_price, auto_price_type)
    VALUES ('Agregado', NEW.id, NEW.name, NEW.user_id, DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'), CAST(NEW.min_stock AS CHAR), CAST(NEW.sale_price AS CHAR), CAST(NEW.receipt_price AS CHAR), CAST(NEW.hard_gain AS CHAR), CAST(NEW.percentage_gain AS CHAR), CAST(NEW.auto_price AS CHAR), NEW.auto_price_type);
END//

DROP TRIGGER IF EXISTS inventories_update;
CREATE TRIGGER inventories_update
AFTER UPDATE ON inventories
FOR EACH ROW
BEGIN
    DECLARE changes_made BOOLEAN DEFAULT FALSE;
    DECLARE v_inventory_id VARCHAR(200) DEFAULT OLD.id;
    DECLARE v_name VARCHAR(400) DEFAULT '';
    DECLARE v_user_id VARCHAR(200) DEFAULT '';
    DECLARE v_created_at VARCHAR(200) DEFAULT '';
    DECLARE v_min_stock VARCHAR(50) DEFAULT '';
    DECLARE v_sale_price VARCHAR(50) DEFAULT '';
    DECLARE v_receipt_price VARCHAR(50) DEFAULT '';
    DECLARE v_hard_gain VARCHAR(50) DEFAULT '';
    DECLARE v_percentage_gain VARCHAR(50) DEFAULT '';
    DECLARE v_auto_price VARCHAR(50) DEFAULT '';
    DECLARE v_auto_price_type VARCHAR(50) DEFAULT '';

    IF NOT (NEW.id <=> OLD.id) THEN
        SET v_inventory_id = CONCAT(OLD.id, ' -> ', NEW.id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.name <=> OLD.name) THEN
        SET v_name = CONCAT(IFNULL(OLD.name,'N/A'), ' -> ', IFNULL(NEW.name,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.user_id <=> OLD.user_id) THEN
        SET v_user_id = CONCAT(OLD.user_id, ' -> ', NEW.user_id);
        SET changes_made = TRUE;
    END IF;
    IF NOT(NEW.created_at <=> OLD.created_at) THEN
    	  SET v_created_at = CONCAT(DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'), ' -> ', DATE_FORMAT(NEW.created_at, '%Y-%m-%d %H:%i:%s'));
		  SET changes_made = TRUE;
	 END IF;
	 IF NOT(NEW.min_stock <=> OLD.min_stock) THEN
    	  SET v_min_stock = CONCAT(OLD.min_stock, ' -> ', NEW.min_stock);
		  SET changes_made = TRUE;
	 END IF;
	 IF NOT(NEW.sale_price <=> OLD.sale_price) THEN
    	  SET v_sale_price = CONCAT(OLD.sale_price, ' -> ', NEW.sale_price);
		  SET changes_made = TRUE;
	 END IF;
	 IF NOT(NEW.receipt_price <=> OLD.receipt_price) THEN
    	  SET v_receipt_price = CONCAT(OLD.receipt_price, ' -> ', NEW.receipt_price);
		  SET changes_made = TRUE;
	 END IF;
	 IF NOT(NEW.hard_gain <=> OLD.hard_gain) THEN
    	  SET v_hard_gain = CONCAT(OLD.hard_gain, ' -> ', NEW.hard_gain);
		  SET changes_made = TRUE;
	 END IF;
	 IF NOT(NEW.percentage_gain <=> OLD.percentage_gain) THEN
    	  SET v_percentage_gain = CONCAT(OLD.percentage_gain, ' -> ', NEW.percentage_gain);
		  SET changes_made = TRUE;
	 END IF;
	 IF NOT(NEW.auto_price <=> OLD.auto_price) THEN
    	  SET v_auto_price = CONCAT(OLD.auto_price, ' -> ', NEW.auto_price);
		  SET changes_made = TRUE;
	 END IF;
	 IF NOT(NEW.auto_price_type <=> OLD.auto_price_type) THEN
    	  SET v_auto_price_type = CONCAT(OLD.auto_price_type, ' -> ', NEW.auto_price_type);
		  SET changes_made = TRUE;
	 END IF;
	 

    IF changes_made THEN
        INSERT INTO reg_inventories (action, inventory_id, name, user_id, created_at, min_stock, sale_price, receipt_price, hard_gain, percentage_gain, auto_price, auto_price_type)
        VALUES ('Modificado', v_inventory_id, v_name, v_user_id, v_created_at, v_min_stock, v_sale_price, v_receipt_price, v_hard_gain, v_percentage_gain, v_auto_price, v_auto_price_type);
    END IF;
END//

DROP TRIGGER IF EXISTS inventories_delete;
CREATE TRIGGER inventories_delete
BEFORE DELETE ON inventories
FOR EACH ROW
BEGIN
    INSERT INTO reg_inventories (action, inventory_id, name, user_id, created_at, min_stock, sale_price, receipt_price, hard_gain, percentage_gain, auto_price, auto_price_type)
    VALUES ('Borrado', OLD.id, OLD.name, OLD.user_id, DATE_FORMAT(OLD.created_at, '%Y-%m-%d %H:%i:%s'), CAST(OLD.min_stock AS CHAR), CAST(OLD.sale_price AS CHAR), CAST(OLD.receipt_price AS CHAR), CAST(OLD.hard_gain AS CHAR), CAST(OLD.percentage_gain AS CHAR), CAST(OLD.auto_price AS CHAR), OLD.auto_price_type);
END//

-- ---------- RECEIPTS ----------
DROP TRIGGER IF EXISTS receipts_insert;
CREATE TRIGGER receipts_insert
AFTER INSERT ON receipts
FOR EACH ROW
BEGIN
    INSERT INTO reg_receipts (action, receipt_id, user_id, provider_id, total_amount, receipt_date)
    VALUES ('Agregado', NEW.id, NEW.user_id, NEW.provider_id, CAST(NEW.total_amount AS CHAR), DATE_FORMAT(NEW.receipt_date, '%Y-%m-%d %H:%i:%s'));
END//

DROP TRIGGER IF EXISTS receipts_update;
CREATE TRIGGER receipts_update
AFTER UPDATE ON receipts
FOR EACH ROW
BEGIN
    DECLARE changes_made BOOLEAN DEFAULT FALSE;
    DECLARE v_receipt_id VARCHAR(200) DEFAULT OLD.id;
    DECLARE v_user_id VARCHAR(200) DEFAULT '';
    DECLARE v_provider_id VARCHAR(200) DEFAULT '';
    DECLARE v_total_amount VARCHAR(200) DEFAULT '';
    DECLARE v_receipt_date VARCHAR(200) DEFAULT '';

    IF NOT (NEW.id <=> OLD.id) THEN
        SET v_receipt_id = CONCAT(OLD.id, ' -> ', NEW.id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.user_id <=> OLD.user_id) THEN
        SET v_user_id = CONCAT(OLD.user_id, ' -> ', NEW.user_id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.provider_id <=> OLD.provider_id) THEN
        SET v_provider_id = CONCAT(IFNULL(OLD.provider_id,'N/A'), ' -> ', IFNULL(NEW.provider_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.total_amount <=> OLD.total_amount) THEN
        SET v_total_amount = CONCAT(IFNULL(OLD.total_amount,'N/A'), ' -> ', IFNULL(NEW.total_amount,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.receipt_date <=> OLD.receipt_date) THEN
        SET v_receipt_date = CONCAT(DATE_FORMAT(OLD.receipt_date, '%Y-%m-%d %H:%i:%s'), ' -> ', DATE_FORMAT(NEW.receipt_date, '%Y-%m-%d %H:%i:%s'));
        SET changes_made = TRUE;
    END IF;

    IF changes_made THEN
        INSERT INTO reg_receipts (action, receipt_id, user_id, provider_id, total_amount, receipt_date)
        VALUES ('Modificado', v_receipt_id, v_user_id, v_provider_id, v_total_amount, v_receipt_date);
    END IF;
END//

DROP TRIGGER IF EXISTS receipts_delete;
CREATE TRIGGER receipts_delete
BEFORE DELETE ON receipts
FOR EACH ROW
BEGIN
    INSERT INTO reg_receipts (action, receipt_id, user_id, provider_id, total_amount, receipt_date)
    VALUES ('Borrado', OLD.id, OLD.user_id, OLD.provider_id, CAST(OLD.total_amount AS CHAR), DATE_FORMAT(OLD.receipt_date, '%Y-%m-%d %H:%i:%s'));
END//

-- ---------- RECEIPT_ITEMS ----------
DROP TRIGGER IF EXISTS rec_items_insert;
CREATE TRIGGER rec_items_insert
AFTER INSERT ON receipt_items
FOR EACH ROW
BEGIN
    INSERT INTO reg_recitm (action, receipt_item_id, item_id, inventory_id, receipt_id, product_name, product_sku, quantity, unit_price, total_price)
    VALUES ('Agregado', NEW.id, NEW.item_id, NEW.inventory_id, NEW.receipt_id, NEW.product_name, NEW.product_sku, CAST(NEW.quantity AS CHAR), CAST(NEW.unit_price AS CHAR), CAST(NEW.total_price AS CHAR));
END//

DROP TRIGGER IF EXISTS rec_items_update;
CREATE TRIGGER rec_items_update
AFTER UPDATE ON receipt_items
FOR EACH ROW
BEGIN
    DECLARE changes_made BOOLEAN DEFAULT FALSE;
    DECLARE v_receipt_item_id VARCHAR(200) DEFAULT OLD.id;
    DECLARE v_item_id VARCHAR(200) DEFAULT '';
    DECLARE v_inventory_id VARCHAR(200) DEFAULT '';
    DECLARE v_receipt_id VARCHAR(200) DEFAULT '';
    DECLARE v_product_name VARCHAR(400) DEFAULT '';
    DECLARE v_product_sku VARCHAR(200) DEFAULT '';
    DECLARE v_quantity VARCHAR(200) DEFAULT '';
    DECLARE v_unit_price VARCHAR(200) DEFAULT '';
    DECLARE v_total_price VARCHAR(200) DEFAULT '';

    IF NOT (NEW.id <=> OLD.id) THEN
        SET v_receipt_item_id = CONCAT(OLD.id, ' -> ', NEW.id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.item_id <=> OLD.item_id) THEN
        SET v_item_id = CONCAT(IFNULL(OLD.item_id,'N/A'), ' -> ', IFNULL(NEW.item_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.inventory_id <=> OLD.inventory_id) THEN
        SET v_inventory_id = CONCAT(IFNULL(OLD.inventory_id,'N/A'), ' -> ', IFNULL(NEW.inventory_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.receipt_id <=> OLD.receipt_id) THEN
        SET v_receipt_id = CONCAT(IFNULL(OLD.receipt_id,'N/A'), ' -> ', IFNULL(NEW.receipt_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.product_name <=> OLD.product_name) THEN
        SET v_product_name = CONCAT(IFNULL(OLD.product_name,'N/A'), ' -> ', IFNULL(NEW.product_name,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.product_sku <=> OLD.product_sku) THEN
        SET v_product_sku = CONCAT(IFNULL(OLD.product_sku,'N/A'), ' -> ', IFNULL(NEW.product_sku,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.quantity <=> OLD.quantity) THEN
        SET v_quantity = CONCAT(IFNULL(OLD.quantity,'N/A'), ' -> ', IFNULL(NEW.quantity,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.unit_price <=> OLD.unit_price) THEN
        SET v_unit_price = CONCAT(IFNULL(OLD.unit_price,'N/A'), ' -> ', IFNULL(NEW.unit_price,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.total_price <=> OLD.total_price) THEN
        SET v_total_price = CONCAT(IFNULL(OLD.total_price,'N/A'), ' -> ', IFNULL(NEW.total_price,'N/A'));
        SET changes_made = TRUE;
    END IF;

    IF changes_made THEN
        INSERT INTO reg_recitm (action, receipt_item_id, item_id, inventory_id, receipt_id, product_name, product_sku, quantity, unit_price, total_price)
        VALUES ('Modificado', v_receipt_item_id, v_item_id, v_inventory_id, v_receipt_id, v_product_name, v_product_sku, v_quantity, v_unit_price, v_total_price);
    END IF;
END//

DROP TRIGGER IF EXISTS rec_items_delete;
CREATE TRIGGER rec_items_delete
BEFORE DELETE ON receipt_items
FOR EACH ROW
BEGIN
    INSERT INTO reg_recitm (action, receipt_item_id, item_id, inventory_id, receipt_id, product_name, product_sku, quantity, unit_price, total_price)
    VALUES ('Borrado', OLD.id, OLD.item_id, OLD.inventory_id, OLD.receipt_id, OLD.product_name, OLD.product_sku, CAST(OLD.quantity AS CHAR), CAST(OLD.unit_price AS CHAR), CAST(OLD.total_price AS CHAR));
END//

-- ---------- SALES ----------
DROP TRIGGER IF EXISTS sales_insert;
CREATE TRIGGER sales_insert
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
    INSERT INTO reg_sales (action, sale_id, user_id, customer_id, total_amount, sale_date)
    VALUES ('Agregado', NEW.id, NEW.user_id, NEW.customer_id, CAST(NEW.total_amount AS CHAR), DATE_FORMAT(NEW.sale_date, '%Y-%m-%d %H:%i:%s'));
END//

DROP TRIGGER IF EXISTS sales_update;
CREATE TRIGGER sales_update
AFTER UPDATE ON sales
FOR EACH ROW
BEGIN
    DECLARE changes_made BOOLEAN DEFAULT FALSE;
    DECLARE v_sale_id VARCHAR(200) DEFAULT OLD.id;
    DECLARE v_user_id VARCHAR(200) DEFAULT '';
    DECLARE v_customer_id VARCHAR(200) DEFAULT '';
    DECLARE v_total_amount VARCHAR(200) DEFAULT '';
    DECLARE v_sale_date VARCHAR(200) DEFAULT '';

    IF NOT (NEW.id <=> OLD.id) THEN
        SET v_sale_id = CONCAT(OLD.id, ' -> ', NEW.id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.user_id <=> OLD.user_id) THEN
        SET v_user_id = CONCAT(OLD.user_id, ' -> ', NEW.user_id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.customer_id <=> OLD.customer_id) THEN
        SET v_customer_id = CONCAT(IFNULL(OLD.customer_id,'N/A'), ' -> ', IFNULL(NEW.customer_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.total_amount <=> OLD.total_amount) THEN
        SET v_total_amount = CONCAT(IFNULL(OLD.total_amount,'N/A'), ' -> ', IFNULL(NEW.total_amount,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.sale_date <=> OLD.sale_date) THEN
        SET v_sale_date = CONCAT(DATE_FORMAT(OLD.sale_date, '%Y-%m-%d %H:%i:%s'), ' -> ', DATE_FORMAT(NEW.sale_date, '%Y-%m-%d %H:%i:%s'));
        SET changes_made = TRUE;
    END IF;

    IF changes_made THEN
        INSERT INTO reg_sales (action, sale_id, user_id, customer_id, total_amount, sale_date)
        VALUES ('Modificado', v_sale_id, v_user_id, v_customer_id, v_total_amount, v_sale_date);
    END IF;
END//

DROP TRIGGER IF EXISTS sales_delete;
CREATE TRIGGER sales_delete
BEFORE DELETE ON sales
FOR EACH ROW
BEGIN
    INSERT INTO reg_sales (action, sale_id, user_id, customer_id, total_amount, sale_date)
    VALUES ('Borrado', OLD.id, OLD.user_id, OLD.customer_id, CAST(OLD.total_amount AS CHAR), DATE_FORMAT(OLD.sale_date, '%Y-%m-%d %H:%i:%s'));
END//

-- ---------- SALE_ITEMS ----------
DROP TRIGGER IF EXISTS sal_items_insert;
CREATE TRIGGER sal_items_insert
AFTER INSERT ON sale_items
FOR EACH ROW
BEGIN
    INSERT INTO reg_salitm (action, sale_item_id, item_id, inventory_id, sale_id, product_name, product_sku, quantity, unit_price, total_price)
    VALUES ('Agregado', NEW.id, NEW.item_id, NEW.inventory_id, NEW.sale_id, NEW.product_name, NEW.product_sku, CAST(NEW.quantity AS CHAR), CAST(NEW.unit_price AS CHAR), CAST(NEW.total_price AS CHAR));
END//

DROP TRIGGER IF EXISTS sal_items_update;
CREATE TRIGGER sal_items_update
AFTER UPDATE ON sale_items
FOR EACH ROW
BEGIN
    DECLARE changes_made BOOLEAN DEFAULT FALSE;
    DECLARE v_sale_item_id VARCHAR(200) DEFAULT OLD.id;
    DECLARE v_item_id VARCHAR(200) DEFAULT '';
    DECLARE v_inventory_id VARCHAR(200) DEFAULT '';
    DECLARE v_sale_id VARCHAR(200) DEFAULT '';
    DECLARE v_product_name VARCHAR(400) DEFAULT '';
    DECLARE v_product_sku VARCHAR(200) DEFAULT '';
    DECLARE v_quantity VARCHAR(200) DEFAULT '';
    DECLARE v_unit_price VARCHAR(200) DEFAULT '';
    DECLARE v_total_price VARCHAR(200) DEFAULT '';

    IF NOT (NEW.id <=> OLD.id) THEN
        SET v_sale_item_id = CONCAT(OLD.id, ' -> ', NEW.id);
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.item_id <=> OLD.item_id) THEN
        SET v_item_id = CONCAT(IFNULL(OLD.item_id,'N/A'), ' -> ', IFNULL(NEW.item_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.inventory_id <=> OLD.inventory_id) THEN
        SET v_inventory_id = CONCAT(IFNULL(OLD.inventory_id,'N/A'), ' -> ', IFNULL(NEW.inventory_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.sale_id <=> OLD.sale_id) THEN
        SET v_sale_id = CONCAT(IFNULL(OLD.sale_id,'N/A'), ' -> ', IFNULL(NEW.sale_id,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.product_name <=> OLD.product_name) THEN
        SET v_product_name = CONCAT(IFNULL(OLD.product_name,'N/A'), ' -> ', IFNULL(NEW.product_name,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.product_sku <=> OLD.product_sku) THEN
        SET v_product_sku = CONCAT(IFNULL(OLD.product_sku,'N/A'), ' -> ', IFNULL(NEW.product_sku,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.quantity <=> OLD.quantity) THEN
        SET v_quantity = CONCAT(IFNULL(OLD.quantity,'N/A'), ' -> ', IFNULL(NEW.quantity,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.unit_price <=> OLD.unit_price) THEN
        SET v_unit_price = CONCAT(IFNULL(OLD.unit_price,'N/A'), ' -> ', IFNULL(NEW.unit_price,'N/A'));
        SET changes_made = TRUE;
    END IF;
    IF NOT (NEW.total_price <=> OLD.total_price) THEN
        SET v_total_price = CONCAT(IFNULL(OLD.total_price,'N/A'), ' -> ', IFNULL(NEW.total_price,'N/A'));
        SET changes_made = TRUE;
    END IF;

    IF changes_made THEN
        INSERT INTO reg_salitm (action, sale_item_id, item_id, inventory_id, sale_id, product_name, product_sku, quantity, unit_price, total_price)
        VALUES ('Modificado', v_sale_item_id, v_item_id, v_inventory_id, v_sale_id, v_product_name, v_product_sku, v_quantity, v_unit_price, v_total_price);
    END IF;
END//

DROP TRIGGER IF EXISTS sal_items_delete;
CREATE TRIGGER sal_items_delete
BEFORE DELETE ON sale_items
FOR EACH ROW
BEGIN
    INSERT INTO reg_salitm (action, sale_item_id, item_id, inventory_id, sale_id, product_name, product_sku, quantity, unit_price, total_price)
    VALUES ('Borrado', OLD.id, OLD.item_id, OLD.inventory_id, OLD.sale_id, OLD.product_name, OLD.product_sku, CAST(OLD.quantity AS CHAR), CAST(OLD.unit_price AS CHAR), CAST(OLD.total_price AS CHAR));
END//

DELIMITER ;
