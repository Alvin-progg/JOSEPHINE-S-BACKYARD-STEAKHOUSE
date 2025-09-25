<?php
header("Content-Type: application/json");
$input = file_get_contents("php://input");

// decode to json
$data = json_decode($input, true);

// deconstruct the data
$username = $data['username'] ?? null;
$email    = $data['email'] ?? null;
$password = $data['password'] ?? null;

// connect to the database
require_once("../../db/config.php");

// validate the data
if (!$username || !$email || !$password) {
  http_response_code(400);
  echo json_encode([
    "message" => "Username, email and password are required."
  ]);
  exit();
}

// check if user already exists
$stmt = $connection->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

// get the result
$result = $stmt->get_result();

// validate the result 
if ($result->num_rows > 0) {
  http_response_code(409);
  echo json_encode([
    "message" => "Username or email already exists."
  ]);
  exit();
}

// hash the password and create a new user
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$stmt = $connection->prepare("INSERT INTO `users` (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $hashedPassword);

// check if the user was created
if (!$stmt->execute()) {
  http_response_code(500);
  echo json_encode([
    "message" => "Error creating user."
  ]);
  exit();
}

// start the session
session_start();
$_SESSION['user'] = [
  "id"       => $stmt->insert_id,
  "username" => $username,
  "email"    => $email,
  "loggedin" => true,
];

// success message
http_response_code(201);
echo json_encode([
  "message"  => "Login successful. Welcome back, " . $username . "!",
  "token"    => session_id(),
  "username" => $username,
  "user_id"  => $_SESSION['user']['id']
]);
