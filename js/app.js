(function () {

    // mapbox access token for ljmoser83 account
    L.mapbox.accessToken = 'pk.eyJ1IjoibGptb3NlcjgzIiwiYSI6ImNpemNyNzhjODFuOXoycHFvbTU3Y25qMnIifQ.AT3F-314hvPwaNr4WxIgDw';

    // create the Leaflet map using mapbox.light tiles
    var map = L.mapbox.map('map', 'mapbox.light', {
        zoomSnap: .1,
        center: [-.23, 37.8],
        zoom: 7,
        minZoom: 6,
        maxZoom: 9,
        maxBounds: L.latLngBounds([-6.22, 27.72], [5.76, 47.83])
    });

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
    var gradeDisplay = L.control({
        position: 'bottomleft'
    });

    // when added to the map
    gradeDisplay.onAdd = function (map) {

        // select the element with id of 'grade'
        var grade = L.DomUtil.get("grade");
        return grade;
    }

    gradeDisplay.addTo(map);

    // load CSV data
    omnivore.csv('data/kenya_education_2014.csv')
        .on('ready', function (e) {
            drawMap(e.target.toGeoJSON());
            drawLegend(e.target.toGeoJSON());
        })
        .on('error', function (e) {
            console.log(e.error[0].message);
        });

    var options = {
        pointToLayer: function (feature, ll) {
            return L.circleMarker(ll, {
                opacity: 1,
                weight: 2,
                fillOpacity: 0,
            })
        }
    }

    function drawMap(data) {
        //creates a seperate layer for girls and boys
        var girlsLayer = L.geoJson(data, options).addTo(map);
        var boysLayer = L.geoJson(data, options).addTo(map);
        //creates a var named currentGrade to set initial value of grade identifier div upon webpage load
        var currentGrade = 1
            //JQuery method to update html of selected div
        $('#grade').html("Grade:" + " " + currentGrade);
        //defines the color of the girls layer
        girlsLayer.setStyle({
            color: '#D96D02',
        });
        //defines the color of the boys layer
        boysLayer.setStyle({
            color: '#6E77B0',
        });
        //call to the function resizeCircle passing girlsLayer, boysLayer, and 1 as arguments, which calculates the proportional size of the circles on the map//
        resizeCircles(girlsLayer, boysLayer, 1);
        //call to retrieveInfo function that is used to build info window
        retrieveInfo(boysLayer, currentGrade);
        //call to sequenceUI function that established slider interaction
        sequenceUI(girlsLayer, boysLayer);
        //sets the extent of the map to the extent of the girlsLayer
        map.fitBounds(girlsLayer.getBounds());
    }
    //a function defined to calculate the radius of the L.circle markers that are a proportional representation of the enrollment count by gender
    function calcRadius(val) {
        var radius = Math.sqrt(val / Math.PI);
        return radius * 0.5
    }
    //a function that resizes the circle markers on the map
    function resizeCircles(girlsLayer, boysLayer, currentGrade) {
        girlsLayer.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties['G' + currentGrade]));
            layer.setRadius(radius);
        });
        boysLayer.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties['B' + currentGrade]));
            layer.setRadius(radius);
        });

    }
    //adds an event listener that updates the value of currentGrade each time the user interacts with the slider. This function also uses a JQuery method to update the content of the grade label div.//
    function sequenceUI(girlsLayer, boysLayer) {
        $('.slider').on('input change', function () {
            var currentGrade = $(this).val();
            $('#grade').html("Grade:" + " " + currentGrade);
            resizeCircles(girlsLayer, boysLayer, currentGrade);
            retrieveInfo(boysLayer, currentGrade);
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

            
            //Create an empty array named dataValues.
        var dataValues = [];
        //Use the map method to iterate through the data.features.school.properties.grade enumerable enrollment values and push all numeric values to the array to sort for maximum of the enrollment rates.//
        data.features.map(function (school) {

            for (var grade in school.properties) {

                var attribute = school.properties[grade];
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
        var largeDiameter = calcRadius(maxValue) * 2,
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
            'left': largeDiameter + 30,
        });

        // adjust the position of the large based on size of circle
        $(".legend-small-label").css({
            'top': smallDiameter - 11,
            'left': largeDiameter + 30
        });

        // insert a couple hr elements and use to connect value label to top of each circle
        $("<hr class='large'>").insertBefore(".legend-large-label")
        $("<hr class='small'>").insertBefore(".legend-small-label").css('top', largeDiameter - smallDiameter - 8);


    }
    //function to dynamically build info window
    function retrieveInfo(boysLayer, currentGrade) {
        //shortcut to JQuery selection of the div with id=info
        var info = $('#info');
        //binds the mouseover to the boysLayer that displays and populates info window
        boysLayer.on('mouseover', function (e) {
            //removes the none class and shows the info window
            info.removeClass('none').show();
            //shortcut variable to e.layer.feature.properties
            var props = e.layer.feature.properties;
            //multiple JQuery calls to dynamically update the html of several divs in the info window
            $('#info span').html(props.COUNTY);
            //console.log(props.COUNTY);
            $(".girls span:first-child").html('(Grade ' + currentGrade + ')');
            $(".boys span:first-child").html('(Grade ' + currentGrade + ')');
            $(".girls span:last-child").html(props['G' + currentGrade]);
            $(".boys span:last-child").html(props['B' + currentGrade]);

            // raise opacity level as visual affordance
            e.layer.setStyle({
                fillOpacity: .6
            });

            //empty arrays used to push values to be graphed with .sparkline
            var girlsValues = [],
                boysValues = [];

            //for loop that populates the arrays upon mouseover
            for (var i = 1; i <= 8; i++) {
                girlsValues.push(props['G' + i]);
                boysValues.push(props['B' + i]);
            }

            //creates the girlspark graph from the values pushed to the corresponding array and adds it to the div with class of girlspark
            $('.girlspark').sparkline(girlsValues, {
                width: '160px',
                height: '30px',
                lineColor: '#D96D02',
                fillColor: '#d98939 ',
                spotRadius: 0,
                lineWidth: 2
            });
            //creates the boyspark graph from the values pushed to the corresponding array and adds it to the div with class of boyspark
            $('.boyspark').sparkline(boysValues, {
                width: '160px',
                height: '30px',
                lineColor: '#6E77B0',
                fillColor: '#878db0',
                spotRadius: 0,
                lineWidth: 2
            });

        });
        // hide the info panel when mousing off layergroup and remove affordance opacity
        boysLayer.on('mouseout', function (e) {
            info.hide();
            e.layer.setStyle({
                fillOpacity: 0
            });
        });

        // when the mouse moves on the document
        $(document).mousemove(function (e) {
            // first offset from the mouse position of the info window
            info.css({
                "left": e.pageX + 6,
                "top": e.pageY - info.height() - 25
            });

            // if it crashes into the top, flip it lower right
            if (info.offset().top < 4) {
                info.css({
                    "top": e.pageY + 15
                });
            }
            // if it crashes into the right, flip it to the left
            if (info.offset().left + info.width() >= $(document).width() - 40) {
                info.css({
                    "left": e.pageX - info.width() - 80
                });
            }
        });


    }

})();
