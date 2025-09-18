const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  const slug = process.argv[2];
  const title = process.argv[3];
  const cover = process.argv[4];
  if (!slug || !title || !cover) {
    console.error('Usage: node scripts/update-one-blog.js <slug> <title> <cover_image_url>');
    process.exit(1);
  }
  await query('UPDATE blogs SET title=$1, cover_image_url=$2, updated_at=NOW() WHERE slug=$3', [title, cover, slug]);
  console.log('OK');
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });


