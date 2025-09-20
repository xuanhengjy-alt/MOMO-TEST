// 修复数据库中的图片路径问题
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

async function fixImagePaths() {
  try {
    console.log('🔄 开始修复图片路径...\n');

    // 修复MBTI图片路径（移除空格）
    console.log('1. 修复MBTI图片路径...');
    await query(`
      UPDATE test_projects 
      SET image_url = 'assets/images/mbti-career-personality-test.jpg',
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = 'mbti' AND image_url LIKE '%personality-test%'
    `);
    console.log('✅ MBTI图片路径已修复');

    // 修复其他可能有空格问题的图片路径
    console.log('2. 修复其他图片路径...');
    await query(`
      UPDATE test_projects 
      SET image_url = REPLACE(image_url, ' ', '-'),
          updated_at = CURRENT_TIMESTAMP
      WHERE image_url LIKE '% %'
    `);
    console.log('✅ 其他图片路径已修复');

    // 显示修复后的结果
    console.log('\n📋 修复后的测试项目图片路径:');
    const result = await query(`
      SELECT project_id, name, image_url
      FROM test_projects
      WHERE is_active = true
      ORDER BY created_at ASC
    `);
    
    result.rows.forEach(row => {
      console.log(`- ${row.project_id}: ${row.image_url}`);
    });

    console.log('\n🎉 图片路径修复完成！');
  } catch (error) {
    console.error('❌ 修复图片路径失败:', error);
    throw error;
  }
}

fixImagePaths().then(() => process.exit(0)).catch(err => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
