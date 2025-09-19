<?php
header("Content-Type: application/json");
$input = file_get_contents("php://input");
$data = json_decode($input, true);

$username = $data['username'] ?? null;
$password = $data['password'] ?? null;

// connect to databse
require_once("../../db/config.php");

if (!isset($username) || !isset($password)) {
  http_response_code(400);
  echo json_encode(["message" => "Username and password are required."]);
  exit();
};

// Find user
$stmt = $connection->prepare("SELECT id, username, password FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  http_response_code(404);
  echo json_encode(["message" => "User not found."]);
  exit();
};

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
  http_response_code(401);
  echo json_encode(["message" => "Invalid credentials."]);
  exit();
};

// Start session
session_start();
$_SESSION['user'] = [
  "id" => $user['id'],
  "username" => $user['username'],
  "loggedin" => true
];

http_response_code(200);
echo json_encode(["message" => "Login successful."]);
