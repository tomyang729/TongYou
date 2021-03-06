// date picker start
(function($) {
    function compareDates(startDate, endDate, format) {
        var temp, dateStart, dateEnd;
        try {
            dateStart = $.datepicker.parseDate(format, startDate);
            dateEnd = $.datepicker.parseDate(format, endDate);
            if (dateEnd < dateStart) {
                temp = startDate;
                startDate = endDate;
                endDate = temp;
            }
        } catch (ex) {}
        return { start: startDate, end: endDate };
    }

    $.fn.dateRangePicker = function (options) {
        options = $.extend({
            "changeMonth": false,
            "changeYear": false,
            "numberOfMonths": 2,
            "rangeSeparator": " - ",
            "useHiddenAltFields": false
        }, options || {});

        var myDateRangeTarget = $(this);
        var onSelect = options.onSelect || $.noop;
        var onClose = options.onClose || $.noop;
        var beforeShow = options.beforeShow || $.noop;
        var beforeShowDay = options.beforeShowDay;
        var lastDateRange;

        function storePreviousDateRange(dateText, dateFormat) {
            var start, end;
            dateText = dateText.split(options.rangeSeparator);
            if (dateText.length > 0) {
                start = $.datepicker.parseDate(dateFormat, dateText[0]);
                if (dateText.length > 1) {
                    end = $.datepicker.parseDate(dateFormat, dateText[1]);
                }
                lastDateRange = {start: start, end: end};
            } else {
                lastDateRange = null;
            }
        }

        options.beforeShow = function(input, inst) {
            var dateFormat = myDateRangeTarget.datepicker("option", "dateFormat");
            storePreviousDateRange($(input).val(), dateFormat);
            beforeShow.apply(myDateRangeTarget, arguments);
        };

        options.beforeShowDay = function(date) {
            var out = [true, ""], extraOut;
            if (lastDateRange && lastDateRange.start <= date) {
                if (lastDateRange.end && date <= lastDateRange.end) {
                    out[1] = "ui-datepicker-range";
                }
            }

            if (beforeShowDay) {
                extraOut = beforeShowDay.apply(myDateRangeTarget, arguments);
                out[0] = out[0] && extraOut[0];
                out[1] = out[1] + " " + extraOut[1];
                out[2] = extraOut[2];
            }
            return out;
        };

        options.onSelect = function(dateText, inst) {
            var textStart;
            if (!inst.rangeStart) {
                inst.inline = true;
                inst.rangeStart = dateText;
            } else {
                inst.inline = false;
                textStart = inst.rangeStart;
                if (textStart !== dateText) {
                    var dateFormat = myDateRangeTarget.datepicker("option", "dateFormat");
                    var dateRange = compareDates(textStart, dateText, dateFormat);
                    myDateRangeTarget.val(dateRange.start + options.rangeSeparator + dateRange.end);
                    inst.rangeStart = null;
                    if (options.useHiddenAltFields){
                        var myToField = myDateRangeTarget.attr("data-to-field");
                        var myFromField = myDateRangeTarget.attr("data-from-field");
                        $("#"+myFromField).val(dateRange.start);
                        $("#"+myToField).val(dateRange.end);
                    }
                }
            }
            onSelect.apply(myDateRangeTarget, arguments);
        };

        options.onClose = function(dateText, inst) {
            inst.rangeStart = null;
            inst.inline = false;
            onClose.apply(myDateRangeTarget, arguments);
        };

        return this.each(function() {
            if (myDateRangeTarget.is("input")) {
                myDateRangeTarget.datepicker(options);
            }
            myDateRangeTarget.wrap("<div class=\"dateRangeWrapper\"></div>");
        });
    };
}(jQuery));

$(document).ready(function(){
    $("#txt-DateRange").dateRangePicker({
        showOn: "focus",
        rangeSeparator: " to ",
        dateFormat: "yy-mm-dd",
        useHiddenAltFields: true,
        constrainInput: true
    });
});

//date picker end

//drop down start
$(".dropdown").on("click", function(){
    $(this).toggleClass("flip");
})

$(".back ul li").on("click", function(){
    val = $(this).html();
    $("span").html(val);
});
//drop down end



//login popup
$(function(){
    $('.sign-a').on('click', function(){
        $('.form1').show();
        $('.back-grey').show();
    });
    $('.close-popup').on('click', function(){

    });

});

$(document).mouseup(function(e){
    var _con = $('.form1');
    if(!_con.is(e.target) && _con.has(e.target).length === 0){
        $('.form1').hide();
        $('.back-grey').hide();
    }
});

$('.form').find('input, textarea').on('keyup blur focus', function (e) {

    var $this = $(this),
        label = $this.prev('label');

    if (e.type === 'keyup') {
        if ($this.val() === '') {
            label.removeClass('active highlight');
        } else {
            label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
        if( $this.val() === '' ) {
            label.removeClass('active highlight');
        } else {
            label.removeClass('highlight');
        }
    } else if (e.type === 'focus') {

        if( $this.val() === '' ) {
            label.removeClass('highlight');
        }
        else if( $this.val() !== '' ) {
            label.addClass('highlight');
        }
    }

});

$('.tab a').on('click', function (e) {

    e.preventDefault();

    $(this).parent().addClass('active');
    $(this).parent().siblings().removeClass('active');

    target = $(this).attr('href');

    $('.tab-content > div').not(target).hide();

    $(target).fadeIn(600);

});
//login popup end



//google map
function initMap() {
    // Create a map object and specify the DOM element for display.
    var myLatLng = {lat: 49.246292, lng: -123.116226};

    var map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        scrollwheel: true,
        zoom: 11

    });

    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: 'Hello World!'
    });


    var autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('search_text')));

}
//google map end

//live-chat
(function() {

    $('#live-chat header').on('click', function() {

        $('.chat').slideToggle(300, 'swing');
        $('.chat-message-counter').fadeToggle(300, 'swing');

    });

    $('.chat-close').on('click', function(e) {

        e.preventDefault();
        $('#live-chat').fadeOut(300);

    });

    $('.chat-button').on('click', function(e) {

        document.getElementById("live-chat").style.display="block";

    });

}) ();
//live-chat end


//pannel
$(document).ready(function() {
    $('#list').click(function(event){event.preventDefault();$('#products .item').addClass('list-group-item');});
    $('#grid').click(function(event){event.preventDefault();$('#products .item').removeClass('list-group-item');$('#products .item').addClass('grid-group-item');});
});
//pannel end

//filter

//filter end

//google map2

