// Vercel API route for blogs
const { Pool } = require('pg');

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 数据库查询辅助函数
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

function clamp(num, min, max) { return Math.max(min, Math.min(max, num)); }

// 简单的内存级节流：同 IP 对同 slug 的阅读计数 60s 内只计一次
const readThrottle = new Map(); // key: ip|slug -> timestamp
function canCount(ip, slug) {
  const key = `${ip || 'unknown'}|${slug}`;
  const now = Date.now();
  const last = readThrottle.get(key) || 0;
  if (now - last > 60 * 1000) {
    readThrottle.set(key, now);
    return true;
  }
  return false;
}

module.exports = async function handler(req, res) {
  console.log('Blogs API called:', req.method, req.url);
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 检查数据库连接
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not set');
      return res.status(500).json({ 
        success: false, 
        error: 'Database configuration missing' 
      });
    }
    if (req.method === 'GET') {
      // 处理博客列表请求
      const page = clamp(parseInt(req.query.page || '1', 10) || 1, 1, 1000000);
      const pageSize = clamp(parseInt(req.query.pageSize || '12', 10) || 12, 1, 50);
      const keyword = (req.query.keyword || '').trim();

      const offset = (page - 1) * pageSize;
      const params = [];
      let where = 'WHERE is_published = true';
      if (keyword) {
        params.push(`%${keyword}%`);
        params.push(`%${keyword}%`);
        where += ` AND (title ILIKE $${params.length - 1} OR summary ILIKE $${params.length})`;
      }

      params.push(pageSize);
      params.push(offset);

      const result = await query(`
        SELECT id, slug, title, summary, cover_image_url, created_at, reading_count
        FROM blogs
        ${where}
        ORDER BY created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `, params);

      const countResult = await query(`
        SELECT COUNT(*) as total
        FROM blogs
        ${where}
      `, keyword ? [`%${keyword}%`, `%${keyword}%`] : []);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / pageSize);

      res.status(200).json({
        success: true,
        data: {
          blogs: result.rows,
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } else if (req.method === 'POST') {
      // 处理博客详情请求
      const { slug } = req.body;
      if (!slug) {
        return res.status(400).json({ success: false, error: 'Slug is required' });
      }

      const result = await query(`
        SELECT id, slug, title, summary, content_md, cover_image_url, created_at, reading_count, test_project_id
        FROM blogs
        WHERE slug = $1 AND is_published = true
      `, [slug]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Blog not found' });
      }

      const blog = result.rows[0];

      // 增加阅读计数（节流）
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if (canCount(clientIP, slug)) {
        await query(`
          UPDATE blogs
          SET reading_count = COALESCE(reading_count, 0) + 1
          WHERE slug = $1
        `, [slug]);
      }

      res.status(200).json({
        success: true,
        data: blog
      });
    } else {
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Blog API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
