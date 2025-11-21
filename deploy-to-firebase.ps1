
# Firebase Deployment Script for Elevez Store
# This script executes the commands from FIREBASE_COMPLETE_GUIDE.md lines 55-65

Write-Host "🚀 Firebase Deployment for Elevez Store" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

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
        Write-Host "❌ Failed to install Firebase CLI. Please install manually." -ForegroundColor Red
        exit 1
    }
}

# Login to Firebase
Write-Host "Please login to Firebase in your browser when prompted..." -ForegroundColor Yellow
firebase login

# Initialize Firebase Hosting (if not already initialized)
if (-not (Test-Path "firebase.json")) {
    Write-Host "Initializing Firebase Hosting..." -ForegroundColor Yellow
    firebase init hosting
    Write-Host "✅ Firebase Hosting initialized!" -ForegroundColor Green
} else {
    Write-Host "✅ Firebase Hosting already initialized." -ForegroundColor Green
}

# Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
npm run build

# Deploy to Firebase
Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Your site is now live on Firebase Hosting!" -ForegroundColor Cyan
