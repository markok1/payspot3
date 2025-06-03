<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$mailto = "office@payspot.me";  // My email address
$fromEmail = $_POST['email'];  // Ensure this is set

// Getting customer data
$name = $_POST['name'];
$city = $_POST['city'];
$adress = $_POST['adress'];
$zip = $_POST['zip'];
$phone = $_POST['phone'];
$email = $_POST['email'];
$pib = $_POST['pib'];
$message = $_POST['message'];

$subject = "Kontakt sa sajta, ovlasceni agent";
$subject2 = "Potvrda: Vaš zahtev je poslat sa payspot.me"; // For customer confirmation

// Email body I will receive
$messageBody = "Ime: " . $name . "\n" .
"Grad: " . $city . "\n" .
"Adresa: " . $adress . "\n" .
"Zip: " . $zip . "\n" .
"Broj telefona: " . $phone . "\n" .
"Email: " . $email . "\n" .
"PIB: " . $pib . "\n" .
"Poruka: " . $message;

// Message for client confirmation
$messageBody2 = "Poštovani " . $name . "\n" .
"Vaš zahtev nam je stigao. Odgovorićemo Vam u najkraćem mogućem roku" . "\n\n" .
"Vaša poruka je: " . "\n" . "'" . $message . "'";

// Email headers
$headers = "From: " . $fromEmail;
$headers2 = "From: " . $mailto;

// PHP mailer function
$result1 = mail($mailto, $subject, $messageBody, $headers); // This email sent to My address
$result2 = mail($fromEmail, $subject2, $messageBody2, $headers2); // This confirmation email to client

// JSON response
$response = array();

if ($result1 && $result2) {
    $response['status'] = 'success';
    $response['message'] = 'Emails sent successfully';
} else {
    $response['status'] = 'error';
    $response['message'] = 'Failed to send emails';
}

echo json_encode($response);
?>