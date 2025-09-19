<?php
header("Content-Type: application/json");

// Helper function to send JSON response
function sendResponse($success, $message, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

// Start session to access user's email
session_start();

// Check if user is authenticated
if (!isset($_SESSION['email'])) {
    sendResponse(false, "Unauthorized: Please log in", 401);
}

// Read and decode input
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Check if JSON decoding failed
if ($data === null) {
    sendResponse(false, "Invalid JSON data", 400);
}

// Check for required fields
if (!isset($data['date']) || !isset($data['time']) || !isset($data['guests'])) {
    sendResponse(false, "Missing required fields: date, time, or guests", 400);
}

// Extract inputs
$date = $data['date'];
$time = $data['time'];
$guests = $data['guests'];

// Basic validation for non-empty fields
if (empty($date) || empty($time) || empty($guests)) {
    sendResponse(false, "All fields must be non-empty", 400);
}

// Validate date (must be a valid date and not in the past)
$today = (new DateTime())->format('Y-m-d');
if (!DateTime::createFromFormat('Y-m-d', $date) || $date < $today) {
    sendResponse(false, "Invalid or past date", 400);
}

// Validate time (ensure valid format and within operating hours, e.g., 09:00–22:00)
if (!DateTime::createFromFormat('H:i', $time) || $time < "09:00" || $time > "22:00") {
    sendResponse(false, "Invalid time or outside operating hours (09:00–22:00)", 400);
}

// Since guests comes from <select>, ensure it's a valid integer string
$guests = filter_var($guests, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 20]]);
if ($guests === false) {
    sendResponse(false, "Guests must be a number between 1 and 20", 400);
}

// Connect to the database
require_once("../../db/config.php");

try {
    // Get user_id based on email
    $stmt = $conn->prepare("SELECT user_id FROM Users WHERE email = ?");
    $stmt->execute([$_SESSION['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendResponse(false, "User not found", 404);
    }
    $user_id = $user['user_id'];

    // Insert reservation into ReservationDetails
    $stmt = $conn->prepare("INSERT INTO ReservationDetails (reservation_date, reservation_time, number_of_people, user_id, status) VALUES (?, ?, ?, ?, 'Pending')");
    $stmt->execute([$date, $time, $guests, $user_id]);

    // Success response
    sendResponse(true, "Reservation created successfully");
} catch (PDOException $e) {
    // Handle database errors (e.g., constraint violations)
    sendResponse(false, "Database error: " . $e->getMessage(), 500);
}
?>