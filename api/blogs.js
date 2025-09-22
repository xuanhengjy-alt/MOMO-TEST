// 统一的博客API处理所有博客相关请求
const { query } = require('../config/database');

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
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    console.log('Blogs API request:', {
      method: req.method,
      url: req.url,
      pathParts: pathParts,
      host: req.headers.host
    });

    // 处理路径：/api/blogs (获取博客列表)
    // 注意：博客详情和推荐由动态路由文件处理
    // - /api/blogs/{slug} -> api/blogs/[slug].js
    // - /api/blogs/{slug}/recommend -> api/blogs/[slug]/recommend.js
    if (pathParts.length === 2 && pathParts[1] === 'blogs') {
      return await handleBlogList(req, res);
    }

    // 如果没有匹配的路径，返回404
    res.status(404).json({ 
      success: false,
      error: 'API endpoint not found',
      path: req.url,
      pathParts: pathParts
    });

  } catch (error) {
    console.error('Blogs API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

// 处理博客列表请求
async function handleBlogList(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const searchParams = url.searchParams;
    
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 12;
    const keyword = searchParams.get('keyword') || '';
    
    console.log('🔍 获取博客列表:', { page, pageSize, keyword });

    // 设置超时处理
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 10000); // 10秒超时
    });

    const queryPromise = (async () => {
      try {
        // 先测试数据库连接
        await query('SELECT 1 as test');
        console.log('✅ 数据库连接正常');

        // 使用正确的字段名
        let queryText = `
          SELECT 
            id, slug, title, summary, content_md, cover_image_url, reading_count,
            is_published, created_at, updated_at, test_project_id
          FROM blogs 
          WHERE is_published = true
        `;
        let queryParams = [];
        let paramIndex = 1;

        // 添加关键词搜索
        if (keyword) {
          queryText += ` AND (title ILIKE $${paramIndex} OR summary ILIKE $${paramIndex} OR content_md ILIKE $${paramIndex})`;
          queryParams.push(`%${keyword}%`);
          paramIndex++;
        }

        queryText += ` ORDER BY created_at DESC`;

        // 添加分页
        const offset = (page - 1) * pageSize;
        queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(pageSize, offset);

        console.log('📝 执行博客查询:', queryText.substring(0, 100) + '...');
        const result = await query(queryText, queryParams);

        // 获取总数
        let countQuery = 'SELECT COUNT(*) as total FROM blogs WHERE is_published = true';
        let countParams = [];
        if (keyword) {
          countQuery += ` AND (title ILIKE $1 OR summary ILIKE $1 OR content_md ILIKE $1)`;
          countParams.push(`%${keyword}%`);
        }
        console.log('📊 执行计数查询:', countQuery);
        const countResult = await query(countQuery, countParams);

        const blogs = result.rows.map(row => ({
          id: row.id,
          slug: row.slug,
          title: row.title,
          summary: row.summary, // 保持与数据库字段一致
          excerpt: row.summary, // 兼容字段名
          cover_image_url: row.cover_image_url, // 保持原始字段名
          imageUrl: row.cover_image_url, // 兼容字段名
          author: 'MOMO TEST', // 默认作者
          publishedAt: row.created_at,
          viewCount: row.reading_count || 0,
          likeCount: 0 // 博客表没有点赞字段
        }));

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / pageSize);

        console.log(`✅ 成功获取博客列表，共 ${blogs.length} 篇，总计 ${total} 篇`);

        return {
          success: true,
          blogs: blogs,
          pagination: {
            page: page,
            pageSize: pageSize,
            total: total,
            totalPages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        };

      } catch (dbError) {
        console.error('❌ 数据库查询失败:', dbError.message);
        throw dbError;
      }
    })();

    // 等待查询完成或超时
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    res.status(200).json(result);

  } catch (error) {
    console.error('❌ 获取博客列表失败:', error);
    
    // 返回空列表而不是错误，避免页面崩溃
    res.status(200).json({ 
      success: true,
      blogs: [],
      pagination: {
        page: 1,
        pageSize: 12,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      fallback: true,
      error: error.message
    });
  }
}

// 注意：博客详情和推荐功能已移至动态路由文件：
// - api/blogs/[slug].js - 处理博客详情
// - api/blogs/[slug]/recommend.js - 处理博客推荐