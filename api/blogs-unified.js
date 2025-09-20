const { pool, query } = require('../config/database');

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
    // 解析URL路径
    const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
    
    // 检查是否是获取博客推荐的请求
    const isBlogRecommendationsRequest = urlParts.length >= 4 && 
      urlParts[0] === 'api' && 
      urlParts[1] === 'blogs' && 
      urlParts[2] && 
      urlParts[3] === 'recommend';
    
    if (isBlogRecommendationsRequest) {
      // 处理博客推荐请求
      const slug = decodeURIComponent(urlParts[2]);
      
      const result = await query(`
        SELECT id, slug, title, summary, cover_image_url, created_at, reading_count
        FROM blogs
        WHERE slug != $1 AND is_published = true
        ORDER BY reading_count DESC, created_at DESC
        LIMIT 6
      `, [slug]);

      return res.status(200).json(result.rows);
    }

    // 检查是否是获取单个博客详情的请求
    const isBlogDetailRequest = urlParts.length >= 3 && 
      urlParts[0] === 'api' && 
      urlParts[1] === 'blogs' && 
      urlParts[2];
    
    if (isBlogDetailRequest) {
      // 处理博客详情请求
      const slug = decodeURIComponent(urlParts[2]);
      
      const result = await query(`
        SELECT id, slug, title, summary, content_md, cover_image_url, created_at, reading_count, test_project_id
        FROM blogs
        WHERE slug = $1 AND is_published = true
      `, [slug]);

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Blog not found' 
        });
      }

      const blog = result.rows[0];
      
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
    }

    // 处理博客列表请求
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 99;
    const offset = (page - 1) * pageSize;

    const result = await query(`
      SELECT id, slug, title, summary, cover_image_url, created_at, reading_count
      FROM blogs
      WHERE is_published = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [pageSize, offset]);

    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM blogs
      WHERE is_published = true
    `);

    res.status(200).json({
      blogs: result.rows,
      pagination: {
        page,
        pageSize,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / pageSize)
      }
    });

  } catch (error) {
    console.error('Database error:', error);
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
