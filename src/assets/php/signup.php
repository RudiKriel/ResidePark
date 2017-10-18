<?php
    class Signup
    {
        private $db;
        private $username;
        private $firstName;
        private $lastName;
        private $password;

        public function __construct($parameters) {
            require_once(dirname(__FILE__) . '/dbHandler.php');

            $this->db = new Database();

            //Prevent SQL injection
            $this->username = $this->db->quote($parameters['username']);
            $this->firstName = $this->db->quote($parameters['firstName']);
            $this->lastName = $this->db->quote($parameters['lastName']);
            $this->password = password_hash($this->db->quote($parameters['password']), PASSWORD_DEFAULT);
        }

        function signup()
        {
            $rows = $this->db->select("SELECT Username FROM users
                                       WHERE Username = $this->username");

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
                $this->db->insert("INSERT INTO users (UserName, FirstName, LastName, Password)
                                   VALUES ($this->username, $this->firstName, $this->lastName, '$this->password')");

                $response = (object)(
                    array(
                        'msg' => $this->username . ' has been signed up successfully',
                        'success' => true
                    )
                );
            }

            echo json_encode($response);
        }
    }
?>