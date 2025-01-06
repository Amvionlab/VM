<?php
include 'config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/vendor/autoload.php';

// Debug: Print received GET parameters
$id = isset($_GET['id']) ? $_GET['id'] : null;
$value = isset($_GET['value']) ? $_GET['value'] : null;
echo "Received GET parameters: id=" . htmlspecialchars($id) . ", value=" . htmlspecialchars($value) . "<br>";

if ($id && $value) {

    if ($id == 1) {
        $stmt = $conn->prepare("SELECT firstname, lastname, email, username, password FROM user WHERE id = ?");
        $stmt->bind_param("i", $value);
        $stmt->execute();
        $stmt->bind_result($firstname, $lastname, $email, $usernameD, $password);
        $stmt->fetch();
        $stmt->close();

        $emails = [$email]; // As an array with a single email

        $placeholders = ['{firstname}', '{password}', '{username}'];
        $values = [$firstname, $password, $usernameD];
    } else if ($id == 2) {
        $stmt = $conn->prepare("SELECT `tag`, `type`, `from_location`, `to_location`, `transfer_type`, `till_date`, `transfer_by`, `transfer_on` FROM transfer WHERE id = ?");
        $stmt->bind_param("i", $value);
        $stmt->execute();
        $stmt->bind_result($tag, $type, $from, $to, $ttype, $till, $by, $at);
        $stmt->fetch();
        $stmt->close();

        $stmt = $conn->prepare("SELECT `name` FROM branch WHERE id = ?");
        $stmt->bind_param("i", $from);
        $stmt->execute();
        $stmt->bind_result($fromname);
        $stmt->fetch();
        $stmt->close();

        $stmt = $conn->prepare("SELECT `name` FROM branch WHERE id = ?");
        $stmt->bind_param("i", $to);
        $stmt->execute();
        $stmt->bind_result($toname);
        $stmt->fetch();
        $stmt->close();

        if ($ttype == '1') {
            $ttype = "Permanent";
        } else if ($ttype == '2') {
            $ttype = "Temporary";
        }
        if ($till == "0000-00-00") {
            $till = "Permanent";
        }

        $placeholders = [
            '{tag}',
            '{type}',
            '{from}',
            '{to}',
            '{ttype}',
            '{till}',
            '{by}',
            '{at}'
        ];

        $values = [
            $tag,
            $type,
            $fromname,
            $toname,
            $ttype,
            $till,
            $by,
            $at
        ];

        // Fetch emails for the given branch and user types
        $stmt = $conn->prepare("SELECT email FROM user WHERE branch = ? AND usertype IN ( 2, 3, 4, 5, 6, 7)");
        $stmt->bind_param("i", $to);
        $stmt->execute();
        $stmt->bind_result($email);
        $emails = [];
        while ($stmt->fetch()) {
            $emails[] = $email; // Collect all fetched emails
        }
        $stmt->close();
    }

    if (!empty($emails)) {
        $rq = mysqli_fetch_array(mysqli_query($conn, "SELECT * FROM smtp"));

        $username = $rq['username'];
        $passwordD = $rq['password'];
        $host = $rq['host'];
        $smtpsecure = $rq['smtpsecure'];
        $port = $rq['port'];
        $fromname = $rq['fromname'];
        $from = $rq['frommail'];

        $et = mysqli_fetch_array(mysqli_query($conn, "SELECT * FROM email_template WHERE id=$id"));
        $sub = $et['subject'];
        $mailtxt = $et['body'];

        // Replace the placeholders with the actual values
        $mailtxt = str_replace($placeholders, $values, $mailtxt);

        // Debug: Print modified email content
        echo "Modified email content:<br>";
        echo htmlspecialchars($mailtxt, ENT_QUOTES, 'UTF-8');

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
        $mail->isHTML(true);
        $mail->Subject = $sub;
        $mail->Body = $mailtxt;

        // Add all recipients
        foreach ($emails as $emailAddress) {
            $mail->addAddress($emailAddress);
        }

        if ($mail->send()) {
            echo json_encode(array('success' => true, 'message' => 'Emails sent successfully.'));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Emails could not be sent.'));
        }
    } else {
        echo json_encode(array('success' => false, 'message' => 'No email addresses found for the specified criteria.'));
    }
} else {
    echo json_encode(array('success' => false, 'message' => 'Invalid parameters.'));
}

$conn->close();