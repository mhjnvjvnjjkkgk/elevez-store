@echo off
echo.
echo ========================================
echo   ELEVEZ - Setup Image Folder
echo ========================================
echo.

REM Create public/images/products folder
if not exist "public\images\products" (
    mkdir "public\images\products"
    echo Created: public\images\products
) else (
    echo Folder already exists: public\images\products
)

echo.
echo ========================================
echo   FOLDER READY!
echo ========================================
echo.
echo You can now:
echo 1. Copy your product images to: public\images\products\
echo 2. Use paths like: /images/products/your-image.jpg
echo 3. Images will deploy with your site automatically!
echo.
echo Opening folder...
start "" "public\images\products"
echo.
pause
