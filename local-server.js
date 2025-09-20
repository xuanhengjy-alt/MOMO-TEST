// 本地开发服务器 - 模拟Vercel API环境
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
// 加载环境变量
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // 也尝试加载默认的.env文件

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 动态加载API文件
function loadApiHandler(apiPath) {
  try {
    const fullPath = path.join(__dirname, 'api', apiPath);
    console.log(`Loading API handler: ${apiPath}, full path: ${fullPath}`);
    if (fs.existsSync(fullPath)) {
      console.log(`API file exists: ${fullPath}`);
      // 清除require缓存，确保每次请求都加载最新代码
      delete require.cache[require.resolve(fullPath)];
      const handler = require(fullPath);
      console.log(`API handler loaded successfully: ${apiPath}`);
      return handler;
    } else {
      console.log(`API file not found: ${fullPath}`);
    }
    return null;
  } catch (error) {
    console.error(`Error loading API ${apiPath}:`, error);
    return null;
  }
}

// 通用API处理器
function createApiHandler(apiPath) {
  return async (req, res) => {
    try {
      const handler = loadApiHandler(apiPath);
      if (handler) {
        // 确保req.params存在
        req.params = req.params || {};
        await handler(req, res);
      } else {
        res.status(404).json({ success: false, error: 'API not found' });
      }
    } catch (error) {
      console.error(`API handler for ${apiPath} failed:`, error);
      res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
    }
  };
}

// API路由 - 必须在静态文件之前
// 处理 /api/tests/:id 路由（必须在通用路由之前）
app.all('/api/tests/:id', (req, res) => {
  // 将id作为查询参数传递给tests.js
  req.query.id = req.params.id;
  createApiHandler('tests.js')(req, res);
});

app.all('/api/:apiName', (req, res) => {
  const apiName = req.params.apiName;
  console.log(`API route called: /api/${apiName}`);
  createApiHandler(`${apiName}.js`)(req, res);
});

app.all('/api/:apiName/:slug', (req, res) => {
  const apiName = req.params.apiName;
  createApiHandler(`${apiName}.js`)(req, res);
});

// 处理嵌套API路由，如 /api/tests/[id]/like
app.all('/api/tests/:id/like', (req, res) => {
  // 将id作为params传递给API处理器
  req.params = req.params || {};
  req.params.id = req.params.id;
  createApiHandler('tests/[id]/like.js')(req, res);
});

app.all('/api/tests/:id/like-status', (req, res) => {
  // 将id作为params传递给API处理器
  req.params = req.params || {};
  req.params.id = req.params.id;
  createApiHandler('tests/[id]/like.js')(req, res);
});

app.all('/api/tests/:id/questions', (req, res) => {
  // 将id作为params传递给API处理器
  req.params = req.params || {};
  req.params.id = req.params.id;
  createApiHandler('tests/[id]/questions.js')(req, res);
});

// 处理博客推荐API路由
app.all('/api/blogs/:slug/recommend', (req, res) => {
  // 将slug作为params传递给API处理器
  req.params = req.params || {};
  req.params.slug = req.params.slug;
  createApiHandler('blogs.js')(req, res);
});

app.all('/api/results/stats/:id', (req, res) => {
  createApiHandler('results/stats/[id].js')(req, res);
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'local-development'
  });
});

// 静态文件服务 - 处理所有静态资源（JS、CSS、图片等）
app.use(express.static('.', {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // 确保JavaScript文件有正确的Content-Type
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      console.log(`Serving JS file: ${filePath} with Content-Type: application/javascript`);
    }
    // 确保CSS文件有正确的Content-Type
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));

// SPA路由处理 - 只处理HTML页面，必须在最后
app.get('*', (req, res) => {
  // 排除静态资源请求，这些应该由express.static处理
  if (req.path.startsWith('/js/') || 
      req.path.startsWith('/css/') || 
      req.path.startsWith('/assets/') || 
      req.path.startsWith('/api/') ||
      req.path.endsWith('.js') || 
      req.path.endsWith('.css') || 
      req.path.endsWith('.png') || 
      req.path.endsWith('.jpg') || 
      req.path.endsWith('.jpeg') || 
      req.path.endsWith('.gif') || 
      req.path.endsWith('.webp') || 
      req.path.endsWith('.ico') ||
      req.path.endsWith('.svg')) {
    return res.status(404).send('Static resource not found');
  }
  
  // 只处理看起来像页面的请求
  if (req.path === '/' || 
      req.path.endsWith('.html') || 
      req.path.startsWith('/test-detail.html') || 
      req.path.startsWith('/blog-detail.html')) {
    
    let pageName = 'index.html'; // 默认页面
    
    // 处理根路径
    if (req.path === '/') {
      pageName = 'index.html';
    }
    // 处理带参数的页面（必须在.html文件检查之前）
    else if (req.path.startsWith('/test-detail.html')) {
      pageName = 'test-detail.html';
    }
    else if (req.path.startsWith('/blog-detail.html')) {
      pageName = 'blog-detail.html';
    }
    // 处理.html文件
    else if (req.path.endsWith('.html')) {
      pageName = req.path.substring(1); // 移除开头的/
    }
    
    const filePath = path.join(__dirname, pageName);
    if (fs.existsSync(filePath)) {
      console.log(`Serving SPA page: ${pageName} for request: ${req.path}`);
      return res.sendFile(filePath);
    }
  }
  
  // 对于其他所有请求，返回404
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`🚀 Local development server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`📝 Blog: http://localhost:${PORT}/blog.html`);
  console.log(`🧪 Tests: http://localhost:${PORT}/test-detail.html`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database URL set: ${!!process.env.DATABASE_URL}`);
});

module.exports = app;