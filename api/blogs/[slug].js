// 处理动态blog路由 /api/blogs/[slug]
const { pool, query } = require('../../config/database');

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
      SELECT id, slug, title, summary, content_md, cover_image_url, created_at, reading_count, test_project_id
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

    const blog = result.rows[0];
    console.log('✅ 成功获取blog数据:', { id: blog.id, slug: blog.slug, title: blog.title });
    
    // 增加阅读计数（节流）
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    if (canCount(clientIP, slug)) {
      try {
        await query(`
          UPDATE blogs 
          SET reading_count = reading_count + 1 
          WHERE id = $1
        `, [blog.id]);
        blog.reading_count = (blog.reading_count || 0) + 1;
      } catch (err) {
        console.warn('Failed to update reading count:', err.message);
      }
    }

    return res.status(200).json(blog);

  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
};

// 阅读计数节流
const readingCounts = new Map();
const THROTTLE_TIME = 5 * 60 * 1000; // 5分钟

function canCount(clientIP, slug) {
  const key = `${clientIP}-${slug}`;
  const now = Date.now();
  const lastCount = readingCounts.get(key);
  
  if (!lastCount || now - lastCount > THROTTLE_TIME) {
    readingCounts.set(key, now);
    return true;
  }
  return false;
}
