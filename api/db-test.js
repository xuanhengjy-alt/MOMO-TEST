// 数据库连接测试API
const { query } = require('../config/database');

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
    console.log('Database test API called');
    
    // 测试数据库连接
    const result = await query('SELECT COUNT(*) as count FROM test_projects WHERE is_active = true');
    
    const response = {
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        active_projects: result.rows[0].count,
        environment: process.env.NODE_ENV,
        vercel: process.env.VERCEL === '1'
      }
    };

    console.log('Database test successful:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Database test failed:', error);
    
    const response = {
      success: false,
      error: 'Database connection failed',
      message: error.message,
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        environment: process.env.NODE_ENV,
        vercel: process.env.VERCEL === '1',
        database_url_set: !!process.env.DATABASE_URL
      }
    };

    res.status(500).json(response);
  }
};
