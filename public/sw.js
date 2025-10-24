// Service Worker PWA Online-First
const CACHE_NAME = 'gercao-v2';

// Cache apenas assets estáticos essenciais
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network First - sempre tenta buscar online
self.addEventListener('fetch', (event) => {
  // Ignorar non-GET requests
  if (event.request.method !== 'GET') return;

  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições externas
  if (url.hostname !== self.location.hostname) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses para assets estáticos
        if (response.ok && isStaticAsset(url.pathname)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback para cache apenas em falha de rede
        return caches.match(request);
      })
  );
});

function isStaticAsset(pathname) {
  return pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff2|webp|json)$/);
}

// Push notification handlers
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'GERCAO', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data.url;
    
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});
