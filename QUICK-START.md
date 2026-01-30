# ⚡ Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Option 1: GitHub Pages (Free)

1. **Upload to GitHub:**
   - Create new repository on GitHub
   - Upload all files from this folder
   - Commit changes

2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: `main` branch, `/ (root)` folder
   - Save

3. **Done!** Visit: `https://[username].github.io/[repo-name]/`

---

### Option 2: Vercel (Free + Fast)

1. **Push to GitHub** (follow Option 1 step 1)

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

3. **Done!** Visit: `https://[project-name].vercel.app`

---

## 🔐 First Steps After Deployment

### 1. Change Admin Password

**CRITICAL:** Do this immediately!

1. Open `config.js` on GitHub
2. Find:
```javascript
admin: {
    username: 'adminsmey',
    password: '@@@@wrongpassword168'
}
```
3. Change to your credentials
4. Commit changes

### 2. Login to Admin Panel

1. Go to: `https://your-site.com/admin.html`
2. Login with your new credentials
3. Start adding content!

---

## 📝 What's Included

✅ **13 Essential Files** - Everything you need  
✅ **Mobile Responsive** - Works on all devices  
✅ **Admin Panel** - Manage content easily  
✅ **IndexedDB Storage** - 1GB+ capacity  
✅ **Social Media Embeds** - YouTube, Facebook, TikTok, Instagram  
✅ **Multi-language** - English & Khmer  
✅ **Dark Mode** - Built-in theme support  

---

## 📂 File Structure

```
deploy/
├── index.html              # Main website
├── admin.html              # Admin panel
├── login.html              # Admin login
├── config.js               # Data & settings
├── script.js               # Main functionality
├── admin-script.js         # Admin functionality
├── styles.css              # Main styles
├── admin-styles.css        # Admin styles
├── animations.css          # Animations
├── storage-manager.js      # Storage handler
├── ios-modal-fix.js        # iOS fixes
├── pull-to-refresh.js      # Pull to refresh
├── postEmbedFixer.js       # Social embeds
├── vercel.json             # Vercel config
├── package.json            # Project info
├── .gitignore              # Git ignore rules
├── README.md               # Documentation
├── DEPLOYMENT-GUIDE.md     # Detailed guide
└── QUICK-START.md          # This file
```

---

## 🎯 Next Steps

1. ✅ Deploy to GitHub/Vercel
2. ✅ Change admin credentials
3. ✅ Login to admin panel
4. ✅ Update site settings (logo, title, contact)
5. ✅ Add your first product
6. ✅ Upload banner images
7. ✅ Test on mobile device
8. ✅ Share your website!

---

## 💡 Pro Tips

- **Backup regularly:** Export config.js from admin panel
- **Use high-quality images:** But compress them first
- **Test on mobile:** Most users will visit from phones
- **Update content:** Keep your site fresh with new products
- **Monitor storage:** Check browser console for storage stats

---

## 🆘 Need Help?

1. **Read:** `DEPLOYMENT-GUIDE.md` for detailed instructions
2. **Check:** Browser console (F12) for errors
3. **Verify:** All files are uploaded correctly
4. **Clear:** Browser cache if issues persist

---

## 🎉 Ready to Launch!

All files are production-ready. Just upload and go!

**Default Admin Credentials:**
- Username: `adminsmey`
- Password: `@@@@wrongpassword168`

**⚠️ CHANGE THESE IMMEDIATELY AFTER DEPLOYMENT!**

---

**Version:** 4.0  
**Last Updated:** January 30, 2026  
**Status:** ✅ Production Ready
