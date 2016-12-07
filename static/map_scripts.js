
// Google Map
var map;

// markers for map
var markers = [];

// info window
var info = new google.maps.InfoWindow();

// conditions from filters
var conditions = {
    // 'ne': null,
    // 'q': null,
    // 'sw': null,
    'public': 0,
    'private': 0,
    '2yr': 0,
    '4yr': 0,
    'grad': 0,
    // 'urban': 0,
    // 'suburban': 0,
    // 'rural': 0,
    'small': 0,
    'medium': 0,
    'large': 0
};

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
    
    // event handlers for checkbox filters
    // on click, modify global object conditions to indicate if box checked/unchecked
    // function update_conditions(id) {
    //     // $('#id').click(function(){
    //         if ($('#id').prop('checked')) {
    //             conditions['id'] = 1;
    //             update(conditions);
    //         }
    //         else {
    //             conditions[id] = 0;
    //             update(conditions);
    //         }
    //     // }); 
    // }
    // public
    $('#public').click(function(){
        if ($('#public').prop('checked')) {
            conditions['public'] = 1;
            update(conditions);
        }
        else {
            conditions['public'] = 0;
            update(conditions);
        }
    }); 

    // private
    $('#private').click(function(){
        if ($('#private').prop('checked')) {
            conditions['private'] = 1;
            update(conditions);
        }
        else {
            conditions['private'] = 0;
            update(conditions);
        }
    });
    
    // 2-year colleges
    $('#2yr').click(function(){
        if ($('#2yr').prop('checked')) {
            conditions['2yr'] = 1;
            update(conditions);
        }
        else {
            conditions['2yr'] = 0;
            update(conditions);
        }
    });
    
    // 4-year colleges
    $('#4yr').click(function(){
        if ($('#4yr').prop('checked')) {
            conditions['4yr'] = 1;
            update(conditions);
        }
        else {
            conditions['4yr'] = 0;
            update(conditions);
        }
    });
    
    // grad schools
    $('#grad').click(function(){
        if ($('#grad').prop('checked')) {
            conditions['grad'] = 1;
            update(conditions);
        }
        else {
            conditions['grad'] = 0;
            update(conditions);
        }
    });
    
    
    // // urban schools
    // $('#urban').click(function(){
    //     if ($('#urban').prop('checked')) {
    //         conditions['urban'] = 1;
    //         update(conditions);
    //     }
    //     else {
    //         conditions['urban'] = 0;
    //         update(conditions);
    //     }
    // });

    // // suburban schools
    // $('#suburban').click(function(){
    //     if ($('#suburban').prop('checked')) {
    //         conditions['suburban'] = 1;
    //         update(conditions);
    //     }
    //     else {
    //         conditions['suburban'] = 0;
    //         update(conditions);
    //     }
    // });


    // // rural schools
    // $('#rural').click(function(){
    //     if ($('#rural').prop('checked')) {
    //         conditions['rural'] = 1;
    //         update(conditions);
    //     }
    //     else {
    //         conditions['rural'] = 0;
    //         update(conditions);
    //     }
    // });

    // small schools
    $('#small').click(function(){
        if ($('#small').prop('checked')) {
            conditions['small'] = 1;
            update(conditions);
        }
        else {
            conditions['small'] = 0;
            update(conditions);
        }
    });
    
    // medium schools
    $('#medium').click(function(){
        if ($('#medium').prop('checked')) {
            conditions['medium'] = 1;
            update(conditions);
        }
        else {
            conditions['medium'] = 0;
            update(conditions);
        }
    });

    // large schools
    $('#large').click(function(){
        if ($('#large').prop('checked')) {
            conditions['large'] = 1;
            update(conditions);
        }
        else {
            conditions['large'] = 0;
            update(conditions);
        }
    });
    
    // // event handler for add college buttons
    // $(".add").click(function(){
    
    // })

});

/**
* Adds marker for college to map.
*/
function addMarker(college)
{
    // get latitude and longitude of college
    var myLatlng = new google.maps.LatLng(college["LATITUDE"], college["LONGITUDE"]);

    // make markers
    var marker = new google.maps.Marker({
        position: myLatlng,
        // label: college["INSTNM"]
    });
    
    // add markers to list markers
    markers.push(marker);
    
    // var info = "<div><a href=" + college["INSTURL"] + ">" +college["INSTNM"]+ "</a></div>";
    
    // marker.addListener("click", function(){
    //     showInfo(marker, info)
    //     console.log("hello world")
    // });
    // listen for click event
    google.maps.event.addListener(marker, 'click', function() {

        // make an html string for each article and link
        var info = "<div><a href=" + "http://" + college["INSTURL"] + ">" +college["INSTNM"]+ "</a></div>"
        if (!isNaN(college["ADM_RATE"])) {
            info += "<div>Admission Rate: " + Math.round(college["ADM_RATE"] * 100) + "%</div>";
        }
        console.log(info);
        // var info = "hello, world!"
        // make window display html articles (hyperlinked)
        showInfo(marker, info, college);
    });

    // render map with markers
    marker.setMap(map);
};

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
            update(conditions);
        }
    });

    // update UI after zoom level changes
    google.maps.event.addListener(map, "zoom_changed", function() {
        update(conditions);
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
        map.setZoom(15);
        
        // update UI
        update(conditions);
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
    update(conditions);

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

/**
* Shows info window at marker with content.
*/
function showInfo(marker, content, college)
{
    // start div
    var div = "<div id='info'>";
    if (typeof(content) == "undefined")
    {
        // http://www.ajaxload.info/
        div += "<img alt='loading' src='/static/ajax-loader.gif'/>";
    }
    else
    {
        div += content;
    }

    // end div
    div += "</div>";
    
    // make add to my colleges button
    div += "<button type='button' class='add'> + Add to my colleges</button>"
    $(document).ready(function(){
        $(".add").click(function(){
            console.log(college)
            $.ajax({url:Flask.url_for("addcolleges"), data:college})
            .done(function(textStatus, jqXHR) {
        
            // change button
            console.log("success!!")
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
        
                // log error to browser's console
                console.log(errorThrown.toString());
            });
        });
    });
    // set info window's content
    info.setContent(div);

//     // open info window (if not already open)
    info.open(map, marker);
}

/**
* Updates UI's markers.
*/
function update(conditions) 
{
    // get map's bounds
    var bounds = map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    // get places within bounds (asynchronously)
    // var parameters = {
    //     ne: ne.lat() + "," + ne.lng(),
    //     q: $("#q").val(),
    //     sw: sw.lat() + "," + sw.lng(),
    //     conditions
    // };
    conditions['ne'] = ne.lat() + "," + ne.lng();
    conditions['q'] = $("#q").val();
    conditions['sw'] = sw.lat() + "," + sw.lng();
    console.log(conditions)

    $.getJSON(Flask.url_for("update"), conditions)
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
