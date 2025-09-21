// 处理blog推荐请求 /api/blogs/[slug]/recommend
const { pool, query } = require('../../../config/database');

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

    console.log('🔍 获取blog推荐，slug:', slug);
    
    // 查询推荐文章（排除当前文章）
    const result = await query(`
      SELECT id, slug, title, summary, cover_image_url, created_at, reading_count
      FROM blogs
      WHERE slug != $1 AND is_published = true
      ORDER BY reading_count DESC, created_at DESC
      LIMIT 6
    `, [slug]);

    console.log('✅ 成功获取blog推荐，数量:', result.rows.length);
    
    return res.status(200).json(result.rows);

  } catch (error) {
    console.error('❌ Blog推荐API错误:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed', 
      details: error.message 
    });
  }
};
