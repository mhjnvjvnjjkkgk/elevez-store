# Deployment Guide for Elevez Store

## Firebase Hosting Deployment

This project is configured for Firebase Hosting. Follow these steps to deploy:

### Prerequisites
1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

### Deployment Steps

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

### Alternative: Vercel Deployment

If you prefer Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the build command to: `npm run build`
4. Set the output directory to: `dist`

## Environment Variables

Make sure to set the following environment variables in your hosting platform:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID

## Notes

- The site will be built to the `dist` folder
- Firebase Hosting configuration is in `firebase.json`
- The site uses client-side routing, so all routes redirect to index.html