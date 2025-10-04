<?php
header("Content-Type: application/json");
require_once("../../config/database.php");

try {
    $stmt = $connection->prepare("
        SELECT p.payment_id, p.user_id, o.order_id, p.total_amount, p.payment_status, p.payment_date
        FROM payments p
        LEFT JOIN orderDetails o ON p.payment_id = o.payment_id
        ORDER BY p.payment_date DESC
    ");
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
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
