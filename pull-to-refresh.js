// Pull-to-Refresh for Mobile Devices - SILENT VERSION
// Implements native-like pull-to-refresh behavior without any visual feedback
// Optimized for both Android and iOS

class PullToRefresh {
    constructor(options = {}) {
        this.options = {
            threshold: 80, // Distance to trigger refresh
            maxDistance: 120, // Maximum pull distance
            resistance: 2.5, // Pull resistance factor
            refreshDelay: 800, // Delay before refresh completes
            triggerElement: document.body, // Element to attach pull events
            onRefresh: () => window.location.reload(), // Refresh callback
            ...options
        };

        this.isEnabled = true;
        this.isPulling = false;
        this.startY = 0;
        this.currentY = 0;
        this.pullDistance = 0;
        this.isRefreshing = false;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        this.init();
    }

    init() {
        // Only enable on mobile devices
        if (!this.isMobileDevice()) {
            return;
        }

        this.attachEventListeners();
        console.log('✅ Silent pull-to-refresh initialized for', this.isIOS ? 'iOS' : 'Android');
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }

    attachEventListeners() {
        const element = this.options.triggerElement;

        // Touch events with proper passive handling for iOS
        element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
        element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        element.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    }

    onTouchStart(event) {
        if (!this.canPull()) return;

        this.startY = event.touches[0].clientY;
        this.currentY = this.startY;
        this.isPulling = false;
    }

    onTouchMove(event) {
        if (!this.canPull() || this.isRefreshing) return;

        // Check if user is inside a modal
        if (event.target.closest('.modal-content')) {
            return;
        }

        this.currentY = event.touches[0].clientY;
        const deltaY = this.currentY - this.startY;

        // Only allow pulling down when at the top of the page
        if (deltaY > 0 && window.scrollY === 0) {
            // For iOS, be more gentle with preventDefault
            if (this.isIOS && deltaY > 10) {
                event.preventDefault();
            } else if (!this.isIOS) {
                event.preventDefault();
            }
            
            this.isPulling = true;
            this.pullDistance = Math.min(deltaY / this.options.resistance, this.options.maxDistance);
        }
    }

    onTouchEnd() {
        if (!this.isPulling || this.isRefreshing) return;

        if (this.pullDistance >= this.options.threshold) {
            this.triggerRefresh();
        } else {
            this.resetPull();
        }
    }

    canPull() {
        // Don't allow pull if modal is open
        const openModal = document.querySelector('.modal[style*="display: block"]');
        if (openModal) return false;
        
        return this.isEnabled && !this.isRefreshing && window.scrollY === 0;
    }

    triggerRefresh() {
        this.isRefreshing = true;
        
        // Add subtle haptic feedback on supported devices (silent feedback)
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // Trigger refresh after delay - NO VISUAL FEEDBACK
        setTimeout(() => {
            this.options.onRefresh();
        }, this.options.refreshDelay);
    }

    resetPull() {
        this.isPulling = false;
        this.pullDistance = 0;
        this.isRefreshing = false;
    }

    // Public methods
    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        this.resetPull();
    }

    destroy() {
        // Clean up if needed
        this.isEnabled = false;
    }
}

// Custom refresh function that reloads content silently
function customRefresh() {
    // Silent refresh - no messages, no notifications
    window.location.reload();
}

// Enhanced initialization with mobile detection
function initializePullToRefresh() {
    // Only initialize on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) ||
                     (navigator.maxTouchPoints > 0);
    
    if (!isMobile) {
        return;
    }
    
    // Initialize silent pull-to-refresh
    window.pullToRefresh = new PullToRefresh({
        onRefresh: customRefresh,
        threshold: 80,
        maxDistance: 120,
        refreshDelay: 600,
        resistance: 2.2
    });
    
    // Add mobile-specific optimizations
    document.body.style.overscrollBehavior = 'contain';
    document.documentElement.style.overscrollBehavior = 'contain';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePullToRefresh);
} else {
    initializePullToRefresh();
}