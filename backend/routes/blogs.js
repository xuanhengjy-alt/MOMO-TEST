const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

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

// GET /api/blogs 列表
router.get('/', async (req, res) => {
  try {
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

    const sql = `
      SELECT id, slug, title, summary, cover_image_url, created_at, reading_count
      FROM blogs
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(pageSize, offset);

    const rows = await query(sql, params);
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return res.json(rows.rows || []);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch blogs' });
  }
});

// GET /api/blogs/:slug 详情（并带节流阅读计数）
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const row = await query(
      `SELECT id, slug, title, summary, content_md, cover_image_url, created_at, reading_count, is_published, test_project_id
       FROM blogs WHERE slug = $1`,
      [slug]
    );
    if (!row.rows.length || !row.rows[0].is_published) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Blog not found' });
    }

    // 节流后的阅读计数 +1（原子自增）
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;
    if (canCount(String(ip), slug)) {
      try {
        await query('UPDATE blogs SET reading_count = reading_count + 1 WHERE slug = $1', [slug]);
      } catch (e) {
        console.warn('Reading count update failed:', e.message);
      }
    }

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    const b = row.rows[0];
    return res.json({
      id: b.id,
      slug: b.slug,
      title: b.title,
      summary: b.summary,
      content_md: b.content_md,
      cover_image_url: b.cover_image_url,
      created_at: b.created_at,
      reading_count: b.reading_count,
      test_project_id: b.test_project_id || null
    });
  } catch (err) {
    console.error('Error fetching blog detail:', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch blog detail' });
  }
});

// GET /api/blogs/:slug/recommend 随机推荐 ≤3 篇
router.get('/:slug/recommend', async (req, res) => {
  try {
    const { slug } = req.params;
    const rows = await query(
      `SELECT id, slug, title, summary, cover_image_url, created_at, reading_count
       FROM blogs
       WHERE is_published = true AND slug <> $1
       ORDER BY RANDOM()
       LIMIT 3`,
      [slug]
    );
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return res.json(rows.rows || []);
  } catch (err) {
    console.error('Error fetching blog recommendations:', err);
    return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Failed to fetch recommendations' });
  }
});

module.exports = router;


