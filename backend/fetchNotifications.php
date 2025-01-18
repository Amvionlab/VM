<?php

include 'config.php';

$type = isset($_GET['type']) ? $_GET['type'] : '';
$user = isset($_GET['user']) ? $_GET['user'] : '';
$branch = isset($_GET['branch']) ? $_GET['branch'] : '';
$location = isset($_GET['location']) ? $_GET['location'] : '';

// Initialize an array to hold branch IDs if needed
$branchIds = [];

// Check if location is specified
if ($location) {
    // Sanitize location
    $location = $conn->real_escape_string($location);

    // Fetch all equivalent 'id's for the specified location from the 'branch' table
    $locationSql = "SELECT id FROM branch WHERE location_id = '$location'";
    $locationResult = $conn->query($locationSql);

    if ($locationResult && $locationResult->num_rows > 0) {
        while ($row = $locationResult->fetch_assoc()) {
            $branchIds[] = $row['id'];
        }
    }

    // If there are matching branch IDs for the location, apply them as filters
    if (!empty($branchIds)) {
        $branchIdsStr = implode(',', $branchIds);
        $branchCondition = " AND (" . implode(' OR ', array_map(fn($id) => "FIND_IN_SET('$id', branch)", $branchIds)) . ")";
    } else {
        // If no matching branch IDs, return an empty result set
        echo json_encode([]);
        $conn->close();
        exit;
    }
} elseif ($branch) {
    // If only branch is provided, check if the branch is present in the branch column
    $branch = $conn->real_escape_string($branch);
    $branchCondition = " AND FIND_IN_SET('$branch', branch)";
} else {
    $branchCondition = ""; // No branch condition if neither is set
}

// Prepare SQL query with the specified conditions
$sql = "
    SELECT * FROM notification
    WHERE 1=1
    AND FIND_IN_SET(?, access_type)
    AND NOT FIND_IN_SET(?, read_by)
    $branchCondition
";

// Prepare the statement
$stmt = $conn->prepare($sql);

// Bind parameters
$stmt->bind_param("ss", $type, $user);

// Execute the statement
$stmt->execute();

$result = $stmt->get_result();

$notifications = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
    }
}

$stmt->close();
$conn->close();

echo json_encode($notifications);

?>