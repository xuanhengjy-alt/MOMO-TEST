// 获取测试题目的API端点
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
    console.log(`Fetching questions for project: ${projectId}`);
    
    // 查询数据库获取测试题目
    const result = await pool.query(`
      SELECT 
        q.id,
        q.question_text,
        q.question_order,
        qo.id as option_id,
        qo.option_text,
        qo.option_value,
        qo.option_order
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE q.project_id = $1
      ORDER BY q.question_order, qo.option_order
    `, [projectId]);

    // 组织题目数据
    const questionsMap = new Map();
    
    result.rows.forEach(row => {
      if (!questionsMap.has(row.id)) {
        questionsMap.set(row.id, {
          id: row.id,
          text: row.question_text,
          order: row.question_order,
          options: []
        });
      }
      
      if (row.option_id) {
        questionsMap.get(row.id).options.push({
          id: row.option_id,
          text: row.option_text,
          value: row.option_value,
          order: row.option_order
        });
      }
    });

    const questions = Array.from(questionsMap.values()).sort((a, b) => a.order - b.order);

    console.log(`Successfully fetched ${questions.length} questions for project ${projectId}`);
    
    res.status(200).json({ questions });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
};
