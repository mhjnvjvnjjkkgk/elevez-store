# ELEVEZ Auto-Deploy Monitor
# Watches for changes in constants.ts and auto-deploys

Write-Host "`n🚀 ELEVEZ AUTO-DEPLOY MONITOR" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$watchFile = "constants.ts"
$lastHash = ""

# Function to get file hash
function Get-FileHashValue {
    param($file)
    if (Test-Path $file) {
        return (Get-FileHash $file -Algorithm MD5).Hash
    }
    return ""
}

# Function to deploy
function Deploy-Site {
    Write-Host "`n📦 CHANGE DETECTED IN constants.ts!" -ForegroundColor Yellow
    Write-Host "Starting deployment..." -ForegroundColor Cyan
    
    # Build the project
    Write-Host "`n🔨 Building project..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
        
        # Deploy to Firebase
        Write-Host "`n🚀 Deploying to Firebase..." -ForegroundColor Cyan
        firebase deploy --only hosting
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
            Write-Host "🌐 Your website is now live with the latest products!" -ForegroundColor Green
            Write-Host "⏰ Deployed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
            
            # Show notification
            $notification = New-Object -ComObject Wscript.Shell
            $notification.Popup("✅ ELEVEZ deployed successfully! Your products are now live.", 5, "Deployment Complete", 64)
        } else {
            Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
            Write-Host "Check the errors above." -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n❌ Build failed!" -ForegroundColor Red
        Write-Host "Fix the errors and try again." -ForegroundColor Yellow
    }
}

# Initial hash
$lastHash = Get-FileHashValue $watchFile

Write-Host "👀 Watching for changes in $watchFile..." -ForegroundColor Green
Write-Host "💡 Update constants.ts from admin panel to trigger deployment" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop monitoring`n" -ForegroundColor Gray

# Monitor loop
while ($true) {
    Start-Sleep -Seconds 2
    
    $currentHash = Get-FileHashValue $watchFile
    
    if ($currentHash -ne $lastHash -and $currentHash -ne "") {
        $lastHash = $currentHash
        Deploy-Site
        
        Write-Host "`n👀 Continuing to watch for changes..." -ForegroundColor Green
    }
}
