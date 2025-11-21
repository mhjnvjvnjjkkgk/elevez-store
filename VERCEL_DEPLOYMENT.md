
# Manual Vercel Deployment Guide

If the automated scripts don't work, you can deploy manually:

## Prerequisites
1. Create a free account at https://vercel.com/
2. Install Node.js from https://nodejs.org/

## Deployment Steps

1. Open a terminal/command prompt in your project directory
2. Install Vercel CLI globally:
   npm install -g vercel

3. Login to Vercel:
   vercel login

4. Build your project:
   npm run build

5. Deploy to Vercel:
   vercel --prod

## Alternative: GitHub Integration

1. Push your code to a GitHub repository
2. Go to https://vercel.com/
3. Sign in with your GitHub account
4. Click "New Project"
5. Import your GitHub repository
6. Vercel will automatically detect it's a Vite project
7. Click "Deploy"

Your site will be live at a vercel.app subdomain, and you can add a custom domain later.
