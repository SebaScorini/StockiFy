<?php

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../auth_helper.php';

$user = getCurrentUser();
use App\core\Database;

function execConsult($query, $params = []) {
    $conn = Database::getInstance();
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

$tableNames = ['user_2_Inventario1', 'user_2_Inventario2'];
$productIDList = [6,12];
$placeholders = implode(',', array_fill(0, count($productIDList), '?'));

foreach ($tableNames as $tableName) {
    $sql = "SELECT * FROM `$tableName` WHERE id IN ({$placeholders})";
    $resultado = execConsult($sql, $productIDList);
    print_r($resultado);
}


