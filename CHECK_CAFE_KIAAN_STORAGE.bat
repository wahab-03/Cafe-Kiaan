@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

echo ================================================
echo CAFE KIAAN - ODOO STORAGE / ASSET CHECK
echo ================================================
echo.
echo This check is read-only. It does not alter the database.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$db='cafe_kiaan'; $store=Join-Path '%~dp0odoo-local-data' ('filestore\'+$db); if(Test-Path $store){$count=(Get-ChildItem -File -Recurse $store | Measure-Object).Count; Write-Host ('[OK] Project filestore exists: '+$count+' files')}else{Write-Host '[WARN] Project filestore is missing.' -ForegroundColor Yellow}; try{$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 http://localhost:8070/web/login; Write-Host ('[OK] Odoo /web/login HTTP '+$r.StatusCode); $m=[regex]::Matches($r.Content,'/web/assets/[^\"'']+'); $urls=@($m | ForEach-Object {$_.Value} | Select-Object -Unique | Select-Object -First 3); if($urls.Count -eq 0){Write-Host '[WARN] No /web/assets URL was found in the login HTML.' -ForegroundColor Yellow}else{foreach($u in $urls){$x=Invoke-WebRequest -UseBasicParsing -TimeoutSec 10 ('http://localhost:8070'+$u); Write-Host ('[OK] Asset '+$x.StatusCode+' '+$u)}}}catch{Write-Host ('[FAIL] '+$_.Exception.Message) -ForegroundColor Red}"

echo.
pause
