require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

function addHeadings(raw, headerTitle) {
  if (!raw) return raw;
  let text = raw.replace(/\r\n?/g, '\n').trim();

  const rules = [
    // 主概述类
    { re: /^(a\s*brief\s*description|brief\s*description|overview|summary)\b.*:?/i, h: '# A Brief Description' },
    // 特质与优势
    { re: /^(personality\s*traits|key\s*traits|core\s*traits)\b.*:?/i, h: '## Personality Traits' },
    { re: /^(their\s*best|your\s*best|strengths)\b.*:?/i, h: '## Strengths' },
    // 注意事项/潜在问题
    { re: /^(potential\s*(areas|flaws|problems)|weaknesses|areas\s*for\s*improvement)\b.*:?/i, h: '## Potential Areas' },
    // 适配与职业
    { re: /^(suitable\s*(occupations|jobs|careers)|career\s*suggestion|fit\s*roles?)\b.*:?/i, h: '## Suitable Occupations' },
    { re: /^(contribution|value\s*to\s*team|team\s*contribution)\b.*:?/i, h: '## Contribution' },
    { re: /^(preferred\s*(work|environment|style)|work\s*preferences?)\b.*:?/i, h: '## Preferred Work Environment' },
    // 发展
    { re: /^(development\s*(suggestions?|advice|tips)|growth\s*advice)\b.*:?/i, h: '## Development Suggestions' },
  ];

  const lines = text.split('\n');
  const out = [];

  // 若第一行不是 Markdown 标题，补一个主标题
  if (headerTitle && !/^\s*#\s+/.test(lines[0] || '')) {
    out.push(`# ${headerTitle}`);
    out.push('');
  }

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { out.push(''); continue; }
    // 若已是标题，放行
    if (/^\s*#{1,6}\s+/.test(trimmed)) { out.push(trimmed); continue; }
    // 规则匹配标题
    const rule = rules.find(r => r.re.test(trimmed));
    if (rule) { out.push(rule.h); continue; }
    // 归一化项目符号
    if (/^[\u2022\u25CF\u25CB\u25A0\u25A1\-\*•▪▫]/.test(trimmed)) {
      out.push('- ' + trimmed.replace(/^[\u2022\u25CF\u25CB\u25A0\u25A1\-\*•▪▫]\s*/, ''));
      continue;
    }
    out.push(trimmed);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

async function run() {
  const client = await pool.connect();
  try {
    const { rows: prj } = await client.query("SELECT id FROM test_projects WHERE project_id = 'mbti'");
    if (!prj.length) throw new Error('mbti project not found');
    const pid = prj[0].id;
    const { rows } = await client.query('SELECT id, analysis, type_code, type_name FROM result_types WHERE project_id = $1', [pid]);
    for (const row of rows) {
      const headerTitle = [row.type_code, row.type_name].filter(Boolean).join(' - ');
      const updated = addHeadings(row.analysis || '', headerTitle);
      if (updated && updated !== row.analysis) {
        await client.query('UPDATE result_types SET analysis = $1 WHERE id = $2', [updated, row.id]);
        console.log('Updated analysis id=', row.id);
      }
    }
    console.log('Done.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => { console.error(e); process.exit(1); });


