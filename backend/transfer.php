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

    // Extract tid and department id
    $tid = $input['tid'] ?? null;
    $departmentId = $input['departmentId'] ?? null;

    // Validate input
    if (!$tid || !$departmentId) {
        throw new Exception("Missing required fields: 'tid' or 'departmentId'");
    }

    // Check if the tid exists in the ticket table
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

    // Update the ticket_type column in the ticket table
    $query = "UPDATE ticket SET ticket_type = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        throw new Exception("Failed to prepare statement: " . $conn->error);
    }
    $stmt->bind_param("ii", $departmentId, $tid);

    if (!$stmt->execute()) {
        throw new Exception("Failed to update ticket: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

    // Success response
    $response['status'] = 'success';
    $response['message'] = "Ticket updated successfully.";
} catch (Exception $e) {
    // Error response
    $response['status'] = 'error';
    $response['message'] = $e->getMessage();
}

// Send JSON response
echo json_encode($response);
?>
