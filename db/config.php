<?php
$servername = "127.0.0.1";  // or "127.0.0.1"
$connection  = new mysqli($servername, "root", "", "josephine");

//check connection
if ($connection->connect_error) {
  die("Connection failed: " . $connection->connect_error);
}

