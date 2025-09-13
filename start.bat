@echo off
echo 🚀 Starting MOMO TEST...

REM 启动后端服务
echo 🔧 Starting backend server...
start "Backend Server" cmd /k "cd /d %~dp0backend && node server.js"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端服务
echo 🌐 Starting frontend server...
start "Frontend Server" cmd /k "cd /d %~dp0 && python -m http.server 8000"

echo ✅ MOMO TEST started!
echo 📱 Frontend: http://localhost:8000
echo 🔗 Backend API: http://localhost:3000/api
echo.
echo Press any key to exit...
pause >nul