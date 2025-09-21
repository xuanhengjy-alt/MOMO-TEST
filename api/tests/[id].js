// 处理单个测试项目的API请求: /api/tests/[id]
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
    
    if (!projectId) {
      res.status(400).json({ 
        success: false,
        error: 'Project ID is required' 
      });
      return;
    }

    console.log(`🔍 获取测试项目: ${projectId}`);

    // 从数据库获取项目信息
    const result = await query(`
      SELECT
        tp.project_id, tp.name, tp.name_en, tp.image_url, tp.intro, tp.intro_en,
        tp.test_type, tp.pricing_type, tp.estimated_time, tp.question_count,
        ts.total_tests, ts.total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.project_id = $1 AND tp.is_active = true
    `, [projectId]);

    if (result.rows.length === 0) {
      console.log(`❌ 项目未找到: ${projectId}`);
      res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
      return;
    }

    const row = result.rows[0];
    const project = {
      id: row.project_id,
      name: row.name,
      nameEn: row.name_en,
      image: row.image_url,
      intro: row.intro,
      introEn: row.intro_en || row.intro,
      type: row.test_type,
      pricingType: row.pricing_type,
      estimatedTime: row.estimated_time,
      questionCount: row.question_count,
      testedCount: row.total_tests || 0,
      likes: row.total_likes || 0
    };

    console.log(`✅ 成功获取项目: ${projectId}`, {
      name: project.nameEn,
      type: project.type,
      testedCount: project.testedCount,
      likes: project.likes
    });

    res.status(200).json({ 
      success: true, 
      project: project 
    });

  } catch (error) {
    console.error('❌ 获取测试项目失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
};
