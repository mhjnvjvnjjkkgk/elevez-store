# ELEVEZ Admin Panel Startup Script

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         ELEVEZ ADMIN PANEL - STARTUP                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Kill any existing Node processes
Write-Host "🔄 Cleaning up old processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Start the admin server
Write-Host ""
Write-Host "🚀 Starting Admin Server on port 3001..." -ForegroundColor Green
Write-Host ""

# Start server in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; node scripts/admin-server.js" -WindowStyle Normal

# Wait for server to start
Start-Sleep -Seconds 2

# Open the admin panel in browser
Write-Host ""
Write-Host "🌐 Opening Admin Panel in browser..." -ForegroundColor Green
Start-Sleep -Seconds 1
Start-Process "http://localhost:3001/admin-panel/index.html"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅ Admin Panel is starting!                                   ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║  📍 Admin Panel: http://localhost:3001/admin-panel/index.html  ║" -ForegroundColor Cyan
Write-Host "║  📡 Server: http://localhost:3001                             ║" -ForegroundColor Cyan
Write-Host "║  🔥 Hot-Reload: ws://localhost:3002                           ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║  ⚠️  IMPORTANT:                                                ║" -ForegroundColor Yellow
Write-Host "║  - Do NOT close the server window while using the admin panel ║" -ForegroundColor Yellow
Write-Host "║  - Keep the server running for full functionality             ║" -ForegroundColor Yellow
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "║  🔄 To refresh: Press F5 in the browser                       ║" -ForegroundColor Cyan
Write-Host "║  🛑 To stop: Close the server terminal window                 ║" -ForegroundColor Cyan
Write-Host "║                                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit this window (server will keep running)"
