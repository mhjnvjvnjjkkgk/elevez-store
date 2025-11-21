# Robust Git Setup for Elevez Store
Write-Host "🚀 Robust Git Setup for Elevez Store" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Function to find Git executable
function Find-Git {
    Write-Host "Step 1: Finding Git installation..." -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Yellow
    
    # Check if git is in PATH
    try {
        $gitPath = Get-Command git -ErrorAction Stop
        Write-Host "✅ Git found in PATH: $($gitPath.Source)" -ForegroundColor Green
        return "git"
    } catch {
        Write-Host "⚠️  Git not found in PATH, trying common locations..." -ForegroundColor Yellow
        
        # Try common Git installation paths
        $possiblePaths = @(
            "C:\Program Files\Git\bin\git.exe",
            "C:\Program Files (x86)\Git\bin\git.exe",
            "C:\Program Files\Git\cmd\git.exe",
            "C:\Program Files (x86)\Git\cmd\git.exe"
        )
        
        foreach ($path in $possiblePaths) {
            if (Test-Path $path) {
                Write-Host "✅ Git found at: $path" -ForegroundColor Green
                return $path
            }
        }
        
        Write-Host "❌ Git not found in common locations" -ForegroundColor Red
        Write-Host "   Please make sure Git is installed from https://git-scm.com/download/win" -ForegroundColor Yellow
        Write-Host "   During installation, check 'Add Git to PATH'" -ForegroundColor Yellow
        return $null
    }
}

# Find Git
$gitCmd = Find-Git
if ($null -eq $gitCmd) {
    Write-Host "Exiting due to Git not found." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Navigating to project directory..." -ForegroundColor Yellow
Write-Host "-------------------------------------" -ForegroundColor Yellow

try {
    Set-Location "d:\wbeiste\elevez (1)"
    Write-Host "✅ Successfully navigated to project directory" -ForegroundColor Green
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to navigate to project directory" -ForegroundColor Red
    Write-Host "   Make sure the path 'd:\wbeiste\elevez (1)' exists" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 3: Fixing Git ownership issue..." -ForegroundColor Yellow
Write-Host "---------------------------------" -ForegroundColor Yellow

try {
    & $gitCmd config --global --add safe.directory "d:/wbeiste/elevez (1)"
    Write-Host "✅ Git ownership issue fixed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not fix ownership issue (this might not be a problem)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4: Initializing Git repository..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

try {
    & $gitCmd init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to initialize Git repository" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 5: Adding files to repository..." -ForegroundColor Yellow
Write-Host "----------------------------------" -ForegroundColor Yellow

try {
    & $gitCmd add .
    Write-Host "✅ All files added to repository" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to add files to repository" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 6: Making initial commit..." -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

try {
    & $gitCmd commit -m "Initial commit"
    Write-Host "✅ Initial commit created" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to make initial commit" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Git setup completed successfully!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Create a repository on GitHub (https://github.com/)" -ForegroundColor Cyan
Write-Host "2. Add the remote origin:" -ForegroundColor Cyan
Write-Host "   & `"$gitCmd`" remote add origin https://github.com/YOUR_USERNAME/elevez-store.git" -ForegroundColor Cyan
Write-Host "3. Push to GitHub:" -ForegroundColor Cyan
Write-Host "   & `"$gitCmd`" push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "After that, connect to Vercel for automatic deployments!" -ForegroundColor Green