const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

function parseDiscMd(raw) {
  const text = String(raw).replace(/\r\n?/g, '\n');
  const names = ['Dominance','Influence','Steadiness','Compliance'];
  const pattern = /(\n|^)(\d+、)?\s*(Dominance|Influence|Steadiness|Compliance)\b[\s\S]*?(?=(\n\d+、\s*(Dominance|Influence|Steadiness|Compliance)\b|$))/g;
  const map = {};
  let m;
  while ((m = pattern.exec(text)) !== null) {
    const heading = m[3];
    const block = (m[0] || '').trim();
    map[heading] = block
      .replace(/^[^#]*?(#\s*[^\n]+)/, '$1') // trim to first markdown header
      .trim();
  }
  // Ensure all four exist
  for (const n of names) if (!map[n]) map[n] = `# ${n}`;
  return map;
}

async function run() {
  try {
    const inputPath = process.argv[2];
    if (!inputPath) {
      console.error('Usage: node scripts/import-disc-from-md.js <absolute-md-file-path>');
      process.exit(1);
    }
    const abs = path.resolve(inputPath);
    if (!fs.existsSync(abs)) {
      console.error('File not found:', abs);
      process.exit(1);
    }
    const raw = fs.readFileSync(abs, 'utf8');
    const parsed = parseDiscMd(raw);

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const pr = await client.query('SELECT id FROM test_projects WHERE project_id = $1', ['disc40']);
      if (!pr.rows.length) throw new Error('DISC Personality Test project not found (project_id = disc40)');
      const projectId = pr.rows[0].id;

      // 删除旧 result_types
      await client.query('DELETE FROM result_types WHERE project_id = $1', [projectId]);

      const insertSQL = `
        INSERT INTO result_types (project_id, type_code, type_name, type_name_en, description, description_en, analysis, analysis_en)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `;
      const order = [
        { code: 'D', name: 'Dominance' },
        { code: 'I', name: 'Influence' },
        { code: 'S', name: 'Steadiness' },
        { code: 'C', name: 'Compliance' }
      ];
      for (const { code, name } of order) {
        const md = parsed[name] || `# ${name}`;
        const firstLine = md.split('\n').find(l => l.trim().length) || name;
        const brief = firstLine.replace(/^#+\s*/, '').substring(0, 200);
        await client.query(insertSQL, [
          projectId,
          code,
          name,
          name,
          '', // description (not needed in cn)
          brief, // description_en
          '', // analysis (cn not needed)
          md // analysis_en
        ]);
        console.log('Inserted', name);
      }
      await client.query('COMMIT');
      console.log('Done importing DISC analyses from MD.');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
      await pool.end();
    }
  } catch (e) {
    console.error('Failed:', e);
    process.exit(1);
  }
}

if (require.main === module) run();

module.exports = { run };


