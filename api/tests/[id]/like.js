// 点赞测试项目的API端点
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

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { id: projectId } = req.query;

  if (!projectId) {
    res.status(400).json({ error: 'Project ID is required' });
    return;
  }

  try {
    console.log(`Liking test project: ${projectId}`);
    
    // 更新点赞统计
    const result = await pool.query(`
      INSERT INTO test_statistics (project_id, total_likes)
      VALUES ($1, 1)
      ON CONFLICT (project_id)
      DO UPDATE SET 
        total_likes = test_statistics.total_likes + 1,
        updated_at = NOW()
      RETURNING total_likes
    `, [projectId]);

    const newLikeCount = result.rows[0].total_likes;

    console.log(`Successfully liked project ${projectId}, new count: ${newLikeCount}`);
    
    res.status(200).json({
      success: true,
      likes: newLikeCount,
      message: 'Project liked successfully'
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
};
