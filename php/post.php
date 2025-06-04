<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$mailto = "office@payspot.me";

// Get posted data safely
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$company = $_POST['company'] ?? '';
$pib = $_POST['pib'] ?? '';
$subject = $_POST['subject'] ?? 'Nema teme';
$phone = $_POST['phone'] ?? '';
$message = $_POST['message'] ?? '';

// Build message body
$messageBody = "Ime: $name\n"
             . "Email: $email\n"
             . "Firma: $company\n"
             . "PIB: $pib\n"
             . "Telefon: $phone\n\n"
             . "Poruka:\n$message";

$messageBody2 = "Poštovani $name,\n\n"
              . "Vaš zahtev je uspešno primljen. Odgovorićemo u najkraćem roku.\n\n"
              . "Vaša poruka:\n\"$message\"\n\n"
              . "Srdačno,\nTim PaySpot";

// Headers
$headers = "From: $email";
$headers2 = "From: $mailto";

// Send emails
$result1 = mail($mailto, $subject, $messageBody, $headers);
$result2 = mail($email, "Potvrda: Vaš zahtev je poslat sa payspot.me", $messageBody2, $headers2);

// Return response
$response = [];

if ($result1 && $result2) {
    $response['status'] = 'success';
    $response['message'] = 'Poruka je uspešno poslata.';
} else {
    $response['status'] = 'error';
    $response['message'] = 'Greška pri slanju poruke.';
}

echo json_encode($response);
?>
