# ⚡ ELEVEZ - Quick Reference Card

## 🚀 START EVERYTHING

```bash
# Double-click this file:
START-SIMPLE.bat
```

**Wait for:**
- Terminal 1: `Local: http://localhost:5173/`
- Terminal 2: `Admin Server Running!`

---

## 🌐 YOUR URLS

| Service | URL |
|---------|-----|
| **Website** | http://localhost:5173 |
| **Admin Panel** | `admin-panel/index.html` |
| **Admin API** | http://localhost:3001 |

---

## 📊 ADMIN PANEL TABS

| Tab | Icon | Purpose |
|-----|------|---------|
| **Dashboard** | 📊 | Real-time metrics, revenue, orders |
| **Products** | 📦 | Add/edit/delete products |
| **Orders** | 🛒 | Manage orders, update status |
| **Collections** | 🗂️ | Product collections |
| **Sections** | 📑 | Website sections |
| **Discounts** | 💰 | Discount codes |
| **User Points** | ⭐ | Loyalty points |
| **Users** | 👥 | User management |
| **Page Builder** | 🎨 | Visual editor |

---

## 🎯 COMMON TASKS

### Add Product
```
1. Click "Products" tab
2. Click "+ Add Product"
3. Fill in details
4. Click "Save"
5. Click "Sync & Deploy"
```

### Process Order
```
1. Click "Orders" tab
2. Click on order
3. Click next status in pipeline
4. Done! (auto-updates)
```

### Check Revenue
```
1. Click "Dashboard" tab
2. See revenue card
3. View profit & margin
4. Check today's sales
```

### Deploy Changes
```
1. Click "Sync & Deploy" button
2. Wait for confirmation
3. Changes live on Vercel
```

---

## 📦 ORDER STATUS PIPELINE

```
⏳ Pending → ⚙️ Processing → 🚚 Shipped → ✅ Delivered
```

**Click any status to advance the order**

---

## 💰 DASHBOARD METRICS

### Revenue Card
- Total revenue
- Profit amount
- Profit margin %
- Today's revenue

### Orders Card
- Total orders
- Pending (needs action)
- Processing (in progress)
- Completed (done)
- Today's orders

### Products Card
- Total products
- In stock
- Low stock (< 10)
- Out of stock

### Users Card
- Total users
- Active (last 7 days)
- Inactive

### Best Sellers
- Top 5 products
- Quantity sold
- Revenue per product

---

## 🔧 QUICK FIXES

### Servers Won't Start
```bash
taskkill /F /IM node.exe
START-SIMPLE.bat
```

### Products Not Showing
```
1. Admin panel → "Sync from Website"
2. Refresh browser (F5)
```

### Orders Not Appearing
```
1. Orders tab → "🔄 Refresh"
2. Check Firebase connection
```

### Images Not Loading
```
Use Unsplash URLs:
https://images.unsplash.com/photo-...
```

---

## ⌨️ KEYBOARD SHORTCUTS

| Key | Action |
|-----|--------|
| **F5** | Refresh page |
| **Ctrl+F** | Search |
| **Ctrl+S** | Save (in modals) |
| **Esc** | Close modal |
| **F12** | Open console |

---

## 📱 MOBILE ACCESS

```bash
# Find your IP:
ipconfig

# On mobile browser:
http://YOUR_IP:5173
```

---

## 🆘 HELP FILES

| File | Purpose |
|------|---------|
| `STARTUP-GUIDE.md` | Quick start with visuals |
| `COMPLETE-SYSTEM-GUIDE.md` | Full documentation |
| `START-SERVERS-MANUAL.md` | Manual server setup |
| `TROUBLESHOOTING.md` | Common issues |

---

## 🎯 DAILY WORKFLOW

### Morning
```
1. START-SIMPLE.bat
2. Check dashboard
3. Process pending orders
4. Check inventory
```

### Throughout Day
```
1. Process new orders
2. Add products
3. Monitor metrics
4. Respond to customers
```

### Evening
```
1. Review sales
2. Update inventory
3. Plan promotions
4. Close servers (Ctrl+C)
```

---

## 📊 STATUS COLORS

| Status | Color | Icon |
|--------|-------|------|
| **Pending** | 🟠 Orange | ⏳ |
| **Processing** | 🟣 Purple | ⚙️ |
| **Shipped** | 🔵 Blue | 🚚 |
| **Delivered** | 🟢 Green | ✅ |
| **Cancelled** | 🔴 Red | ❌ |

---

## 💡 PRO TIPS

### Fast Product Entry
```
Use Unsplash for images
Copy/paste product details
Use templates
Bulk operations
```

### Efficient Order Processing
```
Click status to advance
Use bulk updates
Set up automation
Track profit margins
```

### Better Analytics
```
Check dashboard daily
Monitor best sellers
Track profit margins
Identify trends
```

---

## 🔄 AUTO-REFRESH

**Dashboard auto-refreshes every 30 seconds**

Manual refresh:
```javascript
window.refreshDashboard();
```

---

## 🎨 QUICK ACTIONS

**Dashboard → Quick Actions Card:**

| Button | Action |
|--------|--------|
| 📦 Add Product | Opens product modal |
| 🛒 View Orders | Switches to orders |
| 🔄 Sync Products | Syncs from website |
| 🚀 Deploy | One-click deploy |

---

## 📞 EMERGENCY COMMANDS

### Kill All Processes
```bash
taskkill /F /IM node.exe
```

### Restart Everything
```bash
KILL-AND-RESTART.bat
```

### Check Ports
```bash
netstat -ano | findstr :5173
netstat -ano | findstr :3001
```

### Clear All Data
```
Admin panel → "🗑️ Clear All Data"
```

---

## ✅ PRE-LAUNCH CHECKLIST

- [ ] Servers start successfully
- [ ] Products display correctly
- [ ] Orders can be created
- [ ] Admin panel accessible
- [ ] Images load properly
- [ ] Prices are correct
- [ ] Stock levels set
- [ ] Payment configured
- [ ] Shipping options set
- [ ] Email notifications work

---

## 🎉 SUCCESS METRICS

**Track these daily:**
- Revenue & profit
- Order count
- Conversion rate
- Average order value
- Customer retention
- Inventory turnover

---

## 📚 LEARN MORE

**Full Guides:**
- `COMPLETE-SYSTEM-GUIDE.md`
- `STARTUP-GUIDE.md`
- `SYSTEM-IMPROVEMENTS-COMPLETE.md`

**Video Tutorials:**
- Check `docs/` folder
- Watch demo videos
- Follow step-by-step guides

---

## 🚀 YOU'RE READY!

**Everything you need to run your e-commerce business:**

✅ Professional admin panel
✅ Real-time analytics
✅ Order management
✅ Product management
✅ User system
✅ Loyalty points
✅ One-click deployment

**Start selling today!** 🎊

---

**Keep this card handy for quick reference!**
