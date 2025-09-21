// 简化的状态检查API
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
    const status = {
      message: 'Vercel API is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      environment: {
        node_env: process.env.NODE_ENV,
        vercel: process.env.VERCEL === '1',
        vercel_url: process.env.VERCEL_URL,
        database_url_set: !!process.env.DATABASE_URL
      },
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent']?.substring(0, 50)
      }
    };

    console.log('Status API called:', status);
    res.status(200).json(status);
  } catch (error) {
    console.error('Status API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
