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
require_once __DIR__ . "../../../db/config.php";

// $result = 
// validate the data
if (!isset($username) || !isset($email) || !isset($password)) {
    echo json_encode([        
        "error" => "Username, email and password are required."
    ]);
    exit();
}













