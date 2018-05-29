if ('serviceWorker' in navigator) {
    console.log("Will the service worker register?");
    navigator.serviceWorker.register('service-worker.js', {scope: '.'})
        .then(function (reg) {
            self.addEventListener('fetch', function (e) {});
            console.log('ServiceWorker registration successful with scope: ', reg.scope);
        }).catch(function (err) {
        console.log("No it didn't. This happened: ", err)
    });
}
