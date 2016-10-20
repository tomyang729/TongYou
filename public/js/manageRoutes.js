var map;
var infowindow;
var placeCategories = [];
var empty = false;

var service;

var currentId = -1;
var uniqueId = function() {
    return ++currentId;
};
var markers = {};
var travelMode = 'WALKING';
var placeCategories = [];

var videoNum = Math.floor(Math.random() * 29);

var video = document.getElementById('bgvid');

var href = window.location.href.split("/");

var host = href[0] + "//" + href[2];


$('input[name=category]').change(function() {
    placeCategories = [];
    empty = false;
    initMap();

});

function updateCategories() {
    $.each($("input[name=category]:checked"), function(){
        placeCategories.push($(this).val());
    });
    console.log(placeCategories);
}

function initMap() {
    updateCategories();
    var pyrmont = {lat: 49.246292, lng: -123.116226};


    map = new google.maps.Map(document.getElementById('map2'), {
        center: pyrmont,
        zoom: 11
    });

    infowindow = new google.maps.InfoWindow();

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: pyrmont,
        radius: 20000,
        types: placeCategories

    }, callback);


}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            if (!empty){
                createMarker(results[i]);

            }else{

                break;

            }
        }
    }
}


function createMarker(place, isVendor) {
    var id = uniqueId();
    var marker = new google.maps.Marker({
        id: id,
        map: map,
        position: place.geometry.location,
        animation: google.maps.Animation.DROP,
    });

    markers[id] = marker;

    google.maps.event.addListener(marker, 'click', function() {

        var placeImg = "";
        if (place.photo) {
            placeImg =  "<img id='place-img' src='" + place.photo  +  "'>"
        }

        var placeAddress = "";
        if (place.address) {
            placeAddress = "<p>Address: " + place.address  +"</p>";
        }

        var windowContent = "<h5><img id='place-icon' src='" + place.icon + "'> " + place.name + "</h5>" +
            "<div class='window-content'>" +
            placeImg +
            placeAddress +
            "</div>" +
            "<button class='pull-left' data-id="+ marker.id +" id='btn-add'>Add</button>" +
            "<button class='pull-right' data-id="+ marker.id +" id='btn-remove'>Remove</button>"

        infowindow.setContent(windowContent);
        infowindow.open(map, this);

    });
    return marker;
}



//google map end
function clearAll () {
    $("input[name=category]:checked").removeAttr("checked");
    placeCategories=[];
    empty=true;
    initMap();
}

