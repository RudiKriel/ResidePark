<?php
    class Searches
    {
        private $db;
        private $action;
        private $userId;
        private $criteriaId;
        private $beds;
        private $minPrice;
        private $maxPrice;
        private $propertyTypes;
        private $criteria;
        private $response;

        public function __construct($parameters) {
            require_once(dirname(__FILE__) . '/dbHandler.php');

            $this->db = new Database();
            $this->response = new stdClass();

            $this->action = $parameters['subAction'];
            $this->userId = isset($parameters['userId']) ? $parameters['userId'] : '';
            $this->criteriaId = isset($parameters['criteriaId']) ? $parameters['criteriaId'] : '';
            $this->beds = isset($parameters['beds']) ? $parameters['beds'] : '';
            $this->minPrice = isset($parameters['minPrice']) ? $parameters['minPrice'] : '';
            $this->maxPrice = isset($parameters['maxPrice']) ? $parameters['maxPrice'] : '';
            $this->propertyTypes = isset($parameters['properties']) ? $parameters['properties'] : '';
            $this->criteria = isset($parameters['qry']) ? $parameters['qry'] : '';
        }

        function setSearches()
        {
            switch ($this->action) {
                case 'saveSearch': $this->saveSearch();
                    break;
                case 'removeSearch': $this->removeSearch();
                    break;
                case 'emailOpt': $this->emailOpt();
                    break;
                case 'getSearches': $this->getSearhces();
                    break;
                case 'getRecentSearches': $this->getRecentSearhces();
                    break;
            }
        }

        private function saveSearch()
        {
            if (!empty($this->beds) || !empty($this->minPrice) || !empty($this->maxPrice) || !empty($this->propertyTypes) || !empty($this->criteria)) {
                $rows = $this->db->select("SELECT * FROM usersearchcriteria
                                           WHERE UserID = '$this->userId' AND Beds = '$this->beds' AND MinPrice = '$this->minPrice' AND MaxPrice = '$this->maxPrice' AND Criteria = '$this->criteria' AND PropertyType = '$this->propertyTypes'");

                if (count($rows) == 0) {
                    $timestamp = date('Y-m-d H:i:s', time());

                    $this->criteriaId = $this->db->insert("INSERT INTO usersearchcriteria (UserID, Beds, MinPrice, MaxPrice, PropertyType, Criteria, OptEmail, DateStamp, SavedDate)
                                                     VALUES ('$this->userId', '$this->beds', '$this->minPrice', '$this->maxPrice', '$this->propertyTypes', '$this->criteria', 1, '$timestamp', '$timestamp')");

                    $this->db->insert("INSERT INTO emailevents (UserID, CriteriaID, EventType, IsSent, IsDeleted, DateStamp)
                                       VALUES ('$this->userId', '$this->criteriaId', 'Criteria', 0, 0, '$timestamp')");

                    $this->response = (object)(
                        array(
                            'msg' => 'Search criteria saved.'
                        )
                    );
                } else {
                    $this->response = (object)(
                        array(
                            'msg' => 'Search criteria was already saved previously.'
                        )
                    );
                }
            }
            else {
                $this->response = (object)(
                    array(
                        'msg' => 'Search criteria was not saved, no criteria was specified.'
                    )
                );
            }

            echo json_encode($this->response);
        }

        private function removeSearch() {
            $rows = $this->db->select("SELECT UC.CriteriaID, EE.CriteriaID FROM emailevents EE
                                       INNER JOIN usersearchcriteria UC ON UC.CriteriaID = EE.CriteriaID
                                       WHERE UC.CriteriaID = $this->criteriaId AND EE.IsDeleted = 0");

            if (count($rows) > 0) {
                $this->db->update("DELETE FROM usersearchcriteria
                                   WHERE CriteriaID = $this->criteriaId");

                $this->db->update("UPDATE emailevents SET IsDeleted = 1
                                   WHERE CriteriaID = $this->criteriaId AND IsDeleted = 0");
            }
        }

        private function emailOpt()
        {
            $rows = $this->db->select("SELECT EE.EventID FROM emailevents EE
                                       INNER JOIN usersearchcriteria UC ON UC.CriteriaID = EE.CriteriaID
                                       WHERE EE.CriteriaID = '$this->criteriaId' AND EE.EventType = 'Criteria' AND UC.OptEmail = 1 AND EE.IsDeleted = 0");

            if (count($rows) > 0) {
                $this->db->update("UPDATE usersearchcriteria SET OptEmail = 0
                                   WHERE CriteriaID = '$this->criteriaId' AND OptEmail = 1");
            } else {
                $rows = $this->db->select("SELECT EE.EventID FROM emailevents EE
                                           INNER JOIN usersearchcriteria UC ON UC.CriteriaID = EE.CriteriaID
                                           WHERE EE.CriteriaID = '$this->criteriaId' AND EE.EventType = 'Criteria' AND UC.OptEmail = 0 AND EE.IsDeleted = 0");

                if (count($rows) > 0) {
                    $this->db->update("UPDATE usersearchcriteria SET OptEmail = 1
                                       WHERE CriteriaID = '$this->criteriaId' AND OptEmail = 0");
                }
            }
        }

        private function getSearhces()
        {
            $rows = $this->db->select("SELECT * FROM usersearchcriteria
                                       WHERE UserID = '$this->userId'");

            $this->searches($rows);
        }

        private function getRecentSearhces()
        {
            $rows = $this->db->select("SELECT * FROM usersearchcriteria
                                       WHERE UserID = '$this->userId'
                                       ORDER BY SavedDate DESC
                                       LIMIT 10");

            $this->searches($rows);
        }

        private function searches($rows) {
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

            $this->response = (object)(
                array(
                    'searches' => $searches
                )
            );

            echo json_encode($this->response);
        }
    }
?>