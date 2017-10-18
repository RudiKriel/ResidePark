<?php
    class Login
    {
        private $db;
        private $username;
        private $password;

        public function __construct($parameters) {
            require_once(dirname(__FILE__) . '/dbHandler.php');

            $this->db = new Database();

            //Prevent SQL injection
            $this->username = $this->db->quote($parameters['username']);
            $this->password = $this->db->quote($parameters['password']);
        }

        function login()
        {
            if(isset($this->username) && isset($this->password)) {
                $rows = $this->db->select("SELECT * FROM users
                                           WHERE Username = $this->username");

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

                    if (password_verify($this->password, $hash)) {
                        $lastLoggedIn = date('Y-m-d H:i:s');

                        $this->db->update("UPDATE users SET LastLoggedIn = '$lastLoggedIn'
                                           WHERE UserID = '$user->id'");

                        echo $this->buildResponse('', $user, true);
                    }
                    else {
                        echo $this->buildResponse('Incorrect username or password. Please try again', [], false);
                    }
                } else {
                    echo $this->buildResponse('Incorrect username or password. Please try again', [], false);
                }
            } else {
                echo $this->buildResponse('Server error, could not find user', [], false);
            }
        }

        private function buildResponse($msg, $user, $success)
        {
            //Build the headers
            $headers = ['alg' => 'HS256', 'typ' => 'JWT'];
            $headersEncoded = $this->base64UrlEncode(json_encode($headers));

            //Build the signature
            $key = 'secret_server_key';
            $signature = hash_hmac('SHA256', "$headersEncoded", $key, true);
            $signatureEncoded = $this->base64UrlEncode($signature);

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

        private function base64UrlEncode($data) {
            return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
        }
    }
?>