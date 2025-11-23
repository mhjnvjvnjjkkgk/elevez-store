# ⚡ Quick Fix Reference

## 🔥 Firebase Orders Not Syncing?

### **Quick Fix:**
1. Check `.env` file has Firebase credentials
2. Restart admin panel
3. Look for "✅ Firebase connected" message
4. Orders should sync within 10 seconds

### **If Still Not Working:**
```bash
# Check .env file exists and has:
VITE_FIREBASE_API_KEY=your-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## 🛍️ Products Not Showing in Website?

### **Quick Fix:**
1. Open admin panel
2. Click "🚀 Sync & Deploy" button
3. Wait for "✅ Deployed successfully!"
4. Refresh website (F5)
5. Products should appear

### **If Still Not Showing:**
1. Edit product
2. Check "Show in Shop/All Products" is checked
3. Save product
4. Sync & Deploy again
5. Hard refresh website (Ctrl+Shift+R)

---

## 📦 Products Not in "All" Category?

### **Quick Fix:**
1. Edit product in admin panel
2. Make sure "🛍️ Show in Shop/All Products" is checked
3. Save
4. Sync & Deploy
5. Go to /shop/all on website
6. Product should appear

---

## 🎯 Control Where Products Appear

### **In Admin Panel:**
When adding/editing product, check/uncheck:
- 🏠 Show on Homepage
- 🛍️ Show in Shop/All Products
- 📦 Show in Collections Page
- ⭐ Best Seller
- ✨ New Arrival
- 🔥 Featured Product

**Default:** All checked (shows everywhere)

---

## 🚀 Complete Workflow

```
1. Add product in admin panel
2. Choose display sections
3. Save product
4. Click "🚀 Sync & Deploy"
5. Wait for success message
6. Refresh website
7. Product appears!
```

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Orders not syncing | Check .env Firebase config |
| Products not showing | Click Sync & Deploy |
| Product in wrong section | Edit product, change checkboxes |
| Changes not appearing | Hard refresh (Ctrl+Shift+R) |

---

**Everything managed from admin panel - no code editing needed!** ✨
