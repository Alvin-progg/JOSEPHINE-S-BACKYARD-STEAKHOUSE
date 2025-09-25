<?php
header("Content-Type: application/json");
session_start();

require_once("../../db/config.php");
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// validate cart
if (!isset($data['cart']) || empty($data['cart'])) {
  http_response_code(400);
  echo json_encode(["message" => "Cart is empty"]);
  exit();
}

$cart = $data['cart'];
$userId = $_SESSION['user_id'] ?? null;
$customize = $data['customize'] ?? null;

// prepare statement
$stmt = $connection->prepare("
  INSERT INTO orderDetails(user_id, product_name, quantity, price, customize) 
  VALUES (?, ?, ?, ?, ?)
");

foreach ($cart as $item) {
  $name     = $item['name'];
  $price    = (float)$item['price'];
  $quantity = (int)$item['quantity'];
  $stmt->bind_param("isids", $userId, $name, $quantity, $price, $customize);
  $stmt->execute();

}
$stmt->close();

echo json_encode([
  "message" => "Order successfully placed",
  "items_count" => count($cart)
]);
