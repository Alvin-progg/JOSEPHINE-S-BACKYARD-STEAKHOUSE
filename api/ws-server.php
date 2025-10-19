<?php
require_once( __DIR__ . "../../vendor/autoload.php");
require_once( __DIR__ . "../../db/config.php");

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class NotificationServer implements MessageComponentInterface {
    protected $clients;
    protected $userConnections = [];

    public function __construct() {
        $this->clients = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn) {
        // Parse session token from query param
        parse_str($conn->httpRequest->getUri()->getQuery(), $query);
        $token = $query['token'] ?? null;

        if (!$token) {
            $conn->close();
            return;
        }

        // Verify PHP session (stored in /tmp by default)
        session_id($token);
        session_start();

        if (empty($_SESSION['user']['id'])) {
            $conn->close();
            return;
        }

        $userId = $_SESSION['user']['id'];
        $this->clients->attach($conn);
        $this->userConnections[$userId] = $conn;

        echo "User $userId connected\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        // Handle messages from clients if needed
    }

    public function onClose(ConnectionInterface $conn) {
        // Remove connection when closed
        foreach ($this->userConnections as $userId => $c) {
            if ($c === $conn) unset($this->userConnections[$userId]);
        }
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }

    // Send message to specific user
    public function notifyUser($userId, $message) {
        if (isset($this->userConnections[$userId])) {
            $this->userConnections[$userId]->send(json_encode([
                "type" => "notification",
                "data" => $message
            ]));
        }
    }
}

$server = new Ratchet\App('localhost', 8080);
$server->route('/notify', new NotificationServer, ['*']);
$server->run();
