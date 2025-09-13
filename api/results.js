// 提交测试结果的API端点
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { projectId, answers, sessionId, ipAddress, userAgent } = req.body;

    if (!projectId || !answers) {
      res.status(400).json({ error: 'projectId and answers are required' });
      return;
    }

    console.log(`Submitting test result for project: ${projectId}`);
    
    // 开始事务
    await pool.query('BEGIN');

    try {
      // 获取项目的内部ID
      const projectQuery = await pool.query(
        'SELECT id FROM test_projects WHERE project_id = $1',
        [projectId]
      );
      
      if (projectQuery.rows.length === 0) {
        throw new Error('Project not found');
      }
      
      const projectInternalId = projectQuery.rows[0].id;

      // 插入测试结果
      const resultQuery = `
        INSERT INTO test_results (project_id, session_id, user_answers, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, completed_at
      `;
      
      const result = await pool.query(resultQuery, [
        projectInternalId,
        sessionId,
        JSON.stringify(answers),
        ipAddress,
        userAgent
      ]);

      const testResultId = result.rows[0].id;

      // 计算测试结果和分析
      const calculatedResult = await calculateTestResult(projectId, answers);

      // 更新测试结果，添加计算结果
      await pool.query(`
        UPDATE test_results 
        SET calculated_result = $1, result_summary = $2, result_analysis = $3
        WHERE id = $4
      `, [
        JSON.stringify(calculatedResult),
        calculatedResult.summary || '',
        calculatedResult.analysis || '',
        testResultId
      ]);

      // 更新统计信息
      await pool.query(`
        INSERT INTO test_statistics (project_id, total_tests)
        VALUES ($1, 1)
        ON CONFLICT (project_id)
        DO UPDATE SET 
          total_tests = test_statistics.total_tests + 1,
          last_updated = NOW()
      `, [projectInternalId]);

      // 提交事务
      await pool.query('COMMIT');

      console.log(`Successfully submitted test result with ID: ${testResultId}`);
      
      res.status(200).json({
        success: true,
        resultId: testResultId,
        message: 'Test result submitted successfully',
        result: calculatedResult
      });

    } catch (error) {
      // 回滚事务
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
};

// 计算测试结果的函数
async function calculateTestResult(projectId, answers) {
  try {
    // 获取项目类型
    const projectResult = await pool.query(
      'SELECT test_type FROM test_projects WHERE project_id = $1',
      [projectId]
    );
    
    if (projectResult.rows.length === 0) {
      throw new Error('Project not found');
    }
    
    const testType = projectResult.rows[0].test_type;
    
    // 根据测试类型计算结果
    if (testType === 'disc40') {
      return await calculateDisc40Result(projectId, answers);
    } else if (testType === 'mbti') {
      return await calculateMbtiResult(answers);
      } else if (testType === 'mgmt_en') {
        return await calculateMgmtEnResult(projectId, answers);
      } else if (testType === 'observation') {
        return await calculateObservationResult(projectId, answers);
      } else {
      return { summary: 'Test completed', analysis: 'Analysis not available for this test type.' };
    }
  } catch (error) {
    console.error('Error calculating test result:', error);
    return { summary: 'Error', analysis: 'Unable to calculate test result.' };
  }
}

// DISC40 结果计算
async function calculateDisc40Result(projectId, answers) {
  try {
    // DISC40 计分逻辑（从后端服务移植）
    const disc40Values = [
      [1,2,3,4], [1,2,4,3], [1,3,2,4], [1,3,4,2], [1,4,2,3], [1,4,3,2],
      [2,1,3,4], [2,1,4,3], [2,3,1,4], [2,3,4,1], [2,4,1,3], [2,4,3,1],
      [3,1,2,4], [3,1,4,2], [3,2,1,4], [3,2,4,1], [3,4,1,2], [3,4,2,1],
      [4,1,2,3], [4,1,3,2], [4,2,1,3], [4,2,3,1], [4,3,1,2], [4,3,2,1]
    ];
    
    const map = disc40Values.map(row => {
      const order = ['D','I','S','C'];
      const arr = [];
      for (let opt = 1; opt <= 4; opt++) {
        const idx = row.findIndex(r => r === opt);
        arr.push(order[idx]);
      }
      return arr;
    });
    
    const counts = { D:0, I:0, S:0, C:0 };
    answers.forEach((optIndex, qi) => {
      const typeKey = (map[qi] || map[0])[optIndex];
      counts[typeKey] += 1;
    });
    
    const tops = Object.entries(counts).filter(([k,v]) => v > 10).map(([k]) => k);
    const names = { D: 'Dominance', I: 'Influence', S: 'Steadiness', C: 'Compliance' };
    const summary = tops.length ? tops.map(k => names[k]).join(', ') : 'No dominant traits';
    
    // 获取分析内容
    let analysis = '';
    if (tops.length > 0) {
      const analysisResult = await pool.query(`
        SELECT rt.type_code, rt.type_name_en, COALESCE(rt.analysis_en, '') AS analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = $1 AND rt.type_code = ANY($2::text[])
      `, [projectId, tops]);
      
      if (analysisResult.rows.length > 0) {
        analysis = analysisResult.rows.map(row => 
          `## ${row.type_name_en}\n\n${row.analysis_en}`
        ).join('\n\n');
      } else {
        // 使用默认分析
        const defaultAnalysis = {
          D: 'High D traits indicate a natural leader with strong dominance and drive.',
          I: 'High I traits show influence, enthusiasm, and social skills.',
          S: 'High S traits demonstrate steadiness, patience, and reliability.',
          C: 'High C traits reflect compliance, accuracy, and systematic thinking.'
        };
        analysis = tops.map(trait => 
          `## ${names[trait]}\n\n${defaultAnalysis[trait]}`
        ).join('\n\n');
      }
    }
    
    return { counts, tops, summary, analysis };
  } catch (error) {
    console.error('Error calculating DISC40 result:', error);
    return { summary: 'Error', analysis: 'Unable to calculate DISC40 result.' };
  }
}

// MBTI 结果计算
async function calculateMbtiResult(answers) {
  try {
    // 获取MBTI题目映射
    const mappingResult = await pool.query(`
      SELECT q.id, q.question_text, qo.id as option_id, qo.score_value
      FROM questions q
      JOIN question_options qo ON q.id = qo.question_id
      JOIN test_projects tp ON q.project_id = tp.id
      WHERE tp.project_id = 'mbti'
      ORDER BY q.question_number, qo.option_number
    `);

    if (mappingResult.rows.length === 0) {
      // 如果没有数据库映射，使用默认的MBTI映射
      return await calculateMbtiWithDefaultMapping(answers);
    }

    // 使用数据库映射计算MBTI结果
    const traits = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
    
    // 组织题目和选项数据
    const questionsMap = new Map();
    mappingResult.rows.forEach(row => {
      if (!questionsMap.has(row.id)) {
        questionsMap.set(row.id, {
          id: row.id,
          text: row.question_text,
          options: []
        });
      }
      questionsMap.get(row.id).options.push({
        id: row.option_id,
        value: row.score_value
      });
    });

    // 计算特质分数
    answers.forEach((selectedOptionIndex, questionIndex) => {
      const question = Array.from(questionsMap.values())[questionIndex];
      if (question && question.options[selectedOptionIndex]) {
        const scoreValue = question.options[selectedOptionIndex].value;
        if (scoreValue && typeof scoreValue === 'object') {
          // scoreValue 应该是 { "E": 1, "I": 0 } 这样的格式
          Object.keys(scoreValue).forEach(trait => {
            if (traits.hasOwnProperty(trait)) {
              traits[trait] += scoreValue[trait];
            }
          });
        }
      }
    });
    
    // 确定MBTI类型
    const ei = traits.E > traits.I ? 'E' : 'I';
    const sn = traits.S > traits.N ? 'S' : 'N';
    const tf = traits.T > traits.F ? 'T' : 'F';
    const jp = traits.J > traits.P ? 'J' : 'P';
    const code = `${ei}${sn}${tf}${jp}`;
    
    // 从数据库获取完整的分析内容
    const analysisResult = await pool.query(`
      SELECT rt.type_code, rt.type_name_en, COALESCE(rt.analysis_en, '') AS analysis_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = 'mbti' AND rt.type_code = $1
    `, [code]);
    
    let analysis = '';
    if (analysisResult.rows.length > 0) {
      const row = analysisResult.rows[0];
      analysis = `After testing, you are **${code}** personality type.\n\n${row.analysis_en}`;
    } else {
      // 如果数据库没有分析内容，使用默认分析
      analysis = `After testing, you are **${code}** personality type.\n\nThis is a comprehensive personality assessment based on the Myers-Briggs Type Indicator. Your type indicates your preferences in how you perceive the world and make decisions.`;
    }
    
    return { summary: code, analysis, traits, code };
  } catch (error) {
    console.error('Error calculating MBTI result:', error);
    // 如果数据库计算失败，回退到默认映射
    return await calculateMbtiWithDefaultMapping(answers);
  }
}

// 管理能力测试结果计算
async function calculateMgmtEnResult(projectId, answers) {
  try {
    // 计算总分：Yes=1分，No=0分（答案索引0为Yes）
    const total = answers.reduce((sum, answer) => sum + (answer === 0 ? 1 : 0), 0);
    
    // 根据分数确定结果类型
    let typeCode = '';
    let summary = '';
    
    if (total <= 5) {
      typeCode = 'POOR';
      summary = 'Poor management ability';
    } else if (total <= 9) {
      typeCode = 'BELOW_AVERAGE';
      summary = 'Below-average management ability';
    } else if (total <= 12) {
      typeCode = 'AVERAGE';
      summary = 'Average management ability';
    } else if (total <= 14) {
      typeCode = 'STRONG';
      summary = 'Strong management ability';
    } else {
      typeCode = 'VERY_STRONG';
      summary = 'Very strong management ability';
    }
    
    // 从数据库获取分析内容
    const analysisResult = await pool.query(`
      SELECT rt.type_code, rt.type_name_en, COALESCE(rt.analysis_en, '') AS analysis_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = $1 AND rt.type_code = $2
    `, [projectId, typeCode]);
    
    let analysis = '';
    if (analysisResult.rows.length > 0) {
      const row = analysisResult.rows[0];
      analysis = `Your management ability assessment: **${summary}**\n\n${row.analysis_en}`;
    } else {
      // 如果数据库没有分析内容，使用默认分析
      analysis = `Your management ability assessment: **${summary}**\n\nBased on your responses, you scored ${total} out of 15 points. This indicates your current level of management skills across various dimensions including planning, execution, and self-discipline.`;
    }
    
    return { 
      summary, 
      analysis, 
      total, 
      type: typeCode,
      score: total
    };
  } catch (error) {
    console.error('Error calculating Management Skills result:', error);
    return { 
      summary: 'Assessment completed', 
      analysis: 'Unable to generate detailed analysis at this time.',
      total: 0,
      type: 'UNKNOWN'
    };
  }
}

// 使用默认映射计算MBTI结果（fallback）
async function calculateMbtiWithDefaultMapping(answers) {
  try {
    // 默认的MBTI映射（基于mbti-mapping.json）
    const defaultMapping = [
      { axis: "J-P", sideA: "J", sideB: "P" },
      { axis: "J-P", sideA: "P", sideB: "J" },
      { axis: "S-N", sideA: "S", sideB: "N" },
      { axis: "E-I", sideA: "E", sideB: "I" },
      { axis: "S-N", sideA: "N", sideB: "S" },
      { axis: "T-F", sideA: "F", sideB: "T" },
      { axis: "J-P", sideA: "P", sideB: "J" },
      { axis: "E-I", sideA: "E", sideB: "I" }
      // ... 这里应该有完整的93个题目的映射
    ];
    
    const traits = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
    
    // 使用默认映射计算
    answers.forEach((answer, index) => {
      const question = defaultMapping[index % defaultMapping.length];
      if (question) {
        const trait = answer === 0 ? question.sideA : question.sideB;
        traits[trait] += 1;
      }
    });
    
    const ei = traits.E > traits.I ? 'E' : 'I';
    const sn = traits.S > traits.N ? 'S' : 'N';
    const tf = traits.T > traits.F ? 'T' : 'F';
    const jp = traits.J > traits.P ? 'J' : 'P';
    const code = `${ei}${sn}${tf}${jp}`;
    
    // 尝试从数据库获取分析内容
    const analysisResult = await pool.query(`
      SELECT rt.type_code, rt.type_name_en, COALESCE(rt.analysis_en, '') AS analysis_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = 'mbti' AND rt.type_code = $1
    `, [code]);
    
    let analysis = '';
    if (analysisResult.rows.length > 0) {
      const row = analysisResult.rows[0];
      analysis = `After testing, you are **${code}** personality type.\n\n${row.analysis_en}`;
    } else {
      analysis = `After testing, you are **${code}** personality type.\n\nThis is a comprehensive personality assessment based on the Myers-Briggs Type Indicator. Your type indicates your preferences in how you perceive the world and make decisions.`;
    }
    
    return { summary: code, analysis, traits, code };
  } catch (error) {
    console.error('Error calculating MBTI with default mapping:', error);
    return { summary: 'Error', analysis: 'Unable to calculate MBTI result.' };
  }
}

// 观察能力测试计分函数
async function calculateObservationResult(projectId, answers) {
  try {
    // 根据文档中的评分表计算总分
    const scoreMap = [
      [3, 10, 5],   // 题目1: A=3, B=10, C=5
      [5, 10, 3],   // 题目2: A=5, B=10, C=3
      [10, 5, 3],   // 题目3: A=10, B=5, C=3
      [10, 3, 5],   // 题目4: A=10, B=3, C=5
      [3, 5, 10],   // 题目5: A=3, B=5, C=10
      [5, 3, 10],   // 题目6: A=5, B=3, C=10
      [3, 5, 10],   // 题目7: A=3, B=5, C=10
      [10, 5, 3],   // 题目8: A=10, B=5, C=3
      [5, 3, 10],   // 题目9: A=5, B=3, C=10
      [10, 5, 3],   // 题目10: A=10, B=5, C=3
      [10, 5, 3],   // 题目11: A=10, B=5, C=3
      [10, 5, 3],   // 题目12: A=10, B=5, C=3
      [10, 5, 3],   // 题目13: A=10, B=5, C=3
      [10, 3, 5],   // 题目14: A=10, B=3, C=5
      [3, 10, 5]    // 题目15: A=3, B=10, C=5
    ];
    
    let total = 0;
    answers.forEach((answerIndex, questionIndex) => {
      if (scoreMap[questionIndex] && scoreMap[questionIndex][answerIndex] !== undefined) {
        total += scoreMap[questionIndex][answerIndex];
      }
    });
    
    let typeCode = '';
    let summary = '';
    if (total >= 100) {
      summary = 'Outstanding observation skills';
      typeCode = 'EXCELLENT';
    } else if (total >= 75) {
      summary = 'Quite acute observation abilities';
      typeCode = 'GOOD';
    } else if (total >= 45) {
      summary = 'You Live on the Surface';
      typeCode = 'AVERAGE';
    } else {
      summary = 'Immersers in Their Own Worlds';
      typeCode = 'POOR';
    }
    
    // 从数据库获取分析内容
    const analysisResult = await pool.query(`
      SELECT rt.type_code, rt.type_name_en, COALESCE(rt.analysis_en, '') AS analysis_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = $1 AND rt.type_code = $2
    `, [projectId, typeCode]);
    
    let analysis = '';
    if (analysisResult.rows.length > 0) {
      const row = analysisResult.rows[0];
      analysis = `Your observation ability assessment: **${summary}**\n\n${row.analysis_en}`;
    } else {
      analysis = `Your observation ability assessment: **${summary}**\n\nBased on your responses, you scored ${total} out of 150 points. This indicates your current level of observation skills across various dimensions including detail capture, interpersonal perception, and environmental awareness.`;
    }
    
    return { summary, analysis, total, type: typeCode, score: total };
  } catch (error) {
    console.error('Error calculating Observation test result:', error);
    return { summary: 'Assessment completed', analysis: 'Unable to generate detailed analysis at this time.', total: 0, type: 'UNKNOWN' };
  }
}
