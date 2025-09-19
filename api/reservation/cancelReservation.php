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

// Validate input
if ($data === null) {
    sendResponse(false, "Invalid JSON data", 400);
}

if (!isset($data['reservation_id'])) {
    sendResponse(false, "Missing required field: reservation_id", 400);
}

$reservation_id = $data['reservation_id'];

if (empty($reservation_id)) {
    sendResponse(false, "Reservation ID cannot be empty", 400);
}

// Connect to the database
require_once("../../db/config.php");

// Make sure user is logged in
if (!isset($_SESSION['user'])) {
    sendResponse(false, "Not logged in", 401);
}

$user_id = $_SESSION['user']['id'];

try {
    // First check if the reservation exists and belongs to the user
    $checkStmt = $connection->prepare("
        SELECT status FROM ReservationDetails 
        WHERE reservation_id = ? AND user_id = ?
    ");
    $checkStmt->bind_param("ii", $reservation_id, $user_id);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if ($result->num_rows === 0) {
        sendResponse(false, "Reservation not found or access denied", 404);
    }
    
    $reservation = $result->fetch_assoc();
    
    // Check if already cancelled
    if ($reservation['status'] === 'Cancelled') {
        sendResponse(false, "Reservation is already cancelled", 400);
    }
    
    // Update reservation status to cancelled
    $updateStmt = $connection->prepare("
        UPDATE ReservationDetails 
        SET status = 'Cancelled' 
        WHERE reservation_id = ? AND user_id = ?
    ");
    $updateStmt->bind_param("ii", $reservation_id, $user_id);
    
    if ($updateStmt->execute()) {
        if ($updateStmt->affected_rows > 0) {
            sendResponse(true, "Reservation cancelled successfully");
        } else {
            sendResponse(false, "Failed to cancel reservation", 500);
        }
    } else {
        sendResponse(false, "Database error: " . $updateStmt->error, 500);
    }
    
} catch (Exception $e) {
    sendResponse(false, "Database error: " . $e->getMessage(), 500);
} finally {
    if (isset($checkStmt)) {
        $checkStmt->close();
    }
    if (isset($updateStmt)) {
        $updateStmt->close();
    }
    $connection->close();
}
?>