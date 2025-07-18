
const CACHE_NAME = 'suntyn-ai-v1.0.2';
const STATIC_CACHE = 'suntyn-static-v1';
const DYNAMIC_CACHE = 'suntyn-dynamic-v1';

// Resources to cache immediately
const CRITICAL_RESOURCES = [
    '/',
    '/static/css/main.css',
    '/static/css/bootstrap-custom.css',
    '/static/js/main.js',
    '/static/js/theme.js',
    '/static/js/lazy-loader.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/@tabler/icons@latest/tabler-icons.min.css'
];

// Resources to cache on demand
const CACHE_PATTERNS = [
    /^https:\/\/cdn\.jsdelivr\.net\//,
    /^https:\/\/cdnjs\.cloudflare\.com\//,
    /\/static\//,
    /\/uploads\//
];

// Install event - cache critical resources
self.addEventListener('install', event => {
    console.log('🚀 Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching critical resources...');
                return cache.addAll(CRITICAL_RESOURCES);
            })
            .then(() => {
                console.log('✅ Critical resources cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Failed to cache critical resources:', error);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('🔄 Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - cache strategy
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (isCriticalResource(request.url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isCachableResource(request.url)) {
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    } else if (isAPIRequest(request.url)) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    } else {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
});

// Cache strategies
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Network error', { status: 503 });
    }
}

async function staleWhileRevalidate(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        // Fetch in background and update cache
        const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        });
        
        // Return cached version immediately if available
        return cachedResponse || await fetchPromise;
    } catch (error) {
        console.error('Stale while revalidate strategy failed:', error);
        return new Response('Network error', { status: 503 });
    }
}

async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok && isCachableResource(request.url)) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Network first strategy failed, trying cache:', error);
        
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        return cachedResponse || new Response('Offline - content not available', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// Helper functions
function isCriticalResource(url) {
    return CRITICAL_RESOURCES.some(resource => url.includes(resource));
}

function isCachableResource(url) {
    return CACHE_PATTERNS.some(pattern => pattern.test(url));
}

function isAPIRequest(url) {
    return url.includes('/api/') || url.includes('/process-tool');
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

async function handleBackgroundSync() {
    console.log('🔄 Handling background sync...');
    // Handle offline actions when connection is restored
}

// Push notifications
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/static/icons/icon-192x192.png',
            badge: '/static/icons/badge-72x72.png',
            data: data.data
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Performance monitoring
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'PERFORMANCE_LOG') {
        console.log('📊 Performance data:', event.data.metrics);
    }
});
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
