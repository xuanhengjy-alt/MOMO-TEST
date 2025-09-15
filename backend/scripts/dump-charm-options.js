console.log('🔎 Dumping options for personality_charm_1min ...');

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
      SELECT q.question_number, o.option_number, o.option_text,
             o.score_value::text AS score_value
      FROM test_projects p
      JOIN questions q ON q.project_id = p.id
      JOIN question_options o ON o.question_id = q.id
      WHERE p.project_id = 'personality_charm_1min'
      ORDER BY q.question_number, o.option_number
    `;
    const r = await client.query(sql);
    const rows = r.rows.map(x => ({
      q: x.question_number,
      opt: x.option_number,
      text: x.option_text,
      score_value: x.score_value
    }));
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
})();


