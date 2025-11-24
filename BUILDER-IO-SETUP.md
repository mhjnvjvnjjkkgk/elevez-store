# 🎨 Builder.io Integration Guide

## What is Builder.io?

Builder.io is a **visual CMS** that provides:
- ✅ True drag-and-drop visual editing
- ✅ Works with React/any framework
- ✅ Free tier (50,000 API calls/month)
- ✅ No CORS issues
- ✅ Cloud-hosted editor
- ✅ Real-time preview

## Setup Steps

### 1. Create Free Builder.io Account

1. Go to: https://www.builder.io/signup
2. Sign up with email (free forever)
3. Create a new space (e.g., "ELEVEZ Store")
4. Copy your **API Key** (looks like: `abc123def456...`)

### 2. Add Builder.io to Your Project

Add this to your `App.tsx`:

```tsx
import { builder, BuilderComponent } from '@builder.io/react';

// Initialize Builder
builder.init('YOUR_API_KEY_HERE'); // Replace with your actual API key

function App() {
  return (
    <div>
      {/* Your existing content */}
      <BuilderComponent model="page" />
    </div>
  );
}
```

### 3. Install Builder.io SDK

```bash
npm install @builder.io/react
```

If installation fails (native dependencies), use CDN instead:

```html
<!-- Add to index.html -->
<script src="https://cdn.builder.io/js/webcomponents"></script>
```

### 4. Access Visual Editor

1. Go to: https://builder.io/content
2. Click "New" → "Page"
3. You'll see your live website
4. Click any element to edit
5. Drag & drop new components
6. Publish when ready

## How It Works

```
┌─────────────────────────────────────────────┐
│  Builder.io Cloud Editor                    │
│  (Visual drag & drop interface)             │
└─────────────────┬───────────────────────────┘
                  │
                  ↓ API
┌─────────────────────────────────────────────┐
│  Your Website (React)                       │
│  - Fetches content from Builder.io          │
│  - Renders components                       │
│  - Updates in real-time                     │
└─────────────────────────────────────────────┘
```

## Features You Get

### Visual Editing:
- ✅ Click any element to edit
- ✅ Drag & drop components
- ✅ Real-time preview
- ✅ Mobile/tablet views
- ✅ Undo/redo

### Components:
- ✅ Text, images, buttons
- ✅ Sections, columns
- ✅ Forms, videos
- ✅ Custom React components

### Publishing:
- ✅ One-click publish
- ✅ Scheduling
- ✅ A/B testing
- ✅ Targeting rules

## Free Tier Limits

- ✅ 50,000 API calls/month
- ✅ Unlimited pages
- ✅ Unlimited users
- ✅ All core features
- ⚠️ Builder.io branding
- ⚠️ No custom domains

## Alternative: Use Builder.io Hosted

If you don't want to integrate code:

1. Create pages in Builder.io
2. Embed them in your site with iframe:

```html
<iframe 
  src="https://cdn.builder.io/api/v1/html/page?apiKey=YOUR_KEY&url=/home"
  width="100%"
  height="100%"
  frameborder="0">
</iframe>
```

## Comparison: Custom vs Builder.io

| Feature | Custom Editor | Builder.io |
|---------|--------------|------------|
| Visual editing | ❌ Hard | ✅ Built-in |
| Drag & drop | ❌ Complex | ✅ Native |
| Setup time | 🕐 Days | ⚡ Minutes |
| Maintenance | 🔧 You | ✅ Them |
| Cost | Free | Free tier |
| Learning curve | Steep | Easy |

## Recommended Approach

**For your use case, I recommend:**

1. **Use Builder.io for landing pages** - Hero, about, marketing pages
2. **Keep your product system** - Your existing admin panel for products
3. **Hybrid approach** - Best of both worlds

This way:
- ✅ Visual editing for content pages
- ✅ Your custom admin for products/orders
- ✅ No code changes needed
- ✅ Works immediately

## Quick Start (No Code)

1. Sign up: https://www.builder.io/signup
2. Create a page in Builder.io editor
3. Get the embed code
4. Add to your website
5. Done! ✨

## Need Help?

- Builder.io Docs: https://www.builder.io/c/docs
- Video Tutorials: https://www.builder.io/c/docs/videos
- Community: https://forum.builder.io

---

**Bottom Line:** Builder.io solves the visual editing problem professionally. It's free, works immediately, and requires minimal setup.
