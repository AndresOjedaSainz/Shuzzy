<?php
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        // Preflight
        http_response_code(200);
        exit();
    }

    $inData = getRequestInfo();

    // Expecting JSON: { "userId": 123, "firstName": "...", "lastName": "...", "phone": "...", "email": "..." }
    $userId    = isset($inData["userId"])    ? intval($inData["userId"])   : 0;
    $firstName = isset($inData["firstName"]) ? $inData["firstName"]         : "";
    $lastName  = isset($inData["lastName"])  ? $inData["lastName"]          : "";
    $phone     = isset($inData["phone"])     ? $inData["phone"]             : "";
    $email     = isset($inData["email"])     ? $inData["email"]             : "";

    if ($userId < 1 || empty($firstName) || empty($lastName)) {
        returnWithError("Missing required fields");
        exit();
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
        exit();
    }

    // Insert new contact
    $stmt = $conn->prepare(
        "INSERT INTO Contacts (UserID, FirstName, LastName, Phone, Email)
         VALUES (?,       ?,         ?,        ?,     ?)"
    );
    $stmt->bind_param("issss", $userId, $firstName, $lastName, $phone, $email);

    if (!$stmt->execute()) {
        returnWithError($stmt->error);
        $stmt->close();
        $conn->close();
        exit();
    }

    $newID = $stmt->insert_id;
    $stmt->close();
    $conn->close();

    // Return the newly created ID and dateAdded back to the front-end
    $retValue = array(
        "id"        => $newID,
        "firstName" => $firstName,
        "lastName"  => $lastName,
        "phone"     => $phone,
        "email"     => $email,
        "date"      => date("Y-m-d"),
        "error"     => ""
    );
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
        $retValue = array(
            "id"        => 0,
            "firstName" => "",
            "lastName"  => "",
            "phone"     => "",
            "email"     => "",
            "date"      => "",
            "error"     => $err
        );
        sendResultInfoAsJson(json_encode($retValue));
    }
?>
