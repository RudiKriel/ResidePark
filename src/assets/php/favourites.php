<?php
    header("Access-Control-Allow-Origin:*");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header('Access-Control-Allow-Headers: X-HTTP-Method-Override, Content-Type, X-Requested-With');
    header('Content-Type: application/json');

    require_once(dirname(__FILE__) . '/dbHandler.php');

    $action = $_POST['action'];
    $userId = $_POST['userId'];

    $db = new Database();
    $response = new stdClass();

    switch ($action) {
        case 'saveFavourite': saveFavourite($userId, $db);
            break;
        case 'emailOpt': emailOpt($userId, $db);
            break;
        case 'getFavourites': getFavourites($userId, $db);
            break;
    }

    function saveFavourite($userId, $db)
    {
        $price = $_POST['price'];
        $status = $_POST['status'];
        $mls = $_POST['mls'];

        $rows = $db->select("SELECT * FROM favourites
                             WHERE UserID = '$userId' AND MLSNumber = '$mls'");

        if (count($rows) > 0) {
            $db->update("UPDATE emailevents SET IsDeleted = 1
                         WHERE UserID = '$userId' AND MLSNumber = '$mls' AND EventType = 'Favourite' AND IsDeleted = 0");

            $db->update("DELETE FROM favourites
                         WHERE UserID = '$userId' AND MLSNumber = '$mls'");
        } else {
            $favouriteId = $db->insert("INSERT INTO favourites (UserID, MLSNumber, Price, Status, OptEmail)
                                        VALUES ('$userId', '$mls', '$price', '$status', 1)");

            $timestamp = date('Y-m-d H:i:s', time());

            $db->insert("INSERT INTO emailevents (UserID, FavouriteID, EventType, MLSNumber, IsSent, IsDeleted, DateStamp)
                         VALUES ('$userId', '$favouriteId', 'Favourite', '$mls', 0, 0, '$timestamp')");
        }

        getFavourites($userId, $db);
    }

    function emailOpt($userId, $db)
    {
        $mls = $_POST['mls'];

        $rows = $db->select("SELECT EE.EventID FROM emailevents EE
                             INNER JOIN favourites F ON F.FavouriteId = EE.FavouriteId
                             WHERE EE.UserID = '$userId' AND EE.MLSNumber = '$mls' AND EE.EventType = 'Favourite' AND F.OptEmail = 1 AND EE.IsDeleted = 0");

        if (count($rows) > 0) {
            $db->update("UPDATE favourites SET OptEmail = 0
                         WHERE UserID = '$userId' AND MLSNumber = '$mls' AND OptEmail = 1");
        } else {
            $rows = $db->select("SELECT EE.EventID FROM emailevents EE
                                 INNER JOIN favourites F ON F.FavouriteId = EE.FavouriteId
                                 WHERE EE.UserID = '$userId' AND EE.MLSNumber = '$mls' AND EE.EventType = 'Favourite' AND F.OptEmail = 0 AND EE.IsDeleted = 0");

            if (count($rows) > 0) {
                $db->update("UPDATE favourites SET OptEmail = 1
                             WHERE UserID = '$userId' AND MLSNumber = '$mls' AND OptEmail = 0");
            }
        }
    }

    function getFavourites($userId, $db)
    {
        $rows = $db->select("SELECT MLSNumber, Price, Status, OptEmail FROM favourites
                             WHERE UserID = '$userId'");

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
?>