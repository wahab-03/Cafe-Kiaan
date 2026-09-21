@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ================================================
echo      CAFE KIAAN - FULL PROJECT START
echo ================================================
echo.
start "Cafe Kiaan - Odoo 17" cmd /k call "%~dp0START_ODOO.bat"
echo Waiting for Odoo 17 on port 8070...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; 1..45 | ForEach-Object { try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 http://localhost:8070/web/login; if($r.StatusCode -eq 200){$ok=$true; break} } catch {}; Start-Sleep -Seconds 1 }; if($ok){Write-Host '[OK] Odoo 17 is responding on port 8070.'}else{Write-Host '[WARNING] Odoo did not respond within 45 seconds. Check the Odoo window for errors.'}"
start "Cafe Kiaan - Frontend" cmd /k call "%~dp0START_FRONTEND.bat"
echo.
echo Startup windows opened.
echo Odoo  : http://localhost:8070
echo Web   : http://localhost:3000
echo.
pause
