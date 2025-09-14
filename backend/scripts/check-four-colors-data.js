console.log('🔍 Checking Four-colors Personality Analysis data...');

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
    
    // 检查项目是否存在
    const projectResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'four_colors_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ 四色性格测试项目不存在');
      return;
    }
    
    const project = projectResult.rows[0];
    console.log('✅ 四色性格测试项目存在:');
    console.log(`   ID: ${project.id}`);
    console.log(`   名称: ${project.name}`);
    console.log(`   类型: ${project.test_type}`);
    console.log(`   题目数量: ${project.question_count}`);
    console.log(`   预计时间: ${project.estimated_time}分钟`);
    console.log(`   状态: ${project.is_active ? '激活' : '未激活'}`);
    
    // 检查题目数量
    const questionsResult = await client.query(
      "SELECT COUNT(*) as count FROM questions WHERE project_id = $1",
      [project.id]
    );
    
    const questionCount = parseInt(questionsResult.rows[0].count);
    console.log(`\n📝 题目检查:`);
    console.log(`   数据库中的题目数量: ${questionCount}`);
    console.log(`   期望的题目数量: 30`);
    
    if (questionCount === 30) {
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
    console.log(`\n📋 选项检查:`);
    console.log(`   数据库中的选项数量: ${optionCount}`);
    console.log(`   期望的选项数量: 120 (30题 × 4选项)`);
    
    if (optionCount === 120) {
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
    console.log(`\n🎯 结果类型检查:`);
    console.log(`   数据库中的结果类型数量: ${resultTypeCount}`);
    console.log(`   期望的结果类型数量: 4`);
    
    if (resultTypeCount === 4) {
      console.log('✅ 结果类型数量正确');
      
      // 显示所有结果类型
      const resultTypesDetail = await client.query(
        'SELECT type_code, type_name_en, description_en FROM result_types WHERE project_id = $1 ORDER BY type_code',
        [project.id]
      );
      
      console.log('\n📊 结果类型详情:');
      resultTypesDetail.rows.forEach(row => {
        console.log(`   ${row.type_code}: ${row.type_name_en} (${row.description_en})`);
      });
    } else {
      console.log('❌ 结果类型数量不正确');
    }
    
    // 检查第一道题的详细信息
    console.log('\n🔍 第一道题详细信息:');
    const firstQuestion = await client.query(`
      SELECT q.question_number, q.question_text_en, 
             qo.option_number, qo.option_text_en
      FROM questions q
      JOIN question_options qo ON q.id = qo.question_id
      WHERE q.project_id = $1 AND q.question_number = 1
      ORDER BY qo.option_number
    `, [project.id]);
    
    if (firstQuestion.rows.length > 0) {
      console.log(`   题目: ${firstQuestion.rows[0].question_text_en}`);
      firstQuestion.rows.forEach(row => {
        console.log(`   选项${row.option_number}: ${row.option_text_en}`);
      });
    }
    
    // 检查第16题的详细信息（E/F/G/H选项）
    console.log('\n🔍 第16题详细信息（E/F/G/H选项对应A/B/C/D）:');
    const question16 = await client.query(`
      SELECT q.question_number, q.question_text_en, 
             qo.option_number, qo.option_text_en
      FROM questions q
      JOIN question_options qo ON q.id = qo.question_id
      WHERE q.project_id = $1 AND q.question_number = 16
      ORDER BY qo.option_number
    `, [project.id]);
    
    if (question16.rows.length > 0) {
      console.log(`   题目: ${question16.rows[0].question_text_en}`);
      question16.rows.forEach(row => {
        console.log(`   选项${row.option_number}: ${row.option_text_en}`);
      });
    }
    
    console.log('\n🎉 四色性格测试项目验证完成！');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
