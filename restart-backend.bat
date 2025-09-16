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
node server.js

endlocal

