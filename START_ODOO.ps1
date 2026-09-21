$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$customAddons = Join-Path $PSScriptRoot "odoo-addons"
$projectData  = Join-Path $PSScriptRoot "odoo-local-data"
$runtimeDir   = Join-Path $PSScriptRoot "odoo-runtime"
$odooCandidates = @(
  "C:\Program Files\Odoo 17.0.20231103\server\odoo-bin",
  "C:\Program Files\Odoo 17.0\server\odoo-bin",
  "C:\Program Files\Odoo 17\server\odoo-bin"
)
$odooBin = $odooCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $odooBin) { throw "Odoo 17 odoo-bin was not found." }

$odooServer = Split-Path -Parent $odooBin
$odooConf = Join-Path $odooServer "odoo.conf"
$coreAddons = Join-Path $odooServer "odoo\addons"
$odooPython = Join-Path (Split-Path -Parent $odooServer) "python\python.exe"
if (-not (Test-Path -LiteralPath $odooPython)) { $odooPython = "python.exe" }
if (-not (Test-Path -LiteralPath $coreAddons)) { throw "Odoo core addons folder not found: $coreAddons" }
if (-not (Test-Path -LiteralPath (Join-Path $customAddons "cafe_kiaan_restaurant\__manifest__.py"))) {
  throw "Café Kiaan addon not found under $customAddons"
}
if (-not (Test-Path -LiteralPath $projectData)) { New-Item -ItemType Directory -Path $projectData | Out-Null }
if (-not (Test-Path -LiteralPath $runtimeDir)) { New-Item -ItemType Directory -Path $runtimeDir | Out-Null }
$filestore = Join-Path $projectData "filestore\cafe_kiaan"
if (-not (Test-Path -LiteralPath $filestore)) {
  New-Item -ItemType Directory -Path $filestore -Force | Out-Null
}

$portInUse = Get-NetTCPConnection -LocalPort 8070 -State Listen -ErrorAction SilentlyContinue
if ($portInUse) {
  $pids = ($portInUse | Select-Object -ExpandProperty OwningProcess -Unique) -join ", "
  Write-Host "[ERROR] Port 8070 is already in use (PID: $pids). Stop the existing Odoo service/process first." -ForegroundColor Red
  exit 2
}

Write-Host "================================================"
Write-Host "      CAFE KIAAN - ODOO 17 CUSTOM START"
Write-Host "================================================"
Write-Host "Odoo binary : $odooBin"
Write-Host "Odoo Python : $odooPython"
Write-Host "Custom addon: $customAddons"
Write-Host "Core addons : $coreAddons"
Write-Host "Config      : $odooConf"
Write-Host "Data dir    : $projectData (project-local; move this folder with the project)"
Write-Host "URL         : http://localhost:8070"
Write-Host ""
Write-Host "This launcher uses one Odoo process so module sync cannot hang and prevent HTTP startup."
Write-Host "Generated web assets are self-healed during module upgrade when their filestore files are missing."
Write-Host "Startup arguments with spaces are explicitly quoted for Windows PowerShell."
Write-Host "Keep this window open while the project is running."
Write-Host ""

$logFile = Join-Path $runtimeDir "odoo.log"
Write-Host "Starting Odoo and synchronizing cafe_kiaan_restaurant..." -ForegroundColor Cyan
Write-Host "Odoo startup log: $logFile" -ForegroundColor DarkGray

# Start-Process receives one argument string on Windows. Quote every path that
# may contain spaces, especially the Odoo config/core-addons/data paths.
function Quote-ProcessArgument([string]$value) {
  return '"' + $value.Replace('"', '\"') + '"'
}

$addonsPath = "$coreAddons,$customAddons"
$odooArgumentLine = @(
  "$(Quote-ProcessArgument $odooBin)"
  "-c $(Quote-ProcessArgument $odooConf)"
  "-d cafe_kiaan"
  "--addons-path $(Quote-ProcessArgument $addonsPath)"
  "-u cafe_kiaan_restaurant"
  "--http-port 8070"
  "--data-dir $(Quote-ProcessArgument $projectData)"
  "--logfile $(Quote-ProcessArgument $logFile)"
  "--log-level info"
) -join " "

try {
  $odooProcess = Start-Process -FilePath $odooPython -ArgumentList $odooArgumentLine -WorkingDirectory $odooServer -PassThru
} catch {
  Write-Host "[ERROR] Could not start Odoo: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

$ready = $false
for ($i = 1; $i -le 60; $i++) {
  Start-Sleep -Seconds 2
  if ($odooProcess.HasExited) { break }
  try {
    $health = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 "http://127.0.0.1:8070/cafe-kiaan/api/health"
    if ($health.StatusCode -eq 200) {
      $ready = $true
      break
    }
  } catch {
    # Odoo is still loading the database/module; keep waiting.
  }
  if (($i % 5) -eq 0) { Write-Host ("Waiting for Odoo HTTP API... {0}s" -f ($i * 2)) -ForegroundColor DarkYellow }
}

if ($ready) {
  Write-Host "[OK] Odoo HTTP API is ready on http://localhost:8070" -ForegroundColor Green
  Write-Host "[OK] Café Kiaan module upgrade completed enough for the health endpoint." -ForegroundColor Green
} elseif ($odooProcess.HasExited) {
  Write-Host "[ERROR] Odoo exited during startup. Check: $logFile" -ForegroundColor Red
  Write-Host "Odoo process exit code: $($odooProcess.ExitCode)" -ForegroundColor Yellow
  if (Test-Path -LiteralPath $logFile) {
    Write-Host "--- Last 80 Odoo log lines ---" -ForegroundColor Yellow
    Get-Content -LiteralPath $logFile -Tail 80
  } else {
    Write-Host "[ERROR] Odoo log file was not created. The process failed before logging could start." -ForegroundColor Yellow
    Write-Host "Command: $odooPython $odooArgumentLine" -ForegroundColor DarkGray
  }
  exit 1
} else {
  Write-Host "[WARN] Odoo is still starting after 120 seconds. Keep this window open and check the log if the website cannot connect:" -ForegroundColor Yellow
  Write-Host $logFile -ForegroundColor Yellow
}

Write-Host "Keep this window open while the project is running."
$odooProcess.WaitForExit()
$exitCode = $odooProcess.ExitCode
Write-Host ""
Write-Host "Odoo stopped with exit code $exitCode."
exit $exitCode