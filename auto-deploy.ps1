# Auto Deploy Script - Git + Vercel
# This script commits changes to GitHub and deploys to Vercel

Write-Host "🚀 Starting Auto Deploy Process..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Step 1: Git Add
Write-Host "`n📦 Step 1: Adding files to Git..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add files to Git" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Files added successfully" -ForegroundColor Green

# Step 2: Git Commit
Write-Host "`n💾 Step 2: Committing changes..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Auto-deploy: Updates from $timestamp"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No changes to commit or commit failed" -ForegroundColor Yellow
} else {
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
}

# Step 3: Git Push
Write-Host "`n🔄 Step 3: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "⚠️  Continuing with Vercel deployment anyway..." -ForegroundColor Yellow
} else {
    Write-Host "✅ Pushed to GitHub successfully" -ForegroundColor Green
}

# Step 4: Build
Write-Host "`n🔨 Step 4: Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Step 5: Deploy to Vercel
Write-Host "`n🌐 Step 5: Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod --yes
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel deployment failed" -ForegroundColor Red
    Write-Host "💡 Make sure you have Vercel CLI installed: npm i -g vercel" -ForegroundColor Yellow
    Write-Host "💡 And that you're logged in: vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✨ =================================" -ForegroundColor Cyan
Write-Host "✨ Auto Deploy Completed Successfully!" -ForegroundColor Green
Write-Host "✨ =================================" -ForegroundColor Cyan
Write-Host "`n📍 Your changes are now live on:" -ForegroundColor Cyan
Write-Host "   - GitHub: https://github.com/your-username/your-repo" -ForegroundColor White
Write-Host "   - Vercel: Check your Vercel dashboard for the URL" -ForegroundColor White
