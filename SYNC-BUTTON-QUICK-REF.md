# 🚀 Sync & Deploy Button - Quick Reference

## Location
**Admin Panel Sidebar** → Bottom Left → "🔄 Sync & Deploy"

## What It Does
1. Saves all products, collections, orders
2. Commits changes to Git
3. Pushes to GitHub
4. Triggers Vercel deployment
5. Updates live site in 1-2 minutes

## How to Use
```
1. Make changes in admin panel
2. Click "Sync & Deploy" button
3. Wait for green success notification
4. Check live site in 2 minutes
```

## Button States
- **Ready**: "🔄 Sync & Deploy"
- **Working**: "🔄 Deploying..." (spinning)
- **Done**: Returns to ready state

## Success Signs
✅ Green notification appears (top right)
✅ Server console shows "DEPLOYMENT COMPLETE"
✅ GitHub shows new commit
✅ Vercel dashboard shows "Building"

## Timing
- Click → 0 seconds
- Git operations → 5 seconds
- GitHub push → 10 seconds
- Vercel build → 60-90 seconds
- **Total: ~2 minutes to live**

## Links in Notification
- View on GitHub
- Vercel Dashboard

## When to Use
- After adding products
- After editing products
- After creating collections
- After updating sections
- After setting discounts
- Anytime you want changes live!

## Troubleshooting
**Button not working?**
- Refresh page
- Check server is running (npm run admin)

**Git error?**
- Check server console
- Verify Git is configured

**Vercel not deploying?**
- Check Vercel dashboard
- Verify GitHub integration

## Pro Tip
Make multiple changes, then deploy once!

---
**That's it!** Click and deploy. Simple as that. 🎉
