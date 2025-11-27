# ✅ Sync & Deploy - FIXED for Port 5173!

## What Changed

The sync & deploy system now works with your main dashboard on port 5173!

### Before (Broken)
- Admin panel tried to connect to `http://localhost:3001`
- CORS errors and connection issues
- Required separate admin server

### After (Fixed)
- Uses Vite proxy: `/api/*` → `http://localhost:3001/*`
- No CORS issues
- Works seamlessly with main dashboard

## How It Works Now

```
Browser (port 5173)
    ↓
Request: /api/sync-deploy
    ↓
Vite Proxy (automatic)
    ↓
Admin Server (port 3001)
    ↓
Git Operations
    ↓
GitHub & Vercel
```

## Setup (One Time)

### 1. Start BOTH Servers

You need both servers running:

```bash
# Terminal 1: Main dashboard (Vite)
npm run dev

# Terminal 2: Admin server (API backend)
npm run admin
```

### 2. Open Main Dashboard

```
http://localhost:5173
```

### 3. Navigate to Admin Panel

In your app, go to the admin section (wherever it's located in your UI)

### 4. Click "Sync & Deploy"

Should work perfectly now! ✅

## Quick Start Script

I'll create a batch file to start both servers:

**START-BOTH-SERVERS.bat**
```batch
start cmd /k "npm run dev"
timeout /t 2
start cmd /k "npm run admin"
```

## Files Modified

1. **vite.config.ts** - Added proxy configuration
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3001',
       changeOrigin: true,
       rewrite: (path) => path.replace(/^\/api/, '')
     }
   }
   ```

2. **admin-panel/sync-deploy.js** - Changed to use relative URLs
   - `http://localhost:3001/sync-deploy` → `/api/sync-deploy`
   - `http://localhost:3001/save-products` → `/api/save-products`

## Testing

### Test 1: Check Servers Running

```bash
# Check Vite (main dashboard)
curl http://localhost:5173

# Check admin server
curl http://localhost:3001/load-products
```

Both should respond!

### Test 2: Test Proxy

Open browser console on http://localhost:5173 and run:

```javascript
fetch('/api/load-products')
  .then(r => r.json())
  .then(d => console.log('✅ Proxy works!', d))
  .catch(e => console.error('❌ Proxy failed:', e));
```

Should log products data!

### Test 3: Test Deployment

1. Open http://localhost:5173
2. Go to admin panel
3. Click "Sync & Deploy"
4. Should show success! ✅

## Troubleshooting

### Error: "Cannot connect to admin server"

**Problem**: Admin server (port 3001) not running

**Fix**:
```bash
npm run admin
```

### Error: "404 Not Found"

**Problem**: Vite dev server not running

**Fix**:
```bash
npm run dev
```

### Error: "Proxy error"

**Problem**: Vite config not loaded

**Fix**: Restart Vite dev server
```bash
# Stop with Ctrl+C, then:
npm run dev
```

## Port Summary

- **5173** - Main dashboard (Vite) - Your primary URL
- **3001** - Admin API server (backend only)

You only access **port 5173** in your browser!

## Benefits

✅ No CORS issues
✅ Single port for users (5173)
✅ Clean API routes (/api/*)
✅ Works with existing setup
✅ No code changes needed in admin panel HTML

## Next Steps

1. **Restart both servers** (if running)
2. **Open** http://localhost:5173
3. **Navigate** to admin panel in your app
4. **Click** "Sync & Deploy"
5. **Success!** 🎉

---

**Remember**: Always run BOTH servers:
- `npm run dev` (port 5173)
- `npm run admin` (port 3001)

The Vite proxy handles the connection automatically!
