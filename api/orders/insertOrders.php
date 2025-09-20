<?php
session_start();
header('Content-Type: application/json');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function sendResponse($success, $message, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, "Method not allowed", 405);
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Basic validation
if ($data === null) {
    sendResponse(false, "Invalid JSON data", 400);
}

if (!isset($data['date']) || !isset($data['time']) || !isset($data['guests'])) {
    sendResponse(false, "Missing required fields: date, time, or guests", 400);
}

$date = $data['date'];
$time = $data['time'];
$guests = $data['guests'];

if (empty($date) || empty($time) || empty($guests)) {
    sendResponse(false, "All fields must be non-empty", 400);
}

// Make sure user is logged in
if (!isset($_SESSION['user'])) {
    sendResponse(false, "Not logged in", 401);
}

$user_id = $_SESSION['user']['id'];

// Connect to the database
require_once("../../db/config.php");

// Check if connection was successful
if (!$connection) {
    sendResponse(false, "Database connection failed: " . mysqli_connect_error(), 500);
}

// Check connection error
if ($connection->connect_error) {
    sendResponse(false, "Database connection failed: " . $connection->connect_error, 500);
}

try {
    // Insert reservation into ReservationDetails
    $stmt = $connection->prepare("
        INSERT INTO ReservationDetails (reservation_date, reservation_time, number_of_people, user_id, status) 
        VALUES (?, ?, ?, ?, 'Pending')
    ");
    
    if (!$stmt) {
        sendResponse(false, "Database prepare error: " . $connection->error, 500);
    }
    
    $stmt->bind_param("ssii", $date, $time, $guests, $user_id);

    if ($stmt->execute()) {
        $reservation_id = $connection->insert_id;
        sendResponse(true, "Reservation created successfully!");
    } else {
        sendResponse(false, "Database execute error: " . $stmt->error, 500);
    }
    
} catch (Exception $e) {
    sendResponse(false, "Database error: " . $e->getMessage(), 500);
} finally {
    // Clean up
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($connection)) {
        $connection->close();
    }
}
?>