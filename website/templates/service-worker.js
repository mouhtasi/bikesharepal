const CACHE = 'network-or-cache';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    './', // Alias for index.html
    '/about',
    'static/css/style.css',
    'static/css/catalog.css',
    'static/css/pure/pure-min.css',
    'static/css/grids-min.css',
    'static/css/grids-responsive-min.css',
    'static/css/mapbox-gl.css',
    'static/js/mapbox-gl.js',
    'static/js/station_details.js',
    'static/js/moment.min.js',
    'static/js/Chart.min.js',
    '/static/image/marker0.svg',
    '/static/image/marker1bike.svg',
    '/static/image/marker1dock.svg',
    '/static/image/marker25.svg',
    '/static/image/marker50.svg',
    '/static/image/marker75.svg',
    '/static/image/marker100.svg',
    '/static/image/logo_md.png'
    // 'https://fonts.googleapis.com/css?family=Open+Sans:300',
    // 'https://use.fontawesome.com/releases/v5.0.13/css/all.css'
];

// On install, cache some resource.
self.addEventListener('install', function (evt) {
    // console.log('The service worker is being installed.');

    // Ask the service worker to keep installing until the returning promise resolves.
    evt.waitUntil(precache());
});

// Try network and if it fails, go for the cached copy.
self.addEventListener('fetch', function (evt) {
    // console.log('The service worker is serving the asset.');

    evt.respondWith(fromNetwork(evt.request, 400).catch(function () {
        return fromCache(evt.request);
    }));
});

// Open a cache and use addAll() with an array of assets to add all of them to the cache.
// Return a promise resolving when all the assets are added.
function precache() {
    return caches.open(CACHE).then(function (cache) {
        return cache.addAll(PRECACHE_URLS);
    });
}

// Time limited network request.
// If the network fails or the response is not served before timeout, the promise is rejected.
function fromNetwork(request, timeout) {
    return new Promise(function (fulfill, reject) {
        // Reject in case of timeout.
        let timeoutId = setTimeout(reject, timeout);

        // Fulfill in case of success.
        fetch(request).then(function (response) {
            clearTimeout(timeoutId);
            fulfill(response);
        }, reject); // Reject also if network fetch rejects.
    });
}

// Open the cache where the assets were stored and search for the requested resource.
// Notice that in case of no matching, the promise still resolves but it does with undefined as value.
function fromCache(request) {
    return caches.open(CACHE).then(function (cache) {
        return cache.match(request).then(function (matching) {
            return matching || Promise.reject('no-match');
        });
    });
}
