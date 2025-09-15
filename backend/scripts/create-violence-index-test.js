console.log('🚀 Creating: Find out how many stars your violence index has');

const { Pool } = require('pg');

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const project = {
  project_id: 'violence_index',
  name: 'Find out how many stars your violence index has',
  name_en: 'Find out how many stars your violence index has',
  image_url: 'assets/images/find-out-how-many-stars-your-violence-index-has.png',
  intro: 'A branching test that tells you how many stars your “violence index” has through daily scenarios.',
  intro_en: 'A branching test that tells you how many stars your “violence index” has through daily scenarios.',
  test_type: 'violence_index',
  estimated_time: 2,
  question_count: 10,
  is_active: true,
  is_jump_type: true
};

// Result codes mapping
const results = {
  RESULT1: { name: 'Violence Index: ★★★★☆', desc: 'High violence tendency (Result 1)' },
  RESULT2: { name: 'Violence Index: ☆☆☆☆☆', desc: 'No violence tendency (Result 2)' },
  RESULT3: { name: 'Violence Index: ★★☆☆☆', desc: 'Mild tendency (Result 3)' },
  RESULT4: { name: 'Violence Index: ★★★☆☆', desc: 'Medium tendency (Result 4)' }
};

// Questions with branching per document
const Q = [
  { n:1, t:'Do you get angry easily?', opts:[ {n:1,text:'Yes',next:2}, {n:2,text:'No',next:4}, {n:3,text:'It’s okay',next:3} ] },
  { n:2, t:'Do you think you’re efficient at work?', opts:[ {n:1,text:'Very efficient',next:4}, {n:2,text:'Not efficient at all',next:3}, {n:3,text:'Average',next:5} ] },
  { n:3, t:'How long can you stick to one job?', opts:[ {n:1,text:'About three months',next:5}, {n:2,text:'About one year',next:4}, {n:3,text:'More than three years',next:6} ] },
  { n:4, t:'Do you show a bad face to your family and friends around you?', opts:[ {n:1,text:'Yes',next:5}, {n:2,text:'No',next:6}, {n:3,text:'Maybe',next:7} ] },
  { n:5, t:'If someone fails to keep a promise to you, what will you do?', opts:[ {n:1,text:'It’s okay; everyone has special circumstances',next:7}, {n:2,text:'Confront them directly and lash out',next:6}, {n:3,text:'Never talk to this untrustworthy person again',next:8} ] },
  { n:6, t:'What kind of person are you in your friends’ eyes?', opts:[ {n:1,text:'A kind person',next:7}, {n:2,text:'A cold person',next:8}, {n:3,text:'A person with a strong personality',next:9} ] },
  { n:7, t:'If someone accidentally breaks your vase, what will you do?', opts:[ {n:1,text:'Ask them to buy a new one',next:8}, {n:2,text:'It’s okay; broken is broken',next:10}, {n:3,text:'Say nothing, but feel annoyed inside',next:9} ] },
  { n:8, t:'Do you think you’re a person who is consistent in words and deeds?', opts:[ {n:1,text:'More or less',next:9}, {n:2,text:'No',next:10}, {n:3,text:'Yes',resultCode:'RESULT3'} ] },
  { n:9, t:'What kind of life do you think suits you best?', opts:[ {n:1,text:'A low-key and plain life',next:10}, {n:2,text:'A high-end and upscale life',resultCode:'RESULT1'}, {n:3,text:'A humorous and romantic life',resultCode:'RESULT2'} ] },
  { n:10,t:'How often do you quarrel with your parents?', opts:[ {n:1,text:'Every day',resultCode:'RESULT4'}, {n:2,text:'About once a month',resultCode:'RESULT1'}, {n:3,text:'About once a year',resultCode:'RESULT3'} ] }
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

    // Insert result types
    for (const [code, val] of Object.entries(results)) {
      await client.query(`
        INSERT INTO result_types (project_id, type_code, type_name, type_name_en, description, description_en, analysis, analysis_en, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
      `, [projectId, code, val.name, val.name, val.desc, val.desc, val.name, val.name]);
    }
    console.log('✅ Result types inserted:', Object.keys(results).length);

    // Insert questions/options with branching in score_value
    for (const q of Q) {
      const qr = await client.query(`
        INSERT INTO questions (project_id, question_number, question_text, question_text_en, question_type, created_at)
        VALUES ($1,$2,$3,$3,'single_choice',NOW()) RETURNING id
      `, [projectId, q.n, q.t]);
      const qid = qr.rows[0].id;
      for (const opt of q.opts) {
        const sv = {};
        if (opt.next != null) sv.next = opt.next;
        if (opt.resultCode) sv.resultCode = opt.resultCode;
        await client.query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at)
          VALUES ($1,$2,$3,$3,$4,NOW())
        `, [qid, opt.n, opt.text, JSON.stringify(sv)]);
      }
    }
    console.log('✅ Questions inserted:', Q.length);

  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    client.release();
    await pool.end();
  }
})();


