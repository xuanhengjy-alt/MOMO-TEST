// 专门处理 /api/tests/[id]/questions 请求
const path = require('path');
const { query } = require(path.resolve(__dirname, '../../../config/database'));

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
    // 从URL路径中提取项目ID
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const projectId = pathParts[3]; // /api/tests/[id]/questions
    
    console.log(`[Dynamic Route] Fetching questions for project: ${projectId}`);
    console.log(`[Dynamic Route] URL: ${req.url}`);
    console.log(`[Dynamic Route] Path parts: ${JSON.stringify(pathParts)}`);

    if (!projectId) {
      res.status(400).json({ 
        success: false,
        error: 'Project ID is required',
        url: req.url,
        pathParts: pathParts
      });
      return;
    }

    // 获取项目的内部ID
    const projectQuery = await query(
      'SELECT id FROM test_projects WHERE project_id = $1',
      [projectId]
    );
    
    if (projectQuery.rows.length === 0) {
      console.log(`[Dynamic Route] Project not found: ${projectId}`);
      res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
      return;
    }
    
    const projectInternalId = projectQuery.rows[0].id;
    
    // 获取问题列表
    const questionsQuery = await query(`
      SELECT 
        q.id, 
        q.question_text_en as question_text,
        q.question_number as order_index,
        COALESCE(
          json_agg(
            json_build_object(
              'id', qo.id,
              'text', qo.option_text_en,
              'value', COALESCE(qo.score_value::text, '0')
            ) ORDER BY qo.option_number
          ) FILTER (WHERE qo.id IS NOT NULL),
          '[]'::json
        ) as options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE q.project_id = $1
      GROUP BY q.id, q.question_text_en, q.question_number
      ORDER BY q.question_number
    `, [projectInternalId]);
    
    const questions = questionsQuery.rows.map(row => ({
      id: row.id,
      text: row.question_text,
      opts: row.options || []
    }));
    
    console.log(`[Dynamic Route] Fetched ${questions.length} questions for ${projectId}`);
    
    res.status(200).json({
      success: true,
      questions: questions
    });
    
  } catch (error) {
    console.error('[Dynamic Route] Questions API error:', error);
    console.error('[Dynamic Route] Error stack:', error.stack);
    
    res.status(200).json({
      success: true,
      questions: [],
      fallback: true,
      error: error.message
    });
  }
};
