const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  const r = await query(`SELECT project_id, name_en FROM test_projects WHERE is_active = true ORDER BY created_at ASC`);
  const items = r.rows.map(row => ({ id: row.project_id, nameEn: row.name_en }));
  console.log(JSON.stringify(items, null, 2));
}

main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });


