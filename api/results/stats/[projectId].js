// 获取测试统计信息的API端点
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { projectId } = req.query;

  if (!projectId) {
    res.status(400).json({ error: 'Project ID is required' });
    return;
  }

  try {
    console.log(`Fetching stats for project: ${projectId}`);
    
    // 查询数据库获取统计信息
    const result = await pool.query(`
      SELECT 
        COALESCE(ts.total_tests, 0) as total_tests,
        COALESCE(ts.total_likes, 0) as total_likes
      FROM test_statistics ts
      WHERE ts.project_id = $1
    `, [projectId]);

    if (result.rows.length === 0) {
      res.status(200).json({
        totalTests: 0,
        totalLikes: 0
      });
      return;
    }

    const stats = {
      totalTests: result.rows[0].total_tests,
      totalLikes: result.rows[0].total_likes
    };

    console.log(`Successfully fetched stats for project ${projectId}:`, stats);
    
    res.status(200).json(stats);

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
};
