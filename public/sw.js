const CACHE = "upfit-v3"

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
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

  const isIcon =
    url.pathname.startsWith("/icon-") || url.pathname === "/apple-touch-icon.png"

  if (!isIcon) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        }
        return response
      })
    }),
  )
})
