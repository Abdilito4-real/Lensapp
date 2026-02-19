// This is a basic service worker to enable PWA installation.
// It doesn't implement any advanced caching strategies.

self.addEventListener('install', (event) => {
  // Bypass the waiting lifecycle stage.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // Take control of all pages under this service worker's scope.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // For this app, we'll use a network-first strategy.
  // This ensures the user always gets the latest content.
  // It's a simple strategy that works well for online-first apps.
  event.respondWith(fetch(event.request));
});
