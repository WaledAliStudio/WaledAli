// Main JavaScript for منصة رفق PWA

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('تم تسجيل Service Worker بنجاح:', registration.scope);
      })
      .catch(error => {
        console.error('فشل تسجيل Service Worker:', error);
      });
  });
}

// Loading Screen Animation
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  // Hide loading screen after page loads
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 1500); // Show loading screen for at least 1.5 seconds

  // Initialize AOS animations
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }

  // Initialize counter animations
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const step = target / (duration / 16); // 60fps
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.ceil(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    // Start counter animation when element is in viewport
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateCounter();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(counter);
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMobileMenu = document.getElementById('close-mobile-menu');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

  function openMobileMenu() {
    mobileMenu.classList.add('translate-x-0');
    mobileMenu.classList.remove('translate-x-full');
    mobileMenuOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('translate-x-0');
    mobileMenu.classList.add('translate-x-full');
    setTimeout(() => {
      mobileMenuOverlay.classList.add('hidden');
    }, 300);
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
  }

  if (closeMobileMenu && mobileMenu) {
    closeMobileMenu.addEventListener('click', closeMobileMenu);
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close menu when clicking on links
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Mobile Works Submenu - Always visible
  document.addEventListener('DOMContentLoaded', function() {
    const mobileWorksMenuBtns = document.querySelectorAll('.relative.mb-6 > div:first-child');

    mobileWorksMenuBtns.forEach(btn => {
      if (btn) {
        const submenu = btn.nextElementSibling;
        if (submenu && submenu.id === 'mobile-works-submenu') {
          // Make sure the arrow is rotated to indicate the menu is open
          const arrowIcon = btn.querySelector('svg');
          if (arrowIcon) {
            arrowIcon.classList.add('rotate-180');
          }

          // Make sure submenu is always visible
          submenu.style.display = 'block';
          submenu.style.maxHeight = 'none';
          submenu.style.opacity = '1';
          submenu.style.visibility = 'visible';
        }
      }
    });
  });

  // Desktop Works Submenu Hover Effect
  const worksMenuBtn = document.getElementById('works-menu-btn');
  if (worksMenuBtn) {
    const submenu = worksMenuBtn.nextElementSibling;
    if (submenu) {
      // Make sure submenu is visible on hover
      worksMenuBtn.addEventListener('mouseenter', () => {
        submenu.style.visibility = 'visible';
      });

      // Handle parent group hover
      const menuGroup = worksMenuBtn.closest('.group');
      if (menuGroup) {
        menuGroup.addEventListener('mouseenter', () => {
          submenu.style.visibility = 'visible';
        });

        menuGroup.addEventListener('mouseleave', () => {
          setTimeout(() => {
            if (!menuGroup.matches(':hover')) {
              submenu.style.visibility = 'visible';
            }
          }, 100);
        });
      }
    }
  }

  // Dark Mode Toggle
  const darkModeHandler = {
    init() {
      // Get all theme toggle buttons (there might be multiple in the page)
      const themeToggles = document.querySelectorAll('#theme-toggle');
      const htmlElement = document.documentElement;

      // Check for saved theme preference or use preferred color scheme
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Function to update all theme toggle buttons
      const updateThemeButtons = (isDark) => {
        const icon = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-adjust"></i>';

        themeToggles.forEach(toggle => {
          if (toggle) {
            toggle.innerHTML = icon;
          }
        });

        console.log(`Theme icons updated to ${isDark ? 'sun' : 'adjust'}`);
      };

      // Function to toggle theme
      const toggleTheme = () => {
        console.log('Theme toggle clicked');
        const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        updateThemeButtons(newTheme === 'dark');
      };

      // Set initial theme
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeButtons(true);
      } else {
        htmlElement.setAttribute('data-theme', 'light');
        updateThemeButtons(false);
      }

      // Setup theme toggle buttons
      themeToggles.forEach(toggle => {
        if (toggle) {
          // Remove any previous event listeners to avoid duplicates
          const newToggle = toggle.cloneNode(true);
          toggle.parentNode.replaceChild(newToggle, toggle);

          // Add click event listener
          newToggle.addEventListener('click', toggleTheme);

          // Make sure the button is visible and clickable
          newToggle.style.pointerEvents = 'auto';
          newToggle.style.cursor = 'pointer';
        }
      });

      // Add direct event listener to document for theme toggle buttons
      document.addEventListener('click', function(e) {
        if (e.target && (e.target.id === 'theme-toggle' || e.target.closest('#theme-toggle'))) {
          console.log('Theme toggle clicked via document event listener');
          toggleTheme();
        }
      });
    }
  };

  // Initialize dark mode handler
  darkModeHandler.init();

  // PWA Installation
  const pwaInstallHandler = {
    deferredPrompt: null,

    init() {
      console.log('Initializing PWA installation handler');

      // Get all install buttons
      const androidInstallBtn = document.getElementById('android-install-btn');
      const iosInstallBtn = document.getElementById('ios-install-btn');
      const desktopInstallBtn = document.getElementById('desktop-install-btn');

      // Check if running as installed PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                   window.navigator.standalone ||
                   document.referrer.includes('android-app://');

      console.log(`Running as PWA: ${isPWA}`);

      // Device detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = isMobile && !isIOS;
      const isSmartphone = /iPhone|Android.*Mobile/i.test(navigator.userAgent);
      const isTablet = isMobile && !isSmartphone;
      const isSmartTV = /smart-tv|SmartTV|SMART-TV|smarttv/i.test(navigator.userAgent);
      const isDesktop = !isMobile || isSmartTV;

      console.log(`Device detection: Mobile: ${isMobile}, Smartphone: ${isSmartphone}, Tablet: ${isTablet}, iOS: ${isIOS}, Android: ${isAndroid}, Smart TV: ${isSmartTV}, Desktop: ${isDesktop}`);

      // If running as PWA, make sure all install buttons are hidden
      if (isPWA) {
        console.log('Running as PWA, hiding all install buttons');
        this.hideAllInstallButtons(androidInstallBtn, iosInstallBtn, desktopInstallBtn);
        return; // Exit early, no need to setup install buttons in PWA mode
      }

      // Setup initial button visibility based on device type
      this.setupInitialButtonVisibility(androidInstallBtn, iosInstallBtn, desktopInstallBtn, isSmartphone, isIOS, isAndroid, isDesktop, isSmartTV);

      // Listen for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        console.log('beforeinstallprompt event fired');

        // Stash the event so it can be triggered later
        this.deferredPrompt = e;

        // Update button visibility based on device and prompt availability
        this.updateButtonVisibility(androidInstallBtn, desktopInstallBtn, isSmartphone, isAndroid, isDesktop, isSmartTV);
      });

      // Hide buttons when app is installed
      window.addEventListener('appinstalled', (evt) => {
        console.log('App was installed');
        this.hideAllInstallButtons(androidInstallBtn, iosInstallBtn, desktopInstallBtn);
      });

      // Setup button event listeners
      this.setupAndroidInstallButton(androidInstallBtn, isAndroid);
      this.setupIOSInstallButton(iosInstallBtn, isIOS);
      this.setupDesktopInstallButton(desktopInstallBtn, isDesktop, isSmartTV, isSmartphone);
    },

    // Helper method to hide all install buttons
    hideAllInstallButtons(androidInstallBtn, iosInstallBtn, desktopInstallBtn) {
      if (androidInstallBtn) androidInstallBtn.style.display = 'none';
      if (iosInstallBtn) iosInstallBtn.style.display = 'none';
      if (desktopInstallBtn) desktopInstallBtn.style.display = 'none';
    },

    // Setup initial button visibility based on device type
    setupInitialButtonVisibility(androidInstallBtn, iosInstallBtn, desktopInstallBtn, isSmartphone, isIOS, isAndroid, isDesktop, isSmartTV) {
      // Setup iOS button visibility - show only on iOS devices
      if (iosInstallBtn) {
        iosInstallBtn.style.display = isIOS ? 'flex' : 'none';
        console.log(`iOS button visibility set to ${isIOS ? 'visible' : 'hidden'}`);
      }

      // Setup Android button visibility - show only on Android devices
      if (androidInstallBtn) {
        androidInstallBtn.style.display = isAndroid ? 'flex' : 'none';
        console.log(`Android button visibility set to ${isAndroid ? 'visible' : 'hidden'}`);
      }

      // Setup Desktop button visibility - show on desktop/TV, hide on smartphones
      if (desktopInstallBtn) {
        const shouldShowDesktopBtn = (isDesktop || isSmartTV) && !isSmartphone;
        desktopInstallBtn.style.display = shouldShowDesktopBtn ? 'flex' : 'none';
        console.log(`Desktop button visibility set to ${shouldShowDesktopBtn ? 'visible' : 'hidden'}`);
      }
    },

    // Update button visibility when install prompt is available
    updateButtonVisibility(androidInstallBtn, desktopInstallBtn, isSmartphone, isAndroid, isDesktop, isSmartTV) {
      // Show Android button if on Android device and prompt is available
      if (androidInstallBtn && isAndroid) {
        androidInstallBtn.style.display = 'flex';
        console.log('Install prompt available, showing Android install button');
      }

      // Show Desktop button if on desktop/TV and prompt is available
      if (desktopInstallBtn && (isDesktop || isSmartTV) && !isSmartphone) {
        desktopInstallBtn.style.display = 'flex';
        console.log('Install prompt available, showing desktop install button');
      }
    },

    // Setup Android installation button
    setupAndroidInstallButton(androidInstallBtn, isAndroid) {
      if (!androidInstallBtn || !isAndroid) return;

      console.log('Setting up Android install button');

      // Remove any previous event listeners to avoid duplicates
      const newAndroidBtn = androidInstallBtn.cloneNode(true);
      androidInstallBtn.parentNode.replaceChild(newAndroidBtn, androidInstallBtn);

      // Add click event listener to the Android install button
      newAndroidBtn.addEventListener('click', async () => {
        console.log('Android install button clicked');
        if (this.deferredPrompt) {
          console.log('Install prompt available, showing it for Android');
          this.deferredPrompt.prompt();

          try {
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

            if (outcome === 'accepted') {
              newAndroidBtn.style.display = 'none';
            }
          } catch (error) {
            console.error('Error with install prompt:', error);
          }

          this.deferredPrompt = null;
        } else {
          console.log('No install prompt available, showing manual instructions for Android');
          alert('طريقة تثبيت التطبيق على أندرويد:\n1. افتح الموقع من متصفح Google Chrome.\n2. اضغط على زر القائمة (⋮) في أعلى المتصفح.\n3. اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق".');
        }
      });
    },

    // Setup iOS installation button
    setupIOSInstallButton(iosInstallBtn, isIOS) {
      if (!iosInstallBtn || !isIOS) return;

      console.log('Setting up iOS install button');

      // Remove any previous event listeners to avoid duplicates
      const newIOSBtn = iosInstallBtn.cloneNode(true);
      iosInstallBtn.parentNode.replaceChild(newIOSBtn, iosInstallBtn);

      // Add click event listener to the iOS install button
      newIOSBtn.addEventListener('click', () => {
        console.log('iOS install button clicked');
        alert('لتثبيت التطبيق على iOS:\n1. اضغط على زر المشاركة (Share) أسفل المتصفح\n2. قم بالتمرير للأسفل واضغط على "إضافة إلى الشاشة الرئيسية"');
      });
    },

    // Setup Desktop and Smart TV installation button
    setupDesktopInstallButton(desktopInstallBtn, isDesktop, isSmartTV, isSmartphone) {
      if (!desktopInstallBtn || (!isDesktop && !isSmartTV) || isSmartphone) return;

      console.log('Setting up desktop and Smart TV install button');

      // Remove any previous event listeners to avoid duplicates
      const newDesktopBtn = desktopInstallBtn.cloneNode(true);
      desktopInstallBtn.parentNode.replaceChild(newDesktopBtn, desktopInstallBtn);

      // Add click event listener to the desktop install button
      newDesktopBtn.addEventListener('click', async () => {
        console.log('Desktop install button clicked');
        if (this.deferredPrompt) {
          console.log('Install prompt available, showing it for desktop/Smart TV');
          this.deferredPrompt.prompt();

          try {
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

            if (outcome === 'accepted') {
              newDesktopBtn.style.display = 'none';
            }
          } catch (error) {
            console.error('Error with install prompt:', error);
          }

          this.deferredPrompt = null;
        } else {
          console.log('No install prompt available, showing manual instructions for desktop/Smart TV');
          if (isSmartTV) {
            alert('طريقة تثبيت التطبيق على التلفزيون الذكي:\n1. افتح الموقع من متصفح التلفزيون.\n2. اضغط على زر القائمة أو الإعدادات.\n3. اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
          } else {
            alert('طريقة تثبيت التطبيق على الكمبيوتر:\n1. افتح الموقع من متصفح Chrome أو Edge.\n2. اضغط على القائمة ⋮ أو أيقونة + في شريط العنوان.\n3. اختر "تثبيت الموقع كتطبيق".');
          }
        }
      });
    }
  };

  // Digital Products Filter Handler
  const digitalProductsHandler = {
    init() {
      // Filter functionality
      const filterBtns = document.querySelectorAll('.filter-btn');
      const productCards = document.querySelectorAll('.digital-product-card');

      if (filterBtns.length > 0 && productCards.length > 0) {
        console.log('Initializing digital products filter');

        filterBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active', 'bg-blue-600', 'text-white'));
            filterBtns.forEach(b => b.classList.add('bg-gray-200', 'text-gray-700'));

            // Add active class to clicked button
            btn.classList.add('active', 'bg-blue-600', 'text-white');
            btn.classList.remove('bg-gray-200', 'text-gray-700');

            const filter = btn.getAttribute('data-filter');
            console.log(`Filtering products by: ${filter}`);

            // Show/hide products based on filter
            productCards.forEach(card => {
              if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
              } else {
                card.style.display = 'none';
              }
            });
          });
        });

        // Load more functionality (simulated)
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', function() {
            // Show loading state
            this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> جاري التحميل...';

            // Simulate loading delay
            setTimeout(() => {
              // Reset button text
              this.innerHTML = 'عرض المزيد من التطبيقات <i class="fas fa-chevron-down mr-2"></i>';

              // Show message that all products are loaded
              alert('تم عرض جميع التطبيقات المتاحة حالياً');
            }, 1500);
          });
        }
      }
    }
  };

  // Initialize PWA installation handler
  pwaInstallHandler.init();

  // Initialize Digital Products Filter
  digitalProductsHandler.init();
});
