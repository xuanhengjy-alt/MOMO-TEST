const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');
const TestLogic = require('../services/testLogic');

// 提交测试结果
router.post('/', async (req, res) => {
  try {
    const { projectId, answers, sessionId, ipAddress, userAgent } = req.body;
    
    if (!projectId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // 获取项目信息
    const projectResult = await query(`
      SELECT id, test_type FROM test_projects 
      WHERE project_id = $1 AND is_active = true
    `, [projectId]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test project not found' });
    }

    const project = projectResult.rows[0];

    // 计算测试结果
    const testResult = await TestLogic.calculateResult(project.test_type, answers);
    
    // 使用事务保存结果
    const result = await transaction(async (client) => {
      // 保存测试结果
      const resultQuery = await client.query(`
        INSERT INTO test_results (
          project_id, session_id, user_answers, calculated_result,
          result_summary, result_analysis, result_summary_en, result_analysis_en,
          ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, completed_at
      `, [
        project.id,
        sessionId || null,
        JSON.stringify(answers),
        JSON.stringify(testResult),
        testResult.summary || '',
        testResult.analysis || '',
        testResult.summaryEn || '',
        testResult.analysisEn || '',
        ipAddress || null,
        userAgent || null
      ]);

      // 更新测试统计
      await client.query(`
        INSERT INTO test_statistics (project_id, total_tests, last_updated)
        VALUES ($1, 1, CURRENT_TIMESTAMP)
        ON CONFLICT (project_id) 
        DO UPDATE SET 
          total_tests = test_statistics.total_tests + 1,
          last_updated = CURRENT_TIMESTAMP
      `, [project.id]);

      return resultQuery.rows[0];
    });

    res.json({
      success: true,
      resultId: result.id,
      completedAt: result.completed_at,
      result: testResult
    });

  } catch (error) {
    console.error('Error saving test result:', error);
    res.status(500).json({ error: 'Failed to save test result' });
  }
});

// 获取测试结果
router.get('/:resultId', async (req, res) => {
  try {
    const { resultId } = req.params;
    
    const result = await query(`
      SELECT 
        tr.*,
        tp.project_id,
        tp.name as project_name,
        tp.test_type
      FROM test_results tr
      JOIN test_projects tp ON tr.project_id = tp.id
      WHERE tr.id = $1
    `, [resultId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Test result not found' });
    }

    const testResult = result.rows[0];
    res.json({
      id: testResult.id,
      projectId: testResult.project_id,
      projectName: testResult.project_name,
      testType: testResult.test_type,
      userAnswers: testResult.user_answers,
      calculatedResult: testResult.calculated_result,
      resultSummary: testResult.result_summary,
      resultAnalysis: testResult.result_analysis,
      resultSummaryEn: testResult.result_summary_en,
      resultAnalysisEn: testResult.result_analysis_en,
      completedAt: testResult.completed_at
    });
  } catch (error) {
    console.error('Error fetching test result:', error);
    res.status(500).json({ error: 'Failed to fetch test result' });
  }
});

// 获取测试统计信息
router.get('/stats/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await query(`
      SELECT 
        ts.total_tests,
        ts.total_likes,
        ts.last_updated
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.project_id = $1
    `, [projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const stats = result.rows[0];
    res.json({
      totalTests: stats.total_tests || 0,
      totalLikes: stats.total_likes || 0,
      lastUpdated: stats.last_updated
    });
  } catch (error) {
    console.error('Error fetching test statistics:', error);
    res.status(500).json({ error: 'Failed to fetch test statistics' });
  }
});

module.exports = router;
