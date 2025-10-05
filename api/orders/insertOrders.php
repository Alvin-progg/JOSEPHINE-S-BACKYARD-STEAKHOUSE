<?php
header("Content-Type: application/json");
session_start();

require_once("../../db/config.php");

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(["message" => "Unauthorized. Please login first."]);
  exit();
}

$userId = $_SESSION['user_id'];

try {
  // Start transaction
  $connection->begin_transaction();

  // Validate required fields
  if (!isset($_POST['reference_number']) || empty(trim($_POST['reference_number']))) {
    throw new Exception("Reference number is required");
  }

  if (!isset($_FILES['screenshot']) || $_FILES['screenshot']['error'] !== UPLOAD_ERR_OK) {
    throw new Exception("Payment screenshot is required");
  }

  if (!isset($_POST['cart']) || empty($_POST['cart'])) {
    throw new Exception("Cart is empty");
  }

  if (!isset($_POST['total_amount']) || empty($_POST['total_amount'])) {
    throw new Exception("Total amount is required");
  }

  // Get form data
  $reference_number = trim($_POST['reference_number']);
  $total_amount = floatval($_POST['total_amount']);
  
  // Debug: Log what's received
  error_log("Received delivery_type: " . (isset($_POST['delivery_type']) ? $_POST['delivery_type'] : 'NOT SET'));
  
  $delivery_type = isset($_POST['delivery_type']) && !empty($_POST['delivery_type']) ? $_POST['delivery_type'] : 'pickup';
  $delivery_address = null;
  
  // Validate and set delivery address only if delivery type is 'delivery'
  if ($delivery_type === 'delivery') {
    if (!isset($_POST['delivery_address']) || empty(trim($_POST['delivery_address']))) {
      throw new Exception("Delivery address is required for delivery orders");
    }
    $delivery_address = trim($_POST['delivery_address']);
  } else {
    // For pickup orders, explicitly set to null or empty
    $delivery_address = null;
  }
  
  $cart = json_decode($_POST['cart'], true);

  if (!$cart || !is_array($cart)) {
    throw new Exception("Invalid cart data");
  }

  // Handle file upload
  $screenshot = $_FILES['screenshot'];
  $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
  $max_size = 5 * 1024 * 1024; // 5MB

  // Validate file type by extension
  $file_extension = strtolower(pathinfo($screenshot['name'], PATHINFO_EXTENSION));
  if (!in_array($file_extension, $allowed_extensions)) {
    throw new Exception("Invalid file type. Only JPG, PNG, and GIF are allowed.");
  }

  // Validate file size
  if ($screenshot['size'] > $max_size) {
    throw new Exception("File size too large. Maximum 5MB allowed.");
  }

  // Create uploads directory if it doesn't exist
  $upload_dir = "../../uploads/payments/";
  if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
  }

  // Generate unique filename
  $file_extension = pathinfo($screenshot['name'], PATHINFO_EXTENSION);
  $filename = 'payment_' . $userId . '_' . time() . '_' . uniqid() . '.' . $file_extension;
  $screenshot_path = $upload_dir . $filename;

  // Move uploaded file
  if (!move_uploaded_file($screenshot['tmp_name'], $screenshot_path)) {
    throw new Exception("Failed to upload screenshot");
  }

  // Store relative path in database
  $screenshot_db_path = "uploads/payments/" . $filename;

  // Insert payment record
  $stmt_payment = $connection->prepare("
    INSERT INTO payments (user_id, reference_number, screenshot_path, total_amount, delivery_type, delivery_address, payment_status) 
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  ");
  $stmt_payment->bind_param("issdss", $userId, $reference_number, $screenshot_db_path, $total_amount, $delivery_type, $delivery_address);
  
  if (!$stmt_payment->execute()) {
    throw new Exception("Failed to insert payment record: " . $stmt_payment->error);
  }

  $payment_id = $connection->insert_id;
  $stmt_payment->close();

  // Insert order details using your existing table structure
  $stmt_order = $connection->prepare("
    INSERT INTO orderDetails (payment_id, user_id, product_name, quantity, price, customize) 
    VALUES (?, ?, ?, ?, ?, ?)
  ");

  foreach ($cart as $item) {
    $name = $item['name'];
    $price = (float)$item['price'];
    $quantity = (int)$item['quantity'];
    $customize = isset($item['customize']) ? $item['customize'] : null;

    $stmt_order->bind_param("iisids", $payment_id, $userId, $name, $quantity, $price, $customize);
    
    if (!$stmt_order->execute()) {
      throw new Exception("Failed to insert order item: " . $stmt_order->error);
    }
  }
  $stmt_order->close();

  // Commit transaction
  $connection->commit();

  echo json_encode([
    "success" => true,
    "message" => "Order successfully placed! Your payment is being verified.",
    "payment_id" => $payment_id,
    "delivery_type" => $delivery_type,
    "items_count" => count($cart)
  ]);

} catch (Exception $e) {
  // Rollback transaction on error
  $connection->rollback();

  // Delete uploaded file if exists
  if (isset($screenshot_path) && file_exists($screenshot_path)) {
    unlink($screenshot_path);
  }

  http_response_code(400);
  echo json_encode([
    "success" => false,
    "message" => $e->getMessage()
  ]);
}

$connection->close();
?>