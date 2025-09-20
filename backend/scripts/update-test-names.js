// 更新数据库中的测试项目名称
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

async function updateTestNames() {
  try {
    console.log('🔄 开始更新测试项目名称...\n');

    // 更新 MBTI 测试名称
    console.log('1. 更新 MBTI 测试名称...');
    await query(`
      UPDATE test_projects 
      SET name = 'MBTIonline Career Personality Test', 
          name_en = 'MBTIonline Career Personality Test',
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = 'mbti'
    `);
    console.log('✅ MBTI 测试名称已更新');

    // 更新 Introversion 测试名称
    console.log('2. 更新 Introversion 测试名称...');
    await query(`
      UPDATE test_projects 
      SET name = 'Professional Test For Introversion vs Extroversion', 
          name_en = 'Professional Test For Introversion vs Extroversion',
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = 'introversion_en'
    `);
    console.log('✅ Introversion 测试名称已更新');

    // 更新 Enneagram 测试名称
    console.log('3. 更新 Enneagram 测试名称...');
    await query(`
      UPDATE test_projects 
      SET name = 'Enneagram personality test free', 
          name_en = 'Enneagram personality test free',
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = 'enneagram_en'
    `);
    console.log('✅ Enneagram 测试名称已更新');

    // 更新 Mental Age 测试名称
    console.log('4. 更新 Mental Age 测试名称...');
    await query(`
      UPDATE test_projects 
      SET name = 'Check mental age test', 
          name_en = 'Check mental age test',
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = 'mental_age_test_en'
    `);
    console.log('✅ Mental Age 测试名称已更新');

    // 更新 Social Anxiety 测试名称
    console.log('5. 更新 Social Anxiety 测试名称...');
    await query(`
      UPDATE test_projects 
      SET name = 'Social Test Anxiety Test', 
          name_en = 'Social Test Anxiety Test',
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = 'social_anxiety_test'
    `);
    console.log('✅ Social Anxiety 测试名称已更新');

    console.log('\n🎉 所有测试项目名称更新完成！');

    // 显示更新后的结果
    console.log('\n📋 更新后的测试项目列表:');
    const result = await query(`
      SELECT project_id, name, name_en 
      FROM test_projects 
      WHERE is_active = true 
      ORDER BY created_at ASC
    `);
    
    result.rows.forEach(row => {
      console.log(`- ${row.project_id}: ${row.name_en}`);
    });

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
  } finally {
    process.exit(0);
  }
}

updateTestNames();
