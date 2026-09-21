@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
echo ================================================
echo       CAFE KIAAN - ENVIRONMENT CHECK
echo ================================================
where node >nul 2>nul && (echo [OK] Node.js found: & node --version) || echo [ERROR] Node.js not found in PATH
echo.
powershell -NoProfile -Command "$s=Get-Service -Name 'postgresql-x64-17' -ErrorAction SilentlyContinue; if($s){Write-Host ('[PostgreSQL 17] '+$s.Status)}else{Write-Host '[WARN] postgresql-x64-17 service not found'}"
echo.
powershell -NoProfile -Command "$c=Get-NetTCPConnection -LocalPort 8070 -State Listen -ErrorAction SilentlyContinue; if($c){Write-Host '[Odoo] Port 8070 is listening'}else{Write-Host '[WARN] Port 8070 is not listening'}"
powershell -NoProfile -Command "$c=Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if($c){Write-Host '[Frontend] Port 3000 is listening'}else{Write-Host '[INFO] Frontend is not running'}"
echo.
pause
