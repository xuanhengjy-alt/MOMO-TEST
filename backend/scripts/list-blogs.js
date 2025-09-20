const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  const sql = `SELECT id, title, slug, created_at FROM blogs ORDER BY created_at DESC, id DESC`;
  const res = await query(sql);
  const rows = res.rows || res;
  for (const r of rows) {
    console.log(`- [${r.id}] ${r.title} (${r.slug})`);
  }
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}



