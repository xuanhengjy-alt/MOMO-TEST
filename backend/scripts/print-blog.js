const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: node scripts/print-blog.js <slug>');
    process.exit(1);
  }
  const r = await query('SELECT * FROM blogs WHERE slug = $1', [slug]);
  console.log(JSON.stringify(r.rows[0] || null, null, 2));
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });


