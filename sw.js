const CACHE = 'bio360-v1';
const ASSETS = [
  '/Bio360/',
  '/Bio360/index.html',
  '/Bio360/dashboard.html',
  '/Bio360/features.html',
  '/Bio360/blog.html',
  '/Bio360/community.html',
  '/Bio360/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
      .catch(() => caches.match('/Bio360/index.html'))
  );
});
