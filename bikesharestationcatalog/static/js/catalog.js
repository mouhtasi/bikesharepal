mapboxgl.accessToken = 'pk.eyJ1IjoiaW1hZG0iLCJhIjoiY2plbnJsMDJyMjU0MTMzcGhxcjZlaXZlNyJ9.k2sPip120jugSJaLNs7Xbw';
// TODO: Add mapbox access token to env (include in template and load in this js)

window.onload = function () {
    if (detectWebGL()) {
        document.getElementById('map').style.display = 'block';  // the element is hidden unless JS is enabled

        map = new mapboxgl.Map({
            container: 'map',
            center: [-79.3864974, 43.6580617],
            zoom: 12,
            style: 'mapbox://styles/mapbox/streets-v10'
        });

        map.on('load', function () {
            var nav = new mapboxgl.NavigationControl();
            map.addControl(nav, 'top-right');

            map.addControl(new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            }));

            var geojson = window.geojson;

            map.addLayer(
                {
                    "id": "stations",
                    "type": "symbol",
                    'source': {
                        'type': 'geojson',
                        'data': geojson
                    },
                    "layout": {
                        "icon-image": "bicycle-share-15",
                        "icon-allow-overlap": true
                    },
                    // "maxzoom": 14
                }
            );

            map.addLayer(
                {
                    "id": "stations-markers",
                    "type": "symbol",
                    'source': {
                        'type': 'geojson',
                        'data': geojson
                    },
                    "minzoom": 14
                }
            );

            // When a click event occurs on a feature in the places layer, open a popup at the
            // location of the feature, with description HTML from its properties.
            function makePopup(e) {

            }

            geojson.features.forEach(function (marker) {
                var el = document.createElement('div');
                el.className = 'station-marker';
                el.style.display = 'none';

                var bikes = marker.properties.num_bikes_available;
                var docks = marker.properties.num_docks_available;

                var image = '';
                var bike_ratio = bikes / (bikes + docks);
                if (bikes === 1 && docks > 0) {
                    image = '1bike';
                } else if (docks === 1 && bikes > 0) {
                    image = '1dock';
                } else if (bikes === 0 && docks > 0) {
                    image = '0';
                } else if (docks === 0 && bikes > 0) {
                    image = '100';
                } else if (bike_ratio < 1 && bike_ratio >= .625) {
                    image = '75';
                } else if (bike_ratio < .625 && bike_ratio > .375) {
                    image = '50';
                } else if (bike_ratio <= .375 && bike_ratio > 0) {
                    image = '25';
                }

                el.style.backgroundImage = "url(" + window.origin + "/static/image/marker" + image + ".svg)";
                el.textContent = marker.properties.num_bikes_available;


                var description = marker.properties.name;
                description += '<br>Available Bikes: ' + marker.properties.num_bikes_available;
                description += '<br>Available Docks: ' + marker.properties.num_docks_available;
                description += '<br><a href="' +
                    (window.origin + window.station_detail_url).replace('0', marker.properties.id) + '">Details</a>';

                var popup = new mapboxgl.Popup().setHTML(description);

                new mapboxgl.Marker(el)
                    .setLngLat(marker.geometry.coordinates)
                    .setOffset([0, -25])
                    .setPopup(popup)
                    .addTo(map);
            });

            map.on('zoom', function () {
                if (map.getZoom() >= 14) {
                    var elements = document.getElementsByClassName('station-marker');
                    for (var i = 0; i < elements.length; i++) {
                        elements.item(i).style.display = '';
                    }
                } else {
                    var elements = document.getElementsByClassName('station-marker');
                    for (var i = 0; i < elements.length; i++) {
                        elements.item(i).style.display = 'none';
                    }
                }
            });

            map.on('click', 'stations', function (e) {
                var station_details = e.features[0];
                var coordinates = station_details.geometry.coordinates.slice();
                var description = station_details.properties.name;
                description += '<br>Available Bikes: ' + station_details.properties.num_bikes_available;
                description += '<br>Available Docks: ' + station_details.properties.num_docks_available;
                description += '<br><a href="' +
                    (window.origin + window.station_detail_url).replace('0', station_details.properties.id) + '">Details</a>';

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(description)
                    .addTo(map);
            });

            // Change the cursor to a pointer when the mouse is over the places layer.
            map.on('mouseenter', 'stations', function () {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'stations', function () {
                map.getCanvas().style.cursor = '';
            });
        });

        document.getElementById('station-list').style.display = 'none'; // the element is hidden if JS is enabled
    }
};

function detectWebGL() {
    // Check for the WebGL rendering context
    if (!!window.WebGLRenderingContext) {
        var canvas = document.createElement("canvas"),
            names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
            context = false;

        for (var i in names) {
            try {
                context = canvas.getContext(names[i]);
                if (context && typeof context.getParameter === "function") {
                    // WebGL is enabled.
                    return 1;
                }
            } catch (e) {
            }
        }

        // WebGL is supported, but disabled.
        return 0;
    }

    // WebGL not supported.
    return -1;
}
