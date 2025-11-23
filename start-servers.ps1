# ELEVEZ - Start All Servers
# Simple PowerShell script to start development servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ELEVEZ - START ALL SERVERS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Project directory: $scriptPath" -ForegroundColor Yellow
Write-Host ""

# Verify package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from your project directory." -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Starting servers..." -ForegroundColor Green
Write-Host ""

# Start Website Server
Write-Host "[1/2] Starting Website Server (Port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; npm run dev"
Start-Sleep -Seconds 3

# Start Admin Server
Write-Host "[2/2] Starting Admin Server (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath'; node scripts\admin-server.js"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ALL SERVERS STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Website: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Admin Server: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening admin panel..." -ForegroundColor Green
Start-Sleep -Seconds 2

# Open admin panel
Start-Process "admin-panel\index.html"

Write-Host ""
Write-Host "Admin panel opened!" -ForegroundColor Green
Write-Host "Keep the PowerShell windows open." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
