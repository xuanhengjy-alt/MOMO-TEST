const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

function mapTestProjectNameToId(name){
  if (!name) return '';
  const s = String(name).trim().toLowerCase();
  const map = {
    'mbti career personality test': 'mbti',
    'disc personality test': 'disc40',
    'self-assessment of management skills': 'mgmt_en',
    'observation ability test': 'observation',
    'professional test for introversion-extraversion degree': 'introversion_en',
    'enneagram personality test': 'enneagram_en',
    'international standard emotional intelligence test': 'eq_test_en',
    'phil personality test': 'phil_test_en',
    'four-colors personality analysis': 'four_colors_en',
    'professional dyna-metric program': 'pdp_test_en',
    'test your mental age': 'mental_age_test_en',
    'holland occupational interest test': 'holland_test_en',
    'kelsey temperament type test': 'kelsey_test_en',
    'temperament type test': 'temperament_type_test',
    'anxiety and depression level test': 'anxiety_depression_test',
    'social anxiety level test': 'social_anxiety_test'
  };
  return map[s] || '';
}

function sanitizeTitleToSlug(title) {
  return String(title || '')
    .toLowerCase().trim()
    .replace(/[\s/_.,:：—–-]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

function parseFileContent(raw) {
  const lines = raw.split(/\r?\n/);
  const data = { title: '', cover_image_url: '', summary: '', content_md: '', test_project_id: '' };
  let mode = 'meta';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (mode === 'meta') {
      if (/^title\s*:/i.test(line)) {
        data.title = line.replace(/^title\s*:/i, '').trim();
        continue;
      }
      // e.g. "Recommended test 关联的测试项目是：Enneagram personality test"
      if (/^recommended test/i.test(line)) {
        const nm = line.split('：').pop().trim();
        data.test_project_id = mapTestProjectNameToId(nm);
        continue;
      }
      if (/^cover_image_url\s*:/i.test(line)) {
        data.cover_image_url = line.replace(/^cover_image_url\s*:/i, '').trim();
        continue;
      }
      if (/^summary\s*:/i.test(line)) {
        data.summary = line.replace(/^summary\s*:/i, '').trim();
        continue;
      }
      if (/^content_md\s*:/i.test(line)) {
        mode = 'content';
        // remaining lines are content, skip current label line
        continue;
      }
    } else {
      data.content_md += (data.content_md ? '\n' : '') + line;
    }
  }
  return data;
}

async function upsertBlogFromData(data) {
  const slug = sanitizeTitleToSlug(data.title);
  // 通用规则：若未显式提供封面，则按标题规范化生成本地路径
  const defaultCover = `/assets/blogs/${slug}.jpg`;
  const cover = ((data.cover_image_url && data.cover_image_url.trim()) ? data.cover_image_url.trim() : defaultCover).slice(0, 300);
  const title = (data.title || '').slice(0, 200);
  const summary = (data.summary || '').slice(0, 500);
  const sql = `
    INSERT INTO blogs (slug, title, summary, content_md, cover_image_url, is_published, test_project_id)
    VALUES ($1, $2, $3, $4, $5, true, $6)
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      content_md = EXCLUDED.content_md,
      cover_image_url = EXCLUDED.cover_image_url,
      test_project_id = EXCLUDED.test_project_id,
      is_published = true,
      updated_at = CURRENT_TIMESTAMP
  `;
  await query(sql, [slug, title, summary, data.content_md || '', cover, (data.test_project_id||'')]);
  return slug;
}

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node scripts/import-blog-from-file.js <path-to-txt>');
    process.exit(1);
  }
  const abs = path.isAbsolute(fileArg) ? fileArg : path.resolve(process.cwd(), fileArg);
  const raw = fs.readFileSync(abs, 'utf8');
  const data = parseFileContent(raw);
  if (!data.title || !data.content_md) {
    console.error('Parsed content missing required fields: title or content_md');
    process.exit(1);
  }
  const slug = await upsertBlogFromData(data);
  console.log('✅ Imported blog:', { slug, title: data.title });
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });


