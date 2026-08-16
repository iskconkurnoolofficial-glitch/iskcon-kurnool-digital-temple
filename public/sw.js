// ISKCON Kurnool Service Worker
const CACHE_NAME = "iskcon-kurnool-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/jagannatha.png",
  "/krishna.png",
  "/mandala.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Pre-caching some assets failed:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests and http/https requests
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  // Network first with cache fallback for page navigations and assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response and cache static image/font assets
        if (response && response.status === 200 && response.type === "basic") {
          const url = event.request.url;
          if (url.match(/\.(png|jpg|jpeg|svg|gif|webp|woff2|woff|ttf|css|js)$/i)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
        }
        return response;
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If navigation fails, return cached root if available
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Network offline", { status: 503, statusText: "Offline" });
        });
      })
  );
});
