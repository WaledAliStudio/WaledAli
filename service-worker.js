const CACHE_NAME = 'waledali-v1';
const urlsToCache = [
  './',
  'index.html',
  'offline.html',
  'logo.png',
  'manifest.json',
  'style.css',
  'script.js',
  // External resources
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap',
  'https://unpkg.com/aos@2.3.1/dist/aos.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle offline state
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // If it's a navigation request, return the offline page
        if (event.request.mode === 'navigate') {
          return caches.match('offline.html');
        }
        
        // For other requests, try to get from cache
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // If it's an image request, return a default offline image
            if (event.request.destination === 'image') {
              return caches.match('logo.png');
            }
            
            // For other requests, return null
            return null;
          });
      })
  );
}); 