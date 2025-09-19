const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  const slug = process.argv[2];
  if(!slug){ console.error('Usage: node backend/scripts/peek-cover.js <slug>'); process.exit(1); }
  const r = await query('SELECT slug, cover_image_url FROM blogs WHERE slug=$1', [slug]);
  console.log(r.rows);
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}


