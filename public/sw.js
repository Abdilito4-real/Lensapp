self.addEventListener('fetch', (event) => {
  // A simple pass-through fetch handler.
  // This is the simplest way to make the app installable.
  event.respondWith(fetch(event.request));
});
