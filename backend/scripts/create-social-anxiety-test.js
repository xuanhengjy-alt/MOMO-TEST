console.log('🚀 Creating: Social Anxiety Level Test');

const { Pool } = require('pg');

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const project = {
  project_id: 'social_anxiety_test',
  name: 'Social Anxiety Level Test',
  name_en: 'Social Anxiety Level Test',
  image_url: 'assets/images/social-anxiety-level-test.png',
  intro: 'A 15-question scale covering multiple social situations to reflect your level of social anxiety. Not a diagnosis, but a quick self-check.',
  intro_en: 'A 15-question scale covering multiple social situations to reflect your level of social anxiety. Not a diagnosis, but a quick self-check.',
  test_type: 'social_anxiety_test',
  estimated_time: 6,
  question_count: 15,
  is_active: true,
  is_jump_type: false
};

// Questions (English phrasing adapted) and scoring maps per document
const questions = [
  { n:1,  t:'Even at informal gatherings, I feel nervous.',                                 opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:2,  t:'I feel uncomfortable when I am with a group of strangers.',                   opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:3,  t:'I usually feel relaxed when talking with someone of the opposite sex.',       opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:4,  t:'I feel nervous when I must talk with a teacher or superior.',                 opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:5,  t:'Parties often make me feel anxious and uncomfortable.',                       opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:6,  t:'Compared with most people, I am less shy in social situations.',              opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:7,  t:'I often feel nervous when talking with a same-sex person I don’t know well.', opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:8,  t:'I feel nervous at job interviews.',                                          opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:9,  t:'I wish I had more confidence when socializing.',                              opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:10, t:'I rarely feel anxious in social situations.',                                opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:11, t:'Generally speaking, I am a shy person.',                                     opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:12, t:'I feel nervous when talking with an attractive person of the opposite sex.',  opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:13, t:'I feel nervous when calling someone I don’t know well.',                      opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:14, t:'I feel nervous when talking with an authority figure.',                       opts:['Not at all','A little','Moderately','Very much','Extremely'] },
  { n:15, t:'Even among people quite different from me, I usually feel relaxed.',          opts:['Not at all','A little','Moderately','Very much','Extremely'] }
];

// Score mappings per question (A..E -> 1..5 or reversed per doc)
// Use 0-based option index mapping to numeric score
const scoreMap = {
  1:  [1,2,3,4,5],
  2:  [1,2,3,4,5],
  3:  [5,4,3,2,1],
  4:  [1,2,3,4,5],
  5:  [1,2,3,4,5],
  6:  [5,4,3,2,1],
  7:  [1,2,3,4,5],
  8:  [1,2,3,4,5],
  9:  [1,2,3,4,5],
  10: [5,4,3,2,1],
  11: [1,2,3,4,5],
  12: [1,2,3,4,5],
  13: [1,2,3,4,5],
  14: [1,2,3,4,5],
  15: [5,4,3,2,1]
};

// Result bands
const resultTypes = [
  { code:'SA_SEVERE', name:'61-75', name_en:'61-75', description:'Very severe social anxiety', description_en:'Very severe social anxiety', analysis:'You currently have a rather severe tendency of social anxiety across multiple scenarios. Consider seeking professional help in time.', analysis_en:'You currently have a rather severe tendency of social anxiety across multiple scenarios. Consider seeking professional help in time.' },
  { code:'SA_MILD',   name:'41-60', name_en:'41-60', description:'Mild social anxiety',        description_en:'Mild social anxiety',        analysis:'Only mild social anxiety in specific cases; simple adjustments can help.', analysis_en:'Only mild social anxiety in specific cases; simple adjustments can help.' },
  { code:'SA_NONE',   name:'0-40',  name_en:'0-40',  description:'No social anxiety',          description_en:'No social anxiety',          analysis:'No social anxiety; you can remain relaxed and natural in most social contexts.', analysis_en:'No social anxiety; you can remain relaxed and natural in most social contexts.' }
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


