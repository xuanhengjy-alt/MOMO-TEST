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
        tp.*,
        ts.total_tests,
        ts.total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.is_active = true
      ORDER BY tp.created_at ASC
    `);

    const projects = result.rows.map(row => ({
      id: row.project_id,
      name: row.name,
      nameEn: row.name_en,
      image: row.image,
      intro: row.intro,
      type: row.type,
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
    
    // 如果数据库连接失败，返回fallback数据
    const fallbackProjects = [
      {
        id: 'mbti',
        name: 'MBTI Career Personality Test',
        nameEn: 'MBTI Career Personality Test',
        image: 'assets/images/mbti-career-personality-test.png',
        intro: 'The MBTI personality theory is based on the classification of psychological types by Carl Jung, later developed by Katharine Cook Briggs and Isabel Briggs Myers.',
        type: 'mbti',
        testedCount: '120K+',
        likes: 13000
      },
      {
        id: 'disc40',
        name: 'DISC Personality Test',
        nameEn: 'DISC Personality Test',
        image: 'assets/images/disc-personality-test.png',
        intro: 'In the 1920s, American psychologist William Moulton Marston developed a theory to explain human emotional responses.',
        type: 'disc40',
        testedCount: '50K+',
        likes: 4500
      }
    ];
    
    console.log('Using fallback data due to database error');
    res.status(200).json({ 
      success: false,
      message: 'Using fallback data',
      projects: fallbackProjects 
    });
  }
};
