@echo off
setlocal EnableExtensions
cd /d "%~dp0frontend"
if not exist package.json (
  echo [ERROR] frontend\package.json not found.
  pause
  exit /b 1
)

echo ================================================
echo       CAFE KIAAN - NEXT.JS FRONTEND
echo ================================================
echo API: http://localhost:8070/cafe-kiaan/api
echo URL: http://localhost:3000
echo.

if not exist node_modules\next\package.json goto :INSTALL
if not exist node_modules\next\dist\bin\next goto :INSTALL
goto :START

:INSTALL
echo Installing frontend dependencies (npm ci)...
call npm ci --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo [ERROR] npm ci failed.
  echo Check Node.js/npm and your internet connection, then run this file again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules\next\dist\bin\next (
  echo.
  echo [ERROR] Next.js was not installed correctly; its executable is missing.
  echo.
  pause
  exit /b 1
)

:START
echo Starting Next.js...
call npm run dev
set "EXITCODE=%ERRORLEVEL%"
echo.
echo Frontend stopped with exit code %EXITCODE%.
pause
exit /b %EXITCODE%
