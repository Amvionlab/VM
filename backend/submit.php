<?php include 'config.php'; // Adjust path as per your file structure

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Check if a file has been uploaded
        $uploadDir = 'C:/xampp/htdocs/TMS/src/attachment/';
        $attachmentPath = '';

        if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] == UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['attachment']['tmp_name'];
            $fileName = basename($_FILES['attachment']['name']); // Ensure file name is safe
            $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $allowedExtensions = array('pdf', 'jpg', 'jpeg', 'png');

            if (in_array($fileExtension, $allowedExtensions)) {
                $filePath = $uploadDir . $fileName;

                // Move the file to the specified directory
                if (move_uploaded_file($fileTmpPath, $filePath)) {
                    $attachmentPath = 'src/attachment/' . $fileName; // Storing relative path
                } else {
                    throw new Exception('File upload failed.');
                }
            } else {
                throw new Exception('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.');
            }
        }

        // Collect and sanitize other form data
        $customer_name = htmlspecialchars(trim($_POST['customer_name'] ?? ''));
        $customer_location = htmlspecialchars(trim($_POST['customer_location'] ?? ''));
        $customer_department = htmlspecialchars(trim($_POST['customer_department'] ?? ''));
        $contact_person = htmlspecialchars(trim($_POST['contact_person'] ?? ''));
        $contact_number = htmlspecialchars(trim($_POST['contact_number'] ?? ''));
        $contact_mail = htmlspecialchars(trim($_POST['contact_mail'] ?? ''));
        $nature_of_call = htmlspecialchars(trim($_POST['nature_of_call'] ?? ''));
        $ticket_type = htmlspecialchars(trim($_POST['ticket_type'] ?? ''));
        $ticket_service = htmlspecialchars(trim($_POST['ticket_service'] ?? ''));
        $domain = htmlspecialchars(trim($_POST['domain'] ?? ''));
        $sub_domain = htmlspecialchars(trim($_POST['sub_domain'] ?? ''));
        $sla_priority = htmlspecialchars(trim($_POST['sla_priority'] ?? ''));
        $issue_nature = htmlspecialchars(trim($_POST['issue_nature'] ?? ''));
        $created_by = htmlspecialchars(trim($_POST['created_by'] ?? ''));
        $status = 1;

        // Validate email
        if ($_POST['contact_mail'] != '') {
            $contact_mail = filter_var($contact_mail, FILTER_SANITIZE_EMAIL);
            if (!filter_var($contact_mail, FILTER_VALIDATE_EMAIL)) {
                throw new Exception('Invalid email format.');
            }
        }

        // Ensure no blank inserts
        if (!empty($customer_name) && !empty($ticket_type)) {
            // Insert into the ticket table
            $stmt = $conn->prepare("INSERT INTO ticket (customer_name, customer_location, customer_department, contact_person, contact_number, contact_mail, nature_of_call, ticket_type, ticket_service, domain, sub_domain, sla_priority, issue_nature, path, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            if ($stmt === false) {
                throw new Exception('Database prepare failed: ' . $conn->error);
            }
            $stmt->bind_param("ssssssssssssssss", $customer_name, $customer_location, $customer_department, $contact_person, $contact_number, $contact_mail, $nature_of_call, $ticket_type, $ticket_service, $domain, $sub_domain, $sla_priority, $issue_nature, $attachmentPath, $created_by, $status);

            if ($stmt->execute()) {
                $tid = $conn->insert_id;
            
                // Insert into the notification table
                $userid = htmlspecialchars(trim($_POST['created_by'] ?? '')); // Fetch user ID from POST data
                $access_type = "2,3,4,5"; // Fixed access types
                $log = "ticket created"; // Fixed log message
                $log_type = 1; // Fixed log type
                $href = "/dashboard"; // Fixed href value
            
                $notificationStmt = $conn->prepare("INSERT INTO notification (tid, ttype, userid, access_type, log, log_type, href) VALUES (?, ?, ?, ?, ?, ?, ?)");
                if ($notificationStmt === false) {
                    throw new Exception('Notification prepare failed: ' . $conn->error);
                }
            
                $notificationStmt->bind_param("iisssis", $tid, $ticket_type, $userid, $access_type, $log, $log_type, $href);
            
                if (!$notificationStmt->execute()) {
                    throw new Exception('Notification insert failed: ' . $notificationStmt->error);
                }
            
                // Insert log record
                $fromStatus = '0';
                $toStatus = '1';
                $date = date('d-m-Y');
                $logStmt = $conn->prepare("INSERT INTO log (tid, done_by, from_status, to_status, date) VALUES (?, ?, ?, ?, ?)");
                if ($logStmt === false) {
                    throw new Exception('Log prepare failed: ' . $conn->error);
                }
                $logStmt->bind_param("issss", $tid, $userid, $fromStatus, $toStatus, $date);
            
                if (!$logStmt->execute()) {
                    throw new Exception('Log insert failed: ' . $logStmt->error);
                }
            
                $response = array('status' => 'success', 'message' => 'Form submitted, data inserted successfully, and notification added!');
            
                $notificationStmt->close();
                $logStmt->close();
            } else {
                throw new Exception('Ticket insert failed: ' . $stmt->error);
            }            

            $stmt->close();
        } else {
            throw new Exception('Customer name and ticket type are required.');
        }

        $conn->close();
        echo json_encode($response);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
