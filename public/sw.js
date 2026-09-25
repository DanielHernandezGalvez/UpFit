const CACHE = "upfit-v1"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll([
          "/favicon.svg",
          "/icon-192.png",
          "/icon-512.png",
          "/apple-touch-icon.png",
        ]),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  )
})
