<?php
include 'config.php';

// Fetch from rca table
$sql1 = "SELECT * FROM rca";
$result1 = $conn->query($sql1);

$rca = array();
if ($result1->num_rows > 0) {
    while($row = $result1->fetch_assoc()) {
        $rca[] = $row;
    }
}

// Fetch from rca_sub table
$sql2 = "SELECT id, name, rca_id, is_active, post_date FROM rca_sub";
$result2 = $conn->query($sql2);

$rca_sub = array();
if ($result2->num_rows > 0) {
    while($row = $result2->fetch_assoc()) {
        $rca_sub[] = $row;
    }
}

$conn->close();

// Combine both into one JSON object
$response = array(
    "rca" => $rca,
    "rca_sub" => $rca_sub
);

echo json_encode($response);
?>
