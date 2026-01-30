// iOS Modal Scroll and Touch Behavior Fix
// Makes iOS modals behave like Android - smooth scroll, no swipe-to-close

(function() {
    'use strict';
    
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (!isIOS) {
        console.log('Not iOS, skipping iOS-specific fixes');
        return;
    }
    
    console.log('iOS detected, applying modal fixes');
    
    // Track touch events to prevent unwanted swipe-to-close
    let touchStartY = 0;
    let touchStartX = 0;
    let isScrolling = false;
    
    // Function to handle modal opening
    function handleModalOpen(modal) {
        if (!modal) return;
        
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) return;
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        // Enable smooth scrolling on modal content
        modalContent.style.webkitOverflowScrolling = 'touch';
        modalContent.style.overscrollBehavior = 'contain';
        
        // Add touch event listeners to prevent swipe-to-close
        modalContent.addEventListener('touchstart', handleTouchStart, { passive: false });
        modalContent.addEventListener('touchmove', handleTouchMove, { passive: false });
        modalContent.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
    
    // Function to handle modal closing
    function handleModalClose(modal) {
        if (!modal) return;
        
        const modalContent = modal.querySelector('.modal-content');
        if (!modalContent) return;
        
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        
        // Remove touch event listeners
        modalContent.removeEventListener('touchstart', handleTouchStart);
        modalContent.removeEventListener('touchmove', handleTouchMove);
        modalContent.removeEventListener('touchend', handleTouchEnd);
    }
    
    // Handle touch start
    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isScrolling = false;
    }
    
    // Handle touch move
    function handleTouchMove(e) {
        if (!e.touches || e.touches.length === 0) return;
        
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        const deltaY = touchY - touchStartY;
        const deltaX = touchX - touchStartX;
        
        const modalContent = e.currentTarget;
        const scrollTop = modalContent.scrollTop;
        const scrollHeight = modalContent.scrollHeight;
        const clientHeight = modalContent.clientHeight;
        
        // Determine if user is scrolling vertically or horizontally
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            isScrolling = true;
            
            // Prevent pull-to-refresh at top
            if (scrollTop === 0 && deltaY > 0) {
                e.preventDefault();
                return;
            }
            
            // Prevent overscroll at bottom
            if (scrollTop + clientHeight >= scrollHeight && deltaY < 0) {
                e.preventDefault();
                return;
            }
        }
    }
    
    // Handle touch end
    function handleTouchEnd(e) {
        isScrolling = false;
    }
    
    // Observe modal display changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const modal = mutation.target;
                const isVisible = window.getComputedStyle(modal).display !== 'none';
                
                if (isVisible) {
                    handleModalOpen(modal);
                } else {
                    handleModalClose(modal);
                }
            }
        });
    });
    
    // Start observing all modals
    function initModalObserver() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(function(modal) {
            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['style']
            });
            
            // Check if modal is already open
            if (window.getComputedStyle(modal).display !== 'none') {
                handleModalOpen(modal);
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModalObserver);
    } else {
        initModalObserver();
    }
    
    // Also handle programmatic modal opening
    const originalShowProductDetail = window.showProductDetail;
    if (originalShowProductDetail) {
        window.showProductDetail = function() {
            originalShowProductDetail.apply(this, arguments);
            setTimeout(function() {
                const modal = document.getElementById('productModal');
                if (modal && window.getComputedStyle(modal).display !== 'none') {
                    handleModalOpen(modal);
                }
            }, 100);
        };
    }
    
    const originalShowPromotionDetail = window.showPromotionDetail;
    if (originalShowPromotionDetail) {
        window.showPromotionDetail = function() {
            originalShowPromotionDetail.apply(this, arguments);
            setTimeout(function() {
                const modal = document.getElementById('productModal');
                if (modal && window.getComputedStyle(modal).display !== 'none') {
                    handleModalOpen(modal);
                }
            }, 100);
        };
    }
    
    // Prevent iOS momentum scrolling issues
    document.addEventListener('touchmove', function(e) {
        // Allow scrolling inside modals
        if (e.target.closest('.modal-content')) {
            return;
        }
        
        // Prevent default for everything else when modal is open
        const openModal = document.querySelector('.modal[style*="display: block"]');
        if (openModal) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent modal from closing on background touch/swipe
    document.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(function(modal) {
            if (e.target === modal && window.getComputedStyle(modal).display !== 'none') {
                // Prevent closing modal by clicking background on iOS
                e.stopPropagation();
                e.preventDefault();
            }
        });
    }, true);
    
    console.log('iOS modal fixes applied successfully');
})();
