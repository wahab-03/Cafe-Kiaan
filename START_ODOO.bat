@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

where powershell.exe >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Windows PowerShell was not found.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0START_ODOO.ps1"
set "EXITCODE=%ERRORLEVEL%"
if not "%EXITCODE%"=="0" (
  echo.
  echo Odoo launcher exited with code %EXITCODE%.
)
pause
exit /b %EXITCODE%
