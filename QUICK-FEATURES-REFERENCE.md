# ⚡ Quick Features Reference

## 🔥 Real-Time Order Sync

### **What It Does**
- Automatically syncs orders from Firebase to admin panel
- Updates every 10 seconds
- Shows complete order details including trial products

### **How to Use**
1. Open admin panel → Orders tab
2. Orders appear automatically
3. Click "🔄 Refresh" for manual sync

### **What You See**
- Customer: name, email, phone, address
- Products: QID, image, category, type, size, color, qty
- Payment: method, subtotal, shipping, total
- Status: pending, processing, completed, cancelled

---

## 📄 Auto-Update Collections

### **What It Does**
- Collections page automatically shows all products
- Updates when you sync products
- No manual file editing needed

### **How to Use**
1. Add/edit products in admin panel
2. Click "🚀 Sync & Deploy"
3. Wait 1-2 minutes
4. Collections page shows all products!

---

## 🎯 Quick Actions

| Action | How | Result |
|--------|-----|--------|
| **View Orders** | Admin Panel → Orders | See all orders with full details |
| **Refresh Orders** | Click "🔄 Refresh" | Manual sync from Firebase |
| **Update Products** | Edit in admin panel | Changes saved locally |
| **Sync to Website** | Click "🚀 Sync & Deploy" | Products live in 1-2 minutes |
| **Update Collections** | Automatic with sync | All products appear on website |
| **Mark Order Complete** | Click "✓ Mark as Completed" | Updates order status |

---

## 🚀 Start Commands

```bash
# Start everything at once
START-ALL-SERVERS.bat

# Or start individually
node scripts/admin-server.js  # Admin server (port 3001)
npm run dev                    # Website (port 5173)

# Open admin panel
http://localhost:3000
```

---

## ✅ Status Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔥 Firebase | Order from Firebase (real-time) |
| 💾 Local | Order from localStorage |
| ✅ Firebase connected | Real-time sync active |
| ⚠️ Firebase unavailable | Using local orders only |

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Orders not syncing | Check Firebase config, click Refresh |
| Collections not updating | Wait 1-2 min, clear cache |
| Missing product details | Product auto-enriched from admin panel |
| Server not running | Run `node scripts/admin-server.js` |

---

## 📊 Order Information

Each order shows:
- ✅ Order ID and source
- ✅ Customer details (name, email, phone, address)
- ✅ Product details (QID, image, category, type)
- ✅ Order details (size, color, quantity)
- ✅ Payment info (method, subtotal, shipping, total)
- ✅ Status (pending, completed, cancelled)

---

## 🎉 Key Benefits

1. **Automatic** - Orders sync without manual work
2. **Real-Time** - See orders within 10 seconds
3. **Complete** - All details included
4. **Easy** - Just click Sync & Deploy
5. **Reliable** - Auto-reconnect on errors

---

**Everything is automatic - just use the admin panel!** ⚡
