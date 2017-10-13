<?php
    header("Access-Control-Allow-Origin:*");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header('Access-Control-Allow-Headers: Authorization, X-HTTP-Method-Override, Content-Type, x-requested-with');
    header('Content-Type: application/json');

    require_once(dirname(__FILE__) . '/dbHandler.php');

    $username = $_POST['username'];
    $firstName = $_POST['firstName'];
    $lastName = $_POST['lastName'];
    $password = $_POST['password'];

    $db = new Database();

    //Prevent SQL injection
    $username = $db->quote($username);
    $firstName = $db->quote($firstName);
    $lastName = $db->quote($lastName);
    $password = password_hash($db->quote($password), PASSWORD_DEFAULT);

    $rows = $db->select("SELECT Username FROM users
                         WHERE Username = $username");

    $response = new stdClass();

    if (!empty($rows) && count($rows) > 0) {
        $response = (object)(
            array(
                'msg' => 'ERROR: Username is already in use',
                'success' => false
            )
        );
    }
    else {
        if(!empty($_POST)) {
            $db->insert("INSERT INTO users (UserName, FirstName, LastName, Password)
                         VALUES ($username, $firstName, $lastName, '$password')");

            $response = (object)(
                array(
                    'msg' => $username . ' has been signed up successfully',
                    'success' => true
                )
            );
        }
    }

    echo json_encode($response);
?>