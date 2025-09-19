const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  // Only replace explicit .png suffixes
  const sql = `UPDATE blogs
               SET cover_image_url = regexp_replace(cover_image_url, '\\.(png)$', '.jpg')
               WHERE cover_image_url IS NOT NULL
                 AND cover_image_url ~ '(?i)\\.png$'`;
  const res = await query(sql);
  console.log('Rows updated:', res.rowCount || res.rows?.length || 0);
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}

module.exports = { main };


