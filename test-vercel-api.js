// 测试Vercel API端点
const { initEqTest } = require('./init-eq-test');

async function testVercelApi() {
  try {
    console.log('🔍 测试Vercel API端点...\n');
    
    // 1. 初始化EQ测试项目
    console.log('1. 初始化EQ测试项目...');
    await initEqTest();
    console.log('✅ EQ测试项目初始化完成\n');
    
    // 2. 测试数据库连接
    console.log('2. 测试数据库连接...');
    const { query } = require('./config/database');
    const healthCheck = await query('SELECT 1 as test');
    console.log('✅ 数据库连接正常\n');
    
    // 3. 测试项目查询
    console.log('3. 测试项目查询...');
    const projectResult = await query(`
      SELECT tp.project_id, tp.name_en, ts.total_tests, ts.total_likes
      FROM test_projects tp
      LEFT JOIN test_statistics ts ON tp.id = ts.project_id
      WHERE tp.project_id = 'eq_test_en'
    `);
    
    if (projectResult.rows.length > 0) {
      const project = projectResult.rows[0];
      console.log('✅ 项目查询成功:');
      console.log(`   - 项目ID: ${project.project_id}`);
      console.log(`   - 名称: ${project.name_en}`);
      console.log(`   - 测试次数: ${project.total_tests || 0}`);
      console.log(`   - 点赞数: ${project.total_likes || 0}\n`);
    } else {
      console.log('❌ 项目查询失败\n');
    }
    
    // 4. 测试题目查询
    console.log('4. 测试题目查询...');
    const questionsResult = await query(`
      SELECT COUNT(*) as count FROM questions q
      JOIN test_projects tp ON q.project_id = tp.id
      WHERE tp.project_id = 'eq_test_en'
    `);
    
    const questionCount = questionsResult.rows[0].count;
    console.log(`✅ 题目查询成功，题目数量: ${questionCount}\n`);
    
    // 5. 测试结果类型查询
    console.log('5. 测试结果类型查询...');
    const resultTypesResult = await query(`
      SELECT COUNT(*) as count FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = 'eq_test_en'
    `);
    
    const resultTypeCount = resultTypesResult.rows[0].count;
    console.log(`✅ 结果类型查询成功，类型数量: ${resultTypeCount}\n`);
    
    console.log('🎉 所有测试通过！API应该可以正常工作。');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', error.message);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testVercelApi().then(() => {
    console.log('\n✅ 测试完成');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  });
}

module.exports = { testVercelApi };
