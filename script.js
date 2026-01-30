// Global variables
let currentLanguage = 'en';
let currentTheme = 'default';
let currentCategory = 'all';
let isDarkMode = false;
let postEmbedFixer = null; // PostEmbedFixer instance

// ===== BUTTON VISIBILITY FIX FOR MOBILE =====
// Ensure contact buttons are always visible and clickable on all devices
function ensureButtonsVisible() {
    const buttons = document.querySelectorAll('.contact-buttons');
    buttons.forEach(buttonContainer => {
        // Force visibility with inline styles (highest priority)
        buttonContainer.style.cssText = `
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            z-index: 9999 !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            background: linear-gradient(to top, rgba(255,255,255,0.98), rgba(255,255,255,0.95)) !important;
            padding: 12px 15px !important;
            padding-bottom: calc(12px + env(safe-area-inset-bottom)) !important;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.15) !important;
            gap: 10px !important;
            flex-wrap: wrap !important;
            border-radius: 0 !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
        `;
        
        // Ensure all child buttons are clickable and preserve their colors
        const pills = buttonContainer.querySelectorAll('.btn-contact-pill');
        pills.forEach(pill => {
            // Get the original background color from the style attribute
            const originalStyle = pill.getAttribute('style') || '';
            const bgMatch = originalStyle.match(/background:\s*([^;]+)/i);
            const bgColor = bgMatch ? bgMatch[1].trim() : '#ff6a00';
            
            // Set only visibility and layout properties, preserve background
            pill.style.pointerEvents = 'auto';
            pill.style.visibility = 'visible';
            pill.style.opacity = '1';
            pill.style.zIndex = '10000';
            pill.style.display = 'flex';
            pill.style.flex = '1';
            pill.style.minWidth = '100px';
            pill.style.cursor = 'pointer';
            
            // Restore the background color
            pill.style.background = bgColor;
        });
    });
}

// Watch for modal changes and ensure buttons stay visible
const buttonVisibilityObserver = new MutationObserver(() => {
    // Debounce to avoid excessive calls
    clearTimeout(window.buttonVisibilityTimeout);
    window.buttonVisibilityTimeout = setTimeout(() => {
        ensureButtonsVisible();
    }, 50);
});

// Additional aggressive fix - check every 500ms
let buttonCheckInterval = null;
function startButtonVisibilityCheck() {
    if (buttonCheckInterval) clearInterval(buttonCheckInterval);
    buttonCheckInterval = setInterval(() => {
        const modal = document.getElementById('productModal');
        if (modal && modal.style.display === 'block') {
            ensureButtonsVisible();
        }
    }, 500);
}

function stopButtonVisibilityCheck() {
    if (buttonCheckInterval) {
        clearInterval(buttonCheckInterval);
        buttonCheckInterval = null;
    }
}

// Global variable to track currently playing video
let currentPlayingVideo = null;
let videoObserver = null;

// Function to stop a video by reloading its iframe
function stopVideo(iframe) {
    if (!iframe) return;
    
    const src = iframe.src;
    if (!src) return;
    
    console.log('⏹️ Stopping video:', src.substring(0, 50) + '...');
    
    // Method 1: For YouTube - use API command
    if (src.includes('youtube.com')) {
        try {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } catch (e) {
            // Fallback: reload iframe
            iframe.src = src.replace('autoplay=1', 'autoplay=0');
        }
    }
    // Method 2: For Facebook - reload iframe
    else if (src.includes('facebook.com')) {
        const tempSrc = iframe.src;
        iframe.src = 'about:blank';
        setTimeout(() => {
            iframe.src = tempSrc;
        }, 50);
    }
    // Method 3: For other platforms - reload iframe
    else {
        const tempSrc = iframe.src;
        iframe.src = 'about:blank';
        setTimeout(() => {
            iframe.src = tempSrc;
        }, 50);
    }
}

// Function to pause all videos except the current one
function pauseAllVideosExcept(currentIframe) {
    console.log('🔄 Pausing all videos except current one...');
    
    // Get all video iframes in events and posts
    const allVideoIframes = document.querySelectorAll('.event-video-square iframe, .event-video-landscape iframe, .event-video-portrait iframe, .event-video-vertical iframe, .post-video-square iframe, .post-video-landscape iframe, .post-video-portrait iframe, .post-video-vertical iframe');
    
    let stoppedCount = 0;
    allVideoIframes.forEach(iframe => {
        if (iframe !== currentIframe) {
            stopVideo(iframe);
            stoppedCount++;
        }
    });
    
    console.log('✅ Stopped', stoppedCount, 'videos');
}

// Use Intersection Observer to detect when videos become visible/start playing
function initVideoPlayControl() {
    console.log('🎬 Initializing video play control...');
    
    // Clean up existing observer
    if (videoObserver) {
        videoObserver.disconnect();
    }
    
    // Get all video containers
    const videoContainers = document.querySelectorAll('.event-video-square, .event-video-landscape, .event-video-portrait, .event-video-vertical, .post-video-square, .post-video-landscape, .post-video-portrait, .post-video-vertical');
    
    console.log('📹 Found', videoContainers.length, 'video containers');
    
    // Add click listeners to each video container
    videoContainers.forEach((container, index) => {
        const iframe = container.querySelector('iframe');
        if (iframe && !iframe.hasAttribute('data-video-listener-added')) {
            iframe.setAttribute('data-video-listener-added', 'true');
            
            // Method 1: Listen for clicks on the container
            container.addEventListener('click', function(e) {
                console.log('🎯 Video container clicked:', index);
                setTimeout(() => {
                    if (currentPlayingVideo !== iframe) {
                        pauseAllVideosExcept(iframe);
                        currentPlayingVideo = iframe;
                    }
                }, 300); // Delay to let video start
            }, true); // Use capture phase
            
            // Method 2: Listen for mousedown (catches clicks before iframe)
            container.addEventListener('mousedown', function(e) {
                console.log('🖱️ Mouse down on video:', index);
                setTimeout(() => {
                    if (currentPlayingVideo !== iframe) {
                        pauseAllVideosExcept(iframe);
                        currentPlayingVideo = iframe;
                    }
                }, 300);
            }, true);
            
            // Method 3: Listen for touchstart (mobile)
            container.addEventListener('touchstart', function(e) {
                console.log('👆 Touch on video:', index);
                setTimeout(() => {
                    if (currentPlayingVideo !== iframe) {
                        pauseAllVideosExcept(iframe);
                        currentPlayingVideo = iframe;
                    }
                }, 300);
            }, true);
            
            console.log('✅ Added listeners to video', index);
        }
    });
    
    // Method 4: Use Intersection Observer to detect when videos are in view
    videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target.querySelector('iframe');
                if (iframe) {
                    // When a video comes into view and might be playing
                    setTimeout(() => {
                        // Check if this is a different video than current
                        if (currentPlayingVideo && currentPlayingVideo !== iframe) {
                            // A new video might be playing, pause the old one
                            console.log('👁️ New video in view, checking...');
                        }
                    }, 500);
                }
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% visible
    });
    
    videoContainers.forEach(container => {
        videoObserver.observe(container);
    });
    
    console.log('✅ Video play control initialized');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Hide loading screen after all content is loaded
    const hideLoadingScreen = () => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            // Remove from DOM after animation completes
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
    };
    
    await loadConfigFromStorage();
    
    // Debug: Check banner data
    console.log('=== BANNER DEBUG ===');
    console.log('CONFIG object:', CONFIG);
    console.log('CONFIG.banners:', CONFIG.banners);
    if (CONFIG.banners && CONFIG.banners.length > 0) {
        console.log('First banner:', CONFIG.banners[0]);
        console.log('Total banners:', CONFIG.banners.length);
        CONFIG.banners.forEach((banner, index) => {
            console.log(`Banner ${index + 1}:`, {
                id: banner.id,
                enabled: banner.enabled,
                hasImage: !!(banner.image || banner.mobileImage || banner.desktopImage)
            });
        });
    }
    console.log('==================');
    
    loadTheme();
    loadDarkMode();
    loadNavigationStyle();
    loadLogo();
    loadSiteSettings(); // Load site title, favicon, and meta tags
    initializeLanguage(); // Initialize language system first
    initBannerSlider();
    loadPromotions();
    loadEvents();
    
    // Initialize PostEmbedFixer with the convertToEmbedUrl function
    if (typeof PostEmbedFixer !== 'undefined') {
        postEmbedFixer = new PostEmbedFixer(convertToEmbedUrl);
    }
    
    loadPosts('all');
    loadProblemBanner();
    loadCategories();
    loadProducts();
    loadContactInfo();
    loadAboutUsContent();
    initSectionNavigation();
    
    // Initialize video play control (pause other videos when one plays)
    setTimeout(() => {
        initVideoPlayControl();
    }, 1000);
    
    // Aggressive check: Monitor for multiple videos playing every 2 seconds
    setInterval(() => {
        const allVideoIframes = document.querySelectorAll('.event-video-square iframe, .event-video-landscape iframe, .event-video-portrait iframe, .event-video-vertical iframe, .post-video-square iframe, .post-video-landscape iframe, .post-video-portrait iframe, .post-video-vertical iframe');
        
        // If we have a current playing video, make sure others are stopped
        if (currentPlayingVideo && allVideoIframes.length > 1) {
            allVideoIframes.forEach(iframe => {
                if (iframe !== currentPlayingVideo) {
                    // Check if iframe might be playing (has src and is visible)
                    if (iframe.src && iframe.offsetParent !== null) {
                        // Silently reload to ensure it's stopped
                        const src = iframe.src;
                        if (src.includes('youtube.com') || src.includes('facebook.com')) {
                            stopVideo(iframe);
                        }
                    }
                }
            });
        }
    }, 2000);
    
    // ===== BUTTON VISIBILITY FIX =====
    // Start observing for button visibility
    ensureButtonsVisible();
    buttonVisibilityObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
    
    // Start aggressive button visibility check
    startButtonVisibilityCheck();
    
    // Hide loading screen after all content is loaded
    hideLoadingScreen();
    
    // ===== HANDLE SHARED LINKS =====
    // Check if URL has shared item parameters (like Alibaba)
    checkSharedLink();
    
    // Listen for storage changes from admin panel
    window.addEventListener('storage', function(e) {
        if (e.key === 'websiteConfig' || e.key === 'bannerUpdateTrigger') {
            console.log('🔄 Storage updated, reloading banners...');
            setTimeout(() => {
                loadConfigFromStorage();
                initBannerSlider();
            }, 100);
        }
    });
    
    // Listen for custom banner update events
    window.addEventListener('bannerUpdate', function(e) {
        console.log('🔄 Banner update event received');
        setTimeout(() => {
            loadConfigFromStorage();
            initBannerSlider();
        }, 100);
    });
    
    // Listen for config update events (from admin panel in same window)
    window.addEventListener('configUpdate', function(e) {
        console.log('🔄 Config update event received from admin panel');
        console.log('Updated config:', e.detail.config);
        
        // Don't reload content if a modal is open (user is viewing details)
        const modal = document.getElementById('productModal');
        if (modal && modal.style.display === 'block') {
            console.log('⚠️ Modal is open, skipping content reload to avoid interrupting user');
            return;
        }
        
        setTimeout(() => {
            loadConfigFromStorage();
            initBannerSlider();
            loadProducts();
            loadPromotions();
            loadEvents();
            loadCategories();
            loadPosts();
            loadContactInfo();
            loadAboutUsContent();
            console.log('✅ All frontend content reloaded');
        }, 100);
    });
    
    // Also check for updates every 2 seconds (fallback)
    // DISABLED: This was causing unnecessary refreshes every 2 seconds
    // The configUpdate event listener is sufficient for detecting changes
    /*
    setInterval(function() {
        if (!document.hidden) {
            checkForUpdates();
        }
    }, 2000);
    */
    
    // iOS-specific: Handle visibility changes to restart autoplay
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('📱 Page became visible - checking banner autoplay');
            if (window.bannerSwiper && window.bannerSwiper.autoplay) {
                // Restart autoplay when page becomes visible
                window.bannerSwiper.autoplay.start();
                console.log('▶️ Banner autoplay restarted');
            }
        } else {
            console.log('📱 Page hidden - pausing banner autoplay');
            if (window.bannerSwiper && window.bannerSwiper.autoplay) {
                window.bannerSwiper.autoplay.pause();
                console.log('⏸️ Banner autoplay paused');
            }
        }
    });
    
    // iOS-specific: Handle app resume
    window.addEventListener('pageshow', function(event) {
        console.log('📱 Page shown (pageshow event)');
        if (event.persisted && window.bannerSwiper && window.bannerSwiper.autoplay) {
            window.bannerSwiper.autoplay.start();
            console.log('▶️ Banner autoplay restarted after page restore');
        }
    });
    
    window.addEventListener('pagehide', function(event) {
        console.log('📱 Page hidden (pagehide event)');
        if (window.bannerSwiper && window.bannerSwiper.autoplay) {
            window.bannerSwiper.autoplay.pause();
            console.log('⏸️ Banner autoplay paused');
        }
    });
});

// Check for configuration updates
function checkForUpdates() {
    const savedConfig = localStorage.getItem('websiteConfig');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        const currentConfigStr = JSON.stringify(CONFIG);
        const newConfigStr = JSON.stringify(parsed);
        
        if (currentConfigStr !== newConfigStr) {
            console.log('🔄 Config changed, updating...');
            
            // Don't reload content if a modal is open (user is viewing details)
            const modal = document.getElementById('productModal');
            if (modal && modal.style.display === 'block') {
                console.log('⚠️ Modal is open, skipping content reload to avoid interrupting user');
                return;
            }
            
            // Check if banners changed specifically
            const oldBannerCount = CONFIG.banners ? CONFIG.banners.length : 0;
            const newBannerCount = parsed.banners ? parsed.banners.length : 0;
            const oldBannerStr = JSON.stringify(CONFIG.banners || []);
            const newBannerStr = JSON.stringify(parsed.banners || []);
            
            Object.assign(CONFIG, parsed);
            
            if (oldBannerStr !== newBannerStr) {
                console.log(`📊 Banners changed: ${oldBannerCount} → ${newBannerCount}`);
                console.log('🔄 Reinitializing banner slider...');
                initBannerSlider();
            } else {
                refreshContent();
            }
        }
    }
}

// Refresh all content
function refreshContent() {
    loadNavigationStyle();
    
    const bannerSwiper = document.querySelector('.bannerSwiper')?.swiper;
    if (bannerSwiper) {
        bannerSwiper.destroy();
        document.getElementById('bannerSlides').innerHTML = '';
        initBannerSlider();
    }
    
    document.getElementById('promotionGrid').innerHTML = '';
    loadPromotions();
    
    document.getElementById('eventGrid').innerHTML = '';
    loadEvents();
    
    document.getElementById('postGrid').innerHTML = '';
    loadPosts('all');
    loadProblemBanner();
    
    document.getElementById('categoryFilter').innerHTML = '';
    loadCategories();
    
    loadProducts();
    loadContactInfo();
    loadAboutUsContent();
    
    // Re-initialize section navigation after content refresh (but don't call loadSectionNavigation again)
    loadSectionNavigation();
    initSectionNavigationEvents(); // Separate function for event binding only
}

// Load config from localStorage
function loadConfigFromStorage() {
    try {
        const savedConfig = localStorage.getItem('websiteConfig');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            
            // Deep merge to preserve existing data
            Object.assign(CONFIG, parsed);
            
            console.log('✅ Config loaded from localStorage');
            console.log('📊 Loaded data:');
            console.log('  - Banners:', CONFIG.banners ? CONFIG.banners.length : 0);
            console.log('  - Products:', CONFIG.products ? CONFIG.products.length : 0);
            console.log('  - Posts:', CONFIG.posts ? CONFIG.posts.length : 0);
            console.log('  - Promotions:', CONFIG.promotions ? CONFIG.promotions.length : 0);
            console.log('  - Events:', CONFIG.events ? CONFIG.events.length : 0);
            console.log('  - Categories:', CONFIG.categories ? CONFIG.categories.length : 0);
            console.log('  - Button Icons:', CONFIG.buttonIcons ? 'Loaded' : 'Not set');
            console.log('  - Logo:', CONFIG.logo ? 'Loaded' : 'Not set');
            console.log('  - Contact Info:', CONFIG.contact ? 'Loaded' : 'Not set');
            
            return true;
        } else {
            console.log('⚠️ No saved config found in localStorage');
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading config:', error);
        return false;
    }
}

// Helper function to render button icon (supports emoji, image, or GIF)
function renderButtonIcon(iconValue, position = 'left') {
    if (!iconValue) return '';
    
    const className = position === 'left' ? 'icon-left' : 'icon-right';
    
    // Check if it's a URL or base64 data (image or GIF)
    if (iconValue.startsWith('http') || iconValue.startsWith('data:') || iconValue.includes('.')) {
        const isGif = iconValue.toLowerCase().includes('.gif') || iconValue.includes('data:image/gif');
        if (isGif) {
            return `<video class="${className}" autoplay muted loop playsinline><source src="${iconValue}" type="video/mp4"></video>`;
        } else {
            return `<img class="${className}" src="${iconValue}" alt="icon">`;
        }
    }
    
    // Otherwise treat as emoji
    return `<span class="${className}">${iconValue}</span>`;
}

// Helper function to get button icon config
function getButtonIconConfig(channel) {
    if (!CONFIG.buttonIcons || !CONFIG.buttonIcons[channel]) {
        // Fallback to defaults
        const defaults = {
            phone: { icon: '📞', cartIcon: '🛒' },
            whatsapp: { icon: '💬', cartIcon: '🛒' },
            telegram: { icon: '✈️', cartIcon: '🛒' },
            facebook: { icon: '👍', cartIcon: '🛒' },
            messenger: { icon: '💬', cartIcon: '🛒' }
        };
        return defaults[channel] || { icon: '🔗', cartIcon: '🛒' };
    }
    return CONFIG.buttonIcons[channel];
}

// Share functionality - for product detail modal
function shareCurrentItem() {
    if (!window.currentShareData) return;
    
    const { item, type } = window.currentShareData;
    const currentUrl = window.location.origin + window.location.pathname;
    
    // Create unique share URL with item ID
    const itemId = item.id || encodeURIComponent(item.name || item.title);
    const shareUrl = `${currentUrl}?view=${type}&id=${itemId}`;
    const shareTitle = type === 'product' ? item.name : item.title;
    const shareText = `Check out this ${type}: ${shareTitle}`;
    
    // Show share popup
    showSharePopup(shareUrl, shareTitle, shareText);
}

function showSharePopup(url, title, text) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('sharePopup');
    if (existingPopup) existingPopup.remove();
    
    // Create popup overlay
    const popup = document.createElement('div');
    popup.id = 'sharePopup';
    popup.className = 'share-popup-overlay';
    
    popup.innerHTML = `
        <div class="share-popup-content">
            <div class="share-popup-header">
                <h3 data-en="Share" data-km="ចែករំលែក">${currentLanguage === 'en' ? 'Share' : 'ចែករំលែក'}</h3>
                <button class="share-popup-close" onclick="closeSharePopup()">&times;</button>
            </div>
            <div class="share-popup-buttons">
                <button class="share-btn" onclick="shareToTelegram('${encodeURIComponent(url)}', '${encodeURIComponent(text)}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                    </svg>
                    <span data-en="Telegram" data-km="តេឡេក្រាម">Telegram</span>
                </button>
                <button class="share-btn" onclick="shareToFacebook('${encodeURIComponent(url)}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    <span data-en="Facebook" data-km="ហ្វេសប៊ុក">Facebook</span>
                </button>
                <button class="share-btn" onclick="shareToMessenger('${encodeURIComponent(url)}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.13.12.21.28.22.46l.03 1.43c.01.31.33.53.64.43l1.56-.68c.11-.05.24-.06.36-.03.97.27 2 .42 3.05.42 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm.95 13.06l-2.43-2.58c-.2-.21-.52-.23-.74-.04l-2.2 1.72c-.27.21-.65-.06-.49-.36l2.43-4.56c.11-.21.38-.26.56-.11l2.43 2.58c.2.21.52.23.74.04l2.2-1.72c.27-.21.65.06.49.36l-2.43 4.56c-.11.21-.38.26-.56.11z"/>
                    </svg>
                    <span data-en="Messenger" data-km="មេសេនជឺរ">Messenger</span>
                </button>
                <button class="share-btn" onclick="shareToWhatsApp('${encodeURIComponent(url)}', '${encodeURIComponent(text)}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.188 8.188 0 01-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01z"/>
                    </svg>
                    <span data-en="WhatsApp" data-km="វ៉ាត់សអេប">WhatsApp</span>
                </button>
                <button class="share-btn" onclick="copyShareLink('${url}')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    <span data-en="Copy Link" data-km="ចម្លងតំណ">Copy Link</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Close on overlay click
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closeSharePopup();
        }
    });
}

function closeSharePopup() {
    const popup = document.getElementById('sharePopup');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
}

function shareToTelegram(url, text) {
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
    closeSharePopup();
}

function shareToFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    closeSharePopup();
}

function shareToMessenger(url) {
    window.open(`https://www.facebook.com/dialog/send?link=${url}&app_id=YOUR_APP_ID&redirect_uri=${url}`, '_blank');
    closeSharePopup();
}

function shareToWhatsApp(url, text) {
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    closeSharePopup();
}

function copyShareLink(url) {
    const decodedUrl = decodeURIComponent(url);
    navigator.clipboard.writeText(decodedUrl).then(() => {
        alert(currentLanguage === 'en' ? 'Link copied to clipboard!' : 'បានចម្លងតំណទៅក្តារតម្បៀតខ្ទាស់!');
        closeSharePopup();
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert(currentLanguage === 'en' ? 'Failed to copy link' : 'បរាជ័យក្នុងការចម្លងតំណ');
    });
}

// Check if URL contains shared item parameters and open it automatically
function checkSharedLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewType = urlParams.get('view');
    const itemId = urlParams.get('id');
    
    if (!viewType || !itemId) return;
    
    console.log('🔗 Shared link detected:', viewType, itemId);
    
    // Wait for content to load
    setTimeout(() => {
        if (viewType === 'product') {
            // Find and open product
            const product = CONFIG.products.find(p => 
                (p.id && p.id === itemId) || 
                encodeURIComponent(p.name) === itemId ||
                p.name === decodeURIComponent(itemId)
            );
            if (product) {
                console.log('✅ Opening shared product:', product.name);
                showProductDetail(product);
                // Navigate to products section
                showSection('products');
            } else {
                console.log('❌ Product not found:', itemId);
            }
        } else if (viewType === 'promotion') {
            // Find and open promotion
            const promotion = CONFIG.promotions.find(p => 
                (p.id && p.id === itemId) || 
                encodeURIComponent(p.title) === itemId ||
                p.title === decodeURIComponent(itemId)
            );
            if (promotion) {
                console.log('✅ Opening shared promotion:', promotion.title);
                showPromotionDetail(promotion);
                // Navigate to promotion section
                showSection('promotion');
            } else {
                console.log('❌ Promotion not found:', itemId);
            }
        }
    }, 500); // Wait for data to load
}
function cleanVideoUrl(input) {
    if (!input) return '';
    
    input = input.trim();
    
    // If it's an iframe embed code, extract the src URL
    if (input.includes('<iframe') && input.includes('src=')) {
        const srcMatch = input.match(/src=["']([^"']+)["']/);
        if (srcMatch) {
            return srcMatch[1];
        }
    }
    
    // If it contains HTML entities, decode them
    if (input.includes('&quot;') || input.includes('&lt;') || input.includes('&gt;')) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = input;
        input = textarea.value;
        
        // Try to extract URL again after decoding
        if (input.includes('<iframe') && input.includes('src=')) {
            const srcMatch = input.match(/src=["']([^"']+)["']/);
            if (srcMatch) {
                return srcMatch[1];
            }
        }
    }
    
    return input;
}

// Convert video URL to embed URL - Enhanced to handle iframe codes
function convertToEmbedUrl(url) {
    if (!url) return '';
    
    // Clean the URL first
    url = cleanVideoUrl(url);
    
    // Check if it's already a direct embed URL
    if (url.includes('/embed/') || url.includes('plugins/video')) {
        return url;
    }
    
    try {
        // YouTube - All possible formats
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            
            // Method 1: Standard watch URL
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.match(/[?&]v=([^&]+)/)?.[1];
            }
            // Method 2: Short URL
            else if (url.includes('youtu.be/')) {
                videoId = url.match(/youtu\.be\/([^?&]+)/)?.[1];
            }
            // Method 3: Shorts
            else if (url.includes('youtube.com/shorts/')) {
                videoId = url.match(/shorts\/([^?&]+)/)?.[1];
            }
            // Method 4: Embed URL (extract ID and rebuild)
            else if (url.includes('youtube.com/embed/')) {
                videoId = url.match(/embed\/([^?&]+)/)?.[1];
            }
            
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        
        // Facebook - Multiple formats
        if (url.includes('facebook.com') || url.includes('fb.watch')) {
            // Clean URL for Facebook
            let cleanUrl = url.split('?')[0]; // Remove parameters
            
            // Handle different Facebook URL formats
            if (url.includes('fb.watch/')) {
                return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560&height=315`;
            }
            else if (url.includes('/videos/') || url.includes('/watch') || url.includes('/reel')) {
                return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&width=560&height=315`;
            }
        }
        
        // TikTok - Enhanced detection
        if (url.includes('tiktok.com')) {
            // Multiple TikTok patterns
            let videoId = url.match(/@[^\/]+\/video\/(\d+)/)?.[1] ||
                         url.match(/\/video\/(\d+)/)?.[1] ||
                         url.match(/\/v\/(\d+)/)?.[1];
            
            if (videoId) {
                return `https://www.tiktok.com/embed/v2/${videoId}`;
            }
        }
        
        // Instagram - Posts and Reels
        if (url.includes('instagram.com')) {
            if (url.includes('/p/') || url.includes('/reel/') || url.includes('/tv/')) {
                let cleanUrl = url.split('?')[0];
                if (!cleanUrl.endsWith('/')) cleanUrl += '/';
                return `${cleanUrl}embed/`;
            }
        }
        
        // Vimeo
        if (url.includes('vimeo.com')) {
            let videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
            if (videoId) {
                return `https://player.vimeo.com/video/${videoId}`;
            }
        }
        
        // Dailymotion
        if (url.includes('dailymotion.com')) {
            let videoId = url.match(/\/video\/([^_?]+)/)?.[1];
            if (videoId) {
                return `https://www.dailymotion.com/embed/video/${videoId}`;
            }
        }
        
        // If no conversion possible, return original
        return url;
        
    } catch (error) {
        console.error('Error converting URL:', error);
        return url;
    }
}

// Load Problem Solve Banner
function loadProblemBanner() {
    const banner = document.getElementById('problemBanner');
    if (!banner || !CONFIG.problemSolveBanner) return;
    
    const config = CONFIG.problemSolveBanner;
    
    if (config.enabled && config.image) {
        banner.style.backgroundImage = `url(${config.image})`;
        banner.style.cursor = 'pointer';
        banner.onclick = () => config.link && window.open(config.link, '_blank');
        
        const title = banner.querySelector('h3');
        const description = banner.querySelector('p');
        
        if (title) {
            title.setAttribute('data-en', config.titleEn || '');
            title.setAttribute('data-km', config.titleKm || '');
            title.textContent = currentLanguage === 'en' ? config.titleEn : config.titleKm;
        }
        
        if (description) {
            description.setAttribute('data-en', config.descriptionEn || '');
            description.setAttribute('data-km', config.descriptionKm || '');
            description.textContent = currentLanguage === 'en' ? config.descriptionEn : config.descriptionKm;
        }
        
        banner.style.display = 'block';
    } else {
        banner.style.display = 'none';
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('mode-icon').textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode);
}

function loadDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        document.getElementById('mode-icon').textContent = '☀️';
    }
    
    // Hide dark mode button for Alibaba theme (always hidden now)
    const darkModeBtn = document.getElementById('darkModeBtn');
    if (darkModeBtn) darkModeBtn.style.display = 'none';
}

// Load logo
function loadLogo() {
    const logoElement = document.getElementById('siteLogo');
    if (!logoElement) return;
    
    if (CONFIG.logo) {
        // If logo is uploaded, show as image
        logoElement.innerHTML = `<img src="${CONFIG.logo}" alt="Logo" style="height: 40px; max-width: 200px; object-fit: contain;">`;
    } else {
        // Default text logo
        logoElement.textContent = 'LOGO';
    }
}

// Load site settings (title, favicon, meta tags)
function loadSiteSettings() {
    const settings = CONFIG.siteSettings || {
        title: 'Mobile Website',
        titleKm: 'គេហទំព័រទូរស័ព្ទ',
        favicon: '',
        description: 'Welcome to our online store',
        descriptionKm: 'សូមស្វាគមន៍មកកាន់ហាងអនឡាញរបស់យើង',
        ogImage: '',
        keywords: 'online store, products, shopping'
    };
    
    // Get current language
    const lang = currentLanguage || 'en';
    const title = lang === 'en' ? settings.title : settings.titleKm;
    const description = lang === 'en' ? settings.description : settings.descriptionKm;
    
    // Update page title
    document.title = title;
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = title;
    
    // Update meta description
    const metaDescription = document.getElementById('metaDescription');
    if (metaDescription) metaDescription.setAttribute('content', description);
    
    // Update meta keywords
    const metaKeywords = document.getElementById('metaKeywords');
    if (metaKeywords && settings.keywords) {
        metaKeywords.setAttribute('content', settings.keywords);
    }
    
    // Get current URL
    const currentUrl = window.location.href;
    
    // Update Open Graph tags
    const ogUrl = document.getElementById('ogUrl');
    if (ogUrl) ogUrl.setAttribute('content', currentUrl);
    
    const ogTitle = document.getElementById('ogTitle');
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    const ogDescription = document.getElementById('ogDescription');
    if (ogDescription) ogDescription.setAttribute('content', description);
    
    const ogImage = document.getElementById('ogImage');
    if (ogImage && settings.ogImage) {
        ogImage.setAttribute('content', settings.ogImage);
    } else if (ogImage && CONFIG.logo) {
        // Fallback to logo if no OG image
        ogImage.setAttribute('content', CONFIG.logo);
    }
    
    // Update Twitter tags
    const twitterUrl = document.getElementById('twitterUrl');
    if (twitterUrl) twitterUrl.setAttribute('content', currentUrl);
    
    const twitterTitle = document.getElementById('twitterTitle');
    if (twitterTitle) twitterTitle.setAttribute('content', title);
    
    const twitterDescription = document.getElementById('twitterDescription');
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    
    const twitterImage = document.getElementById('twitterImage');
    if (twitterImage && settings.ogImage) {
        twitterImage.setAttribute('content', settings.ogImage);
    } else if (twitterImage && CONFIG.logo) {
        twitterImage.setAttribute('content', CONFIG.logo);
    }
    
    // Update favicon
    const favicon = document.getElementById('favicon');
    const appleTouchIcon = document.getElementById('appleTouchIcon');
    
    if (settings.favicon) {
        // Determine favicon type from extension
        let faviconType = 'image/x-icon';
        if (settings.favicon.toLowerCase().endsWith('.png')) {
            faviconType = 'image/png';
        } else if (settings.favicon.toLowerCase().endsWith('.jpg') || settings.favicon.toLowerCase().endsWith('.jpeg')) {
            faviconType = 'image/jpeg';
        } else if (settings.favicon.toLowerCase().endsWith('.gif')) {
            faviconType = 'image/gif';
        }
        
        if (favicon) {
            favicon.setAttribute('href', settings.favicon);
            favicon.setAttribute('type', faviconType);
        }
        
        if (appleTouchIcon) {
            appleTouchIcon.setAttribute('href', settings.favicon);
        }
    } else if (CONFIG.logo) {
        // Fallback to logo as favicon
        if (favicon) favicon.setAttribute('href', CONFIG.logo);
        if (appleTouchIcon) appleTouchIcon.setAttribute('href', CONFIG.logo);
    }
    
    console.log('✅ Site settings loaded:', title);
}

// Navigate to home page
function goToHome() {
    // Show first section (promotion)
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('promotion').classList.add('active');
    
    // Update section navigation
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.section-btn[data-section="promotion"]').classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Theme Management - Fixed to Alibaba theme only
function loadTheme() {
    applyTheme('alibaba');
}

function applyTheme(themeName) {
    // Always use Alibaba theme
    const theme = CONFIG.themes.alibaba;
    
    const oldStyle = document.getElementById('theme-style');
    if (oldStyle) oldStyle.remove();
    
    // Alibaba theme uses light navigation
    const navBg = '#ffffff';
    const navText = '#333333';
    const navBorder = '1px solid #f0f0f0';
    const navShadow = '0 2px 8px rgba(0,0,0,0.08)';
    
    const style = document.createElement('style');
    style.id = 'theme-style';
    style.innerHTML = `
        :root {
            --primary-color: ${theme.primary};
            --primary-dark: ${theme.primaryDark};
            --secondary-color: ${theme.secondary};
            --accent-color: ${theme.accent};
        }
        
        body { background: ${theme.background} !important; }
        
        .section-btn.active, .btn-apply, .btn-primary, 
        .product-detail-category,
        .swiper-pagination-bullet-active { background: ${theme.primary} !important; }
        
        .btn-apply:hover, .btn-primary:hover { background: ${theme.primaryDark} !important; }
        
        .top-nav, .section-nav {
            background: ${navBg} !important;
            border-bottom: ${navBorder} !important;
            box-shadow: ${navShadow} !important;
        }
        
        .top-nav .logo, .top-nav .nav-btn, .top-nav .menu-toggle { color: ${navText} !important; }
        .top-nav .nav-btn { border-color: ${theme.primary} !important; }
        .top-nav .nav-btn:hover {
            background: ${theme.primary} !important;
            color: white !important;
        }
        
        .section-nav .section-btn {
            background: #f5f5f5 !important;
            color: ${navText} !important;
        }
        .section-nav .section-btn.active { background: ${theme.primary} !important; color: white !important; }
        
        .category-btn { border-color: ${theme.primary} !important; color: ${theme.primary} !important; }
        .category-btn.active { background: ${theme.primary} !important; color: white !important; }
        
        .promotion-card:hover, .product-card:hover, .event-card:hover { box-shadow: ${theme.cardShadow} !important; }
        .section-title::after { background: ${theme.primary} !important; }
        .problem-banner { background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%) !important; }
    `;
    
    document.head.appendChild(style);
}

// BANNER SYSTEM - FRONTEND
function initBannerSlider() {
    const slidesContainer = document.getElementById('bannerSlides');
    if (!slidesContainer) return;
    
    console.log('🎨 Loading banner system...');
    
    // Clear existing slides
    slidesContainer.innerHTML = '';
    
    // Check banners
    if (!CONFIG.banners || CONFIG.banners.length === 0) {
        console.log('No banners found');
        slidesContainer.innerHTML = '<div class="swiper-slide banner-slide" style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;">No banners</div>';
        return;
    }
    
    // Detect device type
    const isMobile = window.innerWidth <= 768;
    console.log('Device type:', isMobile ? 'Mobile' : 'Desktop');
    
    // Get enabled banners that can display on current device
    const enabledBanners = CONFIG.banners.filter(b => {
        if (!b || !b.enabled) return false;
        
        // Check display options (backward compatibility: if not set, show on both)
        const showOnMobile = b.showOnMobile !== false;
        const showOnDesktop = b.showOnDesktop !== false;
        
        if (isMobile && !showOnMobile) return false;
        if (!isMobile && !showOnDesktop) return false;
        
        // Check if banner has appropriate image for current device
        const hasImage = isMobile ? 
            (b.mobileImage || b.desktopImage) : 
            (b.desktopImage || b.mobileImage);
            
        return !!hasImage;
    });
    
    console.log('Found', enabledBanners.length, 'enabled banners for', isMobile ? 'mobile' : 'desktop');
    
    if (enabledBanners.length === 0) {
        slidesContainer.innerHTML = '<div class="swiper-slide banner-slide" style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;">No active banners</div>';
        return;
    }
    
    // Create slides
    enabledBanners.forEach((banner, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide banner-slide';
        
        // Determine which image to use
        let bannerImage = '';
        if (isMobile) {
            // Mobile: use mobileImage, fallback to desktopImage
            bannerImage = banner.mobileImage || banner.desktopImage || '';
        } else {
            // Desktop: use desktopImage, fallback to mobileImage
            bannerImage = banner.desktopImage || banner.mobileImage || '';
        }
        
        console.log(`Banner ${banner.id} using image:`, bannerImage ? 'Found' : 'Missing');
        
        if (bannerImage) {
            slide.style.backgroundImage = `url(${bannerImage})`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center';
            slide.style.backgroundRepeat = 'no-repeat';
            slide.style.minHeight = '200px';
            
            // Add click handler
            if (banner.link && banner.link.trim() !== '') {
                slide.style.cursor = 'pointer';
                slide.onclick = () => {
                    console.log(`Banner ${banner.id} clicked, opening:`, banner.link);
                    window.open(banner.link, '_blank');
                };
            }
        } else {
            slide.style.background = '#f0f0f0';
            slide.style.display = 'flex';
            slide.style.alignItems = 'center';
            slide.style.justifyContent = 'center';
            slide.style.color = '#999';
            slide.textContent = 'No image';
        }
        
        slidesContainer.appendChild(slide);
    });
    
    // Destroy existing swiper
    if (window.bannerSwiper) {
        window.bannerSwiper.destroy(true, true);
    }
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    console.log('Device:', isIOS ? 'iOS' : 'Other');
    
    // Create new swiper with iOS-compatible settings
    window.bannerSwiper = new Swiper('.bannerSwiper', {
        pagination: { 
            el: '.swiper-pagination', 
            clickable: true 
        },
        loop: enabledBanners.length > 1,
        autoplay: enabledBanners.length > 1 ? {
            delay: (enabledBanners[0].duration || 3) * 1000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            waitForTransition: true
        } : false,
        speed: 800,
        effect: 'slide',
        touchEventsTarget: 'container',
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        grabCursor: true,
        preventClicks: false,
        preventClicksPropagation: false,
        slideToClickedSlide: false,
        spaceBetween: 0,
        slidesPerView: 1,
        centeredSlides: false,
        watchSlidesProgress: true,
        watchSlidesVisibility: true,
        preloadImages: true,
        updateOnWindowResize: true,
        observer: true,
        observeParents: true,
        on: {
            slideChange: function() {
                if (this.autoplay && enabledBanners.length > 1) {
                    const currentIndex = this.realIndex;
                    const currentBanner = enabledBanners[currentIndex];
                    const newDelay = (currentBanner.duration || 3) * 1000;
                    this.autoplay.delay = newDelay;
                    console.log(`🎨 Slide changed to ${currentIndex + 1}, delay: ${newDelay}ms`);
                }
            },
            autoplayStart: function() {
                console.log('▶️ Autoplay started');
            },
            autoplayStop: function() {
                console.log('⏸️ Autoplay stopped');
            },
            autoplayPause: function() {
                console.log('⏸️ Autoplay paused');
            },
            autoplayResume: function() {
                console.log('▶️ Autoplay resumed');
            },
            init: function() {
                console.log('✅ Swiper initialized with', this.slides.length, 'slides');
                // Force autoplay to start on iOS
                if (isIOS && this.autoplay) {
                    setTimeout(() => {
                        this.autoplay.start();
                        console.log('🔄 iOS: Forced autoplay start');
                    }, 500);
                }
            }
        }
    });
    
    console.log('✅ Banner system loaded with', enabledBanners.length, 'banners');
}

// Get promotional label text with emoji
function getPromoLabelText(label) {
    const labels = {
        'SALE': '🔥 SALE',
        'HOT': '🔥 HOT',
        'NEW': '✨ NEW',
        'LIMITED': '⏰ LIMITED',
        'BEST': '⭐ BEST',
        'FLASH': '⚡ FLASH'
    };
    return labels[label] || label;
}

// Helper function to handle image loading with fallback
function getImageSrc(url) {
    if (!url) return 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>';
    
    // Clean the URL
    url = url.trim();
    
    // For Facebook CDN images, ensure proper format
    if (url.includes('fbcdn.net')) {
        // Remove any query parameters that might cause issues
        return url.split('?')[0];
    }
    
    // For Instagram images
    if (url.includes('cdninstagram.com') || url.includes('instagram.com')) {
        return url;
    }
    
    // For all other images, return as-is
    return url;
}

// Handle image load errors with better fallback
function handleImageError(img) {
    const fallbackSvg = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>Image Unavailable</text></svg>';
    
    // Prevent infinite loop
    if (img.src === fallbackSvg || img.getAttribute('data-error-handled') === 'true') {
        return;
    }
    
    img.setAttribute('data-error-handled', 'true');
    
    // Try different approaches
    const originalSrc = img.getAttribute('data-original-src') || img.src;
    
    // First attempt: Try without any modifications
    if (!img.hasAttribute('data-retry-1')) {
        img.setAttribute('data-retry-1', 'true');
        img.src = originalSrc;
        return;
    }
    
    // Second attempt: Try with a proxy (using images.weserv.nl - free image proxy)
    if (!img.hasAttribute('data-retry-2') && originalSrc.startsWith('http')) {
        img.setAttribute('data-retry-2', 'true');
        // Use weserv.nl as a CORS proxy for images
        img.src = `https://images.weserv.nl/?url=${encodeURIComponent(originalSrc)}`;
        return;
    }
    
    // Final fallback: Show placeholder
    img.src = fallbackSvg;
}

// Load Promotions
function loadPromotions() {
    const grid = document.getElementById('promotionGrid');
    if (!grid) return;
    
    if (CONFIG.promotions.length === 0) {
        grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;">No promotions yet</p>';
        return;
    }
    
    CONFIG.promotions.forEach(promo => {
        const card = document.createElement('div');
        card.className = 'promotion-card';
        card.onclick = () => showPromotionDetail(promo);
        
        const categoryName = CONFIG.categories.find(c => c.id === promo.category)?.name || promo.category || 'Promotion';
        
        card.innerHTML = `
            <div class="promotion-image-container">
                <img src="${getImageSrc(promo.image)}" alt="${promo.title}" class="promotion-image" data-original-src="${promo.image}" onerror="handleImageError(this)" loading="lazy">
                ${promo.promoLabel ? `<div class="promo-label promo-label-${promo.promoLabel.toLowerCase()}">${getPromoLabelText(promo.promoLabel)}</div>` : ''}
                ${promo.discount && parseFloat(promo.discount) > 0 ? `<div class="discount-badge">-${promo.discount}%</div>` : ''}
            </div>
            <div class="promotion-content">
                <div class="promotion-title" data-en="${promo.title}" data-km="${promo.titleKm}">
                    ${currentLanguage === 'en' ? promo.title : promo.titleKm}
                </div>
                <div class="promotion-category">${categoryName}</div>
                <div class="promotion-pricing">
                    ${promo.originalPrice && promo.discount && parseFloat(promo.discount) > 0 ? 
                        `<span class="original-price">${promo.originalPrice}</span>` : ''}
                    <span class="final-price">${promo.price || '$0'}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Load Events
function loadEvents() {
    const grid = document.getElementById('eventGrid');
    if (!grid) return;
    
    if (CONFIG.events.length === 0) {
        grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;">No events yet</p>';
        return;
    }
    
    CONFIG.events.forEach((event, eventIndex) => {
        const card = document.createElement('div');
        card.className = 'event-card';
        // Remove click handler - events are view-only, not clickable
        
        let mediaHTML = '';
        if (event.type === 'video' && event.embedUrl) {
            const embedUrl = convertToEmbedUrl(event.embedUrl);
            
            // Determine aspect ratio from admin setting or default to square
            let aspectRatio = event.aspectRatio || '1/1'; // Default square
            let containerClass = 'event-video-square';
            
            if (event.aspectRatio === '16/9') {
                containerClass = 'event-video-landscape';
            } else if (event.aspectRatio === '3/4') {
                containerClass = 'event-video-portrait';
            } else if (event.aspectRatio === '9/16') {
                containerClass = 'event-video-vertical';
            }
            
            mediaHTML = `
                <div class="${containerClass}" data-video-index="event-${eventIndex}" onclick="handleVideoClick(this)">
                    <iframe 
                        src="${embedUrl}" 
                        style="border: none; width: 100%; height: 100%;"
                        frameborder="0" 
                        allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        loading="lazy">
                    </iframe>
                </div>
            `;
        } else {
            mediaHTML = `
                <div class="event-image-square">
                    <img src="${event.image}" alt="${event.title}" loading="lazy" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22><rect fill=%22%23f0f0f0%22 width=%22800%22 height=%22400%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>'">
                </div>
            `;
        }
        
        card.innerHTML = `
            ${mediaHTML}
            <div class="event-content">
                <div class="event-title" data-en="${event.title}" data-km="${event.titleKm}">
                    ${currentLanguage === 'en' ? event.title : event.titleKm}
                </div>
                <div class="event-description" data-en="${event.description}" data-km="${event.descriptionKm}">
                    ${currentLanguage === 'en' ? event.description : event.descriptionKm}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Handle video click - stop all other videos
window.handleVideoClick = function(container) {
    console.log('🎬 Video clicked via onclick');
    const iframe = container.querySelector('iframe');
    if (iframe) {
        setTimeout(() => {
            pauseAllVideosExcept(iframe);
            currentPlayingVideo = iframe;
        }, 300);
    }
};

// Load Posts with filtering like products
function loadPosts(filterType = 'all') {
    const grid = document.getElementById('postGrid');
    if (!grid) return;
    
    if (!CONFIG.posts || CONFIG.posts.length === 0) {
        grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;">No posts yet</p>';
        return;
    }
    
    // Only show published posts
    let postsToShow = CONFIG.posts.filter(post => post.enabled);
    
    // Apply filter
    if (filterType === 'video') {
        postsToShow = postsToShow.filter(post => post.type === 'video');
    } else if (filterType === 'image') {
        postsToShow = postsToShow.filter(post => post.type === 'image');
    }
    
    if (postsToShow.length === 0) {
        const filterText = filterType === 'all' ? 'posts' : `${filterType} posts`;
        grid.innerHTML = `<p style="color:#999;text-align:center;padding:40px;">No ${filterText} yet</p>`;
        return;
    }
    
    grid.innerHTML = '';
    
    postsToShow.forEach((post, postIndex) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = () => showPostDetail(post.id);
        card.style.cursor = 'pointer';
        
        let cardHTML = '';
        
        if (post.type === 'video' && (post.embedUrl || post.videoUrl)) {
            // Video posts - show as clickable thumbnail with title only
            const originalUrl = post.videoUrl || post.embedUrl;
            const embedUrl = convertToEmbedUrl(originalUrl);
            
            // Determine aspect ratio from admin setting or default to square
            let aspectRatio = post.aspectRatio || '1/1'; // Default square
            let containerClass = 'post-video-square';
            
            if (post.aspectRatio === '16/9') {
                containerClass = 'post-video-landscape';
            } else if (post.aspectRatio === '3/4') {
                containerClass = 'post-video-portrait';
            } else if (post.aspectRatio === '9/16') {
                containerClass = 'post-video-vertical';
            }
            
            cardHTML = `
                <div class="${containerClass}" data-video-index="post-${postIndex}" onclick="handleVideoClick(this); event.stopPropagation();">
                    <iframe 
                        src="${embedUrl}" 
                        style="border: none; width: 100%; height: 100%;"
                        frameborder="0" 
                        allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        loading="lazy">
                    </iframe>
                </div>
                <div class="post-content">
                    <div class="post-title" data-en="${post.title}" data-km="${post.titleKm}">
                        ${currentLanguage === 'en' ? post.title : post.titleKm}
                    </div>
                </div>
            `;
        } else if (post.image) {
            // Image posts - show as square card (1080x1080 style)
            cardHTML = `
                <div class="post-image-square">
                    <img src="${post.image}" alt="${post.title}" loading="lazy" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22><rect fill=%22%23f0f0f0%22 width=%22400%22 height=%22400%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>'">
                </div>
                <div class="post-content">
                    <div class="post-title" data-en="${post.title}" data-km="${post.titleKm}">
                        ${currentLanguage === 'en' ? post.title : post.titleKm}
                    </div>
                    <div class="post-article" data-en="${post.content.substring(0, 120)}..." data-km="${post.contentKm.substring(0, 120)}...">
                        ${currentLanguage === 'en' ? post.content.substring(0, 120) + '...' : post.contentKm.substring(0, 120) + '...'}
                    </div>
                    <div class="post-type">🖼️ Click to view</div>
                </div>
            `;
        }
        
        card.innerHTML = cardHTML;
        grid.appendChild(card);
    });
    
    // Initialize post filter buttons
    initPostFilter();
}

// Initialize post filter functionality
function initPostFilter() {
    const filterButtons = document.querySelectorAll('.post-filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter type and reload posts
            const filterType = this.getAttribute('data-filter');
            loadPosts(filterType);
            
            // Reinitialize video control after posts reload
            setTimeout(() => {
                initVideoPlayControl();
            }, 500);
        });
    });
}

// Load Categories
function loadCategories() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    CONFIG.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `category-btn ${cat.id === 'all' ? 'active' : ''}`;
        btn.setAttribute('data-en', cat.name);
        btn.setAttribute('data-km', cat.nameKm);
        btn.textContent = currentLanguage === 'en' ? cat.name : cat.nameKm;
        btn.onclick = (e) => filterProducts(cat.id, e);
        filter.appendChild(btn);
    });
}

// Filter Products
function filterProducts(categoryId, e) {
    currentCategory = categoryId;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if (e && e.target) e.target.classList.add('active');
    loadProducts();
}

// Load Products
function loadProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const filteredProducts = currentCategory === 'all' 
        ? CONFIG.products 
        : CONFIG.products.filter(p => p.category === currentCategory);
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;grid-column:1/-1;">No products yet</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => showProductDetail(product);
        
        const categoryName = CONFIG.categories.find(c => c.id === product.category)?.name || product.category;
        
        card.innerHTML = `
            <img src="${getImageSrc(product.image)}" alt="${product.name}" class="product-image" 
                 data-original-src="${product.image}" onerror="handleImageError(this)" loading="lazy">
            <div class="product-info">
                <div class="product-name" data-en="${product.name}" data-km="${product.nameKm}">
                    ${currentLanguage === 'en' ? product.name : product.nameKm}
                </div>
                <div class="product-category">${categoryName}</div>
                <div class="product-price">${product.price}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Show Product Detail - Alibaba Style
function showProductDetail(product) {
    const modal = document.getElementById('productModal');
    const detail = document.getElementById('productDetail');
    
    // Prepare images array
    let allMedia = [];
    if (product.image) allMedia.push({ type: 'image', src: product.image });
    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            if (img && img !== product.image) {
                allMedia.push({ type: 'image', src: img });
            }
        });
    }
    if (product.videoUrl) {
        allMedia.push({ type: 'video', src: convertToEmbedUrl(product.videoUrl) });
    }
    
    // If no media, add placeholder
    if (allMedia.length === 0) {
        allMedia.push({ type: 'image', src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="%23f0f0f0" width="600" height="600"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999">No Image</text></svg>' });
    }
    
    // Build thumbnails
    let thumbnailsHTML = allMedia.map((media, index) => {
        if (media.type === 'video') {
            return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="window.stopMediaAutoSlide(); changeMainMedia(${index})" data-type="video" data-src="${media.src}">
                <div class="thumb-video-icon">▶</div>
            </div>`;
        }
        return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="window.stopMediaAutoSlide(); changeMainMedia(${index})" data-type="image" data-src="${media.src}">
            <img src="${getImageSrc(media.src)}" alt="Thumb ${index + 1}" data-original-src="${media.src}" onerror="handleImageError(this)">
        </div>`;
    }).join('');
    
    // Main media display
    let mainMediaHTML = '';
    if (allMedia[0].type === 'video') {
        mainMediaHTML = `<iframe id="mainMedia" src="${allMedia[0].src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
        mainMediaHTML = `<img id="mainMedia" src="${getImageSrc(allMedia[0].src)}" alt="${product.name}" data-original-src="${allMedia[0].src}" onerror="handleImageError(this)" onclick="viewFullImage(this.src)">`;
    }
    
    const categoryName = CONFIG.categories.find(c => c.id === product.category)?.name || product.category;
    const description = currentLanguage === 'en' ? product.description : product.descriptionKm;
    const shortDesc = description.length > 150 ? description.substring(0, 150) + '...' : description;
    
    detail.innerHTML = `
        <div class="product-detail-container">
            <div class="product-detail-gallery">
                <div class="main-media-container">
                    ${mainMediaHTML}
                </div>
                <div class="thumbnail-strip">
                    ${thumbnailsHTML}
                </div>
            </div>
            <div class="product-detail-info">
                <h2 class="product-detail-title" data-en="${product.name}" data-km="${product.nameKm}">
                    ${currentLanguage === 'en' ? product.name : product.nameKm}
                </h2>
                <span class="product-detail-category">${categoryName}</span>
                <div class="product-detail-price">${product.price}</div>
                
                <div class="product-detail-desc">
                    <h4 data-en="Description" data-km="ការពិពណ៌នា">${currentLanguage === 'en' ? 'Description' : 'ការពិពណ៌នា'}</h4>
                    <p id="descText" class="desc-collapsed">${description}</p>
                    ${description.length > 150 ? `<button class="btn-show-more" onclick="toggleDescription()">
                        <span data-en="Show More" data-km="បង្ហាញបន្ថែម">${currentLanguage === 'en' ? 'Show More' : 'បង្ហាញបន្ថែម'}</span>
                    </button>` : ''}
                </div>
                
                <div class="contact-buttons">
                    ${product.contact?.phone ? `<button class="btn-contact-pill" onclick="contactPhone('${product.contact.phone.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.phone || '#28a745'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('phone').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    ${product.contact?.whatsapp ? `<button class="btn-contact-pill" onclick="contactWhatsApp('${product.contact.whatsapp.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.whatsapp || '#25D366'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('whatsapp').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    ${product.contact?.telegram ? `<button class="btn-contact-pill" onclick="contactTelegram('${product.contact.telegram.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.telegram || '#0088cc'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('telegram').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    ${product.contact?.facebook ? `<button class="btn-contact-pill" onclick="contactFacebook('${product.contact.facebook.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.facebook || '#1877F2'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('facebook').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    ${product.contact?.messenger ? `<button class="btn-contact-pill" onclick="contactMessenger('${product.contact.messenger.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.messenger || '#0073e6'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('messenger').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    <button class="btn-share-icon" onclick="shareCurrentItem()" title="${currentLanguage === 'en' ? 'Share' : 'ចែករំលែក'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Store media data for switching
    window.productMedia = allMedia;
    window.currentProductContact = product.contact || {};
    window.currentMediaIndex = 0;
    window.userInteractedWithMedia = false; // Reset interaction flag for fresh auto-slide
    
    // Store current item for sharing
    window.currentShareData = { item: product, type: 'product' };
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // ===== BUTTON VISIBILITY FIX =====
    // Ensure buttons are visible after modal opens - multiple checks
    ensureButtonsVisible();
    setTimeout(() => {
        ensureButtonsVisible();
        window.initMediaSwipe();
        window.startMediaAutoSlide();
    }, 50);
    setTimeout(() => {
        ensureButtonsVisible();
    }, 150);
    setTimeout(() => {
        ensureButtonsVisible();
    }, 300);
}

// Show Promotion Detail - Exactly like Product Detail
function showPromotionDetail(promotion) {
    const modal = document.getElementById('productModal');
    const detail = document.getElementById('productDetail');
    
    // Prepare images array (same as products)
    let allMedia = [];
    if (promotion.image) allMedia.push({ type: 'image', src: promotion.image });
    if (promotion.images && promotion.images.length > 0) {
        promotion.images.forEach(img => {
            if (img && img !== promotion.image) {
                allMedia.push({ type: 'image', src: img });
            }
        });
    }
    if (promotion.videoUrl) {
        allMedia.push({ type: 'video', src: convertToEmbedUrl(promotion.videoUrl) });
    }
    
    // If no media, add placeholder
    if (allMedia.length === 0) {
        allMedia.push({ type: 'image', src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="%23f0f0f0" width="600" height="600"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999">No Image</text></svg>' });
    }
    
    // Build thumbnails (same as products)
    let thumbnailsHTML = allMedia.map((media, index) => {
        if (media.type === 'video') {
            return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="window.stopMediaAutoSlide(); changeMainMedia(${index})" data-type="video" data-src="${media.src}">
                <div class="thumb-video-icon">▶</div>
            </div>`;
        }
        return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="window.stopMediaAutoSlide(); changeMainMedia(${index})" data-type="image" data-src="${media.src}">
            <img src="${getImageSrc(media.src)}" alt="Thumb ${index + 1}" data-original-src="${media.src}" onerror="handleImageError(this)">
        </div>`;
    }).join('');
    
    // Main media display (same as products)
    let mainMediaHTML = '';
    if (allMedia[0].type === 'video') {
        mainMediaHTML = `<iframe id="mainMedia" src="${allMedia[0].src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
        mainMediaHTML = `<img id="mainMedia" src="${getImageSrc(allMedia[0].src)}" alt="${promotion.title}" data-original-src="${allMedia[0].src}" onerror="handleImageError(this)" onclick="viewFullImage(this.src)">`;
    }
    
    const categoryName = CONFIG.categories.find(c => c.id === promotion.category)?.name || promotion.category || 'Promotion';
    const description = currentLanguage === 'en' ? (promotion.description || 'No description') : (promotion.descriptionKm || 'គ្មានការពិពណ៌នា');
    
    detail.innerHTML = `
        <div class="product-detail-container">
            <div class="product-detail-gallery">
                <div class="main-media-container">
                    ${mainMediaHTML}
                </div>
                <div class="thumbnail-strip">
                    ${thumbnailsHTML}
                </div>
            </div>
            <div class="product-detail-info">
                <h2 class="product-detail-title" data-en="${promotion.title}" data-km="${promotion.titleKm}">
                    ${currentLanguage === 'en' ? promotion.title : promotion.titleKm}
                    ${promotion.promoLabel ? `<span class="promo-label-inline promo-label-${promotion.promoLabel.toLowerCase()}">${getPromoLabelText(promotion.promoLabel)}</span>` : ''}
                </h2>
                <span class="product-detail-category">${categoryName}</span>
                <div class="promotion-detail-pricing">
                    ${promotion.originalPrice && promotion.discount && parseFloat(promotion.discount) > 0 ? 
                        `<div class="pricing-row">
                            <span class="original-price-large">${promotion.originalPrice}</span>
                            <span class="discount-badge-large">-${promotion.discount}%</span>
                        </div>` : ''}
                    <div class="product-detail-price">${promotion.price || '$0'}</div>
                </div>
                
                <div class="product-detail-desc">
                    <h4 data-en="Description" data-km="ការពិពណ៌នា">${currentLanguage === 'en' ? 'Description' : 'ការពិពណ៌នា'}</h4>
                    <p id="descText" class="desc-collapsed">${description}</p>
                    ${description.length > 150 ? `<button class="btn-show-more" onclick="toggleDescription()">
                        <span data-en="Show More" data-km="បង្ហាញបន្ថែម">${currentLanguage === 'en' ? 'Show More' : 'បង្ហាញបន្ថែម'}</span>
                    </button>` : ''}
                </div>
                
                <div class="contact-buttons">
                    ${promotion.contact?.phone ? `<button class="btn-contact-pill" onclick="contactPhone('${promotion.contact.phone.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.phone || '#28a745'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('phone').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    ${promotion.contact?.whatsapp ? `<button class="btn-contact-pill" onclick="contactWhatsApp('${promotion.contact.whatsapp.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.whatsapp || '#25D366'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('whatsapp').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    ${promotion.contact?.telegram ? `<button class="btn-contact-pill" onclick="contactTelegram('${promotion.contact.telegram.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.telegram || '#0088cc'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('telegram').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    ${promotion.contact?.facebook ? `<button class="btn-contact-pill" onclick="contactFacebook('${promotion.contact.facebook.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.facebook || '#1877F2'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('facebook').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    ${promotion.contact?.messenger ? `<button class="btn-contact-pill" onclick="contactMessenger('${promotion.contact.messenger.replace(/'/g, "\\'")}')" style="background: ${CONFIG.buttonColors?.messenger || '#0073e6'};">
                        <span class="pill-icon">${renderButtonIcon(getButtonIconConfig('messenger').icon)}</span>
                        <span class="pill-text" data-en="Buy Now" data-km="បញ្ចារទិញ">${currentLanguage === 'en' ? 'Buy Now' : 'បញ្ចារទិញ'}</span>
                    </button>` : ''}
                    <button class="btn-share-icon" onclick="shareCurrentItem()" title="${currentLanguage === 'en' ? 'Share' : 'ចែករំលែក'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Store media data for switching (same as products)
    window.productMedia = allMedia;
    window.currentProductContact = promotion.contact || {};
    window.currentMediaIndex = 0;
    window.userInteractedWithMedia = false; // Reset interaction flag for fresh auto-slide
    
    // Store current item for sharing
    window.currentShareData = { item: promotion, type: 'promotion' };
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // ===== BUTTON VISIBILITY FIX =====
    // Ensure buttons are visible after modal opens - multiple checks
    ensureButtonsVisible();
    setTimeout(() => {
        ensureButtonsVisible();
        window.initMediaSwipe();
        window.startMediaAutoSlide();
    }, 50);
    setTimeout(() => {
        ensureButtonsVisible();
    }, 150);
    setTimeout(() => {
        ensureButtonsVisible();
    }, 300);
}

// Show Event Detail - Similar to Product Detail
function showEventDetail(event) {
    const modal = document.getElementById('productModal');
    const detail = document.getElementById('productDetail');
    
    // Prepare images array
    let allMedia = [];
    if (event.image) allMedia.push({ type: 'image', src: event.image });
    if (event.images && event.images.length > 0) {
        event.images.forEach(img => {
            if (img && img !== event.image) {
                allMedia.push({ type: 'image', src: img });
            }
        });
    }
    if (event.videoUrl) {
        allMedia.push({ type: 'video', src: convertToEmbedUrl(event.videoUrl) });
    }
    
    // If no media, add placeholder
    if (allMedia.length === 0) {
        allMedia.push({ type: 'image', src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="%23f0f0f0" width="600" height="600"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999">No Image</text></svg>' });
    }
    
    // Build thumbnails
    let thumbnailsHTML = allMedia.map((media, index) => {
        if (media.type === 'video') {
            return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="window.stopMediaAutoSlide(); changeMainMedia(${index})" data-type="video" data-src="${media.src}">
                <div class="thumb-video-icon">▶</div>
            </div>`;
        }
        return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="window.stopMediaAutoSlide(); changeMainMedia(${index})" data-type="image" data-src="${media.src}">
            <img src="${getImageSrc(media.src)}" alt="Thumb ${index + 1}" data-original-src="${media.src}" onerror="handleImageError(this)">
        </div>`;
    }).join('');
    
    // Main media display
    let mainMediaHTML = '';
    if (allMedia[0].type === 'video') {
        mainMediaHTML = `<iframe id="mainMedia" src="${allMedia[0].src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
        mainMediaHTML = `<img id="mainMedia" src="${getImageSrc(allMedia[0].src)}" alt="${event.title}" data-original-src="${allMedia[0].src}" onerror="handleImageError(this)" onclick="viewFullImage(this.src)">`;
    }
    
    const description = currentLanguage === 'en' ? event.description : event.descriptionKm;
    const shortDesc = description.length > 150 ? description.substring(0, 150) + '...' : description;
    
    detail.innerHTML = `
        <div class="product-detail-container">
            <div class="product-detail-gallery">
                <div class="main-media-container">
                    ${mainMediaHTML}
                </div>
                <div class="thumbnail-strip">
                    ${thumbnailsHTML}
                </div>
            </div>
            <div class="product-detail-info">
                <h2 class="product-detail-title" data-en="${event.title}" data-km="${event.titleKm}">
                    ${currentLanguage === 'en' ? event.title : event.titleKm}
                </h2>
                <div class="product-detail-desc">
                    <h4 data-en="Description" data-km="ការពិពណ៌នា">${currentLanguage === 'en' ? 'Description' : 'ការពិពណ៌នា'}</h4>
                    <p id="descText" class="desc-collapsed">${description}</p>
                    ${description.length > 150 ? `<button class="btn-show-more" onclick="toggleDescription()">
                        <span data-en="Show More" data-km="បង្ហាញបន្ថែម">${currentLanguage === 'en' ? 'Show More' : 'បង្ហាញបន្ថែម'}</span>
                    </button>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Store media data for switching
    window.productMedia = allMedia;
    window.currentMediaIndex = 0;
    window.userInteractedWithMedia = false; // Reset interaction flag for fresh auto-slide
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // ===== BUTTON VISIBILITY FIX =====
    // Ensure buttons are visible after modal opens - multiple checks
    ensureButtonsVisible();
    setTimeout(() => {
        ensureButtonsVisible();
        window.initMediaSwipe();
        window.startMediaAutoSlide();
    }, 50);
    setTimeout(() => {
        ensureButtonsVisible();
    }, 150);
    setTimeout(() => {
        ensureButtonsVisible();
    }, 300);
}

// Change main media in product detail
window.changeMainMedia = function(index) {
    const media = window.productMedia[index];
    const container = document.querySelector('.main-media-container');
    
    // Clear any existing auto-slide timer
    if (window.mediaAutoSlideTimer) {
        clearInterval(window.mediaAutoSlideTimer);
        window.mediaAutoSlideTimer = null;
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumb-item').forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });
    
    if (media.type === 'video') {
        container.innerHTML = `<iframe id="mainMedia" src="${media.src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
        container.innerHTML = `<img id="mainMedia" src="${getImageSrc(media.src)}" alt="Product" data-original-src="${media.src}" onerror="handleImageError(this)" onclick="viewFullImage(this.src)">`;
    }
    
    // Store current index
    window.currentMediaIndex = index;
    
    // Only restart auto-slide if user didn't manually interact
    // If userInteracted flag is true, don't restart auto-slide
    if (!window.userInteractedWithMedia) {
        startMediaAutoSlide();
    }
};

// Auto-slide media carousel
window.startMediaAutoSlide = function() {
    if (!window.productMedia || window.productMedia.length <= 1) return;
    
    // Clear existing timer
    if (window.mediaAutoSlideTimer) {
        clearInterval(window.mediaAutoSlideTimer);
    }
    
    // Initialize auto-slide counter if not exists
    if (!window.mediaAutoSlideCount) {
        window.mediaAutoSlideCount = 0;
    }
    
    // Auto-slide only ONCE through all images (3 seconds per image)
    // Stop after one complete cycle
    window.mediaAutoSlideTimer = setInterval(function() {
        if (!window.productMedia) return;
        
        const nextIndex = (window.currentMediaIndex + 1) % window.productMedia.length;
        window.changeMainMedia(nextIndex);
        
        // Increment counter
        window.mediaAutoSlideCount++;
        
        // Stop after one complete cycle through all images
        if (window.mediaAutoSlideCount >= window.productMedia.length - 1) {
            window.stopMediaAutoSlide();
            console.log('✅ Auto-slide completed - user can now manually browse');
        }
    }, 3000); // 3 seconds per image
};

// Stop auto-slide when user interacts
window.stopMediaAutoSlide = function() {
    if (window.mediaAutoSlideTimer) {
        clearInterval(window.mediaAutoSlideTimer);
        window.mediaAutoSlideTimer = null;
    }
    // Mark that user has interacted - prevent auto-slide from restarting
    window.userInteractedWithMedia = true;
    // Reset counter for next time modal opens
    window.mediaAutoSlideCount = 0;
};

// Next media
window.nextMedia = function() {
    window.stopMediaAutoSlide();
    if (!window.productMedia) return;
    const nextIndex = (window.currentMediaIndex + 1) % window.productMedia.length;
    window.changeMainMedia(nextIndex);
};

// Previous media
window.prevMedia = function() {
    window.stopMediaAutoSlide();
    if (!window.productMedia) return;
    const prevIndex = (window.currentMediaIndex - 1 + window.productMedia.length) % window.productMedia.length;
    window.changeMainMedia(prevIndex);
};

// Add swipe support to media container
window.initMediaSwipe = function() {
    const container = document.querySelector('.main-media-container');
    if (!container) return;
    
    let touchStartX = 0;
    let touchEndX = 0;
    
    container.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        // Stop auto-slide immediately on touch
        window.stopMediaAutoSlide();
        console.log('🛑 Auto-slide stopped - user touched image');
    }, false);
    
    container.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - show next
                console.log('👈 Swiped left - showing next image');
                window.nextMedia();
            } else {
                // Swiped right - show previous
                console.log('👉 Swiped right - showing previous image');
                window.prevMedia();
            }
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!window.productMedia) return;
        
        if (e.key === 'ArrowLeft') {
            window.stopMediaAutoSlide();
            window.prevMedia();
        } else if (e.key === 'ArrowRight') {
            window.stopMediaAutoSlide();
            window.nextMedia();
        }
    });
};

// View full-size image in new tab
window.viewFullImage = function(src) {
    // Create fullscreen image overlay
    const overlay = document.createElement('div');
    overlay.id = 'imageOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: zoom-out;
        animation: fadeIn 0.3s ease;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
        max-width: 95%;
        max-height: 95%;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        animation: zoomIn 0.3s ease;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        color: #333;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        z-index: 10000;
    `;
    
    closeBtn.onmouseover = () => {
        closeBtn.style.background = '#ff4444';
        closeBtn.style.color = 'white';
        closeBtn.style.transform = 'scale(1.1)';
    };
    
    closeBtn.onmouseout = () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        closeBtn.style.color = '#333';
        closeBtn.style.transform = 'scale(1)';
    };
    
    const closeOverlay = () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.body.style.overflow = 'auto';
        }, 300);
    };
    
    closeBtn.onclick = closeOverlay;
    overlay.onclick = (e) => {
        if (e.target === overlay) closeOverlay();
    };
    
    // Close on ESC key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeOverlay();
            document.removeEventListener('keydown', escHandler);
        }
    });
    
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
};

// Toggle description show more/less
window.toggleDescription = function() {
    const descText = document.getElementById('descText');
    const btn = document.querySelector('.btn-show-more span');
    
    if (descText.classList.contains('desc-collapsed')) {
        descText.classList.remove('desc-collapsed');
        btn.textContent = currentLanguage === 'en' ? 'Show Less' : 'បង្ហាញតិច';
    } else {
        descText.classList.add('desc-collapsed');
        btn.textContent = currentLanguage === 'en' ? 'Show More' : 'បង្ហាញបន្ថែម';
    }
};

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // ===== BUTTON VISIBILITY FIX =====
    // Stop aggressive checking when modal closes
    stopButtonVisibilityCheck();
    setTimeout(() => {
        ensureButtonsVisible();
    }, 100);
}

// Section Navigation
function initSectionNavigation() {
    loadSectionNavigation();
    initSectionNavigationEvents();
}

// Separate function for event binding only (to avoid circular calls)
function initSectionNavigationEvents() {
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Don't close modal if it's open
            const modal = document.getElementById('productModal');
            if (modal && modal.style.display === 'block') {
                console.log('⚠️ Modal is open, preventing section change');
                return;
            }
            
            const section = this.getAttribute('data-section');
            
            document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(section)?.classList.add('active');
        });
    });
}

// Load section navigation based on admin settings
function loadSectionNavigation() {
    const sectionNav = document.querySelector('.section-nav');
    if (!sectionNav) return;
    
    // Get section settings from config
    const sectionSettings = CONFIG.sectionSettings || {
        promotion: { enabled: true, nameEn: 'PROMOTION', nameKm: 'ការផ្តល់ជូន', order: 1 },
        event: { enabled: true, nameEn: 'EVENT', nameKm: 'ព្រឹត្តិការណ៍', order: 2 },
        products: { enabled: true, nameEn: 'ALL PRODUCT', nameKm: 'ផលិតផលទាំងអស់', order: 3 },
        problem: { enabled: true, nameEn: 'POST', nameKm: 'ប្រកាស', order: 4 }
    };
    
    // Create array of enabled sections with their settings
    const enabledSections = [];
    
    // Add default sections if enabled
    Object.entries(sectionSettings).forEach(([sectionId, settings]) => {
        if (settings.enabled) {
            enabledSections.push({
                id: sectionId,
                nameEn: settings.nameEn,
                nameKm: settings.nameKm,
                order: settings.order || 1,
                type: 'default'
            });
        }
    });
    
    // Add custom sections if enabled
    if (CONFIG.customSections && Array.isArray(CONFIG.customSections)) {
        CONFIG.customSections.forEach(section => {
            if (section.enabled && section.nameEn && section.nameKm) { // Validate section data
                enabledSections.push({
                    id: `custom-${section.id}`,
                    nameEn: section.nameEn,
                    nameKm: section.nameKm,
                    order: section.order || 5,
                    type: 'custom',
                    template: section.template,
                    items: section.items || [],
                    originalSection: section // Keep reference to original section
                });
            }
        });
    }
    
    // Sort sections by order
    enabledSections.sort((a, b) => a.order - b.order);
    
    // Clear existing buttons
    sectionNav.innerHTML = '';
    
    // Create section buttons
    enabledSections.forEach((section, index) => {
        // Skip sections with empty names
        if (!section.nameEn || !section.nameKm) return;
        
        const btn = document.createElement('button');
        btn.className = `section-btn ${index === 0 ? 'active' : ''}`;
        btn.setAttribute('data-section', section.id);
        btn.setAttribute('data-en', section.nameEn);
        btn.setAttribute('data-km', section.nameKm);
        btn.textContent = currentLanguage === 'en' ? section.nameEn : section.nameKm;
        sectionNav.appendChild(btn);
        
        // Create corresponding content section if it doesn't exist (for custom sections)
        if (section.type === 'custom' && section.originalSection) {
            createCustomSectionContent(section.originalSection);
        }
    });
    
    // Show first enabled section
    if (enabledSections.length > 0) {
        const firstSection = enabledSections[0];
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(firstSection.id)?.classList.add('active');
    }
}

// Create content section for custom sections
function createCustomSectionContent(section) {
    const container = document.querySelector('.container');
    if (!container) return;
    
    console.log('Creating custom section content for:', section); // Debug log
    
    // Remove existing section if it exists (for template changes)
    const existingSection = document.getElementById(`custom-${section.id}`);
    if (existingSection) {
        existingSection.remove();
    }
    
    const sectionElement = document.createElement('section');
    sectionElement.id = `custom-${section.id}`; // Fix: Add 'custom-' prefix
    sectionElement.className = 'content-section';
    
    let contentHTML = `
        <h2 class="section-title" data-en="${section.nameEn}" data-km="${section.nameKm}">
            ${currentLanguage === 'en' ? section.nameEn : section.nameKm}
        </h2>
    `;
    
    // Generate content based on template type - Fix: Use correct IDs with 'custom-' prefix
    switch (section.template) {
        case 'card':
            contentHTML += `<div class="custom-card-grid promotion-grid" id="custom-${section.id}-grid"></div>`;
            break;
        case 'list':
            contentHTML += `<div class="custom-list-view post-grid" id="custom-${section.id}-list"></div>`;
            break;
        case 'banner':
            contentHTML += `<div class="custom-banner-view event-grid" id="custom-${section.id}-banner"></div>`;
            break;
        case 'custom':
            contentHTML += `<div class="custom-content" id="custom-${section.id}-content"></div>`;
            break;
        default:
            contentHTML += `<div class="custom-default" id="custom-${section.id}-default"></div>`;
    }
    
    sectionElement.innerHTML = contentHTML;
    
    console.log('Created section HTML:', contentHTML); // Debug log
    
    // Insert before the last section (usually posts/problem section)
    const lastSection = container.querySelector('#problem') || container.lastElementChild;
    container.insertBefore(sectionElement, lastSection);
    
    console.log('Section inserted into DOM, now loading content...'); // Debug log
    
    // Load content for this section immediately
    setTimeout(() => {
        console.log('Loading content for section after timeout:', section);
        loadCustomSectionContent(section);
    }, 100);
}

// Update existing custom section content
function updateCustomSectionContent(section) {
    const sectionElement = document.getElementById(`custom-${section.id}`); // Fix: Add 'custom-' prefix
    if (!sectionElement) return;
    
    // Update title
    const title = sectionElement.querySelector('.section-title');
    if (title) {
        title.setAttribute('data-en', section.nameEn);
        title.setAttribute('data-km', section.nameKm);
        title.textContent = currentLanguage === 'en' ? section.nameEn : section.nameKm;
    }
    
    // Reload content
    loadCustomSectionContent(section);
}

// Load content for custom sections
function loadCustomSectionContent(section) {
    console.log('Loading content for section:', section); // Debug log
    
    if (!section || !section.id) {
        console.error('Invalid section provided to loadCustomSectionContent:', section);
        return;
    }
    
    if (!section.items || section.items.length === 0) {
        console.log('No items found for section:', section.id);
        // Find the correct container based on template
        let container;
        switch (section.template) {
            case 'card':
                container = document.getElementById(`custom-${section.id}-grid`);
                break;
            case 'list':
                container = document.getElementById(`custom-${section.id}-list`);
                break;
            case 'banner':
                container = document.getElementById(`custom-${section.id}-banner`);
                break;
            case 'custom':
                container = document.getElementById(`custom-${section.id}-content`);
                break;
            default:
                container = document.getElementById(`custom-${section.id}-default`);
        }
        
        console.log('Looking for container:', container ? 'Found' : 'Not found', container);
        
        if (container) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No content yet. Add items from the admin panel.</p>';
        }
        return;
    }
    
    const enabledItems = section.items.filter(item => item.enabled);
    console.log('Enabled items:', enabledItems); // Debug log
    
    if (enabledItems.length === 0) {
        console.log('No enabled items for section:', section.id);
        return;
    }
    
    switch (section.template) {
        case 'card':
            console.log('Loading card template for section:', section.id);
            loadCustomCardContent(section, enabledItems);
            break;
        case 'list':
            console.log('Loading list template for section:', section.id);
            loadCustomListContent(section, enabledItems);
            break;
        case 'banner':
            console.log('Loading banner template for section:', section.id);
            loadCustomBannerContent(section, enabledItems);
            break;
        case 'custom':
            console.log('Loading custom template for section:', section.id);
            loadCustomHtmlContent(section, enabledItems);
            break;
        default:
            console.log('Loading default template for section:', section.id);
            loadCustomDefaultContent(section, enabledItems);
    }
}

// Load card-style content
function loadCustomCardContent(section, items) {
    const grid = document.getElementById(`custom-${section.id}-grid`);
    console.log('Looking for grid:', `custom-${section.id}-grid`, 'Found:', grid); // Debug log
    
    if (!grid) {
        console.error('Grid not found for section:', section.id);
        return;
    }
    
    grid.innerHTML = '';
    grid.className = 'custom-card-grid promotion-grid'; // Use existing promotion grid styles
    
    if (items.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:#999;padding:40px;grid-column:1/-1;">No content yet. Add items from the admin panel.</p>';
        return;
    }
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'promotion-card';
        if (item.link) {
            card.style.cursor = 'pointer';
            card.onclick = () => window.open(item.link, '_blank');
        }
        
        card.innerHTML = `
            ${item.image ? `
                <div class="promotion-image-container">
                    <img src="${getImageSrc(item.image)}" alt="${item.title}" class="promotion-image" 
                         data-original-src="${item.image}" onerror="handleImageError(this)" loading="lazy">
                </div>
            ` : ''}
            <div class="promotion-content">
                <div class="promotion-title">${item.title || 'No title'}</div>
                ${item.content ? `<div class="promotion-description">${item.content}</div>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
    
    console.log('Card content loaded successfully for section:', section.id); // Debug log
}

// Load list-style content
function loadCustomListContent(section, items) {
    const list = document.getElementById(`custom-${section.id}-list`);
    console.log('Looking for list:', `custom-${section.id}-list`, 'Found:', list); // Debug log
    
    if (!list) {
        console.error('List not found for section:', section.id);
        return;
    }
    
    list.innerHTML = '';
    list.className = 'custom-list-view post-grid'; // Use existing post grid styles
    
    items.forEach(item => {
        const listItem = document.createElement('div');
        listItem.className = 'post-card';
        if (item.link) {
            listItem.style.cursor = 'pointer';
            listItem.onclick = () => window.open(item.link, '_blank');
        }
        
        listItem.innerHTML = `
            ${item.image ? `<div class="post-image-square"><img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'"></div>` : ''}
            <div class="post-content">
                <div class="post-title">${item.title || 'No title'}</div>
                ${item.content ? `<div class="post-article">${item.content}</div>` : ''}
            </div>
        `;
        list.appendChild(listItem);
    });
}

// Load banner-style content
function loadCustomBannerContent(section, items) {
    const banner = document.getElementById(`custom-${section.id}-banner`);
    console.log('Looking for banner:', `custom-${section.id}-banner`, 'Found:', banner); // Debug log
    
    if (!banner) {
        console.error('Banner not found for section:', section.id);
        return;
    }
    
    banner.innerHTML = '';
    banner.className = 'custom-banner-view event-grid'; // Use existing event grid styles
    
    items.forEach(item => {
        const bannerItem = document.createElement('div');
        bannerItem.className = 'event-card';
        if (item.link) {
            bannerItem.style.cursor = 'pointer';
            bannerItem.onclick = () => window.open(item.link, '_blank');
        }
        
        bannerItem.innerHTML = `
            ${item.image ? `<div class="event-image-square"><img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'"></div>` : ''}
            <div class="event-content">
                <div class="event-title">${item.title || 'No title'}</div>
                ${item.content ? `<div class="event-description">${item.content}</div>` : ''}
            </div>
        `;
        banner.appendChild(bannerItem);
    });
}

// Load custom HTML content
function loadCustomHtmlContent(section, items) {
    const content = document.getElementById(`custom-${section.id}-content`);
    console.log('Looking for content:', `custom-${section.id}-content`, 'Found:', content); // Debug log
    
    if (!content) {
        console.error('Content not found for section:', section.id);
        return;
    }
    
    content.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'custom-html-item';
        div.style.marginBottom = '20px';
        
        let html = '';
        if (item.title) html += `<h3>${item.title}</h3>`;
        if (item.content) html += `<div>${item.content}</div>`;
        if (item.image) html += `<img src="${item.image}" alt="${item.title}" style="max-width:100%;height:auto;margin:10px 0;" loading="lazy" onerror="this.style.display='none'">`;
        if (item.link) html = `<a href="${item.link}" target="_blank" style="text-decoration:none;color:inherit;">${html}</a>`;
        
        div.innerHTML = html;
        content.appendChild(div);
    });
}

// Load default content
function loadCustomDefaultContent(section, items) {
    const content = document.getElementById(`custom-${section.id}-default`);
    console.log('Looking for default content:', `custom-${section.id}-default`, 'Found:', content); // Debug log
    
    if (!content) {
        console.error('Default content not found for section:', section.id);
        return;
    }
    
    content.innerHTML = '';
    
    if (items.length === 0) {
        content.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">${section.description || 'No content yet'}</p>`;
        return;
    }
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.style.padding = '15px';
        div.style.marginBottom = '15px';
        div.style.border = '1px solid #ddd';
        div.style.borderRadius = '8px';
        
        div.innerHTML = `
            <h4>${item.title || 'No title'}</h4>
            ${item.content ? `<p>${item.content}</p>` : ''}
            ${item.image ? `<img src="${item.image}" alt="${item.title}" style="max-width:100%;height:auto;margin:10px 0;" loading="lazy" onerror="this.style.display='none'">` : ''}
            ${item.link ? `<a href="${item.link}" target="_blank" style="color:#3498db;">View More →</a>` : ''}
        `;
        
        content.appendChild(div);
    });
}

// Language Toggle with Logo Method
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'km' : 'en';
    updateLanguageDisplay();
    updateAllLanguageContent();
    localStorage.setItem('language', currentLanguage);
}

// Update language display with logo method
function updateLanguageDisplay() {
    const langButton = document.querySelector('.lang-toggle');
    const langText = document.getElementById('lang-text');
    const mobileLangText = document.getElementById('mobile-lang-text');
    
    // Check if custom flag images are available
    const hasCustomFlags = CONFIG.languageFlags && 
                          (CONFIG.languageFlags.en || CONFIG.languageFlags.kh);
    
    let displayContent = '';
    
    if (currentLanguage === 'en') {
        if (hasCustomFlags && CONFIG.languageFlags.en) {
            // Use custom English flag image
            displayContent = `<img src="${CONFIG.languageFlags.en}" style="width: 32px; height: 24px; object-fit: cover; border-radius: 3px; margin-right: 8px; vertical-align: middle; display: inline-block;"><span style="vertical-align: middle; display: inline-block; font-size: 16px; font-weight: 600;">English</span>`;
        } else {
            // Show Cambodia flag with English text for consistency
            displayContent = `<span style="font-size: 24px; margin-right: 8px; vertical-align: middle; display: inline-block;">��</span><span style="vertical-align: middle; display: inline-block; font-size: 16px; font-weight: 600;">English</span>`;
        }
        if (langButton) langButton.setAttribute('title', 'Switch to Khmer');
    } else {
        if (hasCustomFlags && CONFIG.languageFlags.kh) {
            // Use custom Khmer flag image
            displayContent = `<img src="${CONFIG.languageFlags.kh}" style="width: 32px; height: 24px; object-fit: cover; border-radius: 3px; margin-right: 8px; vertical-align: middle; display: inline-block;"><span style="vertical-align: middle; display: inline-block; font-size: 16px; font-weight: 600;">ខ្មែរ</span>`;
        } else {
            // Use Cambodia flag with Khmer text (default style)
            displayContent = `<span style="font-size: 24px; margin-right: 8px; vertical-align: middle; display: inline-block;">🇰🇭</span><span style="vertical-align: middle; display: inline-block; font-size: 16px; font-weight: 600;">ខ្មែរ</span>`;
        }
        if (langButton) langButton.setAttribute('title', 'Switch to English');
    }
    
    // Update both desktop and mobile language displays
    if (langText) {
        langText.innerHTML = displayContent;
    }
    if (mobileLangText) {
        mobileLangText.innerHTML = displayContent;
    }
}

// Update all language content on the page
function updateAllLanguageContent() {
    document.querySelectorAll('[data-en][data-km]').forEach(el => {
        const content = el.getAttribute(`data-${currentLanguage}`);
        if (content) {
            // Special handling for About Us content to preserve line breaks
            if (el.closest('.about-info')) {
                el.innerHTML = content.replace(/\n/g, '<br>');
            } else {
                el.textContent = content;
            }
        }
    });
    
    // Update any HTML content with language attributes
    document.querySelectorAll('[data-html-en][data-html-km]').forEach(el => {
        const content = el.getAttribute(`data-html-${currentLanguage}`);
        if (content) {
            el.innerHTML = content;
        }
    });
}

// Initialize language on page load
function initializeLanguage() {
    // Check if user has a saved language preference
    const savedLanguage = localStorage.getItem('language');
    
    if (savedLanguage) {
        // User has visited before, use their saved preference
        currentLanguage = savedLanguage;
    } else {
        // New visitor - use admin's default language setting
        const defaultLanguage = CONFIG.defaultLanguage || 'en';
        currentLanguage = defaultLanguage;
        
        // Save the default language as user's preference
        localStorage.setItem('language', defaultLanguage);
        
        console.log(`🌐 New visitor detected. Using default language: ${defaultLanguage === 'en' ? 'English' : 'Khmer'}`);
    }
    
    updateLanguageDisplay();
    updateAllLanguageContent();
}

// Language Upload Helper - Easy method for content creators
function createLanguageUploadField(fieldName, placeholder = {}) {
    const defaultPlaceholder = {
        en: `Enter ${fieldName} in English`,
        km: `Enter ${fieldName} in Khmer`
    };
    
    const placeholders = { ...defaultPlaceholder, ...placeholder };
    
    return `
        <div class="language-upload-field">
            <div class="language-tabs">
                <button type="button" class="lang-tab active" data-lang="en" onclick="switchLanguageTab(this, '${fieldName}')">
                    🇺🇸 English
                </button>
                <button type="button" class="lang-tab" data-lang="km" onclick="switchLanguageTab(this, '${fieldName}')">
                    🇰🇭 ខ្មែរ
                </button>
            </div>
            <div class="language-inputs">
                <div class="lang-input active" data-lang="en">
                    <textarea name="${fieldName}En" placeholder="${placeholders.en}" class="form-control"></textarea>
                </div>
                <div class="lang-input" data-lang="km">
                    <textarea name="${fieldName}Km" placeholder="${placeholders.km}" class="form-control"></textarea>
                </div>
            </div>
        </div>
    `;
}

// Switch language tab in upload forms
function switchLanguageTab(button, fieldName) {
    const container = button.closest('.language-upload-field');
    
    // Update tab buttons
    container.querySelectorAll('.lang-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    button.classList.add('active');
    
    // Update input visibility
    const targetLang = button.getAttribute('data-lang');
    container.querySelectorAll('.lang-input').forEach(input => {
        input.classList.remove('active');
        if (input.getAttribute('data-lang') === targetLang) {
            input.classList.add('active');
        }
    });
}

// Menu Toggle
function toggleMenu() {
    document.querySelector('.nav-buttons').classList.toggle('active');
}

// Show Sections
function showSection(section) {
    if (section === 'contact') {
        document.getElementById('contactModal').style.display = 'block';
    } else if (section === 'about') {
        document.getElementById('aboutModal').style.display = 'block';
    }
}

function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
}

function closeAboutModal() {
    document.getElementById('aboutModal').style.display = 'none';
}

// Load About Us content
function loadAboutUsContent() {
    const aboutModal = document.getElementById('aboutModal');
    if (!aboutModal) return;
    
    // Set default values if not configured
    if (!CONFIG.aboutUs) {
        CONFIG.aboutUs = {
            titleEn: 'About Us',
            titleKm: 'អំពីយើង',
            contentEn: 'Welcome to our store!',
            contentKm: 'សូមស្វាគមន៍មកកាន់ហាងរបស់យើង!'
        };
    }
    
    // Update the modal title
    const titleElement = aboutModal.querySelector('h2');
    if (titleElement) {
        titleElement.setAttribute('data-en', CONFIG.aboutUs.titleEn);
        titleElement.setAttribute('data-km', CONFIG.aboutUs.titleKm);
        titleElement.textContent = currentLanguage === 'en' ? CONFIG.aboutUs.titleEn : CONFIG.aboutUs.titleKm;
    }
    
    // Update the modal content - handle multi-line content
    const contentElement = aboutModal.querySelector('.about-info p');
    if (contentElement) {
        contentElement.setAttribute('data-en', CONFIG.aboutUs.contentEn);
        contentElement.setAttribute('data-km', CONFIG.aboutUs.contentKm);
        
        // Use innerHTML to preserve line breaks
        const content = currentLanguage === 'en' ? CONFIG.aboutUs.contentEn : CONFIG.aboutUs.contentKm;
        contentElement.innerHTML = content.replace(/\n/g, '<br>');
    }
    
    console.log('✅ About Us content loaded:', CONFIG.aboutUs);
}

// Load contact info
function loadContactInfo() {
    const contactDiv = document.getElementById('contactInfo');
    if (!contactDiv) return;
    
    // Ensure CONFIG.contact exists
    if (!CONFIG.contact) {
        CONFIG.contact = {
            phone: '',
            email: '',
            address: '',
            whatsapp: '',
            telegram: '',
            facebook: '',
            messenger: ''
        };
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
    
    if (CONFIG.contact.phone) {
        html += `
            <a href="tel:${CONFIG.contact.phone}" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #ff6a00; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#ff6a00'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Phone</div>
                    <div style="font-weight: 600; font-size: 16px;">${CONFIG.contact.phone}</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.email) {
        html += `
            <a href="mailto:${CONFIG.contact.email}" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #ff6a00; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#ff6a00'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Email</div>
                    <div style="font-weight: 600; font-size: 16px;">${CONFIG.contact.email}</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.address) {
        html += `
            <div style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #ff6a00; border-radius: 10px; color: #333;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Address</div>
                    <div style="font-weight: 600; font-size: 16px;">${CONFIG.contact.address}</div>
                </div>
            </div>
        `;
    }
    
    if (CONFIG.contact.whatsapp) {
        html += `
            <a href="https://wa.me/${CONFIG.contact.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #25D366; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#25D366'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">WhatsApp</div>
                    <div style="font-weight: 600; font-size: 16px;">${CONFIG.contact.whatsapp}</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.telegram) {
        html += `
            <a href="${CONFIG.contact.telegram}" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #0088cc; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#0088cc'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Telegram</div>
                    <div style="font-weight: 600; font-size: 16px;">Open Telegram</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.facebook) {
        html += `
            <a href="${CONFIG.contact.facebook}" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #1877f2; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#1877f2'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Facebook</div>
                    <div style="font-weight: 600; font-size: 16px;">Visit Page</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.messenger) {
        html += `
            <a href="${CONFIG.contact.messenger}" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #0084ff; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#0084ff'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Messenger</div>
                    <div style="font-weight: 600; font-size: 16px;">Chat on Messenger</div>
                </div>
            </a>
        `;
    }
    
    html += '</div>';
    
    contactDiv.innerHTML = html || '<p style="color: #999; text-align: center; padding: 20px;">Contact information coming soon...</p>';
}

// Show contact options modal
function showContactOptions() {
    const modal = document.getElementById('productModal');
    const currentDetail = document.getElementById('productDetail');
    
    // Get the current product/promotion data from the modal
    // We'll create a contact options menu
    const contactHTML = `
        <div class="contact-options-container">
            <h3 style="text-align: center; margin-bottom: 20px;">Choose Contact Method</h3>
            <div class="contact-options-grid">
                <button class="contact-option-btn" onclick="contactPhone('${window.currentProductContact?.phone || ''}')">
                    <span class="contact-option-icon">📞</span>
                    <span class="contact-option-text">Phone</span>
                </button>
                <button class="contact-option-btn" onclick="contactWhatsApp('${window.currentProductContact?.whatsapp || ''}')">
                    <span class="contact-option-icon">💬</span>
                    <span class="contact-option-text">WhatsApp</span>
                </button>
                <button class="contact-option-btn" onclick="contactTelegram('${window.currentProductContact?.telegram || ''}')">
                    <span class="contact-option-icon">✈️</span>
                    <span class="contact-option-text">Telegram</span>
                </button>
                <button class="contact-option-btn" onclick="contactFacebook('${window.currentProductContact?.facebook || ''}')">
                    <span class="contact-option-icon">👍</span>
                    <span class="contact-option-text">Facebook</span>
                </button>
                <button class="contact-option-btn" onclick="contactMessenger('${window.currentProductContact?.messenger || ''}')">
                    <span class="contact-option-icon">💭</span>
                    <span class="contact-option-text">Messenger</span>
                </button>
            </div>
            <button class="btn-close-options" onclick="closeContactOptions()">Close</button>
        </div>
    `;
    
    currentDetail.innerHTML = contactHTML;
}

// Close contact options
function closeContactOptions() {
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Contact Methods
function contactPhone(phone) {
    if (phone && phone.trim()) {
        window.open(`tel:${phone}`, '_self');
    } else {
        alert('Phone number not available for this product');
    }
}

function contactWhatsApp(whatsapp) {
    if (whatsapp && whatsapp.trim()) {
        window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    } else {
        alert('WhatsApp not available for this product');
    }
}

function contactTelegram(telegram) {
    if (telegram && telegram.trim()) {
        window.open(telegram, '_blank');
    } else {
        alert('Telegram not available for this product');
    }
}

function contactFacebook(facebook) {
    if (facebook && facebook.trim()) {
        window.open(facebook, '_blank');
    } else {
        alert('Facebook not available for this product');
    }
}

function contactMessenger(messenger) {
    if (messenger && messenger.trim()) {
        window.open(messenger, '_blank');
    } else {
        alert('Messenger not available for this product');
    }
}

// Post Section
function openPostForm() {
    if (CONFIG.problemSolveLink) {
        window.open(CONFIG.problemSolveLink, '_blank');
    } else {
        alert('Post link not configured');
    }
}

// Show Post Detail Modal - Enhanced like product detail
function showPostDetail(postId) {
    const post = CONFIG.posts.find(p => p.id === postId);
    if (!post) return;
    
    let mediaHTML = '';
    if (post.type === 'video' && (post.embedUrl || post.videoUrl)) {
        const originalUrl = post.videoUrl || post.embedUrl;
        const embedUrl = convertToEmbedUrl(originalUrl);
        
        console.log('Post Video - Original URL:', originalUrl);
        console.log('Post Video - Embed URL:', embedUrl);
        
        // Create video embed like product system
        mediaHTML = `
            <div class="post-detail-media">
                <div class="video-container" style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; overflow: hidden; border-radius: 10px; margin-bottom: 20px;">
                    <iframe 
                        src="${embedUrl}" 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                        frameborder="0" 
                        allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        loading="lazy">
                    </iframe>
                </div>
                <div class="video-fallback" style="text-align: center; margin-top: 10px;">
                    <a href="${originalUrl}" target="_blank" style="color: #007bff; text-decoration: none;">
                        🔗 Open video in new tab if not loading
                    </a>
                </div>
            </div>
        `;
    } else if (post.image) {
        // Create image gallery like product system
        let allImages = [post.image];
        if (post.images && post.images.length > 0) {
            allImages = allImages.concat(post.images);
        }
        
        mediaHTML = `
            <div class="post-detail-media">
                <div class="post-image-gallery">
                    <div class="main-image">
                        <img id="postMainImage" src="${post.image}" alt="${post.title}" style="width:100%;border-radius:10px;">
                    </div>
        `;
        
        if (allImages.length > 1) {
            mediaHTML += `
                    <div class="image-thumbnails" style="display: flex; gap: 10px; margin-top: 15px; overflow-x: auto;">
            `;
            allImages.forEach((img, index) => {
                mediaHTML += `
                        <img src="${img}" 
                             alt="Image ${index + 1}" 
                             class="thumbnail ${index === 0 ? 'active' : ''}"
                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; cursor: pointer; border: 2px solid ${index === 0 ? '#007bff' : 'transparent'};"
                             onclick="changePostImage('${img}', this)"
                             onerror="this.style.display='none'">
                `;
            });
            mediaHTML += `
                    </div>
            `;
        }
        
        mediaHTML += `
                </div>
            </div>
        `;
    }
    
    const content = `
        <div class="post-detail">
            <h2 class="post-detail-title" data-en="${post.title}" data-km="${post.titleKm}">
                ${currentLanguage === 'en' ? post.title : post.titleKm}
            </h2>
            ${mediaHTML}
            <div class="post-detail-content">
                <div class="post-full-content" data-en="${post.content}" data-km="${post.contentKm}">
                    ${currentLanguage === 'en' ? post.content : post.contentKm}
                </div>
                ${post.link ? `<div class="post-link"><a href="${post.link}" target="_blank" class="btn-primary">Read More</a></div>` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('postDetail').innerHTML = content;
    document.getElementById('postModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Change post image function (like product system)
function changePostImage(imageSrc, thumbnail) {
    document.getElementById('postMainImage').src = imageSrc;
    
    // Update thumbnail borders
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.style.border = '2px solid transparent';
    });
    thumbnail.style.border = '2px solid #007bff';
}

// Close Post Modal
function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Load Navigation Style
function loadNavigationStyle() {
    const navStyle = CONFIG.navigationStyle || 'solid';
    applyNavigationStyle(navStyle);
}

function applyNavigationStyle(style) {
    const topNav = document.querySelector('.top-nav');
    const sectionNav = document.querySelector('.section-nav');
    if (!topNav || !sectionNav) return;
    
    topNav.classList.remove('nav-glass', 'nav-gradient', 'nav-solid', 'nav-custom');
    sectionNav.classList.remove('nav-glass', 'nav-gradient', 'nav-solid', 'nav-custom');
    
    switch(style) {
        case 'glass':
            topNav.classList.add('nav-glass');
            sectionNav.classList.add('nav-glass');
            break;
        case 'gradient':
            topNav.classList.add('nav-gradient');
            sectionNav.classList.add('nav-gradient');
            break;
        case 'custom':
            topNav.classList.add('nav-custom');
            sectionNav.classList.add('nav-custom');
            applyCustomNavColors();
            break;
        default:
            topNav.classList.add('nav-solid');
            sectionNav.classList.add('nav-solid');
    }
}

function applyCustomNavColors() {
    if (!CONFIG.customNavColors) return;
    
    const oldStyle = document.getElementById('custom-nav-style');
    if (oldStyle) oldStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'custom-nav-style';
    style.innerHTML = `
        .nav-custom { background: ${CONFIG.customNavColors.background} !important; }
        .nav-custom .nav-btn, .nav-custom .logo, .nav-custom .section-btn { color: ${CONFIG.customNavColors.text} !important; }
        .nav-custom .nav-btn { border-color: ${CONFIG.customNavColors.text} !important; }
        .nav-custom .section-btn.active { background: ${CONFIG.customNavColors.activeButton} !important; }
    `;
    document.head.appendChild(style);
}
