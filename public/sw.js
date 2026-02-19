// This is a basic service worker to enable PWA functionality.
// It doesn't implement any caching strategies yet.

self.addEventListener('install', (event) => {
  // Perform install steps
});

self.addEventListener('fetch', (event) => {
  // This service worker doesn't intercept any fetch requests.
  // It's just here to make the app installable.
  event.respondWith(fetch(event.request));
});
