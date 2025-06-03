<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$mailto = "office@payspot.me";  //My email address
$fromEmail = $_POST['email'];  // Ensure this is set

//getting customer data
$name = $_POST['name'];
$email = $_POST['email'];
$subject = $_POST['subject'];
$message = $_POST['message'];


$subject2 = "Potvrda: Vaš zahtev je poslat sa payspot.me"; // For customer confirmation

//Email body I will receive
$messageBody = "Klijent: " . "\n" . $name . "\n\n" .
"Email: " . "\n" . $email . "\n\n" .
"Poruka klijenta: " . "\n" . $message;

//Message for client confirmation
$messageBody2 = "Postovani " . $name . "\n"
. "Vaš zahtev nam je stigao. Odgovorićemo Vam u najkraćem mogućem roku" . "\n\n"
. "Vaša poruka je: " . "\n" . "'" . $message . "'" . "\n\n";

//Email headers
$headers = "From: " . $fromEmail; // Client email, I will receive
$headers2 = "From: " . $mailto; // This will receive client

//PHP mailer function

 $result1 = mail($mailto, $subject, $messageBody, $headers); // This email sent to My address
 $result2 = mail($fromEmail, $subject2, $messageBody2, $headers2); //This confirmation email to client

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
