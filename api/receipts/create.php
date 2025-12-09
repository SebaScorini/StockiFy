<?php

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../auth_helper.php';

use App\core\Database;

try {
    $data = json_decode(file_get_contents('php://input'), true);

    $itemList = $data['itemList'];
    $providerID = $data['providerID'];
    $totalPrice = $data['totalPrice'];

    $pdo = Database::getInstance();
    $user = getCurrentUser();
    $user_id = $_SESSION['user_id'];

    $newReceipt = $pdo->prepare("INSERT INTO receipts (user_id, provider_id, total_amount) 
                                        VALUES (:user_id,:provider_id,:total_amount)");

    $newReceipt ->execute([
        ':user_id' => $user_id,
        ':provider_id' => $providerID,
        ':total_amount' => $totalPrice,
    ]);

    $receiptId = $pdo->lastInsertId();

    foreach($itemList as $item){
        $totalPrice = $item['receiptPrice'] * $item['amount'];
        $newReceiptItem = $pdo->prepare("INSERT INTO receipt_items (item_id,inventory_id, receipt_id,product_name, quantity, unit_price, total_price)
                                    VALUES (:item_id,:inventory_id, :receipt_id, :product_name, :quantity,:unit_price,:total_price)");
        $newReceiptItem ->execute([
            ':item_id' => $item['pID'],
            ':inventory_id' => $item['tID'],
            ':receipt_id' => $receiptId,
            ':product_name' => $item['name'],
            ':quantity' => $item['amount'],
            ':unit_price' => $item['receiptPrice'],
            ':total_price' => $totalPrice]);

        //Agrega el stock del item de la compra (Franco)
        $tableName = $pdo->prepare("SELECT table_name FROM user_tables WHERE inventory_id = :inventory_id");
        $tableName->execute([':inventory_id' => $item['tID']]);
        $tableName = $tableName->fetch();
        $updateStock = $pdo->prepare("UPDATE " . $tableName['table_name'] . " SET stock = stock + :quantity WHERE id = :item_id");
        $updateStock->execute([
            ':quantity' => $item['amount'],
            ':item_id' => $item['pID']
        ]);
    }
    $response = ['success' => true, 'receiptId' => $receiptId];
} catch (Exception $e) {
    $response = ['success' => false, 'error' => 'Ha ocurrido un error interno = ' . $e->getMessage()];
}

echo json_encode($response, JSON_NUMERIC_CHECK);


