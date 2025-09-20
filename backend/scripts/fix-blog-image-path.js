// 修复博客文章图片路径
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

async function fixBlogImagePath() {
  try {
    console.log('🔄 修复博客文章图片路径...\n');

    // 修复MBTI应用文章的图片路径
    const result = await query(`
      UPDATE blogs 
      SET cover_image_url = $1, updated_at = CURRENT_TIMESTAMP
      WHERE slug = $2
    `, [
      'assets/blogs/the-application-of-the-mbti-personality-test-in-real-life.jpg',
      'the-application-of-the-mbti-personality-test-in-real-life'
    ]);

    console.log(`✅ 图片路径已修复: ${result.rowCount} 条记录`);

    // 验证修复结果
    const verifyResult = await query(`
      SELECT slug, title, cover_image_url
      FROM blogs 
      WHERE slug = $1
    `, ['the-application-of-the-mbti-personality-test-in-real-life']);

    if (verifyResult.rows.length > 0) {
      const blog = verifyResult.rows[0];
      console.log('\n📋 修复后的博客信息:');
      console.log(`- 标题: ${blog.title}`);
      console.log(`- 图片路径: ${blog.cover_image_url}`);
    }

    console.log('\n🎉 博客图片路径修复完成！');
  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  }
}

fixBlogImagePath().then(() => process.exit(0)).catch(err => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
