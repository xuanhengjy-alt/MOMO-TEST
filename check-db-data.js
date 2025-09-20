// 检查数据库中的Social Test Anxiety Test数据
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'momo_test',
  password: '123456',
  port: 5432,
});

async function checkDatabaseData() {
  try {
    console.log('🔍 检查数据库中的Social Test Anxiety Test数据...\n');
    
    // 1. 检查项目
    const projectQuery = await pool.query(`
      SELECT id, project_id, name_en, intro_en
      FROM test_projects 
      WHERE project_id = 'social_anxiety_test'
    `);
    
    if (projectQuery.rows.length === 0) {
      console.log('❌ 项目不存在');
      return;
    }
    
    const project = projectQuery.rows[0];
    console.log(`✅ 项目存在: ${project.name_en} (ID: ${project.id})`);
    
    // 2. 检查结果类型
    const resultTypesQuery = await pool.query(`
      SELECT type_code, type_name_en, description_en, analysis_en
      FROM result_types 
      WHERE project_id = $1
      ORDER BY type_code
    `, [project.id]);
    
    console.log(`\n📋 结果类型数据 (${resultTypesQuery.rows.length} 个):`);
    resultTypesQuery.rows.forEach((row, index) => {
      console.log(`\n${index + 1}. ${row.type_code}:`);
      console.log(`   Type Name: "${row.type_name_en}"`);
      console.log(`   Description: "${row.description_en}"`);
      console.log(`   Analysis: "${row.analysis_en}"`);
      console.log(`   Description长度: ${row.description_en ? row.description_en.length : 0}`);
      console.log(`   Analysis长度: ${row.analysis_en ? row.analysis_en.length : 0}`);
    });
    
    // 3. 检查问题
    const questionsQuery = await pool.query(`
      SELECT COUNT(*) as count
      FROM questions 
      WHERE project_id = $1
    `, [project.id]);
    
    console.log(`\n❓ 问题数量: ${questionsQuery.rows[0].count}`);
    
    // 4. 检查问题选项
    const optionsQuery = await pool.query(`
      SELECT COUNT(*) as count
      FROM question_options 
      WHERE question_id IN (
        SELECT id FROM questions WHERE project_id = $1
      )
    `, [project.id]);
    
    console.log(`📝 选项数量: ${optionsQuery.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseData();
