// 统一的测试API处理所有测试相关请求
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

    // 处理路径：/api/tests/{id}/questions
    if (pathParts.length === 4 && pathParts[1] === 'tests' && pathParts[3] === 'questions') {
      const projectId = pathParts[2];
      return await handleQuestionsRequest(req, res, projectId);
    }

    // 处理路径：/api/tests/{id}/like-status
    if (pathParts.length === 4 && pathParts[1] === 'tests' && pathParts[3] === 'like-status') {
      const projectId = pathParts[2];
      return await handleLikeStatusRequest(req, res, projectId);
    }

    // 处理路径：/api/tests/{id}/like (POST)
    if (pathParts.length === 4 && pathParts[1] === 'tests' && pathParts[3] === 'like' && req.method === 'POST') {
      const projectId = pathParts[2];
      return await handleLikeRequest(req, res, projectId);
    }

    // 注意：单个项目请求由 api/tests/[id].js 处理
    // 这里只处理子路径请求

    // 处理路径：/api/tests (获取所有项目)
    if (pathParts.length === 2 && pathParts[1] === 'tests') {
      return await handleAllProjectsRequest(req, res);
    }

    // 如果没有匹配的路径，返回404
    res.status(404).json({ 
      success: false,
      error: 'API endpoint not found' 
    });

  } catch (error) {
    console.error('Tests API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// 处理单个项目请求
async function handleSingleProjectRequest(req, res, projectId) {
  // 设置超时处理
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database query timeout')), 8000); // 8秒超时
  });

  const queryPromise = (async () => {
    try {
      console.log(`🔍 获取测试项目: ${projectId}`);
      
      // 先测试数据库连接
      await query('SELECT 1 as test');
      console.log('✅ 数据库连接正常');

      const result = await query(`
      SELECT
        tp.project_id, tp.name, tp.name_en, tp.image_url, tp.intro, tp.intro_en,
        tp.test_type, tp.pricing_type, tp.estimated_time, tp.question_count,
        COALESCE(ts.total_tests, 0) as total_tests, 
        COALESCE(ts.total_likes, 0) as total_likes
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
      image: row.image_url, // 兼容字段
      imageUrl: row.image_url,
      intro: row.intro,
      introEn: row.intro_en || row.intro,
      type: row.test_type,
      pricingType: row.pricing_type || '免费', // 默认免费
      estimatedTime: row.estimated_time || 10, // 默认10分钟
      questionCount: row.question_count || 10, // 默认10题
      testedCount: parseInt(row.total_tests) || 0,
      likes: parseInt(row.total_likes) || 0
    };

      console.log(`✅ 成功获取项目: ${projectId}`);
      return { project };

    } catch (error) {
      console.error('❌ 数据库查询失败:', error.message);
      throw error;
    }
  })();

  try {
    const result = await Promise.race([queryPromise, timeoutPromise]);
    res.status(200).json({ 
      success: true, 
      project: result.project 
    });
  } catch (error) {
    console.error('❌ 获取测试项目失败:', error);
    // 返回回退数据而不是错误，避免页面崩溃
    res.status(200).json({ 
      success: true,
      project: {
        id: projectId,
        name: 'Test Project',
        nameEn: 'Test Project',
        image: '/assets/images/logo.png',
        intro: 'Test project description',
        introEn: 'Test project description',
        type: 'default',
        pricingType: '免费',
        estimatedTime: 10,
        questionCount: 10,
        testedCount: 0,
        likes: 0
      },
      fallback: true,
      error: error.message
    });
  }
}

// 处理所有项目请求
async function handleAllProjectsRequest(req, res) {
  try {
    console.log('🔍 获取所有测试项目');

    const result = await query(`
      SELECT
        tp.project_id, tp.name, tp.name_en, tp.image_url, tp.intro, tp.intro_en,
        tp.test_type, tp.pricing_type, tp.estimated_time, tp.question_count,
        COALESCE(ts.total_tests, 0) as total_tests, 
        COALESCE(ts.total_likes, 0) as total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.is_active = true
      ORDER BY tp.created_at ASC
    `);

    const projects = result.rows.map(row => ({
      id: row.project_id,
      name: row.name,
      nameEn: row.name_en,
      image: row.image_url, // 兼容字段
      imageUrl: row.image_url,
      intro: row.intro,
      introEn: row.intro_en || row.intro,
      testType: row.test_type,
      pricingType: row.pricing_type || '免费', // 默认免费
      estimatedTime: row.estimated_time || 10, // 默认10分钟
      questionCount: row.question_count || 10, // 默认10题
      testedCount: parseInt(row.total_tests) || 0,
      likes: parseInt(row.total_likes) || 0
    }));

    console.log(`✅ 成功获取 ${projects.length} 个测试项目`);
    res.status(200).json({ 
      success: true, 
      projects: projects 
    });

  } catch (error) {
    console.error('❌ 获取测试项目列表失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// 处理题目请求
async function handleQuestionsRequest(req, res, projectId) {
  // 设置超时处理
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database query timeout')), 8000); // 8秒超时
  });

  const queryPromise = (async () => {
    try {
      console.log(`🔍 获取题目，项目ID: ${projectId}`);
      
      // 先测试数据库连接
      await query('SELECT 1 as test');
      console.log('✅ 数据库连接正常');

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
    
    // 获取问题列表
    const questionsQuery = await query(`
      SELECT 
        q.id, 
        q.question_text_en as question_text,
        q.order_index,
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
      GROUP BY q.id, q.question_text_en, q.order_index
      ORDER BY q.order_index
    `, [projectInternalId]);
    
    const questions = questionsQuery.rows.map(row => ({
      id: row.id,
      text: row.question_text,
      order_index: row.order_index,
      opts: row.options || []
    }));
    
      console.log(`✅ 成功获取题目，项目ID: ${projectId}，题目数量: ${questions.length}`);
      
      return { questions };

    } catch (error) {
      console.error('❌ 数据库查询失败:', error.message);
      throw error;
    }
  })();

  try {
    const result = await Promise.race([queryPromise, timeoutPromise]);
    res.status(200).json({
      success: true,
      questions: result.questions
    });
  } catch (error) {
    console.error('❌ 获取题目失败:', error);
    // 返回空题目列表而不是错误，让前端使用回退数据
    res.status(200).json({ 
      success: true,
      questions: [],
      fallback: true,
      error: error.message
    });
  }
}

// 处理点赞状态请求
async function handleLikeStatusRequest(req, res, projectId) {
  // 设置超时处理
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database query timeout')), 5000); // 5秒超时
  });

  const queryPromise = (async () => {
    try {
      console.log(`🔍 检查点赞状态，项目ID: ${projectId}`);
      
      // 先测试数据库连接
      await query('SELECT 1 as test');
      console.log('✅ 数据库连接正常');

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
}

// 处理点赞请求
async function handleLikeRequest(req, res, projectId) {
  try {
    console.log(`👍 点赞项目: ${projectId}`);
    
    // 获取项目的内部ID
    const projectQuery = await query(
      'SELECT id FROM test_projects WHERE project_id = $1 AND is_active = true',
      [projectId]
    );
    
    if (projectQuery.rows.length === 0) {
      res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
      return;
    }
    
    const projectInternalId = projectQuery.rows[0].id;
    
    // 更新点赞数
    const result = await query(`
      INSERT INTO test_statistics (project_id, total_likes)
      VALUES ($1, 1)
      ON CONFLICT (project_id)
      DO UPDATE SET 
        total_likes = test_statistics.total_likes + 1
      RETURNING total_likes
    `, [projectInternalId]);

    const newLikeCount = result.rows[0].total_likes;
    console.log(`✅ 点赞成功，项目ID: ${projectId}，新点赞数: ${newLikeCount}`);
    
    res.status(200).json({
      success: true,
      likes: newLikeCount,
      message: 'Project liked successfully'
    });

  } catch (error) {
    console.error('❌ 点赞失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}
