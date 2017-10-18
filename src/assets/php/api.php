<?php
    header("Access-Control-Allow-Origin:*");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
    header('Access-Control-Allow-Headers: X-HTTP-Method-Override, Content-Type, X-Requested-With');
    header('Content-Type: application/json');

    $action = isset($_POST['action']) && $_POST['action'] !== '' ? $_POST['action'] : false;
    $parameters = !empty($_POST) ? $_POST : false;

    if ($action && $parameters) {
        switch($action) {
            case 'login':
                include_once (dirname(__FILE__) . '/login.php');
                $re = new Login($parameters);
                $re->login();
                break;
            case 'signup':
                include_once (dirname(__FILE__) . '/signup.php');
                $re = new Signup($parameters);
                $re->signup();
                break;
            case 'question':
                include_once (dirname(__FILE__) . '/questionForm.php');
                $re = new QuestionForm($parameters);
                $re->sendEmail();
                break;
            case 'favourites':
                include_once (dirname(__FILE__) . '/favourites.php');
                $re = new Favourites($parameters);
                $re->setFavourites();
                break;
            case 'searches':
                include_once (dirname(__FILE__) . '/searchCriteria.php');
                $re = new Searches($parameters);
                $re->setSearches();
                break;
            case 'favouritesChanged':
                include_once (dirname(__FILE__) . '/favouritesChanges.php');
                $re = new FavouritesChanges($parameters);
                $re->favouritesChanged();
                break;
        }
    }
?>