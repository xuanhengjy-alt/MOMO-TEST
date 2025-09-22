// 处理点赞状态请求 /api/tests/[id]/like-status
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

  // 设置超时处理
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database query timeout')), 5000); // 5秒超时
  });

  const queryPromise = (async () => {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      console.log(`🔍 检查点赞状态，项目ID: ${id}`);
      
      // 先测试数据库连接
      await query('SELECT 1 as test');
      console.log('✅ 数据库连接正常');

      // 获取项目的内部ID
      const projectQuery = await query(
        'SELECT id FROM test_projects WHERE project_id = $1 AND is_active = true',
        [id]
      );
      
      if (projectQuery.rows.length === 0) {
        console.log(`❌ 项目未找到: ${id}`);
        return res.status(404).json({ 
          success: false,
          error: 'Project not found' 
        });
      }
      
      const projectInternalId = projectQuery.rows[0].id;
      
      // 获取统计信息
      const statsQuery = await query(`
        SELECT COALESCE(ts.total_likes, 0) as total_likes
        FROM test_projects tp
        LEFT JOIN test_statistics ts ON tp.id = ts.project_id
        WHERE tp.id = $1
      `, [projectInternalId]);
      
      const likes = statsQuery.rows.length > 0 ? statsQuery.rows[0].total_likes : 0;
      
      console.log(`✅ 点赞状态，项目ID: ${id}，点赞数: ${likes}`);
      
      return { likes };

    } catch (error) {
      console.error('❌ 数据库查询失败:', error.message);
      throw error;
    }
  })();

  try {
    const result = await Promise.race([queryPromise, timeoutPromise]);
    res.status(200).json({
      success: true,
      likes: result.likes,
      liked: false // 简化处理，不跟踪个人点赞状态
    });
  } catch (error) {
    console.error('❌ 检查点赞状态失败:', error);
    // 返回默认状态而不是错误，避免影响页面功能
    res.status(200).json({ 
      success: true,
      likes: 0,
      liked: false,
      fallback: true,
      error: error.message
    });
  }
};
