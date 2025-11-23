# 🎯 ELEVEZ Admin Panel - Quick Start

## 📁 Project Structure

```
elevez/
├── admin-panel/          # Admin panel files
│   ├── index.html        # Main admin interface
│   ├── admin.js          # Admin logic
│   ├── admin.css         # Admin styles
│   └── tools/            # Utility tools
│       ├── check-storage.html
│       ├── CLEAR-DATA-NOW.html
│       └── FIX-QID-ISSUE.html
│
├── scripts/              # Server & automation
│   ├── admin-server.js   # Image upload & sync server
│   ├── auto-deploy-monitor.ps1  # Auto-deployment
│   └── update-constants.js
│
├── docs/                 # Documentation
│   ├── FULLY-AUTOMATIC-GUIDE.md
│   ├── AUTOMATIC-UPLOAD-GUIDE.md
│   └── ... (all guides)
│
├── public/               # Public assets
│   └── images/
│       └── products/     # Product images (auto-created)
│
├── START-ALL-SERVERS.bat # Start everything (USE THIS!)
└── open-admin-panel.bat  # Open admin only
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Servers (One Time)

```bash
# Double-click this file:
START-ALL-SERVERS.bat
```

This starts:
- Admin server (handles image uploads)
- Auto-deploy monitor (watches for changes)
- Opens admin panel automatically

**Keep the server windows open!**

### Step 2: Add Products

1. Admin panel opens automatically
2. Click "Add Product"
3. Upload images (saves automatically to `/public/images/products/`)
4. Fill details
5. Click "Save Product"

### Step 3: Deploy

1. Click "Sync & Deploy" button
2. Wait 30 seconds
3. **Done!** Products are live!

---

## 📋 What Each File Does

### Main Files

- **START-ALL-SERVERS.bat** - Start everything (use this!)
- **open-admin-panel.bat** - Open admin panel only

### Admin Panel (`admin-panel/`)

- **index.html** - Main admin interface
- **admin.js** - All admin functionality
- **admin.css** - Admin panel styles

### Scripts (`scripts/`)

- **admin-server.js** - Handles image uploads & sync
- **auto-deploy-monitor.ps1** - Auto-deploys on changes
- **update-constants.js** - Updates constants.ts

### Tools (`admin-panel/tools/`)

- **check-storage.html** - View stored products
- **CLEAR-DATA-NOW.html** - Clear all data
- **FIX-QID-ISSUE.html** - Fix duplicate QIDs

### Documentation (`docs/`)

- **FULLY-AUTOMATIC-GUIDE.md** - Complete automation guide
- **AUTOMATIC-UPLOAD-GUIDE.md** - Image upload guide
- **FREE-SOLUTION-GUIDE.md** - Free hosting guide
- And more...

---

## 🎯 Daily Workflow

```bash
# 1. Start servers (once per day)
START-ALL-SERVERS.bat

# 2. Add products
# - Upload images
# - Fill details
# - Save

# 3. Deploy
# - Click "Sync & Deploy"
# - Wait 30 seconds
# - Products are live!
```

---

## 🔧 Troubleshooting

### Admin panel not working?
- Make sure servers are running
- Run `START-ALL-SERVERS.bat`

### Images not uploading?
- Check if admin server is running
- Look for "ELEVEZ Admin Server" window

### Products not deploying?
- Check if auto-deploy monitor is running
- Look for "ELEVEZ Auto-Deploy" window

### Need to clear data?
- Open `admin-panel/tools/CLEAR-DATA-NOW.html`
- Or run `scripts/CLEAR-DATA.bat`

---

## 📚 Documentation

All guides are in the `docs/` folder:

- **FULLY-AUTOMATIC-GUIDE.md** - Complete automation setup
- **AUTOMATIC-UPLOAD-GUIDE.md** - How image upload works
- **FREE-SOLUTION-GUIDE.md** - 100% free hosting
- **AUTO-SYNC-GUIDE.md** - Sync & deploy guide

---

## ✨ Features

- ✅ **Automatic image upload** to `/public/images/products/`
- ✅ **Automatic Git commit & push**
- ✅ **Automatic deployment**
- ✅ **Triple backup** (localStorage + server + Git)
- ✅ **No manual steps** - just click and go!

---

## 🎉 You're Ready!

1. Run `START-ALL-SERVERS.bat`
2. Add products
3. Click "Sync & Deploy"
4. Products are live!

**Everything is automatic!** 🚀
