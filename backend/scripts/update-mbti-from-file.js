require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
  const [,, typeCodeArg, fileArg] = process.argv;
  if (!typeCodeArg || !fileArg) {
    console.error('Usage: node scripts/update-mbti-from-file.js <TYPE_CODE> <FILE_PATH>');
    process.exit(1);
  }

  const typeCode = String(typeCodeArg).toUpperCase().trim();
  const filePath = path.resolve(fileArg);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  const markdownRaw = fs.readFileSync(filePath, 'utf8');
  const markdown = markdownRaw.replace(/\r\n?/g, '\n').trim();
  if (!markdown) {
    console.error('Empty file content, abort.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const client = await pool.connect();
  try {
    const { rows: prj } = await client.query("SELECT id FROM test_projects WHERE project_id = 'mbti'");
    if (!prj.length) {
      throw new Error('mbti project not found');
    }
    const pid = prj[0].id;

    const { rowCount } = await client.query(
      'UPDATE result_types SET analysis = $1 WHERE project_id = $2 AND type_code = $3',
      [markdown, pid, typeCode]
    );
    if (rowCount === 0) {
      console.error('No rows updated. Check type code exists:', typeCode);
      process.exit(2);
    }
    console.log(`Updated MBTI ${typeCode} analysis from file: ${filePath}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });


