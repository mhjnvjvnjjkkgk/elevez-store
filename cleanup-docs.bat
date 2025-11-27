@echo off
echo.
echo ========================================
echo Cleaning Up Old Documentation Files
echo ========================================
echo.

REM Delete old sync/deploy documentation
del /Q "SYNC-DEPLOY-*.md" 2>nul
del /Q "ONE-CLICK-DEPLOY-*.md" 2>nul
del /Q "DEPLOYMENT-FAILED-*.md" 2>nul
del /Q "FIX-DEPLOYMENT-*.md" 2>nul
del /Q "RESTART-*.md" 2>nul
del /Q "FINAL-SYNC-*.md" 2>nul
del /Q "USE-START-*.md" 2>nul
del /Q "SESSION-SYNC-*.md" 2>nul
del /Q "TEST-SYNC-*.md" 2>nul
del /Q "SIMPLIFIED-*.md" 2>nul

REM Delete old phase/wave documentation
del /Q "PHASE-*.md" 2>nul
del /Q "WAVE-*.md" 2>nul
del /Q "SECTION-*.md" 2>nul
del /Q "SESSION-*.md" 2>nul

REM Delete old implementation summaries
del /Q "*-COMPLETE.md" 2>nul
del /Q "*-SUMMARY.md" 2>nul
del /Q "*-IMPLEMENTATION*.md" 2>nul
del /Q "*-INTEGRATION*.md" 2>nul
del /Q "*-DELIVERY*.md" 2>nul
del /Q "*-CERTIFICATE.md" 2>nul
del /Q "*-INDEX.md" 2>nul
del /Q "*-PLAN.md" 2>nul
del /Q "*-STATUS.md" 2>nul
del /Q "*-PROGRESS*.md" 2>nul
del /Q "*-CHECKLIST.md" 2>nul

REM Delete old guides
del /Q "*-GUIDE.md" 2>nul
del /Q "*-QUICK-*.md" 2>nul
del /Q "QUICK-*.md" 2>nul
del /Q "HOW-TO-*.md" 2>nul
del /Q "START-HERE*.md" 2>nul

REM Delete old fixes and updates
del /Q "*-FIX*.md" 2>nul
del /Q "*-FIXES-*.md" 2>nul
del /Q "FIXES-*.md" 2>nul
del /Q "UPDATES-*.md" 2>nul
del /Q "CHANGES-*.md" 2>nul
del /Q "BEFORE-AFTER-*.md" 2>nul

REM Delete old system docs
del /Q "ADMIN-*.md" 2>nul
del /Q "FIREBASE-*.md" 2>nul
del /Q "LOYALTY-*.md" 2>nul
del /Q "POINTS-HISTORY-*.md" 2>nul
del /Q "COLLECTIONS-*.md" 2>nul
del /Q "USER-MANAGEMENT-*.md" 2>nul
del /Q "ORDER-*.md" 2>nul
del /Q "TRACKING-*.md" 2>nul
del /Q "DISCOUNT-*.md" 2>nul
del /Q "CUSTOMER-*.md" 2>nul

REM Delete old feature docs
del /Q "BUILDER-*.md" 2>nul
del /Q "VISUAL-*.md" 2>nul
del /Q "EDITOR-*.md" 2>nul
del /Q "IMAGE-*.md" 2>nul
del /Q "BULK-*.md" 2>nul
del /Q "TRIAL-*.md" 2>nul
del /Q "WEBSITE-*.md" 2>nul
del /Q "ABOUT-PAGE-*.md" 2>nul

REM Delete old reference docs
del /Q "COMPREHENSIVE-*.md" 2>nul
del /Q "COMPLETE-*.md" 2>nul
del /Q "MASTER-*.md" 2>nul
del /Q "STRATEGIC-*.md" 2>nul
del /Q "SYSTEM-*.md" 2>nul
del /Q "FINAL-*.md" 2>nul
del /Q "ULTIMATE-*.md" 2>nul
del /Q "UNIFIED-*.md" 2>nul

REM Delete old misc docs
del /Q "CURSOR-*.md" 2>nul
del /Q "SCROLL-*.md" 2>nul
del /Q "PERFORMANCE-*.md" 2>nul
del /Q "MOBILE-*.md" 2>nul
del /Q "REALTIME-*.md" 2>nul
del /Q "SHOPIFY-*.md" 2>nul
del /Q "NOTIFICATION-*.md" 2>nul
del /Q "ORDERS-*.md" 2>nul
del /Q "CHECKOUT-*.md" 2>nul
del /Q "ADD-TO-CART-*.md" 2>nul
del /Q "IMMEDIATE-*.md" 2>nul
del /Q "FORCE-*.md" 2>nul
del /Q "EMERGENCY-*.md" 2>nul
del /Q "PASTE-*.txt" 2>nul
del /Q "PRIORITY-*.md" 2>nul
del /Q "CURRENT-*.md" 2>nul

REM Delete old batch files
del /Q "START-ALL-SERVERS.bat" 2>nul
del /Q "START-BOTH-SERVERS.bat" 2>nul
del /Q "RESTART-*.bat" 2>nul
del /Q "test-deploy-*.bat" 2>nul
del /Q "test-sync-*.html" 2>nul

REM Delete old admin dashboard files
del /Q "ADMIN-DASHBOARD-*.md" 2>nul
del /Q "ADMIN-DASHBOARD-*.txt" 2>nul
del /Q "DASHBOARD-*.md" 2>nul

REM Delete old deployment docs
del /Q "DEPLOYMENT*.md" 2>nul
del /Q "VERCEL-*.md" 2>nul
del /Q "AUTO-DEPLOY-*.md" 2>nul
del /Q "SETUP-GITHUB-*.md" 2>nul

REM Delete old misc files
del /Q "SIMPLE-FIX.md" 2>nul
del /Q "PORT-*.md" 2>nul
del /Q "PERSISTENCE-*.md" 2>nul
del /Q "VERIFICATION-*.md" 2>nul
del /Q "INTEGRATION-*.md" 2>nul
del /Q "FREE-*.md" 2>nul
del /Q "CENTRALIZED-*.md" 2>nul

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Kept files:
echo - README.md (main documentation)
echo - TROUBLESHOOTING.md (help guide)
echo - START-SIMPLE.bat (startup script)
echo.
echo All old documentation has been removed.
echo.
pause
