<?php

session_start();
require_once("../../db/config.php");

$userId = $_SESSION['user_id'];
$resDate = $_POST['res'];
