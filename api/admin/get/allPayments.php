<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:8000");
header("Access-Control-Allow-Credentials: true");

require_once("../../../db/config.php");

try {
    if (!isset($_SESSION['user']) || !$_SESSION['user']['isAdmin']) {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Admins only"]);
        exit;
    }

    $stmt = $connection->prepare("SELECT * FROM payments");
    $stmt->execute();
    $result = $stmt->get_result();

    $payments = [];
    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $payments
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
