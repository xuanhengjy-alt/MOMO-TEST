console.log('🚀 Creating: Find out just how lonely your heart really is');

const { Pool } = require('pg');

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const project = {
  project_id: 'loneliness_1min',
  name: 'Find out just how lonely your heart really is',
  name_en: 'Find out just how lonely your heart really is',
  image_url: 'assets/images/find-out-just-how-lonely-your-heart-really-is.png',
  intro: `You’re always smiling in a crowd, but suddenly feel an empty void in your heart? ... This casual quiz helps you see your inner loneliness index in just 1 minute!`,
  intro_en: `You’re always smiling in a crowd, but suddenly feel an empty void in your heart? ... This casual quiz helps you see your inner loneliness index in just 1 minute!`,
  test_type: 'loneliness_test',
  estimated_time: 1,
  question_count: 5,
  is_active: true,
  is_jump_type: false
};

// 5 questions with A/B/C
const questions = [
  { n:1, t:'Are you introverted and not good at expressing yourself?', opts:['Yes','No','Sometimes'] },
  { n:2, t:'Have you ever been misunderstood or not understood by others?', opts:['Yes','No','Occasionally'] },
  { n:3, t:'Do you like staying at home?', opts:['No, staying at home all the time is boring','It depends; sometimes I don’t want to go out','Yes, staying at home makes me feel free'] },
  { n:4, t:'Which marine animal would you prefer to be?', opts:['Shark','Whale','Dolphin'] },
  { n:5, t:'On a rainy day without an umbrella and there’s no umbrella for sale nearby, what would you do?', opts:['Wait until the rain stops or eases up before leaving','Run home in the rain','Find someone with an umbrella to take you along the way'] }
];

// scoring per doc: Q1 A+2 B+0 C+1; Q2 A2 B0 C1; Q3 A0 B1 C2; Q4 A1 B2 C0; Q5 A1 B2 C0
const scoreMap = {
  1: [2,0,1],
  2: [2,0,1],
  3: [0,1,2],
  4: [1,2,0],
  5: [1,2,0]
};

// result types ranges
const resultTypes = [
  { code: 'LONELY_10', name: 'Loneliness Index: 10%', name_en: 'Loneliness Index: 10%',
    description: 'Score 0-2', description_en: 'Score 0-2',
    analysis: 'You don’t feel lonely at all. You have an optimistic personality and enjoy time with friends.',
    analysis_en: 'You don’t feel lonely at all. You have an optimistic personality and enjoy time with friends.' },
  { code: 'LONELY_30', name: 'Loneliness Index: 30%', name_en: 'Loneliness Index: 30%',
    description: 'Score 3-5', description_en: 'Score 3-5',
    analysis: 'You take gains and losses in life lightly and can adjust yourself positively when feeling down.',
    analysis_en: 'You take gains and losses in life lightly and can adjust yourself positively when feeling down.' },
  { code: 'LONELY_70', name: 'Loneliness Index: 70%', name_en: 'Loneliness Index: 70%',
    description: 'Score 6-8', description_en: 'Score 6-8',
    analysis: 'It becomes harder to find a confidant as you grow older; people get used to loneliness.',
    analysis_en: 'It becomes harder to find a confidant as you grow older; people get used to loneliness.' },
  { code: 'LONELY_90', name: 'Loneliness Index: 90%', name_en: 'Loneliness Index: 90%',
    description: 'Score 9-10', description_en: 'Score 9-10',
    analysis: 'You keep your thoughts to yourself; deep down you feel no one truly understands you.',
    analysis_en: 'You keep your thoughts to yourself; deep down you feel no one truly understands you.' }
];

(async function main(){
  const client = await pool.connect();
  try {
    console.log('✅ Connected');
    const exists = await client.query("SELECT 1 FROM test_projects WHERE project_id=$1", [project.project_id]);
    if (exists.rows.length) { console.log('ℹ️ Project already exists'); return; }

    const pr = await client.query(`
      INSERT INTO test_projects (project_id, name, name_en, image_url, intro, intro_en, test_type, estimated_time, question_count, is_active, is_jump_type, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,NOW()) RETURNING id
    `, [project.project_id, project.name, project.name_en, project.image_url, project.intro, project.intro_en, project.test_type, project.estimated_time, project.question_count, project.is_jump_type]);
    const projectId = pr.rows[0].id;
    console.log('✅ Project created:', projectId);

    for (const rt of resultTypes) {
      await client.query(`
        INSERT INTO result_types (project_id, type_code, type_name, type_name_en, description, description_en, analysis, analysis_en, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      `, [projectId, rt.code, rt.name, rt.name_en, rt.description, rt.description_en, rt.analysis, rt.analysis_en]);
    }
    console.log('✅ Result types inserted:', resultTypes.length);

    for (const q of questions) {
      const qr = await client.query(`
        INSERT INTO questions (project_id, question_number, question_text, question_text_en, question_type, created_at)
        VALUES ($1,$2,$3,$3,'single_choice',NOW()) RETURNING id
      `, [projectId, q.n, q.t]);
      const qid = qr.rows[0].id;
      q.opts.forEach((text, idx) => {});
      for (let i=0;i<q.opts.length;i++){
        const text = q.opts[i];
        const score = scoreMap[q.n][i];
        await client.query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at)
          VALUES ($1,$2,$3,$3,$4,NOW())
        `, [qid, i+1, text, JSON.stringify({ score })]);
      }
    }
    console.log('✅ Questions inserted:', questions.length);

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
})();


