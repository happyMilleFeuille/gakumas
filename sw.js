self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // 가장 기본적인 통과형 Service Worker (PWA 설치 조건을 만족시키기 위함)
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
