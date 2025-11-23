# 🔧 Simple Manual Fix

## Step 1: Start Servers

Open **3 separate terminals** and run these commands:

### Terminal 1 - Website:
```bash
npm run dev
```
Wait until you see: `Local: http://localhost:5173/`

### Terminal 2 - Admin Server:
```bash
node scripts/admin-server.js
```
Wait until you see: `Admin Server Running!`

### Terminal 3 (Optional) - Auto Deploy:
```bash
powershell -ExecutionPolicy Bypass -File scripts/auto-deploy-monitor.ps1
```

---

## Step 2: Add Trial Products

1. Open your browser
2. Press **F12** to open Developer Console
3. Go to **Console** tab
4. Copy and paste this code:

```javascript
// Add trial products
const trialProducts = [
  {
    "id": 1001,
    "qid": "NGH-001",
    "name": "Neon Glitch Hoodie",
    "price": 85,
    "originalPrice": 170,
    "category": "Men",
    "type": "Hoodie",
    "rating": 4.5,
    "description": "Premium quality hoodie with neon glitch design.",
    "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
    "images": ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500"],
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["Black", "White", "Neon Green"],
    "tags": ["TRENDING", "BESTSELLER"],
    "isBestSeller": true,
    "isNew": true
  },
  {
    "id": 1002,
    "qid": "VCT-002",
    "name": "Vintage Crop Top",
    "price": 45,
    "originalPrice": 90,
    "category": "Women",
    "type": "Crop Top",
    "rating": 4.7,
    "description": "Stylish vintage crop top with retro vibes.",
    "image": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
    "images": ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500"],
    "sizes": ["XS", "S", "M", "L"],
    "colors": ["Pink", "White", "Black"],
    "tags": ["VINTAGE", "TRENDING"],
    "isNew": true
  },
  {
    "id": 1003,
    "qid": "OST-003",
    "name": "Oversized Street Tee",
    "price": 35,
    "originalPrice": 70,
    "category": "Unisex",
    "type": "Oversized T-Shirt",
    "rating": 4.6,
    "description": "Ultra-comfortable oversized t-shirt.",
    "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    "images": ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
    "sizes": ["M", "L", "XL", "XXL"],
    "colors": ["Black", "White", "Gray"],
    "tags": ["ESSENTIAL", "BESTSELLER"],
    "isBestSeller": true
  }
];

// Get existing products
const existing = JSON.parse(localStorage.getItem('elevez_products') || '[]');
console.log('Current products:', existing.length);

// Merge
const merged = [...existing, ...trialProducts];
localStorage.setItem('elevez_products', JSON.stringify(merged));

console.log('✅ Added trial products! Total:', merged.length);
alert('✅ Trial products added! Refresh the page.');
```

4. Press **Enter**
5. You should see: "✅ Trial products added!"
6. **Refresh the page** (Ctrl+R)

---

## Step 3: Sync to Website

In the admin panel:
1. Click **"Sync & Deploy"** button
2. Wait 5 seconds
3. Open http://localhost:5173
4. Refresh the page (Ctrl+R)
5. Products should appear!

---

## Step 4: Fix Image Preview

If images show "failed to load":

1. Make sure website is running on **port 5173** (not 3000)
2. Check terminal - should say `Local: http://localhost:5173/`
3. If it says port 3000, the vite.config.ts wasn't updated
4. Close server and restart

---

## Verification

### Check Admin Panel:
- Open: `admin-panel/index.html`
- Should see: Your products + 3 trial products

### Check Website:
- Open: http://localhost:5173
- Should see: All products from constants.ts

### Check Console:
- Press F12
- Type: `JSON.parse(localStorage.getItem('elevez_products')).length`
- Should show: Number of products (your products + 3)

---

## If Something Goes Wrong

### Clear Everything and Start Fresh:
```javascript
// In browser console (F12)
localStorage.clear();
alert('✅ Cleared! Refresh and add products again.');
```

### Check Ports:
```bash
netstat -ano | findstr :5173
netstat -ano | findstr :3001
```

### Restart Servers:
1. Close all terminals (Ctrl+C)
2. Start again from Step 1

---

## Summary

1. ✅ Start 2 servers (website + admin)
2. ✅ Add trial products via console
3. ✅ Click "Sync & Deploy"
4. ✅ View on http://localhost:5173

That's it! No batch files needed.
