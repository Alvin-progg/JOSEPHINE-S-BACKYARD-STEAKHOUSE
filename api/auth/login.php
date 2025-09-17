<?php
// Set response type to JSON
header("Content-Type: application/json");

// Get the raw POST data
$input = file_get_contents("php://input");

// Decode JSON input
$data = json_decode($input, true);


// deconstruct the data
$username = $data['username'];
$password = $data['password'];

// validate the data 
if (!isset($username) || !isset($password)) {
    echo json_encode(["error" => "Username and password are required."]);
    exit();
}