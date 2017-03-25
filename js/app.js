(function () {

    // mapbox access token for ljmoser83 account
    L.mapbox.accessToken = 'pk.eyJ1IjoibGptb3NlcjgzIiwiYSI6ImNqMG5sNmI1bjAwY3UzM3Q4cXNncGl6NDMifQ.jAX66dC8oy8Mh4IvgF5SPg';

    // create the Leaflet map using mapbox.light tiles
    var map = L.mapbox.map('map', 'mapbox.dark', {
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

        drawLegend(data);
        //drawInfo();
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
        map.zoomControl.setPosition('topright');
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
//        resetBan(dataLayer, currentYear)
        banUI(dataLayer, currentYear);
    }
    //function that will update data by year and state and update symbology upon user interaction
    function updateMap(dataLayer, currentYear) {

        resizeCircles(dataLayer, currentYear);
dataLayer.eachLayer(function (layer){
                
                    layer.setStyle({color: 'blue'});});
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
            console.log(currentYear);
            $('#year').html("Year:" + " " + currentYear);
            //retrieveInfo(dataLayer, currentYear);
            updateMap(dataLayer, currentYear)
            banUI(dataLayer, currentYear)
            $('.ban').val('all');
        });

    }
//function resetBan(dataLayer, currentYear){
//    $('.ban').on('click', function () { dataLayer.eachLayer(function (layer){
//                
//                    layer.setStyle({color: 'blue'});});
//});
//}
    function banUI(dataLayer, currentYear) {
        $('.ban').on('input change', function () {
            var banned = $(this).val();

dataLayer.eachLayer(function (layer, banned, currentYear) {
            layer.bindPopup('Name: ' + layer.feature.properties.NAME + '<br/>' + "Total Refugees: " + layer.feature.properties['Total_' + currentYear] + '<br/>' + layer.feature.properties[banned+currentYear]), {
                maxWidth: 800
            }}).openPopup;
            dataLayer.eachLayer(function (layer){
                if (layer.feature.properties[banned+currentYear]>0){
                    layer.setStyle({color: 'yellow'});
            }
            }); 
            //retrieveInfo(dataLayer, currentYear);
        });

    };

    
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
            //Create an empty array named dataValues.
        var dataValues = [];
        //Use the map method to iterate through the data.features.school.properties.grade enumerable enrollment values and push all numeric values to the array to sort for maximum of the enrollment rates.//
        
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
        var largeDiameter = calcRadius(maxValue)*2.5,
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
        $("<hr class='large'>").insertBefore(".legend-large-label").css('top', 0-10).css('left', largeDiameter/2);
        $("<hr class='small'>").insertBefore(".legend-small-label").css('top', largeDiameter - smallDiameter - 10).css('left', largeDiameter/2);

        legend.addTo(map);
    }

})();
