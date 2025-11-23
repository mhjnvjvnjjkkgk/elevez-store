# 🚀 Start Servers Manually - Simple Guide

## ⚡ Quick Start (2 Terminals)

### **Terminal 1: Website**
```bash
npm run dev
```
Wait for: `Local: http://localhost:5173`

### **Terminal 2: Admin Server**
```bash
node scripts/admin-server.js
```
Wait for: `Server: http://localhost:3001`

### **Open Admin Panel**
Double-click: `admin-panel/index.html`

---

## 📋 Step-by-Step

### **1. Open First Terminal**
- Open Command Prompt or PowerShell
- Navigate to your project folder:
  ```bash
  cd "D:\1\wbeiste\elevez (1)"
  ```
- Start website:
  ```bash
  npm run dev
  ```
- **Keep this terminal open!**

### **2. Open Second Terminal**
- Open another Command Prompt/PowerShell
- Navigate to project folder:
  ```bash
  cd "D:\1\wbeiste\elevez (1)"
  ```
- Start admin server:
  ```bash
  node scripts/admin-server.js
  ```
- **Keep this terminal open!**

### **3. Open Admin Panel**
- Go to your project folder
- Double-click `admin-panel/index.html`
- Or open in browser: `file:///D:/1/wbeiste/elevez%20(1)/admin-panel/index.html`

---

## ✅ Verify Everything Works

### **Website (http://localhost:5173)**
- Should load your store
- Products should appear
- Can add to cart

### **Admin Server (http://localhost:3001)**
- Terminal shows: `🚀 Admin Server Running!`
- Shows: `📡 Server: http://localhost:3001`

### **Admin Panel**
- Opens in browser
- Shows products
- Can add/edit products
- "Sync & Deploy" button works

---

## 🐛 Troubleshooting

### **"Port already in use" error?**

**For Website (5173):**
```bash
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

**For Admin Server (3001):**
```bash
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### **"Cannot find module" error?**

Make sure you're in the project directory:
```bash
# Check current directory
cd

# Should show something like:
# D:\1\wbeiste\elevez (1)

# If not, navigate to project:
cd "D:\1\wbeiste\elevez (1)"
```

### **npm command not found?**

Install Node.js from: https://nodejs.org/

---

## 🎯 Quick Commands

### **Stop Servers**
Press `Ctrl+C` in each terminal

### **Restart Servers**
1. Stop both (Ctrl+C)
2. Run commands again:
   - Terminal 1: `npm run dev`
   - Terminal 2: `node scripts/admin-server.js`

### **Check if Running**
```bash
# Check website
curl http://localhost:5173

# Check admin server
curl http://localhost:3001
```

---

## 💡 Pro Tips

### **Use Windows Terminal**
- Install from Microsoft Store
- Can have multiple tabs
- Easier to manage

### **Create Shortcuts**
Create `.bat` files for each:

**start-website.bat:**
```bat
@echo off
cd /d "D:\1\wbeiste\elevez (1)"
npm run dev
pause
```

**start-admin.bat:**
```bat
@echo off
cd /d "D:\1\wbeiste\elevez (1)"
node scripts\admin-server.js
pause
```

### **Keep Terminals Open**
- Don't close terminal windows
- Minimize them instead
- Servers need to keep running

---

## ✨ Summary

**Two terminals needed:**
1. `npm run dev` - Website (5173)
2. `node scripts/admin-server.js` - Admin server (3001)

**Then open:**
- Admin panel: `admin-panel/index.html`

**That's it!** 🎉
