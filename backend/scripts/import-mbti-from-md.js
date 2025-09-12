const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');
// 优先加载 backend/.env，避免从项目根目录执行时找不到环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CODES = ['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'];

function parseMdFile(raw) {
  const text = String(raw).replace(/\r\n?/g, '\n');
  const pattern = /(\n|^)(\d+、)\s*(ISTJ|ISFJ|INFJ|INTJ|ISTP|ISFP|INFP|INTP|ESTP|ESFP|ENFP|ENTP|ESTJ|ESFJ|ENFJ|ENTJ)\b([\s\S]*?)(?=(\n\d+、)\s*(ISTJ|ISFJ|INFJ|INTJ|ISTP|ISFP|INFP|INTP|ESTP|ESFP|ENFP|ENTP|ESTJ|ESFJ|ENFJ|ENTJ)\b|$)/g;
  const map = {};
  let m;
  while ((m = pattern.exec(text)) !== null) {
    const code = m[3];
    const body = (m[4] || '').trim();
    if (CODES.includes(code) && body.length) {
      map[code] = body;
    }
  }
  // 有些文件可能在 code 行后紧跟一行以 # 开头的标题，保留为正文的一部分，无需处理
  return map;
}

async function run() {
  try {
    const inputPath = process.argv[2];
    if (!inputPath) {
      console.error('Usage: node scripts/import-mbti-from-md.js <absolute-md-file-path>');
      process.exit(1);
    }
    const absPath = path.resolve(inputPath);
    if (!fs.existsSync(absPath)) {
      console.error('File not found:', absPath);
      process.exit(1);
    }
    const raw = fs.readFileSync(absPath, 'utf8');
    const parsed = parseMdFile(raw);
    const codes = Object.keys(parsed);
    if (codes.length === 0) {
      console.error('No MBTI sections parsed. Please check the file format.');
      process.exit(1);
    }

    // DB
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const pr = await client.query('SELECT id FROM test_projects WHERE project_id = $1', ['mbti']);
      if (pr.rows.length === 0) throw new Error('MBTI project not found in test_projects');
      const projectId = pr.rows[0].id;

      // 清空现有
      await client.query('DELETE FROM result_types WHERE project_id = $1', [projectId]);

      const insertSQL = `
        INSERT INTO result_types (
          project_id, type_code, type_name, type_name_en,
          description, description_en, analysis, analysis_en
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `;
      for (const code of CODES) {
        const full = parsed[code] || '';
        if (!full) continue;
        const firstPara = full.split('\n').find(l => l.trim().length > 0) || code;
        const brief = firstPara.substring(0, 200);
        await client.query(insertSQL, [
          projectId,
          code,
          code,
          code,
          brief,
          brief,
          full,
          full
        ]);
        console.log('Inserted', code);
      }
      await client.query('COMMIT');
      console.log('Done importing MBTI analyses from MD.');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    process.exit(0);
  } catch (e) {
    console.error('Failed:', e);
    process.exit(1);
  }
}

if (require.main === module) run();

module.exports = { run };


