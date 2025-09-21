// 创建单数形式的博客API文件以修复路径问题
// 重定向到正确的复数形式API

module.exports = async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 获取请求的路径
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname.replace('/api/blog', '/api/blogs');
    
    console.log('⚠️ 检测到错误的单数API路径，重定向:', {
      原路径: url.pathname,
      正确路径: path,
      完整URL: req.url
    });

    // 重定向到正确的复数形式API
    res.status(301).setHeader('Location', path + url.search);
    res.end();
    
  } catch (error) {
    console.error('❌ 博客API重定向错误:', error);
    res.status(500).json({ 
      success: false, 
      error: 'API路径错误，请使用 /api/blogs/ 而不是 /api/blog/',
      correct_path: '/api/blogs/'
    });
  }
};
