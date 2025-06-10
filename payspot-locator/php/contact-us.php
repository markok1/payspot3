<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Set your email
$mailto = "pos@payspot.me";

// Get posted form data
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$company = $_POST['company'] ?? '';
$pib = $_POST['pib'] ?? '';
$subject = $_POST['subject'] ?? 'Nema teme';
$phone = $_POST['phone'] ?? '';
$message = $_POST['message'] ?? '';

// Prepare email content
$messageBody = "Ime: $name\n"
             . "Email: $email\n"
             . "Naziv firme: $company\n"
             . "PIB: $pib\n"
             . "Telefon: $phone\n\n"
             . "Poruka:\n$message";

$messageBody2 = "Poštovani $name,\n\n"
              . "Vaš zahtev nam je stigao. Odgovorićemo Vam u najkraćem mogućem roku.\n\n"
              . "Vaša poruka:\n\"$message\"\n\n"
              . "Srdačan pozdrav,\nTim PaySpot";

// Email headers
$headers = "From: $email";
$headers2 = "From: $mailto";

// Send emails
$result1 = mail($mailto, $subject, $messageBody, $headers); // to admin
$result2 = mail($email, "Potvrda: Vaš zahtev je poslat sa payspot.me", $messageBody2, $headers2); // to client

// JSON response
$response = [];

if ($result1 && $result2) {
    $response['status'] = 'success';
    $response['message'] = 'Poruka uspešno poslata.';
} else {
    $response['status'] = 'error';
    $response['message'] = 'Slanje poruke nije uspelo.';
}

echo json_encode($response);

?>
