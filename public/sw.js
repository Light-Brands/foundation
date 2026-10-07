// The command center's service worker. It caches the app's static code for speed and shows the offline page
// when there is no connection. It never caches pages, API responses or business data.
const VERSION = "foundation-v1";
const OFFLINE = "/offline";
const MAX_STATIC = 200;

// Old builds' chunks never come back, so the oldest entries go once the cache passes its cap.
async function trim(cache) {
  const keys = await cache.keys();
  await Promise.all(keys.filter((r) => new URL(r.url).pathname !== OFFLINE).slice(0, Math.max(0, keys.length - MAX_STATIC)).map((r) => cache.delete(r)));
}

const OFFLINE_REPLY = () => new Response("You are offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.add(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) {
          await cache.put(req, res.clone());
          await trim(cache);
        }
        return res;
      }),
    );
    return;
  }
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(async () => (await caches.match(OFFLINE)) ?? OFFLINE_REPLY()));
  }
});
