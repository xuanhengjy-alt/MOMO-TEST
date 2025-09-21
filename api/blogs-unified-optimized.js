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
      pathParts: pathParts
    });

    // 处理路径：/api/blogs/{slug}/recommend
    if (pathParts.length === 4 && pathParts[1] === 'blogs' && pathParts[3] === 'recommend') {
      const slug = pathParts[2];
      return await handleBlogRecommendations(req, res, slug);
    }

    // 处理路径：/api/blogs/{slug}
    if (pathParts.length === 3 && pathParts[1] === 'blogs') {
      const slug = pathParts[2];
      return await handleBlogDetail(req, res, slug);
    }

    // 处理路径：/api/blogs (获取博客列表)
    if (pathParts.length === 2 && pathParts[1] === 'blogs') {
      return await handleBlogList(req, res);
    }

    // 如果没有匹配的路径，返回404
    res.status(404).json({ 
      success: false,
      error: 'API endpoint not found' 
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

    let queryText = `
      SELECT 
        id, slug, title, title_en, excerpt, excerpt_en, 
        content, content_en, image_url, author, author_en,
        published_at, view_count, like_count, status
      FROM blogs 
      WHERE status = 'published'
    `;
    let queryParams = [];
    let paramIndex = 1;

    // 添加关键词搜索
    if (keyword) {
      queryText += ` AND (title_en ILIKE $${paramIndex} OR excerpt_en ILIKE $${paramIndex} OR content_en ILIKE $${paramIndex})`;
      queryParams.push(`%${keyword}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY published_at DESC`;

    // 添加分页
    const offset = (page - 1) * pageSize;
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(pageSize, offset);

    const result = await query(queryText, queryParams);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM blogs WHERE status = \'published\'';
    let countParams = [];
    if (keyword) {
      countQuery += ` AND (title_en ILIKE $1 OR excerpt_en ILIKE $1 OR content_en ILIKE $1)`;
      countParams.push(`%${keyword}%`);
    }
    const countResult = await query(countQuery, countParams);

    const blogs = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title_en || row.title,
      excerpt: row.excerpt_en || row.excerpt,
      imageUrl: row.image_url,
      author: row.author_en || row.author,
      publishedAt: row.published_at,
      viewCount: row.view_count || 0,
      likeCount: row.like_count || 0
    }));

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / pageSize);

    console.log(`✅ 成功获取博客列表，共 ${blogs.length} 篇，总计 ${total} 篇`);

    res.status(200).json({
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
    });

  } catch (error) {
    console.error('❌ 获取博客列表失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// 处理博客详情请求
async function handleBlogDetail(req, res, slug) {
  try {
    console.log(`🔍 获取博客详情，slug: ${slug}`);

    const result = await query(`
      SELECT 
        id, slug, title, title_en, excerpt, excerpt_en, 
        content, content_en, image_url, author, author_en,
        published_at, view_count, like_count, status
      FROM blogs 
      WHERE slug = $1 AND status = 'published'
    `, [slug]);

    if (result.rows.length === 0) {
      console.log(`❌ 博客未找到: ${slug}`);
      res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
      return;
    }

    const row = result.rows[0];
    
    // 更新浏览次数
    await query(
      'UPDATE blogs SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1',
      [row.id]
    );

    const blog = {
      id: row.id,
      slug: row.slug,
      title: row.title_en || row.title,
      excerpt: row.excerpt_en || row.excerpt,
      content: row.content_en || row.content,
      imageUrl: row.image_url,
      author: row.author_en || row.author,
      publishedAt: row.published_at,
      viewCount: (row.view_count || 0) + 1,
      likeCount: row.like_count || 0
    };

    console.log(`✅ 成功获取博客详情: ${slug}`);
    res.status(200).json({ 
      success: true, 
      blog: blog 
    });

  } catch (error) {
    console.error('❌ 获取博客详情失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// 处理博客推荐请求
async function handleBlogRecommendations(req, res, slug) {
  try {
    console.log(`🔍 获取博客推荐，slug: ${slug}`);

    // 获取当前博客的标签或分类
    const currentBlog = await query(`
      SELECT tags, category FROM blogs WHERE slug = $1 AND status = 'published'
    `, [slug]);

    if (currentBlog.rows.length === 0) {
      res.status(404).json({ 
        success: false,
        error: 'Blog not found' 
      });
      return;
    }

    // 获取推荐博客（基于相似标签或随机推荐）
    const result = await query(`
      SELECT 
        id, slug, title, title_en, excerpt, excerpt_en, 
        image_url, author, author_en, published_at, view_count, like_count
      FROM blogs 
      WHERE slug != $1 AND status = 'published'
      ORDER BY RANDOM()
      LIMIT 6
    `, [slug]);

    const recommendations = result.rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title_en || row.title,
      excerpt: row.excerpt_en || row.excerpt,
      imageUrl: row.image_url,
      author: row.author_en || row.author,
      publishedAt: row.published_at,
      viewCount: row.view_count || 0,
      likeCount: row.like_count || 0
    }));

    console.log(`✅ 成功获取博客推荐，共 ${recommendations.length} 篇`);
    res.status(200).json({ 
      success: true, 
      recommendations: recommendations 
    });

  } catch (error) {
    console.error('❌ 获取博客推荐失败:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
}
