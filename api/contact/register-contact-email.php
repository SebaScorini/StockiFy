<?php


require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../auth_helper.php';

use App\core\Database;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

$data = json_decode(file_get_contents('php://input'), true);

try {
    $pdo = Database::getInstance();

    $contactData = $data;

    $stmt = $pdo->prepare("INSERT INTO contact_submissions (full_name, email, phone, subject, message) 
                                    VALUES (:full_name, :email, :phone, :subject, :message)");
    $stmt ->execute([
        ':full_name' => $contactData['full_name'],
        ':email' =>$contactData['email'],
        ':phone' => $contactData['phone'],
        ':subject' => $contactData['subject'],
        ':message' => $contactData['message']]);

    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'no.reply.stockify02@gmail.com';
    $mail->Password   = 'hcgu fjli kali vbcw';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;

    $mail->setFrom('no.reply.stockify02@gmail.com', 'StockiFy Admin'); // Quien envía
    $mail->addAddress('stockifycontact@gmail.com', 'Contacto StockiFy'); // Quien recibe

    $mail->isHTML(true);
    $mail->Subject = $contactData['subject'] . ' (Mensaje de contacto de ' . $contactData['full_name'] . ')';
    $mail->Body    = $contactData['message'] . '<br><br>Email = ' . $contactData['email'];
    $mail->AltBody = strip_tags($contactData['message']) . '\n\nEmail = ' . $contactData['email'];

    $mail->send();

    $response = ['success' => true];

} catch (PHPMailerException $e) {
    $response = ['success' => false, 'error' => 'El mensaje no pudo ser enviado. Mailer Error: ' . $mail->ErrorInfo];
} catch (Exception $e) {
    $response = ['success' => false, 'error' => $e->getMessage()];
}

echo json_encode($response, JSON_NUMERIC_CHECK);




