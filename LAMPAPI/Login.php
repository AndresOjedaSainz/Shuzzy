<?php

// CORS headers for permissions
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$inData = getRequestInfo();

$id = 0;
$firstName = "";
$lastName = "";

// Correct DB connection info from your doc
$conn = new mysqli("localhost", "poostsqlacc", "POOSTApp2025!", "COP4331");
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    $stmt = $conn->prepare("SELECT ID, firstName, lastName FROM Users WHERE Login=? AND Password=?");
    $stmt->bind_param("ss", $inData["login"], $inData["password"]);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        returnWithInfo($row['firstName'], $row['lastName'], $row['ID']);
    } else {
        returnWithError("No Records Found");
    }

    $stmt->close();
    $conn->close();
}

function getRequestInfo() {
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj) {
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err) {
    $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($firstName, $lastName, $id) {
    $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
    sendResultInfoAsJson($retValue);
}

?>
