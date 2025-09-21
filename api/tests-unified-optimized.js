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

    // 处理路径：/api/tests/{id}
    if (pathParts.length === 3 && pathParts[1] === 'tests') {
      const projectId = pathParts[2];
      return await handleSingleProjectRequest(req, res, projectId);
    }

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
  try {
    console.log(`🔍 获取测试项目: ${projectId}`);

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

    console.log(`✅ 成功获取项目: ${projectId}`);
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
}

// 处理所有项目请求
async function handleAllProjectsRequest(req, res) {
  try {
    console.log('🔍 获取所有测试项目');

    const result = await query(`
      SELECT
        tp.project_id, tp.name, tp.name_en, tp.image_url, tp.intro, tp.intro_en,
        tp.test_type, tp.pricing_type, ts.total_tests, ts.total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.is_active = true
      ORDER BY tp.created_at ASC
    `);

    const projects = result.rows.map(row => ({
      id: row.project_id,
      name: row.name,
      nameEn: row.name_en,
      imageUrl: row.image_url,
      intro: row.intro,
      introEn: row.intro_en || row.intro,
      testType: row.test_type,
      pricingType: row.pricing_type,
      testedCount: row.total_tests || 0,
      likes: row.total_likes || 0
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
  try {
    console.log(`🔍 获取题目，项目ID: ${projectId}`);

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
    
    console.log(`✅ 成功获取题目，项目ID: ${projectId}，题目数量: ${questions.length}`);
    
    res.status(200).json({
      success: true,
      questions: questions
    });
    
  } catch (error) {
    console.error('❌ 获取题目失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// 处理点赞状态请求
async function handleLikeStatusRequest(req, res, projectId) {
  try {
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
