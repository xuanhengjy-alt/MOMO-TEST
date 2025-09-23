// 统一的结果API处理所有测试结果相关请求
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
    const debugFlag = url.searchParams.get('debug') === '1';
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    console.log('Results API request:', {
      method: req.method,
      url: req.url,
      pathParts: pathParts
    });

    // 处理路径：/api/results/stats/{id}
    if (pathParts.length === 4 && pathParts[1] === 'results' && pathParts[2] === 'stats') {
      const projectId = pathParts[3];
      return await handleStatsRequest(req, res, projectId);
    }

    // 处理路径：/api/results (提交测试结果)
    if (pathParts.length === 2 && pathParts[1] === 'results' && req.method === 'POST') {
      return await handleSubmitResult(req, res, { debug: debugFlag });
    }

    // 如果没有匹配的路径，返回404
    res.status(404).json({ 
      success: false,
      error: 'API endpoint not found' 
    });

  } catch (error) {
    console.error('Results API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// 处理统计请求
async function handleStatsRequest(req, res, projectId) {
  try {
    console.log(`📊 获取统计信息，项目ID: ${projectId}`);

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
    
    // 获取统计信息
    const statsQuery = await query(`
      SELECT 
        COALESCE(ts.total_tests, 0) as total_tests,
        COALESCE(ts.total_likes, 0) as total_likes,
        COUNT(DISTINCT tr.id) as actual_tests,
        COUNT(DISTINCT q.id) as total_questions
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      LEFT JOIN test_results tr ON tp.id = tr.project_id
      LEFT JOIN questions q ON tp.id = q.project_id
      WHERE tp.id = $1
      GROUP BY ts.total_tests, ts.total_likes
    `, [projectInternalId]);
    
    const stats = statsQuery.rows[0] || {
      total_tests: 0,
      total_likes: 0,
      actual_tests: 0,
      total_questions: 0
    };
    
    console.log(`✅ 成功获取统计信息，项目ID: ${projectId}`);
    
    res.status(200).json({
      success: true,
      stats: {
        totalTests: stats.total_tests,
        totalLikes: stats.total_likes,
        actualTests: stats.actual_tests,
        totalQuestions: stats.total_questions
      }
    });
    
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// 处理提交测试结果请求
async function handleSubmitResult(req, res, opts = {}) {
  const debug = !!opts.debug;
  // 设置超时处理（放宽到60秒，适配冷启动与首次DB访问）
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 60000);
  });

  const handlerPromise = (async () => {
    try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });

    const { projectId, answers, sessionId, ipAddress, userAgent } = body;
    const t0 = Date.now();
    
    console.log(`📝 提交测试结果，项目ID: ${projectId}`);

    if (!projectId || !answers || !Array.isArray(answers)) {
      res.status(400).json({ 
        success: false,
        error: 'Invalid request data' 
      });
      return;
    }

    // 获取项目的内部ID
    const projectQuery = await query(
      'SELECT id, test_type FROM test_projects WHERE project_id = $1 AND is_active = true',
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
    const testType = projectQuery.rows[0].test_type;
    
    // 计算测试结果
    const result = await calculateTestResult(testType, answers, projectInternalId, projectId);
    const t1 = Date.now();
    
    // 保存测试结果到数据库
    const resultId = await saveTestResult({
      projectId: projectInternalId,
      sessionId,
      answers,
      result,
      ipAddress,
      userAgent
    });
    
    // 更新统计信息
    await query(`
      INSERT INTO test_statistics (project_id, total_tests)
      VALUES ($1, 1)
      ON CONFLICT (project_id)
      DO UPDATE SET 
        total_tests = test_statistics.total_tests + 1
    `, [projectInternalId]);
    
      console.log(`✅ 测试结果提交成功，项目ID: ${projectId}，结果ID: ${resultId}`);
      
      const payload = {
        resultId: resultId,
        result: result
      };
      if (debug) {
        payload.debug = {
          calcDurationMs: (t1 - t0)
        };
        try {
          // 补充数据可用性探针（仅调试返回，不影响主流程）
          const qCount = await query(`
            SELECT COUNT(*) AS c
            FROM questions WHERE project_id = $1
          `, [projectInternalId]);
          const oCount = await query(`
            SELECT COUNT(*) AS c
            FROM question_options o
            JOIN questions q ON o.question_id = q.id
            WHERE q.project_id = $1
          `, [projectInternalId]);
          const rtCount = await query(`
            SELECT COUNT(*) AS c
            FROM result_types WHERE project_id = $1
          `, [projectInternalId]);
          payload.debug.probe = {
            projectInternalId,
            testType,
            questions: Number(qCount?.rows?.[0]?.c || 0),
            options: Number(oCount?.rows?.[0]?.c || 0),
            resultTypes: Number(rtCount?.rows?.[0]?.c || 0)
          };
          // 进一步诊断：复现服务层主查询，抓取具体 SQL 错误
          const diag = {};
          try {
            await query(`
              SELECT 
                COALESCE(
                  q.question_number,
                  ROW_NUMBER() OVER (ORDER BY q.id)
                ) AS qn,
                o.option_number,
                o.score_value
              FROM questions q
              JOIN question_options o ON o.question_id = q.id
              WHERE q.project_id = (SELECT id FROM test_projects WHERE project_id = 'social_anxiety_test')
              ORDER BY qn ASC, o.option_number ASC
            `);
            diag.qres = 'ok';
          } catch (e1) {
            diag.qres = String(e1 && e1.message || e1);
          }
          try {
            await query(`
              SELECT description_en, analysis_en
              FROM result_types rt
              JOIN test_projects tp ON rt.project_id = tp.id
              WHERE tp.project_id = 'social_anxiety_test' AND rt.type_code = 'SA_NONE'
              LIMIT 1
            `);
            diag.rt = 'ok';
          } catch (e2) {
            diag.rt = String(e2 && e2.message || e2);
          }
          payload.debug.diag = diag;
        } catch (e) {
          payload.debug.probeError = String(e && e.message || e);
        }
      }
      return payload;

    } catch (error) {
      console.error('❌ 处理测试结果失败:', error.message);
      throw error;
    }
  })();

  try {
    const result = await Promise.race([handlerPromise, timeoutPromise]);
    res.status(200).json({
      success: true,
      resultId: result.resultId,
      result: result.result,
      ...(result.debug ? { debug: result.debug } : {})
    });
  } catch (error) {
    console.error('❌ 提交测试结果失败:', error);
    // 返回错误结果而不是500错误，让前端显示错误信息
    const errorResponse = { 
      success: false,
      error: 'Unable to calculate test result. Please try again later.',
      result: {
        summary: 'Calculation Error',
        analysis: 'Unable to calculate test result. Please try again later.',
        type: 'error'
      }
    };
    
    // 只有在debug模式下才添加debug信息
    if (opts && opts.debug) {
      errorResponse.debug = { error: String(error && error.message || error) };
    }
    
    res.status(200).json(errorResponse);
  }
}

// 计算测试结果（统一委托 TestLogicService；个别特例仍可留在本文件）
async function calculateTestResult(testType, answers, projectInternalId, projectIdKey) {
  try {
    // 优先尝试通过服务层统一计算（覆盖大多数测试类型）
    try {
      const TestLogic = require('../backend/services/testLogic');
      if (TestLogic && typeof TestLogic.calculateResult === 'function') {
        const keyForService = (
          (testType && String(testType).toLowerCase()) ||
          (projectIdKey && String(projectIdKey).toLowerCase()) ||
          ''
        );
        const res = await TestLogic.calculateResult(keyForService, answers);
        if (res && res.summary) return res;

        // 显式按 projectId/testType 兜底调用常见量表，避免键不匹配导致空返回
        const k = keyForService;
        if (k) {
          if ((k === 'social_anxiety_test') && typeof TestLogic.scoreSocialAnxietyTest === 'function') {
            return await TestLogic.scoreSocialAnxietyTest(answers);
          }
          if ((k === 'anxiety_depression_test' || k === 'anxiety_and_depression_test') && typeof TestLogic.scoreAnxietyDepressionTest === 'function') {
            return await TestLogic.scoreAnxietyDepressionTest(answers);
          }
        }
      }
    } catch (_) {}

    // 定义需要数据库驱动计算的测试类型
    const dbDrivenTests = ['social_anxiety_test', 'anxiety_depression_test'];
    
    // 定义已有专门计算逻辑的测试类型
    const specializedTests = ['eq_test', 'mbti', 'enneagram', 'violence_index', 'personality_charm_1min', 'loneliness_1min'];
    
    const keyForService = (testType || '').toLowerCase() || (projectIdKey || '').toLowerCase();
    
    // 1. 优先尝试数据库驱动计算（适用于需要从DB读取score_value的测试）
    if (dbDrivenTests.includes(keyForService)) {
      console.log(`📊 使用数据库驱动计算: ${keyForService}`);
      return await calculateDbDrivenResult(answers, projectInternalId, keyForService);
    }
    
    // 2. 回退到本地专门实现（适用于有特殊逻辑的测试）
    if (specializedTests.includes(keyForService)) {
      console.log(`🔧 使用专门实现: ${keyForService}`);
      
      // 尝试通过TestLogicService处理
      try {
        const TestLogic = require('../backend/services/testLogic');
        if (TestLogic && typeof TestLogic.calculateResult === 'function') {
          const result = await TestLogic.calculateResult(keyForService, answers);
          if (result && result.summary) {
            console.log(`✅ TestLogicService处理成功: ${keyForService}`);
            return result;
          }
        }
      } catch (serviceError) {
        console.log(`⚠️ TestLogicService处理失败: ${keyForService}, 错误: ${serviceError.message}`);
      }
      
      // 如果TestLogicService失败，回退到本地实现
      switch (keyForService) {
        case 'eq_test':
          return await calculateEqTestResult(answers, projectInternalId);
        case 'mbti':
          return await calculateMbtiResult(answers, projectInternalId);
        case 'enneagram':
          return await calculateEnneagramResult(answers, projectInternalId);
        default:
          // 其他专门测试如果TestLogicService也失败了，使用默认逻辑
          console.log(`⚠️ 专门测试 ${keyForService} 的TestLogicService失败，使用默认逻辑`);
          break;
      }
    }

    // 3. 最后兜底：默认计算逻辑（适用于简单累加型测试）
    console.log(`🔄 使用默认计算逻辑: ${keyForService}`);
    return await calculateDefaultResult(answers, projectInternalId);
  } catch (error) {
    console.error('❌ 计算结果失败:', error);
    return {
      summary: 'Unable to calculate result',
      analysis: 'An error occurred while calculating your test result. Please try again.',
      type: 'error'
    };
  }
}

// 计算EQ测试结果
async function calculateEqTestResult(answers, projectInternalId) {
  try {
    // 获取结果类型
    const resultTypes = await query(`
      SELECT type_code, type_name_en, description_en, analysis_en
      FROM result_types 
      WHERE project_id = $1
      ORDER BY type_code
    `, [projectInternalId]);
    
    if (resultTypes.rows.length === 0) {
      return {
        summary: 'High Emotional Intelligence',
        description_en: 'High Emotional Intelligence',
        analysis: 'You have good emotional intelligence skills.',
        type: 'high_eq'
      };
    }
    
    // 简单的评分逻辑：根据答案计算总分
    const totalScore = answers.reduce((sum, answer) => sum + (answer + 1), 0);
    const maxScore = answers.length * 4;
    const percentage = (totalScore / maxScore) * 100;
    
    let resultType;
    if (percentage >= 80) {
      resultType = resultTypes.rows.find(r => r.type_code === 'high_eq') || resultTypes.rows[0];
    } else if (percentage >= 60) {
      resultType = resultTypes.rows.find(r => r.type_code === 'good_eq') || resultTypes.rows[0];
    } else if (percentage >= 40) {
      resultType = resultTypes.rows.find(r => r.type_code === 'average_eq') || resultTypes.rows[0];
    } else {
      resultType = resultTypes.rows.find(r => r.type_code === 'low_eq') || resultTypes.rows[0];
    }
    
    return {
      summary: resultType.description_en || resultType.type_name_en,
      description_en: resultType.description_en,
      analysis: resultType.analysis_en || resultType.description_en,
      type: resultType.type_code,
      score: Math.round(percentage)
    };
    
  } catch (error) {
    console.error('❌ 计算EQ测试结果失败:', error);
    return {
      summary: 'High Emotional Intelligence',
      description_en: 'High Emotional Intelligence',
      analysis: 'You have good emotional intelligence skills.',
      type: 'high_eq'
    };
  }
}

// 计算MBTI结果
async function calculateMbtiResult(answers, projectInternalId) {
  try {
    // MBTI计算逻辑
    const dimensions = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    
    // 根据答案计算各维度得分
    answers.forEach((answer, index) => {
      // 简化的MBTI评分逻辑
      const dimension = index % 4;
      if (answer === 0) {
        scores[dimensions[dimension * 2]]++;
      } else {
        scores[dimensions[dimension * 2 + 1]]++;
      }
    });
    
    const mbtiType = 
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');
    
    // 获取结果类型
    const resultType = await query(`
      SELECT type_name_en, description_en, analysis_en
      FROM result_types 
      WHERE project_id = $1 AND type_code = $2
    `, [projectInternalId, mbtiType]);
    
    if (resultType.rows.length > 0) {
      const row = resultType.rows[0];
      return {
        summary: row.description_en || `${mbtiType} - ${row.type_name_en}`,
        description_en: row.description_en,
        analysis: row.analysis_en || row.description_en,
        type: mbtiType
      };
    }
    
    return {
      summary: `${mbtiType} Personality Type`,
      description_en: `${mbtiType} Personality Type`,
      analysis: `You are an ${mbtiType} personality type.`,
      type: mbtiType
    };
    
  } catch (error) {
    console.error('❌ 计算MBTI结果失败:', error);
    return {
      summary: 'ENFP - The Campaigner',
      description_en: 'ENFP - The Campaigner',
      analysis: 'You are an ENFP personality type, known as The Campaigner.',
      type: 'ENFP'
    };
  }
}

// 计算九型人格结果
async function calculateEnneagramResult(answers, projectInternalId) {
  try {
    // 简化的九型人格计算
    const typeScores = {};
    for (let i = 1; i <= 9; i++) {
      typeScores[i] = 0;
    }
    
    // 根据答案计算各类型得分
    answers.forEach((answer, index) => {
      const type = (index % 9) + 1;
      typeScores[type] += answer + 1;
    });
    
    const dominantType = Object.keys(typeScores).reduce((a, b) => 
      typeScores[a] > typeScores[b] ? a : b
    );
    
    // 获取结果类型
    const resultType = await query(`
      SELECT type_name_en, description_en, analysis_en
      FROM result_types 
      WHERE project_id = $1 AND type_code = $2
    `, [projectInternalId, `type_${dominantType}`]);
    
    if (resultType.rows.length > 0) {
      const row = resultType.rows[0];
      return {
        summary: row.description_en || `Type ${dominantType} - ${row.type_name_en}`,
        description_en: row.description_en,
        analysis: row.analysis_en || row.description_en,
        type: `type_${dominantType}`
      };
    }
    
    return {
      summary: `Type ${dominantType}`,
      description_en: `Type ${dominantType}`,
      analysis: `You are Enneagram Type ${dominantType}.`,
      type: `type_${dominantType}`
    };
    
  } catch (error) {
    console.error('❌ 计算九型人格结果失败:', error);
    return {
      summary: 'Type 7 - The Enthusiast',
      description_en: 'Type 7 - The Enthusiast',
      analysis: 'You are Enneagram Type 7, known as The Enthusiast.',
      type: 'type_7'
    };
  }
}

// 计算默认结果
async function calculateDefaultResult(answers, projectInternalId) {
  try {
    // 获取第一个结果类型作为默认结果
    const resultType = await query(`
      SELECT type_code, type_name_en, description_en, analysis_en
      FROM result_types 
      WHERE project_id = $1
      LIMIT 1
    `, [projectInternalId]);
    
    if (resultType.rows.length > 0) {
      const row = resultType.rows[0];
      return {
        summary: row.description_en || row.type_name_en,
        description_en: row.description_en,
        analysis: row.analysis_en || row.description_en,
        type: row.type_code
      };
    }
    
    return {
      summary: 'Test Completed',
      description_en: 'Test Completed',
      analysis: 'You have completed the test successfully.',
      type: 'default'
    };
    
  } catch (error) {
    console.error('❌ 计算默认结果失败:', error);
    return {
      summary: 'Test Completed',
      description_en: 'Test Completed',
      analysis: 'You have completed the test successfully.',
      type: 'default'
    };
  }
}

// 通用数据库驱动计分函数（适用于需要从DB读取score_value的测试）
async function calculateDbDrivenResult(answers, projectInternalId, testType) {
  try {
    console.log(`🔍 开始数据库驱动计分: ${testType}`);
    
    // 获取题目和选项的分数配置
    const qres = await query(`
      SELECT 
        COALESCE(
          q.question_number,
          ROW_NUMBER() OVER (ORDER BY q.id)
        ) AS qn,
        o.option_number,
        o.score_value
      FROM questions q
      JOIN question_options o ON o.question_id = q.id
      WHERE q.project_id = $1
      ORDER BY qn ASC, o.option_number ASC
    `, [projectInternalId]);

    let totalScore = 0;
    let hasDbConfig = false;
    
    if (qres.rows.length > 0) {
      hasDbConfig = true;
      const scoreMap = new Map();
      
      // 构建分数映射
      for (const row of qres.rows) {
        const qn = Number(row.qn);
        if (!scoreMap.has(qn)) scoreMap.set(qn, []);
        const arr = scoreMap.get(qn);
        const optIdx = Number(row.option_number) - 1;
        let s = 0;
        
        try {
          const v = row.score_value;
          let n = 0;
          if (v && typeof v === 'object') {
            const raw = (v.score ?? v.value ?? 0);
            n = Number(raw) || 0;
          } else if (typeof v === 'string') {
            const f = Number.parseFloat(v);
            n = Number.isFinite(f) ? f : 0;
          } else if (typeof v === 'number') {
            n = Number.isFinite(v) ? v : 0;
          }
          s = n > 5 ? (n - 4) : n; // 归一化到1..5
        } catch (_) { s = 0; }
        arr[optIdx] = s;
      }
      
      // 特殊处理：社交焦虑测试的反向题
      if (testType === 'social_anxiety_test') {
        const reversedSet = new Set([3,6,10,15]);
        for (const [qn, arr] of scoreMap.entries()) {
          if (reversedSet.has(qn) && Array.isArray(arr) && arr.length >= 5) {
            arr.reverse();
            scoreMap.set(qn, arr);
          }
        }
      }

      // 计算总分
      for (let i = 0; i < answers.length; i++) {
        const qn = i + 1;
        const optIndex = Number(answers[i]);
        const arr = scoreMap.get(qn) || [];
        if (optIndex >= 0 && optIndex < arr.length) totalScore += (arr[optIndex] || 0);
      }
    }

    // 如果没有数据库配置，使用默认计分规则
    if (!hasDbConfig) {
      console.log(`⚠️ 测试 ${testType} 无数据库配置，使用默认计分规则`);
      
      if (testType === 'social_anxiety_test') {
        // 社交焦虑测试默认规则：3/6/10/15反向
        const reversed = new Set([3,6,10,15]);
        for (let i = 0; i < answers.length && i < 15; i++) {
          const qi = i + 1;
          const optIndex = Number(answers[i]);
          if (optIndex < 0 || optIndex > 4 || Number.isNaN(optIndex)) continue;
          const score = reversed.has(qi) ? (5 - optIndex) : (optIndex + 1);
          totalScore += score;
        }
      } else {
        // 其他测试的默认规则：简单累加
        for (let i = 0; i < answers.length; i++) {
          const optIndex = Number(answers[i]);
          if (optIndex >= 0 && optIndex <= 4) {
            totalScore += (optIndex + 1);
          }
        }
      }
    }

    // 根据测试类型确定结果类型
    let resultType = 'DEFAULT';
    if (testType === 'social_anxiety_test') {
      resultType = totalScore >= 61 ? 'SA_SEVERE' : (totalScore >= 41 ? 'SA_MILD' : 'SA_NONE');
    } else if (testType === 'anxiety_depression_test') {
      // 焦虑抑郁测试的阈值（需要根据实际情况调整）
      resultType = totalScore >= 40 ? 'AD_HIGH' : (totalScore >= 25 ? 'AD_MODERATE' : 'AD_LOW');
    }

    // 从数据库获取结果描述
    const r = await query(`
      SELECT description_en, analysis_en
      FROM result_types WHERE project_id = $1 AND type_code = $2
      LIMIT 1
    `, [projectInternalId, resultType]);
    
    const row = r.rows[0] || {};
    console.log(`✅ 数据库驱动计分完成: ${testType}, 总分: ${totalScore}, 结果类型: ${resultType}`);
    
    return {
      summary: row.description_en || `${testType} result (Score: ${totalScore})`,
      analysis: row.analysis_en || `Your total score is ${totalScore}.`,
      resultType,
      totalScore,
      description_en: row.description_en,
      analysis_en: row.analysis_en
    };
  } catch (e) {
    console.error(`❌ 数据库驱动计分失败 ${testType}:`, e.message);
    return {
      summary: 'Calculation Error',
      analysis: 'Unable to calculate test result. Please try again.',
      type: 'error',
      error: e.message
    };
  }
}

// 直连DB的社交焦虑计分（完全内联，避免服务层异常时仍可工作）
async function calculateSocialAnxietyDirect(answers, projectInternalId) {
  try {
    const qres = await query(`
      SELECT 
        COALESCE(
          q.question_number,
          ROW_NUMBER() OVER (ORDER BY q.id)
        ) AS qn,
        o.option_number,
        o.score_value
      FROM questions q
      JOIN question_options o ON o.question_id = q.id
      WHERE q.project_id = $1
      ORDER BY qn ASC, o.option_number ASC
    `, [projectInternalId]);

    let totalScore = 0;
    if (qres.rows.length > 0) {
      const scoreMap = new Map();
      for (const row of qres.rows) {
        const qn = Number(row.qn);
        if (!scoreMap.has(qn)) scoreMap.set(qn, []);
        const arr = scoreMap.get(qn);
        const optIdx = Number(row.option_number) - 1;
        let s = 0;
        try {
          const v = row.score_value;
          let n = 0;
          if (v && typeof v === 'object') {
            const raw = (v.score ?? v.value ?? 0);
            n = Number(raw) || 0;
          } else if (typeof v === 'string') {
            const f = Number.parseFloat(v);
            n = Number.isFinite(f) ? f : 0;
          } else if (typeof v === 'number') {
            n = Number.isFinite(v) ? v : 0;
          }
          s = n > 5 ? (n - 4) : n; // 归一化到1..5
        } catch (_) { s = 0; }
        arr[optIdx] = s;
      }
      // 反向题规范化（若DB未反向，统一让 3/6/10/15 的 A..E 分数从大到小）
      const reversedSet = new Set([3,6,10,15]);
      for (const [qn, arr] of scoreMap.entries()) {
        if (reversedSet.has(qn) && Array.isArray(arr) && arr.length >= 5) {
          // 固定反向：3/6/10/15 一律反向
          arr.reverse();
          scoreMap.set(qn, arr);
        }
      }

      for (let i = 0; i < answers.length; i++) {
        const qn = i + 1;
        const optIndex = Number(answers[i]);
        const arr = scoreMap.get(qn) || [];
        if (optIndex >= 0 && optIndex < arr.length) totalScore += (arr[optIndex] || 0);
      }
    } else {
      // DB无配置兜底：3/6/10/15反向
      const reversed = new Set([3,6,10,15]);
      for (let i = 0; i < answers.length && i < 15; i++) {
        const qi = i + 1;
        const optIndex = Number(answers[i]);
        if (optIndex < 0 || optIndex > 4 || Number.isNaN(optIndex)) continue;
        const score = reversed.has(qi) ? (5 - optIndex) : (optIndex + 1);
        totalScore += score;
      }
    }

    const resultType = totalScore >= 61 ? 'SA_SEVERE' : (totalScore >= 41 ? 'SA_MILD' : 'SA_NONE');
    const r = await query(`
      SELECT description_en, analysis_en
      FROM result_types WHERE project_id = $1 AND type_code = $2
      LIMIT 1
    `, [projectInternalId, resultType]);
    const row = r.rows[0] || {};
    return {
      summary: row.description_en || resultType,
      analysis: row.analysis_en || '',
      resultType,
      totalScore
    };
  } catch (e) {
    console.error('❌ SA direct calc error:', e.message);
    return {
      summary: 'Calculation Error',
      analysis: 'Unable to calculate test result. Please try again.',
      type: 'error'
    };
  }
}

// 保存测试结果
async function saveTestResult({ projectId, sessionId, answers, result, ipAddress, userAgent }) {
  try {
    const resultId = await query(`
      INSERT INTO test_results (
        project_id, session_id, answers, result_summary, result_analysis, 
        result_type, ip_address, user_agent, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
      RETURNING id
    `, [
      projectId,
      sessionId || `session_${Date.now()}`,
      JSON.stringify(answers),
      result.summary,
      result.analysis,
      // 兼容服务层返回的 resultType 字段
      (result.type || result.resultType || ''),
      ipAddress,
      userAgent
    ]);
    
    return resultId.rows[0].id;
    
  } catch (error) {
    console.error('❌ 保存测试结果失败:', error);
    return null;
  }
}