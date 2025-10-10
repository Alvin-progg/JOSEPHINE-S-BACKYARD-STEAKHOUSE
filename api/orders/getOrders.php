<?php
session_start();
header('Content-Type: application/json');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function sendResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Make sure user is logged in
if (!isset($_SESSION['user'])) {
    sendResponse(false, "Not logged in", null, 401);
}

$user_id = $_SESSION['user']['id'];

// Connect to the database
require_once("../../db/config.php");

try {
    // Fetch user reservations ordered by date and time
    $stmt = $connection->prepare("
        SELECT 
            order_id,
            product_name,
            quantity,
            
        FROM OrderDetails
        WHERE user_id = ? 
        ORDER BY order_date DESC
    ");
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = [
            'id' => $row['order_id'],
            'product_name' => $row['product_name'],
            'quantity' => $row['quantity']
        ];
    }

    sendResponse(true, "Orders retrieved successfully", $orders);

} catch (Exception $e) {
    sendResponse(false, "Database error: " . $e->getMessage(), null, 500);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    $connection->close();
}
?>