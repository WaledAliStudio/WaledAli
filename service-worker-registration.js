// تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        }).then(registration => {
            console.log('تم تسجيل Service Worker بنجاح:', registration.scope);
            
            // التحقق من وجود تحديثات
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('تم العثور على تحديث جديد');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('تم تثبيت التحديث الجديد');
                        // هنا يمكنك إضافة كود لإظهار إشعار للمستخدم بوجود تحديث جديد
                    }
                });
            });
        }).catch(error => {
            console.error('فشل تسجيل Service Worker:', error);
        });

        // مراقبة حالة الاتصال
        window.addEventListener('online', () => {
            console.log('تم استعادة الاتصال بالإنترنت');
            // إعادة تحميل الصفحة عند استعادة الاتصال
            window.location.reload();
        });

        window.addEventListener('offline', () => {
            console.log('تم فقدان الاتصال بالإنترنت');
        });
    });
} 