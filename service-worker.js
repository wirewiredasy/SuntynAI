
const CACHE_NAME = 'suntyn-ai-v1.0.1';
const urlsToCache = [
    '/',
    '/static/css/main.css',
    '/static/js/main.js',
    '/static/js/theme.js',
    '/static/js/smooth-scroll.js',
    '/static/js/scroll-to-top.js'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache opened successfully');
                return cache.addAll(urlsToCache.filter(url => !url.startsWith('http')));
            })
            .then(() => {
                console.log('Cache populated successfully');
                self.skipWaiting();
            })
            .catch((error) => {
                console.error('Cache installation failed:', error);
            })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    // Only handle same-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).catch(() => {
                    // Return a simple offline response
                    return new Response('Offline', {
                        status: 200,
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated successfully');
            return self.clients.claim();
        })
    );
});
