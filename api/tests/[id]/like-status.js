// 专门处理 /api/tests/[id]/like-status 请求
const { query } = require('../../config/database');

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
    const projectId = req.query.id;
    
    console.log(`[Dynamic Route] Checking like status for project: ${projectId}`);

    if (!projectId) {
      res.status(400).json({ 
        success: false,
        error: 'Project ID is required' 
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
    
    // 获取点赞统计
    const statsQuery = await query(
      'SELECT total_likes FROM test_statistics WHERE project_id = $1',
      [projectInternalId]
    );
    
    const likes = statsQuery.rows.length > 0 ? statsQuery.rows[0].total_likes : 0;
    
    console.log(`[Dynamic Route] Like status for ${projectId}: ${likes} likes`);
    
    res.status(200).json({
      success: true,
      likes: likes,
      liked: false // 简化处理，不跟踪个人点赞状态
    });
    
  } catch (error) {
    console.error('[Dynamic Route] Like status API error:', error);
    console.error('[Dynamic Route] Error stack:', error.stack);
    
    res.status(200).json({
      success: true,
      likes: 0,
      liked: false,
      fallback: true,
      error: error.message
    });
  }
};
