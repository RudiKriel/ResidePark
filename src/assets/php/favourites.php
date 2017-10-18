<?php
    class Favourites
    {
        private $db;
        private $action;
        private $userId;
        private $mls;
        private $price;
        private $status;

        public function __construct($parameters) {
            require_once(dirname(__FILE__) . '/dbHandler.php');

            $this->db = new Database();
            $this->action = $parameters['subAction'];
            $this->userId = isset($parameters['userId']) ? $parameters['userId'] : '';
            $this->mls = isset($parameters['mls']) ? $parameters['mls'] : '';
            $this->price = isset($parameters['price']) ? $parameters['price'] : '';
            $this->status = isset($parameters['status']) ? $parameters['status'] : '';
        }

        function setFavourites()
        {
            switch ($this->action) {
                case 'saveFavourite':
                    $this->saveFavourite();
                    break;
                case 'emailOpt':
                    $this->emailOpt();
                    break;
                case 'getFavourites':
                    $this->getFavourites();
                    break;
            }
        }

        private function saveFavourite()
        {
            $rows = $this->db->select("SELECT * FROM favourites
                                       WHERE UserID = '$this->userId' AND MLSNumber = '$this->mls'");

            if (count($rows) > 0) {
                $this->db->update("UPDATE emailevents SET IsDeleted = 1
                                   WHERE UserID = '$this->userId' AND MLSNumber = '$this->mls' AND EventType = 'Favourite' AND IsDeleted = 0");

                $this->db->update("DELETE FROM favourites
                                   WHERE UserID = '$this->userId' AND MLSNumber = '$this->mls'");
            } else {
                $favouriteId = $this->db->insert("INSERT INTO favourites (UserID, MLSNumber, Price, Status, OptEmail)
                                                  VALUES ('$this->userId', '$this->mls', '$this->price', '$this->status', 1)");

                $timestamp = date('Y-m-d H:i:s', time());

                $this->db->insert("INSERT INTO emailevents (UserID, FavouriteID, EventType, MLSNumber, IsSent, IsDeleted, DateStamp)
                                   VALUES ('$this->userId', '$favouriteId', 'Favourite', '$this->mls', 0, 0, '$timestamp')");
            }

            $this->getFavourites();
        }

        private function emailOpt()
        {
            $rows = $this->db->select("SELECT EE.EventID FROM emailevents EE
                                       INNER JOIN favourites F ON F.FavouriteId = EE.FavouriteId
                                       WHERE EE.UserID = '$this->userId' AND EE.MLSNumber = '$this->mls' AND EE.EventType = 'Favourite' AND F.OptEmail = 1 AND EE.IsDeleted = 0");

            if (count($rows) > 0) {
                $this->db->update("UPDATE favourites SET OptEmail = 0
                         WHERE UserID = '$this->userId' AND MLSNumber = '$this->mls' AND OptEmail = 1");
            } else {
                $rows = $this->db->select("SELECT EE.EventID FROM emailevents EE
                                           INNER JOIN favourites F ON F.FavouriteId = EE.FavouriteId
                                           WHERE EE.UserID = '$this->userId' AND EE.MLSNumber = '$this->mls' AND EE.EventType = 'Favourite' AND F.OptEmail = 0 AND EE.IsDeleted = 0");

                if (count($rows) > 0) {
                    $this->db->update("UPDATE favourites SET OptEmail = 1
                                       WHERE UserID = '$this->userId' AND MLSNumber = '$this->mls' AND OptEmail = 0");
                }
            }
        }

        private function getFavourites()
        {
            $response = new stdClass();
            $rows = $this->db->select("SELECT MLSNumber, Price, Status, OptEmail FROM favourites
                                       WHERE UserID = '$this->userId'");

            $favourites = array();

            if (count($rows) > 0) {
                foreach ($rows as $row) {
                    $favourite = new stdClass();

                    $favourite->mls = $row['MLSNumber'];
                    $favourite->price = $row['Price'];
                    $favourite->status = $row['Status'];
                    $favourite->optEmail = $row['OptEmail'];

                    array_push($favourites, $favourite);
                }
            }
            else {
                $favourite = new stdClass();

                $favourite->mls = '1';
                $favourite->price = 0;
                $favourite->status = '';
                $favourite->optEmail = 0;

                array_push($favourites, $favourite);
            }

            $response = (object)(
                array(
                    'favourites' => $favourites
                )
            );

            echo json_encode($response);
        }
    }
?>