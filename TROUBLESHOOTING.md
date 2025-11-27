# Troubleshooting Guide

## Sync & Deploy Issues

### "Deployment Failed" Error

**Cause**: Admin API server not running

**Fix**:
1. Close all terminals
2. Run START-SIMPLE.bat
3. Wait for both servers to start
4. Try again

### "Cannot Connect" Error

**Cause**: Wrong URL or servers not running

**Fix**:
1. Make sure you're on http://localhost:5173 (NOT file:///)
2. Check both servers are running (2 terminal windows)
3. Restart with START-SIMPLE.bat

## Server Issues

### Port Already in Use

**Fix**:
```bash
npx kill-port 5173
npx kill-port 3001
```
Then run START-SIMPLE.bat

### Server Won't Start

**Fix**:
```bash
npm install
```
Then run START-SIMPLE.bat

## General Issues

### Changes Not Showing

1. Hard refresh browser (Ctrl + Shift + R)
2. Clear browser cache
3. Check if deployment completed on Vercel

### Products Not Loading

1. Check Firebase connection
2. Verify firebaseConfig.ts has correct credentials
3. Check browser console for errors

## Need More Help?

1. Check browser console (F12) for errors
2. Check server terminal for error messages
3. Restart everything with START-SIMPLE.bat
