# Initialize Git Repository for Elevez Store
Write-Host "🚀 Initializing Git Repository for Elevez Store" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Try to use Git directly with full path
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

try {
    # Initialize repository
    & "C:\Program Files\Git\bin\git.exe" init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
    
    # Add all files
    Write-Host "Step 2: Adding files to repository..." -ForegroundColor Yellow
    Write-Host "----------------------------------" -ForegroundColor Yellow
    & "C:\Program Files\Git\bin\git.exe" add .
    Write-Host "✅ All files added to repository" -ForegroundColor Green
    
    # Make initial commit
    Write-Host "Step 3: Making initial commit..." -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    & "C:\Program Files\Git\bin\git.exe" commit -m "Initial commit"
    Write-Host "✅ Initial commit created" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 Git repository successfully initialized!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Create a repository on GitHub (https://github.com/)" -ForegroundColor Cyan
    Write-Host "2. Add the remote origin:" -ForegroundColor Cyan
    Write-Host "   & `"C:\Program Files\Git\bin\git.exe`" remote add origin https://github.com/YOUR_USERNAME/elevez-store.git" -ForegroundColor Cyan
    Write-Host "3. Push to GitHub:" -ForegroundColor Cyan
    Write-Host "   & `"C:\Program Files\Git\bin\git.exe`" push -u origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After that, connect to Vercel for automatic deployments!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error occurred: $_" -ForegroundColor Red
    Write-Host "Please make sure Git is properly installed." -ForegroundColor Yellow
}