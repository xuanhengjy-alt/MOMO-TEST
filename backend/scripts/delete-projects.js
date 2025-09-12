const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function deleteProjects(projectKeys) {
  if (!Array.isArray(projectKeys) || projectKeys.length === 0) {
    console.error('Usage: node scripts/delete-projects.js <projectId> [projectId2 ...]');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const find = await client.query(
      'SELECT id, project_id FROM test_projects WHERE project_id = ANY($1)',
      [projectKeys]
    );
    const ids = find.rows.map(r => r.id);
    if (ids.length === 0) {
      console.log('No matching projects found:', projectKeys);
      await client.query('ROLLBACK');
      return;
    }

    // Delete dependent rows (explicit even though ON DELETE CASCADE exists for some tables)
    await client.query('DELETE FROM test_results WHERE project_id = ANY($1)', [ids]);
    await client.query('DELETE FROM test_statistics WHERE project_id = ANY($1)', [ids]);
    await client.query('DELETE FROM result_types WHERE project_id = ANY($1)', [ids]);
    await client.query('DELETE FROM questions WHERE project_id = ANY($1)', [ids]);
    await client.query('DELETE FROM test_projects WHERE id = ANY($1)', [ids]);

    await client.query('COMMIT');
    console.log('Deleted projects:', projectKeys.join(', '));
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Delete failed:', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2).map(s => s.trim()).filter(Boolean);
  deleteProjects(args);
}

module.exports = { deleteProjects };


