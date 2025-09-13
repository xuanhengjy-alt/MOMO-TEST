// Vercel API端点 - 使用默认路由
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 格式化数字的工具函数
function formatNumber(num) {
  if (typeof num === 'string') return num;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M+';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K+';
  } else {
    return num.toString();
  }
}

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
  
  try {
    console.log('Attempting to connect to database...');
    
    // 查询数据库获取测试项目
    const result = await pool.query(`
      SELECT 
        tp.project_id,
        tp.name,
        tp.name_en,
        tp.image_url,
        tp.intro,
        tp.intro_en,
        tp.test_type,
        ts.total_tests,
        ts.total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.is_active = true
      ORDER BY tp.created_at ASC
    `);

    const projects = result.rows.map(row => ({
      id: row.project_id,
      name: row.name_en,
      nameEn: row.name_en,
      image: row.image_url,
      intro: row.intro_en,
      introEn: row.intro_en,
      type: row.test_type,
      testedCount: row.total_tests ? formatNumber(row.total_tests) : '0',
      likes: row.total_likes || 0
    }));

    console.log('Successfully fetched projects from database:', projects.length);
    
    res.status(200).json({ 
      success: true,
      projects: projects 
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
};
