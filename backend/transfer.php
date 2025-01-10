<?php
include 'config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Initialize response
$response = [];

// Disable error display to avoid unnecessary HTML output
ini_set('display_errors', 0);
error_reporting(0);

try {
    // Check if the request method is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    // Decode JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Extract action, tid, departmentId, and status
    $action = $input['action'] ?? null;
    $tid = $input['tid'] ?? null;
    $departmentId = $input['departmentId'] ?? null;
    $statusmsg = $input['status'] ?? null;
    $status = ($statusmsg === 'Verified') ? 1 : 'as';

    // Validate common input
    if (!$tid) {
        throw new Exception("Missing required field: 'tid'");
    }

    // Check if the ticket ID exists
    $query = "SELECT id FROM ticket WHERE id = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("i", $tid);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 0) {
        $stmt->close();
        throw new Exception("Invalid ticket ID");
    }
    $stmt->close();

    // Perform actions based on the provided action type
    switch ($action) {
        case 'transfer':
            if (!$departmentId) {
                throw new Exception("Missing required field: 'departmentId' for transfer action");
            }

            // Transfer logic
            $query = "UPDATE ticket SET ticket_type = ? WHERE id = ?";
            $stmt = $conn->prepare($query);
            if (!$stmt) {
                throw new Exception("Failed to prepare statement: " . $conn->error);
            }
            $stmt->bind_param("ii", $departmentId, $tid);

            if (!$stmt->execute()) {
                throw new Exception("Failed to update ticket: " . $stmt->error);
            }

            $response['message'] = "Ticket transferred successfully.";
            break;

        case 'verify':
            if (!$status) {
                throw new Exception("Missing required field: 'status' for verify action");
            }

            // Verify logic
            $query = "UPDATE ticket SET conf = ? WHERE id = ?";
            $stmt = $conn->prepare($query);
            if (!$stmt) {
                throw new Exception("Failed to prepare statement: " . $conn->error);
            }
            $stmt->bind_param("si", $status, $tid);

            if (!$stmt->execute()) {
                throw new Exception("Failed to update ticket status: " . $stmt->error);
            }

            $response['message'] = "Ticket verification status updated successfully.";
            break;

        default:
            throw new Exception("Invalid action type");
    }

    $stmt->close();
    $conn->close();

    // Success response
    $response['status'] = 'success';
} catch (Exception $e) {
    // Error response
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

// Send JSON response
echo json_encode($response);
?>