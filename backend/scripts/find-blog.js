const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  const [, , pattern] = process.argv;
  if (!pattern){
    console.error('Usage: node backend/scripts/find-blog.js <title_pattern>');
    process.exit(1);
  }
  const sql = 'SELECT id, slug, title, updated_at FROM blogs WHERE title ILIKE $1 ORDER BY updated_at DESC LIMIT 20';
  const res = await query(sql, [pattern]);
  console.log(JSON.stringify(res.rows, null, 2));
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}

module.exports = { main };


