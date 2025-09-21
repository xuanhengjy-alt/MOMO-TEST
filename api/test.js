// 简单测试API
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
    const response = {
      message: 'Vercel API is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent']
      },
      environment: {
        node_env: process.env.NODE_ENV,
        vercel: process.env.VERCEL === '1',
        vercel_url: process.env.VERCEL_URL,
        database_url_set: !!process.env.DATABASE_URL
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
