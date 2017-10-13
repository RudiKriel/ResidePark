/**
 * Created by blazekotsenburg on 6/5/17.
 *
 * This file handles all of the necessary interactivity needed for the navigation bar outside of
 * the Bootstrap/Jquery library.
 */

var minPrices = [
    50000,
    100000,
    150000,
    200000,
    250000,
    300000,
    400000,
    500000
];

var metricPattern = /^\d{1,3}[mMkK]$/; // Pattern allows for m and k multipliers (eg 40k -> 40,000, 1M -> 1,000,000)
var intWithCommaPattern = /^\d{1,3}(,\d{3})*?$/; //Pattern allows commas (eg 700,000 matches)

/**
 * Allows the navbar to be fixed once the top of the navbar has reached the top of the page via
 * scrolling.
 */
$(window).bind('scroll', function () {

    if ($(window).scrollTop() > 501) {

        $('.navbar').addClass('navbar-fixed-top');
    } else {

        $('.navbar').removeClass('navbar-fixed-top');
    }
});

/**
 * This event listener makes sure that the price column is shifted to the right whenever the
 * max input has been put in focus. The prices will be adjusted depending on whether the min
 * input has a value or not.
 */
$("#max-input").on("focus", function () { //need to extract this method out so that it can be used for more than on click/focus. (priceoptions li listener)
    $("#price-options").addClass("shift-col-right");
    $("#min-input").removeClass("input-toggle");

    if (!$("#min-input").val()) { //Check that the navbar has a value.
        defaultMaxPriceOptions();
    }

    else if ($.isNumeric($("#min-input").val())) { //Check that user has put in number (no commas)
        if ($("#min-input").val().length >= 7){ // If the input has a length greater than 7, max price options increment by 250,000
            getMaxPriceOptions(250000, 1);
        }

        else {
            getMaxPriceOptions(25000, 1); //Increment max price options by 25,000
        }
    }
    else {

        updateMaxPrices($("#min-input").val()); //Determine price has been input by user.
    }
});

/**
 * When min input in Price dropdown is selected, shift all price options (<li>'s) to the left of the
 * dropdown column.
 */
$("#min-input").on("focus", function () {
    $("#price-options").removeClass("shift-col-right");
    $("#max-input").removeClass("input-toggle");

    defaultMinPriceOptions();
});

/**
 * When min input or max input in Price dropdown is selected, convert the value to its relative number.
 */
$("#min-input,#max-input").on("keyup change", function() {
    $(this).val(convertPrice($(this).val()));
});

/**
 * Listener that prevents dropdowns from closing after a sub-item in the dropdown list has been
 * clicked.
 */
$(".dropdown-content li").on("click", function (e) {
    e.stopPropagation();
});

/**
 * Every time that the "Any Price" drop down is clicked, add focus border to the min input and
 * shift the price options column back to the left with the min price default values.
 */
$("#price-dropdown-button").on("click", function () {
    $("#min-input").addClass("input-toggle");
    $("#max-input").removeClass("input-toggle");

    defaultMinPriceOptions();
    $("#price-options").removeClass("shift-col-right");
});

/**
 * Listens for a price option to be clicked on and handles the event accordingly.  If the max price input
 * is focused, just remove '$' & '+' chars. Else, if the min price input is focused, take off the '$' and
 * '+' characters and shift the price options (<li>'s) to the right.
 */
$("#price-options li").on("click", function () {
    var listItemVal = $(this).text();

    if ($("#price-options").hasClass("shift-col-right")) {
        $("#max-input").val(listItemVal.replace(/[$]+/, '')); //Places just the numbers and commas into the input with regexp
    }
    else {
        $("#min-input").val(listItemVal.replace(/[$+]+/g, ''));
        $("#min-input").removeClass("input-toggle");
        $("#price-options").addClass("shift-col-right");
        $("#max-input").addClass("input-toggle");

        updateMaxPrices($("#min-input").val());
    }
});

/**
 * This listener should set the value of beds that a user selects in the drop-down for beds.
 * This value will be sent to the server with a form.
 * ***Currently not working****. Want to use this to help pass the number of beds a user wants
 * to search for from the navbar (beds dropdown).
 */
$("#bed-options li").on("click", function (e) {
    var numBeds = parseInt($(this).text());

    $(".highlight").removeClass("highlight");
    $(this).addClass("highlight");
    $(this).closest(".dropdown").find("a[aria-expanded]").attr("aria-expanded", "false");
    $(this).closest(".dropdown").removeClass("open");
    $(this).closest(".dropdown").find("a").html($(this).html() + " Beds" + "<span class='caret'></span>");

    $("[name=beds]").val(numBeds);
});

/**
 * This method is used to determine what prices will be displayed on the price list after the
 * max-input has been put into focus.  It allows for a user to use commas in their input as well
 * as multipliers such as 40k = 40,000 and 10m= 10,000,000.
 *
 * @param minPriceInput - The value that is held in min-input
 */
function updateMaxPrices(minPriceInput) {
    var quarterK = 25000;
    var quarterM = 250000;

    // If a user inputs a metric multiplier, eg 40k, handle price options accordingly
    if (metricPattern.test(minPriceInput)) {
        var valAtMin = $("#min-input").val();

        if (valAtMin.charAt(valAtMin.length - 1) === "k" ||
            valAtMin.charAt(valAtMin.length - 1) === "K") {

            getMaxPriceOptions(quarterK, 1000);
        }
        else {
            getMaxPriceOptions(quarterM, 1000000);
        }
    }

    // If a user inputs integer with comma, eg 1,000,000 , handle price options accordingly
    else if (intWithCommaPattern.test(minPriceInput)) {
        if ($("#min-input").val().replace(/,/g, '').length >= 7) {

            var tempM = quarterM;

            $(".priceMin").each(function () {
                var valToInt = parseInt($("#min-input").val().replace(/,/g, ''), 10);
                $(this).text("$" + (numberWithCommas(valToInt + tempM)));
                tempM += quarterM;
            });
        }

        else {

            var tempK = quarterK;

            $(".priceMin").each(function () {
                var valToInt = parseInt($("#min-input").val().replace(/,/g, ''), 10);
                $(this).text("$" + (numberWithCommas(valToInt + tempK)));

                tempK += quarterK;
            });
        }
    }

     // Check here for invalid inputs, such as words and special characters.
    else {
        $("#min-input").val("");
        defaultMaxPriceOptions();
    }
}

/**
 * Helper method for updateMaxPrices method.  This method modifies the price options based
 * on whatever the min-input value was before max-input is focused.
 *
 * @param incrementBy - The integer value of how much each price option is increased by.
 * @param multiplier - Multiply min-input val by some power of 10.
 */
function getMaxPriceOptions(incrementBy ,multiplier) {
    var increasedBy = incrementBy;

    $(".priceMin").each(function () {
        var valToInt = parseInt($("#min-input").val(), 10) * multiplier;
        $(this).text("$" + (numberWithCommas(valToInt + increasedBy)));
        increasedBy += incrementBy;
    });
}

/**
 * Method used any time that the prices need to be shifted back to the left column and displayed correctly.
 */
function defaultMinPriceOptions() {
    var i = 0;
    $(".priceMin").each(function () {
        $(this).text("$" + numberWithCommas(minPrices[i]) + "+");
        i++;
    });
}

/**
 * Gives any given number the proper formatting with commas.
 *
 * @param numberToConvert
 * @returns {string}
 */
function numberWithCommas(numberToConvert) {
    return numberToConvert.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Function is called when the min-input doesn't contain a valid value or if no value has been input at all.
 */
function defaultMaxPriceOptions() {
    var i = 100000;
    $(".priceMin").each(function () {
        $(this).text("$" + numberWithCommas(i));
        i += 100000;
    });
}

/**
 * Function is for converting the value in min-input or max-input to it's relative value associated with the letter specified e.g. 1K = 1000 and then adding commas for every 3 numbers.
 */
function convertPrice(value) {
    var number = value.replace(/\D/g,'');

    if (value.toLowerCase().indexOf('k') > -1)
    {
        number = value.replace(/\D/g,'') * 1000;
    }

    if (value.toLowerCase().indexOf('m') > -1)
    {
        number = value.replace(/\D/g,'') * 1000000;
    }

    if (value.toLowerCase().indexOf('b') > -1)
    {
        number = value.replace(/\D/g,'') * 1000000000;
    }

    if (value.toLowerCase().indexOf('t') > -1)
    {
        number = value.replace(/\D/g,'') * 1000000000000;
    }

    return numberWithCommas(number);
}