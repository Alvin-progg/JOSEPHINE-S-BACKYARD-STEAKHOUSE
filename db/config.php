<?php
$servername = "127.0.0.1";  // or "127.0.0.1"
$username = "root";         // default for local setup
$password = "";             // often empty for localhost
$dbname = "josephine";  // change to your DB name

$connection  = new mysqli($servername, $username, $password, $dbname);

//check connection
if ($connection->connect_error) {
  die("Connection failed: " . $connection->connect_error);
}

echo "Connected successfully";
