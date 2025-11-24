# 🎨 Builder.io Setup - Complete Step-by-Step Guide

## Step 1: Create Your Free Account

### 1.1 Go to Builder.io
Visit: **https://www.builder.io/signup**

### 1.2 Sign Up
You'll see a signup form with options:
- **Email + Password** (recommended)
- Sign up with Google
- Sign up with GitHub

Choose any method - all are free forever.

### 1.3 Verify Email
Check your email and click the verification link.

---

## Step 2: Create Your Space

### 2.1 After Login
You'll see a welcome screen asking: **"What would you like to build?"**

### 2.2 Choose Space Type
Select: **"Website or Web App"**

This is the right choice for your ELEVEZ e-commerce store.

### 2.3 Name Your Space
Enter a name like:
- `ELEVEZ Store`
- `ELEVEZ Website`
- `My Store`

Click **"Create Space"**

---

## Step 3: Get Your API Key

### 3.1 You'll See Your Dashboard
After creating the space, you'll land on the main dashboard.

### 3.2 Find Your API Key
Look for a section that says **"Public API Key"** or **"Space Settings"**

**Two ways to find it:**

#### Method A: From Dashboard
- Look at the top right corner
- Click on your space name dropdown
- Select **"Space Settings"**
- You'll see: **"Public API Key"**

#### Method B: From Account Settings
- Click your profile icon (top right)
- Select **"Account Settings"**
- Go to **"Spaces"** tab
- Click on your space
- Copy the **"Public API Key"**

### 3.3 Copy Your API Key
It looks like this:
```
abc123def456ghi789jkl012mno345pqr678
```

**Save this somewhere safe!** You'll need it in the next step.

---

## Step 4: Add Builder.io to Your Website

### Option A: Simple Integration (Recommended for Testing)

Add this to your `index.html` (inside the `<head>` tag):

```html
<script>
  !function(e,t,n,s,a,c,i,o,p){e.BuilderFunctions=a,e[a]=e[a]||function(){(e[a].q=e[a].q||[]).push(arguments)},e[a].l=1*new Date,c=t.createElement(n),i=t.getElementsByTagName(n)[0],c.async=1,c.src=s,i.parentNode.insertBefore(c,i)}(window,document,"script","https://cdn.builder.io/js/webcomponents");
  
  // Replace with YOUR API key
  builder.init('YOUR_API_KEY_HERE');
</script>
```

### Option B: React Integration (For Production)

1. Install the package:
```bash
npm install @builder.io/react
```

2. Update your `App.tsx`:
```tsx
import { builder, BuilderComponent } from '@builder.io/react';

// Initialize with your API key
builder.init('YOUR_API_KEY_HERE');

function App() {
  return (
    <div>
      {/* Your existing content */}
      
      {/* Builder.io content */}
      <BuilderComponent model="page" />
    </div>
  );
}
```

---

## Step 5: Start Editing Visually

### 5.1 Go to Content
In Builder.io dashboard, click **"Content"** in the left sidebar.

### 5.2 Create New Page
Click the **"+ New"** button (top right)

Select: **"Page"**

### 5.3 Enter Your Website URL
You'll be asked: **"What URL do you want to edit?"**

Enter: `http://localhost:5173/`

(Or your deployed URL: `https://elevez-store.vercel.app/`)

### 5.4 Start Editing!
You'll now see your website in the Builder.io visual editor!

**What you can do:**
- ✅ Click any element to edit text
- ✅ Drag & drop new components from the left panel
- ✅ Change colors, fonts, spacing
- ✅ Add images, buttons, sections
- ✅ Preview on mobile/tablet
- ✅ Publish when ready

---

## Step 6: Publish Your Changes

### 6.1 Click "Publish"
Top right corner - big green button

### 6.2 Your Changes Go Live
Changes appear on your website immediately!

---

## What Each Space Type Means

When creating a space, you might see these options:

| Space Type | Best For | Your Choice |
|------------|----------|-------------|
| **Website or Web App** | E-commerce stores, marketing sites | ✅ **Choose This** |
| Mobile App | Native iOS/Android apps | ❌ Not needed |
| Email | Email templates | ❌ Not needed |
| AMP | Accelerated Mobile Pages | ❌ Not needed |

**For ELEVEZ, choose: "Website or Web App"**

---

## Where to Find Everything

### Dashboard Layout:
```
┌─────────────────────────────────────────────┐
│  Builder.io                    [Profile] ▼  │
├─────────────────────────────────────────────┤
│                                             │
│  Sidebar:                Main Area:         │
│  ├─ 📊 Dashboard         Your content here  │
│  ├─ 📝 Content                              │
│  ├─ 🎨 Models                               │
│  ├─ 👥 Team                                 │
│  └─ ⚙️ Settings                             │
│                                             │
└─────────────────────────────────────────────┘
```

### Where to Find API Key:
1. Click **Profile Icon** (top right)
2. Select **"Account Settings"**
3. Go to **"Spaces"** tab
4. Click your space name
5. Copy **"Public API Key"**

---

## Quick Reference

### Your API Key Location:
```
Profile Icon → Account Settings → Spaces → [Your Space] → Public API Key
```

### Create New Page:
```
Content → + New → Page → Enter URL → Start Editing
```

### Publish Changes:
```
Edit your page → Click "Publish" (top right) → Done!
```

---

## Free Tier Limits

What you get for **FREE forever**:

✅ **50,000 API calls/month** (plenty for most sites)
✅ **Unlimited pages**
✅ **Unlimited team members**
✅ **All core features**
✅ **Visual editor**
✅ **A/B testing**
✅ **Scheduling**
✅ **Analytics**

What you DON'T get:
⚠️ Custom domains (use builder.io subdomain)
⚠️ White-label (has Builder.io branding)
⚠️ Advanced integrations

**For your needs, the free tier is perfect!**

---

## Troubleshooting

### "Can't find my API key"
**Solution:** 
1. Click profile icon (top right)
2. Account Settings → Spaces
3. Click your space name
4. Copy "Public API Key"

### "My website doesn't load in the editor"
**Solution:**
- Make sure your dev server is running: `npm run dev`
- Use `http://localhost:5173/` as the URL
- Or use your deployed URL: `https://elevez-store.vercel.app/`

### "Changes don't appear on my site"
**Solution:**
- Make sure you added the Builder.io script to your `index.html`
- Make sure you used the correct API key
- Clear your browser cache

### "I see 'Invalid API key'"
**Solution:**
- Double-check you copied the entire API key
- Make sure there are no extra spaces
- The key should be about 32-40 characters long

---

## Next Steps

### After Setup:

1. **Create your homepage**
   - Content → + New → Page
   - URL: `/`
   - Design your hero section

2. **Add more pages**
   - About page: `/about`
   - Contact page: `/contact`
   - Landing pages: `/sale`, `/new-arrivals`

3. **Customize components**
   - Add your brand colors
   - Upload your logo
   - Add product sections

4. **Publish and test**
   - Preview on mobile
   - Test all links
   - Publish when ready

---

## Video Tutorial

Builder.io has excellent video tutorials:

📺 **Getting Started:** https://www.builder.io/c/docs/videos
📺 **React Integration:** https://www.builder.io/c/docs/integrations/react
📺 **Visual Editor Tour:** https://www.builder.io/c/docs/visual-editor

---

## Support

Need help?

- 📚 **Docs:** https://www.builder.io/c/docs
- 💬 **Forum:** https://forum.builder.io
- 📧 **Email:** support@builder.io
- 💬 **Discord:** https://discord.gg/builder-io

---

## Summary

### What You Need:

1. ✅ **Space Type:** "Website or Web App"
2. ✅ **API Key Location:** Profile → Account Settings → Spaces → Your Space → Public API Key
3. ✅ **Integration:** Add script to `index.html` with your API key
4. ✅ **Start Editing:** Content → + New → Page → Enter URL

### Time Required:
- ⏱️ **Signup:** 2 minutes
- ⏱️ **Get API key:** 1 minute
- ⏱️ **Add to website:** 2 minutes
- ⏱️ **Start editing:** Immediately!

**Total: 5 minutes to visual editing! 🚀**

---

## Your Next Action

1. Go to: **https://www.builder.io/signup**
2. Create account (2 min)
3. Choose: **"Website or Web App"**
4. Name it: **"ELEVEZ Store"**
5. Copy your **Public API Key**
6. Come back here and I'll help you integrate it!

**Ready? Let's do this! 🎨**
