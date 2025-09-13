// 简单的测试API端点
module.exports = (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
