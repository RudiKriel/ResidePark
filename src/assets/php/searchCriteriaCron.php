<?php
    header("Access-Control-Allow-Origin:*");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header('Access-Control-Allow-Headers: X-HTTP-Method-Override, Content-Type, X-Requested-With');
    header('Content-Type: application/json');

    require_once(dirname(__FILE__) . '/dbHandler.php');
    require_once(dirname(__FILE__) . '/emailHandler.php');

    $db = new Database();

    $rows = $db->select("SELECT EE.UserID, EE.CriteriaID, U.Username, U.FirstName, U.LastName, UC.MinPrice, UC.MaxPrice, UC.Beds, UC.PropertyType, UC.Criteria, UC.DateStamp FROM users U
                         INNER JOIN emailevents EE ON EE.UserID = U.UserID
                         INNER JOIN usersearchcriteria UC ON UC.CriteriaID = EE.CriteriaID
                         WHERE EE.IsSent = 0 AND EE.EventType = 'Criteria' AND UC.OptEmail = 1 AND EE.IsDeleted = 0");

    if (!empty($rows) && count($rows) > 0) {
        include_once(dirname(__FILE__) . '/favouritesHelper.php');

        $searches = getSearches($rows);

        //Get all listings from Realcove for comparing search criteria
        if(!empty($searches)) {
            $listings = getSearchListings();

            //Compare Realcove listings with favourite searched listings and get the changes
            if (!empty($listings) && !empty($searches)) {
                $changedListings = getChangedSearchListings($listings, $searches);

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
        $subject = 'Listing(s) were modified';

        foreach ($users as $user) {
            $body = "Hi $user->firstName $user->lastName, \n\n";
            $body .= "The following listings have been modified:\n";

            foreach ($user->listings as $listing) {
                $body .= "MLS: $listing->mls \n";
                $body .= "Price: $listing->price \n";
                $body .= "Status: $listing->status \n";
                $body .= "Modified date: $listing->modifiedDate->format('d/m/Y H:i:s') \n";
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
        $criteriaIds = array();
        $timestamp = date('Y-m-d H:i:s', time());
        $updateSql = "UPDATE usersearchcriteria SET DateStamp = (CASE CriteriaID ";

        foreach ($users as $user) {
            $userIds[] = $user->userId;
            $criteriaIds[] = $user->criteriaId;

            $updateSql .= "WHEN $user->criteriaId THEN '$timestamp' ";
        }

        $userId = !empty($userIds) ? '(' . implode(',', $userIds) . ')' : '(0)';
        $criteriaId = !empty($criteriaIds) ? '(' . implode(',', $criteriaIds) . ')' : '(0)';

        $updateSql .= "END) WHERE CriteriaID IN $criteriaId";

        //Update Favourite searches with new modified date
        $db->update($updateSql);

        //Update events when emails are sent
        $db->update("UPDATE emailevents SET IsSent = 1
                     WHERE IsSent = 0 AND EventType = 'Criteria' AND IsDeleted = 0 AND UserID IN $userId AND CriteriaID IN $criteriaId");

        //Create new events for when listings change again
        $insertSql = "INSERT INTO emailevents (UserID, CriteriaID, EventType, IsSent, IsDeleted, DateStamp)
                      VALUES ";

        $i = 0;

        foreach($users as $user) {
            $listings = $user->listings;

            if ($i !== count($listings) - 1) {
                $insertSql .= "($user->userId, $user->criteriaId, 'Criteria', 0, 0, '$timestamp'),";
            }
            else {
                $insertSql .= "($user->userId, $user->criteriaId, 'Criteria', 0, 0, '$timestamp')";
            }

            $i++;
        }

        $db->insert($insertSql);
    }
?>