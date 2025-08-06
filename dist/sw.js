const CACHE_NAME = 'nordora-v3';
const STATIC_CACHE = 'nordora-static-v3';
const DATA_CACHE = 'nordora-data-v3';

// Detectar si estamos en desarrollo
const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// Recursos estáticos a cachear (solo en producción)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/pages/gestion-stock.html',
  '/styles/global-styles.css',
  '/assets/images/nordora-menu-icon.svg',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/images/divan-nordico.jpg',
  '/assets/images/estanteria-flotante.jpg',
  '/assets/images/mesa-centro.jpg',
  '/assets/images/silla-exterior.jpg',
  '/assets/images/sofa-moderno.jpg',
  '/assets/images/lampara-pie.jpg',
  '/assets/images/default-img.jpg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  if (!isDev) {
    event.waitUntil(
      Promise.all([
        caches.open(STATIC_CACHE).then((cache) => {
          console.log('[ServiceWorker] Caching static files');
          return cache.addAll(STATIC_FILES);
        }),
        caches.open(DATA_CACHE)
      ])
    );
  } else {
    console.log('[ServiceWorker] Development mode - minimal caching');
  }
  
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes('nordora-v3')) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Función para verificar si una URL debe ser interceptada
function shouldIntercept(url) {
  // No interceptar en desarrollo
  if (isDev) {
    return false;
  }
  
  // No interceptar extensiones del navegador
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'ms-browser-extension:') {
    return false;
  }
  
  // No interceptar Vite HMR
  if (url.pathname.includes('/@vite/') || 
      url.pathname.includes('/@fs/') ||
      url.pathname.includes('?t=') ||
      url.search.includes('token=')) {
    return false;
  }
  
  // No interceptar websockets
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return false;
  }
  
  // Solo interceptar archivos de nuestro dominio
  return url.origin === self.location.origin;
}

// Intercepción de peticiones (fetch)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Verificar si debemos interceptar esta petición
  if (!shouldIntercept(url)) {
    return; // Dejar pasar sin interceptar
  }
  
  // Solo en producción, usar estrategias de cache
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
  } else if (STATIC_FILES.includes(url.pathname) || event.request.destination === 'image') {
    event.respondWith(cacheFirst(event.request));
  }
});

// Estrategia Cache First (solo para producción)
async function cacheFirst(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[ServiceWorker] Cache hit:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok && networkResponse.status < 400) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Cache first failed:', error);
    // Fallback para páginas HTML
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      return cache.match('/index.html');
    }
    throw error;
  }
}

// Estrategia Network First (solo para producción)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok && networkResponse.status < 400) {
      const cache = await caches.open(DATA_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network first failed:', error);
    const cache = await caches.open(DATA_CACHE);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sincronización en segundo plano (solo en producción)
self.addEventListener('sync', (event) => {
  if (!isDev && event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[ServiceWorker] Background sync');
  // Implementar lógica de sincronización
}

// Notificaciones Push
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('Nordora', options)
    );
  }
});

console.log('[ServiceWorker] Loaded in', isDev ? 'DEVELOPMENT' : 'PRODUCTION', 'mode');