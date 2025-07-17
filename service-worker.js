// Suntyn AI Service Worker
// Handles PWA functionality, offline caching, and background sync

const CACHE_NAME = 'suntyn-ai-v1.0.0';
const STATIC_CACHE_NAME = 'suntyn-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'suntyn-dynamic-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/js/smooth-scroll.js',
  '/static/js/scroll-to-top.js',
  '/static/js/websocket.js',
  '/static/js/drag-drop.js',
  '/static/js/theme.js',
  '/static/js/tools/pdf-merger.js',
  '/static/js/tools/image-compressor.js',
  '/static/js/tools/emi-calculator.js',
  '/static/js/tools/qr-generator.js',
  '/static/js/tools/text-summarizer.js',
  '/manifest.json'
];

// Dynamic assets to cache on request
const DYNAMIC_CACHE_PATTERNS = [
  /^\/tools\/.*/,
  /^\/api\/tools\/.*/,
  /^\/uploads\/.*/,
  /^\/static\/.*\.(css|js|png|jpg|jpeg|gif|svg|webp|ico)$/
];

// CDN assets to cache
const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdn.socket.io/4.0.0/socket.io.min.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Network timeout for dynamic requests
const NETWORK_TIMEOUT = 5000;

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        console.log('Caching CDN assets...');
        return cache.addAll(CDN_ASSETS);
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker installation failed:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return cacheName.startsWith('suntyn-') && 
                   cacheName !== STATIC_CACHE_NAME && 
                   cacheName !== DYNAMIC_CACHE_NAME;
          })
          .map(cacheName => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('Service Worker activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip Chrome extension requests
  if (request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip WebSocket requests
  if (request.url.includes('socket.io')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isDynamicAsset(request.url)) {
    event.respondWith(handleDynamicAsset(request));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

// Check if request is for a static asset
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         CDN_ASSETS.some(asset => url.includes(asset));
}

// Check if request is for a dynamic asset
function isDynamicAsset(url) {
  return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// Check if request is for an API endpoint
function isAPIRequest(url) {
  return url.includes('/api/');
}

// Check if request is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Handle static asset requests - Cache First strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Static asset request failed:', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle dynamic asset requests - Network First with fallback
async function handleDynamicAsset(request) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ]);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('Network request failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for tool pages
    if (request.url.includes('/tools/')) {
      return createOfflineToolResponse();
    }

    return new Response('Content not available offline', { status: 503 });
  }
}

// Handle API requests - Network Only with offline fallback
async function handleAPIRequest(request) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ]);

    return networkResponse;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Return offline message for API requests
    return new Response(
      JSON.stringify({
        error: 'This feature requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests - Network First with offline fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ]);

    return networkResponse;
  } catch (error) {
    console.warn('Navigation request failed, trying cache:', error);
    
    // Try to serve cached version
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to cached home page
    const homeResponse = await caches.match('/');
    if (homeResponse) {
      return homeResponse;
    }

    // Ultimate fallback - offline page
    return createOfflineResponse();
  }
}

// Handle other requests - Network First
async function handleOtherRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Other request failed:', error);
    return new Response('Request failed', { status: 503 });
  }
}

// Create offline response for tool pages
function createOfflineToolResponse() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Suntyn AI</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                color: white;
                padding: 2rem;
            }
            .offline-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            .title {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            .message {
                font-size: 1.1rem;
                margin-bottom: 2rem;
                opacity: 0.9;
            }
            .button {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid white;
                padding: 0.75rem 2rem;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            .button:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="offline-icon">📱</div>
            <h1 class="title">You're Offline</h1>
            <p class="message">
                This tool requires an internet connection to work properly.
                Please check your connection and try again.
            </p>
            <a href="/" class="button">Go to Home</a>
        </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Create general offline response
function createOfflineResponse() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Suntyn AI</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                color: white;
                padding: 2rem;
                max-width: 600px;
            }
            .offline-icon {
                font-size: 5rem;
                margin-bottom: 1rem;
            }
            .title {
                font-size: 2.5rem;
                margin-bottom: 1rem;
                font-weight: 700;
            }
            .message {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                opacity: 0.9;
                line-height: 1.6;
            }
            .features {
                margin-bottom: 2rem;
                text-align: left;
            }
            .feature {
                margin-bottom: 0.5rem;
                opacity: 0.8;
            }
            .buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            .button {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid white;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
                min-width: 120px;
            }
            .button:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
            .button.primary {
                background: white;
                color: #3b82f6;
            }
            .button.primary:hover {
                background: rgba(255, 255, 255, 0.9);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="offline-icon">🚀</div>
            <h1 class="title">Suntyn AI</h1>
            <p class="message">
                You're currently offline, but you can still access some features.
                Connect to the internet to unlock all 85+ professional tools.
            </p>
            <div class="features">
                <div class="feature">✓ Browse tool categories</div>
                <div class="feature">✓ Access cached content</div>
                <div class="feature">✓ View your dashboard</div>
                <div class="feature">✓ Use offline calculators</div>
            </div>
            <div class="buttons">
                <a href="/" class="button primary">Go Home</a>
                <a href="/dashboard" class="button">Dashboard</a>
                <button class="button" onclick="window.location.reload()">Try Again</button>
            </div>
        </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Handle background sync
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    console.log('Performing background sync...');
    
    // Sync any pending data
    const pendingData = await getStoredData('pending-sync');
    if (pendingData && pendingData.length > 0) {
      for (const item of pendingData) {
        try {
          await fetch(item.url, item.options);
          console.log('Synced:', item.url);
        } catch (error) {
          console.error('Sync failed for:', item.url, error);
        }
      }
      
      // Clear synced data
      await clearStoredData('pending-sync');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/static/icons/icon-192.png',
      badge: '/static/icons/badge-72.png',
      tag: 'suntyn-notification',
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/static/icons/action-open.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/static/icons/action-dismiss.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle periodic background sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    console.log('Performing periodic content sync...');
    
    // Update cached content
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponses = await cache.keys();
    
    for (const request of cachedResponses) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch (error) {
        console.warn('Failed to update cached content:', request.url);
      }
    }
  } catch (error) {
    console.error('Periodic sync failed:', error);
  }
}

// Utility functions for IndexedDB operations
async function getStoredData(key) {
  try {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('suntyn-sw-db', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readonly');
        const store = transaction.objectStore('data');
        const getRequest = store.get(key);
        
        getRequest.onsuccess = () => resolve(getRequest.result?.value);
        getRequest.onerror = () => reject(getRequest.error);
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'key' });
        }
      };
    });
  } catch (error) {
    console.error('Failed to get stored data:', error);
    return null;
  }
}

async function clearStoredData(key) {
  try {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('suntyn-sw-db', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['data'], 'readwrite');
        const store = transaction.objectStore('data');
        const deleteRequest = store.delete(key);
        
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  } catch (error) {
    console.error('Failed to clear stored data:', error);
  }
}

// Log service worker events
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle errors
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker script loaded');
