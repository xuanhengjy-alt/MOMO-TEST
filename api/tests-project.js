// 获取特定测试项目的API端点
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

  // 从URL路径中提取projectId
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/');
  const projectId = pathParts[pathParts.length - 1];

  if (!projectId || projectId === 'tests-project') {
    res.status(400).json({ error: 'Project ID is required' });
    return;
  }

  try {
    console.log(`Fetching test project: ${projectId}`);
    
    // 查询数据库获取特定测试项目
    const result = await pool.query(`
      SELECT 
        tp.*,
        ts.total_tests,
        ts.total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.project_id = $1 AND tp.is_active = true
    `, [projectId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Test project not found' });
      return;
    }

    const row = result.rows[0];
    const project = {
      id: row.project_id,
      name: row.name,
      nameEn: row.name_en,
      image: row.image,
      intro: row.intro,
      type: row.type,
      testedCount: row.total_tests || 0,
      likes: row.total_likes || 0
    };

    console.log('Successfully fetched project:', project);
    
    res.status(200).json(project);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
};
