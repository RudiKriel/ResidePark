<?php
    class Database {
        protected static $connection;

        public function connect() {
            // Try connect to the database
            if (!isset(self::$connection)) {
                $config = parse_ini_file('../dbConfig.ini');

                self::$connection = new mysqli($config['server'], $config['username'], $config['password'], $config['dbname']);
            }

            if (self::$connection === false) {
                echo("Connection error" . mysqli_error(self::$connection));
                return false;
            }

            return self::$connection;
        }

        public function query($query) {
            // Connect to the database
            $connection = $this->connect();

            // Query the database
            $result = $connection->query($query);

            return $result;
        }

        public function select($query) {
            $rows = array();
            $result = $this->query($query);

            if ($result === false) {
                return false;
            }

            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }

            return $rows;
        }

        public function insert($query) {
            $this->query($query);
            return mysqli_insert_id(self::$connection);
        }

        public function update($query) {
            $this->query($query);
        }

        public function quote($value) {
            $connection = $this->connect();
            return "'" . $connection->real_escape_string(stripslashes($value)) . "'";
        }
    }
?>