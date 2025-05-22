// متغيرات عامة
let deferredPrompt;
let installButton;
let androidInstallButton;
let iosInstallButton;

// تهيئة أزرار التثبيت
function initInstallButtons() {
    // زر تثبيت الكمبيوتر والتلفزيون
    installButton = document.getElementById('desktop-install-btn');
    // زر تثبيت الأندرويد
    androidInstallButton = document.getElementById('android-install-btn');
    // زر تثبيت iOS
    iosInstallButton = document.getElementById('ios-install-btn');

    // إضافة مستمعي الأحداث
    if (installButton) {
        installButton.addEventListener('click', installPWA);
    }
    if (androidInstallButton) {
        androidInstallButton.addEventListener('click', installPWA);
    }
    if (iosInstallButton) {
        iosInstallButton.addEventListener('click', showIOSInstallInstructions);
    }
}

// معالجة حدث beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    // منع ظهور نافذة التثبيت التلقائية
    e.preventDefault();
    // تخزين الحدث للاستخدام لاحقاً
    deferredPrompt = e;
    // إظهار أزرار التثبيت
    showInstallButtons();
});

// إظهار أزرار التثبيت
function showInstallButtons() {
    if (installButton) {
        installButton.style.display = 'flex';
    }
    if (androidInstallButton) {
        androidInstallButton.style.display = 'flex';
    }
}

// تثبيت التطبيق
async function installPWA() {
    if (!deferredPrompt) {
        alert('عذراً، لا يمكن تثبيت التطبيق حالياً. يرجى المحاولة لاحقاً.');
        return;
    }

    try {
        // إظهار نافذة التثبيت
        deferredPrompt.prompt();
        // انتظار اختيار المستخدم
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('تم تثبيت التطبيق بنجاح');
        } else {
            console.log('تم رفض تثبيت التطبيق');
        }
    } catch (error) {
        console.error('حدث خطأ أثناء تثبيت التطبيق:', error);
    }

    // إعادة تعيين المتغير
    deferredPrompt = null;
    // إخفاء أزرار التثبيت
    hideInstallButtons();
}

// إخفاء أزرار التثبيت
function hideInstallButtons() {
    if (installButton) {
        installButton.style.display = 'none';
    }
    if (androidInstallButton) {
        androidInstallButton.style.display = 'none';
    }
}

// إظهار تعليمات تثبيت iOS
function showIOSInstallInstructions() {
    const instructions = `
        لتثبيت التطبيق على جهاز iOS:
        1. افتح الموقع في متصفح Safari
        2. اضغط على زر المشاركة (Share)
        3. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)
        4. اضغط على "إضافة" (Add)
    `;
    alert(instructions);
}

// التحقق من نوع الجهاز
function checkDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = userAgent.includes('android');
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    if (isAndroid) {
        if (androidInstallButton) {
            androidInstallButton.style.display = 'flex';
        }
        if (installButton) {
            installButton.style.display = 'none';
        }
    } else if (isIOS) {
        if (iosInstallButton) {
            iosInstallButton.style.display = 'flex';
        }
        if (installButton) {
            installButton.style.display = 'none';
        }
    } else {
        if (installButton) {
            installButton.style.display = 'flex';
        }
    }
}

// تهيئة التطبيق عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    initInstallButtons();
    checkDeviceType();
}); 