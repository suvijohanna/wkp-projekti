(function () {
  'use strict';

  /// <reference lib="webworker" />
  const cacheName = 'ravintolat-pwa';
  const filesToCache = [
      '/~suvimyn/2025/jakso1/projekti/',
      '/~suvimyn/2025/jakso1/projekti/index.html',
      '/~suvimyn/2025/jakso1/projekti/favicon.ico',
      '/~suvimyn/2025/jakso1/projekti/style.css',
      '/~suvimyn/2025/jakso1/projekti/fontawesome.css',
      '/~suvimyn/2025/jakso1/projekti/src/fonts/fa-solid-900.woff2',
      '/~suvimyn/2025/jakso1/projekti/src/fonts/HappyMonkey-Regular.ttf',
      '/~suvimyn/2025/jakso1/projekti/src/fonts/Roboto-VariableFont_wdth,wght.ttf',
      '/~suvimyn/2025/jakso1/projekti/src/assets/icons/favicon.svg',
      '/~suvimyn/2025/jakso1/projekti/src/assets/icons/favicon-96x96.png',
      '/~suvimyn/2025/jakso1/projekti/src/assets/icons/apple-touch-icon.png',
      '/~suvimyn/2025/jakso1/projekti/src/assets/icons/restaurant-outline-svgrepo-com.svg',
      '/~suvimyn/2025/jakso1/projekti/src/assets/icons/restaurant-outline-svgrepo-com320.png',
      '/~suvimyn/2025/jakso1/projekti/src/assets/icons/restaurant-outline-svgrepo-com640.png',
      '/~suvimyn/2025/jakso1/projekti/src/assets/icons/restaurant-outline-svgrepo-com1280.png',
      '/~suvimyn/2025/jakso1/projekti/src/assets/icons/web-app-manifest192x192.png',
      '/~suvimyn/2025/jakso1/projekti/src/assets/icons/web-app-manifest512x512.png',
      '/~suvimyn/2025/jakso1/projekti/src/assets/img/pexels-kindel-media-7713481.jpg',
      '/~suvimyn/2025/jakso1/projekti/build/main.js'
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
