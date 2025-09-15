console.log('🚀 Creating: Find Out Your Personality Charm Level in Just 1 Minute');

const { Pool } = require('pg');

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const projectData = {
  project_id: 'personality_charm_1min',
  name: 'Find Out Your Personality Charm Level in Just 1 Minute',
  name_en: 'Find Out Your Personality Charm Level in Just 1 Minute',
  image_url: 'assets/images/find-out-your-personality-charm-level-in-just-1-minute.png',
  intro: 'Do you want to know how attractive you are in others\' eyes? Unlock your exclusive charm score in just 1 minute through a few simple branching questions.',
  intro_en: 'Do you want to know how attractive you are in others\' eyes? Unlock your exclusive charm score in just 1 minute through a few simple branching questions.',
  test_type: 'personality_charm',
  estimated_time: 1,
  question_count: 10,
  is_active: true,
  is_jump_type: true
};

// Result types (Result1..Result5)
const resultTypes = [
  { code: 'RESULT1', name: 'Result1', name_en: 'Result1', description: 'Personality Charm Index: 50 points', description_en: 'Personality Charm Index: 50 points', analysis: 'In your view, you don’t need a large circle of friends—three or five close confidants are more than enough...', analysis_en: 'In your view, you don’t need a large circle of friends—three or five close confidants are more than enough.' },
  { code: 'RESULT2', name: 'Result2', name_en: 'Result2', description: 'Personality Charm Index: 80 points', description_en: 'Personality Charm Index: 80 points', analysis: 'You are a strong, optimistic person with great perseverance...', analysis_en: 'You are a strong, optimistic person with great perseverance.' },
  { code: 'RESULT3', name: 'Result3', name_en: 'Result3', description: 'Personality Charm Index: 99 points', description_en: 'Personality Charm Index: 99 points', analysis: 'You are straightforward and optimistic—do what you want to do...', analysis_en: 'You are straightforward and optimistic—do what you want to do.' },
  { code: 'RESULT4', name: 'Result4', name_en: 'Result4', description: 'Personality Charm Index: 30 points', description_en: 'Personality Charm Index: 30 points', analysis: 'You aren’t good at socializing. When facing strangers, you often feel awkward...', analysis_en: 'You aren’t good at socializing. When facing strangers, you often feel awkward.' },
  { code: 'RESULT5', name: 'Result5', name_en: 'Result5', description: 'Personality Charm Index: 70 points', description_en: 'Personality Charm Index: 70 points', analysis: 'You are a person with depth, and at the same time, you are quite independent...', analysis_en: 'You are a person with depth, and at the same time, you are quite independent.' }
];

// Questions with branching (next) or final (resultCode)
const questions = [
  { n:1, t:'Do you often have nothing to do because you\'re free?', opts:[ {n:1,text:'Yes', next:2}, {n:2,text:'No', next:3} ] },
  { n:2, t:'On a pleasant morning, what would you prefer to do?', opts:[ {n:1,text:'Exercise or go shopping', next:3}, {n:2,text:'Drink a beverage while reading a book', next:4} ] },
  { n:3, t:'Which type of food do you prefer?', opts:[ {n:1,text:'Desserts', next:4}, {n:2,text:'Western food', next:6} ] },
  { n:4, t:'Which method would you prefer to keep fit?', opts:[ {n:1,text:'Casual walking', next:5}, {n:2,text:'Intense exercise', next:6} ] },
  { n:5, t:'How many close friends do you have?', opts:[ {n:1,text:'One or none', next:7}, {n:2,text:'Two or more', next:6} ] },
  { n:6, t:'Which type of flower do you prefer?', opts:[ {n:1,text:'Elegant lilies', next:8}, {n:2,text:'Tiny daisies', next:7} ] },
  { n:7, t:'Do you open up completely to your friends?', opts:[ {n:1,text:'Yes', next:8}, {n:2,text:'No', resultCode:'RESULT4'} ] },
  { n:8, t:'Which type of beverage do you prefer?', opts:[ {n:1,text:'Fruit juices or sodas', next:9}, {n:2,text:'Coffee or milk tea', resultCode:'RESULT5'} ] },
  { n:9, t:'Have you ever stayed up all night with friends without sleeping?', opts:[ {n:1,text:'Yes', resultCode:'RESULT3'}, {n:2,text:'No', next:10} ] },
  { n:10,t:'Do you have many topics you\'re interested in?', opts:[ {n:1,text:'Yes', resultCode:'RESULT2'}, {n:2,text:'Generally few or very few', resultCode:'RESULT1'} ] }
];

(async function main(){
  const client = await pool.connect();
  try {
    console.log('✅ Connected');
    const exists = await client.query("SELECT 1 FROM test_projects WHERE project_id=$1", [projectData.project_id]);
    if (exists.rows.length) { console.log('ℹ️ Project already exists'); return; }

    // Create project
    const pr = await client.query(`
      INSERT INTO test_projects (project_id, name, name_en, image_url, intro, intro_en, test_type, estimated_time, question_count, is_active, is_jump_type, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,NOW()) RETURNING id
    `, [projectData.project_id, projectData.name, projectData.name_en, projectData.image_url, projectData.intro, projectData.intro_en, projectData.test_type, projectData.estimated_time, projectData.question_count, projectData.is_jump_type]);
    const projectId = pr.rows[0].id;
    console.log('✅ Project created:', projectId);

    // Insert result types
    for (const rt of resultTypes) {
      await client.query(`
        INSERT INTO result_types (project_id, type_code, type_name, type_name_en, description, description_en, analysis, analysis_en, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      `, [projectId, rt.code, rt.name, rt.name_en, rt.description, rt.description_en, rt.analysis, rt.analysis_en]);
    }
    console.log('✅ Result types inserted:', resultTypes.length);

    // Insert questions and options; store branching info in score_value JSON
    for (const q of questions) {
      const qr = await client.query(`
        INSERT INTO questions (project_id, question_number, question_text, question_text_en, question_type, created_at)
        VALUES ($1,$2,$3,$3,'single_choice',NOW()) RETURNING id
      `, [projectId, q.n, q.t]);
      const questionId = qr.rows[0].id;
      for (const opt of q.opts) {
        const scoreValue = {};
        if (opt.next != null) scoreValue.next = opt.next;
        if (opt.resultCode) scoreValue.resultCode = opt.resultCode;
        await client.query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at)
          VALUES ($1,$2,$3,$3,$4,NOW())
        `, [questionId, opt.n, opt.text, JSON.stringify(scoreValue)]);
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


