// 检查Social Anxiety Level Test的数据库数据
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'momo_test',
  password: '123456',
  port: 5432,
});

async function checkSocialAnxietyData() {
  try {
    console.log('🔍 检查Social Anxiety Level Test数据库数据...\n');
    
    // 1. 检查项目基本信息
    console.log('1. 项目基本信息:');
    const projectQuery = await pool.query(`
      SELECT id, project_id, name_en, intro_en, test_type, question_count
      FROM test_projects 
      WHERE project_id = 'social_anxiety_test'
    `);
    
    if (projectQuery.rows.length > 0) {
      const project = projectQuery.rows[0];
      console.log(`   ID: ${project.id}`);
      console.log(`   Project ID: ${project.project_id}`);
      console.log(`   Name: ${project.name_en}`);
      console.log(`   Intro: ${project.intro_en}`);
      console.log(`   Test Type: ${project.test_type}`);
      console.log(`   Question Count: ${project.question_count}`);
    } else {
      console.log('   ❌ 项目不存在');
      return;
    }
    
    // 2. 检查结果类型数据
    console.log('\n2. 结果类型数据:');
    const resultTypesQuery = await pool.query(`
      SELECT type_code, type_name_en, description_en, analysis_en
      FROM result_types 
      WHERE project_id = (SELECT id FROM test_projects WHERE project_id = 'social_anxiety_test')
      ORDER BY type_code
    `);
    
    console.log(`   找到 ${resultTypesQuery.rows.length} 个结果类型:`);
    resultTypesQuery.rows.forEach((row, index) => {
      console.log(`\n   ${index + 1}. ${row.type_code}:`);
      console.log(`      Type Name: "${row.type_name_en}"`);
      console.log(`      Description: "${row.description_en}"`);
      console.log(`      Analysis: "${row.analysis_en}"`);
    });
    
    // 3. 检查问题数据
    console.log('\n3. 问题数据:');
    const questionsQuery = await pool.query(`
      SELECT question_number, question_text_en
      FROM questions 
      WHERE project_id = (SELECT id FROM test_projects WHERE project_id = 'social_anxiety_test')
      ORDER BY question_number
      LIMIT 3
    `);
    
    console.log(`   前3个问题:`);
    questionsQuery.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. Q${row.question_number}: "${row.question_text_en}"`);
    });
    
    // 4. 测试API调用
    console.log('\n4. 测试API调用:');
    const mockAnswers = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]; // 最高分答案
    
    const response = await fetch('http://localhost:3000/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: 'social_anxiety_test',
        answers: mockAnswers,
        sessionId: 'test-session-' + Date.now()
      })
    });
    
    const result = await response.json();
    console.log(`   API状态: ${response.status}`);
    console.log(`   成功: ${result.success}`);
    
    if (result.result) {
      console.log('\n   API返回结果:');
      console.log(`   Summary: "${result.result.summary}"`);
      console.log(`   Analysis: "${result.result.analysis}"`);
      console.log(`   Total Score: ${result.result.totalScore}`);
      console.log(`   Result Type: ${result.result.resultType}`);
    }
    
    console.log('\n✅ 数据检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await pool.end();
  }
}

checkSocialAnxietyData();
