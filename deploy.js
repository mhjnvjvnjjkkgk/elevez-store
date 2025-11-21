#!/usr/bin/env node

console.log(`
🚀 Elevez Store Deployment Options
================================

Choose one of the following deployment methods:

1. Firebase Hosting (Recommended - Free)
   - Run: npm install -g firebase-tools
   - Run: firebase login
   - Run: npm run build
   - Run: firebase init hosting
   - Run: firebase deploy --only hosting

2. Vercel (Alternative - Free)
   - Push your code to GitHub
   - Go to https://vercel.com/
   - Create a new project
   - Connect to your GitHub repository
   - Set build command to: npm run build
   - Set output directory to: dist

3. Netlify (Alternative - Free)
   - Push your code to GitHub
   - Go to https://netlify.com/
   - Create a new site
   - Connect to your GitHub repository
   - Set build command to: npm run build
   - Set publish directory to: dist

For detailed Firebase deployment instructions, check the FIREBASE_DEPLOY.md file.

After deployment, make sure to set these environment variables in your hosting platform:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID

For detailed instructions, check the DEPLOYMENT.md file.
`);