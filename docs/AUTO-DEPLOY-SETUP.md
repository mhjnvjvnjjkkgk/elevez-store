# 🚀 Auto-Deploy Setup Guide

Your project is now configured for automatic deployment!

## What Happens Automatically

Every time you save a `.tsx`, `.ts`, `.jsx`, `.js`, `.css`, or `.html` file:

1. ✅ **Git Commit** - Changes are automatically committed to Git
2. ✅ **GitHub Push** - Commits are pushed to your GitHub repository
3. ✅ **Build** - Project is built using `npm run build`
4. ✅ **Vercel Deploy** - Built files are deployed to Vercel (production)

## How It Works

The Kiro hook (`.kiro/hooks/auto-deploy.json`) monitors file saves and triggers the `auto-deploy.ps1` script after a 10-second debounce period.

## Manual Deployment

If you want to deploy manually at any time:

### Option 1: PowerShell Script
```powershell
.\auto-deploy.ps1
```

### Option 2: Batch File (Double-click)
```
auto-deploy.bat
```

### Option 3: Individual Commands
```bash
# Commit and push to GitHub
git add .
git commit -m "Your commit message"
git push origin main

# Build and deploy to Vercel
npm run build
vercel --prod --yes
```

## Disabling Auto-Deploy

If you want to disable automatic deployment:

1. Open Command Palette (Ctrl+Shift+P)
2. Search for "Open Kiro Hook UI"
3. Toggle off the "Auto Deploy - Git + Vercel" hook

Or edit `.kiro/hooks/auto-deploy.json` and set `"enabled": false`

## Troubleshooting

### Vercel CLI Not Found
```bash
npm install -g vercel
vercel login
```

### Git Push Fails
Make sure you have:
- Set up your GitHub repository
- Configured Git credentials
- Have push access to the repository

### Build Fails
Check the console output for specific errors. Common issues:
- TypeScript errors
- Missing dependencies
- Syntax errors

## Current Status

✅ Vercel CLI: Installed (v48.10.7)
✅ Vercel Login: Logged in as lolislolpp-6366
✅ Project Linked: Yes
✅ Auto-Deploy Hook: Enabled

## Your Deployment URLs

- **GitHub**: Check your repository for the latest commits
- **Vercel**: Your production URL will be shown after each deployment
- **Local Dev**: http://localhost:3000/

---

**Note**: The auto-deploy has a 10-second debounce, so if you save multiple files quickly, it will only deploy once after you stop making changes.
