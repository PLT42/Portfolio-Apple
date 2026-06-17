const CACHE_NAME = 'portfolio-v8-logo-repair';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/index.css',
    '/script.js',
    '/aurora.js',
    '/manifest.json',
    '/footer.css',
    '/contact/contact.html',
    '/contact/contact.css',
    '/legal/mentions.html',
    '/legal/cgu.html',
    '/accueil/accueil.html',
    '/accueil/accueil.css',
    '/cv/cv.html',
    '/cv/cv.css',
    '/garage_404/realisation/travauxe.html',
    '/garage_404/realisation/travaux.css',
    '/garage_404/video/accueil.html',
    '/garage_404/video/accueil.css',
    '/jeu/blockmasterDX/jeu.html',
    '/jeu/blockmasterDX/manifest.json',
    '/jeu/blockmasterDX/cover-image.jpg',
    '/jeu/blockmasterDX/icon-180.png',
    '/jeu/blockmasterDX/icons/icon-72.png',
    '/jeu/blockmasterDX/icons/icon-96.png',
    '/jeu/blockmasterDX/icons/icon-128.png',
    '/jeu/blockmasterDX/icons/icon-144.png',
    '/jeu/blockmasterDX/icons/icon-152.png',
    '/jeu/blockmasterDX/icons/icon-192.png',
    '/jeu/blockmasterDX/icons/icon-384.png',
    '/jeu/blockmasterDX/icons/icon-512.png',
    '/opus_formation/diaporama_magasin_normal_roanne/diaponormal.html',
    '/opus_formation/diaporama_mcdo_roanne/diapomcdo.html',
    '/opus_formation/dossier_professionnel/dp.html',
    '/opus_formation/fiche_produit/ficheproduit.html',
    '/phenix_info/maquette_figma/maquette.html',
    '/image/logo_final_v4.png',
    '/image/logo_corporate.png',
    '/image/logo_elegance.png',
    '/image/logo_futuristic.png',
    '/image/logo_retro.png',
    '/image/logo_pixel_snes.png',
    '/image/logo_opus.png',
    '/image/logo_phenix.png',
    '/image/logo_garage.png',
    '/image/pikachurun.gif',
    '/audio/jingle-futuristic.mp3',
    '/audio/jingle-elegance.mp3',
    '/audio/jingle-corporate.mp3',
    '/audio/jingle-retro.mp3',
    '/accueil/IMG_0125 2.jpeg',
    '/accueil/image1.png',
    '/accueil/image2.png',
    '/accueil/image3.png',
    '/image/blockmaster_icon.png',
    '/image/fond.jpg',
    '/image/logo_universal.png',
    '/cookie-style.css',
    '/recruteur/espace.html',
    '/recruteur/admin.html',
    '/image/portrait.jpeg'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Caching complete site assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (!e.request.url.startsWith(self.location.origin) || e.request.method !== 'GET') {
        return;
    }

    e.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(e.request).then((cachedResponse) => {
                const fetchPromise = fetch(e.request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        cache.put(e.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // console.log('Network failed, serving offline content if available');
                });
                return cachedResponse || fetchPromise;
            });
        })
    );
});
