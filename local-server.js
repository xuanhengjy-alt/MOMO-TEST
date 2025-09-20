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

// 静态文件服务
app.use(express.static('.', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// 处理SPA路由 - 确保所有页面都能正确访问
app.get('*', (req, res, next) => {
  // 如果是API请求，跳过
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // 如果是静态资源，跳过
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  
  // 处理HTML页面路由
  const validPages = [
    'index.html',
    'blog.html', 
    'test-detail.html',
    'blog-detail.html'
  ];
  
  // 检查是否是有效的页面请求
  for (const page of validPages) {
    if (req.path === `/${page}` || req.path === `/${page}/`) {
      return res.sendFile(path.join(__dirname, page));
    }
  }
  
  // 处理带参数的页面（如 test-detail.html?id=mbti）
  if (req.path.startsWith('/test-detail.html') || req.path.startsWith('/blog-detail.html')) {
    // 提取页面名称，忽略查询参数和路径参数
    const pageName = req.path.split('?')[0].split('/')[1];
    if (validPages.includes(pageName)) {
      return res.sendFile(path.join(__dirname, pageName));
    }
  }
  
  // 处理其他可能的页面请求（如 /test-detail.html/some-id）
  if (req.path.startsWith('/test-detail.html/') || req.path.startsWith('/blog-detail.html/')) {
    const pageName = req.path.split('/')[1];
    if (validPages.includes(pageName)) {
      return res.sendFile(path.join(__dirname, pageName));
    }
  }
  
  // 默认返回index.html
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 动态加载API文件
function loadApiHandler(apiPath) {
  try {
    const fullPath = path.join(__dirname, 'api', apiPath);
    if (fs.existsSync(fullPath)) {
      return require(fullPath);
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
        await handler(req, res);
      } else {
        res.status(404).json({ error: 'API not found' });
      }
    } catch (error) {
      console.error(`API ${apiPath} error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// 注册所有API路由
const apiFiles = [
  'health.js',
  'blogs.js', 
  'tests.js',
  'results.js',
  'test.js'
];

apiFiles.forEach(file => {
  const apiPath = file.replace('.js', '');
  app.all(`/api/${apiPath}`, createApiHandler(file));
  app.all(`/api/${apiPath}/*`, createApiHandler(file));
});

// 处理嵌套API路由
const nestedApis = [
  'tests/[id].js',
  'tests/[id]/like.js',
  'tests/[id]/questions.js',
  'results/stats/[id].js'
];

nestedApis.forEach(file => {
  const apiPath = file.replace('.js', '').replace('[id]', ':id');
  app.all(`/api/${apiPath}`, createApiHandler(file));
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'local-development'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Local development server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`📝 Blog: http://localhost:${PORT}/blog.html`);
  console.log(`🧪 Tests: http://localhost:${PORT}/test-detail.html`);
});

module.exports = app;
