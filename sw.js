const CACHE_NAME = 'rafq-cache-v1';
const SYNC_QUEUE = 'sync-queue';
const DB_NAME = 'rafq-sync-db';
const DB_VERSION = 1;

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
  '/offline.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap'
];

// استراتيجيات التخزين المؤقت
const CACHE_STRATEGIES = {
  // استراتيجية "Cache First" للموارد الثابتة
  STATIC: 'static',
  // استراتيجية "Network First" للمحتوى الديناميكي
  DYNAMIC: 'dynamic',
  // استراتيجية "Cache Only" للموارد الأساسية
  ESSENTIAL: 'essential'
};

// إعدادات التحديث التلقائي
const PERIODIC_SYNC_SETTINGS = {
  // تحديث كل 24 ساعة
  PERIOD: 24 * 60 * 60 * 1000,
  // الموارد التي يجب تحديثها
  RESOURCES_TO_SYNC: [
    '/',
    '/index.html',
    '/script.js',
    '/pwa-install.js',
    '/manifest.json'
  ]
};

// إعدادات الإشعارات
const NOTIFICATION_SETTINGS = {
  DEFAULT_ICON: 'logo-any.png',
  DEFAULT_BADGE: 'logo-any.png',
  DEFAULT_SOUND: '/notification-sound.mp3',
  VIBRATION_PATTERN: [100, 50, 100],
  ACTIONS: [
    {
      action: 'open',
      title: 'فتح التطبيق',
      icon: 'logo-any.png'
    },
    {
      action: 'close',
      title: 'إغلاق',
      icon: 'logo-any.png'
    }
  ]
};

// تحديد استراتيجية التخزين المؤقت للموارد
function getCacheStrategy(url) {
  // الموارد الثابتة (الصور، CSS، JS)
  if (url.match(/\.(jpg|jpeg|png|gif|svg|css|js)$/)) {
    return CACHE_STRATEGIES.STATIC;
  }
  // الموارد الأساسية (الصفحة الرئيسية، offline.html)
  if (url === '/' || url === '/offline.html') {
    return CACHE_STRATEGIES.ESSENTIAL;
  }
  // باقي الموارد (محتوى ديناميكي)
  return CACHE_STRATEGIES.DYNAMIC;
}

// استراتيجية "Cache First"
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return caches.match('/offline.html');
  }
}

// استراتيجية "Network First"
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match('/offline.html');
  }
}

// استراتيجية "Cache Only"
async function cacheOnly(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  return caches.match('/offline.html');
}

// تهيئة قاعدة البيانات
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SYNC_QUEUE)) {
        db.createObjectStore(SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// إضافة إجراء إلى قائمة المزامنة
async function addToSyncQueue(action) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SYNC_QUEUE, 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE);
    const request = store.add({
      action,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// تنفيذ الإجراءات المعلقة
async function processSyncQueue() {
  const db = await initDB();
  const transaction = db.transaction(SYNC_QUEUE, 'readwrite');
  const store = transaction.objectStore(SYNC_QUEUE);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = async () => {
      const actions = request.result;
      for (const action of actions) {
        if (action.status === 'pending') {
          try {
            await executeAction(action);
            action.status = 'completed';
            store.put(action);
          } catch (error) {
            console.error('فشل تنفيذ الإجراء:', error);
            action.status = 'failed';
            action.error = error.message;
            store.put(action);
          }
        }
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// تنفيذ إجراء
async function executeAction(action) {
  const { type, data } = action.action;
  
  switch (type) {
    case 'form_submit':
      return await submitForm(data);
    case 'data_update':
      return await updateData(data);
    default:
      throw new Error('نوع إجراء غير معروف');
  }
}

// إرسال نموذج
async function submitForm(data) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('فشل إرسال النموذج');
  }
  
  return response.json();
}

// تحديث البيانات
async function updateData(data) {
  const response = await fetch('/api/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('فشل تحديث البيانات');
  }
  
  return response.json();
}

// تحديث الموارد في الخلفية
async function updateResources() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const updatePromises = PERIODIC_SYNC_SETTINGS.RESOURCES_TO_SYNC.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          await cache.put(url, response);
          console.log(`تم تحديث ${url} بنجاح`);
        }
      } catch (error) {
        console.error(`فشل تحديث ${url}:`, error);
      }
    });
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('فشل تحديث الموارد:', error);
  }
}

// التحقق من وجود تحديثات جديدة
async function checkForUpdates() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const updatePromises = PERIODIC_SYNC_SETTINGS.RESOURCES_TO_SYNC.map(async (url) => {
      try {
        const cachedResponse = await cache.match(url);
        const networkResponse = await fetch(url, { cache: 'no-store' });
        
        if (networkResponse.ok) {
          const cachedETag = cachedResponse?.headers.get('ETag');
          const networkETag = networkResponse.headers.get('ETag');
          
          if (cachedETag !== networkETag) {
            await cache.put(url, networkResponse);
            console.log(`تم العثور على تحديث جديد لـ ${url}`);
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error(`فشل التحقق من التحديثات لـ ${url}:`, error);
        return false;
      }
    });
    
    const updates = await Promise.all(updatePromises);
    return updates.some(hasUpdate => hasUpdate);
  } catch (error) {
    console.error('فشل التحقق من التحديثات:', error);
    return false;
  }
}

// معالجة الإشعارات الدفعية
self.addEventListener('push', (event) => {
  try {
    let notificationData;
    
    // محاولة تحليل البيانات المرسلة
    if (event.data) {
      try {
        notificationData = event.data.json();
      } catch (e) {
        notificationData = {
          title: 'منصة رفق',
          body: event.data.text() || 'رسالة جديدة من منصة رفق',
          icon: NOTIFICATION_SETTINGS.DEFAULT_ICON,
          data: {
            url: '/'
          }
        };
      }
    } else {
      notificationData = {
        title: 'منصة رفق',
        body: 'رسالة جديدة من منصة رفق',
        icon: NOTIFICATION_SETTINGS.DEFAULT_ICON,
        data: {
          url: '/'
        }
      };
    }

    // إعداد خيارات الإشعار
    const options = {
      body: notificationData.body,
      icon: notificationData.icon || NOTIFICATION_SETTINGS.DEFAULT_ICON,
      badge: notificationData.badge || NOTIFICATION_SETTINGS.DEFAULT_BADGE,
      vibrate: NOTIFICATION_SETTINGS.VIBRATION_PATTERN,
      data: {
        ...notificationData.data,
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: NOTIFICATION_SETTINGS.ACTIONS,
      requireInteraction: true,
      tag: notificationData.tag || 'default',
      renotify: true,
      silent: false
    };

    // عرض الإشعار
    event.waitUntil(
      self.registration.showNotification(notificationData.title, options)
    );
  } catch (error) {
    console.error('خطأ في معالجة الإشعار الدفعي:', error);
  }
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  const action = event.action;

  if (action === 'close') {
    return;
  }

  // فتح التطبيق عند النقر على الإشعار
  event.waitUntil(
    (async () => {
      try {
        // محاولة فتح نافذة موجودة
        const windows = await clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });

        // البحث عن نافذة مفتوحة
        for (const window of windows) {
          if (window.url.includes(notificationData.url) && 'focus' in window) {
            return window.focus();
          }
        }

        // إذا لم توجد نافذة مفتوحة، افتح نافذة جديدة
        if (clients.openWindow) {
          return clients.openWindow(notificationData.url);
        }
      } catch (error) {
        console.error('خطأ في فتح النافذة:', error);
      }
    })()
  );
});

// معالجة إغلاق الإشعارات
self.addEventListener('notificationclose', (event) => {
  const notificationData = event.notification.data;
  console.log('تم إغلاق الإشعار:', notificationData);
});

// تسجيل الإشعارات الدفعية
async function registerPushNotifications() {
  try {
    const registration = await self.registration;
    
    // التحقق من دعم الإشعارات
    if (!('Notification' in self)) {
      console.log('هذا المتصفح لا يدعم الإشعارات');
      return;
    }

    // التحقق من إذن الإشعارات
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('تم رفض إذن الإشعارات');
      return;
    }

    // الحصول على مفتاح VAPID العام
    const response = await fetch('/api/vapid-public-key');
    const vapidPublicKey = await response.text();

    // تسجيل الإشعارات الدفعية
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });

    // إرسال معلومات الاشتراك إلى الخادم
    await fetch('/api/push-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    console.log('تم تسجيل الإشعارات الدفعية بنجاح');
  } catch (error) {
    console.error('فشل تسجيل الإشعارات الدفعية:', error);
  }
}

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('تم فتح الكاش');
          return cache.addAll(urlsToCache);
        }),
      initDB(),
      registerPeriodicSync(),
      registerPushNotifications()
    ]).then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('تم حذف الكاش القديم:', cacheName);
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

  const url = new URL(event.request.url);
  const strategy = getCacheStrategy(url.pathname);

  event.respondWith(
    (async () => {
      switch (strategy) {
        case CACHE_STRATEGIES.STATIC:
          return cacheFirst(event.request);
        case CACHE_STRATEGIES.DYNAMIC:
          return networkFirst(event.request);
        case CACHE_STRATEGIES.ESSENTIAL:
          return cacheOnly(event.request);
        default:
          return networkFirst(event.request);
      }
    })()
  );
});

// معالجة Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(processSyncQueue());
  }
});

// معالجة Periodic Background Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-sync') {
    event.waitUntil(
      (async () => {
        try {
          // التحقق من التحديثات
          const hasUpdates = await checkForUpdates();
          
          if (hasUpdates) {
            // إرسال إشعار للمستخدم
            await self.registration.showNotification('منصة رفق', {
              body: 'تم تحديث التطبيق بنجاح',
              icon: 'logo-any.png',
              badge: 'logo-any.png',
              vibrate: [100, 50, 100]
            });
          }
          
          // تحديث الموارد
          await updateResources();
          
          // معالجة قائمة المزامنة
          await processSyncQueue();
        } catch (error) {
          console.error('فشل التحديث التلقائي:', error);
        }
      })()
    );
  }
});

// تسجيل Periodic Sync
async function registerPeriodicSync() {
  try {
    const registration = await self.registration;
    if ('periodicSync' in registration) {
      await registration.periodicSync.register('periodic-sync', {
        minInterval: PERIODIC_SYNC_SETTINGS.PERIOD
      });
      console.log('تم تسجيل التحديث التلقائي بنجاح');
    }
  } catch (error) {
    console.error('فشل تسجيل التحديث التلقائي:', error);
  }
} 