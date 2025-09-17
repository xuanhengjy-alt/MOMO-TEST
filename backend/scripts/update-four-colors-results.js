// 更新 Four-colors Personality Analysis 的 result_types 文案
// 将 description_en 统一改为标准类型名，避免出现 "A+H/C+F... count is highest" 占位文本

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('[Error] DATABASE_URL not set. Please export DATABASE_URL and retry.');
    process.exit(1);
  }

  const client = new Client({ connectionString: DATABASE_URL, ssl: DATABASE_URL.includes('amazonaws.com') ? { rejectUnauthorized: false } : undefined });
  await client.connect();
  try {
    const updates = [
      { code: 'RED_PERSONALITY',    name: 'Red personality' },
      { code: 'BLUE_PERSONALITY',   name: 'Blue personality' },
      { code: 'YELLOW_PERSONALITY', name: 'Yellow personality' },
      { code: 'GREEN_PERSONALITY',  name: 'Green personality' }
    ];

    const projectIdSql = `SELECT id FROM test_projects WHERE project_id = 'four_colors_en' LIMIT 1`;
    const pidRes = await client.query(projectIdSql);
    if (!pidRes.rows.length) throw new Error('Project four_colors_en not found');
    const pid = pidRes.rows[0].id;

    for (const u of updates) {
      const res = await client.query(
        `UPDATE result_types
         SET type_name_en = $1,
             description_en = $2
         WHERE project_id = $3 AND type_code = $4`,
        [u.name, u.name, pid, u.code]
      );
      console.log(`[OK] ${u.code} -> ${u.name} (${res.rowCount} row(s))`);
    }

    console.log('[Done] Four-colors result_types updated.');
  } catch (e) {
    console.error('[Error] Failed to update four-colors results:', e);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();


