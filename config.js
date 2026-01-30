// Configuration file - Production Ready
// All data is managed via Admin Panel and stored in localStorage
const CONFIG = {
    // Selected theme (set by admin) - Default to Alibaba
    selectedTheme: 'alibaba',
    
    // Admin credentials - CHANGE THESE BEFORE DEPLOYMENT!
    admin: {
        username: 'adminsmey',
        password: '@@@@wrongpassword168'
    },

    // Available themes - Only Alibaba theme
    themes: {
        alibaba: {
            name: '🛒 Alibaba Orange',
            primary: '#ff6a00',
            primaryDark: '#e85d00',
            secondary: '#ffffff',
            background: 'linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)',
            accent: '#ff8533',
            cardShadow: '0 10px 30px rgba(255, 106, 0, 0.15)',
            navBackground: '#ffffff',
            navText: '#333333'
        }
    },

    // Banner slides - Add via Admin Panel
    banners: [],

    // Promotions - Add via Admin Panel
    promotions: [],

    // Events - Add via Admin Panel
    events: [],

    // Posts - Add via Admin Panel
    posts: [],

    // Categories - Default categories, edit via Admin Panel
    categories: [
        { id: 'all', name: 'All', nameKm: 'ទាំងអស់' }
    ],

    // Products - Add via Admin Panel
    products: [],

    // Contact info - Update via Admin Panel Settings
    contact: {
        phone: '',
        email: '',
        address: '',
        whatsapp: '',
        telegram: '',
        facebook: '',
        messenger: ''
    },

    // Logo - Update via Admin Panel Settings
    logo: '',
    
    // Site Settings - Update via Admin Panel Settings
    siteSettings: {
        title: 'Mobile Website',
        titleKm: 'គេហទំព័រទូរស័ព្ទ',
        favicon: '', // PNG, JPG, or GIF
        description: 'Welcome to our online store',
        descriptionKm: 'សូមស្វាគមន៍មកកាន់ហាងអនឡាញរបស់យើង',
        ogImage: '', // Image for social media sharing (Open Graph)
        keywords: 'online store, products, shopping'
    },

    // Navigation style settings
    navigationStyle: 'solid',
    customNavColors: {
        background: '#2c3e50',
        text: '#ffffff',
        activeButton: '#e74c3c'
    },

    // Post banner settings (formerly problem solve banner)
    problemSolveBanner: {
        enabled: false,
        image: '',
        link: '',
        titleEn: 'Latest Posts',
        titleKm: 'ប្រកាសថ្មីៗ',
        descriptionEn: 'Check out our latest updates!',
        descriptionKm: 'មើលការអាប់ដេតថ្មីៗរបស់យើង!'
    },

    // Post section link
    problemSolveLink: '',

    // Button Icon Settings - Customizable by admin
    buttonIcons: {
        phone: {
            icon: '📞',
            cartIcon: '🛒',
            label: 'Phone'
        },
        whatsapp: {
            icon: '💬',
            cartIcon: '🛒',
            label: 'WhatsApp'
        },
        telegram: {
            icon: '✈️',
            cartIcon: '🛒',
            label: 'Telegram'
        },
        facebook: {
            icon: '👍',
            cartIcon: '🛒',
            label: 'Facebook'
        },
        messenger: {
            icon: '💬',
            cartIcon: '🛒',
            label: 'Messenger'
        }
    },

    // Post section link
    problemSolveLink: '',

    // Dynamic menu items - Default menu configuration
    menuItems: [
        {
            id: "promotion",
            labelEn: "Promotion",
            labelKm: "ការផ្តល់ជូន",
            enabled: true,
            templateType: "promotion",
            order: 1
        },
        {
            id: "event",
            labelEn: "Event",
            labelKm: "ព្រឹត្តិការណ៍",
            enabled: true,
            templateType: "event",
            order: 2
        },
        {
            id: "all-product",
            labelEn: "All Product",
            labelKm: "ផលិតផលទាំងអស់",
            enabled: true,
            templateType: "product",
            order: 3
        },
        {
            id: "post",
            labelEn: "Post",
            labelKm: "ប្រកាស",
            enabled: true,
            templateType: "post",
            order: 4
        }
    ],

    // Current language selection
    language: "en",
    
    // Default language for new visitors (admin setting)
    defaultLanguage: "en"
};

// Initialize menu items and language if not present in localStorage
(function initializeMenuConfig() {
    const savedConfig = localStorage.getItem('websiteConfig');
    if (savedConfig) {
        try {
            const parsed = JSON.parse(savedConfig);
            
            // Initialize menuItems if not present
            if (!parsed.menuItems || !Array.isArray(parsed.menuItems)) {
                parsed.menuItems = CONFIG.menuItems;
            }
            
            // Initialize language if not present
            if (!parsed.language) {
                parsed.language = "en";
            }
            
            // Save back to localStorage
            localStorage.setItem('websiteConfig', JSON.stringify(parsed));
        } catch (error) {
            console.error('Error initializing menu config:', error);
        }
    }
})();
