<?php

include 'config.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = isset($_GET['type']) ? $_GET['type'] : null;
$ttype = isset($_GET['ttype']) ? $_GET['ttype'] : null;
    $cond = "1=1"; 

    if (isset($_GET['user'])) {
        $id = intval($_GET['user']);
        $cond = "ticket.created_by = $id AND ticket.sla_priority = $type";
    }
    if (isset($_GET['support'])) {
        $id = intval($_GET['support']);
        $cond = "(FIND_IN_SET($id, ticket.assignees) OR ticket.created_by = $id) AND ticket.sla_priority = $type";
    }
    if (isset($_GET['manager'])) {
        $id = intval($_GET['manager']);  
         
        if ($ttype == 5) {
            $cond = "((ticket.ticket_type = $ttype OR ((ticket.ticket_type NOT IN (2,6) AND ticket.customer_location NOT IN ('Corporate Office','Head Office'))) OR ticket.created_by = $id) AND ticket.sla_priority = $type)";
        }else{
            $cond = "((ticket.ticket_type = $ttype AND ( (ticket.customer_location IN ('Corporate Office','Head Office') OR ticket.conf=1)) AND ticket.sla_priority = $type))";
       
        } 
    }
    
    $query = "
    SELECT 
        ticket.*,
        ticket_type.type AS ticket_type_value,
        ticket_status.status AS ticket_status_name,
        ticket_noc.name AS ticket_noc_value,
        ticket_service.name AS ticket_service_value,
        domain.name AS ticket_domain_value,
        employee.firstname AS ticket_customer_value,
        location.name AS ticket_location_value,
        sla.level AS ticket_sla_value,
        department.name AS ticket_department_value,
        sub_domain.name AS ticket_subdomain_value,
        CASE
            WHEN ticket.post_date >= NOW() - INTERVAL 1 DAY THEN 1
            WHEN ticket.post_date >= NOW() - INTERVAL 2 DAY AND ticket.post_date < NOW() - INTERVAL 1 DAY THEN 2
            WHEN ticket.post_date < NOW() - INTERVAL 2 DAY THEN 3
        END AS color
    FROM 
        ticket
    LEFT JOIN 
        ticket_type ON ticket.ticket_type = ticket_type.id
    LEFT JOIN 
        ticket_noc ON ticket.nature_of_call = ticket_noc.id
    LEFT JOIN 
        ticket_service ON ticket.ticket_service = ticket_service.id
    LEFT JOIN 
        ticket_status ON ticket.status = ticket_status.id
    LEFT JOIN 
        domain ON ticket.domain = domain.id
    LEFT JOIN 
        employee ON ticket.customer_name = employee.id
    LEFT JOIN 
        location ON ticket.customer_location = location.id
    LEFT JOIN 
        department ON ticket.customer_department = department.id
    LEFT JOIN 
        sla ON ticket.sla_priority = sla.id
    LEFT JOIN 
        sub_domain ON ticket.sub_domain = sub_domain.id
    WHERE 
        $cond";


    $result = $conn->query($query);
    
    $tickets = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $tickets[] = $row;
        }
    }

    echo json_encode($tickets);
}
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update ticket status
    $id = $_POST['id'];
    $newStatus = $_POST['status'];

    $query = "UPDATE ticket SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("si", $newStatus, $id);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Status updated successfully"]);
    } else {
        echo json_encode(["message" => "Failed to update status"]);
    }

    $stmt->close();
    $conn->close();
}

?>
