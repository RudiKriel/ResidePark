<?php
    header("Access-Control-Allow-Origin:*");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header('Access-Control-Allow-Headers: X-HTTP-Method-Override, Content-Type, X-Requested-With');
    header('Content-Type: application/json');

    require_once(dirname(__FILE__) . '/dbHandler.php');

    $userId = $_POST['userId'];
    $hasChanges = false;
    $db = new Database();

    $rows = $db->select("SELECT EE.UserID, EE.FavouriteID, U.Username, U.FirstName, U.LastName, F.MLSNumber, F.Price, F.Status FROM users U
                         INNER JOIN emailevents EE ON EE.UserID = U.UserID
                         INNER JOIN favourites F ON F.FavouriteID = EE.FavouriteID
                         WHERE EE.IsSent = 0 AND EE.EventType = 'Favourite' AND F.UserID = '$userId' AND EE.IsDeleted = 0");

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
?>