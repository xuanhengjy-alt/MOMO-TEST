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
    const projectId = req.query.id || req.params?.id;

    if (projectId && projectId !== 'undefined') {
      // 获取单个测试项目
      const result = await query(`
        SELECT
          tp.project_id, tp.name, tp.name_en, tp.image_url, tp.intro, tp.intro_en,
          tp.test_type, tp.pricing_type, ts.total_tests, ts.total_likes
        FROM test_projects tp
        LEFT JOIN test_statistics ts ON tp.id = ts.project_id
        WHERE tp.project_id = $1 AND tp.is_active = true
      `, [projectId]);

      if (result.rows.length === 0) {
        res.status(404).json({ success: false, error: 'Project not found' });
        return;
      }

      const row = result.rows[0];
      const project = {
        id: row.project_id,
        name: row.name,
        nameEn: row.name_en,
        imageUrl: row.image_url,
        intro: row.intro,
        introEn: row.intro_en || row.intro,
        testType: row.test_type,
        pricingType: row.pricing_type,
        testedCount: row.total_tests || 0,  // 修复字段名映射
        likes: row.total_likes || 0,        // 修复字段名映射
        totalTests: row.total_tests || 0,   // 保持兼容性
        totalLikes: row.total_likes || 0    // 保持兼容性
      };

      res.status(200).json({ success: true, project: project });
    } else {
      // 获取所有测试项目
      const result = await query(`
        SELECT
          tp.project_id, tp.name, tp.name_en, tp.image_url, tp.intro, tp.intro_en,
          tp.test_type, tp.pricing_type, ts.total_tests, ts.total_likes
        FROM test_projects tp
        LEFT JOIN test_statistics ts ON tp.id = ts.project_id
        WHERE tp.is_active = true
        ORDER BY tp.created_at ASC
      `);

      const projects = result.rows.map(row => ({
        id: row.project_id,
        name: row.name,
        nameEn: row.name_en,
        imageUrl: row.image_url,
        intro: row.intro,
        introEn: row.intro_en || row.intro,
        testType: row.test_type,
        pricingType: row.pricing_type,
        testedCount: row.total_tests || 0,  // 修复字段名映射
        likes: row.total_likes || 0,        // 修复字段名映射
        totalTests: row.total_tests || 0,   // 保持兼容性
        totalLikes: row.total_likes || 0    // 保持兼容性
      }));

      res.status(200).json({ success: true, projects: projects });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
};
