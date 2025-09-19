<?php
$servername = "127.0.0.1";  // or "127.0.0.1"
$dbname = "josephine";  // change to your DB name

$connection  = new mysqli($servername, "root", "", "josephine");

//check connection
if ($connection->connect_error) {
  die("Connection failed: " . $connection->connect_error);
}

