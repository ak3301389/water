const CACHE = 'water-v4-firebase';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './sound.mp3'];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => { }));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => { });
            return resp;
        }).catch(() => cached))
    );
});

// Клик по уведомлению — открыть приложение
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            for (const c of list) if ('focus' in c) return c.focus();
            if (clients.openWindow) return clients.openWindow('./');
        })
    );
});

// ===== Периодическая синхронизация (экспериментально) =====
self.addEventListener('periodicsync', (e) => {
    if (e.tag === 'water-reminder') {
        e.waitUntil(self.registration.showNotification('Водный баланс', {
            body: '💧 Пора выпить стакан воды!',
            icon: 'icon-192.png',
            tag: 'water-reminder'
        }));
    }
});