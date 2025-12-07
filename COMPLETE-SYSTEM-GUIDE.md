# 🚀 ELEVEZ - Complete System Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Server Architecture](#server-architecture)
3. [Admin Panel Features](#admin-panel-features)
4. [Order Management](#order-management)
5. [Product Management](#product-management)
6. [User System](#user-system)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### **Step 1: Start All Servers**

**Option A: Automatic (Recommended)**
```bash
# Double-click this file:
START-SIMPLE.bat
```

**Option B: Manual**
```bash
# Terminal 1 - Website
npm run dev

# Terminal 2 - Admin Server
node scripts/admin-server.js
```

### **Step 2: Access Your System**

- **Website**: http://localhost:5173
- **Admin Panel**: Open `admin-panel/index.html` in browser
- **Admin API**: http://localhost:3001

### **Step 3: Add Products**

1. Open admin panel
2. Click "Products" tab
3. Click "+ Add Product"
4. Fill in details
5. Click "Save Product"
6. Click "Sync & Deploy"

---

## 🏗️ Server Architecture

### **1. Main Website (Vite + React)**
- **Port**: 5173
- **Technology**: Vite, React, TypeScript
- **Features**:
  - Product catalog
  - Shopping cart
  - User authentication
  - Order tracking
  - Loyalty points system
  - Exit intent popups
  - Wishlist
  - Product comparison

### **2. Admin Server (Express + Node.js)**
- **Port**: 3001
- **Technology**: Express, Node.js
- **Features**:
  - Product management API
  - Order processing
  - User management
  - Deployment automation
  - Real-time sync

### **3. Admin Panel (Static HTML)**
- **File**: `admin-panel/index.html`
- **Technology**: Vanilla JavaScript, HTML, CSS
- **Features**:
  - Dashboard with live metrics
  - Product CRUD operations
  - Order status management
  - User points management
  - Discount management
  - Section management
  - Page builder
  - One-click deployment

---

## 📊 Admin Panel Features

### **Dashboard Tab** 📈

**Real-time Metrics:**
- Total revenue with profit breakdown
- Order statistics (pending, processing, shipped, delivered)
- Product inventory status
- User engagement metrics
- Best-selling products
- Today's performance

**Quick Actions:**
- Add Product
- View Orders
- Sync Products
- Deploy to Production

**Auto-refresh:** Every 30 seconds

### **Products Tab** 📦

**Features:**
- Add/Edit/Delete products
- Image upload with cropping
- Bulk operations
- Search and filter
- Stock management
- Production cost tracking
- Profit calculation

**Product Fields:**
- Name, Description, Price
- Category, Tags
- Image URL
- Stock quantity
- SKU
- Production cost
- Status (active/inactive)

### **Orders Tab** 🛒

**Visual Status Pipeline:**
```
⏳ Pending → ⚙️ Processing → 🚚 Shipped → ✅ Delivered
```

**Features:**
- Click to advance order status
- Real-time profit calculation
- Order details with customer info
- Status history tracking
- Bulk status updates
- Order search and filter
- Automatic notifications

**Order Information:**
- Customer details
- Items ordered
- Total amount
- Profit margin
- Status timeline
- Payment method

### **Collections Tab** 🗂️

**Features:**
- Create product collections
- Assign products to collections
- Enable/disable collections
- Collection analytics
- Automation rules
- Templates

### **Sections Tab** 📑

**Default Sections:**
1. Home
2. Shop
3. Best Sellers
4. New Arrivals
5. Trending
6. Featured

**Features:**
- Assign products to sections
- Enable/disable sections
- Add custom sections
- Product thumbnails preview
- Max products limit per section

### **Discounts Tab** 💰

**Discount Types:**
- Percentage off
- Fixed amount off
- Buy X Get Y
- Free shipping

**Features:**
- Create discount codes
- Set expiration dates
- Usage limits
- Minimum order value
- Category restrictions

### **User Points Tab** ⭐

**Features:**
- View all users
- Adjust points manually
- View points history
- Tier management
- Activity log

**Loyalty Tiers:**
- Bronze (0-999 points)
- Silver (1000-2499 points)
- Gold (2500-4999 points)
- Platinum (5000+ points)

### **Users Management** 👥

**Features:**
- View all registered users
- User details and activity
- Order history per user
- Points management
- Email captures from exit intent

### **Page Builder** 🎨

**Features:**
- Visual page editor
- Drag-and-drop components
- Live preview
- Custom sections
- Responsive design

---

## 📦 Order Management

### **Order Lifecycle**

1. **Pending** ⏳
   - New order received
   - Payment pending
   - Admin notification sent

2. **Processing** ⚙️
   - Payment confirmed
   - Order being prepared
   - Inventory updated

3. **Shipped** 🚚
   - Order dispatched
   - Tracking number assigned
   - Customer notified

4. **Delivered** ✅
   - Order received by customer
   - Points awarded
   - Review request sent

5. **Cancelled** ❌
   - Order cancelled
   - Refund processed
   - Inventory restored

### **Status Management**

**Single Order:**
```javascript
// Click on status in pipeline to advance
orderStatusManager.updateOrderStatus(orderId, 'shipped');
```

**Bulk Update:**
```javascript
// Select multiple orders and update
orderStatusManager.bulkUpdateStatus([id1, id2, id3], 'processing');
```

### **Profit Calculation**

```
Revenue = Order Total
Cost = Sum of (Product Cost × Quantity)
Profit = Revenue - Cost
Margin = (Profit / Revenue) × 100
```

**Automatic Calculation:**
- Calculated on order creation
- Updated when products change
- Displayed in dashboard
- Shown in order details

---

## 🛍️ Product Management

### **Adding Products**

1. Click "+ Add Product"
2. Fill in required fields:
   - Name (required)
   - Price (required)
   - Description
   - Category
   - Image URL
3. Optional fields:
   - Production cost
   - Stock quantity
   - SKU
   - Tags
4. Click "Save Product"
5. Click "Sync & Deploy"

### **Image Management**

**Option 1: External URLs (Recommended)**
```
https://images.unsplash.com/photo-...
https://cdn.example.com/image.jpg
```

**Option 2: Upload**
- Click "Upload Image"
- Select file
- Crop if needed
- Save

**Image Requirements:**
- Format: JPG, PNG, WebP
- Size: Max 5MB
- Dimensions: Min 500×500px

### **Bulk Operations**

**Available Actions:**
- Update prices
- Change categories
- Update stock
- Enable/disable products
- Delete products

**How to Use:**
1. Select products (checkbox)
2. Choose action from dropdown
3. Enter new value
4. Click "Apply"

### **Stock Management**

**Low Stock Alert:**
- Triggers when stock < 10
- Shows in dashboard
- Highlighted in product list

**Out of Stock:**
- Automatically hides from website
- Shows "Out of Stock" badge
- Can still be edited

---

## 👥 User System

### **User Creation**

**Automatic:**
- Exit intent email capture
- Registration form
- Social login
- First purchase

**Manual:**
- Admin panel
- Import from CSV

### **User Data**

```javascript
{
  id: "user_123",
  email: "customer@example.com",
  name: "John Doe",
  points: 1500,
  tier: "silver",
  orders: [],
  createdAt: "2024-01-01",
  lastActive: "2024-01-15"
}
```

### **Points System**

**Earning Points:**
- Purchase: 1 point per $1 spent
- Registration: 100 points
- Email signup: 50 points
- Review: 25 points
- Referral: 200 points

**Tier Multipliers:**
- Bronze: 1x
- Silver: 1.25x
- Gold: 1.5x
- Platinum: 2x

**Redeeming Points:**
- 100 points = $1 discount
- Minimum: 500 points
- Maximum: 50% of order value

---

## 🚀 Deployment

### **One-Click Deployment**

1. Open admin panel
2. Click "Sync & Deploy" button
3. Wait for confirmation
4. Changes live on Vercel

### **Manual Deployment**

**To Vercel:**
```bash
npm run build
vercel --prod
```

**To Firebase:**
```bash
npm run build
firebase deploy
```

### **Deployment Process**

1. **Build**: Compile React app
2. **Sync**: Update constants.ts
3. **Commit**: Git commit changes
4. **Push**: Push to GitHub
5. **Deploy**: Vercel auto-deploys

### **Environment Variables**

Required in `.env`:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_key
```

---

## 🐛 Troubleshooting

### **Servers Won't Start**

**Problem:** Port already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### **Products Not Showing**

**Problem:** Products not syncing

**Solution:**
1. Open admin panel
2. Click "Sync from Website"
3. Refresh browser
4. Check console for errors

### **Orders Not Appearing**

**Problem:** Firebase connection issue

**Solution:**
1. Check `.env` file
2. Verify Firebase config
3. Check browser console
4. Refresh admin panel

### **Images Not Loading**

**Problem:** Invalid image URLs

**Solution:**
1. Use external URLs (Unsplash)
2. Check image URL format
3. Verify CORS settings
4. Re-upload image

### **Deployment Fails**

**Problem:** Build errors

**Solution:**
1. Check console for errors
2. Run `npm run build` locally
3. Fix TypeScript errors
4. Commit and push again

### **Points Not Updating**

**Problem:** Firebase sync issue

**Solution:**
1. Check Firebase rules
2. Verify user authentication
3. Check browser console
4. Refresh page

---

## 📚 Additional Resources

### **Documentation Files**

- `README-START-HERE.md` - Quick start guide
- `START-SERVERS-MANUAL.md` - Manual server setup
- `ORDER-PERSISTENCE-COMPLETE.md` - Order system docs
- `USER-SYSTEM-COMPLETE.md` - User system docs
- `FIREBASE_COMPLETE_GUIDE.md` - Firebase setup

### **Utility Scripts**

- `START-SIMPLE.bat` - Start all servers
- `KILL-AND-RESTART.bat` - Restart servers
- `verify-products.bat` - Check products
- `cleanup-docs.bat` - Clean documentation

### **Admin Tools**

- `add-trial-products.html` - Add sample products
- `fix-all-products.html` - Fix product issues
- `debug-products.html` - Debug products
- `test-firebase.html` - Test Firebase connection

---

## ✨ Best Practices

### **Product Management**
- Use high-quality images
- Write detailed descriptions
- Set accurate stock levels
- Track production costs
- Use consistent categories

### **Order Processing**
- Update status promptly
- Communicate with customers
- Track shipping information
- Monitor profit margins
- Handle cancellations quickly

### **User Engagement**
- Reward loyal customers
- Send personalized offers
- Track user activity
- Respond to feedback
- Build community

### **System Maintenance**
- Regular backups
- Monitor performance
- Update dependencies
- Check error logs
- Test new features

---

## 🎯 Summary

**Your complete e-commerce system includes:**

✅ **Frontend**: React website with shopping cart, user auth, loyalty points
✅ **Backend**: Express API for product/order management
✅ **Admin Panel**: Full-featured dashboard with real-time metrics
✅ **Database**: Firebase for persistent data storage
✅ **Deployment**: One-click deployment to Vercel
✅ **Analytics**: Real-time sales and profit tracking
✅ **User System**: Registration, points, tiers, order history
✅ **Order Management**: Visual pipeline with status tracking

**Start building your business today!** 🚀
