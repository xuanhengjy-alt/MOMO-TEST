// 健康检查API
const { query } = require('../config/database');

module.exports = async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 检查数据库连接
    const startTime = Date.now();
    await query('SELECT 1 as test');
    const dbResponseTime = Date.now() - startTime;

    // 获取基本统计信息
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM test_projects WHERE is_active = true) as active_projects,
        (SELECT COUNT(*) FROM test_results) as total_results,
        (SELECT COUNT(*) FROM blogs WHERE status = 'published') as published_blogs
    `);

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`
      },
      stats: {
        activeProjects: parseInt(stats.rows[0].active_projects),
        totalResults: parseInt(stats.rows[0].total_results),
        publishedBlogs: parseInt(stats.rows[0].published_blogs)
      }
    };

    console.log('✅ 健康检查通过:', healthStatus);
    res.status(200).json(healthStatus);

  } catch (error) {
    console.error('❌ 健康检查失败:', error);
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      error: error.message
    };

    res.status(500).json(errorStatus);
  }
};
