#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';

console.log(`
🚀 Firebase Deployment Troubleshooting for Elevez Store
====================================================

I'll create an improved PowerShell script with better error handling for Firebase deployment.
`);

// Create an improved PowerShell script with better error handling
const improvedFirebaseDeployScript = `
# Firebase Deployment Script for Elevez Store (Improved Version)
# This script includes better error handling and troubleshooting

# Enable better error handling
$ErrorActionPreference = "Stop"

Write-Host "🚀 Firebase Deployment for Elevez Store (Improved)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param([string]$command)
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
} else {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed (Version: $nodeVersion)" -ForegroundColor Green
}

# Check if npm is installed
if (-not (Test-Command "npm")) {
    Write-Host "❌ npm is not installed. Please install Node.js (which includes npm) first." -ForegroundColor Red
    exit 1
} else {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed (Version: $npmVersion)" -ForegroundColor Green
}

# Check if Firebase CLI is installed
Write-Host "Checking Firebase CLI installation..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI is installed (Version: $firebaseVersion)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Firebase CLI not found. Installing..." -ForegroundColor Yellow
    try {
        npm install -g firebase-tools
        Write-Host "✅ Firebase CLI installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Firebase CLI. Try installing manually:" -ForegroundColor Red
        Write-Host "   1. Open PowerShell as Administrator" -ForegroundColor Yellow
        Write-Host "   2. Run: npm install -g firebase-tools" -ForegroundColor Yellow
        exit 1
    }
}

# Login to Firebase
Write-Host "Please login to Firebase in your browser when prompted..." -ForegroundColor Yellow
try {
    firebase login
    Write-Host "✅ Firebase login successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Firebase login failed or was cancelled." -ForegroundColor Yellow
    Write-Host "   You can manually run 'firebase login' and then run this script again." -ForegroundColor Yellow
    exit 1
}

# Initialize Firebase Hosting (if not already initialized)
if (-not (Test-Path "firebase.json")) {
    Write-Host "Initializing Firebase Hosting..." -ForegroundColor Yellow
    Write-Host "⚠️  You'll need to answer some questions:" -ForegroundColor Yellow
    Write-Host "   - Select 'Hosting: Configure files for Firebase Hosting' (use spacebar to select)" -ForegroundColor Yellow
    Write-Host "   - Public directory: dist" -ForegroundColor Yellow
    Write-Host "   - Configure as a single-page app: Yes" -ForegroundColor Yellow
    Write-Host "   - Set up automatic builds and deploys with GitHub: No" -ForegroundColor Yellow
    try {
        firebase init hosting
        Write-Host "✅ Firebase Hosting initialized!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Firebase Hosting initialization failed." -ForegroundColor Red
        Write-Host "   You can manually run 'firebase init hosting' and then run this script again." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Firebase Hosting already initialized." -ForegroundColor Green
}

# Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Project built successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Project build failed." -ForegroundColor Red
    Write-Host "   Check the error messages above for details." -ForegroundColor Yellow
    Write-Host "   You can manually run 'npm run build' to see detailed error information." -ForegroundColor Yellow
    exit 1
}

# Deploy to Firebase
Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Yellow
try {
    firebase deploy --only hosting
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "Your site is now live on Firebase Hosting!" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Deployment failed." -ForegroundColor Red
    Write-Host "   Check the error messages above for details." -ForegroundColor Yellow
    Write-Host "   Common issues and solutions:" -ForegroundColor Yellow
    Write-Host "   1. Make sure you've completed Firebase initialization" -ForegroundColor Yellow
    Write-Host "   2. Check your Firebase project permissions" -ForegroundColor Yellow
    Write-Host "   3. Ensure you have an internet connection" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Firebase Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
`;

const scriptPath = join(process.cwd(), 'deploy-to-firebase-improved.ps1');
writeFileSync(scriptPath, improvedFirebaseDeployScript);

console.log(`✅ Improved PowerShell script created at: ${scriptPath}`);
console.log(`\nTo deploy your website to Firebase:`);
console.log(`1. Right-click on 'deploy-to-firebase-improved.ps1' in File Explorer`);
console.log(`2. Select "Run with PowerShell"`);
console.log(`3. Follow the on-screen instructions`);
console.log(`\nIf you're still experiencing issues:`);
console.log(`1. Open PowerShell as Administrator`);
console.log(`2. Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`);
console.log(`3. Press 'Y' and Enter to confirm`);
console.log(`4. Try running the script again`);

// Also create a troubleshooting guide
const troubleshootingGuide = `
# Firebase Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. PowerShell Execution Policy Errors
**Error**: "cannot be loaded because running scripts is disabled"
**Solution**: 
   - Open PowerShell as Administrator
   - Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   - Press 'Y' and Enter to confirm

### 2. Firebase CLI Not Found
**Error**: "'firebase' is not recognized as an internal or external command"
**Solution**:
   - Open PowerShell as Administrator
   - Run: npm install -g firebase-tools
   - Restart PowerShell

### 3. Firebase Login Issues
**Issue**: Browser doesn't open or login fails
**Solution**:
   - Manually run: firebase login
   - Try using a different browser
   - Check your internet connection

### 4. Firebase Initialization Issues
**Issue**: Problems during firebase init hosting
**Solution**:
   - Make sure you're in the correct project directory
   - Manually run: firebase init hosting
   - When prompted:
     * Select "Hosting: Configure files for Firebase Hosting" (use spacebar)
     * Public directory: dist
     * Configure as a single-page app: Yes
     * Set up automatic builds and deploys with GitHub: No

### 5. Build Errors
**Issue**: npm run build fails
**Solution**:
   - Check for TypeScript/JavaScript errors in your code
   - Run: npm run build manually to see detailed error messages
   - Make sure all dependencies are installed: npm install

### 6. Deployment Errors
**Issue**: firebase deploy fails
**Solution**:
   - Check your Firebase project permissions
   - Verify you're logged into the correct Firebase account
   - Make sure your Firebase project has Hosting enabled

## Manual Deployment Steps

If the automated script continues to fail, you can deploy manually:

1. Open PowerShell in your project directory
2. Run: firebase login
3. Run: firebase init hosting (if not already done)
4. Run: npm run build
5. Run: firebase deploy --only hosting

## Need More Help?

1. Check the Firebase Console for any project-specific issues
2. Verify your Firebase configuration in the .env file
3. Look at the detailed error messages in PowerShell
4. Try running each command individually to isolate the issue
`;

const troubleshootingPath = join(process.cwd(), 'FIREBASE_TROUBLESHOOTING.md');
writeFileSync(troubleshootingPath, troubleshootingGuide);

console.log(`\n✅ Troubleshooting guide created at: ${troubleshootingPath}`);
console.log(`Refer to this guide if you encounter any issues during deployment.`);