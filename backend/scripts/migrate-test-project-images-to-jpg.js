const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  const sql = `UPDATE test_projects
               SET image_url = regexp_replace(image_url, '\\.(png)$', '.jpg')
               WHERE image_url IS NOT NULL
                 AND image_url ~ '(?i)\\.png$'`;
  const res = await query(sql);
  console.log('Rows updated:', res.rowCount || res.rows?.length || 0);
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}


