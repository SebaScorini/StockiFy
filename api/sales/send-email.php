<?php

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../auth_helper.php';

$data = json_decode(file_get_contents('php://input'), true);

$emailInfo = $data['emailInfo'];

