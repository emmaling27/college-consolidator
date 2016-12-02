// function initMap() {
//     var uluru = {lat: -25.363, lng: 131.044};
//     var map = new google.maps.Map(document.getElementById('map'), {
//         zoom: 4,
//         center: uluru
//     });
//     var marker = new google.maps.Marker({
//         position: uluru,
//         map: map
//     });
    
//     google.maps.event.addListenerOnce(map, "idle", configure);

// }

// Google Map
var map;

// markers for map
var markers = [];

// info window
var info = new google.maps.InfoWindow();

// execute when the DOM is fully loaded
$(function() {

    // styles for map
    // https://developers.google.com/maps/documentation/javascript/styling
    var styles = [

        // hide Google's labels
        {
            featureType: "all",
            elementType: "labels",
            stylers: [
                {visibility: "on"}
            ]
        },

        // hide roads
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [
                {visibility: "on"}
            ]
        }

    ];

    // options for map
    // https://developers.google.com/maps/documentation/javascript/reference#MapOptions
    var options = {
        center: {lat: 39.8282, lng: -98.5795}, // Stanford, California
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        maxZoom: 14,
        panControl: true,
        styles: styles,
        zoom: 4,
        zoomControl: true
    };

    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);

    // instantiate map
    map = new google.maps.Map(canvas, options);

    // configure UI once Google Map is idle (i.e., loaded)
    google.maps.event.addListenerOnce(map, "idle", configure);

});

/**
* Adds marker for place to map.
*/
function addMarker(place)
{
    // get latitude and longitude of place
    var myLatlng = new google.maps.LatLng(place["latitude"], place["longitude"]);

    // make markers
    var marker = new google.maps.Marker({
        position: myLatlng,
    })
    
    // add markers to list markers
    markers.push(marker);
    
//     // listen for click event
//     google.maps.event.addListener(marker, 'click', function() {
//         // get output of articles function in application.py with input place
//         $.getJSON(Flask.url_for("articles"), {geo:place["postal_code"]})
//         .done(function(data, textStatus, jqXHR) {

//             // make an html string for each article and link
//             var out = "<ul>";
//             for (article in data) {
//                 out = out + "<li>" + "<a href=" + data[article].link + ">" + data[article].title + "</a></li>";
//             }
//             out = out + "</ul>";
            
//             // make window display html articles (hyperlinked)
//             showInfo(marker, out);
//         })
//         .fail(function(jqXHR, textStatus, errorThrown) {

//             // log error to browser's console
//             console.log(errorThrown.toString());
//         });
//     })
    
    // render map with markers
    marker.setMap(map);
}

/**
 * Configures application.
 */
function configure()
{
    // update UI after map has been dragged
    google.maps.event.addListener(map, "dragend", function() {

        // if info window isn't open
        // http://stackoverflow.com/a/12410385
        if (!info.getMap || !info.getMap())
        {
            update();
        }
    });

    // update UI after zoom level changes
    google.maps.event.addListener(map, "zoom_changed", function() {
        update();
    });

    // configure typeahead
    $("#q").typeahead({
        highlight: false,
        minLength: 1
    },
    {
        display: function(suggestion) { return null; },
        limit: 10,
        source: search,
        templates: {
            suggestion: Handlebars.compile(
                "<div>" +
                "{{place_name}}, {{admin_code1}}, {{postal_code}}" +
                "</div>"
            )
        }
    });

    // re-center map after place is selected from drop-down
    $("#q").on("typeahead:selected", function(eventObject, suggestion, name) {

        // set map's center
        map.setCenter({lat: parseFloat(suggestion.latitude), lng: parseFloat(suggestion.longitude)});
        map.setZoom(11);
        
        // update UI
        update();
    });

    // hide info window when text box has focus
    $("#q").focus(function(eventData) {
        info.close();
    });

    // re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
    // https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
    document.addEventListener("contextmenu", function(event) {
        event.returnValue = true; 
        event.stopPropagation && event.stopPropagation(); 
        event.cancelBubble && event.cancelBubble();
    }, true);

    // update UI
    update();

    // give focus to text box
    $("#q").focus();
}

/**
* Removes markers from map.
*/
function removeMarkers()
{
    // iterate through markers and remove them from map
    for (marker in markers) {
        markers[marker].setMap(null);
    }
    
    // empty list of markers
    markers = [];
}

/**
 * Searches database for typeahead's suggestions.
 */
function search(query, syncResults, asyncResults)
{
    // get places matching query (asynchronously)
    var parameters = {
        q: query
    };
    $.getJSON(Flask.url_for("search"), parameters)
    .done(function(data, textStatus, jqXHR) {
     
        // call typeahead's callback with search results (i.e., places)
        asyncResults(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());

        // call typeahead's callback with no results
        asyncResults([]);
    });
}

// /**
// * Shows info window at marker with content.
// */
// function showInfo(marker, content)
// {
//     // start div
//     var div = "<div id='info'>";
//     if (typeof(content) == "undefined")
//     {
//         // http://www.ajaxload.info/
//         div += "<img alt='loading' src='/static/ajax-loader.gif'/>";
//     }
//     else
//     {
//         div += content;
//     }

//     // end div
//     div += "</div>";

//     // set info window's content
//     info.setContent(div);

//     // open info window (if not already open)
//     info.open(map, marker);
// }

/**
* Updates UI's markers.
*/
function update() 
{
    // get map's bounds
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // get places within bounds (asynchronously)
    var parameters = {
        ne: ne.lat() + "," + ne.lng(),
        q: $("#q").val(),
        sw: sw.lat() + "," + sw.lng()
    };
    $.getJSON(Flask.url_for("update"), parameters)
    .done(function(data, textStatus, jqXHR) {

      // remove old markers from map
      removeMarkers();

      // add new markers to map
      for (var i = 0; i < data.length; i++)
      {
          addMarker(data[i]);
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

        // log error to browser's console
        console.log(errorThrown.toString());
    });
};
