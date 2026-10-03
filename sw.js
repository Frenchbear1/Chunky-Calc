const CACHE_NAME = 'chunky-calc-v21';
const APP_SHELL = [
  './',
  './index.html',
  './themes.js?v=21',
  './data.js?v=21',
  './features.js?v=21',
  './math.js?v=13',
  './vendor/decimal.js',
  './manifest.webmanifest',
  './browserconfig.xml',
  './favicon.ico',
  './apple-touch-icon.png',
  './assets/icons/favicon-16x16.png',
  './assets/icons/favicon-32x32.png',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  './assets/icons/maskable-icon-512x512.png',
  './assets/icons/mstile-150x150.png',
  './assets/icons/safari-pinned-tab.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => /^chunky-calc-v\d+$/.test(key) && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Generated icons exist only in this browser. Never send these requests to a server.
  if (url.origin === self.location.origin && url.pathname.startsWith(new URL('./local-icon/', self.registration.scope).pathname)) {
    event.respondWith(caches.open('chunky-calc-user-icons-v1').then(cache => cache.match(event.request)).then(found => found || new Response('Local icon unavailable', {status:404})));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
