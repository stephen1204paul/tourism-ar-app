/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Take control immediately
clientsClaim();

// Precache all static assets from the build
precacheAndRoute(self.__WB_MANIFEST);

// Cache names
const CACHE_NAMES = {
  static: 'static-assets-v1',
  models: '3d-models-v1',
  markers: 'ar-markers-v1',
  api: 'api-cache-v1',
  images: 'images-v1',
};

// App shell navigation routing
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }: { request: Request; url: URL }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Cache static assets (CSS, JS) - Cache First
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache images - Cache First with expiration
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache 3D models (.glb, .gltf, .obj, .fbx) - Cache First
registerRoute(
  ({ url }) =>
    url.pathname.endsWith('.glb') ||
    url.pathname.endsWith('.gltf') ||
    url.pathname.endsWith('.obj') ||
    url.pathname.endsWith('.fbx') ||
    url.pathname.includes('/models/'),
  new CacheFirst({
    cacheName: CACHE_NAMES.models,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
      }),
    ],
  })
);

// Cache AR markers (.patt, marker images) - Cache First
registerRoute(
  ({ url }) =>
    url.pathname.endsWith('.patt') ||
    url.pathname.includes('/markers/') ||
    url.pathname.includes('/ar-markers/'),
  new CacheFirst({
    cacheName: CACHE_NAMES.markers,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
      }),
    ],
  })
);

// Background sync for offline actions
const bgSyncPlugin = new BackgroundSyncPlugin('offlineActionsQueue', {
  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('Replay successful for request', entry.request.url);
      } catch (error) {
        console.error('Replay failed for request', entry.request.url, error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
    console.log('Replay complete!');
  },
});

// API calls - Network First with cache fallback
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('/pois') ||
    url.pathname.includes('/tours') ||
    url.pathname.includes('/locations'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  })
);

// Handle POST requests for offline sync (visited POIs, ratings)
registerRoute(
  ({ url, request }) =>
    request.method === 'POST' &&
    (url.pathname.includes('/visited') ||
      url.pathname.includes('/ratings') ||
      url.pathname.includes('/favorites') ||
      url.pathname.includes('/sync')),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// Handle PUT requests for offline sync
registerRoute(
  ({ url, request }) =>
    request.method === 'PUT' &&
    (url.pathname.includes('/visited') ||
      url.pathname.includes('/ratings') ||
      url.pathname.includes('/favorites')),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    plugins: [bgSyncPlugin],
  }),
  'PUT'
);

// External resources (CDNs) - Stale While Revalidate
registerRoute(
  ({ url }) =>
    url.origin !== self.location.origin &&
    (url.hostname.includes('cdn') ||
      url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')),
  new StaleWhileRevalidate({
    cacheName: 'external-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Offline indicator - broadcast connection status
self.addEventListener('fetch', (event) => {
  // This is handled by the routing above, but we can add custom offline handling
});

// Notify clients about offline/online status
const broadcastChannel = new BroadcastChannel('sw-messages');

self.addEventListener('online', () => {
  broadcastChannel.postMessage({ type: 'ONLINE' });
});

self.addEventListener('offline', () => {
  broadcastChannel.postMessage({ type: 'OFFLINE' });
});

// Clean up old caches on activate
self.addEventListener('activate', (event) => {
  const currentCaches = Object.values(CACHE_NAMES);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => !currentCaches.includes(cacheName))
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

export {};
