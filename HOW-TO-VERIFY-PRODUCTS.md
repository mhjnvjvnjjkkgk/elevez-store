# 🔍 How to Verify Your Products

## Quick Check (2 methods)

### Method 1: Use the Batch File
```bash
check-website-products.bat
```
This opens both:
- Your website (localhost:5173)
- Product verification tool

### Method 2: Manual Check
1. Open browser to `http://localhost:5173`
2. Look for your products on the homepage
3. Check if images load correctly

---

## What to Check

### ✅ On the Website (localhost:5173)
- [ ] Products appear on homepage
- [ ] Images load correctly
- [ ] Prices show correctly (sale price + original price)
- [ ] Product names and details are correct
- [ ] Click on a product to see full details

### ✅ In Admin Panel
- [ ] Products show in the Products tab
- [ ] Image previews work
- [ ] Product count is correct
- [ ] Last sync time is recent

### ✅ In Browser Console (F12)
Look for these logs after saving:
```
✅ Data saved: { products: 5, ... }
📦 Last product: { name: "...", qid: "...", ... }
```

---

## Troubleshooting

### Images Not Loading?
**Problem:** "Image failed to load" in admin panel

**Solution:**
1. Make sure `START-ALL-SERVERS.bat` is running
2. Check that images are in `public/images/products/`
3. Try uploading images again

### Products Not on Website?
**Problem:** Products saved but not showing on website

**Solution:**
1. Click "Sync & Deploy" button in admin panel
2. Wait 5-10 seconds
3. Refresh your website (Ctrl+R)
4. Check browser console for errors (F12)

### How to Check constants.ts?
Open `constants.ts` file and look for:
```typescript
export const PRODUCTS: Product[] = [
  {
    id: ...,
    name: "Your Product",
    images: ["/images/products/..."],
    ...
  }
]
```

---

## Quick Verification Steps

1. **Add a product** in admin panel
2. **Click "Sync & Deploy"**
3. **Open browser console** (F12)
4. **Check logs** for confirmation
5. **Open website** (localhost:5173)
6. **Look for your product** on homepage
7. **Click product** to see details

---

## Console Commands for Debugging

Open browser console (F12) and type:

```javascript
// Check localStorage
JSON.parse(localStorage.getItem('elevez_products'))

// Check how many products
JSON.parse(localStorage.getItem('elevez_products')).length

// See last product
const products = JSON.parse(localStorage.getItem('elevez_products'))
products[products.length - 1]
```

---

## File Locations

- **Product Data:** `localStorage` + `scripts/products-backup.json`
- **Product Images:** `public/images/products/`
- **Website Code:** `constants.ts`
- **Admin Panel:** `admin-panel/index.html`

---

## Need Help?

1. Check `VERIFICATION-GUIDE.md` for detailed info
2. Run `verify-products.bat` to see product data
3. Check browser console (F12) for errors
4. Make sure all servers are running
