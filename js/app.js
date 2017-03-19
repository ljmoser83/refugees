(function () {

    // mapbox access token for ljmoser83 account
    L.mapbox.accessToken = 'pk.eyJ1IjoibGptb3NlcjgzIiwiYSI6ImNpemNyNzhjODFuOXoycHFvbTU3Y25qMnIifQ.AT3F-314hvPwaNr4WxIgDw';

    // create the Leaflet map using mapbox.light tiles
    // var map = L.map('map');

    var map = L.mapbox.map('map', 'mapbox.light', {
        zoomSnap: .1,
        center: [45, -106],
        zoom: 4,
        minZoom: 4,
        maxZoom: 9,
    });
    $.getJSON("data/refugees_2008_2016_4326.json", function (data) {
            var dataLayer = L.geoJson(data, {
                style: function (feature) {
                    return {
                        color: '#dddddd',
                        weight: 1,
                        fillOpacity: .55,
                        fillColor: '#1f78b4'
                    };

                }


            }).addTo(map);
            console.log(dataLayer);
        drawLegend(dataLayer);

        })
        // create Leaflet control for the slider
    var sliderControl = L.control({
        position: 'bottomleft'
    });

    // when added to the map
    sliderControl.onAdd = function (map) {

        // select the element with id of 'slider'
        var controls = L.DomUtil.get("slider");

        // disable the mouse events
        L.DomEvent.disableScrollPropagation(controls);
        L.DomEvent.disableClickPropagation(controls);

        // add slider to the control
        return controls;

    }

    // add the control to the map
    sliderControl.addTo(map);
    var yearDisplay = L.control({
        position: 'bottomleft'
    });

    // when added to the map
    yearDisplay.onAdd = function (map) {

        // select the element with id of 'year'
        var year = L.DomUtil.get("year");
        return year;
    }

    yearDisplay.addTo(map);


    function drawMap(data) {


        //creates a var named currentYear to set initial value of year identifier div upon webpage load
        var currentYear = 2016
            //JQuery method to update html of selected div
        $('#year').html("Year:" + " " + currentYear);


        //call to retrieveInfo function that is used to build info window
        retrieveInfo(dataLayer, currentYear);
        //call to sequenceUI function that established slider interaction
        sequenceUI(dataLayer);


    }

    //adds an event listener that updates the value of currentYear each time the user interacts with the slider. This function also uses a JQuery method to update the content of the year label div.//
    function sequenceUI() {
        $('.slider').on('input change', function () {
            var currentYear = $(this).val();
            $('#year').html("Year:" + " " + currentYear);
            retrieveInfo(dataLayer, currentYear);
        });

    }

    function drawLegend(data) {
        // create Leaflet control for the legend
        var legend = L.control({
            position: 'bottomright'
        });
        // when added to the map
        legend.onAdd = function (map) {

                // select the element with id of 'legend'
                var div = L.DomUtil.get("legend");

                // disable the mouse events
                L.DomEvent.disableScrollPropagation(div);
                L.DomEvent.disableClickPropagation(div);

                // add legend to the control
                return div;

            }
            // add the control to the map
        legend.addTo(map);


    }
})();