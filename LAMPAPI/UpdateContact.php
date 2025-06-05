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

    /* Expecting JSON:
         {
           "userId":    123,
           "contactId": 456,
           "firstName": "NewFirst",
           "lastName":  "NewLast",
           "phone":     "555-1234",
           "email":     "someone@example.com"
         }
    */
    $userId    = isset($inData["userId"])    ? intval($inData["userId"])   : 0;
    $contactId = isset($inData["contactId"]) ? intval($inData["contactId"]) : 0;
    $firstName = isset($inData["firstName"]) ? $inData["firstName"]         : "";
    $lastName  = isset($inData["lastName"])  ? $inData["lastName"]          : "";
    $phone     = isset($inData["phone"])     ? $inData["phone"]             : "";
    $email     = isset($inData["email"])     ? $inData["email"]             : "";

    if ($userId < 1 || $contactId < 1 || empty($firstName) || empty($lastName)) {
        returnWithError("Missing required fields");
        exit();
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
        exit();
    }

    // Update only if that contact belongs to this user
    $stmt = $conn->prepare(
        "UPDATE Contacts
         SET FirstName = ?, LastName = ?, Phone = ?, Email = ?
         WHERE ID = ?
           AND UserID = ?"
    );
    $stmt->bind_param("ssssii",
        $firstName,
        $lastName,
        $phone,
        $email,
        $contactId,
        $userId
    );

    if (!$stmt->execute()) {
        returnWithError($stmt->error);
        $stmt->close();
        $conn->close();
        exit();
    }

    if ($stmt->affected_rows === 0) {
        // Either nothing changed, or the contact didn’t belong to this user
        returnWithError("No Records Updated");
        $stmt->close();
        $conn->close();
        exit();
    }

    $stmt->close();
    $conn->close();

    // Return success (no additional payload)
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
