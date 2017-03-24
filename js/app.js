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
    $.getJSON("data/refugees.json", function (data) {

        // loop through GeoJSON features
        data.features.forEach(function (state) {

            // shortcut for props
            var props = state.properties;
            // for each property
            for (var prop in props) {
                // if the value is 0
                //was having trouble with the original push you sent removing 0 values from the total fields for a year for a state. Sure there is a better way to do this.
                if (props[prop] === props["Total_2008"]) {
                    continue;
                } else if (props[prop] === props["Total_2009"]) {
                    continue;
                } else if (props[prop] === props["Total_2010"]) {
                    continue;
                } else if (props[prop] === props["Total_2011"]) {
                    continue;
                } else if (props[prop] === props["Total_2012"]) {
                    continue;
                } else if (props[prop] === props["Total_2013"]) {
                    continue;
                } else if (props[prop] === props["Total_2014"]) {
                    continue;
                } else if (props[prop] === props["Total_2015"]) {
                    continue;
                } else if (props[prop] === props["Total_2016"]) {
                    continue;
                } else if (props[prop] == 0) {
                    // remove the property from the data
                    delete props[prop];

                }
            }
        });

        // verify
        console.log(data);
        //drawInfo();
        //calls drawInfo(), which creates a blank info panel with defined styles and no information present until mouseover
        drawMap(data);
    })
    var options = {

        pointToLayer: function (feature, ll) {

            return L.circleMarker(ll, {
                opacity: 1,
                weight: 2,
                fillOpacity: .5,
            })
        }
    }

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

    function calcRadius(val) {
        var radius = Math.sqrt(val / Math.PI);
        return radius
    }

    function resizeCircles(dataLayer, currentYear) {
        dataLayer.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties['Total_' + currentYear]));
            layer.setRadius(radius);
        });
    }
    //function that dynamically styles the map initially
    function drawMap(data) {
        var dataLayer = L.geoJson(data, options).addTo(map);
        console.log(dataLayer);
        //drawLegend();
        //creates a var named currentYear to set initial value of year identifier div upon webpage load
        var currentYear = 2016

        //JQuery method to update html of selected div
        $('#year').html("Year:" + " " + currentYear);
        //
        //        dataLayer.on('mouseover', function () {
        //            $(".info").show();
        //        });
        //        dataLayer.on('mouseout', function () {
        //            $(".info").hide();
        //        });

        updateMap(dataLayer, currentYear);
        //a call of the updateMap function that fires everytime the dropdown menu is selected. Within this function call, the legend content is dynamically generated each time the drop down menu is toggled by the user.

        //call to retrieveInfo function that is used to build info window
        //retrieveInfo(dataLayer, currentYear);
        //call to sequenceUI function that established slider interaction
        sequenceUI(dataLayer);
    }
    //function that will update data by year and state and update symbology upon user interaction
    function updateMap(dataLayer, currentYear) {
        // get the class breaks for the initial data attribute
        //var breaks = getClassBreaks(dataLayer, currentYear);
        resizeCircles(dataLayer, currentYear);

        dataLayer.eachLayer(function (layer) {
            layer.bindPopup('Name: ' + layer.feature.properties.NAME + '<br/>' + "Total Refugees: " + layer.feature.properties['Total_' + currentYear], {
                maxWidth: 800
            }).openPopup;
        })


    } //end updateMap function




    //adds an event listener that updates the value of currentYear each time the user interacts with the slider. This function also uses a JQuery method to update the content of the year label div.//
    function sequenceUI(dataLayer) {
        $('.slider').on('input change', function () {
            var currentYear = $(this).val();
            $('#year').html("Year:" + " " + currentYear);
            //retrieveInfo(dataLayer, currentYear);
            console.log(currentYear);
            updateMap(dataLayer, currentYear)
        });

    }

    //adds an event listener that updates the value of currentYear each time the user interacts with the slider. This function also uses a JQuery method to update the content of the year label div.//
    function addUi(dataLayer) {
        $('select[name="ban"]').change(function () {
            banSelect = $(this).val();
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


    //    function drawInfo() {
    //
    //        var info = L.control({
    //            position: 'topright'
    //        });
    //
    //        info.onAdd = function (map) {
    //
    //            var div = L.DomUtil.create('div', 'info');
    //
    //            return div;
    //
    //        }
    //        info.addTo(map);
    //        $(".info").hide();
    //    }

    function drawLegend() {

        var legendControl = L.control({
            position: 'bottomright'
        });

        legendControl.onAdd = function (map) {

            var legend = L.DomUtil.get('legend');

            return legend;

        };

        legendControl.addTo(map);
    } //a function that simply draws teh container that will be the legend. this is fired in drawMap(), because it only needs to be fired once. The information within is dynamically updated by updateLegend(breaks) function within the updateMap(dataLayer) function

})();