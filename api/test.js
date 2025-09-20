// 简单的测试API，用于验证Vercel配置
module.exports = function handler(req, res) {
  console.log('Test API called:', req.method, req.url);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  res.status(200).json({
    success: true,
    message: 'Test API is working',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
};
