<?php
    //Get favourites for comparison
    function getFavourites($rows)
    {
        $mlsNumbers = Array();
        $favourites = Array();

        foreach ($rows as $row) {
            $favourite = new stdClass();

            $favourite->id = $row['FavouriteID'];
            $favourite->userId = $row['UserID'];
            $favourite->username = $row['Username'];
            $favourite->firstName = $row['FirstName'];
            $favourite->lastName = $row['LastName'];
            $favourite->mls = $row['MLSNumber'];
            $favourite->price = $row['Price'];
            $favourite->status = $row['Status'];

            if (!in_array($row['MLSNumber'], $favourites, true)) {
                $favourites[$row['MLSNumber']] = $favourite;
            } else {
                echo 'ISSUE';
                echo $row['MLSNumber'];
                die();
            }

            array_push($mlsNumbers, $row['MLSNumber']);
        }

        $response = (object)(
            array(
                'mls' => $mlsNumbers,
                'favourites' => $favourites
            )
        );

        return $response;
    }

    //Get favourite searches for comparison
    function getSearches($rows)
    {
        $searches = Array();

        foreach ($rows as $row) {
            $criteria = new stdClass();

            $criteria->id = $row['CriteriaID'];
            $criteria->userId = $row['UserID'];
            $criteria->username = $row['Username'];
            $criteria->firstName = $row['FirstName'];
            $criteria->lastName = $row['LastName'];
            $criteria->minPrice = $row['MinPrice'];
            $criteria->maxPrice = $row['MaxPrice'];
            $criteria->beds = $row['Beds'];
            $criteria->propertyTypes = $row['PropertyType'];
            $criteria->criteria = $row['Criteria'];
            $criteria->modifiedDate = $row['DateStamp'];

            $searches[] = $criteria;
        }

        return $searches;
    }

    //Get favourite listings from Realcove API
    function getFavouriteListings($mlsNumbers)
    {
        $url = 'https://secure.realcove.com/api.php?';

        $postdata = http_build_query(
            array(
                'partner_key' => '7e52cad4e91ee36e308d35f93a9db02b',
                'action' => 'propertySearch',
                'return' => 'json',
                'search_limit' => 10000,
                'search_mls_id' => ['1'],
                'search_mls_num' => $mlsNumbers
            )
        );

        $opts = array('http' =>
            array(
                'method' => 'POST',
                'header' => 'Content-type: application/x-www-form-urlencoded',
                'content' => $postdata
            )
        );

        $context = stream_context_create($opts);
        $result = file_get_contents($url, false, $context);

        return json_decode($result);
    }

    //Get search listings from Realcove API
    function getSearchListings()
    {
        $url = 'https://secure.realcove.com/api.php?';

        $postdata = http_build_query(
            array(
                'partner_key' => '7e52cad4e91ee36e308d35f93a9db02b',
                'action' => 'propertySearch',
                'return' => 'json',
                'search_limit' => 10000,
                'search_mls_id' => ['1'],
                'search_mls_num' => ['']
            )
        );

        $opts = array('http' =>
            array(
                'method' => 'POST',
                'header' => 'Content-type: application/x-www-form-urlencoded',
                'content' => $postdata
            )
        );

        $context = stream_context_create($opts);
        $result = file_get_contents($url, false, $context);

        return json_decode($result);
    }

    //Gets a list of the favourite listing changes
    function getChangedFavouriteListings ($listings, $favourites)
    {
        $changedListings = Array();

        foreach ($listings->data as $listItem) {
            if (!empty($favourites[$listItem->mls_num])) {
                $favPrice = (float)str_replace(',', '', $favourites[$listItem->mls_num]->price);
                $listPrice = (float)str_replace(',', '', $listItem->price);

                if ($listPrice != $favPrice || $listItem->status != $favourites[$listItem->mls_num]->status) {
                    $user = new stdClass();
                    $listing = new stdClass();

                    $listing->favouriteId = $favourites[$listItem->mls_num]->id;
                    $listing->mls = $favourites[$listItem->mls_num]->mls;
                    $listing->price = $listPrice;
                    $listing->oldPrice = $favPrice;
                    $listing->status = $listItem->status;
                    $listing->oldStatus = $favourites[$listItem->mls_num]->status;

                    if (!empty($changedListings[$favourites[$listItem->mls_num]->userId])) {
                        $changedListings[$favourites[$listItem->mls_num]->userId]->listings[] = $listing;
                    } else {
                        $user->userId = $favourites[$listItem->mls_num]->userId;
                        $user->username = $favourites[$listItem->mls_num]->username;
                        $user->firstName = $favourites[$listItem->mls_num]->firstName;
                        $user->lastName = $favourites[$listItem->mls_num]->lastName;

                        $user->listings[] = $listing;
                        $changedListings[$user->userId] = $user;
                    }
                }
            }
        }

        return $changedListings;
    }

    //Gets a list of the saved search listing changes
    function getChangedSearchListings ($listings, $searches)
    {
        $changedListings = Array();

        foreach ($listings->data as $listItem) {
            $price = (float)str_replace(',', '', $listItem->price);

            foreach ($searches as $search) {
                $minPrice = $search->minPrice != '' ? (float)str_replace(',', '', $search->minPrice) : $price;
                $maxPrice = $search->maxPrice != '' ? (float)str_replace(',', '', $search->maxPrice) : $price;
                $beds = $search->beds != '' ? $search->beds : $listItem->beds;
                $propertyType = $search->propertyTypes != '' ? $search->propertyTypes : $listItem->property_type;
                $qry = strtolower($search->criteria);
                $searchModifiedDate = new DateTime($search->modifiedDate);
                $modifiedDate = new DateTime($listItem->modified_date);

                if ($price >= $minPrice && $price <= $maxPrice && $listItem->beds >= $beds && strpos($propertyType, $listItem->property_type) !== false &&
                    (strpos($listItem->mls_num, $qry) !== false || strpos(strtolower($listItem->property_type), $qry) !== false || strpos(strtolower($listItem->address), $qry) !== false || strpos(strtolower($listItem->address), $qry) !== false ||
                        strpos(strtolower($listItem->city), $qry) !== false || strpos(strtolower($listItem->county), $qry) !== false || strpos(strtolower($listItem->state), $qry) !== false || strpos(strtolower($listItem->zip), $qry) !== false ||
                        strpos(strtolower($listItem->area_name), $qry) !== false || strpos(strtolower($listItem->subdivision), $qry) !== false || strpos(strtolower($listItem->description), $qry) !== false ||
                        strpos(strtolower($listItem->publicremarks), $qry) !== false) && $modifiedDate > $searchModifiedDate) {
                    $user = new stdClass();
                    $listing = new stdClass();

                    $listing->mls = $listItem->mls_num;
                    $listing->price = $price;
                    $listing->status = $listItem->status;
                    $listing->modifiedDate = $modifiedDate;

                    if (!empty($changedListings[$search->userId])) {
                        $changedListings[$search->userId]->listings[] = $listing;
                    } else {
                        $user->userId = $search->userId;
                        $user->criteriaId = $search->id;
                        $user->username = $search->username;
                        $user->firstName = $search->firstName;
                        $user->lastName = $search->lastName;

                        $user->listings[] = $listing;
                        $changedListings[$user->userId] = $user;
                    }
                }
            }
        }

        return $changedListings;
    }
?>