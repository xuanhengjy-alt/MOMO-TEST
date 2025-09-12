#!/bin/bash

# MOMO TEST 启动脚本

echo "🚀 Starting MOMO TEST Application..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# 进入后端目录
cd backend

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "✅ Environment file created. Please check .env file if needed."
fi

# 启动后端服务
echo "🔧 Starting backend server..."
npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend server started successfully on port 3000"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 回到根目录
cd ..

# 启动前端服务
echo "🌐 Starting frontend server..."
echo "📱 Frontend will be available at: http://localhost:8000"
echo "🔗 API will be available at: http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop both servers"

# 使用Python启动静态服务器（如果可用）
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "❌ Python not found. Please start a static server manually."
    echo "You can use: npx serve ."
    echo "Or use VSCode Live Server extension"
fi

# 清理：当脚本退出时停止后端服务
trap "echo '🛑 Stopping backend server...'; kill $BACKEND_PID 2>/dev/null; exit" INT TERM
