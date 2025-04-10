import handlers from "./build/worker.mjs";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (url.endsWith("/query")) {
    e.respondWith(handlers.fetch(e.request));
    return;
  }
  e.respondWith(
    (async () => {
      const cachedResponse = await caches.match(e.request);
      if (cachedResponse) return cachedResponse;
      return fetch(e.request);
    })()
  );
});
