<?php
namespace App\Models;

use Exception;

class ImportModel
{
    public function parseCsvHeaders(string $filePath): array
    {
        if (!file_exists($filePath)) {
            throw new Exception("El archivo no existe.");
        }
        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            throw new Exception("No se pudo abrir el archivo CSV.");
        }

        $headers = fgetcsv($handle, 0, ',');
        fclose($handle);

        if ($headers === false || count($headers) === 0) {
            throw new Exception("El archivo CSV parece estar vacío o dañado.");
        }

        return array_map(function($h) {
            return trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $h));
        }, $headers);
    }

    public function parseCsvDataWithMapping(string $filePath, array $mapping): array
    {
        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            throw new Exception("No se pudo abrir el archivo CSV para procesar.");
        }

        $headers = fgetcsv($handle, 0, ',');
        if ($headers === false) {
            fclose($handle);
            throw new Exception("Error al leer la cabecera del archivo CSV.");
        }

        $headerMap = [];
        foreach ($headers as $index => $name) {
            $cleanName = trim(preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $name));
            $headerMap[strtolower($cleanName)] = $index;
        }

        $parsedData = [];

        while (($rowData = fgetcsv($handle, 0, ',')) !== false) {
            if (count($rowData) === 1 && $rowData[0] === null) continue;

            $newRow = [];
            $hasData = false;

            foreach ($mapping as $dbCol => $csvColName) {
                if ($csvColName === '__EMPTY__') {
                    $isNumericCol = in_array(strtolower($dbCol), ['stock', 'min_stock', 'sale_price', 'receipt_price', 'hard_gain', 'percentage_gain']);
                    $newRow[$dbCol] = $isNumericCol ? 0 : 'N/A';
                    $hasData = true;
                }
                else {
                    $lookupName = strtolower(trim($csvColName));
                    if (isset($headerMap[$lookupName])) {
                        $index = $headerMap[$lookupName];
                        $val = isset($rowData[$index]) ? trim($rowData[$index]) : null;
                        if ($val === '') $val = null;
                        $newRow[$dbCol] = $val;
                        $hasData = true;
                    }
                }
            }

            if ($hasData) {
                $parsedData[] = $newRow;
            }
        }

        fclose($handle);
        return $parsedData;
    }
}