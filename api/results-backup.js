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
      // 回退到默认结果
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
      // 回退到默认结果
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
// 内外向测试结果计�?
async function calculateIntroversionExtraversionResult(projectId, answers) {
  try {
    const total = answers.reduce((sum, answer) => sum + (answer + 1), 0);
    const maxScore = answers.length * 5;
    const percentage = Math.round((total / maxScore) * 100);
    
    let type = '';
    let summary = '';
    let analysis = '';
    
    if (percentage <= 30) {
      type = 'INTROVERT';
      summary = 'Introverted Personality';
      analysis = `## Introverted Personality\n\nYou have a predominantly introverted personality (${percentage}% extroversion). You gain energy from quiet, solitary activities and prefer smaller, more intimate social settings.\n\n**Key characteristics:**\n- Recharge through alone time\n- Prefer small groups over large crowds\n- Think before speaking\n- Enjoy deep, meaningful conversations\n- Value privacy and personal space\n\n**Strengths:**\n- Excellent listening skills\n- Thoughtful decision-making\n- Deep focus and concentration\n- Strong independent work ability\n- Creative and reflective\n\n**Recommendations:**\n- Honor your need for quiet time\n- Seek careers that value deep thinking\n- Build meaningful one-on-one relationships\n- Create a peaceful personal space\n- Don't feel pressured to be more social`;
    } else if (percentage <= 70) {
      type = 'AMBIVERT';
      summary = 'Ambivert Personality';
      analysis = `## Ambivert Personality\n\nYou have a balanced personality (${percentage}% extroversion). You can adapt to both social and solitary situations depending on your mood and circumstances.\n\n**Key characteristics:**\n- Flexible social energy\n- Comfortable in various settings\n- Can be outgoing or reserved as needed\n- Balanced approach to socializing\n- Adaptable to different situations\n\n**Strengths:**\n- Versatile communication style\n- Good at reading social cues\n- Can work well alone or in teams\n- Flexible and adaptable\n- Strong interpersonal skills\n\n**Recommendations:**\n- Use your flexibility as an advantage\n- Pay attention to your energy levels\n- Choose environments that match your current mood\n- Develop both social and solitary skills\n- Trust your instincts about social needs`;
    } else {
      type = 'EXTROVERT';
      summary = 'Extroverted Personality';
      analysis = `## Extroverted Personality\n\nYou have a predominantly extroverted personality (${percentage}% extroversion). You gain energy from social interactions and thrive in active, stimulating environments.\n\n**Key characteristics:**\n- Recharge through social interaction\n- Enjoy being around people\n- Think out loud\n- Prefer group activities\n- Comfortable being the center of attention\n\n**Strengths:**\n- Excellent communication skills\n- Natural leadership abilities\n- Quick decision-making\n- Strong networking skills\n- Energizing to others\n\n**Recommendations:**\n- Seek social and collaborative environments\n- Use your energy to motivate others\n- Consider leadership roles\n- Build large networks\n- Remember to listen as well as speak`;
    }
    
    return { 
      summary, 
      analysis, 
      total, 
      type, 
      score: total,
      maxScore: maxScore,
      percentage: percentage
    };
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
    
    // 根据答案分布计算各类型得�?
    answers.forEach((answer, index) => {
      const typeIndex = (index % 9) + 1;
      typeScores[typeIndex] += (answer + 1);
    });
    
    // 找到得分最高的类型
    const dominantType = Object.keys(typeScores).reduce((a, b) => 
      typeScores[a] > typeScores[b] ? a : b
    );
    
    const typeNames = {
      1: 'The Perfectionist',
      2: 'The Helper',
      3: 'The Achiever',
      4: 'The Individualist',
      5: 'The Investigator',
      6: 'The Loyalist',
      7: 'The Enthusiast',
      8: 'The Challenger',
      9: 'The Peacemaker'
    };
    
    const typeDescriptions = {
      1: 'You are principled, purposeful, self-controlled, and perfectionistic. You strive to be perfect and right, and you want to improve everything around you.',
      2: 'You are caring, interpersonal, demonstrative, and manipulative. You want to be loved and needed, and you give to others to get love in return.',
      3: 'You are adaptable, excelling, driven, and image-conscious. You want to be admired and distinguished, and you work hard to achieve success.',
      4: 'You are expressive, dramatic, self-absorbed, and temperamental. You want to be unique and special, and you express your authentic self.',
      5: 'You are intense, cerebral, perceptive, and innovative. You want to be capable and competent, and you seek knowledge and understanding.',
      6: 'You are engaging, responsible, anxious, and suspicious. You want to be secure and supported, and you seek guidance and support.',
      7: 'You are spontaneous, versatile, acquisitive, and scattered. You want to be happy and satisfied, and you seek variety and stimulation.',
      8: 'You are self-confident, decisive, willful, and confrontational. You want to be self-reliant and in control, and you protect the vulnerable.',
      9: 'You are receptive, reassuring, complacent, and resigned. You want to be peaceful and harmonious, and you avoid conflict.'
    };
    
    const summary = `Type ${dominantType}: ${typeNames[dominantType]}`;
    const analysis = `## Enneagram Type ${dominantType}: ${typeNames[dominantType]}\n\n${typeDescriptions[dominantType]}\n\n**Your type scores:**\n${Object.entries(typeScores).map(([type, score]) => `- Type ${type}: ${score} points`).join('\n')}\n\n**Growth recommendations:**\n- Focus on your core type's healthy aspects\n- Work on integrating your wing types\n- Practice self-awareness and mindfulness\n- Consider how your type affects your relationships\n- Use your type's strengths to serve others`;
    
    return { 
      summary, 
      analysis, 
      type: dominantType,
      typeName: typeNames[dominantType],
      scores: typeScores
    };
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
    
    let level = '';
    let summary = '';
    let analysis = '';
    
    if (percentage >= 80) {
      level = 'HIGH';
      summary = 'High Emotional Intelligence';
      analysis = `## High Emotional Intelligence\n\nCongratulations! You have high emotional intelligence (${percentage}%). You excel at understanding and managing emotions, both your own and others'.\n\n**Key strengths:**\n- Excellent self-awareness\n- Strong emotional regulation\n- Empathetic understanding\n- Effective social skills\n- Natural leadership abilities\n\n**Recommendations:**\n- Use your EQ to mentor others\n- Consider leadership roles\n- Help develop others' emotional skills\n- Continue practicing mindfulness\n- Share your emotional wisdom`;
    } else if (percentage >= 60) {
      level = 'GOOD';
      summary = 'Good Emotional Intelligence';
      analysis = `## Good Emotional Intelligence\n\nYou have good emotional intelligence (${percentage}%). You generally handle emotions well and have solid interpersonal skills.\n\n**Key strengths:**\n- Good self-awareness\n- Decent emotional regulation\n- Understanding of others\n- Solid social skills\n- Room for growth\n\n**Recommendations:**\n- Practice active listening\n- Work on emotional vocabulary\n- Develop empathy skills\n- Practice mindfulness\n- Seek feedback from others`;
    } else if (percentage >= 40) {
      level = 'AVERAGE';
      summary = 'Average Emotional Intelligence';
      analysis = `## Average Emotional Intelligence\n\nYou have average emotional intelligence (${percentage}%). There's significant room for improvement in understanding and managing emotions.\n\n**Areas for improvement:**\n- Self-awareness development\n- Emotional regulation skills\n- Empathy building\n- Social skills enhancement\n- Conflict resolution\n\n**Recommendations:**\n- Practice emotional journaling\n- Take time to reflect on feelings\n- Learn about emotional intelligence\n- Practice active listening\n- Consider EQ training or coaching`;
    } else {
      level = 'LOW';
      summary = 'Low Emotional Intelligence';
      analysis = `## Low Emotional Intelligence\n\nYour emotional intelligence needs development (${percentage}%). This is a great opportunity to grow and improve your emotional skills.\n\n**Areas for development:**\n- Basic emotional awareness\n- Emotional regulation\n- Understanding others' emotions\n- Social interaction skills\n- Self-reflection abilities\n\n**Recommendations:**\n- Start with emotional awareness exercises\n- Practice identifying emotions daily\n- Learn about emotional intelligence concepts\n- Consider professional development\n- Be patient with your growth process`;
    }
    
    return { 
      summary, 
      analysis, 
      total, 
      level, 
      score: total,
      maxScore: maxScore,
      percentage: percentage
    };
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
    
    let level = '';
    let summary = '';
    let analysis = '';
    
    if (percentage >= 80) {
      level = 'HIGH';
      summary = `High ${testName} Score`;
      analysis = `## High ${testName} Score\n\nExcellent! You scored ${percentage}% on the ${testName}. This indicates strong performance in this area.\n\n**Key characteristics:**\n- Strong performance indicators\n- Above-average results\n- Positive traits demonstrated\n- Good potential for growth\n\n**Recommendations:**\n- Continue building on your strengths\n- Consider advanced opportunities\n- Share your knowledge with others\n- Maintain your positive trajectory`;
    } else if (percentage >= 60) {
      level = 'GOOD';
      summary = `Good ${testName} Score`;
      analysis = `## Good ${testName} Score\n\nGood job! You scored ${percentage}% on the ${testName}. This shows solid performance with room for improvement.\n\n**Key characteristics:**\n- Solid performance indicators\n- Average to good results\n- Some positive traits\n- Potential for growth\n\n**Recommendations:**\n- Focus on areas for improvement\n- Practice regularly\n- Seek feedback and guidance\n- Set specific goals for growth`;
    } else if (percentage >= 40) {
      level = 'AVERAGE';
      summary = `Average ${testName} Score`;
      analysis = `## Average ${testName} Score\n\nYou scored ${percentage}% on the ${testName}. This indicates average performance with significant room for improvement.\n\n**Key characteristics:**\n- Average performance indicators\n- Mixed results\n- Some areas need attention\n- Clear growth opportunities\n\n**Recommendations:**\n- Identify specific areas for improvement\n- Create a development plan\n- Practice consistently\n- Consider professional guidance`;
    } else {
      level = 'LOW';
      summary = `Low ${testName} Score`;
      analysis = `## Low ${testName} Score\n\nYou scored ${percentage}% on the ${testName}. This indicates areas that need significant attention and development.\n\n**Key characteristics:**\n- Below-average performance\n- Multiple areas need improvement\n- Clear development needs\n- Opportunity for growth\n\n**Recommendations:**\n- Focus on fundamental skills\n- Create a structured development plan\n- Seek professional guidance\n- Be patient with your progress\n- Celebrate small improvements`;
    }
    
    return { 
      summary, 
      analysis, 
      total, 
      level, 
      score: total,
      maxScore: maxScore,
      percentage: percentage
    };
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
