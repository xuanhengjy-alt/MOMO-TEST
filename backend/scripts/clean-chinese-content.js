const { query, transaction } = require('../config/database');

// 清理数据库中的中文内容
async function cleanChineseContent() {
  try {
    console.log('🧹 Starting to clean Chinese content from database...');
    
    // 1. 更新项目名称，只保留英文
    console.log('📝 Updating project names to English only...');
    await query(`
      UPDATE test_projects 
      SET name = name_en 
      WHERE name_en IS NOT NULL AND name_en != ''
    `);
    
    // 2. 更新项目介绍，只保留英文
    console.log('📝 Updating project introductions to English only...');
    await query(`
      UPDATE test_projects 
      SET intro = intro_en 
      WHERE intro_en IS NOT NULL AND intro_en != ''
    `);
    
    // 3. 更新题目文本，只保留英文
    console.log('📝 Updating question texts to English only...');
    await query(`
      UPDATE questions 
      SET question_text = question_text_en 
      WHERE question_text_en IS NOT NULL AND question_text_en != ''
    `);
    
    // 4. 更新选项文本，只保留英文
    console.log('📝 Updating option texts to English only...');
    await query(`
      UPDATE question_options 
      SET option_text = option_text_en 
      WHERE option_text_en IS NOT NULL AND option_text_en != ''
    `);
    
    // 5. 更新结果类型名称，只保留英文
    console.log('📝 Updating result type names to English only...');
    await query(`
      UPDATE result_types 
      SET type_name = type_name_en 
      WHERE type_name_en IS NOT NULL AND type_name_en != ''
    `);
    
    // 6. 更新结果类型描述，只保留英文
    console.log('📝 Updating result type descriptions to English only...');
    await query(`
      UPDATE result_types 
      SET description = description_en 
      WHERE description_en IS NOT NULL AND description_en != ''
    `);
    
    // 7. 更新结果类型分析，只保留英文
    console.log('📝 Updating result type analysis to English only...');
    await query(`
      UPDATE result_types 
      SET analysis = analysis_en 
      WHERE analysis_en IS NOT NULL AND analysis_en != ''
    `);
    
    console.log('✅ Chinese content cleanup completed successfully!');
    
    // 显示清理结果
    console.log('\n📊 Cleanup Summary:');
    
    const projectCount = await query('SELECT COUNT(*) as count FROM test_projects WHERE name = name_en');
    console.log(`- Projects with English names: ${projectCount.rows[0].count}`);
    
    const questionCount = await query('SELECT COUNT(*) as count FROM questions WHERE question_text = question_text_en');
    console.log(`- Questions with English text: ${questionCount.rows[0].count}`);
    
    const optionCount = await query('SELECT COUNT(*) as count FROM question_options WHERE option_text = option_text_en');
    console.log(`- Options with English text: ${optionCount.rows[0].count}`);
    
    const resultTypeCount = await query('SELECT COUNT(*) as count FROM result_types WHERE type_name = type_name_en');
    console.log(`- Result types with English names: ${resultTypeCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error cleaning Chinese content:', error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 Starting Chinese content cleanup...');
    
    // 检查数据库连接
    await query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    await cleanChineseContent();
    
    console.log('🎉 Chinese content cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main };
