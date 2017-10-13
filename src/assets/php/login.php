<?php
    header("Access-Control-Allow-Origin:*");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header('Access-Control-Allow-Headers: X-HTTP-Method-Override, Content-Type, X-Requested-With');
    header('Content-Type: application/json');

    require_once(dirname(__FILE__) . '/dbHandler.php');

    $username = $_POST['username'];
    $password = $_POST['password'];

    $db = new Database();

    //Prevent SQL injection
    $username = $db->quote($username);
    $password = $db->quote($password);

    if(isset($username) && isset($password)) {
        $rows = $db->select("SELECT * FROM users
                             WHERE Username = $username");

        if (count($rows) > 0) {
            $hash = '';
            $user = new stdClass();

            foreach ($rows as $row) {
                $hash = $row['Password'];
                $user->id = $row['UserID'];
                $user->username = $row['Username'];
                $user->firstName = $row['FirstName'];
                $user->lastName = $row['LastName'];

                $user->favourites = array();
            }

            if (password_verify($password, $hash)) {
                $lastLoggedIn = date('Y-m-d H:i:s');

                $db->update("UPDATE users SET LastLoggedIn = '$lastLoggedIn'
                             WHERE UserID = '$user->id'");

                echo buildResponse('', $user, true);
            }
            else {
                echo buildResponse('Incorrect username or password. Please try again', [], false);
            }
        } else {
            echo buildResponse('Incorrect username or password. Please try again', [], false);
        }
    } else {
        echo buildResponse('Server error, could not find user', [], false);
    }

    function buildResponse($msg, $user, $success)
    {
        //Build the headers
        $headers = ['alg' => 'HS256', 'typ' => 'JWT'];
        $headersEncoded = base64UrlEncode(json_encode($headers));

        //Build the signature
        $key = 'secret_server_key';
        $signature = hash_hmac('SHA256', "$headersEncoded", $key, true);
        $signatureEncoded = base64UrlEncode($signature);

        //Build and return the token
        $token = "$headersEncoded.$signatureEncoded";

        $response = (object)(
            array(
                'msg' => $msg,
                'data' => $user,
                'token' => $token,
                'success' => $success
            )
        );

        return json_encode($response);
    }

    function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
?>