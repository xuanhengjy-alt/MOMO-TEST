const { query } = require('../config/database');

async function checkIntroversionData() {
  try {
    console.log('🔍 检查内向外向测试数据...');
    
    // 检查项目信息
    const projectResult = await query(
      'SELECT * FROM test_projects WHERE name = $1 OR test_type = $2', 
      ['Professional Test For Introversion vs Extroversion', 'introversion_extraversion']
    );
    
    console.log('\n📋 项目信息:');
    if (projectResult.rows.length > 0) {
      const project = projectResult.rows[0];
      console.log(`ID: ${project.id}`);
      console.log(`名称: ${project.name}`);
      console.log(`类型: ${project.test_type}`);
      console.log(`题目数量: ${project.question_count}`);
      console.log(`基础分数: ${project.base_score}`);
      console.log(`最大分数: ${project.max_score}`);
      console.log(`最小分数: ${project.min_score}`);
      
      // 检查题目
      const questionsResult = await query(
        'SELECT COUNT(*) as count FROM questions WHERE project_id = $1',
        [project.id]
      );
      console.log(`\n📝 题目数量: ${questionsResult.rows[0].count}`);
      
      // 检查结果类型
      const resultTypesResult = await query(
        'SELECT COUNT(*) as count FROM result_types WHERE project_id = $1',
        [project.id]
      );
      console.log(`🎯 结果类型数量: ${resultTypesResult.rows[0].count}`);
      
      // 显示结果类型详情
      const resultTypesDetail = await query(
        'SELECT type_name, description FROM result_types WHERE project_id = $1 ORDER BY type_code',
        [project.id]
      );
      
      console.log('\n📊 结果类型详情:');
      resultTypesDetail.rows.forEach(row => {
        console.log(`- ${row.type_name}: ${row.description}`);
      });
      
    } else {
      console.log('❌ 内向外向测试项目不存在');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkIntroversionData().then(() => {
  console.log('✅ 检查完成');
  process.exit(0);
}).catch((error) => {
  console.error('❌ 检查失败:', error);
  process.exit(1);
});
