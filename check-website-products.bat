@echo off
echo.
echo ========================================
echo   ELEVEZ - Website Product Checker
echo ========================================
echo.
echo This will open your website to verify products...
echo.
echo Checking if website is running...
netstat -ano | findstr :5173 >nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ Website is NOT running on port 5173!
    echo.
    echo Please run: START-ALL-SERVERS.bat
    echo.
    pause
    exit /b
)
echo.
echo ✅ Website is running!
echo.
echo Opening:
echo  1. Main Website (localhost:5173)
echo  2. Product Verification Tool
echo.
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173"
timeout /t 1 /nobreak >nul
start "" "admin-panel\tools\verify-products.html"
echo.
echo ✅ Opened both windows!
echo.
echo Check:
echo  - Are products showing on the website?
echo  - Do images load correctly?
echo  - Are prices and details correct?
echo.
pause
