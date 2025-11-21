
# Vercel Deployment Script for Elevez Store
# This script helps deploy your site to Vercel

Write-Host "🚀 Vercel Deployment for Elevez Store" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed (Version: $nodeVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed (Version: $npmVersion)" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install Node.js (which includes npm) first." -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI installation..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI is installed (Version: $vercelVersion)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    try {
        npm install -g vercel
        Write-Host "✅ Vercel CLI installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Vercel CLI. Try installing manually:" -ForegroundColor Red
        Write-Host "   1. Open PowerShell as Administrator" -ForegroundColor Yellow
        Write-Host "   2. Run: npm install -g vercel" -ForegroundColor Yellow
        exit 1
    }
}

# Login to Vercel
Write-Host "Please login to Vercel in your browser when prompted..." -ForegroundColor Yellow
try {
    vercel login
    Write-Host "✅ Vercel login successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel login failed or was cancelled." -ForegroundColor Yellow
    Write-Host "   You can manually run 'vercel login' and then run this script again." -ForegroundColor Yellow
    exit 1
}

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
try {
    # Build the project first
    Write-Host "Building the project..." -ForegroundColor Yellow
    npm run build
    
    # Deploy
    Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
    vercel --prod
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "Your site is now live on Vercel!" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Deployment failed." -ForegroundColor Red
    Write-Host "   Check the error messages above for details." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Vercel Deployment Completed Successfully!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
