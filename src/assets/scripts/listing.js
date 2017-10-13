/**
 * Toggle favourites after saving a favourite.
 */
$('body').off('click').on('click', '.toggleFavourite', function() {
    $(this).toggleClass('fa-star-o fa-star');
});

/**
 * Toggle opting in and out of emails for favourites.
 */
$('body').on('click', '.toggleFavouriteEmail', function() {
    $(this).toggleClass('fa-envelope-o fa-envelope');
});

/**
 * Toggle opting in and out of emails for saved searches.
 */
$('body').on('click', '.toggleSearchEmail', function() {
    $(this).toggleClass('fa-envelope-o fa-envelope');
});