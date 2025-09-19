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
$stmt = $connection->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param("ss", $username, $email);
$stmt->execute();

// get the result
$result = $stmt->get_result();


// validate the result 
if ($result->num_rows > 0){
    echo json_encode([
        "message" => "Username or email already exists."
    ]);
    http_response_code(409);
    exit();

    http_response_code();

}













