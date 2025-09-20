<?php
header("Content-Type: application/json");
$input = file_get_contents("php://input");

// decode to json
$data = json_decode($input, true);


// deconstruct the data
$username = $data['username'];
$email = $data['email'];
$password = $data['password'];

// connect to the database
require_once("../../db/config.php");



// validate the data
if (!isset($username) || !isset($email) || !isset($password)) {
  echo json_encode([
    "message" => "Username, email and password are required."
  ]);
  http_response_code(400);
  exit();
}

// check if user already exist
$stmt = $connection->prepare("SELECT user_id FROM Users WHERE  email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

// get the result
$result = $stmt->get_result();


// validate the result 
if ($result->num_rows > 0) {
  echo json_encode([
    "message" => "Username or email already exists."
  ]);
  http_response_code(409);
  exit();
}


// hash a password and create a new user
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$stmt = $connection->prepare("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $username, $email, $hashedPassword);


// check if the user was created
if (!$stmt->execute()) {
  echo json_encode([
    "message" => "Error creating user."
  ]);
  http_response_code(500);
  exit();
}
// start the session
session_start();
$_SESSION['user'] = [
  "id" => $stmt->insert_id,
  "username" => $username,
  "email" => $email,
  "loggedin" => true,
];


// Also store user_id directly for easy access later
$_SESSION['user_id'] = $stmt->insert_id;

$userId = $_SESSION['Users']['user_id'];


// successmessage
http_response_code(201);
echo json_encode([
  "message"  => "Login successful. Welcome back, " . $user['username'] . "!",
  "token"    => session_id(),
  "username" => $username,
  "user_id"  => $user['user_id'] // ✅ return it too if needed
]);
