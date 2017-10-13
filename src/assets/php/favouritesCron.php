<?php
    header("Access-Control-Allow-Origin:*");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header('Access-Control-Allow-Headers: X-HTTP-Method-Override, Content-Type, X-Requested-With');
    header('Content-Type: application/json');

    require_once(dirname(__FILE__) . '/dbHandler.php');
    require_once(dirname(__FILE__) . '/emailHandler.php');

    $db = new Database();

    $rows = $db->select("SELECT EE.UserID, EE.FavouriteID, U.Username, U.FirstName, U.LastName, F.MLSNumber, F.Price, F.Status FROM users U
                         INNER JOIN emailevents EE ON EE.UserID = U.UserID
                         INNER JOIN favourites F ON F.FavouriteID = EE.FavouriteID
                         WHERE EE.IsSent = 0 AND EE.EventType = 'Favourite' AND F.OptEmail = 1 AND EE.IsDeleted = 0");

    if (!empty($rows) && count($rows) > 0) {
        include_once(dirname(__FILE__) . '/favouritesHelper.php');

        $response = getFavourites($rows);

        //Get favourite listings from Realcove
        if(!empty($response->mls)) {
            $listings = getFavouriteListings($response->mls);

            //Compare Realcove listings with favourite listings and get the changes
            if (!empty($listings) && !empty($response->favourites)) {
                $changedListings = getChangedFavouriteListings($listings, $response->favourites);

                if (!empty($changedListings)) {
                    //Send Emails
                    sendEmails($changedListings);

                    //Change event statuses
                    changeEventStatus($changedListings, $db);
                }
            }
        }
    }

    function sendEmails($users) {
        $mail = new Email();
        $subject = 'Favourite listing(s) have changes';

        foreach ($users as $user) {
            $body = "Hi $user->firstName $user->lastName, \n\n";
            $body .= "The following listings have changed:\n";

            foreach ($user->listings as $listing) {
                $body .= "MLS: $listing->mls \n";

                if ($listing->price != $listing->oldPrice) {
                    $body .= "Price: Old: $listing->oldPrice, New: $listing->price \n";
                }

                if ($listing->status != $listing->oldStatus) {
                    $body .= "Status: Old: $listing->oldStatus, New: $listing->status \n";
                }
            }

            $body .= "\nKind regards";

            $mail->setup();
            $mail->buildEmail($user->username, $subject, $body, $user->firstName, $user->lastName);
            $mail->send();
        }
    }

    function changeEventStatus ($users, $db)
    {
        $userIds = Array();
        $mlsNumbers = Array();
        $favouriteIds = array();
        $updateSql = "UPDATE favourites SET Price = (CASE FavouriteID ";

        foreach ($users as $user) {
            $userIds[] = $user->userId;

            foreach ($user->listings as $listing) {
                $mlsNumbers[] = $listing->mls;
                $favouriteIds[] = $listing->favouriteId;
                $price = number_format($listing->price);

                $updateSql .= "WHEN $listing->favouriteId THEN '$price' ";
            }
        }

        $userId = !empty($userIds) ? '(' . implode(',', $userIds) . ')' : '(0)';
        $favouriteId = !empty($favouriteIds) ? '(' . implode(',', $favouriteIds) . ')' : '(0)';
        $mls = !empty($mlsNumbers) ? '\'' . trim(implode("','",$mlsNumbers),"','") . '\'' : '0';

        $updateSql .= "END), Status = (CASE ";

        foreach ($users as $user) {
            foreach ($user->listings as $listing) {
                $updateSql .= "WHEN $listing->favouriteId THEN '$listing->status' ";
            }
        }

        $updateSql .= "END) WHERE FavouriteID IN $favouriteId";

        //Update Favourites with new prices and statuses
        $db->update($updateSql);

        //Update events when emails are sent
        $db->update("UPDATE emailevents SET IsSent = 1
                     WHERE IsSent = 0 AND EventType = 'Favourite' AND IsDeleted = 0 AND UserID IN $userId AND MLSNumber IN ($mls) AND FavouriteID IN $favouriteId");

        //Create new events for when listings change again
        $insertSql = "INSERT INTO emailevents (UserID, FavouriteID, EventType, MLSNumber, IsSent, IsDeleted, DateStamp)
                      VALUES ";

        $timestamp = date('Y-m-d H:i:s', time());
        $i = 0;

        foreach($users as $user) {
            $j = 0;
            $listings = $user->listings;

            foreach($listings as $listing) {
                if ($j !== count($listings) - 1) {
                    $insertSql .= "($user->userId, $listing->favouriteId, 'Favourite', '$listing->mls', 0, 0, '$timestamp'),";
                }
                else {
                    $insertSql .= "($user->userId, $listing->favouriteId, 'Favourite', '$listing->mls', 0, 0, '$timestamp')";
                }

                $j++;
            }

            if ($i !== count($users) - 1) {
                $insertSql .= ",";
            }

            $i++;
        }

        $db->insert($insertSql);
    }
?>