console.log('📋 Listing all test projects...');

const { Pool } = require('pg');

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async function main(){
  const client = await pool.connect();
  try {
    const sql = `
      SELECT id, project_id, name, name_en, test_type, is_jump_type, created_at
      FROM test_projects
      ORDER BY id ASC
    `;
    const r = await client.query(sql);
    if (!r.rows.length) {
      console.log('No projects found.');
      return;
    }
    const list = r.rows.map(row => ({
      id: row.project_id,
      name: row.name,
      nameEn: row.name_en,
      type: row.test_type,
      isJumpType: !!row.is_jump_type,
      createdAt: row.created_at
    }));
    console.log(JSON.stringify(list, null, 2));
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
})();


