console.log('🚀 Creating: Anxiety and Depression Level Test');

const { Pool } = require('pg');

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const project = {
  project_id: 'anxiety_depression_test',
  name: 'Anxiety and Depression Level Test',
  name_en: 'Anxiety and Depression Level Test',
  image_url: 'assets/images/anxiety-and-depression-level-test.png',
  intro: 'This test helps you intuitively see the severity of your emotions across anxiety & depression dimensions. Not a diagnosis, but a quick reflection.',
  intro_en: 'This test helps you intuitively see the severity of your emotions across anxiety & depression dimensions. Not a diagnosis, but a quick reflection.',
  test_type: 'anxiety_depression_test',
  estimated_time: 5,
  question_count: 14,
  is_active: true,
  is_jump_type: false
};

// 14 questions, each with 4 options (A-D) and score 0..3 per doc
const questions = [
  { n:1,  t:'I feel nervous (or distressed):', opts:['Not at all','Sometimes','Most of the time','Almost all the time'],            scores:[0,1,2,3] },
  { n:2,  t:'I still have interest in the things I used to enjoy:', opts:['Definitely as much as before','Less than before','Only a little','Almost none'], scores:[0,1,2,3] },
  { n:3,  t:'I feel a bit scared, as if something terrible is going to happen:', opts:['Not at all','A little, but it doesn’t bother me','Yes, but not too serious','Very certain and quite serious'], scores:[0,1,2,3] },
  { n:4,  t:'I can laugh heartily and see the good side of things:', opts:['I do this often','I don’t do this as much now','I definitely don’t do this much now','Not at all'], scores:[0,1,2,3] },
  { n:5,  t:'My mind is filled with worries:', opts:['Occasionally','From time to time, and it’s not easy','Frequently','Most of the time'], scores:[0,1,2,3] },
  { n:6,  t:'I feel happy:', opts:['Most of the time','Sometimes','Not very often','Not at all'], scores:[0,1,2,3] },
  { n:7,  t:'I can sit calmly and relaxedly:', opts:['Definitely','Often','Not very often','Not at all'], scores:[0,1,2,3] },
  { n:8,  t:'I have lost interest in my appearance:', opts:['I still care about it as much as before','I might not care very much','I don’t care about myself as I should','Definitely (lost interest)'], scores:[0,1,2,3] },
  { n:9,  t:'I feel a bit restless, as if I have to move around:', opts:['Not at all','Not rarely','Quite a lot','Very much'], scores:[0,1,2,3] },
  { n:10, t:'I look forward to everything optimistically:', opts:['I almost always do this','I don’t do this completely','Rarely do this','Almost never do this'], scores:[0,1,2,3] },
  { n:11, t:'I suddenly feel a sense of panic:', opts:['Not at all','Not often','Very certain and quite serious','Really often'], scores:[0,1,2,3] },
  { n:12, t:'I seem to feel my mood gradually sinking:', opts:['Not at all','Sometimes','Very often','Almost all the time'], scores:[0,1,2,3] },
  { n:13, t:'I feel a bit scared, as if some internal organ has changed:', opts:['Not at all','Sometimes','Very often','Extremely often'], scores:[0,1,2,3] },
  { n:14, t:'I can appreciate a good book or a good radio/TV program:', opts:['Often','Sometimes','Not very often','Rarely'], scores:[0,1,2,3] }
];

// Result ranges & analysis
const resultTypes = [
  { code:'AD_NONE',  name:'0-7',  name_en:'0-7',  description:'You show no signs of anxiety or depression.', description_en:'You show no signs of anxiety or depression.', analysis:'You currently show no typical signs of anxiety or depression. Maintain enthusiasm and an optimistic mindset.', analysis_en:'You currently show no typical signs of anxiety or depression. Maintain enthusiasm and an optimistic mindset.' },
  { code:'AD_MAYBE', name:'8-10', name_en:'8-10', description:'You may have signs of anxiety or depression.', description_en:'You may have signs of anxiety or depression.', analysis:'Your state may show signs of anxiety or depression; arrange more joyful activities and adjust in time.', analysis_en:'Your state may show signs of anxiety or depression; arrange more joyful activities and adjust in time.' },
  { code:'AD_OBVIOUS', name:'11-21', name_en:'11-21', description:'You have signs of anxiety or depression.', description_en:'You have signs of anxiety or depression.', analysis:'Your state shows obvious signs. Please seek help from family, friends, or professional practitioners in time.', analysis_en:'Your state shows obvious signs. Please seek help from family, friends, or professional practitioners in time.' }
];

(async function main(){
  const client = await pool.connect();
  try {
    console.log('✅ Connected');
    const exists = await client.query('SELECT 1 FROM test_projects WHERE project_id=$1', [project.project_id]);
    if (exists.rows.length) { console.log('ℹ️ already exists'); return; }

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
      for (let i=0;i<q.opts.length;i++){
        const text = q.opts[i];
        const score = q.scores[i];
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


