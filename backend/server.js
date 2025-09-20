const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');
const testRoutes = require('./routes/tests');
const resultRoutes = require('./routes/results');
const blogRoutes = require('./routes/blogs');

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());

// CORS 配置（开发环境放宽，允许 file:// 场景的 null origin）
app.use(cors({
  origin: function (origin, callback) {
    // 允许本地常见来源与无来源（file://）
    const allowList = ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:3000', 'http://127.0.0.1:3000'];
    if (!origin || allowList.includes(origin)) return callback(null, true);
    return callback(null, true); // 开发期放开所有来源
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 静态文件服务 - 添加缓存头
app.use(express.static('..', {
  maxAge: '1d', // 1天缓存
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1天
    } else if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30天
    }
  }
}));

// API 路由
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/blogs', blogRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 启动服务器（仅当作为主模块运行时）
if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Server ready for Vercel deployment');
}

// 启动服务器
if (require.main === module) {
  console.log(`Starting backend server bootstrap. NODE_ENV=${process.env.NODE_ENV || 'undefined'} PORT=${PORT}`);
  const startServer = (port) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Backend server running at http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying port ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };
  
  startServer(PORT);
}

// 导出app供Vercel使用
module.exports = app;

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
