console.log('🚀 Adding is_jump_type column to test_projects...');

const { Pool } = require('pg');

// 直接设置环境变量（与其他脚本保持一致）
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async function main(){
  const client = await pool.connect();
  try {
    // 添加列（若不存在）
    await client.query(`
      ALTER TABLE test_projects 
      ADD COLUMN IF NOT EXISTS is_jump_type BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('✅ Column is_jump_type ensured on test_projects');

    // 填充现有行默认值（保险起见）
    await client.query(`UPDATE test_projects SET is_jump_type = COALESCE(is_jump_type, false);`);
    console.log('✅ Backfilled existing rows to false');

  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
})();


