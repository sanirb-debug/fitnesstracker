/* Offline cache for The Cut.
   Bump CACHE when you redeploy so phones pick up the new build. */
const CACHE = "the-cut-v2";
const SHELL = [
  "./", "./index.html", "./app.js", "./manifest.webmanifest",
  "./favicon.png", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll fails the whole install if any single file 404s, so add individually
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never touch the API — responses are per-request and must not be replayed.
  if (url.hostname.endsWith("anthropic.com")) return;

  // Google Fonts: serve from cache, refresh in the background.
  if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    e.respondWith(
      caches.open(CACHE).then((c) =>
        c.match(req).then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; });
          return hit || net;
        }).catch(() => fetch(req))
      )
    );
    return;
  }

  // App shell: cache first, fall back to network, then to the cached page.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then((hit) =>
        hit || fetch(req).then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        }).catch(() => caches.match("./index.html"))
      )
    );
  }
});
