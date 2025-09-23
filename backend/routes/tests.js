const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const TestLogic = require('../services/testLogic');

// 获取所有测试项目
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        tp.*,
        ts.total_tests,
        ts.total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.is_active = true
      ORDER BY tp.created_at ASC
    `);

    const projects = result.rows.map(row => ({
      id: row.project_id,
      name: row.name_en,
      nameEn: row.name_en,
      image: row.image_url,
      intro: row.intro_en,
      introEn: row.intro_en,
      type: row.test_type,
      pricingType: row.pricing_type,
      estimatedTime: row.estimated_time,
      questionCount: row.question_count,
      testedCount: row.total_tests || 0,
      likes: row.total_likes || 0,
      isJumpType: !!row.is_jump_type
    }));

    res.json({ projects });
  } catch (error) {
    console.error('Error fetching test projects:', error);
    res.status(500).json({ error: 'Failed to fetch test projects' });
  }
});

// 获取特定测试项目详情
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await query(`
      SELECT 
        tp.*,
        ts.total_tests,
        ts.total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.project_id = $1 AND tp.is_active = true
    `, [projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test project not found' });
    }

    const project = result.rows[0];
    res.json({
      id: project.project_id,
      name: project.name_en,
      nameEn: project.name_en,
      image: project.image_url,
      intro: project.intro_en,
      introEn: project.intro_en,
      type: project.test_type,
      pricingType: project.pricing_type,
      estimatedTime: project.estimated_time,
      questionCount: project.question_count,
      testedCount: project.total_tests || 0,
      likes: project.total_likes || 0,
      isJumpType: !!project.is_jump_type
    });
  } catch (error) {
    console.error('Error fetching test project:', error);
    res.status(500).json({ error: 'Failed to fetch test project' });
  }
});

// 获取测试题目
router.get('/:projectId/questions', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // 首先获取项目信息
    const projectResult = await query(`
      SELECT id, test_type FROM test_projects 
      WHERE project_id = $1 AND is_active = true
    `, [projectId]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test project not found' });
    }

    const project = projectResult.rows[0];
    
    // 从数据库获取题目
    const questionsResult = await query(`
      SELECT 
        q.order_index as question_number,
        q.question_text_en,
        q.question_type,
        json_agg(
          json_build_object(
            'option_number', o.option_number,
            'option_text', o.option_text_en,
            'option_text_en', o.option_text_en,
            'score_value', o.score_value
          ) ORDER BY o.option_number
        ) as options
      FROM questions q
      LEFT JOIN question_options o ON q.id = o.question_id
      WHERE q.project_id = $1
      GROUP BY q.id, q.order_index, q.question_text_en, q.question_type
      ORDER BY q.order_index
    `, [project.id]);

    const questions = questionsResult.rows.map(row => ({
      n: row.question_number,
      t: row.question_text_en,
      opts: row.options
        .sort((a,b) => a.option_number - b.option_number)
        .map(opt => {
          const extra = opt.score_value || {};
          const mapped = { n: opt.option_number, text: opt.option_text_en };
          if (extra && typeof extra === 'object') {
            if (extra.next != null) mapped.next = extra.next;
            if (extra.resultCode) mapped.resultCode = extra.resultCode;
          }
          return mapped;
        })
    }));

    res.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// 点赞/取消点赞测试项目
router.post('/:projectId/like', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { action = 'toggle' } = req.body; // 'like', 'unlike', 'toggle'
    
    // 获取用户标识（使用IP地址作为简单标识）
    const userIdentifier = req.ip || req.connection.remoteAddress || 'unknown';
    
    // 获取项目内部ID
    const projectResult = await query(`
      SELECT id FROM test_projects 
      WHERE project_id = $1 AND is_active = true
    `, [projectId]);
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test project not found' });
    }
    
    const projectInternalId = projectResult.rows[0].id;
    
    // 检查用户是否已经点赞
    const likeRecord = await query(`
      SELECT id FROM user_likes 
      WHERE project_id = $1 AND user_identifier = $2
    `, [projectInternalId, userIdentifier]);
    
    const isLiked = likeRecord.rows.length > 0;
    let shouldLike = false;
    
    // 根据action决定是否点赞
    if (action === 'like') {
      shouldLike = true;
    } else if (action === 'unlike') {
      shouldLike = false;
    } else { // toggle
      shouldLike = !isLiked;
    }
    
    if (shouldLike && !isLiked) {
      // 点赞
      await query(`
        INSERT INTO user_likes (project_id, user_identifier, created_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
      `, [projectInternalId, userIdentifier]);
      
      await query(`
        INSERT INTO test_statistics (project_id, total_likes, last_updated)
        VALUES ($1, 1, CURRENT_TIMESTAMP)
        ON CONFLICT (project_id) 
        DO UPDATE SET 
          total_likes = test_statistics.total_likes + 1,
          last_updated = CURRENT_TIMESTAMP
      `, [projectInternalId]);
      
    } else if (!shouldLike && isLiked) {
      // 取消点赞
      await query(`
        DELETE FROM user_likes 
        WHERE project_id = $1 AND user_identifier = $2
      `, [projectInternalId, userIdentifier]);
      
      await query(`
        UPDATE test_statistics 
        SET total_likes = GREATEST(total_likes - 1, 0),
            last_updated = CURRENT_TIMESTAMP
        WHERE project_id = $1
      `, [projectInternalId]);
    }

    // 返回更新后的点赞数和状态
    const result = await query(`
      SELECT ts.total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.project_id = $1
    `, [projectId]);

    res.json({ 
      success: true, 
      likes: result.rows[0]?.total_likes || 0,
      isLiked: shouldLike
    });
  } catch (error) {
    console.error('Error updating likes:', error);
    res.status(500).json({ error: 'Failed to update likes' });
  }
});

// 检查用户点赞状态
router.get('/:projectId/like-status', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userIdentifier = req.ip || req.connection.remoteAddress || 'unknown';
    
    // 获取项目内部ID
    const projectResult = await query(`
      SELECT id FROM test_projects 
      WHERE project_id = $1 AND is_active = true
    `, [projectId]);
    
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test project not found' });
    }
    
    const projectInternalId = projectResult.rows[0].id;
    
    // 检查用户是否已经点赞
    const likeRecord = await query(`
      SELECT id FROM user_likes 
      WHERE project_id = $1 AND user_identifier = $2
    `, [projectInternalId, userIdentifier]);
    
    const isLiked = likeRecord.rows.length > 0;
    
    res.json({ 
      success: true, 
      isLiked: isLiked
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Failed to check like status' });
  }
});

// 获取项目的结果类型与分析（英文优先）
router.get('/:projectId/analyses', async (req, res) => {
  try {
    const { projectId } = req.params;
    const pr = await query(`
      SELECT id FROM test_projects WHERE project_id = $1 AND is_active = true
    `, [projectId]);
    if (!pr.rows.length) return res.status(404).json({ error: 'Test project not found' });

    const rows = await query(`
      SELECT type_code, type_name_en, description_en, analysis_en
      FROM result_types
      WHERE project_id = $1
      ORDER BY type_code ASC
    `, [pr.rows[0].id]);

    res.json({
      items: rows.rows.map(r => ({
        code: r.type_code,
        name: r.type_name_en,
        nameEn: r.type_name_en,
        description: r.description_en,
        descriptionEn: r.description_en,
        analysis: r.analysis_en,
        analysisEn: r.analysis_en
      }))
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

module.exports = router;
