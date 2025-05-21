// Main JavaScript for وليد علي استديو PWA

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
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
                   (window.navigator.standalone) ||
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

      // If running as PWA, hide all install buttons
      if (isPWA) {
        console.log('Running as PWA, hiding all install buttons');
        if (androidInstallBtn) androidInstallBtn.style.display = 'none';
        if (iosInstallBtn) iosInstallBtn.style.display = 'none';
        if (desktopInstallBtn) desktopInstallBtn.style.display = 'none';
        return; // Exit early, no need to setup install buttons in PWA mode
      }

      // Initial button visibility setup for browser mode
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
        if (androidInstallBtn) androidInstallBtn.style.display = 'none';
        if (iosInstallBtn) iosInstallBtn.style.display = 'none';
        if (desktopInstallBtn) desktopInstallBtn.style.display = 'none';
      });

      // Setup Android installation
      this.setupAndroidInstallButton(androidInstallBtn, isAndroid);

      // Setup iOS installation guide
      this.setupIOSInstallButton(iosInstallBtn, isIOS);

      // Setup Desktop and Smart TV installation
      this.setupDesktopInstallButton(desktopInstallBtn, isDesktop, isSmartTV, isSmartphone);
    },

    setupInitialButtonVisibility(androidInstallBtn, iosInstallBtn, desktopInstallBtn, isSmartphone, isIOS, isAndroid, isDesktop, isSmartTV) {
      // Setup iOS button visibility - always show on iOS devices
      if (iosInstallBtn) {
        console.log('iOS button found, setting visibility');
        if (isIOS) {
          console.log('iOS device detected, showing iOS install button');
          iosInstallBtn.style.display = 'flex';
        } else {
          console.log('Not an iOS device, hiding iOS install button');
          iosInstallBtn.style.display = 'none';
        }
      } else {
        console.log('iOS button not found in the DOM');
      }

      // Setup Android button visibility - show on Android devices
      if (androidInstallBtn) {
        console.log('Android button found, setting visibility');
        if (isAndroid) {
          console.log('Android device detected, showing Android install button');
          androidInstallBtn.style.display = 'flex';
        } else {
          console.log('Not an Android device, hiding Android install button');
          androidInstallBtn.style.display = 'none';
        }
      } else {
        console.log('Android button not found in the DOM');
      }

      // Setup Desktop button visibility - show on desktop/TV, hide on smartphones
      if (desktopInstallBtn) {
        console.log('Desktop button found, setting visibility');
        if ((isDesktop || isSmartTV) && !isSmartphone) {
          console.log('Desktop or Smart TV detected, showing install button');
          desktopInstallBtn.style.display = 'flex';
        } else {
          console.log('Not a desktop or Smart TV, hiding install button');
          desktopInstallBtn.style.display = 'none';
        }
      } else {
        console.log('Desktop button not found in the DOM');
      }
    },

    updateButtonVisibility(androidInstallBtn, desktopInstallBtn, isSmartphone, isAndroid, isDesktop, isSmartTV) {
      // Show Android button if on Android device and prompt is available
      if (androidInstallBtn && isAndroid && !isSmartTV) {
        console.log('Android device detected, showing Android install button');
        androidInstallBtn.style.display = 'flex';
      }

      // Show Desktop button if on desktop/TV and prompt is available
      if (desktopInstallBtn && (isDesktop || isSmartTV) && !isSmartphone) {
        console.log('Desktop or Smart TV detected, showing desktop install button');
        desktopInstallBtn.style.display = 'flex';
      }
    },

    setupAndroidInstallButton(androidInstallBtn, isAndroid) {
      if (!androidInstallBtn) {
        console.log('Android install button not found in the DOM');
        return;
      }

      if (!isAndroid) {
        console.log('Not an Android device, skipping Android button setup');
        return;
      }

      console.log('Setting up Android install button');

      // Remove any previous event listeners to avoid duplicates
      const newAndroidBtn = androidInstallBtn.cloneNode(true);
      androidInstallBtn.parentNode.replaceChild(newAndroidBtn, androidInstallBtn);

      // Make sure the button is visible on Android devices
      newAndroidBtn.style.display = 'flex';

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

    setupIOSInstallButton(iosInstallBtn, isIOS) {
      if (!iosInstallBtn) {
        console.log('iOS install button not found in the DOM');
        return;
      }

      console.log('Setting up iOS install button');

      // Remove any previous event listeners to avoid duplicates
      const newIOSBtn = iosInstallBtn.cloneNode(true);
      iosInstallBtn.parentNode.replaceChild(newIOSBtn, iosInstallBtn);

      // Always show iOS button in mobile menu for iOS devices
      newIOSBtn.style.display = isIOS ? 'flex' : 'none';

      // Add click event listener to the iOS install button
      newIOSBtn.addEventListener('click', () => {
        console.log('iOS install button clicked');
        alert('لتثبيت التطبيق على iOS:\n1. اضغط على زر المشاركة (Share) أسفل المتصفح\n2. قم بالتمرير للأسفل واضغط على "إضافة إلى الشاشة الرئيسية"');
      });
    },

    setupPWAButtons(androidInstallBtn, iosInstallBtn, desktopInstallBtn, isIOS, isAndroid) {
      console.log('Setting up PWA-specific buttons');

      // Find the mobile menu container where we'll add our PWA buttons
      const mobileMenuContainer = document.querySelector('.mt-4.pt-4.border-t.border-gray-200');

      if (!mobileMenuContainer) {
        console.log('Mobile menu container not found, cannot add PWA buttons');
        return;
      }

      // Clear existing install buttons
      if (androidInstallBtn) androidInstallBtn.style.display = 'none';
      if (iosInstallBtn) iosInstallBtn.style.display = 'none';
      if (desktopInstallBtn) desktopInstallBtn.style.display = 'none';

      // Create a new container for PWA buttons
      const pwaButtonsContainer = document.createElement('div');
      pwaButtonsContainer.className = 'space-y-3 mt-4';

      // Add a heading
      const heading = document.createElement('h3');
      heading.className = 'text-lg font-bold text-gray-800 mb-3 text-center';
      heading.textContent = 'خيارات التطبيق';

      // Create share button
      const shareButton = document.createElement('button');
      shareButton.className = 'w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition duration-300 cursor-pointer';
      shareButton.innerHTML = '<i class="fas fa-share-alt text-xl"></i><span>مشاركة التطبيق</span>';
      shareButton.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: 'منصة وليد علي',
            text: 'تطبيق منصة وليد علي للتصميم والتسويق الرقمي',
            url: window.location.href
          })
          .then(() => console.log('Shared successfully'))
          .catch((error) => console.log('Error sharing:', error));
        } else {
          alert('مشاركة التطبيق: انسخ هذا الرابط ومشاركته مع أصدقائك\n' + window.location.href);
        }
      });

      // Create refresh button
      const refreshButton = document.createElement('button');
      refreshButton.className = 'w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition duration-300 cursor-pointer';
      refreshButton.innerHTML = '<i class="fas fa-sync-alt text-xl"></i><span>تحديث التطبيق</span>';
      refreshButton.addEventListener('click', () => {
        window.location.reload();
      });

      // Add buttons to container
      pwaButtonsContainer.appendChild(heading);
      pwaButtonsContainer.appendChild(shareButton);
      pwaButtonsContainer.appendChild(refreshButton);

      // Replace the existing buttons container with our new one
      if (mobileMenuContainer.querySelector('.space-y-3')) {
        mobileMenuContainer.replaceChild(pwaButtonsContainer, mobileMenuContainer.querySelector('.space-y-3'));
      } else {
        mobileMenuContainer.appendChild(pwaButtonsContainer);
      }

      console.log('PWA buttons added successfully');
    },

    setupDesktopInstallButton(desktopInstallBtn, isDesktop, isSmartTV, isSmartphone) {
      if (!desktopInstallBtn) {
        console.log('Desktop install button not found in the DOM');
        return;
      }

      console.log('Setting up desktop and Smart TV install button');

      // Remove any previous event listeners to avoid duplicates
      const newDesktopBtn = desktopInstallBtn.cloneNode(true);
      desktopInstallBtn.parentNode.replaceChild(newDesktopBtn, desktopInstallBtn);

      // Show button only on desktop and Smart TV, hide on smartphones
      if ((isDesktop || isSmartTV) && !isSmartphone) {
        console.log('Desktop or Smart TV detected, showing install button');
        newDesktopBtn.style.display = 'flex';
      } else {
        console.log('Not a desktop or Smart TV, hiding install button');
        newDesktopBtn.style.display = 'none';
      }

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
