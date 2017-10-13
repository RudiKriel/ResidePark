<?php
    header("Access-Control-Allow-Origin:*");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header('Access-Control-Allow-Headers: X-HTTP-Method-Override, Content-Type, x-requested-with');
    header('Content-Type: application/json');

    require_once(dirname(__FILE__) . '/dbHandler.php');

    $action = $_POST['action'];

    $db = new Database();
    $response = new stdClass();

    switch ($action) {
        case 'saveSearch': saveSearch($_POST['userId'], $db);
            break;
        case 'removeSearch': removeSearch($_POST['criteriaId'], $db);
            break;
        case 'emailOpt': emailOpt($_POST['criteriaId'], $db);
            break;
        case 'getSearches': getSearhces($_POST['userId'], $db);
            break;
        case 'getRecentSearches': getRecentSearhces($_POST['userId'], $db);
            break;
    }

    function saveSearch($userId, $db)
    {
        $beds = $_POST['beds'];
        $minPrice = $_POST['minPrice'];
        $maxPrice = $_POST['maxPrice'];
        $propertyTypes = $_POST['properties'];
        $criteria = $_POST['qry'];

        if (!empty($beds) || !empty($minPrice) || !empty($maxPrice) || !empty($propertyTypes) || !empty($criteria)) {
            $rows = $db->select("SELECT * FROM usersearchcriteria
                                 WHERE UserID = '$userId' AND Beds = '$beds' AND MinPrice = '$minPrice' AND MaxPrice = '$maxPrice' AND Criteria = '$criteria' AND PropertyType = '$propertyTypes'");

            if (count($rows) == 0) {
                $timestamp = date('Y-m-d H:i:s', time());

                $criteriaId = $db->insert("INSERT INTO usersearchcriteria (UserID, Beds, MinPrice, MaxPrice, PropertyType, Criteria, OptEmail, DateStamp, SavedDate)
                                           VALUES ('$userId', '$beds', '$minPrice', '$maxPrice', '$propertyTypes', '$criteria', 1, '$timestamp', '$timestamp')");

                $db->insert("INSERT INTO emailevents (UserID, CriteriaID, EventType, IsSent, IsDeleted, DateStamp)
                             VALUES ('$userId', '$criteriaId', 'Criteria', 0, 0, '$timestamp')");

                $response = (object)(
                    array(
                        'msg' => 'Search criteria saved.'
                    )
                );
            } else {
                $response = (object)(
                    array(
                        'msg' => 'Search criteria was already saved previously.'
                    )
                );
            }
        }
        else {
            $response = (object)(
                array(
                    'msg' => 'Search criteria was not saved, no criteria was specified.'
                )
            );
        }

        echo json_encode($response);
    }

    function removeSearch($criteriaId, $db) {
        $rows = $db->select("SELECT UC.CriteriaID, EE.CriteriaID FROM emailevents EE
                             INNER JOIN usersearchcriteria UC ON UC.CriteriaID = EE.CriteriaID
                             WHERE UC.CriteriaID = $criteriaId AND EE.IsDeleted = 0");

        if (count($rows) > 0) {
            $db->update("DELETE FROM usersearchcriteria
                         WHERE CriteriaID = $criteriaId");

            $db->update("UPDATE emailevents SET IsDeleted = 1
                         WHERE CriteriaID = $criteriaId AND IsDeleted = 0");
        }
    }

    function emailOpt($criteriaId, $db)
    {
        $rows = $db->select("SELECT EE.EventID FROM emailevents EE
                             INNER JOIN usersearchcriteria UC ON UC.CriteriaID = EE.CriteriaID
                             WHERE EE.CriteriaID = '$criteriaId' AND EE.EventType = 'Criteria' AND UC.OptEmail = 1 AND EE.IsDeleted = 0");

        if (count($rows) > 0) {
            $db->update("UPDATE usersearchcriteria SET OptEmail = 0
                         WHERE CriteriaID = '$criteriaId' AND OptEmail = 1");
        } else {
            $rows = $db->select("SELECT EE.EventID FROM emailevents EE
                                 INNER JOIN usersearchcriteria UC ON UC.CriteriaID = EE.CriteriaID
                                 WHERE EE.CriteriaID = '$criteriaId' AND EE.EventType = 'Criteria' AND UC.OptEmail = 0 AND EE.IsDeleted = 0");

            if (count($rows) > 0) {
                $db->update("UPDATE usersearchcriteria SET OptEmail = 1
                             WHERE CriteriaID = '$criteriaId' AND OptEmail = 0");
            }
        }
    }

    function getSearhces($userId, $db)
    {
        $rows = $db->select("SELECT * FROM usersearchcriteria
                             WHERE UserID = '$userId'");

        searches($rows);
    }

    function getRecentSearhces($userId, $db)
    {
        $rows = $db->select("SELECT * FROM usersearchcriteria
                             WHERE UserID = '$userId'
                             ORDER BY SavedDate DESC
                             LIMIT 10");

        searches($rows);
    }

    function searches($rows) {
        $searches = array();

        if (count($rows) > 0) {
            foreach ($rows as $row) {
                $criteria = new stdClass();

                $criteria->id = $row['CriteriaID'];
                $criteria->userId = $row['UserID'];
                $criteria->minPrice = $row['MinPrice'];
                $criteria->maxPrice = $row['MaxPrice'];
                $criteria->beds = $row['Beds'];
                $criteria->properties = $row['PropertyType'];
                $criteria->criteria = $row['Criteria'];
                $criteria->isOptEmail = $row['OptEmail'] == 1 ? true : false;

                array_push($searches, $criteria);
            }
        }

        $response = (object)(
            array(
                'searches' => $searches
            )
        );

        echo json_encode($response);
    }
?>