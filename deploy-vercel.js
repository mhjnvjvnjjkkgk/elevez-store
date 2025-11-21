#!/usr/bin/env node

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log(`
🚀 Vercel Deployment for Elevez Store
===================================

I'll create a PowerShell script to help you deploy your website to Vercel.
Vercel is often more reliable than Firebase Hosting for static sites.
`);

// Create a PowerShell script for Vercel deployment
const vercelDeployScript = `
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
`;

const scriptPath = join(process.cwd(), 'deploy-to-vercel.ps1');
writeFileSync(scriptPath, vercelDeployScript);

console.log(`✅ PowerShell script for Vercel deployment created at: ${scriptPath}`);
console.log(`\nTo deploy your website to Vercel:`);
console.log(`1. Right-click on 'deploy-to-vercel.ps1' in File Explorer`);
console.log(`2. Select "Run with PowerShell"`);
console.log(`3. Follow the on-screen instructions`);

// Also create a batch file for Vercel deployment
const vercelBatchScript = `
@echo off
title Vercel Deployment for Elevez Store

echo 🚀 Vercel Deployment for Elevez Store
echo ===================================
echo.

echo Step 1: Checking prerequisites...
echo --------------------------------
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed.
    echo    Please download and install Node.js from https://nodejs.org/
    echo    Then run this script again.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js is installed (Version: %NODE_VERSION%)
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed.
    echo    Please download and install Node.js (which includes npm) from https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm is installed (Version: %NPM_VERSION%)
)

echo.
echo Step 2: Checking Vercel CLI...
echo ----------------------------
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Vercel CLI not found. Installing...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Vercel CLI.
        echo    Try manually:
        echo    1. Open PowerShell as Administrator
        echo    2. Run: npm install -g vercel
        pause
        exit /b 1
    ) else (
        echo ✅ Vercel CLI installed successfully!
    )
) else (
    for /f "tokens=*" %%i in ('vercel --version') do set VERCEL_VERSION=%%i
    echo ✅ Vercel CLI is installed (Version: %VERCEL_VERSION%)
)

echo.
echo Step 3: Login to Vercel
echo ----------------------
echo Please login to Vercel in your browser when prompted...
vercel login
if %errorlevel% neq 0 (
    echo ⚠️  Vercel login may have failed or was cancelled.
    echo    You can manually run 'vercel login' and then continue.
    echo    Press any key to continue...
    pause >nul
)

echo.
echo Step 4: Building and Deploying to Vercel
echo --------------------------------------
echo Building the project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Project build failed.
    echo    Check the error messages above for details.
    pause
    exit /b 1
) else (
    echo ✅ Project built successfully!
)

echo.
echo Deploying to Vercel...
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Deployment failed.
    echo    Check the error messages above for details.
    pause
    exit /b 1
) else (
    echo.
    echo 🎉 Vercel Deployment Completed Successfully!
    echo ==========================================
    echo Your site is now live on Vercel!
)

echo.
echo Press any key to exit...
pause >nul
`;

const batchPath = join(process.cwd(), 'deploy-to-vercel.bat');
writeFileSync(batchPath, vercelBatchScript);

console.log(`\n✅ Batch file for Vercel deployment created at: ${batchPath}`);
console.log(`\nAlternative deployment method:`);
console.log(`1. Double-click on 'deploy-to-vercel.bat' in File Explorer`);
console.log(`2. Follow the on-screen instructions`);

// Create a simple manual deployment guide
const manualGuide = `
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
`;

const guidePath = join(process.cwd(), 'VERCEL_DEPLOYMENT.md');
writeFileSync(guidePath, manualGuide);

console.log(`\n✅ Manual deployment guide created at: ${guidePath}`);
console.log(`Refer to this guide if you encounter any issues during deployment.`);