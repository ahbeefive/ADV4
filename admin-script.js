// Admin Panel Script - Production Ready

// Helper function to escape HTML in form values
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Language Upload Helper Functions
function createLanguageField(fieldName, label, type = 'textarea', options = {}) {
    const {
        placeholder = {},
        required = false,
        rows = 3,
        maxlength = null
    } = options;
    
    const defaultPlaceholder = {
        en: `Enter ${label} in English`,
        km: `Enter ${label} in Khmer`
    };
    
    const placeholders = { ...defaultPlaceholder, ...placeholder };
    const requiredAttr = required ? 'required' : '';
    const maxlengthAttr = maxlength ? `maxlength="${maxlength}"` : '';
    
    let inputHtml = '';
    if (type === 'textarea') {
        inputHtml = `
            <div class="lang-input active" data-lang="en">
                <textarea name="${fieldName}En" placeholder="${placeholders.en}" 
                         class="form-control" rows="${rows}" ${requiredAttr} ${maxlengthAttr}></textarea>
            </div>
            <div class="lang-input" data-lang="km">
                <textarea name="${fieldName}Km" placeholder="${placeholders.km}" 
                         class="form-control" rows="${rows}" ${requiredAttr} ${maxlengthAttr}></textarea>
            </div>
        `;
    } else {
        inputHtml = `
            <div class="lang-input active" data-lang="en">
                <input type="${type}" name="${fieldName}En" placeholder="${placeholders.en}" 
                       class="form-control" ${requiredAttr} ${maxlengthAttr}>
            </div>
            <div class="lang-input" data-lang="km">
                <input type="${type}" name="${fieldName}Km" placeholder="${placeholders.km}" 
                       class="form-control" ${requiredAttr} ${maxlengthAttr}>
            </div>
        `;
    }
    
    return `
        <div class="form-group">
            <label>${label} ${required ? '<span style="color: red;">*</span>' : ''}</label>
            <div class="language-helper">
                <strong>🇺🇸 English:</strong> Write content in English for international users<br>
                <strong>🇰🇭 Khmer:</strong> Write content in Khmer for local users
            </div>
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
                    ${inputHtml}
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

// Helper to populate language fields with existing data
function populateLanguageField(fieldName, data) {
    const enField = document.querySelector(`[name="${fieldName}En"]`);
    const kmField = document.querySelector(`[name="${fieldName}Km"]`);
    
    if (enField && data[fieldName]) {
        enField.value = data[fieldName];
    }
    if (kmField && data[`${fieldName}Km`]) {
        kmField.value = data[`${fieldName}Km`];
    }
}

// Helper to get language field values from form
function getLanguageFieldValues(formData, fieldName) {
    return {
        [fieldName]: formData.get(`${fieldName}En`) || '',
        [`${fieldName}Km`]: formData.get(`${fieldName}Km`) || ''
    };
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 Admin panel initializing...');
    
    // Wait for enhanced storage to initialize
    if (window.enhancedStorage) {
        await window.enhancedStorage.init();
        console.log('✅ Enhanced storage initialized');
    }
    
    await loadConfigFromStorage();
    console.log('✅ Config loaded');
    
    initNavigation();
    console.log('✅ Navigation initialized');
    
    loadAllTables();
    console.log('✅ Tables loaded');
    
    loadSettings();
    console.log('✅ Settings loaded');
    
    loadLanguageFlags();
    console.log('✅ Language flags loaded');
    
    console.log('✅ Admin panel ready!');
});

// Load config from enhanced storage
async function loadConfigFromStorage() {
    try {
        // Wait for enhanced storage to be ready
        if (window.enhancedStorage && !window.enhancedStorage.fallbackToLocalStorage) {
            const savedConfig = await window.enhancedStorage.getConfig();
            if (savedConfig) {
                Object.assign(CONFIG, savedConfig);
                console.log('✅ Admin config loaded from IndexedDB (1GB+ storage)');
                
                // Show storage stats
                const stats = await window.enhancedStorage.getStorageStats();
                console.log('💾 Storage Stats:', stats);
            }
        } else {
            // Fallback to localStorage
            const savedConfig = localStorage.getItem('websiteConfig');
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                Object.assign(CONFIG, parsed);
                console.log('✅ Admin config loaded from localStorage');
            }
        }
        
        // Ensure all arrays are initialized
        if (!Array.isArray(CONFIG.products)) CONFIG.products = [];
        if (!Array.isArray(CONFIG.promotions)) CONFIG.promotions = [];
        if (!Array.isArray(CONFIG.events)) CONFIG.events = [];
        if (!Array.isArray(CONFIG.banners)) CONFIG.banners = [];
        if (!Array.isArray(CONFIG.posts)) CONFIG.posts = [];
        if (!Array.isArray(CONFIG.categories)) {
            CONFIG.categories = [{ id: 'all', name: 'All', nameKm: 'ទាំងអស់' }];
        }
        if (!Array.isArray(CONFIG.customSections)) CONFIG.customSections = [];
        
        // Clean up invalid custom sections
        if (CONFIG.customSections) {
            CONFIG.customSections = CONFIG.customSections.filter(section => {
                return section && 
                       section.id && 
                       section.nameEn && 
                       section.nameKm && 
                       section.nameEn.trim().length > 0 && 
                       section.nameKm.trim().length > 0;
            });
            console.log('Cleaned custom sections:', CONFIG.customSections);
        }
        
        if (!CONFIG.sectionSettings) {
            CONFIG.sectionSettings = {
                promotion: { enabled: true, nameEn: 'PROMOTION', nameKm: 'ការផ្តល់ជូន', order: 1 },
                event: { enabled: true, nameEn: 'EVENT', nameKm: 'ព្រឹត្តិការណ៍', order: 2 },
                products: { enabled: true, nameEn: 'ALL PRODUCT', nameKm: 'ផលិតផលទាំងអស់', order: 3 },
                problem: { enabled: true, nameEn: 'POST', nameKm: 'ប្រកាស', order: 4 }
            };
        }
    } catch (error) {
        console.error('Error loading config:', error);
        // Initialize with defaults if loading fails
        CONFIG.products = [];
        CONFIG.promotions = [];
        CONFIG.events = [];
        CONFIG.banners = [];
        CONFIG.posts = [];
        CONFIG.categories = [{ id: 'all', name: 'All', nameKm: 'ទាំងអស់' }];
        CONFIG.customSections = [];
    }
}

// Navigation System
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            if (tab === 'view') {
                window.open('index.html', '_blank');
            } else {
                showTab(tab);
            }
        });
    });
    
    document.querySelector('.btn-logout')?.addEventListener('click', logout);
}

function showTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName)?.classList.add('active');
    
    const titles = {
        'products': 'Product Management',
        'posts': 'Post Management',
        'promotions': 'Promotion Management',
        'banners': 'Banner Management',
        'events': 'Event Management',
        'categories': 'Category Management',
        'sections': 'Section Management',
        'language': 'Language Settings',
        'buttons': 'Button Customization',
        'datasave': 'Data Save & Export',
        'settings': 'Settings'
    };
    
    // Load specific tab content
    if (tabName === 'buttons') {
        loadButtonCustomization();
    } else if (tabName === 'language') {
        loadLanguageFlags();
    } else if (tabName === 'datasave') {
        initDataSave();
    }
    
    // Handle custom sections
    if (tabName.startsWith('custom-')) {
        const sectionId = parseInt(tabName.replace('custom-', ''));
        const section = CONFIG.customSections?.find(s => s.id === sectionId);
        if (section) {
            document.getElementById('pageTitle').textContent = `${section.nameEn} Management`;
            return;
        }
    }
    
    document.getElementById('pageTitle').textContent = titles[tabName] || 'Admin Panel';
}

function loadAllTables() {
    loadProductsTable();
    loadPostsTable();
    loadPromotionsTable();
    loadBannersTable();
    loadEventsTable();
    loadCategoriesTable();
    loadSectionsTable();
    updateAdminNavigation(); // Add this to update navigation on page load
}

// SUPER SIMPLE BANNER SYSTEM - ADMIN
function loadBannersTable() {
    const tbody = document.getElementById('bannersTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!CONFIG.banners || CONFIG.banners.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:40px;">No banners yet</td></tr>';
        return;
    }
    
    CONFIG.banners.forEach((banner, index) => {
        const row = document.createElement('tr');
        
        // Display info for mobile/desktop
        let displayInfo = [];
        if (banner.showOnMobile !== false) displayInfo.push('📱 Mobile');
        if (banner.showOnDesktop !== false) displayInfo.push('💻 Desktop');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="display: flex; gap: 5px;">
                        ${banner.mobileImage ? `<img src="${banner.mobileImage}" style="width: 40px; height: 20px; object-fit: cover; border: 2px solid #ff6a00; border-radius: 3px;" title="Mobile Banner">` : ''}
                        ${banner.desktopImage ? `<img src="${banner.desktopImage}" style="width: 40px; height: 20px; object-fit: cover; border: 2px solid #0066cc; border-radius: 3px;" title="Desktop Banner">` : ''}
                    </div>
                    <div>
                        <strong>Banner ${banner.id}</strong><br>
                        <small style="color: #666;">${displayInfo.join(', ')}</small>
                    </div>
                </div>
            </td>
            <td>${banner.link || 'No link'}</td>
            <td>
                <span style="color:${banner.enabled ? 'green' : 'red'};">
                    ${banner.enabled ? '✅ Active' : '❌ Disabled'}
                </span>
                <br><small>${banner.duration || 3}s duration</small>
            </td>
            <td>
                <button onclick="editBanner(${banner.id})" style="background:#007bff;color:white;border:none;padding:5px 10px;margin:2px;cursor:pointer;">Edit</button>
                <button onclick="deleteBanner(${banner.id})" style="background:#dc3545;color:white;border:none;padding:5px 10px;margin:2px;cursor:pointer;">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addBanner = function() {
    showModal('Add Banner', `
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
            <h4 style="color: #155724; margin: 0 0 10px 0;">📐 Banner Size Guide</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; color: #155724;">
                <div>
                    <strong>📱 Mobile Banner:</strong><br>
                    • Recommended: 800 x 400 pixels<br>
                    • Aspect Ratio: 2:1<br>
                    • Formats: JPG, PNG, GIF
                </div>
                <div>
                    <strong>💻 Desktop Banner:</strong><br>
                    • Recommended: 1200 x 400 pixels<br>
                    • Aspect Ratio: 3:1<br>
                    • Formats: JPG, PNG, GIF
                </div>
            </div>
            <div style="margin-top: 10px; padding: 10px; background: #d4edda; border-radius: 5px; border-left: 3px solid #28a745;">
                <strong style="color: #155724;">🚀 Unlimited Storage:</strong> <span style="color: #155724;">Using IndexedDB with 1GB+ capacity! Upload full quality images - no compression, no limits!</span>
            </div>
        </div>
        
        <div class="form-group">
            <label style="font-weight: bold; color: #ff6a00;">📱 Mobile Banner Image</label>
            <input type="file" id="mobileImageFile" class="form-control" accept="image/*" onchange="previewBannerImage(this, 'mobilePreview', 'mobileImage')">
            <input type="url" id="mobileImageUrl" class="form-control" placeholder="Or paste mobile image URL" style="margin-top: 10px;" onchange="loadBannerFromUrl(this, 'mobilePreview', 'mobileImage')">
            <div id="mobilePreview" style="margin-top: 10px; min-height: 100px; border: 2px dashed #ff6a00; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; background: #fff8f0;">
                📱 Mobile banner preview will appear here
            </div>
            <input type="hidden" id="mobileImage" />
        </div>
        
        <div class="form-group">
            <label style="font-weight: bold; color: #0066cc;">💻 Desktop Banner Image</label>
            <input type="file" id="desktopImageFile" class="form-control" accept="image/*" onchange="previewBannerImage(this, 'desktopPreview', 'desktopImage')">
            <input type="url" id="desktopImageUrl" class="form-control" placeholder="Or paste desktop image URL" style="margin-top: 10px;" onchange="loadBannerFromUrl(this, 'desktopPreview', 'desktopImage')">
            <div id="desktopPreview" style="margin-top: 10px; min-height: 100px; border: 2px dashed #0066cc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; background: #f0f8ff;">
                💻 Desktop banner preview will appear here
            </div>
            <input type="hidden" id="desktopImage" />
        </div>
        
        <div class="form-group">
            <label>🔗 Link (optional)</label>
            <input type="url" id="bannerLink" class="form-control" placeholder="https://example.com">
        </div>
        
        <div class="form-group">
            <label>⏱️ Duration (seconds)</label>
            <select id="bannerDuration" class="form-control">
                <option value="2">2 seconds - Quick content</option>
                <option value="3" selected>3 seconds - Normal content</option>
                <option value="5">5 seconds - More content</option>
                <option value="7">7 seconds - Lots of content</option>
                <option value="10">10 seconds - Very detailed content</option>
            </select>
        </div>
        
        <div class="form-group">
            <label style="font-weight: bold; margin-bottom: 10px;">📱💻 Display Settings</label>
            <div style="display: flex; gap: 20px;">
                <label><input type="checkbox" id="showOnMobile" checked> 📱 Show on Mobile</label>
                <label><input type="checkbox" id="showOnDesktop" checked> 💻 Show on Desktop</label>
            </div>
        </div>
        
        <div class="form-group">
            <label><input type="checkbox" id="bannerEnabled" checked> ✅ Enabled</label>
        </div>
        
        <div class="form-actions">
            <button class="btn-primary" onclick="saveBanner()">💾 Save Banner</button>
            <button class="btn-cancel" onclick="closeModal()">❌ Cancel</button>
        </div>
    `);
};

window.previewBannerImage = function(input, previewId, hiddenInputId) {
    const preview = document.getElementById(previewId);
    const hiddenInput = document.getElementById(hiddenInputId);
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const fileSizeInMB = file.size / 1024 / 1024;
        
        console.log(`📸 Processing image: ${file.name}, Size: ${fileSizeInMB.toFixed(2)}MB`);
        
        // NO COMPRESSION - Keep full quality
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            const sizeInMB = (imageData.length / 1024 / 1024).toFixed(2);
            
            preview.innerHTML = `
                <img src="${imageData}" style="max-width: 100%; max-height: 150px; border-radius: 5px;">
                <div style="margin-top: 5px; font-size: 12px; color: #28a745; font-weight: 600;">
                    ✅ Full Quality: ${sizeInMB}MB - No compression applied
                </div>
            `;
            hiddenInput.value = imageData;
            console.log(`✅ Image loaded at full quality: ${sizeInMB}MB`);
        };
        reader.readAsDataURL(file);
    }
};

window.loadBannerFromUrl = function(input, previewId, hiddenInputId) {
    const url = input.value.trim();
    const preview = document.getElementById(previewId);
    const hiddenInput = document.getElementById(hiddenInputId);
    
    if (url) {
        preview.innerHTML = `<img src="${url}" style="max-width: 100%; max-height: 150px; border-radius: 5px;" onload="this.style.display='block'" onerror="this.parentElement.innerHTML='❌ Could not load image'">`;
        hiddenInput.value = url;
    } else {
        preview.innerHTML = previewId === 'mobilePreview' ? '📱 Mobile banner preview will appear here' : '💻 Desktop banner preview will appear here';
        hiddenInput.value = '';
    }
};

window.saveBanner = async function(id = null) {
    console.log('🔧 saveBanner called with ID:', id);
    console.log('🔧 Current CONFIG.banners before save:', CONFIG.banners);
    console.log('🔧 Current banner count:', CONFIG.banners ? CONFIG.banners.length : 0);
    
    // COMPREHENSIVE STORAGE DEBUG
    console.log('🔍 === STORAGE DEBUG START ===');
    try {
        // Check current localStorage usage
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        console.log('📊 Current localStorage total size:', (totalSize / 1024 / 1024).toFixed(2), 'MB');
        
        // Check available quota
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            console.log('💾 Storage quota:', (estimate.quota / 1024 / 1024 / 1024).toFixed(2), 'GB');
            console.log('💾 Storage usage:', (estimate.usage / 1024 / 1024).toFixed(2), 'MB');
            console.log('💾 Available space:', ((estimate.quota - estimate.usage) / 1024 / 1024 / 1024).toFixed(2), 'GB');
        }
        
        // Check current config size
        const currentConfigString = JSON.stringify(CONFIG);
        console.log('📏 Current CONFIG size:', (currentConfigString.length / 1024 / 1024).toFixed(2), 'MB');
        console.log('📏 Current CONFIG banners:', CONFIG.banners ? CONFIG.banners.length : 0);
        
    } catch (debugError) {
        console.error('🔍 Storage debug error:', debugError);
    }
    console.log('🔍 === STORAGE DEBUG END ===');
    
    const mobileImage = document.getElementById('mobileImage').value;
    const desktopImage = document.getElementById('desktopImage').value;
    const link = document.getElementById('bannerLink').value || '';
    const duration = parseInt(document.getElementById('bannerDuration').value) || 3;
    const enabled = document.getElementById('bannerEnabled').checked;
    const showOnMobile = document.getElementById('showOnMobile').checked;
    const showOnDesktop = document.getElementById('showOnDesktop').checked;
    
    console.log('💾 Banner data to save:', {
        mobileImage: mobileImage ? `${mobileImage.length} chars (${(mobileImage.length / 1024 / 1024).toFixed(2)}MB)` : 'none',
        desktopImage: desktopImage ? `${desktopImage.length} chars (${(desktopImage.length / 1024 / 1024).toFixed(2)}MB)` : 'none',
        link,
        duration,
        enabled,
        showOnMobile,
        showOnDesktop
    });
    
    // Validation
    if (!mobileImage && !desktopImage) {
        console.log('❌ Validation failed: No images');
        alert('❌ Please upload at least one banner image (mobile or desktop)');
        return;
    }
    
    if (showOnMobile && !mobileImage) {
        console.log('❌ Validation failed: Mobile image required');
        alert('❌ Mobile image is required when "Show on Mobile" is checked');
        return;
    }
    
    if (showOnDesktop && !desktopImage) {
        console.log('❌ Validation failed: Desktop image required');
        alert('❌ Desktop image is required when "Show on Desktop" is checked');
        return;
    }
    
    if (!showOnMobile && !showOnDesktop) {
        console.log('❌ Validation failed: No display options');
        alert('❌ Please select at least one display option (Mobile or Desktop)');
        return;
    }
    
    console.log('✅ Validation passed');
    
    // Initialize banners array if it doesn't exist
    if (!CONFIG.banners) {
        CONFIG.banners = [];
        console.log('🔧 Initialized empty banners array');
    }
    
    // Create backup before modifying
    const configBackup = JSON.parse(JSON.stringify(CONFIG));
    console.log('💾 Created CONFIG backup with', configBackup.banners ? configBackup.banners.length : 0, 'banners');
    
    const bannerData = {
        mobileImage: mobileImage,
        desktopImage: desktopImage,
        link: link,
        duration: duration,
        enabled: enabled,
        showOnMobile: showOnMobile,
        showOnDesktop: showOnDesktop,
        createdAt: new Date().toISOString()
    };
    
    console.log('🔧 Banner data object created');
    
    if (id) {
        // Edit existing banner
        console.log('🔧 Editing existing banner ID:', id);
        const banner = CONFIG.banners.find(b => b.id === id);
        if (banner) {
            Object.assign(banner, bannerData);
            console.log('✅ Updated existing banner ID:', id);
        } else {
            console.log('❌ Banner not found for ID:', id);
            return;
        }
    } else {
        // Add new banner
        console.log('🔧 Adding new banner...');
        const newId = CONFIG.banners.length > 0 ? Math.max(...CONFIG.banners.map(b => b.id)) + 1 : 1;
        const newBanner = { id: newId, ...bannerData };
        
        console.log('🔧 New banner object:', { id: newId, hasData: !!bannerData });
        
        CONFIG.banners.push(newBanner);
        console.log('✅ Added new banner ID:', newId, 'Total banners now:', CONFIG.banners.length);
        console.log('🔧 CONFIG.banners after push:', CONFIG.banners.map(b => ({ id: b.id, enabled: b.enabled })));
    }
    
    // Check localStorage size before saving
    const configString = JSON.stringify(CONFIG);
    const sizeInMB = (configString.length / 1024 / 1024).toFixed(2);
    console.log('💾 Config size to save:', sizeInMB, 'MB');
    console.log('💾 Total banners in config:', CONFIG.banners.length);
    
    // ENHANCED SAVE WITH RECOVERY
    console.log('💾 Saving to storage...');
    try {
        // Use enhanced storage if available (IndexedDB with 1GB+)
        if (window.enhancedStorage && !window.enhancedStorage.fallbackToLocalStorage) {
            await window.enhancedStorage.saveConfig(CONFIG);
            console.log('✅ Saved to IndexedDB! Size:', sizeInMB, 'MB');
        } else {
            // Fallback to localStorage with error handling
            const testKey = 'websiteConfig_test_' + Date.now();
            localStorage.setItem(testKey, configString);
            localStorage.removeItem(testKey);
            console.log('✅ Test save successful');
            
            // Actual save
            localStorage.setItem('websiteConfig', configString);
            console.log('✅ Saved to localStorage! Size:', sizeInMB, 'MB');
        }
        
        // Verify it was saved correctly
        const savedConfig = localStorage.getItem('websiteConfig');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            console.log('✅ Verification: Saved config has', parsed.banners ? parsed.banners.length : 0, 'banners');
            
            // Double check the banners are intact
            if (parsed.banners && parsed.banners.length !== CONFIG.banners.length) {
                throw new Error(`Banner count mismatch! Expected ${CONFIG.banners.length}, got ${parsed.banners.length}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Storage error:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        
        // RECOVERY: Restore from backup
        console.log('🔄 Attempting recovery...');
        Object.assign(CONFIG, configBackup);
        console.log('✅ CONFIG restored from backup');
        
        // Use enhanced storage error display
        if (window.enhancedStorage) {
            window.enhancedStorage.showStorageError(CONFIG);
        } else {
            // Fallback error message
            let errorMsg = `❌ Storage Error: ${error.message}\n\n`;
            errorMsg += `📊 Attempted to save: ${sizeInMB}MB\n`;
            errorMsg += `📊 Current banners: ${CONFIG.banners.length}\n`;
            errorMsg += `📊 Browser: ${navigator.userAgent.split(' ')[0]}\n\n`;
            errorMsg += `💡 Possible solutions:\n`;
            errorMsg += `• Try smaller images (compress before upload)\n`;
            errorMsg += `• Clear browser cache and try again\n`;
            errorMsg += `• Use different browser (Chrome/Firefox)\n`;
            errorMsg += `• Check browser console for more details`;
            
            alert(errorMsg);
        }
        return;
    }
    
    // Close modal and refresh
    console.log('🔧 Closing modal and refreshing table...');
    closeModal();
    loadBannersTable();
    showSuccess(`✅ Banner saved! Total: ${CONFIG.banners.length} banners (${sizeInMB}MB)`);
    
    // Notify frontend
    console.log('📢 Notifying frontend...');
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'websiteConfig',
        newValue: configString
    }));
    
    console.log('✅ Banner save completed successfully');
};

window.editBanner = function(id) {
    const banner = CONFIG.banners.find(b => b.id === id);
    if (!banner) return;
    
    showModal('Edit Banner', `
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
            <h4 style="color: #155724; margin: 0 0 10px 0;">📐 Banner Size Guide</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; color: #155724;">
                <div>
                    <strong>📱 Mobile Banner:</strong><br>
                    • Recommended: 800 x 400 pixels<br>
                    • Aspect Ratio: 2:1<br>
                    • Formats: JPG, PNG, GIF
                </div>
                <div>
                    <strong>💻 Desktop Banner:</strong><br>
                    • Recommended: 1200 x 400 pixels<br>
                    • Aspect Ratio: 3:1<br>
                    • Formats: JPG, PNG, GIF
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <label style="font-weight: bold; color: #ff6a00;">📱 Mobile Banner Image</label>
            ${banner.mobileImage ? `<div style="margin-bottom: 10px;"><strong>Current:</strong><br><img src="${banner.mobileImage}" style="max-width: 200px; max-height: 100px; border-radius: 5px;"></div>` : ''}
            <input type="file" id="mobileImageFile" class="form-control" accept="image/*" onchange="previewBannerImage(this, 'mobilePreview', 'mobileImage')">
            <input type="url" id="mobileImageUrl" class="form-control" placeholder="Or paste mobile image URL" style="margin-top: 10px;" onchange="loadBannerFromUrl(this, 'mobilePreview', 'mobileImage')">
            <div id="mobilePreview" style="margin-top: 10px; min-height: 100px; border: 2px dashed #ff6a00; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; background: #fff8f0;">
                📱 Upload new mobile banner or keep current one
            </div>
            <input type="hidden" id="mobileImage" value="${banner.mobileImage || ''}" />
        </div>
        
        <div class="form-group">
            <label style="font-weight: bold; color: #0066cc;">💻 Desktop Banner Image</label>
            ${banner.desktopImage ? `<div style="margin-bottom: 10px;"><strong>Current:</strong><br><img src="${banner.desktopImage}" style="max-width: 200px; max-height: 100px; border-radius: 5px;"></div>` : ''}
            <input type="file" id="desktopImageFile" class="form-control" accept="image/*" onchange="previewBannerImage(this, 'desktopPreview', 'desktopImage')">
            <input type="url" id="desktopImageUrl" class="form-control" placeholder="Or paste desktop image URL" style="margin-top: 10px;" onchange="loadBannerFromUrl(this, 'desktopPreview', 'desktopImage')">
            <div id="desktopPreview" style="margin-top: 10px; min-height: 100px; border: 2px dashed #0066cc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999; background: #f0f8ff;">
                💻 Upload new desktop banner or keep current one
            </div>
            <input type="hidden" id="desktopImage" value="${banner.desktopImage || ''}" />
        </div>
        
        <div class="form-group">
            <label>🔗 Link (optional)</label>
            <input type="url" id="bannerLink" class="form-control" value="${banner.link || ''}" placeholder="https://example.com">
        </div>
        
        <div class="form-group">
            <label>⏱️ Duration (seconds)</label>
            <select id="bannerDuration" class="form-control">
                <option value="2" ${banner.duration === 2 ? 'selected' : ''}>2 seconds - Quick content</option>
                <option value="3" ${banner.duration === 3 || !banner.duration ? 'selected' : ''}>3 seconds - Normal content</option>
                <option value="5" ${banner.duration === 5 ? 'selected' : ''}>5 seconds - More content</option>
                <option value="7" ${banner.duration === 7 ? 'selected' : ''}>7 seconds - Lots of content</option>
                <option value="10" ${banner.duration === 10 ? 'selected' : ''}>10 seconds - Very detailed content</option>
            </select>
        </div>
        
        <div class="form-group">
            <label style="font-weight: bold; margin-bottom: 10px;">📱💻 Display Settings</label>
            <div style="display: flex; gap: 20px;">
                <label><input type="checkbox" id="showOnMobile" ${banner.showOnMobile !== false ? 'checked' : ''}> 📱 Show on Mobile</label>
                <label><input type="checkbox" id="showOnDesktop" ${banner.showOnDesktop !== false ? 'checked' : ''}> 💻 Show on Desktop</label>
            </div>
        </div>
        
        <div class="form-group">
            <label><input type="checkbox" id="bannerEnabled" ${banner.enabled ? 'checked' : ''}> ✅ Enabled</label>
        </div>
        
        <div class="form-actions">
            <button class="btn-primary" onclick="saveBanner(${id})">💾 Update Banner</button>
            <button class="btn-cancel" onclick="closeModal()">❌ Cancel</button>
        </div>
    `);
};

window.deleteBanner = async function(id) {
    console.log('🗑️ Delete banner called for ID:', id);
    
    if (confirm('Delete this banner?')) {
        CONFIG.banners = CONFIG.banners.filter(b => b.id !== id);
        console.log('✅ Banner deleted. Remaining banners:', CONFIG.banners.length);
        
        // Save to localStorage - NO LIMITS
        localStorage.setItem('websiteConfig', JSON.stringify(CONFIG));
        
        loadBannersTable();
        showSuccess(`✅ Banner deleted! Remaining: ${CONFIG.banners.length} banners`);
        
        // Tell frontend to update
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'websiteConfig',
            newValue: JSON.stringify(CONFIG)
        }));
        
        console.log('✅ Banner deleted successfully');
    }
};

// ============================================
// PROMOTIONS
// ============================================
function loadPromotionsTable() {
    const tbody = document.getElementById('promotionsTable');
    tbody.innerHTML = '';
    
    if (!CONFIG.promotions || CONFIG.promotions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:40px;">No promotions yet.</td></tr>';
        return;
    }
    
    CONFIG.promotions.forEach(promo => {
        const categoryName = CONFIG.categories.find(c => c.id === promo.category)?.name || promo.category || 'General';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${promo.id}</td>
            <td><img src="${promo.image}" class="table-image" alt="Promo" onerror="this.style.display='none'"></td>
            <td>${promo.title}</td>
            <td>${promo.titleKm}</td>
            <td>${categoryName}</td>
            <td>${promo.price || '$0'}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editPromotion(${promo.id})">Edit</button>
                <button class="btn-action btn-delete" onclick="deletePromotion(${promo.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addPromotion = function() {
    const categoryOptions = CONFIG.categories.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    // Get products for selection dropdown
    const productOptions = CONFIG.products && CONFIG.products.length > 0 
        ? CONFIG.products.map(p => `<option value="${p.id}">${p.name} (${p.nameKm})</option>`).join('')
        : '<option value="">No products available</option>';
    
    showModal('Add Promotion', `
        <div class="form-group" style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
            <label style="font-weight: bold; color: #155724; margin-bottom: 10px;">📦 Create Promotion From:</label>
            <div style="display: flex; gap: 15px; margin-top: 10px;">
                <label style="flex: 1; cursor: pointer;">
                    <input type="radio" name="promoSource" value="product" onchange="togglePromoSource('product')" ${CONFIG.products && CONFIG.products.length > 0 ? '' : 'disabled'}>
                    <strong>Existing Product</strong>
                    <small style="display: block; color: #666;">Select from your products</small>
                </label>
                <label style="flex: 1; cursor: pointer;">
                    <input type="radio" name="promoSource" value="manual" checked onchange="togglePromoSource('manual')">
                    <strong>Manual Entry</strong>
                    <small style="display: block; color: #666;">Enter details manually</small>
                </label>
            </div>
        </div>
        
        <!-- Product Selection (Hidden by default) -->
        <div id="productSelectionSection" style="display: none; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div class="form-group">
                <label>Select Product</label>
                <select id="productSelect" class="form-control" onchange="loadProductToPromotion()">
                    <option value="">-- Choose a product --</option>
                    ${productOptions}
                </select>
            </div>
            <small style="color: #666;">💡 Product details will be auto-filled. You can modify them after selection.</small>
        </div>
        
        <!-- Manual Entry Section -->
        <div id="manualEntrySection">
            <div class="form-row">
                <div class="form-group"><label>Title (English)</label><input type="text" id="promoTitle" class="form-control"></div>
                <div class="form-group"><label>Title (Khmer)</label><input type="text" id="promoTitleKm" class="form-control"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Category</label><select id="promoCategory" class="form-control">${categoryOptions}</select></div>
                <div class="form-group"><label>Original Price</label><input type="text" id="promoOriginalPrice" class="form-control" placeholder="$199" oninput="calculatePromotionPrice()"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Discount (%)</label><input type="number" id="promoDiscount" class="form-control" placeholder="50" min="0" max="100" oninput="calculatePromotionPrice()"></div>
                <div class="form-group"><label>Final Price</label><input type="text" id="promoPrice" class="form-control" placeholder="$99" readonly style="background:#f8f9fa;"></div>
            </div>
            <div class="form-group">
                <label>Promotional Label (Optional)</label>
                <select id="promoLabel" class="form-control">
                    <option value="">No Label</option>
                    <option value="SALE">🔥 SALE</option>
                    <option value="HOT">🔥 HOT</option>
                    <option value="NEW">✨ NEW</option>
                    <option value="LIMITED">⏰ LIMITED</option>
                    <option value="BEST">⭐ BEST DEAL</option>
                    <option value="FLASH">⚡ FLASH SALE</option>
                </select>
            </div>
            <div class="form-group">
                <label>Main Image</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'promoUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'promoFile')">📁 Upload</button>
                </div>
            </div>
            <div id="promoUrl" class="upload-content active">
                <input type="text" id="promoImageUrl" class="form-control" placeholder="https://example.com/image.jpg">
            </div>
            <div id="promoFile" class="upload-content">
                <input type="file" id="promoImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'promoPreview')">
                <div id="promoPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="promoImage" value="">
            <div class="form-group">
                <label>Additional Images (optional, comma-separated URLs)</label>
                <input type="text" id="promoImages" class="form-control" placeholder="url1, url2, url3">
            </div>
            <div class="form-row">
                <div class="form-group"><label>Description (English)</label><textarea id="promoDesc" class="form-control"></textarea></div>
                <div class="form-group"><label>Description (Khmer)</label><textarea id="promoDescKm" class="form-control"></textarea></div>
            </div>
            <div class="form-group">
                <label>Video URL (optional - YouTube, Facebook, TikTok, Instagram)</label>
                <input type="text" id="promoVideo" class="form-control" placeholder="Paste video URL here">
            </div>
            
            <h4 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Contact Information (Optional)</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="promoPhone" class="form-control" placeholder="+1234567890">
                </div>
                <div class="form-group">
                    <label>WhatsApp</label>
                    <input type="text" id="promoWhatsapp" class="form-control" placeholder="+1234567890">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Telegram</label>
                    <input type="text" id="promoTelegram" class="form-control" placeholder="https://t.me/username">
                </div>
                <div class="form-group">
                    <label>Facebook</label>
                    <input type="text" id="promoFacebook" class="form-control" placeholder="https://facebook.com/username">
                </div>
            </div>
            <div class="form-group">
                <label>Messenger</label>
                <input type="text" id="promoMessenger" class="form-control" placeholder="https://m.me/username">
            </div>
        </div>
        
        <div class="form-actions">
            <button class="btn-primary" onclick="savePromotion()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

// Toggle between product selection and manual entry
window.togglePromoSource = function(source) {
    const productSection = document.getElementById('productSelectionSection');
    const manualSection = document.getElementById('manualEntrySection');
    
    if (source === 'product') {
        productSection.style.display = 'block';
        manualSection.style.display = 'block'; // Keep visible so user can edit
    } else {
        productSection.style.display = 'none';
        manualSection.style.display = 'block';
        // Clear product selection
        const productSelect = document.getElementById('productSelect');
        if (productSelect) productSelect.value = '';
    }
};

// Load product data into promotion form
window.loadProductToPromotion = function() {
    const productSelect = document.getElementById('productSelect');
    const productId = parseInt(productSelect.value);
    
    if (!productId) return;
    
    const product = CONFIG.products.find(p => p.id === productId);
    if (!product) {
        alert('Product not found');
        return;
    }
    
    // Auto-fill form with product data
    document.getElementById('promoTitle').value = product.name || '';
    document.getElementById('promoTitleKm').value = product.nameKm || '';
    document.getElementById('promoCategory').value = product.category || '';
    document.getElementById('promoOriginalPrice').value = product.price || '';
    
    // Set image
    if (product.image) {
        document.getElementById('promoImage').value = product.image;
        document.getElementById('promoImageUrl').value = product.image.startsWith('data:') ? '' : product.image;
        
        // Show preview if it's a data URL
        if (product.image.startsWith('data:')) {
            const preview = document.getElementById('promoPreview');
            if (preview) {
                preview.innerHTML = `<img src="${product.image}" alt="Preview" style="max-width: 200px; max-height: 200px; object-fit: contain;">`;
            }
        }
    }
    
    // Set additional images if available
    if (product.images && product.images.length > 0) {
        document.getElementById('promoImages').value = product.images.join(', ');
    }
    
    // Set description
    document.getElementById('promoDesc').value = product.description || '';
    document.getElementById('promoDescKm').value = product.descriptionKm || '';
    
    // Set video if available
    if (product.videoUrl) {
        document.getElementById('promoVideo').value = product.videoUrl;
    }
    
    // Set contact info if available
    if (product.contact) {
        document.getElementById('promoPhone').value = product.contact.phone || '';
        document.getElementById('promoWhatsapp').value = product.contact.whatsapp || '';
        document.getElementById('promoTelegram').value = product.contact.telegram || '';
        document.getElementById('promoFacebook').value = product.contact.facebook || '';
        document.getElementById('promoMessenger').value = product.contact.messenger || '';
    }
    
    console.log('✅ Product loaded into promotion form:', product.name);
    
    // Show success message
    const productSection = document.getElementById('productSelectionSection');
    if (productSection) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'margin-top: 10px; padding: 10px; background: #d4edda; color: #155724; border-radius: 5px; border-left: 3px solid #28a745;';
        successMsg.innerHTML = `✅ Product "${product.name}" loaded! You can now modify the details and set discount.`;
        productSection.appendChild(successMsg);
        
        // Remove message after 3 seconds
        setTimeout(() => successMsg.remove(), 3000);
    }
};

// Calculate promotion final price based on original price and discount
window.calculatePromotionPrice = function() {
    const originalPriceInput = document.getElementById('promoOriginalPrice');
    const discountInput = document.getElementById('promoDiscount');
    const finalPriceInput = document.getElementById('promoPrice');
    
    if (!originalPriceInput || !discountInput || !finalPriceInput) return;
    
    const originalPriceText = originalPriceInput.value.trim();
    const discountPercent = parseFloat(discountInput.value) || 0;
    
    if (!originalPriceText) {
        finalPriceInput.value = '';
        return;
    }
    
    // Extract number from price (remove currency symbols)
    const priceMatch = originalPriceText.match(/[\d.]+/);
    if (!priceMatch) {
        finalPriceInput.value = originalPriceText;
        return;
    }
    
    const originalPrice = parseFloat(priceMatch[0]);
    const discountAmount = (originalPrice * discountPercent) / 100;
    const finalPrice = originalPrice - discountAmount;
    
    // Keep the currency symbol from original price
    const currencySymbol = originalPriceText.replace(/[\d.\s]/g, '').trim() || '$';
    finalPriceInput.value = `${currencySymbol}${finalPrice.toFixed(2)}`;
};

window.savePromotion = function(id = null) {
    console.log('💾 savePromotion called with id:', id);
    
    const title = document.getElementById('promoTitle').value || '';
    const titleKm = document.getElementById('promoTitleKm').value || '';
    const category = document.getElementById('promoCategory').value || 'general';
    const originalPrice = document.getElementById('promoOriginalPrice').value || '';
    const discount = document.getElementById('promoDiscount').value || '';
    const price = document.getElementById('promoPrice').value || '';
    const promoLabel = document.getElementById('promoLabel').value || '';
    
    // Fix image assignment - check hidden field first (for uploaded images), then URL field
    const imageHidden = document.getElementById('promoImage')?.value || '';
    const imageUrl = document.getElementById('promoImageUrl')?.value || '';
    
    // Use hidden field if it has data (uploaded image), otherwise use URL field
    let image = '';
    if (imageHidden && imageHidden.startsWith('data:')) {
        // New uploaded image
        image = imageHidden;
        console.log('✅ Using uploaded image (data URL)');
    } else if (imageUrl && imageUrl.trim()) {
        // URL-based image
        image = imageUrl;
        console.log('✅ Using URL-based image:', imageUrl);
    } else if (imageHidden && imageHidden.trim()) {
        // Fallback to hidden field if it has a URL
        image = imageHidden;
        console.log('✅ Using hidden field image:', imageHidden);
    }
    
    const imagesStr = document.getElementById('promoImages').value || '';
    const description = document.getElementById('promoDesc').value || '';
    const descriptionKm = document.getElementById('promoDescKm').value || '';
    const videoUrl = document.getElementById('promoVideo').value || '';
    
    // Contact information
    const phone = document.getElementById('promoPhone').value || '';
    const whatsapp = document.getElementById('promoWhatsapp').value || '';
    const telegram = document.getElementById('promoTelegram').value || '';
    const facebook = document.getElementById('promoFacebook').value || '';
    const messenger = document.getElementById('promoMessenger').value || '';

    if (!title && !titleKm && !description && !descriptionKm) {
        alert('Please provide at least a title or description');
        return;
    }
    
    // Validate image field is not accidentally getting contact info
    if (image && (image.includes('t.me/') || image.includes('facebook.com/') || image.includes('m.me/') || image.includes('+') && image.length < 50)) {
        alert('Error: Main image field contains contact information instead of image URL. Please check your image URL.');
        return;
    }
    
    const images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(s => s) : [];
    
    try {
        if (!CONFIG.promotions) CONFIG.promotions = [];
        
        const promotionData = { 
            title: title || titleKm || 'Promotion', 
            titleKm: titleKm || title || 'ការផ្តល់ជូន', 
            category: category, 
            originalPrice: originalPrice || '$0',
            discount: discount || '0',
            price: price || '$0',
            promoLabel: promoLabel,
            image: image || 'https://via.placeholder.com/300x200?text=No+Image', 
            images, 
            description: description || descriptionKm || 'No description', 
            descriptionKm: descriptionKm || description || 'គ្មានការពិពណ៌នា',
            contact: {
                phone: phone,
                whatsapp: whatsapp,
                telegram: telegram,
                facebook: facebook,
                messenger: messenger
            }
        };
        
        if (videoUrl) {
            // Clean and convert video URL (same as posts)
            const cleanedUrl = cleanVideoUrl(videoUrl);
            promotionData.videoUrl = cleanedUrl;
            promotionData.embedUrl = convertToEmbedUrl(cleanedUrl);
        }
        
        // Debug logging
        console.log('✅ Saving promotion with image:', image.substring(0, 50));
        console.log('✅ Contact info:', promotionData.contact);
        
        if (id) {
            // EDIT MODE - Update existing promotion
            const promoIndex = CONFIG.promotions.findIndex(p => p.id === id);
            if (promoIndex !== -1) {
                // Preserve the ID and update all other fields
                CONFIG.promotions[promoIndex] = { id: id, ...promotionData };
                console.log('✅ Updated existing promotion with id:', id);
                console.log('✅ Updated promotion data:', CONFIG.promotions[promoIndex]);
            } else {
                alert('Promotion not found. Please refresh and try again.');
                return;
            }
        } else {
            // ADD MODE - Create new promotion
            const newId = CONFIG.promotions.length > 0 ? Math.max(...CONFIG.promotions.map(p => p.id)) + 1 : 1;
            CONFIG.promotions.push({ id: newId, ...promotionData });
            console.log('✅ Added new promotion with id:', newId);
        }
        
        console.log('💾 Calling saveAndRefresh...');
        const message = id ? 'Promotion updated successfully!' : 'Promotion added successfully!';
        saveAndRefresh(message, loadPromotionsTable);
    } catch (error) {
        console.error('❌ Error saving promotion:', error);
        alert('Error saving promotion: ' + error.message);
    }
};

window.editPromotion = function(id) {
    const promo = CONFIG.promotions.find(p => p.id === id);
    if (!promo) return;
    
    const categoryOptions = CONFIG.categories.filter(c => c.id !== 'all').map(c => 
        `<option value="${c.id}" ${c.id === promo.category ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    showModal('Edit Promotion', `
        <div class="form-group">
            <label>Current Image</label>
            <div class="current-image"><img src="${promo.image}" alt="Current" onerror="this.style.display='none'"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Title (English)</label><input type="text" id="promoTitle" class="form-control" value="${promo.title}"></div>
            <div class="form-group"><label>Title (Khmer)</label><input type="text" id="promoTitleKm" class="form-control" value="${promo.titleKm}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Category</label><select id="promoCategory" class="form-control">${categoryOptions}</select></div>
            <div class="form-group"><label>Original Price</label><input type="text" id="promoOriginalPrice" class="form-control" value="${promo.originalPrice || ''}" oninput="calculatePromotionPrice()"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Discount (%)</label><input type="number" id="promoDiscount" class="form-control" value="${promo.discount || ''}" min="0" max="100" oninput="calculatePromotionPrice()"></div>
            <div class="form-group"><label>Final Price</label><input type="text" id="promoPrice" class="form-control" value="${promo.price || ''}" readonly style="background:#f8f9fa;"></div>
        </div>
        <div class="form-group">
            <label>Promotional Label (Optional)</label>
            <select id="promoLabel" class="form-control">
                <option value="" ${!promo.promoLabel ? 'selected' : ''}>No Label</option>
                <option value="SALE" ${promo.promoLabel === 'SALE' ? 'selected' : ''}>🔥 SALE</option>
                <option value="HOT" ${promo.promoLabel === 'HOT' ? 'selected' : ''}>🔥 HOT</option>
                <option value="NEW" ${promo.promoLabel === 'NEW' ? 'selected' : ''}>✨ NEW</option>
                <option value="LIMITED" ${promo.promoLabel === 'LIMITED' ? 'selected' : ''}>⏰ LIMITED</option>
                <option value="BEST" ${promo.promoLabel === 'BEST' ? 'selected' : ''}>⭐ BEST DEAL</option>
                <option value="FLASH" ${promo.promoLabel === 'FLASH' ? 'selected' : ''}>⚡ FLASH SALE</option>
            </select>
        </div>
        <div class="form-group">
            <label>Main Image</label>
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'promoUrl')">🔗 URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'promoFile')">📁 Upload</button>
            </div>
        </div>
        <div id="promoUrl" class="upload-content active">
            <input type="text" id="promoImageUrl" class="form-control" value="${promo.image.startsWith('data:') ? '' : promo.image}">
        </div>
        <div id="promoFile" class="upload-content">
            <input type="file" id="promoImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'promoPreview')">
            <div id="promoPreview" class="image-preview"></div>
        </div>
        <input type="hidden" id="promoImage" value="${promo.image}">
        <div class="form-group">
            <label>Additional Images (comma-separated URLs)</label>
            <input type="text" id="promoImages" class="form-control" value="${promo.images ? promo.images.join(', ') : ''}">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="promoDesc" class="form-control">${promo.description || ''}</textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="promoDescKm" class="form-control">${promo.descriptionKm || ''}</textarea></div>
        </div>
        <div class="form-group">
            <label>Video URL (optional)</label>
            <input type="text" id="promoVideo" class="form-control" value="${escapeHtml(promo.videoUrl || '')}">
        </div>
        
        <h4 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Contact Information (Optional)</h4>
        <div class="form-row">
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="promoPhone" class="form-control" value="${promo.contact?.phone || ''}" placeholder="+1234567890">
            </div>
            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="promoWhatsapp" class="form-control" value="${promo.contact?.whatsapp || ''}" placeholder="+1234567890">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Telegram</label>
                <input type="text" id="promoTelegram" class="form-control" value="${promo.contact?.telegram || ''}" placeholder="https://t.me/username">
            </div>
            <div class="form-group">
                <label>Facebook</label>
                <input type="text" id="promoFacebook" class="form-control" value="${promo.contact?.facebook || ''}" placeholder="https://facebook.com/username">
            </div>
        </div>
        <div class="form-group">
            <label>Messenger</label>
            <input type="text" id="promoMessenger" class="form-control" value="${promo.contact?.messenger || ''}" placeholder="https://m.me/username">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="savePromotion(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.deletePromotion = function(id) {
    if (confirm('Delete this promotion?')) {
        CONFIG.promotions = CONFIG.promotions.filter(p => p.id !== id);
        saveAndRefresh('Promotion deleted!', loadPromotionsTable);
    }
};


// ============================================
// EVENTS
// ============================================
function loadEventsTable() {
    const tbody = document.getElementById('eventsTable');
    tbody.innerHTML = '';
    
    if (CONFIG.events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:40px;">No events yet.</td></tr>';
        return;
    }
    
    CONFIG.events.forEach(event => {
        const row = document.createElement('tr');
        const mediaInfo = event.type === 'video' 
            ? `<button class="btn-action btn-preview" onclick="previewVideo(${JSON.stringify(event.embedUrl)})">▶ Preview</button>` 
            : `<img src="${event.image}" class="table-image" alt="Event" onerror="this.style.display='none'">`;
        
        row.innerHTML = `
            <td>${event.id}</td>
            <td>${event.title}</td>
            <td><span class="status-badge ${event.type === 'video' ? 'status-enabled' : 'status-disabled'}">${event.type}</span></td>
            <td>${mediaInfo}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editEvent(${event.id})">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteEvent(${event.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addEvent = function() {
    showModal('Add Event', `
        <div class="form-group">
            <label>Event Type</label>
            <select id="eventType" class="form-control" onchange="toggleEventType()">
                <option value="video">📹 Video (YouTube, Facebook, TikTok, Instagram)</option>
                <option value="image">🖼️ Image</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Title (English)</label><input type="text" id="eventTitle" class="form-control"></div>
            <div class="form-group"><label>Title (Khmer)</label><input type="text" id="eventTitleKm" class="form-control"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="eventDesc" class="form-control"></textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="eventDescKm" class="form-control"></textarea></div>
        </div>
        <div id="videoFields">
            <div class="form-group">
                <label>Video Aspect Ratio</label>
                <select id="eventAspectRatio" class="form-control">
                    <option value="1/1">Square (1080x1080) - Instagram Style</option>
                    <option value="16/9">Landscape (1920x1080) - YouTube Style</option>
                    <option value="3/4">Portrait (960x1280) - TikTok/Reels Style</option>
                    <option value="9/16">Vertical (1080x1920) - Stories Style</option>
                </select>
                <small class="help-text">Choose how the video will display in the event feed</small>
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="text" id="eventEmbed" class="form-control" placeholder="Paste YouTube, Facebook, TikTok, or Instagram URL">
                <small class="help-text">Just paste the regular video URL - it will be converted automatically!</small>
            </div>
        </div>
        <div id="imageFields" style="display:none;">
            <div class="form-group">
                <label>Image Source</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'eventUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'eventFile')">📁 Upload</button>
                </div>
            </div>
            <div id="eventUrl" class="upload-content active">
                <input type="text" id="eventImageUrl" class="form-control" placeholder="https://example.com/image.jpg">
            </div>
            <div id="eventFile" class="upload-content">
                <input type="file" id="eventImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'eventPreview')">
                <div id="eventPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="eventImage" value="">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveEvent()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.toggleEventType = function() {
    const type = document.getElementById('eventType').value;
    document.getElementById('videoFields').style.display = type === 'video' ? 'block' : 'none';
    document.getElementById('imageFields').style.display = type === 'image' ? 'block' : 'none';
};

window.saveEvent = function(id = null) {
    const type = document.getElementById('eventType').value;
    const title = document.getElementById('eventTitle').value;
    const titleKm = document.getElementById('eventTitleKm').value;
    const description = document.getElementById('eventDesc').value;
    const descriptionKm = document.getElementById('eventDescKm').value;
    
    if (!title || !titleKm || !description || !descriptionKm) { alert('Please fill all fields'); return; }
    
    const eventData = { title, titleKm, description, descriptionKm, type };
    
    if (type === 'video') {
        let embedUrl = document.getElementById('eventEmbed').value;
        if (!embedUrl) { alert('Please enter video URL'); return; }
        
        // Clean the embed URL - handle iframe codes and HTML entities
        embedUrl = cleanVideoUrl(embedUrl);
        
        eventData.embedUrl = embedUrl;
        eventData.aspectRatio = document.getElementById('eventAspectRatio').value || '1/1';
        eventData.image = '';
    } else {
        const image = document.getElementById('eventImage').value || document.getElementById('eventImageUrl')?.value || '';
        if (!image) { alert('Please provide an image'); return; }
        eventData.image = image;
        eventData.embedUrl = '';
    }
    
    if (id) {
        const event = CONFIG.events.find(e => e.id === id);
        if (event) Object.assign(event, eventData);
    } else {
        const newId = CONFIG.events.length > 0 ? Math.max(...CONFIG.events.map(e => e.id)) + 1 : 1;
        CONFIG.events.push({ id: newId, ...eventData });
    }
    
    saveAndRefresh('Event saved!', loadEventsTable);
};

window.editEvent = function(id) {
    const event = CONFIG.events.find(e => e.id === id);
    if (!event) return;
    
    showModal('Edit Event', `
        <div class="form-group">
            <label>Event Type</label>
            <select id="eventType" class="form-control" onchange="toggleEventType()">
                <option value="video" ${event.type === 'video' ? 'selected' : ''}>📹 Video</option>
                <option value="image" ${event.type === 'image' ? 'selected' : ''}>🖼️ Image</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Title (English)</label><input type="text" id="eventTitle" class="form-control" value="${event.title}"></div>
            <div class="form-group"><label>Title (Khmer)</label><input type="text" id="eventTitleKm" class="form-control" value="${event.titleKm}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="eventDesc" class="form-control">${event.description}</textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="eventDescKm" class="form-control">${event.descriptionKm}</textarea></div>
        </div>
        <div id="videoFields" style="display:${event.type === 'video' ? 'block' : 'none'}">
            <div class="form-group">
                <label>Video Aspect Ratio</label>
                <select id="eventAspectRatio" class="form-control">
                    <option value="1/1" ${event.aspectRatio === '1/1' || !event.aspectRatio ? 'selected' : ''}>Square (1080x1080) - Instagram Style</option>
                    <option value="16/9" ${event.aspectRatio === '16/9' ? 'selected' : ''}>Landscape (1920x1080) - YouTube Style</option>
                    <option value="3/4" ${event.aspectRatio === '3/4' ? 'selected' : ''}>Portrait (960x1280) - TikTok/Reels Style</option>
                    <option value="9/16" ${event.aspectRatio === '9/16' ? 'selected' : ''}>Vertical (1080x1920) - Stories Style</option>
                </select>
                <small class="help-text">Choose how the video will display in the event feed</small>
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="text" id="eventEmbed" class="form-control" value="${event.embedUrl ? event.embedUrl.replace(/"/g, '&quot;') : ''}">
                <small class="help-text">YouTube, Facebook, TikTok, or Instagram URL</small>
            </div>
        </div>
        <div id="imageFields" style="display:${event.type === 'image' ? 'block' : 'none'}">
            ${event.image ? `<div class="form-group"><label>Current Image</label><div class="current-image"><img src="${event.image}" alt="Current" onerror="this.style.display='none'"></div></div>` : ''}
            <div class="form-group">
                <label>Image Source</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'eventUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'eventFile')">📁 Upload</button>
                </div>
            </div>
            <div id="eventUrl" class="upload-content active">
                <input type="text" id="eventImageUrl" class="form-control" value="${event.image && !event.image.startsWith('data:') ? event.image : ''}">
            </div>
            <div id="eventFile" class="upload-content">
                <input type="file" id="eventImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'eventPreview')">
                <div id="eventPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="eventImage" value="${event.image || ''}">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveEvent(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.deleteEvent = function(id) {
    if (confirm('Delete this event?')) {
        CONFIG.events = CONFIG.events.filter(e => e.id !== id);
        saveAndRefresh('Event deleted!', loadEventsTable);
    }
};

window.previewVideo = function(url) {
    const embedUrl = convertToEmbedUrl(url);
    
    console.log('Preview - Original URL:', url);
    console.log('Preview - Embed URL:', embedUrl);
    
    showModal('Video Preview', `
        <div class="video-container" style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; overflow: hidden; border-radius: 10px;">
            <iframe 
                src="${embedUrl}" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                frameborder="0" 
                allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin">
            </iframe>
        </div>
        <div style="margin-top: 15px; text-align: center;">
            <p><strong>Embed URL:</strong> <code style="font-size: 12px; word-break: break-all;">${embedUrl}</code></p>
            <a href="${url}" target="_blank" style="color: #007bff;">🔗 Open original video</a>
        </div>
        <div class="form-actions" style="margin-top:20px;">
            <button class="btn-cancel" onclick="closeModal()">Close</button>
        </div>
    `);
};

// Helper function to clean and extract URLs from various formats
function cleanVideoUrl(input) {
    if (!input) return '';
    
    input = input.trim();
    
    console.log('🔧 cleanVideoUrl input length:', input.length);
    console.log('🔧 cleanVideoUrl input:', input.substring(0, 200));
    
    // First, decode HTML entities if present
    if (input.includes('&quot;') || input.includes('&lt;') || input.includes('&gt;') || input.includes('&#')) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = input;
        input = textarea.value;
        console.log('🔧 After HTML decode:', input.substring(0, 200));
    }
    
    // If it's an iframe embed code, extract the src URL
    if (input.includes('<iframe') && input.includes('src')) {
        console.log('🔧 Detected iframe code, extracting src...');
        
        // Multiple regex patterns to try
        const patterns = [
            /src=["']([^"']+)["']/,           // src="url" or src='url'
            /src=([^\s>]+)/,                   // src=url (no quotes)
            /src\s*=\s*["']?([^"'\s>]+)["']?/ // src = url with spaces
        ];
        
        for (let pattern of patterns) {
            const srcMatch = input.match(pattern);
            if (srcMatch && srcMatch[1]) {
                const extractedUrl = srcMatch[1];
                console.log('✅ Extracted URL from iframe:', extractedUrl);
                return extractedUrl;
            }
        }
        
        console.log('❌ Could not extract URL from iframe');
        // If extraction fails, return the input as-is (it might already be a URL)
        return input;
    }
    
    // If it looks like it might be an incomplete iframe tag, try to extract anyway
    if (input.includes('<iframe') || input.includes('src=')) {
        console.log('🔧 Detected possible iframe fragment, attempting extraction...');
        const srcMatch = input.match(/src=["']?([^"'\s>]+)["']?/);
        if (srcMatch && srcMatch[1]) {
            const extractedUrl = srcMatch[1];
            console.log('✅ Extracted URL from fragment:', extractedUrl);
            return extractedUrl;
        }
    }
    
    console.log('✅ Returning input as-is');
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


// ============================================
// PRODUCTS
// ============================================
function loadProductsTable() {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '';
    
    if (!CONFIG.products || CONFIG.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:40px;">No products yet.</td></tr>';
        return;
    }
    
    CONFIG.products.forEach(product => {
        const categoryName = CONFIG.categories.find(c => c.id === product.category)?.name || product.category;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${product.image}" class="table-image" alt="Product" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23f0f0f0%22 width=%2260%22 height=%2260%22/></svg>'"></td>
            <td>${product.name}</td>
            <td>${categoryName}</td>
            <td>${product.price}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addProduct = function() {
    const categoryOptions = CONFIG.categories.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    showModal('Add Product', `
        <div class="form-row">
            <div class="form-group"><label>Name (English)</label><input type="text" id="productName" class="form-control"></div>
            <div class="form-group"><label>Name (Khmer)</label><input type="text" id="productNameKm" class="form-control"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Category</label><select id="productCategory" class="form-control">${categoryOptions}</select></div>
            <div class="form-group"><label>Price</label><input type="text" id="productPrice" class="form-control" placeholder="$99"></div>
        </div>
        <div class="form-group">
            <label>Main Image</label>
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'productUrl')">🔗 URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'productFile')">📁 Upload</button>
            </div>
        </div>
        <div id="productUrl" class="upload-content active">
            <input type="text" id="productImageUrl" class="form-control" placeholder="https://example.com/image.jpg">
        </div>
        <div id="productFile" class="upload-content">
            <input type="file" id="productImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'productPreview')">
            <div id="productPreview" class="image-preview"></div>
        </div>
        <input type="hidden" id="productImage" value="">
        <div class="form-group">
            <label>Additional Images (optional, comma-separated URLs)</label>
            <input type="text" id="productImages" class="form-control" placeholder="url1, url2, url3">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="productDesc" class="form-control"></textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="productDescKm" class="form-control"></textarea></div>
        </div>
        <div class="form-group">
            <label>Video URL (optional - YouTube, Facebook, TikTok, Instagram)</label>
            <input type="text" id="productVideo" class="form-control" placeholder="Paste video URL here">
        </div>
        
        <h4 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Contact Information (Optional)</h4>
        <div class="form-row">
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="productPhone" class="form-control" placeholder="+1234567890">
            </div>
            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="productWhatsapp" class="form-control" placeholder="+1234567890">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Telegram</label>
                <input type="text" id="productTelegram" class="form-control" placeholder="https://t.me/username">
            </div>
            <div class="form-group">
                <label>Facebook</label>
                <input type="text" id="productFacebook" class="form-control" placeholder="https://facebook.com/username">
            </div>
        </div>
        <div class="form-group">
            <label>Messenger</label>
            <input type="text" id="productMessenger" class="form-control" placeholder="https://m.me/username">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveProduct()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.saveProduct = function(id = null) {
    console.log('💾 saveProduct called with id:', id);
    
    const name = document.getElementById('productName').value || '';
    const nameKm = document.getElementById('productNameKm').value || '';
    const category = document.getElementById('productCategory').value || 'general';
    const price = document.getElementById('productPrice').value || '';
    
    // Fix image assignment - check hidden field first (for uploaded images), then URL field
    const imageHidden = document.getElementById('productImage')?.value || '';
    const imageUrl = document.getElementById('productImageUrl')?.value || '';
    
    // Use hidden field if it has data (uploaded image), otherwise use URL field
    let image = '';
    if (imageHidden && imageHidden.startsWith('data:')) {
        // New uploaded image
        image = imageHidden;
        console.log('✅ Using uploaded image (data URL)');
    } else if (imageUrl && imageUrl.trim()) {
        // URL-based image
        image = imageUrl;
        console.log('✅ Using URL-based image:', imageUrl);
    } else if (imageHidden && imageHidden.trim()) {
        // Fallback to hidden field if it has a URL
        image = imageHidden;
        console.log('✅ Using hidden field image:', imageHidden);
    }
    
    const imagesStr = document.getElementById('productImages').value || '';
    const description = document.getElementById('productDesc').value || '';
    const descriptionKm = document.getElementById('productDescKm').value || '';
    const videoUrl = document.getElementById('productVideo').value || '';
    
    // Contact information
    const phone = document.getElementById('productPhone').value || '';
    const whatsapp = document.getElementById('productWhatsapp').value || '';
    const telegram = document.getElementById('productTelegram').value || '';
    const facebook = document.getElementById('productFacebook').value || '';
    const messenger = document.getElementById('productMessenger').value || '';
    
    console.log('📝 Product data:', { name, nameKm, category, price, image: image.substring(0, 50) });
    
    if (!name && !nameKm && !description && !descriptionKm) {
        alert('Please provide at least a product name or description');
        return;
    }
    
    // Validate image field is not accidentally getting contact info
    if (image && (image.includes('t.me/') || image.includes('facebook.com/') || image.includes('m.me/') || image.includes('+') && image.length < 50)) {
        alert('Error: Main image field contains contact information instead of image URL. Please check your image URL.');
        return;
    }
    
    const images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(s => s) : [];
    
    try {
        if (!CONFIG.products) CONFIG.products = [];
        
        const productData = { 
            name: name || nameKm || 'Product', 
            nameKm: nameKm || name || 'ផលិតផល', 
            category: category, 
            price: price || '$0', 
            image: image || 'https://via.placeholder.com/300x200?text=No+Image', 
            images, 
            description: description || descriptionKm || 'No description', 
            descriptionKm: descriptionKm || description || 'គ្មានការពិពណ៌នា',
            contact: {
                phone: phone,
                whatsapp: whatsapp,
                telegram: telegram,
                facebook: facebook,
                messenger: messenger
            }
        };
        
        if (videoUrl) {
            // Clean and convert video URL (same as posts)
            const cleanedUrl = cleanVideoUrl(videoUrl);
            productData.videoUrl = cleanedUrl;
            productData.embedUrl = convertToEmbedUrl(cleanedUrl);
        }
        
        // Debug logging
        console.log('✅ Saving product with image:', image.substring(0, 50));
        console.log('✅ Contact info:', productData.contact);
        
        if (id) {
            // EDIT MODE - Update existing product
            const productIndex = CONFIG.products.findIndex(p => p.id === id);
            if (productIndex !== -1) {
                // Preserve the ID and update all other fields
                CONFIG.products[productIndex] = { id: id, ...productData };
                console.log('✅ Updated existing product with id:', id);
                console.log('✅ Updated product data:', CONFIG.products[productIndex]);
            } else {
                alert('Product not found. Please refresh and try again.');
                return;
            }
        } else {
            // ADD MODE - Create new product
            const newId = CONFIG.products.length > 0 ? Math.max(...CONFIG.products.map(p => p.id)) + 1 : 1;
            CONFIG.products.push({ id: newId, ...productData });
            console.log('✅ Added new product with id:', newId);
        }
        
        console.log('💾 Calling saveAndRefresh...');
        const message = id ? 'Product updated successfully!' : 'Product added successfully!';
        saveAndRefresh(message, loadProductsTable);
    } catch (error) {
        console.error('❌ Error saving product:', error);
        alert('Error saving product: ' + error.message);
    }
};

window.editProduct = function(id) {
    const product = CONFIG.products.find(p => p.id === id);
    if (!product) return;
    
    const categoryOptions = CONFIG.categories.filter(c => c.id !== 'all').map(c => 
        `<option value="${c.id}" ${c.id === product.category ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    showModal('Edit Product', `
        <div class="form-group">
            <label>Current Image</label>
            <div class="current-image"><img src="${product.image}" alt="Current" onerror="this.style.display='none'"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Name (English)</label><input type="text" id="productName" class="form-control" value="${product.name}"></div>
            <div class="form-group"><label>Name (Khmer)</label><input type="text" id="productNameKm" class="form-control" value="${product.nameKm}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Category</label><select id="productCategory" class="form-control">${categoryOptions}</select></div>
            <div class="form-group"><label>Price</label><input type="text" id="productPrice" class="form-control" value="${product.price}"></div>
        </div>
        <div class="form-group">
            <label>Main Image</label>
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'productUrl')">🔗 URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'productFile')">📁 Upload</button>
            </div>
        </div>
        <div id="productUrl" class="upload-content active">
            <input type="text" id="productImageUrl" class="form-control" value="${product.image.startsWith('data:') ? '' : product.image}">
        </div>
        <div id="productFile" class="upload-content">
            <input type="file" id="productImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'productPreview')">
            <div id="productPreview" class="image-preview"></div>
        </div>
        <input type="hidden" id="productImage" value="${product.image}">
        <div class="form-group">
            <label>Additional Images (comma-separated URLs)</label>
            <input type="text" id="productImages" class="form-control" value="${product.images ? product.images.join(', ') : ''}">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="productDesc" class="form-control">${product.description}</textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="productDescKm" class="form-control">${product.descriptionKm}</textarea></div>
        </div>
        <div class="form-group">
            <label>Video URL (optional)</label>
            <input type="text" id="productVideo" class="form-control" value="${escapeHtml(product.videoUrl || '')}">
        </div>
        
        <h4 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Contact Information (Optional)</h4>
        <div class="form-row">
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="productPhone" class="form-control" value="${product.contact?.phone || ''}" placeholder="+1234567890">
            </div>
            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="productWhatsapp" class="form-control" value="${product.contact?.whatsapp || ''}" placeholder="+1234567890">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Telegram</label>
                <input type="text" id="productTelegram" class="form-control" value="${product.contact?.telegram || ''}" placeholder="https://t.me/username">
            </div>
            <div class="form-group">
                <label>Facebook</label>
                <input type="text" id="productFacebook" class="form-control" value="${product.contact?.facebook || ''}" placeholder="https://facebook.com/username">
            </div>
        </div>
        <div class="form-group">
            <label>Messenger</label>
            <input type="text" id="productMessenger" class="form-control" value="${product.contact?.messenger || ''}" placeholder="https://m.me/username">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveProduct(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.deleteProduct = function(id) {
    if (confirm('Delete this product?')) {
        CONFIG.products = CONFIG.products.filter(p => p.id !== id);
        saveAndRefresh('Product deleted!', loadProductsTable);
    }
};

// ============================================
// POSTS
// ============================================
function loadPostsTable() {
    const tbody = document.getElementById('postsTable');
    tbody.innerHTML = '';
    
    if (!CONFIG.posts || CONFIG.posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:40px;">No posts yet. Click "+ Add Post" to create one.</td></tr>';
        return;
    }
    
    CONFIG.posts.forEach(post => {
        const row = document.createElement('tr');
        const typeIcon = post.type === 'video' ? '📹' : '🖼️';
        const mediaPreview = post.type === 'video' 
            ? `<button class="btn-action btn-preview" onclick="previewVideo('${post.embedUrl || post.videoUrl}')">▶ Preview</button>`
            : `<img src="${post.image}" class="table-image" alt="Post" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23f0f0f0%22 width=%2260%22 height=%2260%22/><text x=%2250%%22 y=%2250%%22 font-size=%228%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>'">`;
        
        row.innerHTML = `
            <td>${post.id}</td>
            <td>${mediaPreview}</td>
            <td>${typeIcon} ${post.title}</td>
            <td>${post.titleKm}</td>
            <td><span class="status-badge ${post.enabled ? 'status-enabled' : 'status-disabled'}">${post.enabled ? 'Published' : 'Draft'}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editPost(${post.id})">Edit</button>
                <button class="btn-action btn-toggle" onclick="togglePost(${post.id})">${post.enabled ? 'Unpublish' : 'Publish'}</button>
                <button class="btn-action btn-delete" onclick="deletePost(${post.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addPost = function() {
    showModal('Add Post', `
        <div class="form-group">
            <label>Post Type</label>
            <select id="postType" class="form-control" onchange="togglePostType()">
                <option value="image">🖼️ Image Post</option>
                <option value="video">📹 Video Post (YouTube, Facebook, TikTok, Instagram)</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Title (English)</label>
                <input type="text" id="postTitle" class="form-control" placeholder="Post title">
            </div>
            <div class="form-group">
                <label>Title (Khmer)</label>
                <input type="text" id="postTitleKm" class="form-control" placeholder="ចំណងជើងប្រកាស">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Content (English)</label>
                <textarea id="postContent" class="form-control" rows="4" placeholder="Post content..."></textarea>
            </div>
            <div class="form-group">
                <label>Content (Khmer)</label>
                <textarea id="postContentKm" class="form-control" rows="4" placeholder="មាតិកាប្រកាស..."></textarea>
            </div>
        </div>
        <div id="imageFields">
            <div class="form-group">
                <label>Post Image</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'postUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'postFile')">📁 Upload</button>
                </div>
            </div>
            <div id="postUrl" class="upload-content active">
                <input type="text" id="postImageUrl" class="form-control" placeholder="https://example.com/image.jpg">
            </div>
            <div id="postFile" class="upload-content">
                <input type="file" id="postImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'postPreview')">
                <div id="postPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="postImage" value="">
            <div class="form-group">
                <label>Additional Images (optional, comma-separated URLs)</label>
                <input type="text" id="postImages" class="form-control" placeholder="url1, url2, url3">
            </div>
        </div>
        <div id="videoFields" style="display:none;">
            <div class="form-group">
                <label>Video Aspect Ratio</label>
                <select id="postAspectRatio" class="form-control">
                    <option value="1/1">Square (1080x1080) - Instagram Style</option>
                    <option value="16/9">Landscape (1920x1080) - YouTube Style</option>
                    <option value="3/4">Portrait (960x1280) - TikTok/Reels Style</option>
                    <option value="9/16">Vertical (1080x1920) - Stories Style</option>
                </select>
                <small class="help-text">Choose how the video thumbnail will display in the feed</small>
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="text" id="postVideoUrl" class="form-control" placeholder="Paste YouTube, Facebook, TikTok, or Instagram URL">
                <small class="help-text">Just paste the regular video URL - it will be converted automatically!</small>
            </div>
            <div class="form-group">
                <label>Thumbnail Image (optional)</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'postThumbUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'postThumbFile')">📁 Upload</button>
                </div>
            </div>
            <div id="postThumbUrl" class="upload-content active">
                <input type="text" id="postThumbnailUrl" class="form-control" placeholder="https://example.com/thumbnail.jpg">
            </div>
            <div id="postThumbFile" class="upload-content">
                <input type="file" id="postThumbnailFile" class="form-control" accept="image/*" onchange="previewImage(this, 'postThumbPreview')">
                <div id="postThumbPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="postThumbnail" value="">
        </div>
        <div class="form-group">
            <label>External Link (optional)</label>
            <input type="text" id="postLink" class="form-control" placeholder="https://example.com">
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="postEnabled" checked> Published</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="savePost()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.togglePostType = function() {
    const type = document.getElementById('postType').value;
    document.getElementById('imageFields').style.display = type === 'image' ? 'block' : 'none';
    document.getElementById('videoFields').style.display = type === 'video' ? 'block' : 'none';
};

window.savePost = function(id = null) {
    const type = document.getElementById('postType').value;
    const title = document.getElementById('postTitle').value || '';
    const titleKm = document.getElementById('postTitleKm').value || '';
    const content = document.getElementById('postContent').value || '';
    const contentKm = document.getElementById('postContentKm').value || '';
    const link = document.getElementById('postLink').value || '';
    const enabled = document.getElementById('postEnabled').checked;
    
    if (!title && !titleKm && !content && !contentKm) { 
        alert('Please provide at least a title or content'); 
        return; 
    }
    
    try {
        if (!CONFIG.posts) CONFIG.posts = [];
        
        const postData = { 
            title: title || titleKm || 'Post', 
            titleKm: titleKm || title || 'ប្រកាស', 
            content: content || contentKm || 'No content', 
            contentKm: contentKm || content || 'គ្មានមាតិកា', 
            link: link || '#', 
            enabled, 
            type 
        };
        
        if (type === 'video') {
            let videoUrl = document.getElementById('postVideoUrl').value || '';
            if (!videoUrl) { 
                alert('Please enter video URL for video posts'); 
                return; 
            }
            
            videoUrl = cleanVideoUrl(videoUrl);
            postData.videoUrl = videoUrl;
            postData.embedUrl = convertToEmbedUrl(videoUrl);
            postData.aspectRatio = document.getElementById('postAspectRatio').value || '1/1';
            
            const thumbnail = document.getElementById('postThumbnail').value || document.getElementById('postThumbnailUrl')?.value || '';
            postData.thumbnail = thumbnail;
            postData.image = thumbnail || 'https://via.placeholder.com/300x200?text=Video+Post';
        } else {
            const image = document.getElementById('postImage').value || document.getElementById('postImageUrl')?.value || '';
            postData.image = image || 'https://via.placeholder.com/300x200?text=Image+Post';
            
            const imagesStr = document.getElementById('postImages').value || '';
            postData.images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(s => s) : [];
        }
        
        if (id) {
            const post = CONFIG.posts.find(p => p.id === id);
            if (post) {
                Object.assign(post, postData);
            } else {
                alert('Post not found. Please refresh and try again.');
                return;
            }
        } else {
            const newId = CONFIG.posts.length > 0 ? Math.max(...CONFIG.posts.map(p => p.id)) + 1 : 1;
            CONFIG.posts.push({ id: newId, ...postData });
        }
        
        saveAndRefresh('Post saved successfully!', loadPostsTable);
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Error saving post: ' + error.message);
    }
};

window.editPost = function(id) {
    const post = CONFIG.posts.find(p => p.id === id);
    if (!post) return;
    
    showModal('Edit Post', `
        <div class="form-group">
            <label>Post Type</label>
            <select id="postType" class="form-control" onchange="togglePostType()">
                <option value="image" ${post.type === 'image' ? 'selected' : ''}>🖼️ Image Post</option>
                <option value="video" ${post.type === 'video' ? 'selected' : ''}>📹 Video Post</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Title (English)</label>
                <input type="text" id="postTitle" class="form-control" value="${post.title}">
            </div>
            <div class="form-group">
                <label>Title (Khmer)</label>
                <input type="text" id="postTitleKm" class="form-control" value="${post.titleKm}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Content (English)</label>
                <textarea id="postContent" class="form-control" rows="4">${post.content}</textarea>
            </div>
            <div class="form-group">
                <label>Content (Khmer)</label>
                <textarea id="postContentKm" class="form-control" rows="4">${post.contentKm}</textarea>
            </div>
        </div>
        <div id="imageFields" style="display:${post.type === 'image' ? 'block' : 'none'}">
            ${post.image && post.type === 'image' ? `<div class="form-group"><label>Current Image</label><div class="current-image"><img src="${post.image}" alt="Current" onerror="this.style.display='none'"></div></div>` : ''}
            <div class="form-group">
                <label>Post Image</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'postUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'postFile')">📁 Upload</button>
                </div>
            </div>
            <div id="postUrl" class="upload-content active">
                <input type="text" id="postImageUrl" class="form-control" value="${post.image && !post.image.startsWith('data:') && post.type === 'image' ? post.image : ''}">
            </div>
            <div id="postFile" class="upload-content">
                <input type="file" id="postImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'postPreview')">
                <div id="postPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="postImage" value="${post.type === 'image' ? post.image || '' : ''}">
            <div class="form-group">
                <label>Additional Images (comma-separated URLs)</label>
                <input type="text" id="postImages" class="form-control" value="${post.images ? post.images.join(', ') : ''}">
            </div>
        </div>
        <div id="videoFields" style="display:${post.type === 'video' ? 'block' : 'none'}">
            <div class="form-group">
                <label>Video Aspect Ratio</label>
                <select id="postAspectRatio" class="form-control">
                    <option value="1/1" ${post.aspectRatio === '1/1' || !post.aspectRatio ? 'selected' : ''}>Square (1080x1080) - Instagram Style</option>
                    <option value="16/9" ${post.aspectRatio === '16/9' ? 'selected' : ''}>Landscape (1920x1080) - YouTube Style</option>
                    <option value="3/4" ${post.aspectRatio === '3/4' ? 'selected' : ''}>Portrait (960x1280) - TikTok/Reels Style</option>
                    <option value="9/16" ${post.aspectRatio === '9/16' ? 'selected' : ''}>Vertical (1080x1920) - Stories Style</option>
                </select>
                <small class="help-text">Choose how the video thumbnail will display in the feed</small>
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="text" id="postVideoUrl" class="form-control" value="${escapeHtml(post.videoUrl || '')}" placeholder="Paste YouTube, Facebook, TikTok, or Instagram URL">
                <small class="help-text">Just paste the regular video URL - it will be converted automatically!</small>
            </div>
            ${post.thumbnail ? `<div class="form-group"><label>Current Thumbnail</label><div class="current-image"><img src="${post.thumbnail}" alt="Current" onerror="this.style.display='none'"></div></div>` : ''}
            <div class="form-group">
                <label>Thumbnail Image (optional)</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'postThumbUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'postThumbFile')">📁 Upload</button>
                </div>
            </div>
            <div id="postThumbUrl" class="upload-content active">
                <input type="text" id="postThumbnailUrl" class="form-control" value="${post.thumbnail && !post.thumbnail.startsWith('data:') ? post.thumbnail : ''}">
            </div>
            <div id="postThumbFile" class="upload-content">
                <input type="file" id="postThumbnailFile" class="form-control" accept="image/*" onchange="previewImage(this, 'postThumbPreview')">
                <div id="postThumbPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="postThumbnail" value="${post.thumbnail || ''}">
        </div>
        <div class="form-group">
            <label>External Link (optional)</label>
            <input type="text" id="postLink" class="form-control" value="${post.link || ''}">
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="postEnabled" ${post.enabled ? 'checked' : ''}> Published</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="savePost(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.togglePost = function(id) {
    const post = CONFIG.posts.find(p => p.id === id);
    if (post) {
        post.enabled = !post.enabled;
        saveAndRefresh('Post status updated!', loadPostsTable);
    }
};

window.deletePost = function(id) {
    if (confirm('Delete this post?')) {
        CONFIG.posts = CONFIG.posts.filter(p => p.id !== id);
        saveAndRefresh('Post deleted!', loadPostsTable);
    }
};

// ============================================
// CATEGORIES
// ============================================
function loadCategoriesTable() {
    const tbody = document.getElementById('categoriesTable');
    tbody.innerHTML = '';
    
    const editableCategories = CONFIG.categories.filter(c => c.id !== 'all');
    
    if (editableCategories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:40px;">No categories yet.</td></tr>';
        return;
    }
    
    editableCategories.forEach(cat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>${cat.nameKm}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editCategory('${cat.id}')">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteCategory('${cat.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addCategory = function() {
    showModal('Add Category', `
        <div class="form-group">
            <label>Category ID (lowercase, no spaces)</label>
            <input type="text" id="categoryId" class="form-control" placeholder="electronics">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Name (English)</label><input type="text" id="categoryName" class="form-control"></div>
            <div class="form-group"><label>Name (Khmer)</label><input type="text" id="categoryNameKm" class="form-control"></div>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCategory()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.saveCategory = function(oldId = null) {
    const id = document.getElementById('categoryId').value.toLowerCase().replace(/\s+/g, '');
    const name = document.getElementById('categoryName').value;
    const nameKm = document.getElementById('categoryNameKm').value;
    
    if (!id || !name || !nameKm) { alert('Please fill all fields'); return; }
    
    if (oldId) {
        const category = CONFIG.categories.find(c => c.id === oldId);
        if (category) Object.assign(category, { id, name, nameKm });
    } else {
        if (CONFIG.categories.find(c => c.id === id)) { alert('Category ID already exists'); return; }
        CONFIG.categories.push({ id, name, nameKm });
    }
    
    saveAndRefresh('Category saved!', loadCategoriesTable);
};

window.editCategory = function(id) {
    const category = CONFIG.categories.find(c => c.id === id);
    if (!category) return;
    
    showModal('Edit Category', `
        <div class="form-group">
            <label>Category ID</label>
            <input type="text" id="categoryId" class="form-control" value="${category.id}">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Name (English)</label><input type="text" id="categoryName" class="form-control" value="${category.name}"></div>
            <div class="form-group"><label>Name (Khmer)</label><input type="text" id="categoryNameKm" class="form-control" value="${category.nameKm}"></div>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCategory('${id}')">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.deleteCategory = function(id) {
    if (confirm('Delete this category?')) {
        CONFIG.categories = CONFIG.categories.filter(c => c.id !== id);
        saveAndRefresh('Category deleted!', loadCategoriesTable);
    }
};


// ============================================
// THEMES - Removed (Only Alibaba theme available)
// Theme management has been simplified to use only Alibaba theme

// ============================================
// SETTINGS
// ============================================
function loadSettings() {
    // Load logo
    if (CONFIG.logo) {
        document.getElementById('logoImage').value = CONFIG.logo;
        document.getElementById('logoUrl').value = CONFIG.logo.startsWith('data:') ? '' : CONFIG.logo;
        document.getElementById('logoPreview').innerHTML = `<img src="${CONFIG.logo}" alt="Logo" style="max-width: 200px; max-height: 100px; object-fit: contain;">`;
    }
    
    // Load site settings
    const siteSettings = CONFIG.siteSettings || {};
    document.getElementById('siteTitle').value = siteSettings.title || 'Mobile Website';
    document.getElementById('siteTitleKm').value = siteSettings.titleKm || 'គេហទំព័រទូរស័ព្ទ';
    document.getElementById('siteDescription').value = siteSettings.description || 'Welcome to our online store';
    document.getElementById('siteDescriptionKm').value = siteSettings.descriptionKm || 'សូមស្វាគមន៍មកកាន់ហាងអនឡាញរបស់យើង';
    document.getElementById('siteKeywords').value = siteSettings.keywords || 'online store, products, shopping';
    
    if (siteSettings.favicon) {
        document.getElementById('faviconImage').value = siteSettings.favicon;
        document.getElementById('faviconUrl').value = siteSettings.favicon.startsWith('data:') ? '' : siteSettings.favicon;
        document.getElementById('faviconPreview').innerHTML = `<img src="${siteSettings.favicon}" alt="Favicon" style="width: 64px; height: 64px; object-fit: contain; border: 1px solid #ddd; padding: 5px; background: white;">`;
    }
    
    if (siteSettings.ogImage) {
        document.getElementById('ogImageData').value = siteSettings.ogImage;
        document.getElementById('ogImageUrl').value = siteSettings.ogImage.startsWith('data:') ? '' : siteSettings.ogImage;
        document.getElementById('ogImagePreview').innerHTML = `<img src="${siteSettings.ogImage}" alt="Share Image" style="max-width: 400px; max-height: 200px; object-fit: contain; border: 1px solid #ddd;">`;
    }
    
    document.getElementById('navStyle').value = CONFIG.navigationStyle || 'solid';
    
    if (CONFIG.navigationStyle === 'custom' && CONFIG.customNavColors) {
        document.getElementById('customNavColors').style.display = 'block';
        document.getElementById('navBgColor').value = CONFIG.customNavColors.background;
        document.getElementById('navTextColor').value = CONFIG.customNavColors.text;
        document.getElementById('navActiveColor').value = CONFIG.customNavColors.activeButton;
    }
    
    if (CONFIG.problemSolveBanner) {
        document.getElementById('problemBannerEnabled').checked = CONFIG.problemSolveBanner.enabled || false;
        document.getElementById('problemBannerImage').value = CONFIG.problemSolveBanner.image || '';
        document.getElementById('problemBannerLink').value = CONFIG.problemSolveBanner.link || '';
        document.getElementById('problemBannerTitleEn').value = CONFIG.problemSolveBanner.titleEn || '';
        document.getElementById('problemBannerTitleKm').value = CONFIG.problemSolveBanner.titleKm || '';
        document.getElementById('problemBannerDescEn').value = CONFIG.problemSolveBanner.descriptionEn || '';
        document.getElementById('problemBannerDescKm').value = CONFIG.problemSolveBanner.descriptionKm || '';
    }
    
    // Load About Us content
    document.getElementById('aboutTitleEn').value = CONFIG.aboutUs?.titleEn || 'About Us';
    document.getElementById('aboutTitleKm').value = CONFIG.aboutUs?.titleKm || 'អំពីយើង';
    document.getElementById('aboutContentEn').value = CONFIG.aboutUs?.contentEn || 'Welcome to our store!';
    document.getElementById('aboutContentKm').value = CONFIG.aboutUs?.contentKm || 'សូមស្វាគមន៍មកកាន់ហាងរបស់យើង!';
    
    document.getElementById('settingPhone').value = CONFIG.contact?.phone || '';
    document.getElementById('settingEmail').value = CONFIG.contact?.email || '';
    document.getElementById('settingAddress').value = CONFIG.contact?.address || '';
    document.getElementById('settingWhatsapp').value = CONFIG.contact?.whatsapp || '';
    document.getElementById('settingTelegram').value = CONFIG.contact?.telegram || '';
    document.getElementById('settingFacebook').value = CONFIG.contact?.facebook || '';
    document.getElementById('settingMessenger').value = CONFIG.contact?.messenger || '';
    document.getElementById('settingProblemLink').value = CONFIG.problemSolveLink || '';
    
    // Load language file preview
    if (CONFIG.languageData) {
        let previewHtml = '<div style="font-family: monospace; font-size: 12px;">';
        let count = 0;
        
        for (const [key, value] of Object.entries(CONFIG.languageData)) {
            if (count >= 10) {
                previewHtml += `<div style="color: #666; font-style: italic;">... and ${Object.keys(CONFIG.languageData).length - 10} more entries</div>`;
                break;
            }
            
            previewHtml += `<div style="margin-bottom: 8px; padding: 5px; background: #fff; border-left: 3px solid #ff6a00;">`;
            previewHtml += `<strong>"${key}":</strong><br>`;
            
            if (typeof value === 'object' && value !== null) {
                for (const [lang, text] of Object.entries(value)) {
                    previewHtml += `&nbsp;&nbsp;${lang}: "${text}"<br>`;
                }
            } else {
                previewHtml += `&nbsp;&nbsp;"${value}"<br>`;
            }
            
            previewHtml += `</div>`;
            count++;
        }
        
        previewHtml += '</div>';
        document.getElementById('languagePreview').innerHTML = previewHtml;
    } else {
        document.getElementById('languagePreview').innerHTML = '<em>No language file uploaded</em>';
    }
}

window.toggleCustomNavColors = function() {
    const navStyle = document.getElementById('navStyle').value;
    document.getElementById('customNavColors').style.display = navStyle === 'custom' ? 'block' : 'none';
};

window.previewLogo = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('logoImage').value = e.target.result;
            document.getElementById('logoPreview').innerHTML = `<img src="${e.target.result}" alt="Logo Preview" style="max-width: 200px; max-height: 100px; object-fit: contain;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// Preview favicon
window.previewFavicon = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('faviconImage').value = e.target.result;
            document.getElementById('faviconPreview').innerHTML = `<img src="${e.target.result}" alt="Favicon Preview" style="width: 64px; height: 64px; object-fit: contain; border: 1px solid #ddd; padding: 5px; background: white;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

// Preview Open Graph image
window.previewOgImage = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('ogImageData').value = e.target.result;
            document.getElementById('ogImagePreview').innerHTML = `<img src="${e.target.result}" alt="Share Image Preview" style="max-width: 400px; max-height: 200px; object-fit: contain; border: 1px solid #ddd;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.saveSettings = async function() {
    // Save logo
    const logoImage = document.getElementById('logoImage').value || document.getElementById('logoUrl').value || '';
    CONFIG.logo = logoImage;
    
    // Save site settings (title, favicon, meta tags)
    CONFIG.siteSettings = {
        title: document.getElementById('siteTitle').value || 'Mobile Website',
        titleKm: document.getElementById('siteTitleKm').value || 'គេហទំព័រទូរស័ព្ទ',
        favicon: document.getElementById('faviconImage').value || document.getElementById('faviconUrl').value || '',
        description: document.getElementById('siteDescription').value || 'Welcome to our online store',
        descriptionKm: document.getElementById('siteDescriptionKm').value || 'សូមស្វាគមន៍មកកាន់ហាងអនឡាញរបស់យើង',
        ogImage: document.getElementById('ogImageData').value || document.getElementById('ogImageUrl').value || '',
        keywords: document.getElementById('siteKeywords').value || 'online store, products, shopping'
    };
    
    console.log('💾 Saving site settings:', CONFIG.siteSettings);
    
    CONFIG.navigationStyle = document.getElementById('navStyle').value;
    
    if (CONFIG.navigationStyle === 'custom') {
        CONFIG.customNavColors = {
            background: document.getElementById('navBgColor').value,
            text: document.getElementById('navTextColor').value,
            activeButton: document.getElementById('navActiveColor').value
        };
    }
    
    CONFIG.problemSolveBanner = {
        enabled: document.getElementById('problemBannerEnabled').checked,
        image: document.getElementById('problemBannerImage').value,
        link: document.getElementById('problemBannerLink').value,
        titleEn: document.getElementById('problemBannerTitleEn').value,
        titleKm: document.getElementById('problemBannerTitleKm').value,
        descriptionEn: document.getElementById('problemBannerDescEn').value,
        descriptionKm: document.getElementById('problemBannerDescKm').value
    };
    
    // Save About Us content
    CONFIG.aboutUs = {
        titleEn: document.getElementById('aboutTitleEn').value,
        titleKm: document.getElementById('aboutTitleKm').value,
        contentEn: document.getElementById('aboutContentEn').value,
        contentKm: document.getElementById('aboutContentKm').value
    };
    
    console.log('💾 Saving About Us:', CONFIG.aboutUs);
    
    CONFIG.contact = {
        phone: document.getElementById('settingPhone').value,
        email: document.getElementById('settingEmail').value,
        address: document.getElementById('settingAddress').value,
        whatsapp: document.getElementById('settingWhatsapp').value,
        telegram: document.getElementById('settingTelegram').value,
        facebook: document.getElementById('settingFacebook').value,
        messenger: document.getElementById('settingMessenger').value
    };
    
    CONFIG.problemSolveLink = document.getElementById('settingProblemLink').value;
    
    await saveToLocalStorage();
    showSuccess('Settings saved! Refresh the website to see changes.');
};

// ============================================
// LANGUAGE MANAGEMENT
// ============================================
window.previewLanguageFile = function(input) {
    const preview = document.getElementById('languagePreview');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.json')) {
            alert('Please select a JSON file');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonContent = JSON.parse(e.target.result);
                
                // Validate JSON structure
                if (typeof jsonContent !== 'object' || jsonContent === null) {
                    throw new Error('Invalid JSON structure');
                }
                
                // Store the language data temporarily
                window.tempLanguageData = jsonContent;
                
                // Preview the content
                let previewHtml = '<div style="font-family: monospace; font-size: 12px;">';
                let count = 0;
                
                for (const [key, value] of Object.entries(jsonContent)) {
                    if (count >= 10) {
                        previewHtml += `<div style="color: #666; font-style: italic;">... and ${Object.keys(jsonContent).length - 10} more entries</div>`;
                        break;
                    }
                    
                    previewHtml += `<div style="margin-bottom: 8px; padding: 5px; background: #fff; border-left: 3px solid #ff6a00;">`;
                    previewHtml += `<strong>"${key}":</strong><br>`;
                    
                    if (typeof value === 'object' && value !== null) {
                        for (const [lang, text] of Object.entries(value)) {
                            previewHtml += `&nbsp;&nbsp;${lang}: "${text}"<br>`;
                        }
                    } else {
                        previewHtml += `&nbsp;&nbsp;"${value}"<br>`;
                    }
                    
                    previewHtml += `</div>`;
                    count++;
                }
                
                previewHtml += '</div>';
                preview.innerHTML = previewHtml;
                
            } catch (error) {
                alert('Invalid JSON file: ' + error.message);
                preview.innerHTML = '<em style="color: red;">Invalid JSON file</em>';
                input.value = '';
                window.tempLanguageData = null;
            }
        };
        
        reader.readAsText(file);
    }
};

window.saveLanguageFile = async function() {
    if (!window.tempLanguageData) {
        alert('Please upload a language file first');
        return;
    }
    
    try {
        // Save language data to CONFIG
        CONFIG.languageData = window.tempLanguageData;
        
        // Save to localStorage
        await saveToLocalStorage();
        
        // Clear temporary data
        window.tempLanguageData = null;
        
        showSuccess('Language file saved successfully! The translations are now available for use.');
        
    } catch (error) {
        console.error('Error saving language file:', error);
        alert('Error saving language file: ' + error.message);
    }
};

window.downloadLanguageTemplate = function() {
    const template = {
        "welcome": {
            "en": "Welcome",
            "km": "សូមស្វាគមន៍"
        },
        "products": {
            "en": "Products",
            "km": "ផលិតផល"
        },
        "promotions": {
            "en": "Promotions", 
            "km": "ការផ្តល់ជូន"
        },
        "events": {
            "en": "Events",
            "km": "ព្រឹត្តិការណ៍"
        },
        "posts": {
            "en": "Posts",
            "km": "ប្រកាស"
        },
        "contact": {
            "en": "Contact",
            "km": "ទំនាក់ទំនង"
        },
        "phone": {
            "en": "Phone",
            "km": "ទូរស័ព្ទ"
        },
        "email": {
            "en": "Email", 
            "km": "អ៊ីមែល"
        },
        "address": {
            "en": "Address",
            "km": "អាសយដ្ឋាន"
        },
        "price": {
            "en": "Price",
            "km": "តម្លៃ"
        },
        "description": {
            "en": "Description",
            "km": "ការពិពណ៌នា"
        },
        "view_more": {
            "en": "View More",
            "km": "មើលបន្ថែម"
        },
        "buy_now": {
            "en": "Buy Now",
            "km": "ទិញឥឡូវ"
        },
        "add_to_cart": {
            "en": "Add to Cart",
            "km": "បន្ថែមទៅកន្ត្រក"
        }
    };
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'language-template.json';
    link.click();
    
    showSuccess('Language template downloaded! Edit this file and upload it back.');
};

window.resetLanguageFile = async function() {
    if (confirm('Are you sure you want to reset the language file? This will remove all custom translations.')) {
        CONFIG.languageData = null;
        window.tempLanguageData = null;
        
        document.getElementById('languagePreview').innerHTML = '<em>No language file uploaded</em>';
        document.getElementById('languageFile').value = '';
        
        await saveToLocalStorage();
        showSuccess('Language file reset to default.');
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalForm').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Switch between URL and File upload tabs
window.switchUploadTab = function(btn, contentId) {
    const parent = btn.closest('.form-group') || btn.parentElement;
    parent.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    // Find all upload-content siblings
    let sibling = parent.nextElementSibling;
    while (sibling && sibling.classList.contains('upload-content')) {
        sibling.classList.remove('active');
        sibling = sibling.nextElementSibling;
    }
    
    document.getElementById(contentId)?.classList.add('active');
};

// Preview image from file input
window.previewImage = function(input, previewId) {
    const preview = document.getElementById(previewId);
    const hiddenInput = input.closest('.upload-content')?.parentElement?.querySelector('input[type="hidden"]');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width:100%;max-height:200px;border-radius:5px;">`;
            if (hiddenInput) hiddenInput.value = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

async function saveToLocalStorage() {
    try {
        console.log('💾 saveToLocalStorage called');
        console.log('CONFIG object:', CONFIG);
        
        const configString = JSON.stringify(CONFIG);
        console.log('📏 Config size:', (configString.length / 1024).toFixed(2), 'KB');
        
        // Always save to localStorage (primary storage)
        try {
            localStorage.setItem('websiteConfig', configString);
            console.log('✅ Config saved to localStorage successfully');
        } catch (storageError) {
            console.error('❌ localStorage error:', storageError);
            alert('Storage error: ' + storageError.message);
            return false;
        }
        
        // Also try enhanced storage if available
        if (window.enhancedStorage && window.enhancedStorage.saveConfig) {
            try {
                await window.enhancedStorage.saveConfig(CONFIG);
                console.log('✅ Config also saved to IndexedDB');
            } catch (e) {
                console.log('⚠️ IndexedDB save failed (not critical):', e.message);
            }
        }
        
        // Verify data was saved
        const saved = localStorage.getItem('websiteConfig');
        if (saved) {
            console.log('✅ Verification: Data confirmed in localStorage');
        } else {
            console.error('❌ Verification failed: Data not found in localStorage');
            return false;
        }
        
        // Trigger storage event for main website
        window.dispatchEvent(new StorageEvent('storage', { 
            key: 'websiteConfig', 
            newValue: configString
        }));
        console.log('✅ Storage event dispatched');
        
        // Also trigger custom banner update event for same-window updates
        window.dispatchEvent(new CustomEvent('bannerUpdate', { 
            detail: { banners: CONFIG.banners } 
        }));
        console.log('✅ Banner update event dispatched');
        
        // Trigger config update event for frontend
        window.dispatchEvent(new CustomEvent('configUpdate', { 
            detail: { config: CONFIG } 
        }));
        console.log('✅ Config update event dispatched');
        
        // Try to notify other windows/tabs
        try {
            if (window.opener && !window.opener.closed) {
                window.opener.dispatchEvent(new CustomEvent('bannerUpdate', { 
                    detail: { banners: CONFIG.banners } 
                }));
                window.opener.dispatchEvent(new CustomEvent('configUpdate', { 
                    detail: { config: CONFIG } 
                }));
                console.log('✅ Parent window notified');
            }
        } catch (e) {
            console.log('⚠️ Could not notify parent window:', e.message);
        }
        
        console.log('✅ All save operations completed successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Critical error in saveToLocalStorage:', error);
        alert('Error saving data: ' + error.message);
        return false;
    }
}

async function saveAndRefresh(message, refreshFn) {
    try {
        console.log('🔄 saveAndRefresh called with message:', message);
        console.log('📊 Current CONFIG before save:', JSON.stringify(CONFIG).substring(0, 200));
        
        const result = await saveToLocalStorage();
        
        if (!result) {
            console.error('❌ saveToLocalStorage returned false');
            alert('Failed to save data. Please check browser console.');
            return;
        }
        
        console.log('✅ Data saved successfully');
        console.log('📊 Current CONFIG after save:', JSON.stringify(CONFIG).substring(0, 200));
        
        closeModal();
        console.log('✅ Modal closed');
        
        // Force a small delay to ensure storage is written
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (refreshFn && typeof refreshFn === 'function') {
            console.log('🔄 Calling refresh function');
            refreshFn();
            console.log('✅ Refresh function completed');
        }
        
        showSuccess(message);
        console.log('✅ Success message shown');
        
    } catch (error) {
        console.error('❌ Error in saveAndRefresh:', error);
        alert('Error saving data: ' + error.message);
    }
}

function showSuccess(message) {
    const existing = document.querySelector('.success-message');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    document.querySelector('.main-content').insertBefore(div, document.querySelector('.main-content').firstChild);
    setTimeout(() => div.remove(), 3000);
}

function showError(message) {
    const existing = document.querySelector('.error-message');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    document.querySelector('.main-content').insertBefore(div, document.querySelector('.main-content').firstChild);
    setTimeout(() => div.remove(), 5000);
}

function logout() {
    if (confirm('Logout?')) {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminLoginTime');
        window.location.href = 'login.html';
    }
}
// Close modal on outside click
window.onclick = function(event) {
    if (event.target === document.getElementById('modal')) {
        closeModal();
    }
};

// ============================================
// SECTION MANAGEMENT
// ============================================

function loadSectionsTable() {
    loadDefaultSectionsTable();
    loadCustomSectionsTable();
    updateAdminNavigation(); // Add this line to update admin navigation
}

function loadDefaultSectionsTable() {
    const tbody = document.getElementById('defaultSectionsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const defaultSections = [
        { id: 'promotion', nameEn: 'PROMOTION', nameKm: 'ការផ្តល់ជូន' },
        { id: 'event', nameEn: 'EVENT', nameKm: 'ព្រឹត្តិការណ៍' },
        { id: 'products', nameEn: 'ALL PRODUCT', nameKm: 'ផលិតផលទាំងអស់' },
        { id: 'problem', nameEn: 'POST', nameKm: 'ប្រកាស' }
    ];
    
    // Sort by order
    const sortedSections = defaultSections.map(section => {
        const settings = CONFIG.sectionSettings[section.id] || { 
            enabled: true, 
            nameEn: section.nameEn, 
            nameKm: section.nameKm, 
            order: defaultSections.indexOf(section) + 1 
        };
        return { ...section, ...settings };
    }).sort((a, b) => a.order - b.order);
    
    sortedSections.forEach(section => {
        const row = document.createElement('tr');
        row.draggable = true;
        row.className = 'draggable-row';
        row.setAttribute('data-section-id', section.id);
        row.setAttribute('data-section-type', 'default');
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="drag-handle" style="cursor: grab; color: #999; font-size: 18px;">⋮⋮</span>
                    <strong>${section.id.toUpperCase()}</strong>
                </div>
            </td>
            <td>
                <input type="text" value="${section.nameEn}" id="section_${section.id}_nameEn" 
                       class="section-input" 
                       onchange="updateSectionName('${section.id}', 'nameEn', this.value)">
            </td>
            <td>
                <input type="text" value="${section.nameKm}" id="section_${section.id}_nameKm" 
                       class="section-input" 
                       onchange="updateSectionName('${section.id}', 'nameKm', this.value)">
            </td>
            <td>
                <span class="status-badge ${section.enabled ? 'status-enabled' : 'status-disabled'}">
                    ${section.enabled ? 'Enabled' : 'Disabled'}
                </span>
            </td>
            <td>
                <span class="order-display">${section.order}</span>
            </td>
            <td>
                <button class="btn-action btn-toggle" onclick="toggleSection('${section.id}')">
                    ${section.enabled ? 'Disable' : 'Enable'}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Initialize drag and drop
    initSectionDragAndDrop(tbody, 'default');
}

function loadCustomSectionsTable() {
    const tbody = document.getElementById('customSectionsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!CONFIG.customSections || CONFIG.customSections.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:40px;">No custom sections yet. Click "+ Add Custom Section" to create one.</td></tr>';
        return;
    }
    
    // Sort by order
    const sortedSections = [...CONFIG.customSections].sort((a, b) => a.order - b.order);
    
    sortedSections.forEach(section => {
        const row = document.createElement('tr');
        row.draggable = true;
        row.className = 'draggable-row';
        row.setAttribute('data-section-id', section.id);
        row.setAttribute('data-section-type', 'custom');
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="drag-handle" style="cursor: grab; color: #999; font-size: 18px;">⋮⋮</span>
                    ${section.id}
                </div>
            </td>
            <td>${section.nameEn}</td>
            <td>${section.nameKm}</td>
            <td><span class="template-badge">${section.template}</span></td>
            <td>
                <span class="status-badge ${section.enabled ? 'status-enabled' : 'status-disabled'}">
                    ${section.enabled ? 'Enabled' : 'Disabled'}
                </span>
            </td>
            <td><span class="order-display">${section.order}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editCustomSection(${section.id})">Edit</button>
                <button class="btn-action btn-toggle" onclick="toggleCustomSection(${section.id})">
                    ${section.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteCustomSection(${section.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Initialize drag and drop
    initSectionDragAndDrop(tbody, 'custom');
}

window.updateSectionName = async function(sectionId, field, value) {
    if (!CONFIG.sectionSettings[sectionId]) {
        CONFIG.sectionSettings[sectionId] = { enabled: true, nameEn: '', nameKm: '', order: 1 };
    }
    CONFIG.sectionSettings[sectionId][field] = value;
    await saveToLocalStorage();
    showSuccess('Section name updated!');
};

window.updateSectionOrder = async function(sectionId, order) {
    if (!CONFIG.sectionSettings[sectionId]) {
        CONFIG.sectionSettings[sectionId] = { enabled: true, nameEn: '', nameKm: '', order: 1 };
    }
    CONFIG.sectionSettings[sectionId].order = parseInt(order);
    await saveToLocalStorage();
    showSuccess('Section order updated!');
};

window.toggleSection = function(sectionId) {
    if (!CONFIG.sectionSettings[sectionId]) {
        CONFIG.sectionSettings[sectionId] = { enabled: true, nameEn: '', nameKm: '', order: 1 };
    }
    CONFIG.sectionSettings[sectionId].enabled = !CONFIG.sectionSettings[sectionId].enabled;
    saveAndRefresh('Section status updated!', loadSectionsTable);
};

window.addCustomSection = function() {
    showModal('Add Custom Section', `
        <div class="form-row">
            <div class="form-group">
                <label>Section Name (English)</label>
                <input type="text" id="customSectionNameEn" class="form-control" placeholder="e.g., GALLERY">
            </div>
            <div class="form-group">
                <label>Section Name (Khmer)</label>
                <input type="text" id="customSectionNameKm" class="form-control" placeholder="e.g., វិចិត្រសាល">
            </div>
        </div>
        <div class="form-group">
            <label>Template Type</label>
            <select id="customSectionTemplate" class="form-control">
                <option value="card">Card Grid (like Products/Promotions)</option>
                <option value="list">List View (like Posts)</option>
                <option value="banner">Banner Style (like Events)</option>
                <option value="custom">Custom HTML</option>
            </select>
        </div>
        <div class="form-group">
            <label>Display Order</label>
            <input type="number" id="customSectionOrder" class="form-control" value="5" min="1" max="20">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="customSectionDesc" class="form-control" rows="3" placeholder="Describe what this section will contain..."></textarea>
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="customSectionEnabled" checked> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCustomSection()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.saveCustomSection = function(id = null) {
    const nameEn = document.getElementById('customSectionNameEn').value?.trim() || '';
    const nameKm = document.getElementById('customSectionNameKm').value?.trim() || '';
    const template = document.getElementById('customSectionTemplate').value || 'card';
    const order = parseInt(document.getElementById('customSectionOrder').value) || 5;
    const description = document.getElementById('customSectionDesc').value?.trim() || '';
    const enabled = document.getElementById('customSectionEnabled').checked;
    
    // Validation
    if (!nameEn || !nameKm) {
        alert('Please provide both English and Khmer names');
        return;
    }
    
    if (nameEn.length < 2 || nameKm.length < 2) {
        alert('Section names must be at least 2 characters long');
        return;
    }
    
    try {
        if (!CONFIG.customSections) CONFIG.customSections = [];
        
        const sectionData = {
            nameEn,
            nameKm,
            template,
            order,
            description,
            enabled,
            items: [] // Will store the content items for this section
        };
        
        console.log('Saving custom section:', sectionData); // Debug log
        
        if (id) {
            const section = CONFIG.customSections.find(s => s.id === id);
            if (section) {
                // Keep existing items when updating
                sectionData.items = section.items || [];
                Object.assign(section, sectionData);
                console.log('Updated existing section:', section); // Debug log
            } else {
                alert('Section not found. Please refresh and try again.');
                return;
            }
        } else {
            const newId = CONFIG.customSections.length > 0 ? Math.max(...CONFIG.customSections.map(s => s.id)) + 1 : 1;
            const newSection = { id: newId, ...sectionData };
            CONFIG.customSections.push(newSection);
            console.log('Created new section:', newSection); // Debug log
        }
        
        console.log('All custom sections:', CONFIG.customSections); // Debug log
        
        saveAndRefresh('Custom section saved successfully!', () => {
            loadSectionsTable();
            updateAdminNavigation();
            // Force frontend to recreate sections with new template
            if (typeof refreshContent === 'function') {
                setTimeout(refreshContent, 200);
            }
        });
    } catch (error) {
        console.error('Error saving custom section:', error);
        alert('Error saving custom section: ' + error.message);
    }
};

window.editCustomSection = function(id) {
    const section = CONFIG.customSections.find(s => s.id === id);
    if (!section) return;
    
    showModal('Edit Custom Section', `
        <div class="form-row">
            <div class="form-group">
                <label>Section Name (English)</label>
                <input type="text" id="customSectionNameEn" class="form-control" value="${section.nameEn}">
            </div>
            <div class="form-group">
                <label>Section Name (Khmer)</label>
                <input type="text" id="customSectionNameKm" class="form-control" value="${section.nameKm}">
            </div>
        </div>
        <div class="form-group">
            <label>Template Type</label>
            <select id="customSectionTemplate" class="form-control">
                <option value="card" ${section.template === 'card' ? 'selected' : ''}>Card Grid (like Products/Promotions)</option>
                <option value="list" ${section.template === 'list' ? 'selected' : ''}>List View (like Posts)</option>
                <option value="banner" ${section.template === 'banner' ? 'selected' : ''}>Banner Style (like Events)</option>
                <option value="custom" ${section.template === 'custom' ? 'selected' : ''}>Custom HTML</option>
            </select>
        </div>
        <div class="form-group">
            <label>Display Order</label>
            <input type="number" id="customSectionOrder" class="form-control" value="${section.order}" min="1" max="20">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="customSectionDesc" class="form-control" rows="3">${section.description}</textarea>
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="customSectionEnabled" ${section.enabled ? 'checked' : ''}> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCustomSection(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.toggleCustomSection = function(id) {
    const section = CONFIG.customSections.find(s => s.id === id);
    if (section) {
        section.enabled = !section.enabled;
        saveAndRefresh('Custom section status updated!', loadSectionsTable);
    }
};

// Initialize drag and drop for section ordering
function initSectionDragAndDrop(tbody, sectionType) {
    let draggedRow = null;
    let draggedIndex = -1;
    
    tbody.querySelectorAll('.draggable-row').forEach((row, index) => {
        // Drag start
        row.addEventListener('dragstart', function(e) {
            draggedRow = this;
            draggedIndex = index;
            this.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.outerHTML);
        });
        
        // Drag end
        row.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
            // Remove all drag-over styles
            tbody.querySelectorAll('.draggable-row').forEach(r => {
                r.style.borderTop = '';
                r.style.borderBottom = '';
                r.classList.remove('drag-over');
            });
        });
        
        // Drag over
        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (this !== draggedRow) {
                const rect = this.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                if (e.clientY < midpoint) {
                    this.style.borderTop = '3px solid #3498db';
                    this.style.borderBottom = '';
                } else {
                    this.style.borderTop = '';
                    this.style.borderBottom = '3px solid #3498db';
                }
            }
        });
        
        // Drop
        row.addEventListener('drop', function(e) {
            e.preventDefault();
            
            if (this !== draggedRow) {
                const rect = this.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const dropIndex = Array.from(tbody.children).indexOf(this);
                
                if (e.clientY < midpoint) {
                    tbody.insertBefore(draggedRow, this);
                } else {
                    tbody.insertBefore(draggedRow, this.nextSibling);
                }
                
                // Update order in config
                updateSectionOrder(sectionType);
            }
            
            // Clean up styles
            this.style.borderTop = '';
            this.style.borderBottom = '';
        });
        
        // Drag leave
        row.addEventListener('dragleave', function(e) {
            this.style.borderTop = '';
            this.style.borderBottom = '';
        });
    });
}

// Update section order after drag and drop
async function updateSectionOrder(sectionType) {
    const tbody = sectionType === 'default' ? 
        document.getElementById('defaultSectionsTable') : 
        document.getElementById('customSectionsTable');
    
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('.draggable-row'));
    
    rows.forEach((row, index) => {
        const sectionId = row.getAttribute('data-section-id');
        const newOrder = index + 1;
        
        if (sectionType === 'default') {
            if (!CONFIG.sectionSettings[sectionId]) {
                CONFIG.sectionSettings[sectionId] = { enabled: true, nameEn: '', nameKm: '', order: 1 };
            }
            CONFIG.sectionSettings[sectionId].order = newOrder;
            
            // Update display
            const orderDisplay = row.querySelector('.order-display');
            if (orderDisplay) orderDisplay.textContent = newOrder;
        } else {
            const section = CONFIG.customSections.find(s => s.id == sectionId);
            if (section) {
                section.order = newOrder;
                
                // Update display
                const orderDisplay = row.querySelector('.order-display');
                if (orderDisplay) orderDisplay.textContent = newOrder;
            }
        }
    });
    
    // Save changes
    await saveToLocalStorage();
    
    // Update frontend navigation
    if (typeof refreshContent === 'function') {
        setTimeout(refreshContent, 100);
    }
    
    showSuccess('Section order updated!');
}

// Update admin navigation to include custom sections
function updateAdminNavigation() {
    const adminNav = document.querySelector('.admin-nav');
    if (!adminNav) return;
    
    // Remove existing custom section nav items
    adminNav.querySelectorAll('.nav-item[data-custom-section]').forEach(item => item.remove());
    
    // Remove existing custom section content
    document.querySelectorAll('.tab-content[data-custom-section]').forEach(content => content.remove());
    
    // Add custom sections to navigation
    if (CONFIG.customSections && CONFIG.customSections.length > 0) {
        const sectionsNavItem = adminNav.querySelector('[data-tab="sections"]');
        
        CONFIG.customSections.forEach(section => {
            // Create navigation item
            const navItem = document.createElement('button');
            navItem.className = 'nav-item';
            navItem.setAttribute('data-tab', `custom-${section.id}`);
            navItem.setAttribute('data-custom-section', 'true');
            navItem.innerHTML = `📋 ${section.nameEn}`;
            navItem.style.paddingLeft = '30px'; // Indent to show it's a sub-section
            navItem.style.fontSize = '14px';
            navItem.style.opacity = '0.9';
            
            // Insert after sections nav item
            sectionsNavItem.parentNode.insertBefore(navItem, sectionsNavItem.nextSibling);
            
            // Create content area
            createCustomSectionAdminContent(section);
        });
        
        // Re-initialize navigation
        initNavigation();
    }
}

// Create admin content area for custom sections
function createCustomSectionAdminContent(section) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const contentDiv = document.createElement('div');
    contentDiv.id = `custom-${section.id}`;
    contentDiv.className = 'tab-content';
    contentDiv.setAttribute('data-custom-section', 'true');
    
    contentDiv.innerHTML = `
        <div class="content-header">
            <button class="btn-primary" onclick="addCustomSectionItem(${section.id})">+ Add ${section.nameEn} Item</button>
            <div class="help-tip" style="margin-top: 15px;">
                <strong>💡 Tip:</strong> Manage content for your custom "${section.nameEn}" section. Template: ${section.template}
            </div>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Content</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="customSection${section.id}Table"></tbody>
            </table>
        </div>
    `;
    
    mainContent.appendChild(contentDiv);
    
    // Load existing items for this section
    loadCustomSectionItems(section.id);
}

// Load items for a custom section
function loadCustomSectionItems(sectionId) {
    const tbody = document.getElementById(`customSection${sectionId}Table`);
    if (!tbody) return;
    
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section || !section.items || section.items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:40px;">No items yet. Click "+ Add Item" to create content.</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    section.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.title || 'No title'}</td>
            <td>${(item.content || 'No content').substring(0, 50)}...</td>
            <td>
                <span class="status-badge ${item.enabled ? 'status-enabled' : 'status-disabled'}">
                    ${item.enabled ? 'Enabled' : 'Disabled'}
                </span>
            </td>
            <td>
                <button class="btn-action btn-edit" onclick="editCustomSectionItem(${sectionId}, ${item.id})">Edit</button>
                <button class="btn-action btn-toggle" onclick="toggleCustomSectionItem(${sectionId}, ${item.id})">
                    ${item.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteCustomSectionItem(${sectionId}, ${item.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add item to custom section
window.addCustomSectionItem = function(sectionId) {
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    showModal(`Add ${section.nameEn} Item`, `
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="customItemTitle" class="form-control" placeholder="Enter item title">
        </div>
        <div class="form-group">
            <label>Content</label>
            <textarea id="customItemContent" class="form-control" rows="4" placeholder="Enter item content"></textarea>
        </div>
        <div class="form-group">
            <label>Image URL (optional)</label>
            <input type="text" id="customItemImage" class="form-control" placeholder="https://example.com/image.jpg">
        </div>
        <div class="form-group">
            <label>Link URL (optional)</label>
            <input type="text" id="customItemLink" class="form-control" placeholder="https://example.com">
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="customItemEnabled" checked> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCustomSectionItem(${sectionId})">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

// Save custom section item
window.saveCustomSectionItem = function(sectionId, itemId = null) {
    const title = document.getElementById('customItemTitle').value || '';
    const content = document.getElementById('customItemContent').value || '';
    const image = document.getElementById('customItemImage').value || '';
    const link = document.getElementById('customItemLink').value || '';
    const enabled = document.getElementById('customItemEnabled').checked;
    
    if (!title && !content) {
        alert('Please provide at least a title or content');
        return;
    }
    
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    if (!section.items) section.items = [];
    
    const itemData = { title, content, image, link, enabled };
    
    if (itemId) {
        const item = section.items.find(i => i.id === itemId);
        if (item) {
            Object.assign(item, itemData);
        }
    } else {
        const newId = section.items.length > 0 ? Math.max(...section.items.map(i => i.id)) + 1 : 1;
        section.items.push({ id: newId, ...itemData });
    }
    
    saveAndRefresh('Item saved successfully!', () => loadCustomSectionItems(sectionId));
};

// Edit custom section item
window.editCustomSectionItem = function(sectionId, itemId) {
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    const item = section.items.find(i => i.id === itemId);
    if (!item) return;
    
    showModal(`Edit ${section.nameEn} Item`, `
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="customItemTitle" class="form-control" value="${item.title || ''}">
        </div>
        <div class="form-group">
            <label>Content</label>
            <textarea id="customItemContent" class="form-control" rows="4">${item.content || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Image URL (optional)</label>
            <input type="text" id="customItemImage" class="form-control" value="${item.image || ''}">
        </div>
        <div class="form-group">
            <label>Link URL (optional)</label>
            <input type="text" id="customItemLink" class="form-control" value="${item.link || ''}">
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="customItemEnabled" ${item.enabled ? 'checked' : ''}> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCustomSectionItem(${sectionId}, ${itemId})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

// Toggle custom section item
window.toggleCustomSectionItem = function(sectionId, itemId) {
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    const item = section.items.find(i => i.id === itemId);
    if (item) {
        item.enabled = !item.enabled;
        saveAndRefresh('Item status updated!', () => loadCustomSectionItems(sectionId));
    }
};

// Delete custom section item
window.deleteCustomSectionItem = function(sectionId, itemId) {
    if (confirm('Delete this item?')) {
        const section = CONFIG.customSections.find(s => s.id === sectionId);
        if (section) {
            section.items = section.items.filter(i => i.id !== itemId);
            saveAndRefresh('Item deleted!', () => loadCustomSectionItems(sectionId));
        }
    }
};

// Delete custom section (MISSING FUNCTION - ADDING IT)
window.deleteCustomSection = function(id) {
    if (confirm('Delete this custom section? This will also remove all its content and admin tab.')) {
        // Remove from CONFIG
        CONFIG.customSections = CONFIG.customSections.filter(s => s.id !== id);
        
        // Remove from frontend
        const frontendSection = document.querySelector(`#custom-${id}`);
        if (frontendSection) {
            frontendSection.remove();
        }
        
        // Remove admin tab and content
        const adminTab = document.querySelector(`[data-tab="custom-${id}"]`);
        if (adminTab) {
            adminTab.remove();
        }
        
        const adminContent = document.querySelector(`#custom-${id}`);
        if (adminContent) {
            adminContent.remove();
        }
        
        saveAndRefresh('Custom section deleted!', () => {
            loadSectionsTable();
            updateAdminNavigation();
            // Force frontend refresh
            if (typeof refreshContent === 'function') {
                setTimeout(refreshContent, 200);
            }
        });
    }
};

// ============================================
// DRAG AND DROP REORDERING
// ============================================

// Initialize drag and drop for all tables
function initDragAndDrop() {
    initTableDragDrop('productsTable', 'products');
    initTableDragDrop('promotionsTable', 'promotions');
    initTableDragDrop('eventsTable', 'events');
    initTableDragDrop('bannersTable', 'banners');
    initTableDragDrop('postsTable', 'posts');
}

// Generic drag and drop for any table
function initTableDragDrop(tableId, configKey) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    let draggedRow = null;
    let draggedIndex = null;
    
    // Add drag handle and make rows draggable
    Array.from(tbody.rows).forEach((row, index) => {
        // Skip empty state rows
        if (row.cells.length === 1) return;
        
        row.draggable = true;
        row.style.cursor = 'move';
        
        // Add drag handle icon to first cell
        const firstCell = row.cells[0];
        const dragHandle = document.createElement('span');
        dragHandle.innerHTML = '⋮⋮';
        dragHandle.style.cssText = 'cursor: move; margin-right: 8px; color: #999; font-weight: bold;';
        dragHandle.title = 'Drag to reorder';
        firstCell.insertBefore(dragHandle, firstCell.firstChild);
        
        // Drag events
        row.addEventListener('dragstart', function(e) {
            draggedRow = this;
            draggedIndex = Array.from(tbody.rows).indexOf(this);
            this.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        });
        
        row.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
            // Remove all drag-over styles
            Array.from(tbody.rows).forEach(r => {
                r.style.borderTop = '';
                r.style.borderBottom = '';
            });
        });
        
        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedRow === this) return;
            
            // Remove previous indicators
            Array.from(tbody.rows).forEach(r => {
                r.style.borderTop = '';
                r.style.borderBottom = '';
            });
            
            // Show drop indicator
            const rect = this.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                this.style.borderTop = '3px solid #ff6a00';
            } else {
                this.style.borderBottom = '3px solid #ff6a00';
            }
        });
        
        row.addEventListener('drop', function(e) {
            e.preventDefault();
            
            if (draggedRow === this) return;
            
            const dropIndex = Array.from(tbody.rows).indexOf(this);
            const rect = this.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const insertBefore = e.clientY < midpoint;
            
            // Reorder in CONFIG
            reorderItems(configKey, draggedIndex, dropIndex, insertBefore);
            
            // Remove drag indicators
            Array.from(tbody.rows).forEach(r => {
                r.style.borderTop = '';
                r.style.borderBottom = '';
            });
        });
        
        row.addEventListener('dragleave', function(e) {
            this.style.borderTop = '';
            this.style.borderBottom = '';
        });
    });
}

// Reorder items in CONFIG array
async function reorderItems(configKey, fromIndex, toIndex, insertBefore) {
    const items = CONFIG[configKey];
    if (!items || !Array.isArray(items)) return;
    
    // Remove item from old position
    const [movedItem] = items.splice(fromIndex, 1);
    
    // Calculate new position
    let newIndex = toIndex;
    if (fromIndex < toIndex && !insertBefore) {
        // Moving down and dropping after
        newIndex = toIndex;
    } else if (fromIndex < toIndex && insertBefore) {
        // Moving down and dropping before
        newIndex = toIndex - 1;
    } else if (fromIndex > toIndex && insertBefore) {
        // Moving up and dropping before
        newIndex = toIndex;
    } else if (fromIndex > toIndex && !insertBefore) {
        // Moving up and dropping after
        newIndex = toIndex + 1;
    }
    
    // Insert at new position
    items.splice(newIndex, 0, movedItem);
    
    // Save and refresh
    await saveToLocalStorage();
    
    // Reload the specific table
    switch(configKey) {
        case 'products':
            loadProductsTable();
            break;
        case 'promotions':
            loadPromotionsTable();
            break;
        case 'events':
            loadEventsTable();
            break;
        case 'banners':
            loadBannersTable();
            break;
        case 'posts':
            loadPostsTable();
            break;
    }
    
    showSuccess('Order updated! Changes saved.');
}

// Call initDragAndDrop after tables are loaded
const originalLoadAllTables = loadAllTables;
loadAllTables = function() {
    originalLoadAllTables();
    // Wait a bit for tables to render
    setTimeout(initDragAndDrop, 100);
};
// Language Flag Management Functions
function previewFlag(input, language) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a PNG, GIF, or JPG image file.');
        input.value = '';
        return;
    }
    
    // No file size limits on localhost - unlimited capacity for editing
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        displayFlagPreview(language, imageData);
        
        // Store in config
        if (!CONFIG.languageFlags) CONFIG.languageFlags = {};
        CONFIG.languageFlags[language] = imageData;
        
        // Show remove button
        const removeBtn = document.querySelector(`#${language}FlagFile`).parentElement.querySelector('.btn-remove');
        if (removeBtn) removeBtn.style.display = 'block';
        
        // Clear URL input
        document.getElementById(`${language}FlagUrl`).value = '';
        
        // Add success animation
        const card = input.closest('.flag-upload-card');
        card.classList.add('flag-upload-success');
        setTimeout(() => card.classList.remove('flag-upload-success'), 500);
    };
    reader.readAsDataURL(file);
}

function previewFlagUrl(input, language) {
    const url = input.value.trim();
    if (!url) return;
    
    // Validate URL format
    try {
        new URL(url);
    } catch {
        alert('Please enter a valid URL.');
        return;
    }
    
    // Test if image loads
    const img = new Image();
    img.onload = function() {
        displayFlagPreview(language, url);
        
        // Store in config
        if (!CONFIG.languageFlags) CONFIG.languageFlags = {};
        CONFIG.languageFlags[language] = url;
        
        // Show remove button
        const removeBtn = input.parentElement.querySelector('.btn-remove');
        if (removeBtn) removeBtn.style.display = 'block';
        
        // Clear file input
        document.getElementById(`${language}FlagFile`).value = '';
        
        // Add success animation
        const card = input.closest('.flag-upload-card');
        card.classList.add('flag-upload-success');
        setTimeout(() => card.classList.remove('flag-upload-success'), 500);
    };
    img.onerror = function() {
        alert('Unable to load image from this URL. Please check the URL and try again.');
        input.value = '';
    };
    img.src = url;
}

function displayFlagPreview(language, imageSrc) {
    const previewContainer = document.getElementById(`${language}FlagPreview`);
    previewContainer.innerHTML = `<img src="${imageSrc}" alt="${language.toUpperCase()} Flag">`;
    previewContainer.classList.add('has-image');
    
    // Update main preview
    updateLanguagePreview();
}

function removeFlag(language) {
    // Remove from config
    if (CONFIG.languageFlags && CONFIG.languageFlags[language]) {
        delete CONFIG.languageFlags[language];
    }
    
    // Reset preview
    const previewContainer = document.getElementById(`${language}FlagPreview`);
    const defaultEmoji = language === 'en' ? '🇺🇸' : '🇰🇭';
    previewContainer.innerHTML = `
        <div class="flag-placeholder">
            <span>${defaultEmoji}</span>
            <p>No custom flag uploaded</p>
        </div>
    `;
    previewContainer.classList.remove('has-image');
    
    // Clear inputs
    document.getElementById(`${language}FlagFile`).value = '';
    document.getElementById(`${language}FlagUrl`).value = '';
    
    // Hide remove button
    const removeBtn = document.querySelector(`#${language}FlagFile`).parentElement.querySelector('.btn-remove');
    if (removeBtn) removeBtn.style.display = 'none';
    
    // Update main preview
    updateLanguagePreview();
}

function updateLanguagePreview() {
    const previewFlagIcon = document.getElementById('previewFlagIcon');
    const previewLangText = document.getElementById('previewLangText');
    
    if (!previewFlagIcon || !previewLangText) return;
    
    // Get current language from preview (default to English)
    const currentLang = previewLangText.textContent === 'EN' ? 'en' : 'kh';
    
    if (CONFIG.languageFlags && CONFIG.languageFlags[currentLang]) {
        // Use custom flag image with proper inline styling
        previewFlagIcon.innerHTML = `<img src="${CONFIG.languageFlags[currentLang]}" style="width: 24px; height: 18px; object-fit: cover; border-radius: 3px; display: inline-block; vertical-align: middle;">`;
    } else {
        // Use default emoji with proper inline styling
        previewFlagIcon.innerHTML = `<span style="font-size: 18px; display: inline-block; vertical-align: middle;">${currentLang === 'en' ? '🇺🇸' : '🇰🇭'}</span>`;
    }
}

async function saveLanguageFlags() {
    try {
        // Get default language setting
        const defaultLanguage = document.querySelector('input[name="defaultLanguage"]:checked')?.value || 'en';
        
        // Save default language to config
        CONFIG.defaultLanguage = defaultLanguage;
        
        // Save using the safe storage function
        await saveToLocalStorage();
        
        // Show success message
        showNotification(`Language settings saved! Default language: ${defaultLanguage === 'en' ? 'English' : 'Khmer'} 🎉`, 'success');
        
    } catch (error) {
        console.error('Error saving language flags:', error);
        showNotification('Error saving language flags. Please try again.', 'error');
    }
}

function resetToDefaultFlags() {
    if (confirm('Are you sure you want to reset to default emoji flags? This will remove all custom flag images.')) {
        // Remove language flags from config
        if (CONFIG.languageFlags) {
            delete CONFIG.languageFlags;
        }
        
        // Reset all previews
        removeFlag('en');
        removeFlag('kh');
        
        // Save config
        saveLanguageFlags();
        
        showNotification('Reset to default emoji flags successfully! 🔄', 'success');
    }
}

function testLanguageToggle() {
    const previewToggle = document.getElementById('previewLangToggle');
    const previewLangText = document.getElementById('previewLangText');
    
    if (!previewToggle || !previewLangText) return;
    
    // Toggle language in preview
    const currentLang = previewLangText.textContent === 'EN' ? 'kh' : 'en';
    previewLangText.textContent = currentLang === 'en' ? 'EN' : 'ខ្មែរ';
    
    // Update flag icon
    updateLanguagePreview();
    
    // Add animation
    previewToggle.style.transform = 'scale(1.1)';
    setTimeout(() => {
        previewToggle.style.transform = 'scale(1)';
    }, 200);
    
    showNotification(`Switched to ${currentLang === 'en' ? 'English' : 'Khmer'} preview! 🌍`, 'info');
}

function loadLanguageFlags() {
    // Load default language setting
    const defaultLanguage = CONFIG.defaultLanguage || 'en';
    const defaultRadio = document.querySelector(`input[name="defaultLanguage"][value="${defaultLanguage}"]`);
    if (defaultRadio) {
        defaultRadio.checked = true;
    }
    
    // Load flag images
    if (!CONFIG.languageFlags) return;
    
    // Load English flag
    if (CONFIG.languageFlags.en) {
        displayFlagPreview('en', CONFIG.languageFlags.en);
        const removeBtn = document.querySelector(`#enFlagFile`).parentElement.querySelector('.btn-remove');
        if (removeBtn) removeBtn.style.display = 'block';
    }
    
    // Load Khmer flag
    if (CONFIG.languageFlags.kh) {
        displayFlagPreview('kh', CONFIG.languageFlags.kh);
        const removeBtn = document.querySelector(`#khFlagFile`).parentElement.querySelector('.btn-remove');
        if (removeBtn) removeBtn.style.display = 'block';
    }
}

// Notification system for language settings
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.language-notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `language-notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        font-weight: 500;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
if (!document.getElementById('language-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'language-notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
// ============================================
// DATA SAVE & EXPORT SYSTEM
// ============================================

// Load data statistics
function loadDataStats() {
    document.getElementById('productsCount').textContent = CONFIG.products ? CONFIG.products.length : 0;
    document.getElementById('postsCount').textContent = CONFIG.posts ? CONFIG.posts.length : 0;
    document.getElementById('promotionsCount').textContent = CONFIG.promotions ? CONFIG.promotions.length : 0;
    document.getElementById('bannersCount').textContent = CONFIG.banners ? CONFIG.banners.length : 0;
    document.getElementById('eventsCount').textContent = CONFIG.events ? CONFIG.events.length : 0;
    document.getElementById('categoriesCount').textContent = CONFIG.categories ? CONFIG.categories.length : 0;
}

// Generate config.js code for GitHub
function generateConfigCode() {
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '📄 Generating...';
    button.disabled = true;
    
    try {
        // Check if user imported from GitHub recently
        const lastImport = localStorage.getItem('lastImportTime');
        const lastImportDate = lastImport ? new Date(lastImport) : null;
        const hoursSinceImport = lastImportDate ? (Date.now() - lastImportDate.getTime()) / (1000 * 60 * 60) : 999;
        
        // Warn if no recent import (data might be lost)
        if (hoursSinceImport > 24) {
            const shouldContinue = confirm(
                '⚠️ WARNING: Data Loss Prevention\n\n' +
                'You haven\'t imported from GitHub in the last 24 hours!\n\n' +
                '📋 To prevent losing old data:\n' +
                '1. Click "Cancel"\n' +
                '2. Go to GitHub and copy your config.js code\n' +
                '3. Click "Import from GitHub" and paste the code\n' +
                '4. Then come back and click "Generate" again\n\n' +
                'This ensures your new changes are MERGED with old data.\n\n' +
                'Click "OK" only if you\'re sure you want to generate without importing (old data may be lost).'
            );
            
            if (!shouldContinue) {
                button.textContent = originalText;
                button.disabled = false;
                
                // Highlight the import button
                const importSection = document.querySelector('.import-section');
                if (importSection) {
                    importSection.style.animation = 'pulse 1s ease-in-out 3';
                    importSection.style.border = '3px solid #ff6a00';
                    setTimeout(() => {
                        importSection.style.animation = '';
                        importSection.style.border = '2px solid #0066cc';
                    }, 3000);
                }
                
                return;
            }
        }
        
        // Create complete config object with all current data
        const exportConfig = {
            // Selected theme (always Alibaba)
            selectedTheme: 'alibaba',
            
            // Admin credentials
            admin: CONFIG.admin,
            
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
            
            // All current data
            banners: CONFIG.banners || [],
            promotions: CONFIG.promotions || [],
            events: CONFIG.events || [],
            posts: CONFIG.posts || [],
            categories: CONFIG.categories || [{ id: 'all', name: 'All', nameKm: 'ទាំងអស់' }],
            products: CONFIG.products || [],
            
            // Contact info
            contact: CONFIG.contact || {
                phone: '',
                email: '',
                address: '',
                whatsapp: '',
                telegram: '',
                facebook: '',
                messenger: ''
            },
            
            // Logo
            logo: CONFIG.logo || '',
            
            // Navigation style settings
            navigationStyle: CONFIG.navigationStyle || 'solid',
            customNavColors: CONFIG.customNavColors || {
                background: '#2c3e50',
                text: '#ffffff',
                activeButton: '#e74c3c'
            },
            
            // Post banner settings
            problemSolveBanner: CONFIG.problemSolveBanner || {
                enabled: false,
                image: '',
                link: '',
                titleEn: 'Latest Posts',
                titleKm: 'ប្រកាសថ្មីៗ',
                descriptionEn: 'Check out our latest updates!',
                descriptionKm: 'មើលការអាប់ដេតថ្មីៗរបស់យើង!'
            },
            
            // Post section link
            problemSolveLink: CONFIG.problemSolveLink || '',
            
            // Dynamic menu items
            menuItems: CONFIG.menuItems || [
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
            
            // Language settings
            language: CONFIG.language || "en",
            languageFlags: CONFIG.languageFlags || {},
            
            // Section settings
            sectionSettings: CONFIG.sectionSettings || {
                promotion: { enabled: true, nameEn: 'PROMOTION', nameKm: 'ការផ្តល់ជូន', order: 1 },
                event: { enabled: true, nameEn: 'EVENT', nameKm: 'ព្រឹត្តិការណ៍', order: 2 },
                products: { enabled: true, nameEn: 'ALL PRODUCT', nameKm: 'ផលិតផលទាំងអស់', order: 3 },
                problem: { enabled: true, nameEn: 'POST', nameKm: 'ប្រកាស', order: 4 }
            },
            
            // Custom sections
            customSections: CONFIG.customSections || []
        };
        
        // Show data summary
        const dataSummary = `
📊 Data Summary (will be exported):
• Banners: ${exportConfig.banners.length}
• Promotions: ${exportConfig.promotions.length}
• Events: ${exportConfig.events.length}
• Posts: ${exportConfig.posts.length}
• Products: ${exportConfig.products.length}
• Categories: ${exportConfig.categories.length}

${lastImportDate ? '✅ Last imported: ' + lastImportDate.toLocaleString() : '⚠️ Never imported from GitHub'}
        `;
        console.log(dataSummary);
        
        // Generate the complete config.js file content with proper formatting
        // Use single-line format like your working job portal project
        const currentDate = new Date().toLocaleString();
        const configJSON = JSON.stringify(exportConfig);
        
        const configCode = [
            '// Configuration file - Production Ready',
            '// All data is managed via Admin Panel and stored in localStorage',
            '// Last updated: ' + currentDate,
            lastImportDate ? '// Last imported from GitHub: ' + lastImportDate.toLocaleString() : '// ⚠️ Never imported from GitHub - make sure this includes all your data!',
            'const CONFIG = ' + configJSON + ';',
            '',
            '// Initialize menu items and language if not present in localStorage',
            '(function initializeMenuConfig() {',
            '  const savedConfig = localStorage.getItem(\'websiteConfig\');',
            '  if (savedConfig) {',
            '    try {',
            '      const parsed = JSON.parse(savedConfig);',
            '      if (!parsed.menuItems || !Array.isArray(parsed.menuItems)) {',
            '        parsed.menuItems = CONFIG.menuItems;',
            '      }',
            '      if (!parsed.language) {',
            '        parsed.language = "en";',
            '      }',
            '      localStorage.setItem(\'websiteConfig\', JSON.stringify(parsed));',
            '    } catch (error) {',
            '      console.error(\'Error initializing menu config:\', error);',
            '    }',
            '  }',
            '})();'
        ].join('\n');
        
        // Display the generated code
        document.getElementById('generatedCode').value = configCode;
        document.getElementById('codeOutputSection').style.display = 'block';
        
        // Scroll to code section
        document.getElementById('codeOutputSection').scrollIntoView({ behavior: 'smooth' });
        
        showSuccess('✅ Config code generated! Data summary logged to console.');
        
    } catch (error) {
        showError('Failed to generate config code: ' + error.message);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Generate complete export with all files
function generateFullExport() {
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '📦 Generating...';
    button.disabled = true;
    
    try {
        // Generate config.js first
        generateConfigCode();
        
        // Add additional export information with GitHub workflow
        const exportInfo = `/*
=================================================================
  COMPLETE WEBSITE EXPORT - READY FOR GITHUB
=================================================================
Generated: ${new Date().toLocaleString()}

📊 DATA SUMMARY:
  • Products: ${CONFIG.products ? CONFIG.products.length : 0}
  • Posts: ${CONFIG.posts ? CONFIG.posts.length : 0}
  • Promotions: ${CONFIG.promotions ? CONFIG.promotions.length : 0}
  • Banners: ${CONFIG.banners ? CONFIG.banners.length : 0}
  • Events: ${CONFIG.events ? CONFIG.events.length : 0}
  • Categories: ${CONFIG.categories ? CONFIG.categories.length : 0}

📝 GITHUB UPDATE INSTRUCTIONS:
  1. Go to your GitHub repository
  2. Open config.js file
  3. Click "Edit" (pencil icon)
  4. SELECT ALL old code (Ctrl+A / Cmd+A)
  5. DELETE old code
  6. COPY code below (starting from "// Configuration file")
  7. PASTE into GitHub editor
  8. Scroll down and click "Commit changes"
  9. Add commit message: "Update website data - ${new Date().toLocaleDateString()}"
  10. Click "Commit changes" button
  11. Wait 1-2 minutes for changes to go live

⚠️ IMPORTANT:
  • This code is properly formatted for GitHub
  • Do NOT edit the code after copying
  • Make sure to copy EVERYTHING below this comment block
  • Your old data will be replaced with new data
  • All visitors will see updates after GitHub commit

💾 BACKUP REMINDER:
  Before updating GitHub, you can download a backup using
  the "Download Backup" button above.

=================================================================
*/

`;
        
        const currentCode = document.getElementById('generatedCode').value;
        document.getElementById('generatedCode').value = exportInfo + currentCode;
        
        showSuccess('Complete export generated! This includes all your data and settings.');
        
    } catch (error) {
        showError('Failed to generate complete export: ' + error.message);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Preview changes before export
function previewChanges() {
    const changes = [];
    
    if (CONFIG.products && CONFIG.products.length > 0) {
        changes.push(`✅ ${CONFIG.products.length} Products will be exported`);
    }
    if (CONFIG.posts && CONFIG.posts.length > 0) {
        changes.push(`✅ ${CONFIG.posts.length} Posts will be exported`);
    }
    if (CONFIG.promotions && CONFIG.promotions.length > 0) {
        changes.push(`✅ ${CONFIG.promotions.length} Promotions will be exported`);
    }
    if (CONFIG.banners && CONFIG.banners.length > 0) {
        changes.push(`✅ ${CONFIG.banners.length} Banners will be exported`);
    }
    if (CONFIG.events && CONFIG.events.length > 0) {
        changes.push(`✅ ${CONFIG.events.length} Events will be exported`);
    }
    if (CONFIG.categories && CONFIG.categories.length > 0) {
        changes.push(`✅ ${CONFIG.categories.length} Categories will be exported`);
    }
    if (CONFIG.contact && (CONFIG.contact.phone || CONFIG.contact.email)) {
        changes.push(`✅ Contact information will be exported`);
    }
    if (CONFIG.logo) {
        changes.push(`✅ Logo settings will be exported`);
    }
    if (CONFIG.languageFlags && Object.keys(CONFIG.languageFlags).length > 0) {
        changes.push(`✅ Custom language flags will be exported`);
    }
    
    if (changes.length === 0) {
        changes.push('⚠️ No data to export. Add some content first.');
    }
    
    const previewText = changes.join('\n');
    alert(`Preview of changes to be exported:\n\n${previewText}\n\nClick "Generate config.js Code" to create the export.`);
}

// Download backup file
function downloadBackup() {
    try {
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            config: CONFIG
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `website-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showSuccess('Backup downloaded successfully!');
        
    } catch (error) {
        showError('Failed to download backup: ' + error.message);
    }
}

// Copy generated code to clipboard
function copyCodeToClipboard() {
    const codeTextarea = document.getElementById('generatedCode');
    
    try {
        codeTextarea.select();
        codeTextarea.setSelectionRange(0, 99999); // For mobile devices
        
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(codeTextarea.value).then(() => {
                const button = event.target;
                const originalText = button.textContent;
                button.textContent = '✅ Copied!';
                button.style.background = '#28a745';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                }, 3000);
                
                showSuccess('✅ Code copied! Now go to GitHub and paste it into config.js file.');
            }).catch(err => {
                // Fallback to execCommand
                fallbackCopy();
            });
        } else {
            // Fallback for older browsers
            fallbackCopy();
        }
        
    } catch (error) {
        showError('Failed to copy. Please select all text and copy manually (Ctrl+A, Ctrl+C).');
    }
    
    function fallbackCopy() {
        try {
            document.execCommand('copy');
            
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = '✅ Copied!';
            button.style.background = '#28a745';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 3000);
            
            showSuccess('✅ Code copied! Now go to GitHub and paste it into config.js file.');
        } catch (err) {
            showError('Please select all text manually and copy (Ctrl+A, Ctrl+C).');
        }
    }
}

// Download config.js file
function downloadConfigFile() {
    const codeTextarea = document.getElementById('generatedCode');
    const code = codeTextarea.value;
    
    if (!code) {
        showError('Please generate the code first!');
        return;
    }
    
    try {
        // Create a blob with the code
        const blob = new Blob([code], { type: 'text/javascript' });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.js';
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Update button
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✅ Downloaded!';
        
        setTimeout(() => {
            button.textContent = originalText;
        }, 3000);
        
        showSuccess('✅ config.js downloaded! Now go to GitHub: Delete old config.js → Upload new file → Commit changes.');
        
    } catch (error) {
        showError('Failed to download file: ' + error.message);
    }
}

// Initialize data save when tab is shown
function initDataSave() {
    loadDataStats();
    updateLastImportInfo();
}

// Show import modal
function showImportModal() {
    document.getElementById('importModal').style.display = 'block';
    document.getElementById('importCodeInput').value = '';
    // Reset file input
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) fileInput.value = '';
    document.getElementById('fileNameDisplay').textContent = 'No file selected';
    document.getElementById('filePreview').style.display = 'none';
    // Reset to paste method
    switchImportMethod('paste');
}

// Switch between paste and upload methods
function switchImportMethod(method) {
    const pasteTab = document.getElementById('pasteMethodTab');
    const uploadTab = document.getElementById('uploadMethodTab');
    const pasteMethod = document.getElementById('pasteMethod');
    const uploadMethod = document.getElementById('uploadMethod');
    
    if (method === 'paste') {
        pasteTab.style.background = '#007bff';
        pasteTab.style.color = 'white';
        uploadTab.style.background = '#e9ecef';
        uploadTab.style.color = '#333';
        pasteMethod.style.display = 'block';
        uploadMethod.style.display = 'none';
    } else {
        uploadTab.style.background = '#007bff';
        uploadTab.style.color = 'white';
        pasteTab.style.background = '#e9ecef';
        pasteTab.style.color = '#333';
        uploadMethod.style.display = 'block';
        pasteMethod.style.display = 'none';
    }
}

// Handle file upload - Read as text and parse
function handleFileUpload(input) {
    const file = input.files[0];
    
    if (!file) {
        document.getElementById('fileNameDisplay').textContent = 'No file selected';
        document.getElementById('filePreview').style.display = 'none';
        return;
    }
    
    // Validate file type
    if (!file.name.endsWith('.js')) {
        alert('❌ Please select a .js file (config.js)');
        input.value = '';
        document.getElementById('fileNameDisplay').textContent = 'No file selected';
        return;
    }
    
    // Show file info
    const fileSizeKB = (file.size / 1024).toFixed(2);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    const sizeDisplay = file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`;
    
    document.getElementById('fileNameDisplay').textContent = `Selected: ${file.name}`;
    document.getElementById('loadedFileName').textContent = file.name;
    document.getElementById('loadedFileSize').textContent = sizeDisplay;
    document.getElementById('filePreview').style.display = 'block';
    
    // Read file as text (same as paste method)
    const reader = new FileReader();
    reader.onload = function(e) {
        const fileContent = e.target.result;
        
        console.log('✅ File loaded:', file.name, sizeDisplay);
        console.log('📝 File starts with:', fileContent.substring(0, 100));
        
        // Check if it's HTML (wrong download)
        if (fileContent.trim().startsWith('<!DOCTYPE') || fileContent.trim().startsWith('<html')) {
            alert('❌ This looks like an HTML file, not config.js!\n\n' +
                  'Please download the RAW file from GitHub:\n' +
                  '1. Click "Raw" button on GitHub\n' +
                  '2. Right-click → Save As → config.js\n' +
                  '3. Or copy the raw code and use "Paste Code" method');
            input.value = '';
            document.getElementById('fileNameDisplay').textContent = 'No file selected';
            document.getElementById('filePreview').style.display = 'none';
            return;
        }
        
        // Store in textarea (will be parsed by import function)
        document.getElementById('importCodeInput').value = fileContent;
        console.log('✅ File content loaded, ready to import');
    };
    
    reader.onerror = function() {
        alert('❌ Failed to read file. Please try again.');
        input.value = '';
        document.getElementById('fileNameDisplay').textContent = 'No file selected';
        document.getElementById('filePreview').style.display = 'none';
    };
    reader.readAsText(file);
}

// Close import modal
function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
}

// Show import instructions
function showImportInstructions() {
    alert(`📖 How to Import from GitHub:

1. Open your GitHub repository in a new tab
2. Navigate to config.js file
3. Click the "Raw" button (top right of file view)
4. Select ALL code (Ctrl+A or Cmd+A)
5. Copy the code (Ctrl+C or Cmd+C)
6. Come back here and click "Import from GitHub"
7. Paste the code in the text box
8. Click "Import Data"

✅ This will load your latest GitHub data into localStorage
✅ You can then safely make changes without losing previous data
✅ After editing, export back to GitHub`);
}

// Import data from GitHub - Handles both paste and file upload
function importGitHubData() {
    console.log('🔧 importGitHubData called');
    
    const importCode = document.getElementById('importCodeInput').value.trim();
    console.log('📝 Import code length:', importCode.length);
    
    if (!importCode) {
        console.log('❌ No code provided');
        alert('Please paste your GitHub config.js code or upload the config.js file first!');
        return;
    }
    
    // Show loading
    const importBtn = document.querySelector('#importModal .btn-primary');
    const originalText = importBtn ? importBtn.textContent : '';
    console.log('🔘 Button found:', !!importBtn);
    
    if (importBtn) {
        importBtn.textContent = '⏳ Importing...';
        importBtn.disabled = true;
    }
    
    // Use setTimeout to allow UI to update
    setTimeout(function() {
        try {
            console.log('🧹 Cleaning code...');
            // Remove comments and clean up the code
            let cleanCode = importCode
                .replace(/^\/\/.*$/gm, '') // Remove single-line comments
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
                .trim();
            
            console.log('🔍 Searching for CONFIG object...');
            console.log('📝 First 200 chars:', cleanCode.substring(0, 200));
            
            // Try multiple patterns to find CONFIG object
            let configMatch = null;
            let configJSON = null;
            
            // Pattern 1: Standard format with semicolon
            configMatch = cleanCode.match(/const\s+CONFIG\s*=\s*(\{[\s\S]*?\});/);
            
            // Pattern 2: Without semicolon at end
            if (!configMatch) {
                configMatch = cleanCode.match(/const\s+CONFIG\s*=\s*(\{[\s\S]*?\})\s*(?:;|$)/);
            }
            
            // Pattern 3: Try to find just the object between const CONFIG = and the end
            if (!configMatch) {
                const startMatch = cleanCode.match(/const\s+CONFIG\s*=\s*(\{)/);
                if (startMatch) {
                    const startIndex = cleanCode.indexOf('{', startMatch.index);
                    // Find matching closing brace
                    let braceCount = 0;
                    let endIndex = -1;
                    for (let i = startIndex; i < cleanCode.length; i++) {
                        if (cleanCode[i] === '{') braceCount++;
                        if (cleanCode[i] === '}') {
                            braceCount--;
                            if (braceCount === 0) {
                                endIndex = i;
                                break;
                            }
                        }
                    }
                    if (endIndex > startIndex) {
                        configJSON = cleanCode.substring(startIndex, endIndex + 1);
                        console.log('✅ Found CONFIG using brace matching');
                    }
                }
            } else {
                configJSON = configMatch[1];
                console.log('✅ Found CONFIG using regex pattern');
            }
            
            if (!configJSON) {
                console.log('❌ CONFIG object not found');
                console.log('📝 Code preview:', cleanCode.substring(0, 500));
                if (importBtn) {
                    importBtn.textContent = originalText;
                    importBtn.disabled = false;
                }
                alert('Could not find CONFIG object in the code. Make sure you uploaded the correct config.js file.\n\nThe file should start with: const CONFIG = {');
                return;
            }
            
            console.log('✅ CONFIG object found');
            console.log('📦 Parsing JSON...');
            console.log('📝 JSON length:', configJSON.length);
            
            // Parse the JSON (works for both formatted and minified)
            const importedConfig = JSON.parse(configJSON);
            
            console.log('✅ JSON parsed successfully');
            
            // Validate the imported config
            if (!importedConfig || typeof importedConfig !== 'object') {
                console.log('❌ Invalid config format');
                if (importBtn) {
                    importBtn.textContent = originalText;
                    importBtn.disabled = false;
                }
                alert('Invalid config format. Please check the code and try again.');
                return;
            }
            
            // Import the config object
            importConfigObject(importedConfig);
            
        } catch (error) {
            console.error('❌ Import error:', error);
            console.error('Error stack:', error.stack);
            
            // Re-enable button
            if (importBtn) {
                importBtn.textContent = originalText;
                importBtn.disabled = false;
            }
            
            alert('❌ Import failed!\n\nError: ' + error.message + '\n\nPlease check:\n1. You copied the ENTIRE config.js file\n2. The code is valid JavaScript\n3. Browser console (F12) for more details');
        }
    }, 100);
}

// Shared function to import CONFIG object (used by both paste and file upload)
function importConfigObject(importedConfig) {
    const importBtn = document.querySelector('#importModal .btn-primary');
    const originalText = importBtn ? importBtn.textContent : '';
    
    if (importBtn) {
        importBtn.textContent = '⏳ Importing...';
        importBtn.disabled = true;
    }
    
    setTimeout(function() {
        try {
            console.log('📥 Importing data from GitHub...');
            console.log('📊 Imported data:', {
                banners: importedConfig.banners?.length || 0,
                promotions: importedConfig.promotions?.length || 0,
                events: importedConfig.events?.length || 0,
                posts: importedConfig.posts?.length || 0,
                products: importedConfig.products?.length || 0
            });
            
            // Merge with current CONFIG to preserve any new fields
            console.log('🔄 Merging with current CONFIG...');
            Object.assign(CONFIG, importedConfig);
            
            // Save to storage
            console.log('💾 Saving to storage...');
            
            // Try IndexedDB first, then localStorage
            if (window.enhancedStorage && !window.enhancedStorage.fallbackToLocalStorage) {
                window.enhancedStorage.saveConfig(CONFIG).then(function() {
                    console.log('✅ Saved to IndexedDB');
                    finishImport();
                }).catch(function(error) {
                    console.log('⚠️ IndexedDB failed, using localStorage');
                    saveToLocalStorageAndFinish();
                });
            } else {
                saveToLocalStorageAndFinish();
            }
            
            function saveToLocalStorageAndFinish() {
                localStorage.setItem('websiteConfig', JSON.stringify(CONFIG));
                console.log('✅ Saved to localStorage');
                finishImport();
            }
            
            function finishImport() {
                // Update last import timestamp
                localStorage.setItem('lastImportTime', new Date().toISOString());
                console.log('✅ Import timestamp saved');
                
                // Clear uploaded config
                window.uploadedConfig = null;
                
                // Close modal
                console.log('🚪 Closing modal...');
                closeImportModal();
                
                // Show success and reload
                console.log('✅ Import successful! Reloading...');
                alert('✅ Data imported successfully! Page will reload...');
                
                setTimeout(function() {
                    location.reload();
                }, 1000);
            }
            
        } catch (error) {
            console.error('❌ Import error:', error);
            
            if (importBtn) {
                importBtn.textContent = originalText;
                importBtn.disabled = false;
            }
            
            alert('❌ Import failed: ' + error.message);
        }
    }, 100);
}

// Make sure function is globally available
window.importGitHubData = importGitHubData;

// Update last import info
function updateLastImportInfo() {
    const lastImport = localStorage.getItem('lastImportTime');
    const infoDiv = document.getElementById('lastImportInfo');
    
    if (lastImport && infoDiv) {
        const importDate = new Date(lastImport);
        const now = new Date();
        const hoursDiff = Math.floor((now - importDate) / (1000 * 60 * 60));
        
        let timeText = '';
        if (hoursDiff < 1) {
            timeText = 'just now';
        } else if (hoursDiff < 24) {
            timeText = `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`;
        } else {
            const daysDiff = Math.floor(hoursDiff / 24);
            timeText = `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`;
        }
        
        infoDiv.innerHTML = `✅ Last imported from GitHub: ${importDate.toLocaleString()} (${timeText})`;
        infoDiv.style.color = hoursDiff > 24 ? '#ff6a00' : '#28a745';
        
        if (hoursDiff > 24) {
            infoDiv.innerHTML += '<br><strong style="color: #ff6a00;">⚠️ It\'s been more than a day. Consider importing again to get latest data!</strong>';
        }
    } else if (infoDiv) {
        infoDiv.innerHTML = '⚠️ No import history. Please import from GitHub first to avoid data loss!';
        infoDiv.style.color = '#ff6a00';
    }
}

// Initialize data save when tab is shown
function initDataSave() {
    loadDataStats();
    updateLastImportInfo();
}

// Update showTab function to include datasave
const originalShowTab = showTab;
showTab = function(tabName) {
    originalShowTab(tabName);
    
    if (tabName === 'datasave') {
        initDataSave();
    }
};


// ============================================
// BUTTON CUSTOMIZATION FUNCTIONS
// ============================================

// Initialize button customization UI
function initButtonCustomization() {
    const grid = document.getElementById('buttonCustomizationGrid');
    if (!grid) return;
    
    const channels = ['phone', 'whatsapp', 'telegram', 'facebook', 'messenger'];
    const channelLabels = {
        phone: '📞 Phone',
        whatsapp: '💬 WhatsApp',
        telegram: '✈️ Telegram',
        facebook: '👍 Facebook',
        messenger: '💬 Messenger'
    };
    
    const channelColors = {
        phone: '#28a745',
        whatsapp: '#25D366',
        telegram: '#0088cc',
        facebook: '#1877f2',
        messenger: '#0084ff'
    };
    
    let html = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <h3 style="margin: 0 0 15px 0; font-size: 24px;">🎨 Button Icon Customization</h3>
            <p style="margin: 0; opacity: 0.95; line-height: 1.6;">
                Customize your contact buttons with TWO icons: Left icon (main) and Right icon (cart/action). Upload images, GIFs, or use emojis!
            </p>
            <div style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.15); border-radius: 10px; backdrop-filter: blur(10px);">
                <strong>✨ Three Ways to Customize Each Icon:</strong><br>
                1️⃣ <strong>Upload Image/GIF:</strong> Click "Choose File" to upload your custom icon (JPG, PNG, GIF)<br>
                2️⃣ <strong>Paste URL:</strong> Enter a direct link to an image or GIF hosted online<br>
                3️⃣ <strong>Use Emoji:</strong> Simply paste any emoji (📞 💬 🛒 ✈️ 🎁 etc.)
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
    `;
    
    channels.forEach(channel => {
        const config = CONFIG.buttonIcons?.[channel] || { icon: channelLabels[channel].split(' ')[0], cartIcon: '🛒' };
        const color = channelColors[channel];
        
        html += `
            <div style="border: 3px solid ${color}; border-radius: 15px; padding: 25px; background: linear-gradient(135deg, ${color}15 0%, ${color}05 100%); box-shadow: 0 8px 20px rgba(0,0,0,0.1); transition: all 0.3s;">
                <h4 style="margin: 0 0 20px 0; color: ${color}; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 32px;">${channelLabels[channel].split(' ')[0]}</span>
                    ${channelLabels[channel].split(' ')[1]}
                </h4>
                
                <!-- Left Icon Section -->
                <div style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <label style="display: block; margin-bottom: 12px; font-weight: 700; color: #333; font-size: 15px;">
                        👈 Left Icon (Main)
                    </label>
                    <div style="display: flex; gap: 15px; margin-bottom: 15px; align-items: center;">
                        <div id="${channel}IconPreview" style="width: 80px; height: 80px; border: 3px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 44px; background: linear-gradient(135deg, ${color}20, ${color}10); box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0; overflow: hidden;">
                            ${config.icon}
                        </div>
                        <div style="flex: 1;">
                            <div style="margin-bottom: 8px;">
                                <label style="display: block; font-size: 11px; color: #666; margin-bottom: 4px; font-weight: 600;">📁 Upload</label>
                                <input type="file" id="${channel}IconFile" class="form-control" accept="image/*,.gif" onchange="previewButtonIcon(this, '${channel}', 'icon')" style="font-size: 12px;">
                                <span id="${channel}IconFileName" style="display: none; font-size: 10px; color: #28a745; margin-top: 2px; font-weight: 600;"></span>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <label style="display: block; font-size: 11px; color: #666; margin-bottom: 4px; font-weight: 600;">🔗 URL</label>
                                <input type="text" id="${channel}IconUrl" class="form-control" placeholder="https://..." onchange="previewButtonIconUrl(this, '${channel}', 'icon')" style="font-size: 12px;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 11px; color: #666; margin-bottom: 4px; font-weight: 600;">😊 Emoji</label>
                                <input type="text" id="${channel}IconEmoji" class="form-control" placeholder="📞" value="${config.icon}" onchange="previewButtonIconEmoji(this, '${channel}', 'icon')" style="font-size: 24px; text-align: center;">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Right Icon Section -->
                <div style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                    <label style="display: block; margin-bottom: 12px; font-weight: 700; color: #333; font-size: 15px;">
                        👉 Right Icon (Cart/Action)
                    </label>
                    <div style="display: flex; gap: 15px; margin-bottom: 15px; align-items: center;">
                        <div id="${channel}CartIconPreview" style="width: 70px; height: 70px; border: 3px solid #ff6a00; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; background: linear-gradient(135deg, #ff6a0020, #ff6a0010); box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0; overflow: hidden;">
                            ${config.cartIcon}
                        </div>
                        <div style="flex: 1;">
                            <div style="margin-bottom: 8px;">
                                <label style="display: block; font-size: 11px; color: #666; margin-bottom: 4px; font-weight: 600;">📁 Upload</label>
                                <input type="file" id="${channel}CartIconFile" class="form-control" accept="image/*,.gif" onchange="previewButtonIcon(this, '${channel}', 'cartIcon')" style="font-size: 12px;">
                                <span id="${channel}CartIconFileName" style="display: none; font-size: 10px; color: #ff6a00; margin-top: 2px; font-weight: 600;"></span>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <label style="display: block; font-size: 11px; color: #666; margin-bottom: 4px; font-weight: 600;">🔗 URL</label>
                                <input type="text" id="${channel}CartIconUrl" class="form-control" placeholder="https://..." onchange="previewButtonIconUrl(this, '${channel}', 'cartIcon')" style="font-size: 12px;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 11px; color: #666; margin-bottom: 4px; font-weight: 600;">😊 Emoji</label>
                                <input type="text" id="${channel}CartIconEmoji" class="form-control" placeholder="🛒" value="${config.cartIcon}" onchange="previewButtonIconEmoji(this, '${channel}', 'cartIcon')" style="font-size: 24px; text-align: center;">
                            </div>
                        </div>
                    </div>
                </div>
                
                <button class="btn-secondary" onclick="resetButtonChannel('${channel}')" style="width: 100%; background: linear-gradient(135deg, #6c757d, #5a6268); color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'">
                    🔄 Reset to Default
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    grid.innerHTML = html;
}

// Preview button icon from file
function previewButtonIcon(input, channel, iconType) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('❌ Please select a valid image file', 'error');
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imageData = e.target.result;
            const previewId = iconType === 'cartIcon' ? `${channel}CartIconPreview` : `${channel}IconPreview`;
            const preview = document.getElementById(previewId);
            
            if (!preview) {
                console.error(`Preview element not found: ${previewId}`);
                return;
            }
            
            // Clear previous content and set image
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = imageData;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '50%';
            img.onerror = function() {
                console.error(`Failed to load image for ${channel} ${iconType}`);
                preview.innerHTML = '❌ Image failed to load';
            };
            preview.appendChild(img);
            
            // Store in hidden input
            const inputId = iconType === 'cartIcon' ? `${channel}CartIconData` : `${channel}IconData`;
            let hiddenInput = document.getElementById(inputId);
            if (!hiddenInput) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.id = inputId;
                input.parentElement.appendChild(hiddenInput);
            }
            hiddenInput.value = imageData;
            
            // Show file name indicator
            const fileNameSpan = document.getElementById(`${channel}${iconType === 'cartIcon' ? 'CartIcon' : 'Icon'}FileName`);
            if (fileNameSpan) {
                fileNameSpan.textContent = `📁 ${file.name}`;
                fileNameSpan.style.display = 'block';
            }
            
            console.log(`✅ ${iconType} uploaded for ${channel}: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);
        } catch (error) {
            console.error(`Error processing image for ${channel} ${iconType}:`, error);
            showNotification(`❌ Error processing image: ${error.message}`, 'error');
        }
    };
    reader.onerror = function() {
        console.error(`Failed to read file for ${channel} ${iconType}`);
        showNotification('❌ Failed to read file', 'error');
        input.value = '';
    };
    reader.readAsDataURL(file);
}

// Preview button icon from URL
function previewButtonIconUrl(input, channel, iconType) {
    const url = input.value.trim();
    if (!url) return;
    
    const previewId = iconType === 'cartIcon' ? `${channel}CartIconPreview` : `${channel}IconPreview`;
    const preview = document.getElementById(previewId);
    
    if (!preview) {
        console.error(`Preview element not found: ${previewId}`);
        return;
    }
    
    // Clear previous content and set image
    preview.innerHTML = '';
    const img = document.createElement('img');
    img.src = url;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '50%';
    img.onerror = function() {
        console.error(`Failed to load image from URL: ${url}`);
        preview.innerHTML = '❌ Could not load image';
    };
    preview.appendChild(img);
    
    // Store URL
    const inputId = iconType === 'cartIcon' ? `${channel}CartIconData` : `${channel}IconData`;
    let hiddenInput = document.getElementById(inputId);
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = inputId;
        input.parentElement.appendChild(hiddenInput);
    }
    hiddenInput.value = url;
    
    console.log(`✅ ${iconType} URL stored for ${channel}:`, url);
}

// Preview button icon from emoji
function previewButtonIconEmoji(input, channel, iconType) {
    const emoji = input.value.trim();
    if (!emoji) return;
    
    const previewId = iconType === 'cartIcon' ? `${channel}CartIconPreview` : `${channel}IconPreview`;
    const preview = document.getElementById(previewId);
    
    if (!preview) {
        console.error(`Preview element not found: ${previewId}`);
        return;
    }
    
    const fontSize = iconType === 'cartIcon' ? '36px' : '44px';
    
    // Clear previous content and set emoji
    preview.innerHTML = '';
    preview.textContent = emoji;
    preview.style.fontSize = fontSize;
    preview.style.display = 'flex';
    preview.style.alignItems = 'center';
    preview.style.justifyContent = 'center';
    
    // Store emoji
    const inputId = iconType === 'cartIcon' ? `${channel}CartIconData` : `${channel}IconData`;
    let hiddenInput = document.getElementById(inputId);
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = inputId;
        input.parentElement.appendChild(hiddenInput);
    }
    hiddenInput.value = emoji;
    
    console.log(`✅ ${iconType} emoji stored for ${channel}:`, emoji);
}

// Save button customization
async function saveButtonCustomization() {
    const channels = ['phone', 'whatsapp', 'telegram', 'facebook', 'messenger'];
    
    if (!CONFIG.buttonIcons) {
        CONFIG.buttonIcons = {};
    }
    
    channels.forEach(channel => {
        const iconData = document.getElementById(`${channel}IconData`)?.value || 
                        document.getElementById(`${channel}IconEmoji`)?.value || 
                        document.getElementById(`${channel}IconUrl`)?.value || '📞';
        
        const cartIconData = document.getElementById(`${channel}CartIconData`)?.value || 
                            document.getElementById(`${channel}CartIconEmoji`)?.value || 
                            document.getElementById(`${channel}CartIconUrl`)?.value || '🛒';
        
        CONFIG.buttonIcons[channel] = {
            icon: iconData,
            cartIcon: cartIconData
        };
    });
    
    try {
        await saveToLocalStorage();
        showNotification('✅ Button customization saved successfully!', 'success');
        
        // Notify frontend to reload
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'websiteConfig',
            newValue: JSON.stringify(CONFIG)
        }));
    } catch (error) {
        showNotification('❌ Error saving button customization: ' + error.message, 'error');
    }
}

// Reset button channel to default
function resetButtonChannel(channel) {
    if (confirm(`Reset ${channel} button to default emojis?`)) {
        const defaults = {
            phone: { icon: '📞', cartIcon: '🛒' },
            whatsapp: { icon: '💬', cartIcon: '🛒' },
            telegram: { icon: '✈️', cartIcon: '🛒' },
            facebook: { icon: '👍', cartIcon: '🛒' },
            messenger: { icon: '💬', cartIcon: '🛒' }
        };
        
        if (!CONFIG.buttonIcons) CONFIG.buttonIcons = {};
        CONFIG.buttonIcons[channel] = defaults[channel];
        
        // Update previews
        const iconPreview = document.getElementById(`${channel}IconPreview`);
        const cartIconPreview = document.getElementById(`${channel}CartIconPreview`);
        
        if (iconPreview) {
            iconPreview.innerHTML = defaults[channel].icon;
            iconPreview.style.fontSize = '44px';
        }
        if (cartIconPreview) {
            cartIconPreview.innerHTML = defaults[channel].cartIcon;
            cartIconPreview.style.fontSize = '36px';
        }
        
        // Clear inputs
        document.getElementById(`${channel}IconFile`).value = '';
        document.getElementById(`${channel}IconUrl`).value = '';
        document.getElementById(`${channel}IconEmoji`).value = defaults[channel].icon;
        document.getElementById(`${channel}CartIconFile`).value = '';
        document.getElementById(`${channel}CartIconUrl`).value = '';
        document.getElementById(`${channel}CartIconEmoji`).value = defaults[channel].cartIcon;
        
        showNotification(`✅ ${channel} button reset to default!`, 'success');
    }
}

// Preview button customization
function previewButtonCustomization() {
    const channels = ['phone', 'whatsapp', 'telegram', 'facebook', 'messenger'];
    let previewHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">';
    
    channels.forEach(channel => {
        const config = CONFIG.buttonIcons?.[channel] || { icon: '📞', cartIcon: '🛒' };
        previewHtml += `
            <div style="border: 2px solid #ff6a00; border-radius: 10px; padding: 15px; text-align: center; background: #fff8f0;">
                <div style="font-size: 40px; margin-bottom: 10px;">
                    ${renderButtonIconPreview(config.icon)}
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 10px; text-transform: capitalize;">
                    ${channel}
                </div>
                <div style="font-size: 24px;">
                    ${renderButtonIconPreview(config.cartIcon)}
                </div>
            </div>
        `;
    });
    
    previewHtml += '</div>';
    
    showModal('Button Preview', previewHtml + '<div style="margin-top: 20px;"><button class="btn-primary" onclick="closeModal()">Close</button></div>');
}

// Helper to render icon in preview
function renderButtonIconPreview(iconValue) {
    if (!iconValue) return '❓';
    
    if (iconValue.startsWith('http') || iconValue.includes('.')) {
        if (iconValue.toLowerCase().includes('.gif')) {
            return `<video autoplay muted loop style="width: 40px; height: 40px; border-radius: 5px;"><source src="${iconValue}" type="video/mp4"></video>`;
        } else {
            return `<img src="${iconValue}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 5px;">`;
        }
    }
    
    return iconValue;
}

// Reset all buttons to default
function resetButtonCustomization() {
    if (confirm('Reset all buttons to default emojis?')) {
        CONFIG.buttonIcons = {
            phone: { icon: '📞', cartIcon: '🛒' },
            whatsapp: { icon: '💬', cartIcon: '🛒' },
            telegram: { icon: '✈️', cartIcon: '🛒' },
            facebook: { icon: '👍', cartIcon: '🛒' },
            messenger: { icon: '💬', cartIcon: '🛒' }
        };
        
        saveButtonCustomization();
        initButtonCustomization();
    }
}

// Load button customization when tab is shown
function loadButtonCustomization() {
    initButtonCustomization();
}
