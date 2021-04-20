// Set this to true for production
const doCache = true;

// Name our cache
const CACHE_NAME = 'db-pwa-cache-v1';

// Delete old caches that are not our current one!
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (!cacheWhitelist.includes(key)) {
            console.log(`Deleting cache: ${key}`);
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
});

// The first time the user starts up the PWA, 'install' is triggered.
self.addEventListener('install', function(event) {
  if (doCache) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        const cacheAssets = ['/', '/index.html', '/dist/app.css', '/dist/app.js'];
        return cache.addAll(cacheAssets);
      }),
    );
  }
});

// When the webpage goes to fetch files, we intercept that request and serve up the matching files
// if we have them
self.addEventListener('fetch', function(event) {
  if (doCache) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request).catch(e => console.error(e));
      }),
    );
  }
});
