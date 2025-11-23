# 🔌 ELEVEZ Port Guide

## Correct Ports

### ✅ Port 5173 - Main Website
- **What**: Your ELEVEZ e-commerce website
- **How to start**: `npm run dev` or `START-ALL-SERVERS.bat`
- **URL**: http://localhost:5173
- **Shows**: Products, collections, shopping cart

### ✅ Port 3001 - Admin Server
- **What**: Backend server for admin panel
- **How to start**: `node scripts\admin-server.js` or `START-ALL-SERVERS.bat`
- **URL**: http://localhost:3001 (API only)
- **Does**: Image uploads, product sync, backups

### ✅ Port 3002 - Hot-Reload Server
- **What**: WebSocket server for auto-refresh
- **How to start**: Auto-starts with admin server
- **URL**: ws://localhost:3002 (WebSocket)
- **Does**: Reloads admin panel when files change

---

## ⚠️ Port 3000 - OLD CONFIG (FIXED)

**FIXED**: Vite was configured to use port 3000, now changed to 5173.

If you still see port 3000:
1. Close all servers
2. Run `FIX-EVERYTHING.bat`
3. Website will now be on port 5173

**Solution**: Use port 5173 from now on.

---

## 🔍 Check What's Running

Run this to see all ports:
```bash
check-ports.bat
```

Or manually:
```bash
netstat -ano | findstr :5173
netstat -ano | findstr :3001
netstat -ano | findstr :3000
```

---

## 🚀 Start Everything

### Option 1: Use Batch File (Recommended)
```bash
START-ALL-SERVERS.bat
```

### Option 2: Manual Start
```bash
# Terminal 1 - Website
npm run dev

# Terminal 2 - Admin Server
node scripts\admin-server.js

# Terminal 3 - Auto-Deploy (optional)
powershell -ExecutionPolicy Bypass -File scripts\auto-deploy-monitor.ps1
```

---

## 🐛 Troubleshooting

### "localhost:5173 not working"

**Check if it's running:**
```bash
check-ports.bat
```

**If NOT running:**
```bash
START-ALL-SERVERS.bat
```

**If still not working:**
1. Close all terminal windows
2. Run `START-ALL-SERVERS.bat` again
3. Wait 5 seconds for Vite to start
4. Open http://localhost:5173

### "Port 5173 already in use"

**Kill the process:**
```bash
# Find the process
netstat -ano | findstr :5173

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

### "localhost:3000 is running instead"

**This is NOT ELEVEZ!**
- Close whatever is on port 3000
- Start ELEVEZ with `START-ALL-SERVERS.bat`
- Use http://localhost:5173

---

## 📊 Port Summary

| Port | Service | Required | URL |
|------|---------|----------|-----|
| 5173 | Website | ✅ Yes | http://localhost:5173 |
| 3001 | Admin Server | ✅ Yes | http://localhost:3001 |
| 3002 | Hot-Reload | ⚠️ Optional | ws://localhost:3002 |
| 3000 | ❌ Not ELEVEZ | ❌ No | - |
| 8080 | Test Server | ❌ No | - |

---

## ✅ Quick Fix

If nothing is working:

1. **Close all terminals**
2. **Run**: `START-ALL-SERVERS.bat`
3. **Wait 5 seconds**
4. **Open**: http://localhost:5173
5. **Open**: admin-panel\index.html

Done! ✨
