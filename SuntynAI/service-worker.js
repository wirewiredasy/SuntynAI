// Service Worker for Suntyn AI - Optimized for Development and Production
const CACHE_NAME = 'suntyn-ai-v1.0.1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/css/bootstrap-custom.css',
  '/static/js/main.js',
  '/static/js/theme.js',
  '/static/js/performance-optimizer.js',
  '/static/js/lazy-loader.js',
  '/manifest.json'
];

// External resources to cache only in production
const externalResources = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons-sprite.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js'
];

// Enhanced environment detection for Replit
const isProduction = !self.location.hostname.includes('localhost') && 
                     !self.location.hostname.includes('replit.dev') &&
                     !self.location.hostname.includes('replit.app') &&
                     !self.location.hostname.includes('repl.co') &&
                     self.location.protocol === 'https:';

// Use appropriate cache list
const finalUrlsToCache = isProduction ? [...urlsToCache, ...externalResources] : urlsToCache;

// Install event with enhanced error handling
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Service Worker: Cache opened');
        // Try to cache all resources, fallback to essential only
        return cache.addAll(finalUrlsToCache)
          .then(() => {
            console.log('✅ All resources cached successfully');
          })
          .catch(err => {
            console.warn('⚠️ Some resources failed to cache, trying essential only:', err.message);
            // Fallback: Cache only essential local resources
            return cache.addAll(urlsToCache.slice(0, 4));
          });
      })
      .catch(err => {
        console.error('❌ Service Worker: Cache open failed:', err);
        // Don't fail installation, just log the error
        return Promise.resolve();
      })
  );
  
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).then(fetchResponse => {
          // Don't cache if not successful
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }

          // Clone the response
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return fetchResponse;
        });
      })
      .catch(() => {
        // Return offline fallback if available
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});