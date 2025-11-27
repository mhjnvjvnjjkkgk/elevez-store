# 🔄 Restart Admin Server - REQUIRED!

## ⚠️ IMPORTANT

The `/sync-deploy` endpoint was just added to the server code.

**You MUST restart the admin server** for the changes to take effect!

## Quick Restart

### Option 1: Kill and Restart (Easiest)

1. **Stop the current server:**
   - Go to the terminal where `npm run admin` is running
   - Press `Ctrl + C` to stop it

2. **Start it again:**
   ```bash
   npm run admin
   ```

3. **Verify it's working:**
   - Open: http://localhost:3001
   - Click "Sync & Deploy"
   - Should work now! ✅

### Option 2: Use Kill Script

```bash
# Kill any process on port 3001
npx kill-port 3001

# Start admin server
npm run admin
```

### Option 3: Batch File

Double-click: `KILL-AND-RESTART.bat`

## How to Verify

After restarting, run this test:

```bash
# Double-click this file:
test-deploy-endpoint.bat
```

Should show: `"success": true` instead of "Not Found"

## Why This is Needed

When you modify `scripts/admin-server.js`, Node.js doesn't automatically reload the changes. You need to:

1. Stop the server (Ctrl + C)
2. Start it again (npm run admin)

This loads the new code with the `/sync-deploy` endpoint.

## Visual Guide

```
OLD SERVER (before restart)
├── /load-products ✅
├── /save-products ✅
├── /update-constants ✅
└── /sync-deploy ❌ (doesn't exist yet)

NEW SERVER (after restart)
├── /load-products ✅
├── /save-products ✅
├── /update-constants ✅
└── /sync-deploy ✅ (now available!)
```

## Step-by-Step

1. **Find the terminal** where admin server is running
2. **Press Ctrl + C** to stop it
3. **Run:** `npm run admin`
4. **Wait for:** "🚀 Admin Server Running!"
5. **Test:** Open http://localhost:3001
6. **Click:** "Sync & Deploy" button
7. **Success!** ✨

## Common Mistakes

❌ **Mistake**: Trying to use the button without restarting
✅ **Fix**: Restart the server first!

❌ **Mistake**: Opening a new terminal and running `npm run admin` again
✅ **Fix**: Stop the old one first (Ctrl + C), then start

❌ **Mistake**: Forgetting which terminal has the server
✅ **Fix**: Look for the one showing "Admin Server Running"

## Quick Test

After restarting, open browser console (F12) and run:

```javascript
fetch('/sync-deploy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ timestamp: 'test', products: 0, collections: 0 })
})
.then(r => r.json())
.then(d => console.log('✅ Works!', d))
.catch(e => console.error('❌ Still broken:', e));
```

Should log: `✅ Works! { success: true, ... }`

## Summary

```bash
# 1. Stop server
Ctrl + C

# 2. Start server
npm run admin

# 3. Test
Open http://localhost:3001
Click "Sync & Deploy"
```

That's it! The endpoint will work after restart. 🚀
