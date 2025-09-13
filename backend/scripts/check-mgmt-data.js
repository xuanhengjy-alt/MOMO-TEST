const { query } = require('../config/database');

async function checkMgmtData() {
  try {
    console.log('🔍 检查管理能力测试项目数据...');
    
    // 检查项目信息
    const projectResult = await query('SELECT * FROM test_projects WHERE project_id = $1', ['mgmt_en']);
    console.log('\n📋 项目信息:');
    if (projectResult.rows.length > 0) {
      const project = projectResult.rows[0];
      console.log(`ID: ${project.project_id}`);
      console.log(`名称: ${project.name}`);
      console.log(`英文名称: ${project.name_en}`);
      console.log(`介绍: ${project.intro?.substring(0, 100)}...`);
      console.log(`英文介绍: ${project.intro_en?.substring(0, 100)}...`);
    } else {
      console.log('❌ 项目不存在');
      return;
    }
    
    // 检查题目
    const questionsResult = await query(`
      SELECT q.question_number, q.question_text, q.question_text_en, qo.option_text, qo.option_text_en
      FROM questions q
      JOIN question_options qo ON q.id = qo.question_id
      JOIN test_projects tp ON q.project_id = tp.id
      WHERE tp.project_id = $1
      ORDER BY q.question_number, qo.option_number
      LIMIT 5
    `, ['mgmt_en']);
    
    console.log('\n📝 前5道题目:');
    questionsResult.rows.forEach((row, i) => {
      console.log(`${i+1}. 中文: ${row.question_text}`);
      console.log(`   英文: ${row.question_text_en}`);
      console.log(`   选项: ${row.option_text} / ${row.option_text_en}`);
      console.log('');
    });
    
    // 检查结果类型
    const resultTypesResult = await query(`
      SELECT rt.type_code, rt.type_name, rt.type_name_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = $1
      ORDER BY rt.type_code
    `, ['mgmt_en']);
    
    console.log('🎯 结果类型:');
    resultTypesResult.rows.forEach(row => {
      console.log(`${row.type_code}: ${row.type_name} / ${row.type_name_en}`);
    });
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

checkMgmtData();
