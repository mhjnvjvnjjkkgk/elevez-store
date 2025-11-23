# Kill and Restart All Servers
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " KILLING OLD SERVERS AND RESTARTING" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill processes on port 3001 (Admin Server)
Write-Host "Killing processes on port 3001 (Admin Server)..." -ForegroundColor Yellow
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($port3001) {
    $port3001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Write-Host "✓ Killed process on port 3001" -ForegroundColor Green
} else {
    Write-Host "✓ No process on port 3001" -ForegroundColor Gray
}
Write-Host ""

# Kill processes on port 5173 (Website)
Write-Host "Killing processes on port 5173 (Website)..." -ForegroundColor Yellow
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($port5173) {
    $port5173 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Write-Host "✓ Killed process on port 5173" -ForegroundColor Green
} else {
    Write-Host "✓ No process on port 5173" -ForegroundColor Gray
}
Write-Host ""

# Kill processes on port 3000 (Admin Panel)
Write-Host "Killing processes on port 3000 (Admin Panel)..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $port3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Write-Host "✓ Killed process on port 3000" -ForegroundColor Green
} else {
    Write-Host "✓ No process on port 3000" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Waiting 2 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 2
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " STARTING SERVERS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Admin Server
Write-Host "Starting Admin Server (Port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node scripts/admin-server.js" -WindowStyle Normal
Start-Sleep -Seconds 2
Write-Host "✓ Admin Server started" -ForegroundColor Green
Write-Host ""

# Start Website
Write-Host "Starting Website (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Write-Host "✓ Website started" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SERVERS STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin Server: http://localhost:3001" -ForegroundColor White
Write-Host "Website: http://localhost:5173" -ForegroundColor White
Write-Host "Admin Panel: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
