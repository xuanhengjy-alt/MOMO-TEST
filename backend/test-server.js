// 测试后端服务启动
const express = require('express');
const app = express();
const PORT = 3001;

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/test`);
});
