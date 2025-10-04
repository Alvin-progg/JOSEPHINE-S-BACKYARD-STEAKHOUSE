<?php
session_start();
header("Content-Type: application/json");

// connect to database
require_once("../../db/config.php");

// check if the user is admin
if (!isset($_SESSION['user']) || !$_SESSION['user']['isAdmin']) {
    http_response_code(403);
    echo json_encode(["message" => "Access denied. Admins only."]);
    exit();
}

// get all the orders table from table orderDetails
$stmt = $connection->prepare("SELECT * FROM reservationDetails");
$stmt->execute();
$result = $stmt->get_result();

// convert result to array
$reservations = [];   
while ($row = $result->fetch_assoc()) {
    $reservations[] = $row;
}

// success response
echo json_encode([
    "status" => "success",
    "data" => $orders
]);  
