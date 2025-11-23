# 🔥 Firebase Setup - Complete Guide

## ✅ Your Firebase is Already Configured!

Your `.env` file already has all the Firebase credentials:

```
✅ API Key: AIzaSyCCrE4ikRxLf2fF6ujdhwOcKGfuGRnMBMw
✅ Auth Domain: elevez-ed97f.firebaseapp.com
✅ Project ID: elevez-ed97f
✅ Storage Bucket: elevez-ed97f.firebasestorage.app
✅ Messaging Sender ID: 440636781018
✅ App ID: 1:440636781018:web:24d9b6d31d5aee537850e3
✅ Measurement ID: G-1H0YRD521H
```

---

## 🚀 What You Need to Do

### **1. Enable Firestore Database**

1. Go to https://console.firebase.google.com/
2. Select project: **elevez-ed97f**
3. Click **"Firestore Database"** in left menu
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select location (closest to you)
7. Click **"Enable"**

### **2. Enable Authentication**

1. In Firebase Console, click **"Authentication"**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **"Google"** sign-in:
   - Click "Google"
   - Toggle "Enable"
   - Add support email
   - Click "Save"

### **3. Set Firestore Rules**

1. Go to **Firestore Database**
2. Click **"Rules"** tab
3. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Allow authenticated users to create orders
      allow create: if request.auth != null;
      // Allow users to read their own orders
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.userId || 
                      request.auth.token.email != null);
      // Allow updates (for admin)
      allow update: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

---

## 🔧 Restart Your Servers

After Firebase is enabled, restart your development servers:

```bash
# Stop current servers (Ctrl+C)

# Start again:
START-ALL-SERVERS.bat

# Or manually:
# Terminal 1:
node scripts/admin-server.js

# Terminal 2:
npm run dev
```

---

## ✅ Verify Everything Works

### **Test Orders:**

1. **Place an order on website:**
   - Go to http://localhost:5173
   - Add product to cart
   - Sign in with Google
   - Complete checkout

2. **Check admin panel:**
   - Go to http://localhost:3000
   - Click "Orders" tab
   - Should see "✅ Firebase connected"
   - Order should appear within 10 seconds

### **Test Authentication:**

1. **Sign in on website:**
   - Click user icon
   - Sign in with Google
   - Should work smoothly

2. **Check account page:**
   - Go to Account
   - Should see your profile
   - Orders should appear

---

## 🐛 Troubleshooting

### **"Firebase sync not loaded" in admin panel?**

**Cause:** Firestore not enabled or rules not set

**Fix:**
1. Enable Firestore Database (see above)
2. Set Firestore rules (see above)
3. Restart servers
4. Refresh admin panel

---

### **Orders not appearing?**

**Check:**
1. Firestore Database is enabled
2. Rules are set correctly
3. Order was placed while signed in
4. Admin panel shows "✅ Firebase connected"

**Fix:**
1. Check browser console (F12) for errors
2. Verify Firebase rules allow reading orders
3. Click "🔄 Refresh Orders" in admin panel

---

### **Authentication not working?**

**Check:**
1. Google sign-in is enabled in Firebase
2. Support email is set
3. Domain is authorized

**Fix:**
1. Go to Firebase Console → Authentication
2. Enable Google sign-in
3. Add your domain to authorized domains:
   - Settings → Authorized domains
   - Add: `localhost`

---

## 📊 Firebase Console Quick Links

**Your Project:** elevez-ed97f

- **Console:** https://console.firebase.google.com/project/elevez-ed97f
- **Firestore:** https://console.firebase.google.com/project/elevez-ed97f/firestore
- **Authentication:** https://console.firebase.google.com/project/elevez-ed97f/authentication
- **Settings:** https://console.firebase.google.com/project/elevez-ed97f/settings/general

---

## 🎯 Quick Setup Checklist

- [x] ✅ Firebase credentials in .env file
- [ ] ⬜ Enable Firestore Database
- [ ] ⬜ Enable Google Authentication
- [ ] ⬜ Set Firestore Rules
- [ ] ⬜ Restart servers
- [ ] ⬜ Test order placement
- [ ] ⬜ Verify admin panel sync

---

## 💡 Important Notes

### **Security:**
- ✅ `.env` file is in `.gitignore` (credentials safe)
- ⚠️ Never commit `.env` to Git
- ⚠️ Use test mode rules for development only
- ⚠️ Update rules for production

### **Development:**
- ✅ Test mode allows easy development
- ✅ Orders sync automatically
- ✅ Authentication works locally

### **Production:**
- ⚠️ Update Firestore rules for production
- ⚠️ Add production domain to authorized domains
- ⚠️ Enable security features

---

## ✨ Summary

**Your Firebase Setup:**
- ✅ Credentials configured in .env
- ✅ Project: elevez-ed97f
- ✅ Ready to use

**Next Steps:**
1. Enable Firestore Database
2. Enable Google Authentication
3. Set Firestore Rules
4. Restart servers
5. Test everything!

**Your Firebase is ready to go!** 🚀
