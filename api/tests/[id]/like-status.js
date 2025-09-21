// 处理点赞状态的API请求: /api/tests/[id]/like-status
const { query } = require('../../../config/database');

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
    
    if (!projectId) {
      res.status(400).json({ 
        success: false,
        error: 'Project ID is required' 
      });
      return;
    }

    console.log(`🔍 检查点赞状态，项目ID: ${projectId}`);

    // 获取项目的内部ID
    const projectQuery = await query(
      'SELECT id FROM test_projects WHERE project_id = $1 AND is_active = true',
      [projectId]
    );
    
    if (projectQuery.rows.length === 0) {
      console.log(`❌ 项目未找到: ${projectId}`);
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
    
    console.log(`✅ 点赞状态，项目ID: ${projectId}，点赞数: ${likes}`);
    
    res.status(200).json({
      success: true,
      likes: likes,
      liked: false // 简化处理，不跟踪个人点赞状态
    });
    
  } catch (error) {
    console.error('❌ 检查点赞状态失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
};
