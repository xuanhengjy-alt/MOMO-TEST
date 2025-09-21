// 环境变量检查API
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
    const envCheck = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_URL: process.env.VERCEL_URL,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
        DATABASE_URL_LENGTH: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
      },
      headers: {
        host: req.headers.host,
        'x-vercel-id': req.headers['x-vercel-id'],
        'x-forwarded-for': req.headers['x-forwarded-for']
      }
    };

    // 不记录完整的DATABASE_URL到日志中
    console.log('Environment check:', {
      ...envCheck,
      environment: {
        ...envCheck.environment,
        DATABASE_URL: envCheck.environment.DATABASE_URL
      }
    });

    res.status(200).json(envCheck);
  } catch (error) {
    console.error('Environment check error:', error);
    res.status(500).json({ 
      error: 'Environment check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
