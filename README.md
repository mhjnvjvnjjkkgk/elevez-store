<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Elevez - Modern E-commerce Website

This is a modern e-commerce website built with React, TypeScript, and Vite.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Integration

This project includes Firebase integration for saving order data. To set up Firebase:

1. Run the setup helper: `npm run firebase:setup`
2. Follow the instructions to configure your Firebase project
3. Update your [.env](file:///d:/wbeiste/elevez%20(1)/.env) file with your Firebase configuration
4. Enable Firestore Database in your Firebase project

## Deployment Instructions

### Option 1: Firebase Hosting (Recommended - Free)

Follow these steps to deploy to Firebase Hosting:

1. **Temporarily Change PowerShell Execution Policy**:
   - Open PowerShell as Administrator
   - Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
   - Press 'Y' and Enter to confirm

2. **Install Firebase CLI Globally**:
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**:
   ```bash
   firebase login
   ```

4. **Initialize Firebase in Your Project**:
   ```bash
   firebase init hosting
   ```
   When prompted:
   - Public directory: `dist`
   - Configure as a single-page app: `Yes`
   - Set up automatic builds and deploys with GitHub: `No`

5. **Deploy Your App**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

6. **Revert PowerShell Execution Policy (Optional)**:
   After deployment, you can revert the execution policy:
   ```bash
   Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope CurrentUser
   ```

Alternatively, you can:
- Double-click on `firebase-deploy.ps1` in your project folder
- Follow the on-screen instructions

For detailed instructions, check the [FIREBASE_DEPLOY.md](FIREBASE_DEPLOY.md) file.

### Option 2: Vercel (Alternative - Free)

1. Push your code to a GitHub repository
2. Go to https://vercel.com/ and sign up/sign in
3. Click "New Project" and import your GitHub repository
4. Vercel will automatically detect it as a Vite project
5. Add your environment variables in the Vercel dashboard
6. Click "Deploy" and your site will be live!

### Option 3: GitHub Pages (Alternative - Free)

This project includes a GitHub Actions workflow for automatic deployment to GitHub Pages:
1. Push your code to a GitHub repository
2. Go to your repository settings
3. Under "Pages", select "GitHub Actions" as the source
4. The site will automatically deploy on every push to main/master

### Custom Domain Setup

After deploying to any platform, you can set up a custom domain:
1. Purchase a domain from a registrar (Namecheap, Google Domains, etc.)
2. In your hosting platform's dashboard, look for "Custom Domain" settings
3. Add your domain and follow the provided instructions
4. Update your DNS records with your domain registrar as instructed

### 4. Order Data Storage

All orders are automatically saved to your Firebase Firestore database:
- Collection: `orders`
- Each order contains customer information, items, and payment details
- Orders are timestamped and given a unique ID

After deployment, customer orders will be persistently stored in your Firebase database.