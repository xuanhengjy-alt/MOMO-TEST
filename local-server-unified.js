const express = require('express');
const path = require('path');
const cors = require('cors');
const { isLocal, getPort } = require('./config/environment');

const app = express();
const PORT = getPort();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    const { healthCheck } = require('./config/database');
    const dbHealth = await healthCheck();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API路由 - 使用统一API
app.all('/api/tests', require('./api/tests-unified.js'));
app.all('/api/tests/:id', require('./api/tests-unified.js'));
app.all('/api/blogs', require('./api/blogs-unified.js'));
app.all('/api/blogs/:slug', require('./api/blogs-unified.js'));
app.all('/api/blogs/:slug/recommend', require('./api/blogs-unified.js'));
app.all('/api/results', require('./api/results-unified.js'));

// 其他API路由
app.all('/api/tests/:id/like', require('./api/tests/[id]/like.js'));
app.all('/api/tests/:id/like-status', require('./api/tests.js'));
app.all('/api/tests/:id/questions', require('./api/tests.js'));
app.all('/api/results/stats/:id', require('./api/results/stats/[id].js'));

// SPA路由处理
app.get('*', (req, res) => {
  // 检查是否是API请求
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // 检查是否是静态资源
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    return res.sendFile(path.join(__dirname, req.path));
  }
  
  // 检查是否是HTML文件或HTML文件路径
  if (req.path.endsWith('.html') || req.path.match(/^\/[^\/]+\.html\//)) {
    // 提取HTML文件名
    const htmlMatch = req.path.match(/^\/([^\/]+\.html)/);
    if (htmlMatch) {
      return res.sendFile(path.join(__dirname, htmlMatch[1]));
    }
  }
  
  // 默认返回index.html
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Unified development server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`📝 Blog: http://localhost:${PORT}/blog.html`);
  console.log(`🧪 Tests: http://localhost:${PORT}/test-detail.html`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database URL set: ${process.env.DATABASE_URL ? 'true' : 'false'}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
