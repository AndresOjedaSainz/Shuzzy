<?php
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    $inData = getRequestInfo();

    // Expecting JSON: { "userId": 123, "contactId": 456 }
    $userId    = isset($inData["userId"])    ? intval($inData["userId"])   : 0;
    $contactId = isset($inData["contactId"]) ? intval($inData["contactId"]) : 0;

    if ($userId < 1 || $contactId < 1) {
        returnWithError("Missing userId or contactId");
        exit();
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
        exit();
    }

    // Ensure the contact belongs to this user before deletion
    $stmt = $conn->prepare(
        "DELETE FROM Contacts
         WHERE ID = ?
           AND UserID = ?"
    );
    $stmt->bind_param("ii", $contactId, $userId);

    if (!$stmt->execute()) {
        returnWithError($stmt->error);
        $stmt->close();
        $conn->close();
        exit();
    }

    if ($stmt->affected_rows === 0) {
        // No row deleted → either it didn’t exist or didn’t belong to this user
        returnWithError("No Records Deleted");
        $stmt->close();
        $conn->close();
        exit();
    }

    $stmt->close();
    $conn->close();

    // Return success
    $retValue = array("error" => "");
    sendResultInfoAsJson(json_encode($retValue));

    // Helper functions
    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err) {
        $retValue = array("error" => $err);
        sendResultInfoAsJson(json_encode($retValue));
    }
?>
