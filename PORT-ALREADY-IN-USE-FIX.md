# 🔧 Port Already in Use - Quick Fix

## ❌ Error: EADDRINUSE: address already in use :::3001

This means a server is already running on port 3001.

---

## ✅ Quick Fix - Use New Script

I created a script that automatically kills old servers and starts fresh:

### **Option 1: Double-click this file**
```
KILL-AND-RESTART.bat
```

### **Option 2: Run in PowerShell**
```powershell
.\kill-and-restart.ps1
```

---

## 🔧 Manual Fix (If Scripts Don't Work)

### **Method 1: Task Manager**
1. Press `Ctrl+Shift+Esc` to open Task Manager
2. Find "Node.js" processes
3. Right-click → End Task
4. Close all Node.js processes
5. Run `START-ALL-SERVERS.bat` again

### **Method 2: Command Line**
```bash
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Then start servers
START-ALL-SERVERS.bat
```

### **Method 3: PowerShell (Easiest)**
```powershell
# Kill all Node processes
Get-Process node | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Start servers
.\START-ALL-SERVERS.bat
```

---

## 🚀 Recommended: Use KILL-AND-RESTART.bat

This script:
- ✅ Automatically finds and kills old servers
- ✅ Waits for ports to be free
- ✅ Starts fresh servers
- ✅ Opens in separate windows
- ✅ No manual work needed

**Just double-click:** `KILL-AND-RESTART.bat`

---

## 🎯 What Each Port Does

| Port | Service | URL |
|------|---------|-----|
| 3001 | Admin Server | http://localhost:3001 |
| 5173 | Website | http://localhost:5173 |
| 3000 | Admin Panel | http://localhost:3000 |

---

## 💡 Prevent This Issue

### **Always close servers properly:**
- Press `Ctrl+C` in terminal windows
- Or close terminal windows
- Or use `KILL-AND-RESTART.bat` to clean up

### **If you see the error:**
- Don't panic!
- Just run `KILL-AND-RESTART.bat`
- Everything will restart fresh

---

## ✨ Summary

**Quick Fix:**
1. Double-click `KILL-AND-RESTART.bat`
2. Wait for servers to start
3. Done!

**Manual Fix:**
1. Open Task Manager
2. End all Node.js processes
3. Run `START-ALL-SERVERS.bat`

**Use the new script - it's automatic!** 🎉
