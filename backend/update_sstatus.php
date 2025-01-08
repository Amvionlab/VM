<?php
include 'config.php';

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode JSON input from the request body
    $input = json_decode(file_get_contents('php://input'), true);

    // Extract data from JSON input
    $id = $input['id'];
    $newStatus = $input['status'];

    // Prepare SQL statement to update ticket status
    $query = "UPDATE ticket SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    if (!$stmt) {
        echo json_encode(["message" => "Failed to prepare statement: " . $conn->error]);
        exit;
    }
    $stmt->bind_param("ii", $newStatus, $id);

    // Initialize response array
    $response = [];

    // Execute SQL statement and handle success/error
    if ($stmt->execute()) {
        $response['message'] = "Status updated successfully";

        // Check if the status equals 6 (Closed)
        if ($newStatus == 6) {
            // Fetch additional ticket details
            $ticketQuery = "SELECT ticket_type, created_by FROM ticket WHERE id = ?";
            $ticketStmt = $conn->prepare($ticketQuery);
            if ($ticketStmt) {
                $ticketStmt->bind_param("i", $id);
                $ticketStmt->execute();
                $ticketStmt->bind_result($ticket_type, $created_by);
                $ticketStmt->fetch();
                $ticketStmt->close();

                // Fetch the latest assignees for the ticket from the `ticket_assign` table
                $assigneeQuery = "SELECT assignto FROM ticket_assign WHERE tid = ? ORDER BY id DESC LIMIT 1";
                $assigneeStmt = $conn->prepare($assigneeQuery);
                if ($assigneeStmt) {
                    $assigneeStmt->bind_param("i", $id);
                    $assigneeStmt->execute();
                    $assigneeStmt->bind_result($assignees);
                    $assigneeStmt->fetch();
                    $assigneeStmt->close();
                } else {
                    $response['assignee_fetch_error'] = "Failed to fetch assignees: " . $conn->error;
                    echo json_encode($response);
                    exit;
                }

                // Combine `created_by` and fetched `assignees` for `userid`
                $userid = empty($assignees) ? $created_by : $created_by . ',' . $assignees;

                // Check if a notification with `tid` and `log_type = 3` already exists
                $checkQuery = "SELECT COUNT(*) FROM notification WHERE tid = ? AND log_type = 3";
                $checkStmt = $conn->prepare($checkQuery);
                if ($checkStmt) {
                    $checkStmt->bind_param("i", $id);
                    $checkStmt->execute();
                    $checkStmt->bind_result($count);
                    $checkStmt->fetch();
                    $checkStmt->close();
                } else {
                    $response['notification_check_error'] = "Failed to check notification existence: " . $conn->error;
                    echo json_encode($response);
                    exit;
                }

                // Common variables for notification
                $log = "Ticket status updated to Closed"; // Custom log message for status = 6
                $log_type = 3; // Log type for status change
                $access_type = "2,3,4,5"; // Fixed access types
                $href = "/dashboard"; // Fixed href value

                if ($count == 0) {
                    // Insert new notification
                    $notificationQuery = "INSERT INTO notification (tid, ttype, userid, access_type, log, log_type, href) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    $notificationStmt = $conn->prepare($notificationQuery);
                    if ($notificationStmt) {
                        $notificationStmt->bind_param("iisssis", $id, $ticket_type, $userid, $access_type, $log, $log_type, $href);

                        if ($notificationStmt->execute()) {
                            $response['notification'] = "Notification inserted successfully for status 6";
                        } else {
                            $response['notification'] = "Failed to insert notification: " . $notificationStmt->error;
                        }

                        $notificationStmt->close();
                    } else {
                        $response['notification_prepare_error'] = "Failed to prepare notification statement: " . $conn->error;
                    }
                } else {
                    // Update existing notification
                    $updateQuery = "UPDATE notification SET userid = ?, access_type = ?, ttype = ?, log = ?, href = ? WHERE tid = ? AND log_type = 3";
                    $updateStmt = $conn->prepare($updateQuery);
                    if ($updateStmt) {
                        $updateStmt->bind_param("sssssi", $userid, $access_type, $ticket_type, $log, $href, $id);

                        if ($updateStmt->execute()) {
                            $response['notification'] = "Notification updated successfully for status 6";
                        } else {
                            $response['notification'] = "Failed to update notification: " . $updateStmt->error;
                        }

                        $updateStmt->close();
                    } else {
                        $response['notification_update_prepare_error'] = "Failed to prepare update notification statement: " . $conn->error;
                    }
                }
            } else {
                $response['ticket_fetch_error'] = "Failed to fetch ticket details: " . $conn->error;
            }
        }
    } else {
        $response['message'] = "Failed to update status: " . $stmt->error;
    }

    // Close statement and database connection
    $stmt->close();
    $conn->close();

    // Send JSON response
    echo json_encode($response);
} else {
    // If request method is not POST, return an error message
    echo json_encode(["message" => "Invalid request method"]);
}
?>
