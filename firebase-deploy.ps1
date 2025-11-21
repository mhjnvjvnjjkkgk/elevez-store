
# Firebase Deployment Script for Elevez Store
Write-Host "🚀 Firebase Deployment for Elevez Store" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check if Firebase CLI is installed
try {
    $firebaseVersion = firebase --version
    Write-Host "Firebase CLI is already installed (Version: $firebaseVersion)" -ForegroundColor Green
} catch {
    Write-Host "Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
    if ($?) {
        Write-Host "Firebase CLI installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to install Firebase CLI. Please try manually." -ForegroundColor Red
        exit 1
    }
}

# Login to Firebase
Write-Host "Please login to Firebase in your browser..." -ForegroundColor Yellow
firebase login

# Initialize Firebase Hosting
Write-Host "Initializing Firebase Hosting..." -ForegroundColor Yellow
firebase init hosting

Write-Host "Firebase initialization complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm run build' to build your project" -ForegroundColor Yellow
Write-Host "2. Run 'firebase deploy --only hosting' to deploy" -ForegroundColor Yellow
