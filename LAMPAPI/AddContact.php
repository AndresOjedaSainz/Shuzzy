<?php

// CORS headers for permissions
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$inData = getRequestInfo();

$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$phoneNumber = $inData["phoneNumber"];
$emailAddress = $inData["emailAddress"];
$userID = $inData["userID"];

$conn = new mysqli("localhost", "poostsqlacc", "POOSTApp2025!", "COP4331");
if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    // Insert contact
    $stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $firstName, $lastName, $phoneNumber, $emailAddress, $userID);

    if ($stmt->execute()) {
        returnWithInfo("Contact added successfully");
    } else {
        returnWithError("Failed to add contact. " . $stmt->error);
    }

    $stmt->close();
    $conn->close();
}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err)
{
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($msg)
{
    $retValue = '{"message":"' . $msg . '", "error":""}';
    sendResultInfoAsJson($retValue);
}

?>
