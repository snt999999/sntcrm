const CACHE_NAME = 'solncanet-admin-recovery-cache-killer-20260902';
self.addEventListener('install', (event) => { self.skipWaiting(); });
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => String(key).includes('solncanet')).map((key) => caches.delete(key)));
    } catch (_) {}
    try { await self.registration.unregister(); } catch (_) {}
    try {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach((client) => client.navigate(client.url));
    } catch (_) {}
  })());
  self.clients.claim();
});
