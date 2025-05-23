const CACHE_NAME = 'rafq-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/pwa-install.js',
  '/manifest.json',
  '/logo-any.png',
  '/logo-maskable.png',
  '/screenshot1.png',
  '/screenshot2.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('تم فتح الكاش');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // تحديث العملاء
      self.clients.claim(),
      // حذف الكاش القديم
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('تم حذف الكاش القديم');
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// معالجة الطلبات
self.addEventListener('fetch', (event) => {
  // تجاهل طلبات POST
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إرجاع الاستجابة من الكاش إذا وجدت
        if (response) {
          return response;
        }

        // نسخ الطلب لأن الطلب يمكن استخدامه مرة واحدة فقط
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // التحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // نسخ الاستجابة لأن الاستجابة يمكن استخدامها مرة واحدة فقط
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // في حالة فشل الاتصال، إرجاع صفحة offline
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
}); 