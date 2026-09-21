@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
set "REPORT=%~dp0FULL_PROJECT_RUNTIME_REPORT.txt"
if exist "%REPORT%" del /q "%REPORT%"

echo ================================================ > "%REPORT%"
echo CAFE KIAAN - FULL PROJECT RUNTIME CHECK >> "%REPORT%"
echo Date/Time: %date% %time% >> "%REPORT%"
echo ================================================ >> "%REPORT%"

call :section "1. BASIC TOOLS"
where node >> "%REPORT%" 2>&1
if errorlevel 1 (echo [FAIL] Node.js not found >> "%REPORT%") else (node --version >> "%REPORT%" 2>&1)
where npm >> "%REPORT%" 2>&1
if errorlevel 1 (echo [FAIL] npm not found >> "%REPORT%") else (npm --version >> "%REPORT%" 2>&1)

call :section "2. POSTGRESQL"
powershell -NoProfile -Command "$s=Get-Service -Name 'postgresql-x64-17' -ErrorAction SilentlyContinue; if($s){'Service='+$s.Name; 'Status='+$s.Status}else{'[FAIL] postgresql-x64-17 service not found'}" >> "%REPORT%" 2>&1

call :section "3. PORTS"
powershell -NoProfile -Command "$ports=8070,3000,8069; foreach($p in $ports){$c=Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if($c){foreach($x in $c){$proc=(Get-Process -Id $x.OwningProcess -ErrorAction SilentlyContinue); ('Port '+$p+' -> PID '+$x.OwningProcess+' -> '+$proc.ProcessName)}}else{('Port '+$p+' -> NOT LISTENING')}}" >> "%REPORT%" 2>&1

call :section "4. ODOO HEALTH"
curl.exe -sS -i --max-time 15 "http://localhost:8070/cafe-kiaan/api/health" >> "%REPORT%" 2>&1
powershell -NoProfile -Command "$j=(Invoke-WebRequest -UseBasicParsing -TimeoutSec 15 'http://localhost:8070/cafe-kiaan/api/health').Content | ConvertFrom-Json; 'Health ok='+$j.ok; 'Odoo currency='+$j.currency_code; 'Currency symbol='+$j.currency_symbol; if($j.currency_code -eq 'BDT' -and $j.currency_symbol -eq '৳'){'[OK] BDT currency is configured'}else{'[WARN] Currency is not BDT/৳'}" >> "%REPORT%" 2>&1

call :section "4A. ODOO WEB ASSET SMOKE TEST"
powershell -NoProfile -Command "try{$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 15 'http://localhost:8070/web/login'; 'Login status='+$r.StatusCode; $m=[regex]::Matches($r.Content,'/web/assets/[^"'']+'); $urls=@($m | ForEach-Object {$_.Value} | Select-Object -Unique | Select-Object -First 3); if($urls.Count -eq 0){'[WARN] No asset URLs found in login HTML'}else{foreach($u in $urls){try{$a=Invoke-WebRequest -UseBasicParsing -TimeoutSec 15 ('http://localhost:8070'+$u); 'Asset '+$a.StatusCode+' '+$u}catch{'[FAIL] Asset '+$u+' -> '+$_.Exception.Message}}}}catch{'[FAIL] /web/login -> '+$_.Exception.Message}" >> "%REPORT%" 2>&1

call :section "5. ODOO MENU"
curl.exe -sS --max-time 20 "http://localhost:8070/cafe-kiaan/api/menu" > "%TEMP%\cafe_menu_runtime.json" 2>nul
if errorlevel 1 (echo [FAIL] Menu endpoint request failed >> "%REPORT%") else (
  echo Menu response saved below: >> "%REPORT%"
  powershell -NoProfile -Command "$p=Get-Content -Raw '%TEMP%\cafe_menu_runtime.json' | ConvertFrom-Json; 'Menu count='+$p.Count; 'First item='+$p[0].name; 'First image='+$p[0].image" >> "%REPORT%" 2>&1
)

call :section "6. ODOO CATEGORIES"
curl.exe -sS --max-time 15 "http://localhost:8070/cafe-kiaan/api/menu/categories" >> "%REPORT%" 2>&1

call :section "7. ODOO ORDERS GET"
curl.exe -sS --max-time 20 "http://localhost:8070/cafe-kiaan/api/orders" >> "%REPORT%" 2>&1

call :section "8. ODOO ORDER QUOTE (NON-DESTRUCTIVE)"
powershell -NoProfile -Command "$p=Get-Content -Raw '%TEMP%\cafe_menu_runtime.json' | ConvertFrom-Json; if($p.Count -gt 0){$body=@{order_type='delivery';items=@(@{menu_item_id=[int]$p[0].id;quantity=1})}|ConvertTo-Json -Compress; try{(Invoke-WebRequest -UseBasicParsing -Method Post -ContentType 'application/json' -Body $body -TimeoutSec 20 'http://localhost:8070/cafe-kiaan/api/orders/quote').Content}catch{Write-Host $_}}else{'[SKIP] Menu response is empty'}" >> "%REPORT%" 2>&1

call :section "9. CORS PREFLIGHT"
curl.exe -sS -i -X OPTIONS --max-time 15 -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" "http://localhost:8070/cafe-kiaan/api/menu" >> "%REPORT%" 2>&1

call :section "10. FRONTEND"
curl.exe -sS -I --max-time 15 "http://localhost:3000" >> "%REPORT%" 2>&1

call :section "11. FRONTEND BUILD"
if not exist "%~dp0frontend\node_modules" (
  echo node_modules missing; running npm ci... >> "%REPORT%"
  pushd "%~dp0frontend"
  call npm ci >> "%REPORT%" 2>&1
  if errorlevel 1 echo [FAIL] npm ci failed >> "%REPORT%"
  popd
)
if exist "%~dp0frontend\node_modules" (
  pushd "%~dp0frontend"
  call npm run build >> "%REPORT%" 2>&1
  if errorlevel 1 (echo [FAIL] npm run build failed >> "%REPORT%") else (echo [OK] npm run build passed >> "%REPORT%")
  popd
) else (
  echo [FAIL] node_modules unavailable; build skipped >> "%REPORT%"
)

call :section "12. NOTES"
echo This script does NOT create, update, cancel, or delete any restaurant order. >> "%REPORT%"
echo NOTE: Build may require network access on a fresh PC because node_modules is intentionally not bundled. >> "%REPORT%"
echo Review the full report before changing the database. >> "%REPORT%"

echo.
echo ================================================
echo Runtime check complete.
echo Report: %REPORT%
echo ================================================
pause
exit /b 0

:section
echo. >> "%REPORT%"
echo %~1 >> "%REPORT%"
echo ------------------------------------------------ >> "%REPORT%"
echo. >> "%REPORT%"
exit /b 0
