<?php
    class FavouritesChanges
    {
        private $db;
        private $userId;

        public function __construct($parameters) {
            require_once(dirname(__FILE__) . '/dbHandler.php');

            $this->db = new Database();
            $this->userId = $parameters['userId'];
        }

        function favouritesChanged()
        {
            $hasChanges = false;

            $rows = $this->db->select("SELECT EE.UserID, EE.FavouriteID, U.Username, U.FirstName, U.LastName, F.MLSNumber, F.Price, F.Status FROM users U
                                       INNER JOIN emailevents EE ON EE.UserID = U.UserID
                                       INNER JOIN favourites F ON F.FavouriteID = EE.FavouriteID
                                       WHERE EE.IsSent = 0 AND EE.EventType = 'Favourite' AND F.UserID = '$this->userId' AND EE.IsDeleted = 0");

            if (count($rows) > 0) {
                include_once(dirname(__FILE__) . '/favouritesHelper.php');

                $favouriteResponse = getFavourites($rows);

                if(!empty($favouriteResponse->mls)) {
                    $listings = getFavouriteListings($favouriteResponse->mls);

                    if (!empty($listings) && !empty($favouriteResponse->favourites)) {
                        $changedListings = getChangedFavouriteListings($listings, $favouriteResponse->favourites);

                        if (!empty($changedListings)) {
                            $hasChanges = true;
                        }
                    }
                }
            }

            $response = (object)(
                array(
                    'hasChanges' => $hasChanges,
                    'rows' => $rows
                )
            );

            echo json_encode($response);
        }
    }
?>