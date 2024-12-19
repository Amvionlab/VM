<?php
include 'config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'PHPMailer/vendor/autoload.php';

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Extract data from POST
    $password = $_POST['password']; 
    $usernameD = $_POST['username'];
    $usertype = $_POST['usertype'];
    $id = $_POST['employee_id'];
    $active = "1";
    
    // Check if the username already exists
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM user WHERE username = ?");
    $checkStmt->bind_param("s", $usernameD);
    $checkStmt->execute();
    $checkStmt->bind_result($count);
    $checkStmt->fetch();
    $checkStmt->close();

    if ($count > 0) {
        $response = array('success' => false, 'message' => 'Username already exists.');
        echo json_encode($response);
        exit;
    }

    // Fetch employee details based on employee_id
    $empStmt = $conn->prepare("SELECT firstname, lastname, mobile, location, photo, employee_id, email FROM employee WHERE id = ?");
    $empStmt->bind_param("s", $id);
    $empStmt->execute();
    $empStmt->bind_result($firstname, $lastname, $mobile, $location, $photo, $employee_id, $email);
    $found = $empStmt->fetch();
    $empStmt->close();

    // Check if employee exists
    if (!$found) {
        $response = array('success' => false, 'message' => 'Employee not found.');
        echo json_encode($response);
        exit;
    }

    // Prepare to insert the new user
    $stmt = $conn->prepare("INSERT INTO user (firstname, lastname, username, email, usertype, mobile, location, employee_id, photo, is_active, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssssss", $firstname, $lastname, $usernameD, $email, $usertype, $mobile, $location, $employee_id, $photo, $active, $password);

    if ($stmt->execute()) {
        $lstId = mysqli_insert_id($conn);
        $rq = mysqli_fetch_array(mysqli_query($conn, "SELECT * FROM smtp"));
        $username = $rq['username'];
        $passwordD = $rq['password'];
        $host = $rq['host'];
        $smtpsecure = $rq['smtpsecure'];
        $port = $rq['port'];
        $fromname = $rq['fromname'];
        $from = $rq['frommail'];
        $sub = "SAMPAT - AMS Login Details";
        $to = $email;

        // Set up email content
        $mailtxt = '<table align="center" border="0" cellspacing="3" cellpadding="3" width="100%" style="background:#f5f5f5; color: black; margin-top:10px;">
            <tbody>
            <tr>
            <td colspan="2" style="font-weight:bold;text-align:center;font-size:17px;">SAMPAT - Asset Management System - Login Details</td>
            </tr>
            <tr>
            <td><span style="font-weight:bold;">Dear ' . $firstname . '</span><br><br> Welcome to SAMPAT - Asset Management System. <br><br>Username: ' . $usernameD . '<br>Password: ' . $password . '<br><br> Kindly login with credentials.<br><br>Regards,<br>SAMPAT</td>
            </tr>
            </tbody>
            </table>';

        // Set up PHPMailer
        $mail = new PHPMailer();
        $mail->IsSMTP();
        $mail->SMTPDebug = 0;
        $mail->Host = $host;
        $mail->SMTPSecure = $smtpsecure;
        $mail->Port = $port;
        $mail->SMTPAuth = true;
        $mail->Username = $username;
        $mail->Password = $passwordD;

        $mail->FromName = $fromname;
        $mail->From = $from;
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = $sub;
        $mail->Body = $mailtxt;

        if (!$mail->send()) {
            $response = array('success' => false, 'message' => 'User added, but email could not be sent.');
        } else {
            $response = array('success' => true, 'message' => 'User added successfully and email sent.');
        }
        echo json_encode($response);
    } else {
        $response = array('success' => false, 'message' => 'Database error: ' . $stmt->error);
        echo json_encode($response);
    }

    $stmt->close();
} else {
    $response = array('success' => false, 'message' => 'Invalid request method.');
    echo json_encode($response);
}

$conn->close();
