const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { query } = require('../../config/database');

async function up(){
  await query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS test_project_id VARCHAR(100)`);
  console.log('✅ Column blogs.test_project_id added');
}

if (require.main === module) {
  up().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}

module.exports = { up };


