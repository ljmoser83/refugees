(function () {

    // mapbox access token for ljmoser83 account
    L.mapbox.accessToken = 'pk.eyJ1IjoibGptb3NlcjgzIiwiYSI6ImNpemNyNzhjODFuOXoycHFvbTU3Y25qMnIifQ.AT3F-314hvPwaNr4WxIgDw';

    // create the Leaflet map using mapbox.light tiles
    var map = L.mapbox.map('map', 'mapbox.light', {
        zoomSnap: .1,
        center: [45, -106],
        zoom: 4,
        minZoom: 4,
        maxZoom: 9,
    });

    //AJAX request to retrieve data file from server hosted JSON
    $.getJSON("data/refugees_2008_2016_4326.json", function (data) {

        // loop through GeoJSON features
        data.features.forEach(function(state){

            // shortcut for props
            var props = state.properties;
            // for each property
            for(var prop in props){
                // if the value is 0
                if(props[prop]== 0) {
                     // remove the property from the data
                     delete props[prop];
                }
            }
        });

        // verify
        console.log(data);



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
        //drawMap(dataLayer);
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

    // create Leaflet control for the ban country selector
    var banSelect = L.control({
        position: 'topright'
    });

    // when added to the map
    banSelect.onAdd = function (map) {

        // select the element with id of 'ban'
        var control = L.DomUtil.get("ban");

        // disable the mouse events
        L.DomEvent.disableScrollPropagation(control);
        L.DomEvent.disableClickPropagation(control);

        // add slider to the control
        return control;

    }

    // add the control to the map
    banSelect.addTo(map);


    // create Leaflet control for the year display
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

    //function that dynamically styles the map initially
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
    //function that will update data by year and state and update symbology upon user interaction
    function updateMap(data) {}

    //function that will style the choropleth
    function colorize(data) {}

    //adds an event listener that updates the value of currentYear each time the user interacts with the slider. This function also uses a JQuery method to update the content of the year label div.//
    function sequenceUI() {
        $('.slider').on('input change', function () {
            var currentYear = $(this).val();
            $('#year').html("Year:" + " " + currentYear);
            retrieveInfo(dataLayer, currentYear);
        });

    }

    //adds an event listener that updates the value of currentYear each time the user interacts with the slider. This function also uses a JQuery method to update the content of the year label div.//
    function addUi(dataLayer) {
        $('select[name="ban"]').change(function () {
            banSelect = $(this).val();
            console.log(banSelect);
            //                $("div.legend").remove();
            //alternate JQuery solution to remove initial Legend prior to adding new legend during updateMap call
            updateMap(dataLayer);
            retrieveInfo(dataLayer, currentYear);
            // a function that listens to the user selection in the dropdown menu and calls updateMap once a new value has been assigned to attributeValue.
        });
    } //end addUi function

    function banUI() {
        $('.ban').on('input change', function () {
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

    function getClassBreaks(dataLayer) {

        // create empty Array for storing values
        var values = [];

        // loop through all the counties
        dataLayer.eachLayer(function (layer) {
            var value = layer.feature.properties[attributeValue] / layer.feature.properties[normValue];
            values.push(value); // push the normalized value for each layer into the Array
        });

        // determine similar clusters
        var clusters = ss.ckmeans(values, 5);

        // create an array of the lowest value within each cluster
        var breaks = clusters.map(function (cluster) {
            return [cluster[0], cluster.pop()];
        });

        //return array of arrays, e.g., [[0.24,0.25], [0.26, 0.37], etc]
        return breaks;

    } //end getClassBreaks

    function getColor(d, breaks) {
        // function accepts a single normalized data attribute value
        // and uses a series of conditional statements to determine which
        // which color value to return to return to the function caller

        if (d <= breaks[0][1]) {
            return '#f1eef6';
        } else if (d <= breaks[1][1]) {
            return '#bdc9e1';
        } else if (d <= breaks[2][1]) {
            return '#74a9cf';
        } else if (d <= breaks[3][1]) {
            return '#2b8cbe'
        } else if (d <= breaks[4][1]) {
            return '#045a8d'
        }
    } //end getColor

})();
