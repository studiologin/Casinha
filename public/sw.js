const CACHE_NAME = 'casinha-cache-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/icons/logo-casinha.png' // This is a fallback or we use the URL
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
