// Export or mirror the service worker logic for source tracking
export const SERVICE_WORKER_VERSION = 'v3-stale-revalidate';

// Service worker execution is located in /public/service-worker.js and served statically
// Re-export constants and offline caching configuration
export const OFFLINE_CACHE_CONFIG = {
  cacheName: 'bismillah-pos-v3-stale-revalidate',
  strategy: 'stale-while-revalidate',
  staticAssets: [
    '/',
    '/index.html',
    '/manifest.json',
    '/metadata.json',
    '/firebase-applet-config.json'
  ]
};
