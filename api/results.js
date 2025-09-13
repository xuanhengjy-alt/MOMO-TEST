// 提交测试结果的API端点
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

  try {
    const { projectId, answers, sessionId, ipAddress, userAgent } = req.body;

    if (!projectId || !answers) {
      res.status(400).json({ error: 'projectId and answers are required' });
      return;
    }

    console.log(`Submitting test result for project: ${projectId}`);
    
    // 开始事务
    await pool.query('BEGIN');

    try {
      // 获取项目的内部ID
      const projectQuery = await pool.query(
        'SELECT id FROM test_projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectQuery.rows.length === 0) {
        throw new Error('Project not found');
      }
      
      const projectInternalId = projectQuery.rows[0].id;

      // 插入测试结果
      const resultQuery = `
        INSERT INTO test_results (project_id, session_id, user_answers, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, completed_at
      `;
      
      const result = await pool.query(resultQuery, [
        projectInternalId,
        sessionId,
        JSON.stringify(answers),
        ipAddress,
        userAgent
      ]);

      const testResultId = result.rows[0].id;

      // 更新统计信息
      await pool.query(`
        INSERT INTO test_statistics (project_id, total_tests)
        VALUES ($1, 1)
        ON CONFLICT (project_id)
        DO UPDATE SET 
          total_tests = test_statistics.total_tests + 1,
          last_updated = NOW()
      `, [projectInternalId]);

      // 提交事务
      await pool.query('COMMIT');

      console.log(`Successfully submitted test result with ID: ${testResultId}`);
      
      res.status(200).json({
        success: true,
        resultId: testResultId,
        message: 'Test result submitted successfully'
      });

    } catch (error) {
      // 回滚事务
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
};
