const CACHE_NAME = 'echoes-cache-v4';
const PRECACHE = ['/', '/index.html', '/styles.css', '/app.js', '/assets/libs/pannellum-loader.js', '/manifest.json'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE))); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/translations/'))) {
    e.respondWith(caches.open(CACHE_NAME).then(cache => cache.match(e.request).then(r => r || fetch(e.request).then(resp => { cache.put(e.request, resp.clone()); return resp })).catch(()=>caches.match('/index.html'))));
    return;
  }
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(()=>caches.match('/index.html'))));
});
