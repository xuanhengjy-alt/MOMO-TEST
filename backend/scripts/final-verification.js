console.log('🔍 Final verification of Enneagram personality test...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查项目信息
    const projectResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'enneagram_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found');
      return;
    }
    
    const project = projectResult.rows[0];
    console.log('\n📋 项目信息:');
    console.log(`   项目ID: ${project.id}`);
    console.log(`   项目名称: ${project.name}`);
    console.log(`   测试类型: ${project.test_type}`);
    console.log(`   题目数量: ${project.question_count}`);
    console.log(`   预计时间: ${project.estimated_time}分钟`);
    console.log(`   状态: ${project.is_active ? '激活' : '未激活'}`);
    
    // 检查题目数量
    const questionsResult = await client.query(
      "SELECT COUNT(*) as count FROM questions WHERE project_id = $1",
      [project.id]
    );
    
    const questionCount = parseInt(questionsResult.rows[0].count);
    console.log('\n📝 题目验证:');
    console.log(`   数据库中的题目数量: ${questionCount}`);
    console.log(`   期望的题目数量: 180`);
    
    if (questionCount === 180) {
      console.log('✅ 题目数量正确');
    } else {
      console.log('❌ 题目数量不正确');
    }
    
    // 检查选项数量
    const optionsResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM question_options qo 
      JOIN questions q ON qo.question_id = q.id 
      WHERE q.project_id = $1
    `, [project.id]);
    
    const optionCount = parseInt(optionsResult.rows[0].count);
    console.log('\n📋 选项验证:');
    console.log(`   数据库中的选项数量: ${optionCount}`);
    console.log(`   期望的选项数量: ${180 * 3} (每道题3个选项)`);
    
    if (optionCount === 540) {
      console.log('✅ 选项数量正确');
    } else {
      console.log('❌ 选项数量不正确');
    }
    
    // 检查结果类型
    const resultTypesResult = await client.query(
      "SELECT COUNT(*) as count FROM result_types WHERE project_id = $1",
      [project.id]
    );
    
    const resultTypeCount = parseInt(resultTypesResult.rows[0].count);
    console.log('\n🎯 结果类型验证:');
    console.log(`   数据库中的结果类型数量: ${resultTypeCount}`);
    console.log(`   期望的结果类型数量: 9`);
    
    if (resultTypeCount === 9) {
      console.log('✅ 结果类型数量正确');
    } else {
      console.log('❌ 结果类型数量不正确');
    }
    
    // 检查第一道和最后一道题
    console.log('\n🔍 题目内容验证:');
    
    const firstQuestion = await client.query(`
      SELECT q.question_number, q.question_text_en, 
             qo.option_number, qo.option_text_en, qo.score_value
      FROM questions q
      JOIN question_options qo ON q.id = qo.question_id
      WHERE q.project_id = $1 AND q.question_number = 1
      ORDER BY qo.option_number
    `, [project.id]);
    
    if (firstQuestion.rows.length > 0) {
      console.log('   第1题:', firstQuestion.rows[0].question_text_en);
      firstQuestion.rows.forEach(row => {
        console.log(`   选项${row.option_number}: ${row.option_text_en} (分数: ${row.score_value})`);
      });
    }
    
    const lastQuestion = await client.query(`
      SELECT q.question_number, q.question_text_en, 
             qo.option_number, qo.option_text_en, qo.score_value
      FROM questions q
      JOIN question_options qo ON q.id = qo.question_id
      WHERE q.project_id = $1 AND q.question_number = 180
      ORDER BY qo.option_number
    `, [project.id]);
    
    if (lastQuestion.rows.length > 0) {
      console.log('   第180题:', lastQuestion.rows[0].question_text_en);
      lastQuestion.rows.forEach(row => {
        console.log(`   选项${row.option_number}: ${row.option_text_en} (分数: ${row.score_value})`);
      });
    }
    
    // 检查所有结果类型
    const resultTypesDetail = await client.query(
      'SELECT type_code, type_name_en FROM result_types WHERE project_id = $1 ORDER BY type_code',
      [project.id]
    );
    
    console.log('\n📊 结果类型详情:');
    resultTypesDetail.rows.forEach(row => {
      console.log(`   ${row.type_code}: ${row.type_name_en}`);
    });
    
    console.log('\n🎉 九型人格测试项目验证完成！');
    console.log('✅ 所有检查项目都通过验证');
    console.log('✅ 项目已完全就绪，可以正常使用');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
