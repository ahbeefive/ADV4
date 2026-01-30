# ADmilk4 - Production Deployment

## 🚀 Quick Deploy

This folder contains only the essential files needed for deployment to GitHub and Vercel.

---

## 📦 Files Included

### **HTML Files:**
- `index.html` - Main website (customer view)
- `login.html` - Admin login page
- `admin.html` - Admin panel

### **JavaScript Files:**
- `config.js` - Configuration & data storage
- `script.js` - Main website functionality
- `admin-script.js` - Admin panel functionality
- `storage-manager.js` - Enhanced storage (IndexedDB + localStorage)
- `ios-modal-fix.js` - iOS modal fixes
- `pull-to-refresh.js` - Pull-to-refresh functionality
- `postEmbedFixer.js` - Social media embed fixer

### **CSS Files:**
- `styles.css` - Main website styles
- `admin-styles.css` - Admin panel styles
- `animations.css` - Animation styles

---

## 🔐 Default Admin Credentials

**Username:** `adminsmey`  
**Password:** `@@@@wrongpassword168`

⚠️ **IMPORTANT:** Change these in `config.js` before deployment!

---

## 📤 Deploy to GitHub

1. Create a new repository on GitHub
2. Upload all files from this folder
3. Go to Settings → Pages
4. Source: Deploy from branch
5. Branch: `main` → Folder: `/ (root)`
6. Save and wait 2-3 minutes

Your site will be at: `https://[username].github.io/[repo-name]/`

---

## 🚀 Deploy to Vercel

### **Method 1: GitHub Integration (Recommended)**
1. Push this folder to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

### **Method 2: Vercel CLI**
```bash
npm i -g vercel
cd deploy
vercel
```

### **Method 3: Drag & Drop**
1. Go to [vercel.com](https://vercel.com)
2. Drag this entire folder to Vercel dashboard
3. Click "Deploy"

---

## ⚙️ Configuration

The `vercel.json` file is included for optimal Vercel deployment:
- SPA routing support
- Proper MIME types
- Cache headers

---

## 🔄 How to Update

### **Update via Admin Panel:**
1. Login to admin panel on your live site
2. Make changes (add products, banners, etc.)
3. Go to "Data Save" tab
4. Click "Generate config.js Code"
5. Copy the code
6. Replace `config.js` on GitHub/Vercel

### **Update via GitHub:**
1. Edit files directly on GitHub
2. Commit changes
3. Vercel auto-deploys (if connected)
4. GitHub Pages updates in 2-3 minutes

---

## 📊 Storage

- **IndexedDB:** 1GB+ capacity for images/banners
- **localStorage:** Fallback for data
- All data managed via Admin Panel

---

## 🛠️ Troubleshooting

### **Site not loading?**
- Wait 2-3 minutes after deployment
- Clear browser cache
- Check browser console (F12) for errors

### **Admin panel not working?**
- Verify all files are uploaded
- Check file names are correct
- Ensure config.js is present

### **Storage issues?**
- Browser must support IndexedDB
- Check browser storage settings
- Try different browser

---

## 📱 Features

✅ Mobile-responsive design  
✅ Admin panel for content management  
✅ Image carousel with Swiper.js  
✅ Social media embeds (YouTube, Facebook, TikTok, Instagram)  
✅ Dark mode support  
✅ Multi-language (English/Khmer)  
✅ Pull-to-refresh  
✅ iOS optimized  

---

## 🎉 Ready to Deploy!

All files are production-ready. Just upload to GitHub or Vercel!

**Version:** 4.0  
**Last Updated:** January 30, 2026
