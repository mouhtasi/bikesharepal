mapboxgl.accessToken = 'pk.eyJ1IjoiaW1hZG0iLCJhIjoiY2plbnJsMDJyMjU0MTMzcGhxcjZlaXZlNyJ9.k2sPip120jugSJaLNs7Xbw';
// TODO: Add mapbox access token to env (include in template and load in this js)

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js', {scope: '.'});
}

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

            var geo = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            });

            map.addControl(geo);

            var current_markers = {};
            var new_markers = [];

            function generate_marker(station) {
                var el = document.createElement('div');
                el.className = 'station-marker';
                el.style.display = 'none';

                var bikes = station.properties.num_bikes_available;
                var docks = station.properties.num_docks_available;

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

                el.style.backgroundImage = "url(" + window.location.origin + "/static/image/marker" + image + ".svg)";
                el.textContent = station.properties.num_bikes_available;


                var description = station.properties.name;
                description += '<br>Available Bikes: ' + station.properties.num_bikes_available;
                description += '<br>Available Docks: ' + station.properties.num_docks_available;
                description += '<br><a class="pure-button pure-button-primary" href="' +
                    (window.location.origin + window.station_detail_url).replace('9999', station.properties.id) + '">Station Details</a>';

                var popup = new mapboxgl.Popup().setHTML(description);

                return new mapboxgl.Marker(el)
                    .setLngLat(station.geometry.coordinates)
                    .setOffset([0, -25])
                    .setPopup(popup)
                    .addTo(map);
            }

            function update_data() {
                map.getSource('stationsgeojson').setData(stations_url);

                fetch(stations_url)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (myJson) {
                        new_markers = [];
                        myJson.features.forEach(function (station) {
                            let updated = station.properties;
                            let existing = current_markers[updated.id];
                            if (updated.num_bikes_available !== existing[1] ||
                                updated.num_docks_available !== existing[2]) {
                                new_markers.push(station);
                            }
                        });

                        new_markers.forEach(function (station) {
                            let m = generate_marker(station);
                            current_markers[station.properties.id][0].remove();
                            current_markers[station.properties.id] = [m, station.properties.num_bikes_available,
                                station.properties.num_docks_available];
                        });
                    });

                fetch(last_updated_url)
                    .then(function (response) {
                        return response.json();
                    }).then(function (myJson) {
                    document.getElementById('last-updated').innerHTML = myJson.last_updated;
                    document.getElementById('last-checked').innerHTML = moment().format('hh:mm:ss A');
                });
            }

            let stations_url = window.location.origin + '/api/stations';
            let last_updated_url = window.location.origin + '/api/last_updated';
            window.setInterval(function () {
                update_data();
            }, 1 * 60 * 1000);

            map.addSource('stationsgeojson', {type: 'geojson', data: stations_url});
            document.getElementById('last-checked').innerHTML = moment().format('hh:mm:ss A');
            map.addLayer(
                {
                    "id": "stations",
                    "type": "symbol",
                    'source': 'stationsgeojson',
                    "layout": {
                        "icon-image": "bicycle-share-15",
                        "icon-allow-overlap": true
                    },
                    // "maxzoom": 14
                }
            );


            geojson.features.forEach(function (station) {
                let m = generate_marker(station);

                current_markers[station.properties.id] = [m, station.properties.num_bikes_available,
                                station.properties.num_docks_available];
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
                description += '<br><a class="pure-button pure-button-primary" href="' +
                    (window.location.origin + window.station_detail_url).replace('9999', station_details.properties.id) + '">Station Details</a>';

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

            document.getElementById('reload-button').onclick = function () {
                update_data();
            };

            setTimeout(function () {
                geo.trigger();
            }, 2000);
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
