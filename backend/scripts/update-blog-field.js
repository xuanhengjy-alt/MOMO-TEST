const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  const [,, slug, field, value] = process.argv;
  if (!slug || !field) {
    console.error('Usage: node scripts/update-blog-field.js <slug> <field> [value]');
    process.exit(1);
  }
  const sql = `UPDATE blogs SET ${field} = $1, updated_at = NOW() WHERE slug = $2`;
  await query(sql, [value || null, slug]);
  console.log('OK');
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}

module.exports = { main };


