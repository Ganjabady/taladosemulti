const CACHE_NAME = 'taladose-v4-final'; // Cache version updated!
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  'https://raw.githubusercontent.com/Ganjabady/TalaDose1/refs/heads/main/taladoseicon250.png',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap'
];

// Install a service worker
self.addEventListener('install', event => {
  self.skipWaiting(); // Force the new service worker to become active
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve from cache
        }
        return fetch(event.request); // Fetch from network
      }
    )
  );
});

// Update a service worker and remove old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
