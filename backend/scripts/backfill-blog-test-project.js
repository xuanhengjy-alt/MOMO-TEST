const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function main(){
  const pairs = [
    ['the-6-mbti-personality-types-prone-to-impulsive-decisions-and-regret','mbti'],
    ['the-application-of-the-mbti-personality-test-in-real-life','mbti']
  ];
  for (const [slug, pid] of pairs) {
    await query('UPDATE blogs SET test_project_id=$1, updated_at=NOW() WHERE slug=$2', [pid, slug]);
    console.log('OK', slug, '->', pid);
  }
}

if (require.main === module) {
  main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
}

module.exports = { main };


