# Firebase Setup Instructions

Since we're facing PowerShell execution policy restrictions, you'll need to follow these manual steps to complete your Firebase setup:

## Step 1: Login to Firebase

Open a new PowerShell or Command Prompt window (outside of this IDE) and run:

```bash
firebase login
```

This will open a browser window where you can sign in to your Google account and grant Firebase CLI access.

## Step 2: Initialize Firebase in Your Project

After logging in, navigate to your project directory and initialize Firebase:

```bash
cd "d:\wbeiste\elevez (1)"
firebase init
```

When prompted, select these features using the arrow keys and spacebar:
- Firestore Database
- Hosting

## Step 3: Configure Firestore

For Firestore setup, use these settings:
- Select a default Firestore location (choose one close to your users)
- Accept the default security rules file

## Step 4: Configure Hosting

For Hosting setup, use these settings:
- Public directory: `dist` (this is where Vite builds your app)
- Configure as a single-page app: `Yes`
- Set up automatic builds and deploys with GitHub: `No` (unless you want to)

## Step 5: Deploy Your App

After initialization is complete, you can deploy your app with:

```bash
npm run build
firebase deploy
```

## Alternative: Bypass PowerShell Restrictions

If you continue to face PowerShell execution policy issues, you can temporarily change the policy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

After running your Firebase commands, you can revert the policy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope CurrentUser
```

## Verify Your Firebase Configuration

Once everything is set up, make sure your [.env](file:///d:/wbeiste/elevez%20(1)/.env) file contains your actual Firebase configuration values from the Firebase Console.