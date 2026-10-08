// Offline support. On install, the app shell is precached: the asset list is read from index.html,
// which stays the single list of files. Afterwards: serve from cache, refresh in the background,
// so a new version is picked up on the following launch.
'use strict';
const CACHE = 'academy-v3';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const html = await (await fetch('index.html', { cache: 'no-store' })).text();
    const assets = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(m => m[1]);
    const cache = await caches.open(CACHE);
    await cache.addAll(['./', 'index.html', ...new Set(assets)]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || fresh;
  })());
});
