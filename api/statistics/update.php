<?php

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../auth_helper.php';

use App\core\Database;

try {

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$pdo = Database::getInstance();
$user = getCurrentUser();
$user_id = $_SESSION['user_id'];

$listaFechas = $data['dates'] ?? [];
$inv = $data['tableID'];

$stockVendidoGeneral = [];
$stockIngresadoGeneral = [];
$ingresosBrutosGeneral = [];
$promedioVentaGeneral = [];
$gastosGeneral = [];
$gananciaGeneral = [];

$stockVendidoTabla = [];
$stockIngresadoTabla = [];
$ingresosBrutosTabla = [];
$promedioVentaTabla = [];
$gastosTabla = [];
$gananciaTabla = [];

foreach ($listaFechas as $fechaSQL) {
    $stockVendido = $pdo->prepare("SELECT COALESCE(SUM(si.quantity), 0) AS total FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE s.user_id = ? AND DATE(s.sale_date) = ?");
    $stockVendido->execute([$user_id, $fechaSQL]);
    $stockVendido = $stockVendido->fetchAll();

    $stockIngresado = $pdo->prepare("SELECT COALESCE(SUM(ri.quantity), 0) AS total FROM receipt_items ri JOIN receipts r ON ri.receipt_id = r.id WHERE r.user_id = ? AND DATE(r.receipt_date) = ?");
    $stockIngresado->execute([$user_id, $fechaSQL]);
    $stockIngresado = $stockIngresado->fetchAll();

    $ingresosBrutos = $pdo->prepare("SELECT COALESCE(SUM(s.total_amount), 0) AS total FROM sales s WHERE s.user_id = ? AND DATE(s.sale_date) = ?");
    $ingresosBrutos->execute([$user_id, $fechaSQL]);
    $ingresosBrutos = $ingresosBrutos->fetchAll();

    $promedioVenta = $pdo->prepare("SELECT COALESCE(AVG(s.total_amount), 0) AS total FROM sales s WHERE s.user_id = ? AND DATE(s.sale_date) = ?");
    $promedioVenta->execute([$user_id, $fechaSQL]);
    $promedioVenta = $promedioVenta->fetchAll();

    $gastos = $pdo->prepare("SELECT COALESCE(SUM(r.total_amount), 0) AS total FROM receipts r WHERE r.user_id = ? AND DATE(r.receipt_date) = ?");
    $gastos->execute([$user_id, $fechaSQL]);
    $gastos = $gastos->fetchAll();

    $stockVendidoVal = (int)($stockVendido[0]['total'] ?? 0);
    $stockIngresadoVal = (int)($stockIngresado[0]['total'] ?? 0);
    $ingresosBrutosVal = (float)($ingresosBrutos[0]['total'] ?? 0.0);
    $promedioVentaVal = (float)($promedioVenta[0]['total'] ?? 0.0);
    $gastosVal = (float)($gastos[0]['total'] ?? 0.0);
    $gananciaVal = $ingresosBrutosVal - $gastosVal;

    $stockVendidoGeneral[] = $stockVendidoVal;
    $stockIngresadoGeneral[] = $stockIngresadoVal;
    $ingresosBrutosGeneral[] = $ingresosBrutosVal;
    $promedioVentaGeneral[] = $promedioVentaVal;
    $gastosGeneral[] = $gastosVal;
    $gananciaGeneral[] = $gananciaVal;

    // ventas por inventario
    $stockVendidoT = $pdo->prepare("SELECT COALESCE(SUM(si.quantity), 0) AS total FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.inventory_id = ? AND DATE(s.sale_date) = ?");
    $stockVendidoT->execute([$inv, $fechaSQL]);
    $stockVendidoT = $stockVendidoT->fetchAll();

    $ingresosBrutosT = $pdo->prepare("SELECT COALESCE(SUM(si.quantity * COALESCE(si.unit_price,0)), 0) AS total FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.inventory_id = ? AND DATE(s.sale_date) = ?");
    $ingresosBrutosT->execute([$inv, $fechaSQL]);
    $ingresosBrutosT = $ingresosBrutosT->fetchAll();

    $promedioVentaT = $pdo->prepare("SELECT COALESCE(AVG(COALESCE(si.unit_price,0))) AS total FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.inventory_id = ? AND DATE(s.sale_date) = ?");
    $promedioVentaT->execute([$inv, $fechaSQL]);
    $promedioVentaT = $promedioVentaT->fetchAll();

    $stockIngresadoT = $pdo->prepare("SELECT COALESCE(SUM(ri.quantity), 0) AS total FROM receipt_items ri JOIN receipts r ON ri.receipt_id = r.id WHERE ri.inventory_id = ? AND DATE(r.receipt_date) = ?");
    $stockIngresadoT->execute([$inv, $fechaSQL]);
    $stockIngresadoT = $stockIngresadoT->fetchAll();

    $gastosT = $pdo->prepare("SELECT COALESCE(SUM(ri.quantity * COALESCE(ri.unit_price,0)), 0) AS total FROM receipt_items ri JOIN receipts r ON ri.receipt_id = r.id WHERE ri.inventory_id = ? AND DATE(r.receipt_date) = ?");
    $gastosT->execute([$inv, $fechaSQL]);
    $gastosT = $gastosT->fetchAll();

    $stockVendidoValT = (int)($stockVendidoT[0]['total'] ?? 0);
    $stockIngresadoValT = (int)($stockIngresadoT[0]['total'] ?? 0);
    $ingresosBrutosValT = (float)($ingresosBrutosT[0]['total'] ?? 0.0);
    $promedioVentaValT = (float)($promedioVentaT[0]['total'] ?? 0.0);
    $gastosValT = (float)($gastosT[0]['total'] ?? 0.0);
    $gananciaValT = $ingresosBrutosValT - $gastosValT;

    $stockVendidoTabla[] = $stockVendidoValT;
    $stockIngresadoTabla[] = $stockIngresadoValT;
    $ingresosBrutosTabla[] = $ingresosBrutosValT;
    $promedioVentaTabla[] = $promedioVentaValT;
    $gastosTabla[] = $gastosValT;
    $gananciaTabla[] = $gananciaValT;
}

$response = [
    'stockVendidoGeneral' => $stockVendidoGeneral,
    'stockIngresadoGeneral' => $stockIngresadoGeneral,
    'ingresosBrutosGeneral' => $ingresosBrutosGeneral,
    'gastosGeneral' => $gastosGeneral,
    'gananciaGeneral' => $gananciaGeneral,
    'promedioVentaGeneral' => $promedioVentaGeneral,

    'stockVendidoTable' => $stockVendidoTabla,
    'stockIngresadoTable' => $stockIngresadoTabla,
    'ingresosBrutosTable' => $ingresosBrutosTabla,
    'gastosTable' => $gastosTabla,
    'gananciaTable' => $gananciaTabla,
    'promedioVentaTable' => $promedioVentaTabla,
];

echo json_encode($response, JSON_NUMERIC_CHECK);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'An unexpected error occurred: ' . $e->getMessage()]);
}
