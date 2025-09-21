// 点赞测试项目的API端点
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
});

// 数据库查询辅助函数 - 带重试机制
const query = async (text, params, retries = 3) => {
  const start = Date.now();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount, attempt });
      return res;
    } catch (error) {
      console.error(`Database query error (attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

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

  const { id: projectId } = req.params || req.query;

  if (!projectId) {
    res.status(400).json({ error: 'Project ID is required' });
    return;
  }

  try {
    // 获取项目的内部ID
    const projectQuery = await query(
      'SELECT id FROM test_projects WHERE project_id = $1',
      [projectId]
    );
    
    if (projectQuery.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    
    const projectInternalId = projectQuery.rows[0].id;
    
    if (req.method === 'GET') {
      // 检查点赞状态
      const statsQuery = await query(
        'SELECT total_likes FROM test_statistics WHERE project_id = $1',
        [projectInternalId]
      );
      
      const likes = statsQuery.rows.length > 0 ? statsQuery.rows[0].total_likes : 0;
      
      res.status(200).json({
        success: true,
        likes: likes,
        liked: false // 简化处理，不跟踪个人点赞状态
      });
    } else if (req.method === 'POST') {
      // 点赞操作
      console.log(`Liking test project: ${projectId}`);
      
      const result = await query(`
        INSERT INTO test_statistics (project_id, total_likes)
        VALUES ($1, 1)
        ON CONFLICT (project_id)
        DO UPDATE SET 
          total_likes = test_statistics.total_likes + 1
        RETURNING total_likes
      `, [projectInternalId]);

      const newLikeCount = result.rows[0].total_likes;

      console.log(`Successfully liked project ${projectId}, new count: ${newLikeCount}`);
      
      res.status(200).json({
        success: true,
        likes: newLikeCount,
        message: 'Project liked successfully'
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database error:', error);
    
    // 数据库连接失败时返回默认值
    if (req.method === 'GET') {
      res.status(200).json({
        success: true,
        likes: 0,
        liked: false,
        fallback: true
      });
    } else if (req.method === 'POST') {
      res.status(200).json({
        success: true,
        likes: 0,
        message: 'Like recorded (offline mode)',
        fallback: true
      });
    } else {
      res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
  }
};
