const CACHE_NAME = "v2"; 
const urlsToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/main.js",
    "/manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {

            for (const url of urlsToCache) {
                try {
                    await cache.add(url);
                } catch (err) {
                    console.warn("⚠️ No se pudo cachear:", url);
                }
            }

        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            )
        )
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
