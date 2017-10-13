<?php
    header("Access-Control-Allow-Origin:*");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header('Access-Control-Allow-Headers: X-HTTP-Method-Override, Content-Type, x-requested-with');
    header('Content-Type: application/json');

    require_once(dirname(__FILE__) . '/emailHandler.php');

    $mail = new Email();

    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $phone = $_POST['phone'];
    $email = $_POST['email'];
    $question = $_POST['question'];
    $mls_id = $_POST['mls_id'];
    $mls_num = $_POST['mls_num'];

    $subject = 'Submit a question';
    $body = "Hi,\n\n $question \n\n";
    $body .= "Listing: \n mls id: $mls_id \n mls#: $mls_num \n\n";
    $body .= "Contact me at $phone.\n\n";
    $body .= "Kind regards";

    $mail->setup();
    $mail->buildEmail($email, $subject, $body);
    $mail->send();
?>