# 🚀 ELEVEZ - Complete Setup Guide

## ✅ What's Been Fixed

1. **Image Preview** - Images now display correctly in admin panel
2. **Trial Products** - 5 sample products added automatically
3. **Auto-Sync** - Products sync to website when you click "Sync & Deploy"
4. **Hot-Reload** - No need to restart servers when editing code

---

## 🎯 Quick Start (3 Steps)

### Step 1: Start Servers
```bash
START-ALL-SERVERS.bat
```
This starts:
- **Website server** (port 5173) - Your main website
- **Admin server** (port 3001) - Image upload & sync
- **Hot-reload server** (port 3002) - Auto-refresh
- **Auto-deploy monitor** - Watches for changes

### Step 2: Open Admin Panel
```bash
SETUP-TRIAL-PRODUCTS.bat
```
OR manually open: `admin-panel/index.html`

The admin panel will automatically load 5 trial products.

### Step 3: View Website
Open browser to: `http://localhost:5173`

You should see all 5 products on the homepage!

---

## 📦 Trial Products Included

1. **Neon Glitch Hoodie** - ₹85 (₹170)
2. **Vintage Crop Top** - ₹45 (₹90)
3. **Oversized Street Tee** - ₹35 (₹70)
4. **Premium Tech Hoodie** - ₹95 (₹190)
5. **Colorful Festival Tee** - ₹40 (₹80)

---

## 🔄 How Sync Works

### When You Click "Sync & Deploy":

1. **Saves to localStorage** - Instant backup
2. **Saves to server** - `scripts/products-backup.json`
3. **Updates constants.ts** - Website code file
4. **Git commit & push** - Version control
5. **Auto-deploy** - Live website updates

### Timeline:
- Admin panel: **Instant**
- constants.ts: **5 seconds**
- Website: **Refresh page** (Ctrl+R)
- Live deployment: **30-60 seconds**

---

## ✏️ Editing Products

### In Admin Panel:
1. Go to **Products** tab
2. Click **Edit** on any product
3. Change details, upload new images
4. Click **Save Product**
5. Click **Sync & Deploy**

### Images:
- **Upload**: Drag & drop or click to browse
- **Preview**: Shows immediately in admin panel
- **Storage**: Saved to `public/images/products/`
- **URLs**: Automatically converted for website

---

## 🖼️ Image Preview Fix

**Problem**: Images showed "Image failed to load"

**Solution**: 
- Admin panel uses full URLs: `http://localhost:5173/images/...`
- Website uses relative URLs: `/images/...`
- Automatic conversion when saving/loading

---

## 🔥 Hot-Reload Feature

**No need to restart servers!**

When you edit:
- `admin.css` → Reloads CSS instantly
- `admin.js` → Reloads page automatically
- `index.html` → Reloads page automatically

Just save the file and watch it update!

---

## 🔍 Verification

### Check Admin Panel:
```bash
verify-products.bat
```

### Check Website:
```bash
check-website-products.bat
```

### Manual Check:
1. Open `http://localhost:5173`
2. Look for products on homepage
3. Click a product to see details

---

## 📁 File Structure

```
elevez/
├── admin-panel/
│   ├── index.html          # Admin interface
│   ├── admin.js            # Admin logic
│   ├── admin.css           # Styles
│   └── init-trial-products.js  # Trial products
├── scripts/
│   ├── admin-server.js     # Backend server
│   └── products-backup.json    # Backup file
├── public/images/products/ # Product images
├── constants.ts            # Website products
└── START-ALL-SERVERS.bat   # Main launcher
```

---

## 🐛 Troubleshooting

### Products Not Showing on Website?
1. Click "Sync & Deploy" in admin panel
2. Wait 5 seconds
3. Refresh website (Ctrl+R)
4. Check browser console (F12) for errors

### Images Not Loading?
1. Make sure `START-ALL-SERVERS.bat` is running
2. Check images are in `public/images/products/`
3. Try re-uploading the image

### Admin Panel Empty?
1. Run `SETUP-TRIAL-PRODUCTS.bat`
2. Or open admin panel - trial products load automatically
3. Check browser console (F12) for errors

### Sync Not Working?
1. Make sure admin server is running (port 3001)
2. Check console for error messages
3. Try manual sync: Edit `constants.ts` directly

---

## 💡 Tips

1. **Always keep servers running** - Don't close `START-ALL-SERVERS.bat`
2. **Use Sync & Deploy** - Don't edit `constants.ts` manually
3. **Check console** - Press F12 to see logs and errors
4. **Backup regularly** - Products saved in 5 places automatically
5. **Use image URLs** - For large images, use external URLs (Unsplash, etc.)

---

## 🎨 Customization

### Add Your Own Products:
1. Open admin panel
2. Click "Add Product"
3. Fill in details
4. Upload images
5. Click "Save Product"
6. Click "Sync & Deploy"

### Edit Trial Products:
1. Click "Edit" on any product
2. Change name, price, images, etc.
3. Click "Save Product"
4. Click "Sync & Deploy"

### Delete Products:
1. Click "Delete" on any product
2. Confirm deletion
3. Click "Sync & Deploy"

---

## 📞 Need Help?

1. Check `HOW-TO-VERIFY-PRODUCTS.md`
2. Check `VERIFICATION-GUIDE.md`
3. Check browser console (F12)
4. Check server logs in terminal

---

## ✨ Summary

You now have:
- ✅ 5 trial products ready to use
- ✅ Working admin panel with image preview
- ✅ Auto-sync to website
- ✅ Hot-reload for development
- ✅ Complete backup system

**Next**: Start customizing products or add your own!
