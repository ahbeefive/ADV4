// Enhanced Storage Manager - IndexedDB for Unlimited Storage
// Provides 1GB+ storage capacity instead of localStorage's 5-10MB limit

class EnhancedStorage {
    constructor() {
        this.dbName = 'WebsiteConfigDB';
        this.dbVersion = 1;
        this.storeName = 'config';
        this.db = null;
        this.fallbackToLocalStorage = false;
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.warn('⚠️ IndexedDB not available, falling back to localStorage');
                this.fallbackToLocalStorage = true;
                resolve();
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ IndexedDB initialized - 1GB+ storage available!');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                    console.log('📦 Created IndexedDB object store');
                }
            };
        });
    }

    // Save config to IndexedDB
    async saveConfig(config) {
        if (this.fallbackToLocalStorage) {
            return this.saveToLocalStorage(config);
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put(config, 'websiteConfig');

                request.onsuccess = () => {
                    console.log('✅ Config saved to IndexedDB');
                    // Also save to localStorage for compatibility
                    this.saveToLocalStorage(config);
                    resolve();
                };

                request.onerror = () => {
                    console.error('❌ IndexedDB save failed, using localStorage');
                    this.saveToLocalStorage(config);
                    resolve();
                };
            } catch (error) {
                console.error('❌ IndexedDB error:', error);
                this.saveToLocalStorage(config);
                resolve();
            }
        });
    }

    // Get config from IndexedDB
    async getConfig() {
        if (this.fallbackToLocalStorage) {
            return this.getFromLocalStorage();
        }

        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get('websiteConfig');

                request.onsuccess = (event) => {
                    const config = event.target.result;
                    if (config) {
                        console.log('✅ Config loaded from IndexedDB');
                        resolve(config);
                    } else {
                        // Try localStorage as fallback
                        console.log('⚠️ No config in IndexedDB, trying localStorage');
                        resolve(this.getFromLocalStorage());
                    }
                };

                request.onerror = () => {
                    console.warn('⚠️ IndexedDB read failed, using localStorage');
                    resolve(this.getFromLocalStorage());
                };
            } catch (error) {
                console.error('❌ IndexedDB error:', error);
                resolve(this.getFromLocalStorage());
            }
        });
    }

    // Fallback: Save to localStorage (with compression)
    saveToLocalStorage(config) {
        try {
            const configString = JSON.stringify(config);
            const sizeInMB = (configString.length / 1024 / 1024).toFixed(2);
            
            console.log(`💾 Saving to localStorage: ${sizeInMB}MB`);
            
            // Try to save
            localStorage.setItem('websiteConfig', configString);
            console.log('✅ Saved to localStorage successfully');
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('❌ localStorage quota exceeded!');
                this.showStorageError(config);
                return false;
            }
            console.error('❌ localStorage save error:', error);
            return false;
        }
    }

    // Get from localStorage
    getFromLocalStorage() {
        try {
            const saved = localStorage.getItem('websiteConfig');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('❌ localStorage read error:', error);
        }
        return null;
    }

    // Show user-friendly error message
    showStorageError(config) {
        const configSize = (JSON.stringify(config).length / 1024 / 1024).toFixed(2);
        const bannerCount = config.banners ? config.banners.length : 0;
        
        const errorMessage = `
            <div style="background: #fff; padding: 30px; border-radius: 15px; max-width: 600px; margin: 20px auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                <h2 style="color: #dc3545; margin-bottom: 20px;">❌ Storage Error: Failed to execute 'setItem' on 'Storage': Setting the value of 'websiteConfig_test_${Date.now()}' exceeded the quota.</h2>
                
                <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
                    <h3 style="color: #721c24; margin: 0 0 10px 0;">📊 Attempted to save: ${configSize}MB</h3>
                    <p style="color: #721c24; margin: 0;">📸 Current banners: ${bannerCount}</p>
                </div>
                
                <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0c5460;">
                    <h3 style="color: #0c5460; margin: 0 0 10px 0;">💡 Browser: ${navigator.userAgent.includes('Firefox') ? 'Mozilla/5.0' : 'Chrome/Edge'}</h3>
                </div>
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #856404;">
                    <h3 style="color: #856404; margin: 0 0 15px 0;">💡 Possible solutions:</h3>
                    <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.8;">
                        <li><strong>Try smaller images</strong> (compress before upload)</li>
                        <li><strong>Clear browser cache</strong> and try again</li>
                        <li><strong>Use different browser</strong> (Chrome/Firefox)</li>
                        <li><strong>Check browser console</strong> for more details</li>
                    </ul>
                </div>
                
                <button onclick="this.parentElement.remove()" style="background: #007bff; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
                    OK
                </button>
            </div>
        `;
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; overflow-y: auto;';
        overlay.innerHTML = errorMessage;
        document.body.appendChild(overlay);
        
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
    }

    // Get storage statistics
    async getStorageStats() {
        const stats = {
            type: this.fallbackToLocalStorage ? 'localStorage' : 'IndexedDB',
            available: 'Unknown',
            used: 'Unknown',
            quota: 'Unknown'
        };

        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                stats.quota = (estimate.quota / 1024 / 1024 / 1024).toFixed(2) + ' GB';
                stats.used = (estimate.usage / 1024 / 1024).toFixed(2) + ' MB';
                stats.available = ((estimate.quota - estimate.usage) / 1024 / 1024 / 1024).toFixed(2) + ' GB';
            }
        } catch (error) {
            console.error('Error getting storage stats:', error);
        }

        return stats;
    }
}

// Initialize enhanced storage
const enhancedStorage = new EnhancedStorage();
enhancedStorage.init().then(() => {
    console.log('🚀 Enhanced Storage System Ready!');
    console.log('💾 Storage Type:', enhancedStorage.fallbackToLocalStorage ? 'localStorage (5-10MB)' : 'IndexedDB (1GB+)');
});

// Make it globally available
window.enhancedStorage = enhancedStorage;
