self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
});

self.addEventListener('fetch', (event) => {
  // A simple pass-through fetch handler.
  // This is enough to make the app installable (PWA).
  event.respondWith(fetch(event.request));
});
