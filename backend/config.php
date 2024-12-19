<?php


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // If you have any specific headers you want to allow, set them here
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    exit(0);
}

header("Content-Type: application/json");
function loadEnv($filePath)
{
    if (!file_exists($filePath)) {
        throw new Exception("File not found: $filePath");
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if (!array_key_exists($name, $_ENV)) {
            putenv("$name=$value");
            $_ENV[$name] = $value;
        }
    }
}

// Load the .env file
loadEnv(__DIR__ . '/.env');

// Accessing the environment variables
$dbHost = getenv('DB1_HOST');
$dbUsername = getenv('DB1_USERNAME');
$dbPassword = getenv('DB1_PASSWORD');
$dbName = getenv('DB1_DATABASE');
$dbPort = getenv('DB1_PORT');
$salt = getenv('SALT');

// Create a connection to the database
$conn = mysqli_connect($dbHost, $dbUsername, $dbPassword, $dbName, $dbPort);

if (!$conn) {
    die("Connection to database failed: " . mysqli_connect_error());
}

try {
    $pdo = new PDO('mysql:host=' . $dbHost . ';dbname=' . $dbName, $dbUsername, $dbPassword);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Get IP address and host
$ipaddress = getenv("REMOTE_ADDR") ?: $_SERVER['REMOTE_ADDR'];
$hst = $_SERVER['HTTP_HOST'];
$localIP = getHostByName(getHostName());
?>
