
// Service worker for BarberApp Calendar
const CACHE_NAME = 'barberapp-v2';
const urlsToCache = [
  '/',
  '/icons/logo.webp',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
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
    })
  );
  self.clients.claim();
});

// Fetch event - Network first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip WebSocket, hot reload, and other non-HTTP requests
  if (!event.request.url.startsWith('http') || 
      event.request.url.includes('ws://') || 
      event.request.url.includes('wss://') ||
      event.request.url.includes('__vite') ||
      event.request.url.includes('hot-update')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Return a basic offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return new Response(`
                <html>
                  <body style="font-family: system-ui; text-align: center; padding: 40px;">
                    <h1>Sin conexión</h1>
                    <p>Por favor, verifica tu conexión a internet</p>
                  </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
          });
      })
  );
});
