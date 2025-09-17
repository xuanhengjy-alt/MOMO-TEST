@echo off
setlocal enabledelayedexpansion

REM Jump to backend directory relative to this script
cd /d "%~dp0backend" || (
  echo [Error] Backend directory not found. Expected: %~dp0backend
  pause
  exit /b 1
)

echo [Info] Stopping any process listening on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
  echo  - Killing PID %%a
  taskkill /PID %%a /F >nul 2>&1
)

set "PORT=3001"
set "NODE_ENV=development"
echo [Info] Starting backend on port %PORT% (NODE_ENV=%NODE_ENV%) ...
rem Start backend in background so we can health-check
start "MOMO-TEST Backend" cmd /c node server.js

rem Health check loop (max ~20s)
set /a _tries=0
:wait_loop
set /a _tries+=1
for /f "delims=" %%H in ('curl -s http://localhost:%PORT%/api/health 2^>nul') do set "_health=%%H"
if defined _health goto :ok
if %_tries% GEQ 20 goto :fail
timeout /t 1 >nul
goto :wait_loop

:ok
echo [OK] Backend is ready at http://localhost:%PORT%
goto :end

:fail
echo [Warn] Could not verify backend readiness on http://localhost:%PORT% within timeout.
echo        Please check logs in the opened backend window.
goto :end

:end
endlocal

