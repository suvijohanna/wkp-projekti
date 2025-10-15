(function () {
  'use strict';

  /// <reference lib="webworker" />
  const cacheName = 'ravintolat-pwa';
  const filesToCache = [
      '/',
      '/index.html',
      '/favicon.ico',
      '/style.css',
      '/fontawesome.css',
      '/src/fonts/fontawesome-webfont.woff2',
      '/src/assets/icons/favicon.svg',
      '/src/assets/icons/favicon-96x96.png',
      '/src/assets/icons/apple-touch-icon.png',
      '/src/assets/icons/restaurant-outline-svgrepo-com.svg',
      '/src/assets/icons/restaurant-outline-svgrepo-com320.png',
      '/src/assets/icons/restaurant-outline-svgrepo-com640.png',
      '/src/assets/icons/restaurant-outline-svgrepo-com1280.png',
      '/src/assets/icons/web-app-manifest192x192.png',
      '/src/assets/icons/web-app-manifest512x512.png',
      '/build/main.js'
  ];
  self.addEventListener('install', (event) => {
      event.waitUntil(caches.open(cacheName).then((cache) => {
          return cache.addAll(filesToCache);
      }));
  });
  self.addEventListener('fetch', (event) => {
      event.respondWith(caches.match(event.request).then((response) => {
          return response || fetch(event.request);
      }));
  });

})();
