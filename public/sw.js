// StartupCopilot Service Worker
// Network-first for API, stale-while-revalidate for static assets

const CACHE_NAME = "startupcop-v1";
const STATIC_ASSETS = [
    "/",
    "/dashboard",
    "/manifest.json",
];

// Install — cache app shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch — network-first for API, stale-while-revalidate for the rest
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET
    if (request.method !== "GET") return;

    // API calls — network only
    if (url.pathname.startsWith("/api/")) {
        return;
    }

    // Stale-while-revalidate for everything else
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);

                return cachedResponse || fetchPromise;
            });
        })
    );
});

// Push notifications
self.addEventListener("push", (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const { title, body, icon, url } = data;

    event.waitUntil(
        self.registration.showNotification(title || "StartupCopilot", {
            body: body || "",
            icon: icon || "/icon-192.png",
            badge: "/icon-192.png",
            vibrate: [200, 100, 200],
            data: { url: url || "/dashboard" },
            actions: [
                { action: "open", title: "Открыть" },
            ],
        })
    );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = event.notification.data?.url || "/dashboard";

    event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((clients) => {
            // Focus existing window
            for (const client of clients) {
                if (client.url.includes(url) && "focus" in client) {
                    return client.focus();
                }
            }
            // Open new window
            return self.clients.openWindow(url);
        })
    );
});
