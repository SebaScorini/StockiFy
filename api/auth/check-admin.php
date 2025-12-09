<?php

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../auth_helper.php';


try{
    $user = getCurrentUser();
    $isAdmin = $user['is_admin'] == 1;

    $response = ['success' => true, 'isAdmin' => $isAdmin];

    echo json_encode($response, JSON_NUMERIC_CHECK);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Ha ocurrido un error interno']);
}
