// 检查博客文章图片问题
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function checkBlogImages() {
  try {
    console.log('🔍 检查博客文章图片问题...\n');

    // 检查特定博客文章
    const blogSlug = 'the-application-of-the-mbti-personality-test-in-real-life';
    const result = await query(`
      SELECT slug, title, cover_image_url, created_at
      FROM blogs 
      WHERE slug = $1
    `, [blogSlug]);

    if (result.rows.length === 0) {
      console.log('❌ 未找到该博客文章');
      return;
    }

    const blog = result.rows[0];
    console.log('📋 博客文章信息:');
    console.log(`- 标题: ${blog.title}`);
    console.log(`- 图片路径: ${blog.cover_image_url}`);
    console.log(`- 创建时间: ${blog.created_at}`);

    // 检查图片文件是否存在
    if (blog.cover_image_url) {
      const imagePath = path.join(__dirname, '..', '..', blog.cover_image_url);
      const imageExists = fs.existsSync(imagePath);
      console.log(`- 图片文件存在: ${imageExists ? '✅' : '❌'}`);
      console.log(`- 完整路径: ${imagePath}`);
      
      if (!imageExists) {
        console.log('\n🔍 查找可能的图片文件...');
        const blogsDir = path.join(__dirname, '..', '..', 'assets', 'blogs');
        if (fs.existsSync(blogsDir)) {
          const files = fs.readdirSync(blogsDir);
          const mbtiFiles = files.filter(file => 
            file.toLowerCase().includes('mbti') && 
            file.toLowerCase().includes('application')
          );
          console.log('找到可能的MBTI应用相关图片:');
          mbtiFiles.forEach(file => console.log(`  - ${file}`));
        }
      }
    } else {
      console.log('❌ 博客文章没有设置封面图片');
    }

    // 检查所有博客的图片情况
    console.log('\n📊 所有博客文章图片统计:');
    const allBlogs = await query(`
      SELECT slug, title, cover_image_url
      FROM blogs 
      WHERE is_published = true
      ORDER BY created_at DESC
    `);

    let validImages = 0;
    let missingImages = 0;
    let noImageSet = 0;

    for (const blog of allBlogs.rows) {
      if (!blog.cover_image_url) {
        noImageSet++;
        continue;
      }
      
      const imagePath = path.join(__dirname, '..', '..', blog.cover_image_url);
      if (fs.existsSync(imagePath)) {
        validImages++;
      } else {
        missingImages++;
        console.log(`❌ 图片缺失: ${blog.title} - ${blog.cover_image_url}`);
      }
    }

    console.log(`\n📈 图片统计:`);
    console.log(`- 有效图片: ${validImages}`);
    console.log(`- 缺失图片: ${missingImages}`);
    console.log(`- 未设置图片: ${noImageSet}`);
    console.log(`- 总计: ${allBlogs.rows.length}`);

  } catch (error) {
    console.error('❌ 检查失败:', error);
    throw error;
  }
}

checkBlogImages().then(() => process.exit(0)).catch(err => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
