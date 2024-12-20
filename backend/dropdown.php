<?php 
include 'config.php'; 

// Fetch ticket types
$sqlTicketTypes = "SELECT id, type FROM ticket_type";
$resultTicketTypes = $conn->query($sqlTicketTypes);

$ticketTypes = array();

if ($resultTicketTypes->num_rows > 0) {
  while($row = $resultTicketTypes->fetch_assoc()) {
    $ticketTypes[] = array("id" => $row["id"], "type" => $row["type"]);
  }
}

// Fetch sla
$sqlTicketsla = "SELECT id, level, min_time, max_time FROM sla";
$resultTicketsla = $conn->query($sqlTicketsla);

$ticketsla = array();

if ($resultTicketsla->num_rows > 0) {
  while($row = $resultTicketsla->fetch_assoc()) {
    $ticketsla[] = array("id" => $row["id"], "name" => $row["level"], "min" => $row["min_time"], "max" => $row["max_time"]);
  }
}

// noc
$sqlTicketnoc = "SELECT id, name,type_id FROM ticket_noc";
$resultTicketnoc = $conn->query($sqlTicketnoc);

$ticketnoc = array();

if ($resultTicketnoc->num_rows > 0) {
  while($row = $resultTicketnoc->fetch_assoc()) {
    $ticketnoc[] = array("id" => $row["id"], "name" => $row["name"], "type_id" => $row["type_id"]);
  }
}

// service
$sqlTicketServices = "SELECT id, name, sub_id FROM ticket_service";
$resultTicketServices = $conn->query($sqlTicketServices);

$ticketServices = array();

if ($resultTicketServices->num_rows > 0) {
  while($row = $resultTicketServices->fetch_assoc()) {
    $ticketServices[] = array("id" => $row["id"], "name" => $row["name"], "sub_id" => $row["sub_id"]);
  }
}

// Fetch customers
$sqlCustomers = "SELECT id, firstname, lastname ,employee_id, location, department, mobile, email, building, block, floor FROM employee";
$resultCustomers = $conn->query($sqlCustomers);

$customers = array();

if ($resultCustomers->num_rows > 0) {
  while($row = $resultCustomers->fetch_assoc()) {
    $customers[] = array(
      "id" => $row["id"], 
      "firstname" => $row["firstname"], 
      "lastname" => $row["lastname"], 
      "employee_id" => $row["employee_id"], 
      "location" => $row["location"], 
      "department" => $row["department"],  
      "mobile" => $row["mobile"], 
      "email" => $row["email"],
      "building" => $row["building"], 
      "block" => $row["block"],
      "floor" => $row["floor"]
    );
  }
}

// Fetch departments
$sqlDepartments = "SELECT id, name FROM department";
$resultDepartments = $conn->query($sqlDepartments);

$departments = array();

if ($resultDepartments->num_rows > 0) {
  while($row = $resultDepartments->fetch_assoc()) {
    $departments[] = array("id" => $row["id"], "name" => $row["name"]);
  }
}

// Fetch domains
$sqlDomains = "SELECT id, name FROM domain";
$resultDomains = $conn->query($sqlDomains);

$domains = array();

if ($resultDomains->num_rows > 0) {
  while($row = $resultDomains->fetch_assoc()) {
    $domains[] = array("id" => $row["id"], "name" => $row["name"]);
  }
}

// Fetch sub-domains
$sqlSubDomains = "SELECT id, name, domain_id FROM sub_domain";
$resultSubDomains = $conn->query($sqlSubDomains);

$subDomains = array();

if ($resultSubDomains->num_rows > 0) {
  while($row = $resultSubDomains->fetch_assoc()) {
    $subDomains[] = array("id" => $row["id"], "name" => $row["name"], "domain_id" => $row["domain_id"]);
  }
}

// Fetch locations
$sqlLocations = "SELECT id, name FROM location";
$resultLocations = $conn->query($sqlLocations);

$locations = array();

if ($resultLocations->num_rows > 0) {
  while($row = $resultLocations->fetch_assoc()) {
    $locations[] = array("id" => $row["id"], "name" => $row["name"]);
  }
}

// Fetch access
$sqlAccess = "SELECT id, name FROM access";
$resultAccess = $conn->query($sqlAccess);

$Accesses = array();

if ($resultAccess->num_rows > 0) {
  while($row = $resultAccess->fetch_assoc()) {
    $Accesses[] = array("id" => $row["id"], "name" => $row["name"]);
  }
}

$sqlSupport = "SELECT id, CONCAT(user.firstname, ' ', user.lastname) AS name, ttype FROM user WHERE usertype=5";
$resultSupport = $conn->query($sqlSupport);

$Support = array();

if ($resultSupport->num_rows > 0) {
  while($row = $resultSupport->fetch_assoc()) {
    $Support[] = array("id" => $row["id"], "name" => $row["name"], "ttype" => $row["ttype"]);
  }
}

$response = array(
  "ticketTypes" => $ticketTypes,
  "ticketnoc" => $ticketnoc,
  "ticketsla" => $ticketsla,
  "ticketServices" => $ticketServices,
  "customers" => $customers,
  "departments" => $departments,
  "domains" => $domains,
  "subDomains" => $subDomains,
  "locations" => $locations,
  "Accesses" => $Accesses,
  "Support" => $Support
);

// Output JSON response
echo json_encode($response);
?>
