// 处理动态blog路由 /api/blogs/[slug]
const { query } = require('../../config/database');

// 简单的节流机制
const viewCounts = new Map();
const THROTTLE_TIME = 5 * 60 * 1000; // 5分钟

function canCount(clientIP, slug) {
  const key = `${clientIP}:${slug}`;
  const now = Date.now();
  const lastCount = viewCounts.get(key);
  
  if (!lastCount || (now - lastCount) > THROTTLE_TIME) {
    viewCounts.set(key, now);
    return true;
  }
  return false;
}

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

    console.log('🔍 获取blog详情，slug:', slug);

    const result = await query(`
      SELECT 
        id, slug, title, summary, content_md, cover_image_url, reading_count,
        is_published, created_at, updated_at, test_project_id
      FROM blogs
      WHERE slug = $1 AND is_published = true
    `, [slug]);

    if (result.rows.length === 0) {
      console.log('❌ Blog not found for slug:', slug);
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    const row = result.rows[0];
    console.log('✅ 成功获取blog数据:', { id: row.id, slug: row.slug, title: row.title });

    // 增加阅读计数（节流）
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    if (canCount(clientIP, slug)) {
      try {
        await query(
          'UPDATE blogs SET reading_count = COALESCE(reading_count, 0) + 1 WHERE id = $1',
          [row.id]
        );
        row.reading_count = (row.reading_count || 0) + 1;
      } catch (err) {
        console.warn('Failed to update reading count:', err.message);
      }
    }

    const blog = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.summary,
      content: row.content_md,
      cover_image_url: row.cover_image_url,
      imageUrl: row.cover_image_url,
      author: 'MOMO TEST',
      publishedAt: row.created_at,
      viewCount: row.reading_count || 0,
      likeCount: 0,
      test_project_id: row.test_project_id
    };

    console.log(`✅ 成功获取博客详情: ${slug}`);
    res.status(200).json({ 
      success: true, 
      blog: blog 
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
