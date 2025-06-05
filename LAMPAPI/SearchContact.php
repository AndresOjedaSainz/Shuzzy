<?php
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    $inData = getRequestInfo();

    // Expecting JSON: { "userId": 123, "search": "partial or full name/email/phone" }
    $userId = isset($inData["userId"]) ? intval($inData["userId"]) : 0;
    $search = isset($inData["search"]) ? trim($inData["search"]) : "";

    if ($userId < 1) {
        returnWithError("Invalid userId");
        exit();
    }

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
        exit();
    }

    if ($search !== "") {
        // Search by FirstName, LastName, Phone, or Email
        $likeTerm = "%" . $search . "%";
        $stmt = $conn->prepare(
            "SELECT ID, FirstName, LastName, Phone, Email, DateAdded
             FROM Contacts
             WHERE UserID = ?
               AND (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?)
             ORDER BY DateAdded DESC"
        );
        $stmt->bind_param("issss",
            $userId,
            $likeTerm, $likeTerm, $likeTerm, $likeTerm
        );
    } else {
        // Return all contacts for this user
        $stmt = $conn->prepare(
            "SELECT ID, FirstName, LastName, Phone, Email, DateAdded
             FROM Contacts
             WHERE UserID = ?
             ORDER BY DateAdded DESC"
        );
        $stmt->bind_param("i", $userId);
    }

    if (!$stmt->execute()) {
        returnWithError($stmt->error);
        $stmt->close();
        $conn->close();
        exit();
    }

    $result = $stmt->get_result();
    $contacts = array();

    while ($row = $result->fetch_assoc()) {
        $contacts[] = array(
            "id"        => intval($row["ID"]),
            "firstName" => $row["FirstName"],
            "lastName"  => $row["LastName"],
            "phone"     => $row["Phone"],
            "email"     => $row["Email"],
            "date"      => $row["DateAdded"]
        );
    }

    $stmt->close();
    $conn->close();

    // Return an array of contact objects
    sendResultInfoAsJson(json_encode($contacts));


    // Helper functions
    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err) {
        // Return an array with a single object containing an "error" key
        $retValue = array(
            array(
                "id"        => 0,
                "firstName" => "",
                "lastName"  => "",
                "phone"     => "",
                "email"     => "",
                "date"      => "",
                "error"     => $err
            )
        );
        sendResultInfoAsJson(json_encode($retValue));
    }
?>
