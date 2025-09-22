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
      
      // 先测试数据库连接
      try {
        await query('SELECT 1 as test');
        console.log('✅ 数据库连接正常');
      } catch (dbError) {
        console.error('❌ 数据库连接失败:', dbError.message);
        throw new Error(`Database connection failed: ${dbError.message}`);
      }

    // 获取项目信息
    console.log('🔍 执行数据库查询，项目ID:', id);
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
    console.log('✅ 数据库查询完成，结果行数:', projectResult.rows.length);

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
      // 返回回退数据而不是500错误，避免页面崩溃
      const fallbackProject = {
        id: id,
        name: 'Test Project',
        nameEn: 'Test Project',
        description: 'Test project description',
        descriptionEn: 'Test project description',
        introEn: 'Test project description',
        intro: 'Test project description',
        image: '/assets/images/logo.png',
        imageUrl: '/assets/images/logo.png',
        testedCount: 0,
        totalTests: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        pricingType: '免费',
        estimatedTime: 10,
        questionCount: 10
      };
      
      res.status(200).json({
        success: true,
        project: fallbackProject,
        fallback: true,
        error: error.message
      });
    }
  })();

  try {
    await Promise.race([handlerPromise, timeoutPromise]);
  } catch (error) {
    console.error('❌ API超时或失败:', error);
    if (!res.headersSent) {
      // 返回回退数据而不是500错误
      const fallbackProject = {
        id: req.query.id || 'unknown',
        name: 'Test Project',
        nameEn: 'Test Project',
        description: 'Test project description',
        descriptionEn: 'Test project description',
        introEn: 'Test project description',
        intro: 'Test project description',
        image: '/assets/images/logo.png',
        imageUrl: '/assets/images/logo.png',
        testedCount: 0,
        totalTests: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        pricingType: '免费',
        estimatedTime: 10,
        questionCount: 10
      };
      
      res.status(200).json({
        success: true,
        project: fallbackProject,
        fallback: true,
        error: error.message
      });
    }
  }
};
