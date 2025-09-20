<?php
header("Content-Type: application/json");

// Helper function to send JSON response
function sendResponse($success, $message, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Start session
session_start();

// Read and decode input
$input = file_get_contents("php://input");
$data = json_decode($input, true);


$date   = $data['date'];
$time   = $data['time'];
$guests = $data['guests'];



// Connect to the database
require_once("../../db/config.php");

// Make sure user is logged in
if (!isset($_SESSION['user'])) {
    sendResponse(false, "Not logged in", 401);
}

$user_id = $_SESSION['user']['id']; // we stored this at login

// Insert reservation into ReservationDetails
$stmt = $connection->prepare("INSERT INTO ReservationDetails (reservation_date, reservation_time, number_of_people, user_id, status) VALUES (?, ?, ?, ?, 'Pending')");
$stmt->bind_param("ssii", $date, $time, $guests, $user_id);

if ($stmt->execute()) {
    sendResponse(true, "Reservation created successfully");
} else {
    sendResponse(false, "Database error: " . $stmt->error, 500);
}

$stmt->close();
$connection->close();