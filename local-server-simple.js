// 简化的本地开发服务器
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'local-development'
  });
});

// API路由 - 直接使用backend的API
app.use('/api', require('./backend/server'));

// 静态文件服务
app.use(express.static('.', {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));

// SPA路由 - 简化版本
app.get('*', (req, res) => {
  // 排除静态资源
  if (req.path.startsWith('/js/') || 
      req.path.startsWith('/css/') || 
      req.path.startsWith('/assets/') || 
      req.path.startsWith('/api/') ||
      req.path.endsWith('.js') || 
      req.path.endsWith('.css') || 
      req.path.match(/\.(png|jpg|jpeg|gif|webp|ico|svg)$/)) {
    return res.status(404).send('Static resource not found');
  }
  
  let pageName = 'index.html';
  
  // 处理根路径
  if (req.path === '/') {
    pageName = 'index.html';
  }
  // 处理带参数的页面
  else if (req.path.startsWith('/test-detail.html')) {
    pageName = 'test-detail.html';
  }
  else if (req.path.startsWith('/blog-detail.html')) {
    pageName = 'blog-detail.html';
  }
  // 处理普通HTML文件
  else if (req.path.endsWith('.html')) {
    pageName = req.path.substring(1);
  }
  
  const filePath = path.join(__dirname, pageName);
  if (fs.existsSync(filePath)) {
    console.log(`Serving page: ${pageName} for request: ${req.path}`);
    return res.sendFile(filePath);
  }
  
  // 默认返回index.html
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Local development server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`📝 Blog: http://localhost:${PORT}/blog.html`);
  console.log(`🧪 Tests: http://localhost:${PORT}/test-detail.html`);
});

module.exports = app;
