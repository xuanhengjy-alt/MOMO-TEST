// 删除测试博客文章并检查博客数量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

async function cleanupTestBlogs() {
  try {
    console.log('🔄 开始清理测试博客文章...\n');

    // 删除我添加的3篇测试文章
    const testSlugs = [
      'enneagram-personality-types',
      'disc-personality-assessment', 
      'mbti-personality-test-guide'
    ];

    console.log('删除测试文章:');
    for (const slug of testSlugs) {
      const result = await query('DELETE FROM blogs WHERE slug = $1', [slug]);
      console.log(`- ${slug}: ${result.rowCount} 篇已删除`);
    }

    // 检查剩余的博客文章
    console.log('\n📋 检查剩余博客文章:');
    const allBlogs = await query(`
      SELECT slug, title, is_published, created_at
      FROM blogs
      ORDER BY created_at DESC
    `);
    
    console.log(`总博客数量: ${allBlogs.rows.length}`);
    
    const publishedBlogs = allBlogs.rows.filter(blog => blog.is_published);
    console.log(`已发布博客数量: ${publishedBlogs.length}`);
    
    console.log('\n已发布的博客列表:');
    publishedBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title} (${blog.slug})`);
    });

    // 检查是否有未发布的博客
    const draftBlogs = allBlogs.rows.filter(blog => !blog.is_published);
    if (draftBlogs.length > 0) {
      console.log('\n草稿博客:');
      draftBlogs.forEach((blog, index) => {
        console.log(`${index + 1}. ${blog.title} (${blog.slug}) - 草稿`);
      });
    }

    console.log('\n🎉 测试博客文章清理完成！');
  } catch (error) {
    console.error('❌ 清理失败:', error);
    throw error;
  }
}

cleanupTestBlogs().then(() => process.exit(0)).catch(err => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
