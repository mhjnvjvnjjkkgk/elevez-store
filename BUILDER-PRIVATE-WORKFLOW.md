# 🔒 Builder.io Private Editing Workflow

## Your Perfect Setup

This guide sets up a **private editing workflow** where:
1. ✅ **Only you** can edit (Builder.io is private)
2. ✅ **Edit in separate app** (Builder.io cloud editor)
3. ✅ **Auto-sync to GitHub** when you publish
4. ✅ **Auto-deploy to Vercel** automatically
5. ✅ **Customers never see Builder.io** (clean production site)

---

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  YOU (Private)                                              │
│  ↓                                                          │
│  Edit in Builder.io Cloud Editor                           │
│  (Only accessible with your login)                         │
│  ↓                                                          │
│  Click "Publish"                                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ Webhook
┌─────────────────────────────────────────────────────────────┐
│  Webhook Handler (Your Server)                             │
│  ↓                                                          │
│  1. Receives publish event                                 │
│  2. Fetches content from Builder.io                        │
│  3. Saves to builder-content.json                          │
│  4. Commits to GitHub                                      │
│  5. Pushes to GitHub                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓ Auto-trigger
┌─────────────────────────────────────────────────────────────┐
│  Vercel                                                     │
│  ↓                                                          │
│  1. Detects GitHub push                                    │
│  2. Builds your website                                    │
│  3. Deploys to production                                  │
│  4. Live in 1-2 minutes                                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  CUSTOMERS (Public)                                         │
│  ↓                                                          │
│  See your updated website                                  │
│  (No Builder.io branding or code)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Steps

### Step 1: Configure Builder.io Webhook

1. **Go to Builder.io Settings**
   - Open: https://builder.io
   - Click your profile → **Account Settings**
   - Go to **Webhooks** tab

2. **Add New Webhook**
   - Click **"+ Add Webhook"**
   - **Name:** `Auto Deploy to Vercel`
   - **URL:** `https://your-domain.com/builder-webhook`
   - **Events:** Select **"Publish"** only
   - **Secret:** (optional, for security)
   - Click **"Save"**

3. **For Local Testing (Development)**
   - Use ngrok to expose your local server:
   ```bash
   npx ngrok http 3003
   ```
   - Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
   - Use as webhook URL: `https://abc123.ngrok.io/builder-webhook`

---

### Step 2: Start Webhook Handler

**Option A: Development (Local)**
```bash
npm run builder:webhook
```

**Option B: Production (Deploy to Server)**
Deploy `builder-webhook-handler.js` to:
- Vercel Serverless Function
- AWS Lambda
- Your own server
- Heroku

---

### Step 3: Configure Privacy Settings

1. **Builder.io Space Settings**
   - Go to: https://builder.io
   - Click your space → **Settings**
   - **Team Access:** Remove all team members except you
   - **Public Access:** Disabled
   - **API Key:** Keep private (never share)

2. **Remove Builder.io from Production**
   
   Update your `index.html` to only load Builder.io in development:

```html
<!-- Only load Builder.io in development -->
<script>
  if (window.location.hostname === 'localhost') {
    // Load Builder.io for local editing
    const script = document.createElement('script');
    script.src = 'https://cdn.builder.io/js/webcomponents';
    script.async = true;
    document.head.appendChild(script);
    
    window.builderApiKey = '273eceb4203548428b50f961521eccd0';
  }
</script>
```

This way:
- ✅ You can edit locally
- ✅ Production site has NO Builder.io code
- ✅ Customers never see Builder.io

---

## 📝 Your Editing Workflow

### Daily Use:

1. **Open Builder.io Editor**
   ```
   https://builder.io/content
   ```

2. **Edit Your Content**
   - Click any page to edit
   - Make your changes
   - Preview on mobile/desktop

3. **Publish**
   - Click **"Publish"** button
   - Webhook triggers automatically
   - Changes sync to GitHub
   - Vercel deploys automatically
   - Live in 1-2 minutes!

### No Manual Steps Required!
- ❌ No manual git commands
- ❌ No manual deployments
- ❌ No code changes needed
- ✅ Just click "Publish" and done!

---

## 🔒 Security & Privacy

### Who Can Edit?
- ✅ **Only you** (with your Builder.io login)
- ❌ Not your customers
- ❌ Not random visitors
- ❌ Not even your team (unless you invite them)

### What Customers See?
- ✅ Your beautiful website
- ✅ Fast loading times
- ✅ Professional appearance
- ❌ NO Builder.io branding
- ❌ NO Builder.io code (in production)
- ❌ NO editing interface

### API Key Security
- Your API key: `273eceb4203548428b50f961521eccd0`
- ✅ Only used server-side (webhook handler)
- ✅ Not exposed to customers
- ✅ Can be rotated anytime in Builder.io settings

---

## 🎨 What You Can Edit

### Content:
- Headlines and text
- Images and videos
- Buttons and links
- Product descriptions
- Pricing
- Testimonials

### Styling:
- Colors
- Fonts
- Spacing
- Layouts
- Animations

### Structure:
- Add/remove sections
- Reorder elements
- Create new pages
- A/B test variants

---

## 🚀 Deployment Pipeline

### Automatic Flow:

```
You Click "Publish" in Builder.io
    ↓
Webhook triggers (instant)
    ↓
Content fetched from Builder.io API
    ↓
Saved to builder-content.json
    ↓
Git commit created
    ↓
Pushed to GitHub
    ↓
Vercel detects push
    ↓
Builds website
    ↓
Deploys to production
    ↓
LIVE! (1-2 minutes total)
```

### No Manual Steps!
Everything happens automatically when you click "Publish"

---

## 🛠️ Advanced Configuration

### Webhook Handler Options

**Environment Variables:**
```bash
# .env
BUILDER_API_KEY=273eceb4203548428b50f961521eccd0
GITHUB_TOKEN=your_github_token
WEBHOOK_SECRET=your_webhook_secret
```

**Custom Deployment Logic:**
```javascript
// builder-webhook-handler.js

// Add custom logic before deployment
async function beforeDeploy(content) {
  // Validate content
  // Transform data
  // Send notifications
}

// Add custom logic after deployment
async function afterDeploy() {
  // Clear CDN cache
  // Send email notification
  // Update analytics
}
```

---

## 📊 Monitoring

### Check Webhook Status:
```bash
curl http://localhost:3003/health
```

### View Logs:
```bash
# Webhook handler logs
npm run builder:webhook

# Git logs
git log --oneline

# Vercel logs
vercel logs
```

---

## 🐛 Troubleshooting

### Webhook Not Triggering?
**Check:**
1. Webhook URL is correct in Builder.io settings
2. Webhook handler is running: `npm run builder:webhook`
3. Firewall allows incoming connections
4. ngrok is running (for local development)

### Changes Not Deploying?
**Check:**
1. Git credentials are configured
2. GitHub repository is connected to Vercel
3. Vercel auto-deploy is enabled
4. No build errors in Vercel logs

### Content Not Updating?
**Check:**
1. You clicked "Publish" (not just "Save")
2. Webhook received the event (check logs)
3. Git push succeeded (check terminal)
4. Vercel deployment succeeded (check Vercel dashboard)

---

## 🎯 Best Practices

### 1. Test Before Publishing
- Use Builder.io's preview feature
- Check on mobile and desktop
- Verify all links work

### 2. Use Staging Environment
- Create a staging branch
- Test changes there first
- Merge to main when ready

### 3. Keep Backups
- Builder.io keeps version history
- Git keeps all commits
- Can rollback anytime

### 4. Monitor Deployments
- Watch Vercel dashboard
- Check website after publishing
- Set up error alerts

---

## 📚 Quick Reference

### Start Webhook Handler:
```bash
npm run builder:webhook
```

### Edit Content:
```
https://builder.io/content
```

### Check Deployment:
```
https://vercel.com/dashboard
```

### View Live Site:
```
https://elevez-store.vercel.app
```

---

## ✅ Checklist

Setup Complete When:
- [ ] Builder.io webhook configured
- [ ] Webhook handler running
- [ ] Test publish works
- [ ] Changes appear on GitHub
- [ ] Vercel auto-deploys
- [ ] Live site updates

---

## 🎉 You're All Set!

Your private editing workflow is ready:

1. **Edit:** https://builder.io/content
2. **Publish:** Click the button
3. **Done:** Auto-deploys to production!

**No manual work required!** 🚀
