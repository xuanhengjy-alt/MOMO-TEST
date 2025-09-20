const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});

module.exports = async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { projectId, answers, sessionId } = req.body;

    if (!projectId || !answers || !Array.isArray(answers)) {
      res.status(400).json({ error: 'Missing required fields: projectId, answers' });
      return;
    }

    // 开始事务
    await pool.query('BEGIN');

    try {
      // 计算测试结果
      const calculatedResult = await calculateTestResult(projectId, answers);

      // 保存测试结果到数据库
      const insertResult = await pool.query(`
        INSERT INTO test_results (
          project_id, session_id, user_answers, calculated_result, 
          result_summary, result_analysis, result_summary_en, result_analysis_en,
          completed_at, ip_address, user_agent
        ) VALUES (
          (SELECT id FROM test_projects WHERE project_id = $1),
          $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10
        ) RETURNING id
      `, [
        projectId,
        sessionId || null,
        JSON.stringify(answers),
        JSON.stringify(calculatedResult),
        calculatedResult.summary || '',
        calculatedResult.analysis || '',
        calculatedResult.summary || '',
        calculatedResult.analysis || '',
        req.ip || null,
        req.get('User-Agent') || null
      ]);

      // 更新测试统计
      await pool.query(`
        INSERT INTO test_statistics (project_id, total_tests, total_likes)
        VALUES ((SELECT id FROM test_projects WHERE project_id = $1), 1, 0)
        ON CONFLICT (project_id) 
        DO UPDATE SET 
          total_tests = test_statistics.total_tests + 1,
          last_updated = NOW()
      `, [projectId]);

      // 提交事务
      await pool.query('COMMIT');

      res.status(200).json({
        success: true,
        resultId: insertResult.rows[0].id,
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

// 通用函数：从数据库获取结果类型信息
async function getResultTypeFromDatabase(projectId, typeCode) {
  try {
    const result = await pool.query(`
      SELECT rt.type_code, rt.type_name_en, 
             COALESCE(rt.description_en, '') AS description_en,
             COALESCE(rt.analysis_en, '') AS analysis_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = $1 AND rt.type_code = $2
    `, [projectId, typeCode]);
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        type_code: row.type_code,
        type_name_en: row.type_name_en,
        description_en: row.description_en,
        analysis_en: row.analysis_en
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching result type from database:', error);
    return null;
  }
}

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
    } else if (testType === 'social_anxiety_test') {
      return await calculateSocialAnxietyResult(projectId, answers);
    } else if (testType === 'anxiety_depression_test') {
      return await calculateAnxietyDepressionResult(projectId, answers);
    } else if (testType === 'introversion_extraversion') {
      return await calculateIntroversionExtraversionResult(projectId, answers);
    } else if (testType === 'enneagram') {
      return await calculateEnneagramResult(projectId, answers);
    } else if (testType === 'eq_test') {
      return await calculateEqTestResult(projectId, answers);
    } else if (testType === 'phil_test') {
      return await calculatePhilTestResult(projectId, answers);
    } else if (testType === 'four_colors') {
      return await calculateFourColorsResult(projectId, answers);
    } else if (testType === 'pdp_test') {
      return await calculatePdpTestResult(projectId, answers);
    } else if (testType === 'mental_age_test') {
      return await calculateMentalAgeTestResult(projectId, answers);
    } else if (testType === 'holland_test') {
      return await calculateHollandTestResult(projectId, answers);
    } else if (testType === 'kelsey_test') {
      return await calculateKelseyTestResult(projectId, answers);
    } else if (testType === 'temperament_type_test') {
      return await calculateTemperamentTypeTestResult(projectId, answers);
    } else if (testType === 'personality_charm') {
      return await calculatePersonalityCharmResult(projectId, answers);
    } else if (testType === 'loneliness_test') {
      return await calculateLonelinessTestResult(projectId, answers);
    } else if (testType === 'violence_index') {
      return await calculateViolenceIndexResult(projectId, answers);
    } else if (testType === 'creativity_test') {
      return await calculateCreativityTestResult(projectId, answers);
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
    // DISC40 计分逻辑
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
    if (total <= 5) {
      typeCode = 'POOR';
    } else if (total <= 9) {
      typeCode = 'BELOW_AVERAGE';
    } else if (total <= 12) {
      typeCode = 'AVERAGE';
    } else if (total <= 14) {
      typeCode = 'STRONG';
    } else {
      typeCode = 'VERY_STRONG';
    }
    
    // 从数据库获取结果
    const resultType = await getResultTypeFromDatabase(projectId, typeCode);
    
    if (resultType) {
      return {
        summary: resultType.description_en || resultType.type_name_en,
        analysis: resultType.analysis_en,
        total,
        type: typeCode,
        score: total
      };
    } else {
      return {
        summary: 'Management Skills Assessment Completed',
        analysis: 'Unable to generate detailed analysis at this time. Please try again later.',
        total,
        type: typeCode,
        score: total
      };
    }
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
    if (total >= 100) {
      typeCode = 'EXCELLENT';
    } else if (total >= 75) {
      typeCode = 'GOOD';
    } else if (total >= 45) {
      typeCode = 'AVERAGE';
    } else {
      typeCode = 'POOR';
    }
    
    // 从数据库获取分析内容
    const resultType = await getResultTypeFromDatabase(projectId, typeCode);
    
    if (resultType) {
      return {
        summary: resultType.description_en || resultType.type_name_en,
        analysis: resultType.analysis_en,
        total,
        type: typeCode,
        score: total
      };
    } else {
      return {
        summary: 'Observation Skills Assessment Completed',
        analysis: 'Unable to generate detailed analysis at this time. Please try again later.',
        total,
        type: typeCode,
        score: total
      };
    }
  } catch (error) {
    console.error('Error calculating Observation test result:', error);
    return { summary: 'Assessment completed', analysis: 'Unable to generate detailed analysis at this time.', total: 0, type: 'UNKNOWN' };
  }
}

// 社交焦虑测试结果计算
async function calculateSocialAnxietyResult(projectId, answers) {
  try {
    // 计算总分：每个答案的分数值相加
    const total = answers.reduce((sum, answer) => sum + (answer + 1), 0); // answer是0-4，转换为1-5
    
    // 根据分数确定焦虑程度
    let typeCode = '';
    if (total <= 20) {
      typeCode = 'SA_NONE';
    } else if (total <= 35) {
      typeCode = 'SA_MILD';
    } else {
      typeCode = 'SA_SEVERE';
    }
    
    // 从数据库获取结果
    const resultType = await getResultTypeFromDatabase(projectId, typeCode);
    
    if (resultType) {
      return {
        summary: resultType.description_en || resultType.type_name_en,
        analysis: resultType.analysis_en,
        total,
        level: typeCode,
        score: total,
        maxScore: 75,
        percentage: Math.round((total / 75) * 100)
      };
    } else {
      return {
        summary: 'Social Anxiety Assessment Completed',
        analysis: 'Unable to generate detailed analysis at this time. Please try again later.',
        total,
        level: typeCode,
        score: total,
        maxScore: 75,
        percentage: Math.round((total / 75) * 100)
      };
    }
  } catch (error) {
    console.error('Error calculating Social Anxiety test result:', error);
    return { 
      summary: 'Assessment completed', 
      analysis: 'Unable to generate detailed analysis at this time. Please try again later.', 
      total: 0, 
      level: 'UNKNOWN' 
    };
  }
}

// 焦虑抑郁测试结果计算
async function calculateAnxietyDepressionResult(projectId, answers) {
  try {
    const total = answers.reduce((sum, answer) => sum + (answer + 1), 0);
    
    // 根据分数确定结果类型
    let typeCode = '';
    if (total <= 20) {
      typeCode = 'AD_NONE';
    } else if (total <= 35) {
      typeCode = 'AD_MAYBE';
    } else {
      typeCode = 'AD_OBVIOUS';
    }
    
    // 从数据库获取结果
    const resultType = await getResultTypeFromDatabase(projectId, typeCode);
    
    if (resultType) {
      return {
        summary: resultType.description_en || resultType.type_name_en,
        analysis: resultType.analysis_en,
        total,
        level: typeCode,
        score: total,
        maxScore: 75,
        percentage: Math.round((total / 75) * 100)
      };
    } else {
      return {
        summary: 'Anxiety & Depression Assessment Completed',
        analysis: 'Unable to generate detailed analysis at this time. Please try again later.',
        total,
        level: typeCode,
        score: total,
        maxScore: 75,
        percentage: Math.round((total / 75) * 100)
      };
    }
  } catch (error) {
    console.error('Error calculating Anxiety Depression test result:', error);
    return { 
      summary: 'Assessment completed', 
      analysis: 'Unable to generate detailed analysis at this time. Please try again later.', 
      total: 0, 
      level: 'UNKNOWN' 
    };
  }
}

// 内外向测试结果计算
async function calculateIntroversionExtraversionResult(projectId, answers) {
  try {
    const total = answers.reduce((sum, answer) => sum + (answer + 1), 0);
    const maxScore = answers.length * 5;
    const percentage = Math.round((total / maxScore) * 100);
    
    // 根据分数确定结果类型
    let typeCode = '';
    if (percentage <= 30) {
      typeCode = 'INTROVERTED';
    } else if (percentage <= 50) {
      typeCode = 'VERY_INTROVERTED';
    } else if (percentage <= 70) {
      typeCode = 'EXTROVERTED';
    } else {
      typeCode = 'VERY_EXTROVERTED';
    }
    
    // 从数据库获取结果
    const resultType = await getResultTypeFromDatabase(projectId, typeCode);
    
    if (resultType) {
      return {
        summary: resultType.description_en || resultType.type_name_en,
        analysis: resultType.analysis_en,
        total,
        type: typeCode,
        score: total,
        maxScore: maxScore,
        percentage: percentage
      };
    } else {
      return {
        summary: 'Introversion/Extraversion Assessment Completed',
        analysis: 'Unable to generate detailed analysis at this time. Please try again later.',
        total,
        type: typeCode,
        score: total,
        maxScore: maxScore,
        percentage: percentage
      };
    }
  } catch (error) {
    console.error('Error calculating Introversion Extraversion test result:', error);
    return { 
      summary: 'Assessment completed', 
      analysis: 'Unable to generate detailed analysis at this time. Please try again later.', 
      total: 0, 
      type: 'UNKNOWN' 
    };
  }
}

// 九型人格测试结果计算
async function calculateEnneagramResult(projectId, answers) {
  try {
    // 简化的九型人格计算 - 基于答案分布
    const typeScores = {};
    for (let i = 0; i < 9; i++) {
      typeScores[i + 1] = 0;
    }
    
    // 根据答案分布计算各类型得分
    answers.forEach((answer, index) => {
      const typeIndex = (index % 9) + 1;
      typeScores[typeIndex] += (answer + 1);
    });
    
    // 找到得分最高的类型
    const dominantType = Object.keys(typeScores).reduce((a, b) => 
      typeScores[a] > typeScores[b] ? a : b
    );
    
    const typeCode = `TYPE_${dominantType}`;
    
    // 从数据库获取结果
    const resultType = await getResultTypeFromDatabase(projectId, typeCode);
    
    if (resultType) {
      return {
        summary: resultType.description_en || resultType.type_name_en,
        analysis: resultType.analysis_en,
        type: dominantType,
        typeName: resultType.type_name_en,
        scores: typeScores
      };
    } else {
      return {
        summary: `Type ${dominantType}: ${resultType?.type_name_en || 'Unknown'}`,
        analysis: 'Unable to generate detailed analysis at this time. Please try again later.',
        type: dominantType,
        typeName: resultType?.type_name_en || 'Unknown',
        scores: typeScores
      };
    }
  } catch (error) {
    console.error('Error calculating Enneagram test result:', error);
    return { 
      summary: 'Assessment completed', 
      analysis: 'Unable to generate detailed analysis at this time. Please try again later.', 
      type: 'UNKNOWN' 
    };
  }
}

// 情商测试结果计算
async function calculateEqTestResult(projectId, answers) {
  try {
    const total = answers.reduce((sum, answer) => sum + (answer + 1), 0);
    const maxScore = answers.length * 5;
    const percentage = Math.round((total / maxScore) * 100);
    
    // 根据分数确定结果类型
    let typeCode = '';
    if (percentage >= 80) {
      typeCode = 'EQ_HIGH';
    } else if (percentage >= 60) {
      typeCode = 'EQ_EXPERT';
    } else if (percentage >= 40) {
      typeCode = 'EQ_AVERAGE';
    } else {
      typeCode = 'EQ_LOW';
    }
    
    // 从数据库获取结果
    const resultType = await getResultTypeFromDatabase(projectId, typeCode);
    
    if (resultType) {
      return {
        summary: resultType.description_en || resultType.type_name_en,
        analysis: resultType.analysis_en,
        total,
        level: typeCode,
        score: total,
        maxScore: maxScore,
        percentage: percentage
      };
    } else {
      return {
        summary: 'Emotional Intelligence Assessment Completed',
        analysis: 'Unable to generate detailed analysis at this time. Please try again later.',
        total,
        level: typeCode,
        score: total,
        maxScore: maxScore,
        percentage: percentage
      };
    }
  } catch (error) {
    console.error('Error calculating EQ test result:', error);
    return { 
      summary: 'Assessment completed', 
      analysis: 'Unable to generate detailed analysis at this time. Please try again later.', 
      total: 0, 
      level: 'UNKNOWN' 
    };
  }
}

// 通用测试结果计算函数（用于其他测试类型）
async function calculateGenericTestResult(projectId, answers, testName) {
  try {
    const total = answers.reduce((sum, answer) => sum + (answer + 1), 0);
    const maxScore = answers.length * 5;
    const percentage = Math.round((total / maxScore) * 100);
    
    // 根据分数确定结果类型
    let typeCode = '';
    if (percentage >= 80) {
      typeCode = 'HIGH';
    } else if (percentage >= 60) {
      typeCode = 'GOOD';
    } else if (percentage >= 40) {
      typeCode = 'AVERAGE';
    } else {
      typeCode = 'LOW';
    }
    
    // 从数据库获取结果
    const resultType = await getResultTypeFromDatabase(projectId, typeCode);
    
    if (resultType) {
      return {
        summary: resultType.description_en || resultType.type_name_en,
        analysis: resultType.analysis_en,
        total,
        level: typeCode,
        score: total,
        maxScore: maxScore,
        percentage: percentage
      };
    } else {
      return {
        summary: `${testName} Assessment Completed`,
        analysis: 'Unable to generate detailed analysis at this time. Please try again later.',
        total,
        level: typeCode,
        score: total,
        maxScore: maxScore,
        percentage: percentage
      };
    }
  } catch (error) {
    console.error(`Error calculating ${testName} test result:`, error);
    return { 
      summary: 'Assessment completed', 
      analysis: 'Unable to generate detailed analysis at this time. Please try again later.', 
      total: 0, 
      level: 'UNKNOWN' 
    };
  }
}

// 为所有其他测试类型创建通用计算函数
async function calculatePhilTestResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Phil Personality');
}

async function calculateFourColorsResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Four Colors Personality');
}

async function calculatePdpTestResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'PDP Professional');
}

async function calculateMentalAgeTestResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Mental Age');
}

async function calculateHollandTestResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Holland Occupational Interest');
}

async function calculateKelseyTestResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Kelsey Temperament');
}

async function calculateTemperamentTypeTestResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Temperament Type');
}

async function calculatePersonalityCharmResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Personality Charm');
}

async function calculateLonelinessTestResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Loneliness Level');
}

async function calculateViolenceIndexResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Violence Index');
}

async function calculateCreativityTestResult(projectId, answers) {
  return await calculateGenericTestResult(projectId, answers, 'Creativity');
}

// MBTI 默认映射计算（回退函数）
async function calculateMbtiWithDefaultMapping(answers) {
  try {
    // 使用默认的MBTI映射逻辑
    const traits = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
    
    // 简化的MBTI计算逻辑
    answers.forEach((answer, index) => {
      const questionType = index % 4; // 简化：每4题一个维度
      const isFirstOption = answer === 0;
      
      switch (questionType) {
        case 0: // E/I
          if (isFirstOption) traits.E++; else traits.I++;
          break;
        case 1: // S/N
          if (isFirstOption) traits.S++; else traits.N++;
          break;
        case 2: // T/F
          if (isFirstOption) traits.T++; else traits.F++;
          break;
        case 3: // J/P
          if (isFirstOption) traits.J++; else traits.P++;
          break;
      }
    });
    
    const ei = traits.E > traits.I ? 'E' : 'I';
    const sn = traits.S > traits.N ? 'S' : 'N';
    const tf = traits.T > traits.F ? 'T' : 'F';
    const jp = traits.J > traits.P ? 'J' : 'P';
    const code = `${ei}${sn}${tf}${jp}`;
    
    return { 
      summary: code, 
      analysis: `After testing, you are **${code}** personality type.\n\nThis is a comprehensive personality assessment based on the Myers-Briggs Type Indicator. Your type indicates your preferences in how you perceive the world and make decisions.`, 
      traits, 
      code 
    };
  } catch (error) {
    console.error('Error calculating MBTI with default mapping:', error);
    return { 
      summary: 'Error', 
      analysis: 'Unable to calculate MBTI result.' 
    };
  }
}
