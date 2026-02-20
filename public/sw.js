// A basic service worker for PWA functionality
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Instantly activate the new service worker
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Take control of all pages under its scope immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // For a basic PWA, a network-first strategy is fine.
  // This ensures content is always fresh, but doesn't provide offline support.
  // For a real-world app, a more sophisticated caching strategy would be needed.
  event.respondWith(fetch(event.request));
});
