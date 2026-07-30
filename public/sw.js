/**
 * Service worker «Дала ML».
 *
 * Задача одна и понятная: школьник открыл модуль, метро/аул потеряли сеть,
 * страница перезагрузилась — урок и интерактив по-прежнему работают.
 *
 * Стратегия:
 *  · навигации — сначала сеть, при отказе кэш, затем /offline;
 *  · статика Next (/_next/static/…) — cache-first, эти файлы неизменяемы;
 *  · остальное — stale-while-revalidate.
 */

const CACHE = 'dala-ml-v2'

const SHELL = ['/', '/kurs', '/sozdik', '/offline', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Один недоступный адрес не должен валить всю установку.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  )
})

function isStatic(url) {
  return url.pathname.startsWith('/_next/static/') || /\.(?:woff2?|png|svg|ico|webmanifest)$/.test(url.pathname)
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // Навигация: свежая страница важнее, но офлайн важнее ошибки.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return res
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/offline')) || Response.error())
    )
    return
  }

  if (isStatic(url)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
            return res
          })
      )
    )
    return
  }

  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        })
        .catch(() => hit)
      return hit || network
    })
  )
})

// Страница просит положить модуль в офлайн.
self.addEventListener('message', (event) => {
  const data = event.data
  if (data === 'skipWaiting') {
    self.skipWaiting()
    return
  }
  if (data && data.type === 'cache-urls' && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(CACHE).then((cache) => Promise.allSettled(data.urls.map((u) => cache.add(u))))
    )
  }
})
