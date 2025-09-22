// 处理单个测试项目请求 /api/tests/[id]
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

  // 设置超时处理
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 8000); // 8秒超时
  });

  const handlerPromise = (async () => {
    try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Project ID is required'
      });
    }

    console.log('🔍 获取测试项目详情，ID:', id);

    // 获取项目信息
    const projectResult = await query(`
      SELECT 
        tp.id,
        tp.project_id,
        tp.name,
        tp.name_en,
        tp.description,
        tp.description_en,
        tp.intro_en,
        tp.image_url,
        tp.is_active,
        tp.created_at,
        COALESCE(ts.total_tests, 0) as total_tests
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.project_id = $1 AND tp.is_active = true
    `, [id]);

    if (projectResult.rows.length === 0) {
      console.log(`❌ 项目未找到: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const project = projectResult.rows[0];
    console.log(`✅ 成功获取项目: ${id}`);

    const projectData = {
      id: project.project_id,
      name: project.name || project.name_en,
      nameEn: project.name_en,
      description: project.description || project.description_en,
      descriptionEn: project.description_en,
      introEn: project.intro_en,
      intro: project.intro_en || project.description_en, // 兼容字段
      image: project.image_url, // 兼容字段
      imageUrl: project.image_url,
      testedCount: parseInt(project.total_tests) || 0, // 兼容字段
      totalTests: parseInt(project.total_tests) || 0,
      isActive: project.is_active,
      createdAt: project.created_at,
      // 添加默认值以确保前端显示正常
      pricingType: '免费', // 默认免费
      estimatedTime: 10, // 默认10分钟
      questionCount: 10 // 默认10题
    };

    res.status(200).json({
      success: true,
      project: projectData
    });

    } catch (error) {
      console.error('❌ 获取项目失败:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    }
  })();

  try {
    await Promise.race([handlerPromise, timeoutPromise]);
  } catch (error) {
    console.error('❌ API超时或失败:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Request timeout or server error',
        message: error.message
      });
    }
  }
};
