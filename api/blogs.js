// Vercel API route for blogs - CommonJS格式
const { Pool } = require('pg');

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
  // 添加重试机制
  retryDelayMs: 1000,
  retryAttempts: 3,
});

// 数据库查询辅助函数 - 带重试机制
const query = async (text, params, retries = 3) => {
  const start = Date.now();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount, attempt });
      return res;
    } catch (error) {
      console.error(`Database query error (attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        throw error;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
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

    // 临时备用数据 - 当数据库连接失败时使用
    const fallbackBlogs = [
      {
        id: "1",
        slug: "mbti-personality-test-guide",
        title: "MBTI Personality Test: Complete Guide",
        summary: "Discover your personality type with our comprehensive MBTI test guide. Learn about the 16 personality types and how they affect your daily life.",
        cover_image_url: "/assets/blogs/mbti-personality-test-guide.jpg",
        created_at: "2024-01-15T10:00:00Z",
        reading_count: 1250
      },
      {
        id: "2", 
        slug: "disc-personality-assessment",
        title: "DISC Personality Assessment: Understanding Your Style",
        summary: "Explore the DISC personality model and understand how your behavioral style impacts your relationships and career success.",
        cover_image_url: "/assets/blogs/disc-personality-assessment.jpg",
        created_at: "2024-01-10T14:30:00Z",
        reading_count: 890
      },
      {
        id: "3",
        slug: "enneagram-personality-types",
        title: "Enneagram Personality Types: The Complete Guide",
        summary: "Dive deep into the Enneagram system and discover your core motivations, fears, and growth opportunities.",
        cover_image_url: "/assets/blogs/enneagram-personality-types.jpg", 
        created_at: "2024-01-05T09:15:00Z",
        reading_count: 2100
      }
    ];

    // 解析URL路径
    const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
    console.log('URL parts:', urlParts);
    console.log('Full URL:', req.url);
    
    // 检查是否是获取博客推荐的请求（必须在博客详情请求之前检查）
    const isBlogRecommendationsRequest = urlParts.length >= 4 && urlParts[0] === 'api' && urlParts[1] === 'blogs' && urlParts[2] && urlParts[3] === 'recommend';
    
    if (isBlogRecommendationsRequest) {
      // 处理博客推荐请求
      const slug = decodeURIComponent(urlParts[2]);
      console.log('Fetching blog recommendations for slug:', slug);
      
      try {
        const result = await query(`
          SELECT id, slug, title, summary, cover_image_url, created_at, reading_count
          FROM blogs
          WHERE slug != $1 AND is_published = true
          ORDER BY reading_count DESC, created_at DESC
          LIMIT 6
        `, [slug]);

        return res.status(200).json(result.rows);
      } catch (error) {
        console.error('Database error fetching blog recommendations:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Database connection failed', 
          details: error.message 
        });
      }
    }

    // 检查是否是获取单个博客详情的请求
    const isBlogDetailRequest = urlParts.length >= 3 && urlParts[0] === 'api' && urlParts[1] === 'blogs' && urlParts[2];
    
    if (isBlogDetailRequest) {
      // 处理博客详情请求
      const slug = decodeURIComponent(urlParts[2]);
      console.log('Fetching blog detail for slug:', slug);
      
      try {
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
      } catch (error) {
        console.error('Database error fetching blog detail:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Database connection failed', 
          details: error.message 
        });
      }
    }

    if (req.method === 'GET') {
      // 处理博客列表请求
      const page = clamp(parseInt(req.query.page || '1', 10) || 1, 1, 1000000);
      const pageSize = clamp(parseInt(req.query.pageSize || '12', 10) || 12, 1, 50);
      const keyword = (req.query.keyword || '').trim();

      try {
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
          blogs: result.rows,
          total,
          page,
          pageSize,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        });
      } catch (dbError) {
        console.error('Database query failed, using fallback data:', dbError.message);
        
        // 使用备用数据
        const offset = (page - 1) * pageSize;
        let filteredBlogs = fallbackBlogs;
        
        if (keyword) {
          filteredBlogs = fallbackBlogs.filter(blog => 
            blog.title.toLowerCase().includes(keyword.toLowerCase()) ||
            blog.summary.toLowerCase().includes(keyword.toLowerCase())
          );
        }
        
        const total = filteredBlogs.length;
        const totalPages = Math.ceil(total / pageSize);
        const paginatedBlogs = filteredBlogs.slice(offset, offset + pageSize);
        
        res.status(200).json({
          success: true,
          blogs: paginatedBlogs,
          total,
          page,
          pageSize,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          fallback: true // 标记使用了备用数据
        });
      }
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
