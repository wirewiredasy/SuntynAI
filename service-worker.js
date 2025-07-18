const CACHE_NAME = 'suntyn-ai-v1.0.3';
const STATIC_CACHE = 'suntyn-static-v2';
const DYNAMIC_CACHE = 'suntyn-dynamic-v2';

// Resources to cache immediately - using relative paths
const CRITICAL_RESOURCES = [
    '/',
    '/static/css/main.css',
    '/static/css/bootstrap-custom.css',
    '/static/js/main.js',
    '/static/js/theme.js',
    '/static/js/lazy-loader.js',
    '/static/js/performance-optimizer.js'
];

// External resources to cache on demand
const EXTERNAL_RESOURCES = [
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
        Promise.all([
            // Cache internal resources
            caches.open(STATIC_CACHE)
                .then(cache => {
                    console.log('📦 Caching critical resources...');
                    return cache.addAll(CRITICAL_RESOURCES).catch(err => {
                        console.warn('Some critical resources failed to cache:', err);
                        // Try to cache resources individually
                        return Promise.allSettled(
                            CRITICAL_RESOURCES.map(resource => cache.add(resource))
                        );
                    });
                }),
            // Cache external resources separately
            caches.open(DYNAMIC_CACHE)
                .then(cache => {
                    console.log('📦 Caching external resources...');
                    return Promise.allSettled(
                        EXTERNAL_RESOURCES.map(resource => cache.add(resource))
                    ).then(results => {
                        const failed = results.filter(r => r.status === 'rejected');
                        if (failed.length > 0) {
                            console.warn(`${failed.length} external resources failed to cache`);
                        }
                        return Promise.resolve();
                    });
                })
        ])
        .then(() => {
            console.log('✅ Resources cached successfully');
            return self.skipWaiting();
        })
        .catch(error => {
            console.error('❌ Failed to cache resources:', error);
            // Still skip waiting to activate the service worker
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
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
            .catch(error => {
                console.error('❌ Service Worker activation failed:', error);
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip chrome extension requests
    if (event.request.url.startsWith('chrome-extension://') || 
        event.request.url.startsWith('moz-extension://')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }

                // Network request with timeout
                return fetchWithTimeout(event.request, 5000)
                    .then(response => {
                        // Don't cache error responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cache the response for future use
                        if (isCachableResource(event.request.url)) {
                            const responseToCache = response.clone();
                            const cacheName = isCriticalResource(event.request.url) ? STATIC_CACHE : DYNAMIC_CACHE;

                            caches.open(cacheName)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                })
                                .catch(err => console.warn('Cache put failed:', err));
                        }

                        return response;
                    })
                    .catch(error => {
                        console.warn('Fetch failed:', error);

                        // Return offline fallback for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/') || new Response('Offline', { status: 503 });
                        }

                        return new Response('Network error', { status: 503 });
                    });
            })
    );
});

// Helper functions
function fetchWithTimeout(request, timeout = 5000) {
    return Promise.race([
        fetch(request),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timeout')), timeout)
        )
    ]);
}

function isCriticalResource(url) {
    return CRITICAL_RESOURCES.some(resource => {
        if (resource === '/') {
            return url.endsWith('/') || url.includes('index');
        }
        return url.includes(resource);
    });
}

function isCachableResource(url) {
    return CACHE_PATTERNS.some(pattern => pattern.test(url)) ||
           CRITICAL_RESOURCES.some(resource => url.includes(resource));
}

// Message handling for cache updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_UPDATE') {
        // Force cache update
        caches.delete(STATIC_CACHE)
            .then(() => caches.delete(DYNAMIC_CACHE))
            .then(() => {
                console.log('🔄 Cache cleared for update');
            });
    }
});