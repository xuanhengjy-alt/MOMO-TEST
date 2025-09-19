const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

function toLocalPath(url){
  if (!url) return '';
  let p = url.trim();
  if (p.startsWith('/')) p = p.slice(1);
  return path.join(path.resolve(__dirname, '../../'), p.replace(/[\\]/g,'/'));
}

async function main(){
  const r = await query(`SELECT slug, cover_image_url FROM blogs WHERE is_published = true ORDER BY created_at DESC`);
  const rows = r.rows;
  const results = [];
  for (const row of rows){
    const cover = (row.cover_image_url && row.cover_image_url.trim()) ? row.cover_image_url.trim() : `/assets/blogs/${row.slug}.jpg`;
    const local = toLocalPath(cover);
    const exists = fs.existsSync(local);
    results.push({ slug: row.slug, cover, local, exists });
  }
  const missing = results.filter(x=>!x.exists);
  console.log(JSON.stringify({ total: results.length, missing: missing.map(m=>({ slug:m.slug, expected: m.cover })), ok: results.filter(x=>x.exists).length }, null, 2));
}

if (require.main === module){
  main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}

module.exports = { main };


