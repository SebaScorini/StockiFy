<?php
namespace App\Controllers;

use App\Models\ImportModel;
use App\Models\TableModel;
use Exception;


class ImportController
{
    /**
     * Handles the request to get CSV headers from an uploaded file.
     */
    public function getCsvHeaders(): void
    {
        header('Content-Type: application/json');
        $user = getCurrentUser();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autorizado.']);
            return;
        }

        if (empty($_FILES['csvFile']) || $_FILES['csvFile']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            $errorMessage = $this->getUploadErrorMessage($_FILES['csvFile']['error'] ?? UPLOAD_ERR_NO_FILE);
            echo json_encode(['success' => false, 'message' => $errorMessage]);
            return;
        }

        $fileTmpPath = $_FILES['csvFile']['tmp_name'];
        $fileType = mime_content_type($fileTmpPath);

        if ($fileType !== 'text/csv' && $fileType !== 'text/plain' && $fileType !== 'application/csv') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Tipo de archivo inválido. Sube un archivo CSV. (' . $fileType . ')']);
            return;
        }


        try {
            $importModel = new ImportModel();
            $headers = $importModel->parseCsvHeaders($_FILES['csvFile']['tmp_name']);
            $csvHeaders = $importModel->parseCsvHeaders($fileTmpPath);


            echo json_encode([
                'success' => true,
                'csvHeaders' => $csvHeaders,
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        } finally {
            if (isset($fileTmpPath) && file_exists($fileTmpPath)) {
                @unlink($fileTmpPath);
            }
        }
    }

    /**
     * Helper function to get user-friendly upload error messages.
     */
    private function getUploadErrorMessage(int $errorCode): string
    {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return 'El archivo subido excede el tamaño máximo permitido.';
            case UPLOAD_ERR_PARTIAL:
                return 'El archivo se subió solo parcialmente.';
            case UPLOAD_ERR_NO_FILE:
                return 'No se subió ningún archivo.';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Falta la carpeta temporal del servidor.';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Error al escribir el archivo en el disco.';
            case UPLOAD_ERR_EXTENSION:
                return 'Una extensión de PHP detuvo la subida del archivo.';
            default:
                return 'Error desconocido durante la subida del archivo.';
        }
    }

    /**
     * Procesa el archivo CSV subido con el mapeo, lo valida (parsea)
     * y guarda los datos parseados en la sesión.
     */
    public function processCsvPreparation(): void
    {
        header('Content-Type: application/json');
        $user = getCurrentUser();

        if (!$user) { http_response_code(401); return; }

        if (empty($_FILES['csvFile']) || $_FILES['csvFile']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success'=>false, 'message'=>'Error de archivo']);
            return;
        }
        if (empty($_POST['mapping'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No se proporcionó el mapeo de columnas.']);
            return;
        }

        $fileTmpPath = $_FILES['csvFile']['tmp_name'];
        $mappingJson = $_POST['mapping'];
        //$overwrite = isset($_POST['overwrite']) && $_POST['overwrite'] === 'true';

        $rawOverwrite = $_POST['overwrite'] ?? 'false';
        $overwrite = filter_var($rawOverwrite, FILTER_VALIDATE_BOOLEAN);

        $mapping = json_decode($mappingJson, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($mapping)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El formato del mapeo es inválido.']);
            return;
        }

        try {
            $importModel = new ImportModel();
            // Parseamos TODO el archivo según el mapeo
            $parsedData = $importModel->parseCsvDataWithMapping($fileTmpPath, $mapping);

            $_SESSION['pending_import_data'] = $parsedData;
            $_SESSION['pending_import_overwrite'] = $overwrite;

            session_write_close();

            echo json_encode([
                'success' => true,
                'message' => 'Archivo validado y datos preparados para importar.',
                'rowCount' => count($parsedData)
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error al procesar el archivo CSV: ' . $e->getMessage()]);
            unset($_SESSION['pending_import_data']);
            unset($_SESSION['pending_import_overwrite']);
        }
    }

    /**
     * Inserta los datos pendientes y gestiona la fusión de datos si es reemplazo.
     */
    public function executeImport(): void
    {
        // Configuración de errores para JSON limpio
        ini_set('display_errors', 0);
        error_reporting(E_ALL);

        header('Content-Type: application/json');

        try {
            $user = getCurrentUser();
            $activeInventoryId = $_SESSION['active_inventory_id'] ?? null;
            $preparedData = $_SESSION['pending_import_data'] ?? null;
            $overwrite = $_SESSION['pending_import_overwrite'] ?? false;

            if (!$user || !$activeInventoryId) {
                throw new Exception('Acceso denegado o sin inventario.');
            }
            if (empty($preparedData) || !is_array($preparedData)) {
                throw new Exception('No hay datos preparados para importar.');
            }

            $tableModel = new TableModel();
            $metadata = $tableModel->getTableMetadata($activeInventoryId);
            if (!$metadata) throw new Exception("Metadatos no encontrados.");
            $tableName = $metadata['table_name'];

            $db = \App\core\Database::getInstance();
            $safeTable = "`" . str_replace("`", "``", $tableName) . "`";
            $stmt = $db->query("SHOW COLUMNS FROM $safeTable");
            $allColumns = $stmt->fetchAll(\PDO::FETCH_COLUMN);
            $targetColumns = array_filter($allColumns, function($c) {
                return !in_array(strtolower($c), ['id', 'created_at', 'updated_at']);
            });

            $existingData = [];
            if ($overwrite) {
                $existingData = array_values($tableModel->getData($tableName));
            }

            // 2. Fusionamos fila por fila
            foreach ($preparedData as $index => &$newRow) {
                $oldRow = $existingData[$index] ?? [];

                foreach ($targetColumns as $colName) {
                    if (array_key_exists($colName, $newRow)) {
                        continue;
                    }

                    if (array_key_exists($colName, $oldRow)) {
                        $newRow[$colName] = $oldRow[$colName];
                    } else {
                        $newRow[$colName] = null;
                    }
                }
            }
            unset($newRow);
            $insertedRows = $tableModel->bulkInsertData($tableName, $preparedData, $overwrite);

            echo json_encode([
                'success' => true,
                'message' => "Importación completada. {$insertedRows} registros procesados.",
                'insertedRows' => $insertedRows
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        } finally {
            unset($_SESSION['pending_import_data']);
            unset($_SESSION['pending_import_overwrite']);
        }
    }
}