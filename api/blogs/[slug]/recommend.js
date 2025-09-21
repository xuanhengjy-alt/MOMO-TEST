// 处理动态blog推荐路由 /api/blogs/[slug]/recommend
const { query } = require('../../../config/database');

module.exports = async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 从URL参数获取slug
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Slug parameter is required'
      });
    }

    console.log('🔍 获取博客推荐，slug:', slug);

    const result = await query(`
      SELECT 
        id, slug, title, summary, cover_image_url, created_at
      FROM blogs 
      WHERE slug != $1 AND is_published = true
      ORDER BY RANDOM()
      LIMIT 6
    `, [slug]);

    const recommendations = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.summary,
      cover_image_url: row.cover_image_url,
      imageUrl: row.cover_image_url,
      author: 'MOMO TEST',
      publishedAt: row.created_at,
      viewCount: 0,
      likeCount: 0
    }));

    console.log(`✅ 成功获取博客推荐，共 ${recommendations.length} 篇`);
    res.status(200).json({ 
      success: true, 
      recommendations: recommendations 
    });

  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    });
  }
};
