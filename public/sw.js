// ISKCON Kurnool Service Worker
const CACHE_NAME = "iskcon-kurnool-v2";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon.png",
  "/iskcon-logo.png",
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

// ============================================================================
// WEB PUSH NOTIFICATIONS EVENT HANDLERS
// ============================================================================

self.addEventListener("push", (event) => {
  let data = {
    title: "ISKCON Kurnool",
    body: "New update from Sri Sri Puri Jagannath Temple!",
    icon: "/iskcon-logo.png",
    badge: "/favicon.png",
    url: "/"
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/iskcon-logo.png",
    badge: data.badge || "/favicon.png",
    image: data.image || undefined,
    data: {
      url: data.url || "/"
    },
    vibrate: [100, 50, 100, 50, 100],
    tag: data.tag || "iskcon-notification",
    renotify: true,
    actions: [
      { action: "open", title: "View Details 🌸" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
