const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');
const testRoutes = require('./routes/tests');
const resultRoutes = require('./routes/results');

const app = express();
const PORT = process.env.PORT || 3000;

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

// API 路由
app.use('/api/tests', testRoutes);
app.use('/api/results', resultRoutes);

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

// 启动服务器
if (process.env.NODE_ENV !== 'production') {
  // 开发环境
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  });
} else {
  // 生产环境 (Vercel)
  console.log('🚀 Server ready for Vercel deployment');
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
