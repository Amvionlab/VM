<?php
include 'config.php';

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $uploadDir = 'D:/xampp/htdocs/TMS/src/photo/';
    $attachmentPath = '';

    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] == UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['attachment']['tmp_name'];
        $fileName = basename($_FILES['attachment']['name']);
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExtensions = array('pdf', 'jpg', 'jpeg', 'png');

        if (in_array($fileExtension, $allowedExtensions)) {
            $filePath = $uploadDir . $fileName;

            // Move the file to the specified directory
            if (move_uploaded_file($fileTmpPath, $filePath)) {
                $attachmentPath = 'src/photo/' . $fileName;
            } else {
                throw new Exception('File upload failed.');
            }
        } else {
            throw new Exception('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.');
        }
    }

    $name = $_POST['name'];
    $type_id = $_POST['type_id'];
    $active = "1";

    // Sanitize inputs to prevent SQL injection
    $name = $conn->real_escape_string($name);
    $type_id = $conn->real_escape_string($type_id);

    // Insert user data into 'ticket_noc' table
    $sql = "INSERT INTO ticket_noc (name, type_id, is_active) VALUES ('$name', '$type_id', '$active')";

    if ($conn->query($sql) === TRUE) {
        $response = array('success' => true, 'message' => 'Ticket NOC added successfully.');
        echo json_encode($response);
    } else {
        $response = array('success' => false, 'message' => 'Error: ' . $sql . '<br>' . $conn->error);
        echo json_encode($response);
    }
} else {
    $response = array('success' => false, 'message' => 'Invalid request method.');
    echo json_encode($response);
}

$conn->close();
?>