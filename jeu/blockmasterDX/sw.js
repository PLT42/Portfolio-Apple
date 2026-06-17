const CACHE_NAME = 'block-master-v4';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install: cache les assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting()) // Force activation immédiate
    );
});

// Activate: supprime les anciens caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim()) // Prend le contrôle immédiatement
    );
});

// Fetch: NETWORK FIRST (toujours chercher la dernière version)
self.addEventListener('fetch', event => {
    // Pour les fichiers HTML, toujours aller sur le réseau d'abord
    if (event.request.mode === 'navigate' || event.request.url.endsWith('.html')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Met à jour le cache avec la nouvelle version
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request)) // Fallback au cache si hors-ligne
        );
    } else {
        // Pour les autres ressources, cache first
        event.respondWith(
            caches.match(event.request)
                .then(cached => cached || fetch(event.request))
                .catch(() => caches.match('./index.html'))
        );
    }
});
