// 处理测试相关的API请求
const { query } = require('../config/database');

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
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    console.log('Tests API request:', {
      method: req.method,
      url: req.url,
      pathParts: pathParts
    });

    // 处理 like-status 请求: /api/tests/{id}/like-status
    if (pathParts.length === 3 && pathParts[2] === 'like-status') {
      const projectId = pathParts[1];
      
      console.log(`Checking like status for project: ${projectId}`);

      // 获取项目的内部ID
      const projectQuery = await query(
        'SELECT id FROM test_projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectQuery.rows.length === 0) {
        console.log(`Project not found: ${projectId}`);
        res.status(404).json({ 
          success: false,
          error: 'Project not found' 
        });
        return;
      }
      
      const projectInternalId = projectQuery.rows[0].id;
      
      // 获取点赞统计
      const statsQuery = await query(
        'SELECT total_likes FROM test_statistics WHERE project_id = $1',
        [projectInternalId]
      );
      
      const likes = statsQuery.rows.length > 0 ? statsQuery.rows[0].total_likes : 0;
      
      console.log(`Like status for ${projectId}: ${likes} likes`);
      
      res.status(200).json({
        success: true,
        likes: likes,
        liked: false // 简化处理，不跟踪个人点赞状态
      });
      return;
    }

    // 处理 questions 请求: /api/tests/{id}/questions
    if (pathParts.length === 3 && pathParts[2] === 'questions') {
      const projectId = pathParts[1];
      
      console.log(`Fetching questions for project: ${projectId}`);

      // 获取项目的内部ID
      const projectQuery = await query(
        'SELECT id FROM test_projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectQuery.rows.length === 0) {
        console.log(`Project not found: ${projectId}`);
        res.status(404).json({ 
          success: false,
          error: 'Project not found' 
        });
        return;
      }
      
      const projectInternalId = projectQuery.rows[0].id;
      
      // 获取问题列表
      const questionsQuery = await query(
        'SELECT id, question_text, options FROM test_questions WHERE project_id = $1 ORDER BY order_index',
        [projectInternalId]
      );
      
      const questions = questionsQuery.rows.map(row => ({
        id: row.id,
        text: row.question_text,
        options: row.options
      }));
      
      console.log(`Fetched ${questions.length} questions for ${projectId}`);
      
      res.status(200).json({
        success: true,
        questions: questions
      });
      return;
    }

    // 其他请求重定向到统一的测试API
    const unifiedHandler = require('./tests-unified.js');
    return unifiedHandler(req, res);
    
  } catch (error) {
    console.error('Tests API error:', error);
    
    // 如果是like-status或questions请求失败，返回默认值
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    if (pathParts.length === 3 && (pathParts[2] === 'like-status' || pathParts[2] === 'questions')) {
      if (pathParts[2] === 'like-status') {
        res.status(200).json({
          success: true,
          likes: 0,
          liked: false,
          fallback: true
        });
      } else if (pathParts[2] === 'questions') {
        res.status(200).json({
          success: true,
          questions: [],
          fallback: true
        });
      }
      return;
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
