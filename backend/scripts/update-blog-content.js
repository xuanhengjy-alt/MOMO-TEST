const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  const [,, slug, contentPath, title] = process.argv;
  if (!slug || !contentPath) {
    console.error('Usage: node scripts/update-blog-content.js <slug> <content_file> [title]');
    process.exit(1);
  }
  const abs = path.isAbsolute(contentPath) ? contentPath : path.resolve(process.cwd(), contentPath);
  const content = fs.readFileSync(abs, 'utf8');
  if (title) {
    await query('UPDATE blogs SET title=$1, content_md=$2, updated_at=NOW() WHERE slug=$3', [title, content, slug]);
  } else {
    await query('UPDATE blogs SET content_md=$1, updated_at=NOW() WHERE slug=$2', [content, slug]);
  }
  console.log('OK');
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}

module.exports = { main };


