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
    // MBTI 计分逻辑
    const traits = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
    
    // 简化的MBTI计分（实际应该从数据库读取映射）
    answers.forEach((answer, index) => {
      // 这里使用简化的计分逻辑，实际应该根据具体的题目映射
      if (answer === 0) {
        // 根据题目索引决定特质
        if (index % 8 < 2) traits.E += 1;
        else if (index % 8 < 4) traits.S += 1;
        else if (index % 8 < 6) traits.T += 1;
        else traits.J += 1;
      } else {
        if (index % 8 < 2) traits.I += 1;
        else if (index % 8 < 4) traits.N += 1;
        else if (index % 8 < 6) traits.F += 1;
        else traits.P += 1;
      }
    });
    
    const ei = traits.E > traits.I ? 'E' : 'I';
    const sn = traits.S > traits.N ? 'S' : 'N';
    const tf = traits.T > traits.F ? 'T' : 'F';
    const jp = traits.J > traits.P ? 'J' : 'P';
    const code = `${ei}${sn}${tf}${jp}`;
    
    const summary = code;
    const analysis = `After testing, you are **${code}** personality type.\n\nThis is a comprehensive personality assessment based on the Myers-Briggs Type Indicator. Your type indicates your preferences in how you perceive the world and make decisions.`;
    
    return { summary, analysis, traits, code };
  } catch (error) {
    console.error('Error calculating MBTI result:', error);
    return { summary: 'Error', analysis: 'Unable to calculate MBTI result.' };
  }
}
