<?php
include 'config.php';

// Set the content type to JSON
header('Content-Type: application/json');

// Initialize response array
$response = [];
$access_type = "2,3,4,5";

// Disable error display to avoid HTML in the response
ini_set('display_errors', 0);
error_reporting(0);

try {
    // Check if request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    // Decode JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Extract data from JSON input
    $id = $input['id'] ?? null;
    $assignees = $input['assignees'] ?? [];
    $doneby = $input['done'] ?? null;

    if (!$id || $doneby === null) {
        throw new Exception("Missing required fields");
    }

    // Convert assignees array to a comma-separated string or keep it blank
    $assigneesString = empty($assignees) ? '' : implode(',', $assignees);

    // Update the ticket's assignee column
    $query = "UPDATE ticket SET assignees = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("si", $assigneesString, $id);

    if (!$stmt->execute()) {
        throw new Exception("Failed to update ticket assignees: " . $stmt->error);
    }
    $stmt->close();

    // Insert into `ticket_assign` table
    // Insert only if assignees are provided, otherwise insert blank
    $query = "INSERT INTO ticket_assign (tid, done_by, assignto) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("sss", $id, $doneby, $assigneesString);

    if (!$stmt->execute()) {
        throw new Exception("Failed to create log entry: " . $stmt->error);
    }
    $stmt->close();

    // Fetch `created_by` and `ttype` from the ticket table
    $query = "SELECT created_by, ticket_type FROM ticket WHERE id = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->bind_result($created_by, $ttype);
    if (!$stmt->fetch()) {
        throw new Exception("Failed to fetch ticket details");
    }
    $stmt->close();

    // Check if `tid` already exists in the `notification` table
    $query = "SELECT COUNT(*) FROM notification WHERE tid = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    // Perform insertion or update based on existence of `tid`
    if ($count == 0) {
        // Insert new notification
        $log = "User has been Assigned";
        $log_type = 2;
        $href = "/dashboard";
        $post_date = date('Y-m-d H:i:s'); // Current date and time

        $query = "INSERT INTO notification (tid, userid, access_type, ttype, log, log_type, href, post_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Failed to prepare statement: " . $conn->error);
        }
        $stmt->bind_param("isssssss", $id, $assigneesString, $access_type, $ttype, $log, $log_type, $href, $post_date);
    } else {
        // Update existing notification
        $log = "User has been Assigned";
        $log_type = 2;
        $href = "/dashboard";
        $post_date = date('Y-m-d H:i:s'); // Current date and time

        $query = "UPDATE notification SET userid = ?, access_type = ?, ttype = ?, log = ?, log_type = ?, href = ?, post_date = ? WHERE tid = ?";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Failed to prepare statement: " . $conn->error);
        }
        $stmt->bind_param("sssssssi", $assigneesString, $access_type, $ttype, $log, $log_type, $href, $post_date, $id);
    }

    if (!$stmt->execute()) {
        throw new Exception("Failed to create or update notification: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

    // Success response
    $response['status'] = 'success';
    $response['message'] = "Notification and ticket updates completed successfully";
} catch (Exception $e) {
    // Error response
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

// Send JSON response
echo json_encode($response);
?>
