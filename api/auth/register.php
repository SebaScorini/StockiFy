<?php

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../auth_helper.php';

use App\Controllers\AuthController;

// Aseguro que las respuestas sean JSON y convierto errores fatales/excepciones en JSON
header('Content-Type: application/json');

set_exception_handler(function ($e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'type' => 'exception'
    ]);
    exit;
});

set_error_handler(function ($severity, $message, $file, $line) {
    // Convertir errores a Excepciones para que el exception handler los capture
    throw new \ErrorException($message, 0, $severity, $file, $line);
});

register_shutdown_function(function () {
    $err = error_get_last();
    if ($err !== null) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $err['message'],
            'file' => $err['file'],
            'line' => $err['line'],
            'type' => 'shutdown'
        ]);
        exit;
    }
});

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$authController = new AuthController();
$authController->register($data);