# Simple deployment check script
Write-Host "Checking deployment prerequisites..." -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "To deploy to Vercel manually:" -ForegroundColor Yellow
Write-Host "1. Temporarily change PowerShell execution policy:" -ForegroundColor Cyan
Write-Host "   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Cyan
Write-Host "2. Install Vercel CLI:" -ForegroundColor Cyan
Write-Host "   npm install -g vercel" -ForegroundColor Cyan
Write-Host "3. Login to Vercel:" -ForegroundColor Cyan
Write-Host "   npx vercel login" -ForegroundColor Cyan
Write-Host "4. Deploy your site:" -ForegroundColor Cyan
Write-Host "   npx vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "After deployment, you can revert the execution policy:" -ForegroundColor Yellow
Write-Host "   Set-ExecutionPolicy -ExecutionPolicy Restricted -Scope CurrentUser" -ForegroundColor Cyan