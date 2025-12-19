<?php
namespace App\Models;

use App\core\Database;
use Exception;
use PDO;

class TableModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    /**
     * Obtiene los metadatos de una tabla de usuario (nombre real y columnas).
     * @param int $inventoryId El ID del inventario activo.
     * @return array|false Un array con 'table_name' y 'columns_json' o false si no se encuentra.
     */
    public function getTableMetadata(int $inventoryId): array|false
    {
        $stmt = $this->db->prepare("SELECT table_name, columns_json FROM user_tables WHERE inventory_id = :id");
        $stmt->execute([':id' => $inventoryId]);
        return $stmt->fetch();
    }

    /**
     * Obtiene todos los datos de una tabla específica.
     * @param string $tableName El nombre real y seguro de la tabla (ej: user_1_mi_tienda).
     * @return array Una lista de todas las filas de la tabla.
     */
    public function getData(string $tableName): array
    {
        $safeTableName = "`" . str_replace("`", "``", $tableName) . "`";
        $stmt = $this->db->query("SELECT * FROM {$safeTableName}");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Inserta múltiples filas de datos en una tabla dinámica.
     * @param string $tableName Nombre real de la tabla (user_X_...).
     * @param array $data Array de arrays asociativos ['columna' => 'valor'].
     * @param bool $overwrite Si es true, trunca la tabla antes de insertar.
     * @return int Número de filas insertadas.
     * @throws \PDOException Si ocurre un error SQL.
     */
    public function bulkInsertData(string $tableName, array $data, bool $overwrite = false): int
    {
        if (empty($data)) {
            return 0;
        }

        $safeTableName = "`" . str_replace("`", "``", $tableName) . "`";

        $this->db->beginTransaction();

        try {
            if ($overwrite) {
                $this->db->exec("TRUNCATE TABLE {$safeTableName}");
            }

            $columns = array_keys($data[0]);
            $safeColumns = array_map(fn($col) => "`" . str_replace("`", "``", $col) . "`", $columns);
            $placeholders = implode(',', array_fill(0, count($columns), '?'));

            $sql = "INSERT INTO {$safeTableName} (" . implode(',', $safeColumns) . ") VALUES ({$placeholders})";
            $stmt = $this->db->prepare($sql);

            $insertedCount = 0;
            foreach ($data as $row) {
                $values = [];
                foreach($columns as $col) {
                    $values[] = $row[$col] ?? null;
                }
                if ($stmt->execute($values)) {
                    $insertedCount++;
                } else {
                    error_log("Error al insertar fila en {$tableName}: " . implode(', ', $stmt->errorInfo()));
                }
            }

            $this->db->commit();
            return $insertedCount;

        } catch (\PDOException $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function updateItemValue(string $tableName, int $itemId, string $columnName, mixed $newValue): bool
    {
        // Seguridad: Sanitizar nombres
        $safeTableName = "`" . str_replace("`", "``", $tableName) . "`";
        // Asumimos que $columnName ya viene sanitizado o lo sanitizamos acá si es necesario
        $safeColumnName = "`" . str_replace("`", "``", $columnName) . "`";

        $sql = "UPDATE {$safeTableName} SET {$safeColumnName} = :newValue WHERE id = :id";
        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':newValue' => $newValue,
            ':id' => $itemId
        ]);
    }

    /**
     * Ajusta (suma o resta) el valor numérico de una columna (ej: Stock).
     *
     * @param string $tableName Nombre real de la tabla.
     * @param int $itemId ID de la fila.
     * @param string $stockColumnName Nombre de la columna de stock.
     * @param int $amountToAddOrSubtract Cantidad a sumar (positivo) o restar (negativo).
     * @return int|false El nuevo valor del stock o false si falló.
     */
    public function adjustStock(string $tableName, int $itemId, string $stockColumnName, int $amountToAddOrSubtract): int|false
    {
        // Seguridad
        $safeTableName = "`" . str_replace("`", "``", $tableName) . "`";
        $safeStockColumn = "`" . str_replace("`", "``", $stockColumnName) . "`";

        $this->db->beginTransaction();

        try {
            $sqlSelect = "SELECT {$safeStockColumn} FROM {$safeTableName} WHERE id = :id FOR UPDATE";
            $stmtSelect = $this->db->prepare($sqlSelect);
            $stmtSelect->execute([':id' => $itemId]);
            $currentStock = $stmtSelect->fetchColumn();

            if ($currentStock === false) {
                throw new Exception("Item no encontrado.");
            }

            $newStock = (int)$currentStock + $amountToAddOrSubtract;

            if ($newStock < 0) {
                throw new Exception("Stock insuficiente. Stock actual: {$currentStock}, se intentó quitar: " . abs($amountToAddOrSubtract));
            }

            $sqlUpdate = "UPDATE {$safeTableName} SET {$safeStockColumn} = :newStock WHERE id = :id";
            $stmtUpdate = $this->db->prepare($sqlUpdate);
            $success = $stmtUpdate->execute([
                ':newStock' => $newStock,
                ':id' => $itemId
            ]);

            if ($success) {
                $this->db->commit();
                return $newStock;
            } else {
                throw new Exception("Error al actualizar el stock en la base de datos.");
            }

        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error en adjustStock: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Inserta una nueva fila de datos en una tabla dinámica.
     *
     * @param string $tableName Nombre real de la tabla (user_X_...).
     * @param array $data Array asociativo ['columna' => 'valor'] con los datos a insertar.
     * @return array|false La fila recién insertada (incluyendo ID) o false si falla.
     */
    public function insertItem(string $tableName, array $data): array|false
    {
        $safeTableName = "`" . str_replace("`", "``", $tableName) . "`";

        $columns = [];
        $values = [];
        $placeholders = [];
        foreach ($data as $key => $value) {
            $trimmedKey = trim($key);
            if (strcasecmp($trimmedKey, 'id') !== 0 && strcasecmp($trimmedKey, 'created_at') !== 0) {
                $safeColumn = "`" . str_replace("`", "``", $trimmedKey) . "`";
                $columns[] = $safeColumn;
                $values[] = $value; // Guardo el valor
                $placeholders[] = '?'; // Añado un placeholder
            }
        }

        if (empty($columns)) {
            error_log("Intento de insertar fila vacía o solo con columnas automáticas en {$tableName}");
            return false;
        }

        $sql = "INSERT INTO {$safeTableName} (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare($sql);
            if ($stmt->execute($values)) {
                $newId = $this->db->lastInsertId();
                $selectStmt = $this->db->prepare("SELECT * FROM {$safeTableName} WHERE id = ?");
                $selectStmt->execute([$newId]);
                $newRow = $selectStmt->fetch(PDO::FETCH_ASSOC);

                $this->db->commit();
                return $newRow ?: false;
            } else {
                throw new \PDOException("Error al ejecutar la inserción: " . implode(', ', $stmt->errorInfo()));
            }
        } catch (\PDOException $e) {
            $this->db->rollBack();
            error_log("Error en TableModel::insertItem: " . $e->getMessage());
            return false;
        }
    }

    
}