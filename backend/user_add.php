<?php
include 'config.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// Include PHPMailer for email functionality
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'PHPMailer/vendor/autoload.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Capture form data
    $password = $_POST['password']; 
    $usernameD = $_POST['username'];
    $usertype = $_POST['usertype'];
    $id = $_POST['employee_id'];
    $department = $_POST['department'] ?? null; // Capture the department value if provided
    $active = "1";

    // Check if the username already exists
    $checkStmt = $conn->prepare("SELECT COUNT(*) FROM user WHERE username = ?");
    $checkStmt->bind_param("s", $usernameD);
    $checkStmt->execute();
    $checkStmt->bind_result($count);
    $checkStmt->fetch();
    $checkStmt->close();

    if ($count > 0) {
        echo json_encode(['success' => false, 'message' => 'Username already exists.']);
        exit;
    }

    // Fetch employee details
    $empStmt = $conn->prepare("SELECT firstname, lastname, mobile, location, photo, employee_id, email FROM employee WHERE id = ?");
    $empStmt->bind_param("s", $id);
    $empStmt->execute();
    $empStmt->bind_result($firstname, $lastname, $mobile, $location, $photo, $employee_id, $email);
    $found = $empStmt->fetch();
    $empStmt->close();

    if (!$found) {
        echo json_encode(['success' => false, 'message' => 'Employee not found.']);
        exit;
    }

    // Prepare SQL to insert user details, including the department (if provided)
    $stmt = $conn->prepare("INSERT INTO user (firstname, lastname, username, email, usertype, mobile, location, employee_id, photo, is_active, password, ttype) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssssssss", 
        $firstname, 
        $lastname, 
        $usernameD, 
        $email, 
        $usertype, 
        $mobile, 
        $location, 
        $employee_id, 
        $photo, 
        $active, 
        $password, 
        $department
    );

    if ($stmt->execute()) {
        // User inserted successfully, now handle email sending
        $lstId = mysqli_insert_id($conn);

        // Fetch SMTP settings
        $smtpQuery = "SELECT * FROM smtp";
        $smtpResult = mysqli_query($conn, $smtpQuery);
        $smtpData = mysqli_fetch_assoc($smtpResult);

        $username = $smtpData['username'];
        $passwordD = $smtpData['password'];
        $host = $smtpData['host'];
        $smtpsecure = $smtpData['smtpsecure'];
        $port = $smtpData['port'];
        $fromname = $smtpData['fromname'];
        $from = $smtpData['frommail'];
        $sub = "SAMPAT - AMS Login Details";
        $to = $email;

        // Email content
        $mailtxt = '<table align="center" border="0" cellspacing="3" cellpadding="3" width="100%" style="background:#f5f5f5; color: black; margin-top:10px;">
            <tbody>
            <tr>
                <td colspan="2" style="font-weight:bold;text-align:center;font-size:17px;">SAMPAT - Asset Management System - Login Details</td>
            </tr>
            <tr>
                <td><span style="font-weight:bold;">Dear ' . $firstname . '</span><br><br> 
                    Welcome to SAMPAT - Asset Management System.<br><br>
                    Username: ' . $usernameD . '<br>
                    Password: ' . $password . '<br><br>
                    Kindly login with credentials.<br><br>
                    Regards,<br>SAMPAT
                </td>
            </tr>
            </tbody>
        </table>';

        // Configure PHPMailer
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
            echo json_encode(['success' => false, 'message' => 'User added, but email could not be sent.']);
        } else {
            echo json_encode(['success' => true, 'message' => 'User added successfully and email sent.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}

$conn->close();
