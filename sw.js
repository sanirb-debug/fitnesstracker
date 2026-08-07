/* Offline cache for The Cut.
   Bump CACHE when you redeploy so phones pick up the new build. */
const CACHE = "the-cut-v13";
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

  if (url.origin !== location.origin) return;

  /* The code itself is network-first.

     Cache-first here meant every deploy took two openings to appear: the page
     you were looking at had already been served the previous build, and the new
     one only installed behind it. In between the app looked broken — buttons
     that had been added simply weren't there. Freshness matters more than the
     few hundred ms, and GitHub Pages answers a revalidation with a 304, so the
     usual cost is a round trip and not a re-download. Offline still works: the
     cache is right there in the catch. */
  const isCode = req.mode === "navigate" ||
    /\/(index\.html|app\.js|manifest\.webmanifest)$/.test(url.pathname) ||
    url.pathname.endsWith("/");

  if (isCode) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }

  // Icons and the like never change under a given build — cache first is fine.
  e.respondWith(
    caches.match(req).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
