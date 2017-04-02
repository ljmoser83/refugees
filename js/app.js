(function () {

    // mapbox access token for ljmoser83 account
    L.mapbox.accessToken = 'pk.eyJ1IjoibGptb3NlcjgzIiwiYSI6ImNqMG5sNmI1bjAwY3UzM3Q4cXNncGl6NDMifQ.jAX66dC8oy8Mh4IvgF5SPg';

    // create the Leaflet map using mapbox.dark tiles. sets zoom levels to appropriate levels for the extent of dataLayer
    var map = L.mapbox.map('map', 'mapbox.dark', {
        zoomSnap: .1,
        minZoom: 2,
        maxZoom: 11,
    });

    //AJAX request to retrieve data file from server hosted json file
    $.getJSON("data/refugees.json", function (data) {

        //call to drawLegend function that styles the legend and adds to the #map div
        drawLegend(data);

        //call to the drawMap function that creates the L.geoJson stored as the var= dataLayer. This function also applies additional styling with Leaflet methods and subsequent function calls to initiate user interaction funcitonality//
        drawMap(data);

        //function styles and places the info window
        drawInfo();

    })

    //Options to be used in the L.geoJson method call that converts points to layers, makes the circles with the L.circleMarker method, and styles the layers.
    var options = {

        pointToLayer: function (feature, ll) {

            return L.circleMarker(ll, {
                opacity: 1,
                weight: 2,
                fillOpacity: 0,
                color: 'blue',

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
        position: 'topleft'
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

    // add the control to the map
    yearDisplay.addTo(map);

    //function to calculate the appropriate radius for the circleMarkers based on the total number of refugees for a layer for a given year.
    function calcRadius(val) {
        var radius = Math.sqrt(val / Math.PI);
        return radius
    }

    //function that resizes the circleMarkers each time the slider UI is interacted with
    function resizeCircles(dataLayer, currentYear) {
        dataLayer.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties['Total_' + currentYear]));
            layer.setRadius(radius);
        });
    }
    var currentYear = 2016;
    //function that dynamically styles the map initially
    function drawMap(data) {

        //processes the data brought into script by AJAX request and creates and styles L.circleMarkers in the map div
        var dataLayer = L.geoJson(data, options).addTo(map);

        //gets the extent of dataLayer and applies as the bounds of the map
        map.fitBounds(dataLayer.getBounds());

        //backs the map's zoom out 0.8 level from the extent that was set with the fitBounds method above
        map.zoomOut(0.8);
        map.zoomControl.setPosition('topright');
        //creates a var named currentYear to set initial value of year identifier div upon webpage load


        //JQuery method to update html of the year div
        $('#year').html("Year:" + " " + currentYear);

        //eventListeneer added on dataLayer that shows the info window on mouseover
        dataLayer.on('mouseover', function () {
            $(".info").show();
        });

        //eventListeneer added on dataLayer that hides the info window on mouseout
        dataLayer.on('mouseout', function () {
            $(".info").hide();
        });

        //calls resizeCircles function
        resizeCircles(dataLayer, currentYear);

        //call to sequenceUI that adds a listener to the slider UI that updates currentYear 
        sequenceUI(dataLayer);

        //creates initial content for the info window
        layerInfo(dataLayer, currentYear);

        //calls banUI function, which binds an event listener for changes in the ban selector and fires function
        banUI(dataLayer, currentYear);

    }

    //adds an event listener that updates the value of currentYear each time the user interacts with the slider. This function also uses a JQuery method to update the content of the year label div.//
    function sequenceUI(dataLayer) {
        $('.slider').on('input change', function () {
            //undates currentYear to the value of the slider
            var currentYear = $(this).val();
            //updates the currentYear to the year display element
            $('#year').html("Year:" + " " + currentYear);
            //calls layerInfo function
            layerInfo(dataLayer, currentYear);
            //calls resizeCircles function
            resizeCircles(dataLayer, currentYear);
            //resets the fill opacity of all layers to 0
            dataLayer.eachLayer(function (layer) {
                layer.setStyle({
                    fillOpacity: '0'
                });
            });
            //resets the ban selector back to all
            $('.ban').val('all');
            //binds the banUI function to the ban selector with the updated currentYear value
            banUI(dataLayer, currentYear);
        });

    }

    //function that draws legend based on max value to the dataset
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

        //Create an empty array named dataValues.
        var dataValues = [];
        //Use the map method to iterate through the data.features.state.properties[total] enumerable refugee totals and push all numeric values to the array to sort for maximum of the enrollment rates.//

        data.features.map(function (state) {

            for (var total in state.properties) {

                var attribute = state.properties[total];
                //if statement restricts values pushed to array to only numeric values.
                if (Number(attribute)) {

                    dataValues.push(attribute);
                }

            }

        });

        // sort our array
        var sortedValues = dataValues.sort(function (a, b) {
            return b - a;
        });

        // round the highest number and use as our large circle diameter
        var maxValue = Math.round(sortedValues[0] / 1000) * 1000;

        // calc the diameters
        var largeDiameter = calcRadius(maxValue) * 2.5,
            smallDiameter = largeDiameter / 2;

        // select our circles container and set the height
        $(".legend-circles").css('height', largeDiameter.toFixed());

        // set width and height for large circle
        $('.legend-large').css({
            'width': largeDiameter.toFixed(),
            'height': largeDiameter.toFixed()
        });
        // set width and height for small circle and position
        $('.legend-small').css({
            'width': smallDiameter.toFixed(),
            'height': smallDiameter.toFixed(),
            'top': largeDiameter - smallDiameter,
            'left': smallDiameter / 2
        })

        // label the max and median value
        $(".legend-large-label").html(maxValue);
        $(".legend-small-label").html((maxValue / 2));

        // adjust the position of the large based on size of circle
        $(".legend-large-label").css({
            'top': -11,
            'left': largeDiameter
        });

        // adjust the position of the large based on size of circle
        $(".legend-small-label").css({
            'top': smallDiameter - 11,
            'left': largeDiameter
        });

        // insert a couple hr elements and use to connect value label to top of each circle
        $("<hr class='large'>").insertBefore(".legend-large-label").css('top', 0 - 10).css('left', largeDiameter / 2);
        $("<hr class='small'>").insertBefore(".legend-small-label").css('top', largeDiameter - smallDiameter - 10).css('left', largeDiameter / 2);

        legend.addTo(map);
    }


    //drawInfo function taht creates and initially hides info window
    function drawInfo() {

        var info = L.control({
            position: 'topright'
        });

        info.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info');

            return div;

        }

        info.addTo(map);
        $(".info").hide();
    }

    //updates the info in the information window
    function updateInfo(layer, currentYear) {

        //shortcut var for accessing layer.feature.properties
        var props = layer.feature.properties;

        //html to be added dynamically to the info window based on updated value of currentYear
        var html = "<h3>" + props['NAME']+ ' '+ [currentYear] + "</h3>" +
            "Syrian Refugees: <b>" + props["Syria_" + currentYear] + "</b><br>" +
            "Iranian Refugees: <b>" + props["Iran_" + currentYear] + "</b><br>" +
            "Yemeni Refugees: <b>" + props["Yemen_" + currentYear] + "</b><br>" +
            "Sudanese Refugees: <b>" + props["Sudan_" + currentYear] + "</b><br>" +
            "Libyan Refugees: <b>" + props["Libya_" + currentYear] + "</b><br>" +
            "Somalian Refugees: <b>" + props["Somalia_" + currentYear] + "</b><br>" +
            "Total Refugees: <b>" + props["Total_" + currentYear] + "</b>"

        //JQuery method to update teh html of the info window
        $(".info").html(html);
    }

    //this function calculates the info pane content and adds it to the panel upon mouseover of each county also adds mouseover affordance changing outline to yellow
    function layerInfo(dataLayer, currentYear) {
        dataLayer.eachLayer(function (layer) {
            layer.on('mouseover', function (layer) {
                updateInfo(this, currentYear);
                this.setStyle({
                    color: "#ff8000"
                });
            });
        });
        dataLayer.on("mouseout", function (event) {

            this.setStyle({
                color: 'blue'
            });
        });
    }
//binds an event listener to the ban selector that resets the fill opacity on change and sets the fill opacity of states with refugees from teh selected ban country to 0.5
    function banUI(dataLayer, currentYear) {
        $('select[name="ban"]').change(function () {
            var banned = $(this).val();
            dataLayer.eachLayer(function (layer) {
                layer.setStyle({
                    fillOpacity: '0'
                });
            });
            dataLayer.eachLayer(function (layer) {
                if (layer.feature.properties[banned + currentYear] > 0) {
                    layer.setStyle({
                        fillOpacity: '0.3'
                    });
                }
            });



        });


    }
})();