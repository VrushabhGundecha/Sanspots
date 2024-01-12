<?php

$serverName = "localhost";
$userName = "root";
$password = "";
$databaseName = "sanspots";

$conn = new mysqli($serverName, $userName, $password, $databaseName);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Register user
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $email = $_POST['email'];
    $fullName = $_POST['fullName'];

    // File upload handling
    $uploadFolder = 'uploads/';
    $uploadedFilePath = $uploadFolder . basename($_FILES['profilePicture']['name']);

    if (move_uploaded_file($_FILES['profilePicture']['tmp_name'], $uploadedFilePath)) {
        // File upload success, proceed with user registration

        // Check if username is unique
        $checkUsernameQuery = "SELECT id FROM users WHERE username = '$username'";
        $checkUsernameResult = $conn->query($checkUsernameQuery);

        // Check if email is unique
        $checkEmailQuery = "SELECT id FROM users WHERE email = '$email'";
        $checkEmailResult = $conn->query($checkEmailQuery);

        if ($checkUsernameResult->num_rows > 0) {
            echo json_encode(["error" => "Username already exists"]);
        } elseif ($checkEmailResult->num_rows > 0) {
            echo json_encode(["error" => "Email already exists"]);
        } else {
            // Insert user information into 'users' table
            $insertUserQuery = "INSERT INTO users (username, password, email) VALUES ('$username', '$password', '$email')";
            $conn->query($insertUserQuery);

            // Get the newly created user's ID
            $userId = $conn->insert_id;

            // Insert additional user details into 'user_details' table
            $insertDetailsQuery = "INSERT INTO user_details (user_id, full_name, profile_picture) VALUES ($userId, '$fullName', '$uploadedFilePath')";
            $conn->query($insertDetailsQuery);

            echo json_encode(["success" => "User registered successfully"]);
        }
    } else {
        // File upload failed
        echo json_encode(["error" => "File upload failed"]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update user details
    parse_str(file_get_contents("php://input"), $putVars);
    $userId = $putVars['userId'];
    $newUsername = $putVars['newUsername'];

    // Check if the new username is unique
    $checkUsernameQuery = "SELECT id FROM users WHERE username = '$newUsername'";
    $checkUsernameResult = $conn->query($checkUsernameQuery);

    if ($checkUsernameResult->num_rows > 0) {
        echo json_encode(["error" => "Username already exists"]);
    } else {
        // Update username in 'users' table
        $updateUserQuery = "UPDATE users SET username='$newUsername' WHERE id=$userId";
        $conn->query($updateUserQuery);

        echo json_encode(["success" => "User details updated successfully"]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete user
    parse_str(file_get_contents("php://input"), $deleteVars);
    $deleteUserId = $deleteVars['deleteUserId'];

    // Soft delete user (you may want to implement a more sophisticated deletion logic)
    // $softDeleteUserQuery = "UPDATE users SET is_deleted=true WHERE id=$deleteUserId";
    // $conn->query($softDeleteUserQuery);

    // Check if the user exists
    $checkUserQuery = "SELECT id FROM users WHERE id=$deleteUserId";
    $checkUserResult = $conn->query($checkUserQuery);

    if ($checkUserResult->num_rows > 0) {
        // User exists, proceed with deletion

        // Hard delete user details
        $deleteUserDetailsQuery = "DELETE FROM user_details WHERE user_id=$deleteUserId";
        $conn->query($deleteUserDetailsQuery);

        // Hard delete user
        $deleteUserQuery = "DELETE FROM users WHERE id=$deleteUserId";
        $conn->query($deleteUserQuery);

        echo json_encode(["success" => "User deleted successfully"]);
    } else {
        // User does not exist, provide an error message
        echo json_encode(["error" => "Wrong user ID entered"]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user list
    $getUsersQuery = "SELECT users.id, users.username, users.email, user_details.full_name, user_details.profile_picture
                      FROM users
                      JOIN user_details ON users.id = user_details.user_id";

    $result = $conn->query($getUsersQuery);

    if ($result === false) {
        // Handle query execution error
        echo json_encode(["error" => "Error executing query: " . $conn->error]);
    } else {
        $users = [];

        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }

        // Check if users are found or not
        if (!empty($users)) {
            echo json_encode($users);
        } else {
            echo json_encode(["error" => "Users not found"]);
        }
    }
}

// close the connection
$conn->close();

?>
