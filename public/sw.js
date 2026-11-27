const CACHE_NAME = 'valuecon-field-v39';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth')) return;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Always network for HTML + hashed CSS/JS so deploys show immediately
  if (
    req.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.includes('/assets/index-') ||
    url.pathname.endsWith('/sw.js')
  ) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
