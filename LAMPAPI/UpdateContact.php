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

$contactID = $inData["contactID"]; // ID of the contact to update
$firstName = $inData["firstName"];
$lastName = $inData["lastName"];
$phoneNumber = $inData["phoneNumber"];
$emailAddress = $inData["emailAddress"];

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    $stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Phone = ?, Email = ? WHERE ID = ?");
    $stmt->bind_param("ssssi", $firstName, $lastName, $phoneNumber, $emailAddress, $contactID);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            returnWithInfo("Contact updated successfully");
        } else {
            returnWithError("No contact found with the provided ID or no changes made");
        }
    } else {
        returnWithError("Update failed");
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
    $retValue = '{"message":"' . $msg . '","error":""}';
    sendResultInfoAsJson($retValue);
}

?>
