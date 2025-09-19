console.log('🚀 Creating: Test your creativity');

const { Pool } = require('pg');

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const project = {
  project_id: 'creativity_test',
  name: 'Test your creativity',
  name_en: 'Test your creativity',
  image_url: 'assets/images/test-your-creativity.jpg',
  intro: 'A 10-question quiz to measure your creativity score across everyday scenarios.',
  intro_en: 'A 10-question quiz to measure your creativity score across everyday scenarios.',
  test_type: 'creativity_test',
  estimated_time: 5,
  question_count: 10,
  is_active: true,
  is_jump_type: false
};

// Questions and options per document
const questions = [
  { n:1,  t:'Do you often make typos?', opts:['Yes, I\'ve been corrected several times.','Sometimes, but it basically doesn\'t affect understanding.','No, I rarely make spelling mistakes and always check carefully.'] },
  { n:2,  t:'It’s almost time for a meal, but all you have at home is one carrot, a bunch of green vegetables, and a handful of green onions. What will you do?', opts:['Just order takeout.','Try to cook something with them—maybe I can make a new kind of dish!','Look up online what dishes I can make with these ingredients.','Go to the supermarket to buy more ingredients and make a dish I know how to cook.'] },
  { n:3,  t:'You have a homework assignment: to write a short essay with a free topic—you can write about anything you want. What will you do?', opts:['Rub your hands in excitement and quickly figure out what to write.','Feel a bit troubled, because a free topic means too many choices.','Feel annoyed and would rather have a more specific topic.'] },
  { n:4,  t:'How do you usually choose clothes when you buy them?', opts:['Figure out in advance how to match them with the clothes I already have before buying.','Buy all the clothes I need at once without thinking too much.','I don’t choose—almost wear the same style every day to save trouble.','Only wear matching clothing sets that suit me, following my own matching rules.'] },
  { n:5,  t:'Which of the following two practices is more like you?', opts:['Color according to the sample in the coloring book.','Color according to my own ideas.','Not sure.'] },
  { n:6,  t:'If a book has no clear, structured plot in its writing style, what will you do?', opts:['Think that a book with an unclear plot can’t be a good work.','Appreciate this artistic style, but can’t accept it.','Don’t think a book has to have a clear story line to be good.'] },
  { n:7,  t:'Are you good at lying?', opts:['I can do it easily, and most of the time I can get away with it (proud face).','I can do it if I have enough time to prepare, but not when I have to improvise.','I’m not good at it at all—can anyone teach me how to lie?'] },
  { n:8,  t:'You and your friend joined a project just for fun, and agreed that this Friday is the deadline. But it’s already Wednesday, and you haven’t started yet because you’ve been busy with other things. What will you do?', opts:['I’ll finish it even if I have to "cry through it"—I made the decision myself, so I’ll work as hard as I can to catch up.','Tell my friend if we can extend the deadline, because I really don’t have time right now.','It’s just for fun anyway—my friend won’t mind. I’ll do it on Saturday.'] },
  { n:9,  t:'Is your room tidy?', opts:['No... It’s a mess...','It’s okay—not too tidy, but not too messy either.','Yes, it’s clean and tidy.'] },
  { n:10, t:'Which of the following two jobs would you choose?', opts:['A job that’s very boring and monotonous, but has good pay.','A job that’s very cool and creative, but has lower pay.'] }
];

// Scoring table per question (0-based option index)
const scoreMap = {
  1:  [3,2,1],
  2:  [0,3,2,1],
  3:  [3,2,1],
  4:  [3,1,0,2],
  5:  [1,3,2],
  6:  [1,2,3],
  7:  [3,2,1],
  8:  [1,2,3],
  9:  [3,2,1],
  10: [0,2]
};

// Result ranges and analyses
const resultTypes = [
  {
    code: 'CREATIVE_2_STAR',
    name: 'Creativity: ★★☆☆☆', name_en: 'Creativity: ★★☆☆☆',
    description: 'Score 7-12', description_en: 'Score 7-12',
    analysis: 'You are a rule-abiding person who doesn’t like challenging tasks; you prefer certainty. Strengths: you keep your word and rarely make mistakes. Weaknesses: you follow rules too strictly and struggle to break through your own thinking.',
    analysis_en: 'You are a rule-abiding person who doesn’t like challenging tasks; you prefer certainty. Strengths: you keep your word and rarely make mistakes. Weaknesses: you follow rules too strictly and struggle to break through your own thinking.'
  },
  {
    code: 'CREATIVE_3_STAR',
    name: 'Creativity: ★★★☆☆', name_en: 'Creativity: ★★★☆☆',
    description: 'Score 13-17', description_en: 'Score 13-17',
    analysis: 'Between adventurer and conservative, you lean conservative. Strengths: well-organized and reliable. Weaknesses: sometimes stuck on surface-level issues and conventional thinking.',
    analysis_en: 'Between adventurer and conservative, you lean conservative. Strengths: well-organized and reliable. Weaknesses: sometimes stuck on surface-level issues and conventional thinking.'
  },
  {
    code: 'CREATIVE_4_STAR',
    name: 'Creativity: ★★★★☆', name_en: 'Creativity: ★★★★☆',
    description: 'Score 18-23', description_en: 'Score 18-23',
    analysis: 'Your creativity is quite good—sometimes your ideas surprise others; you still follow rules when needed. Strengths: creative and flexible thinking. Weaknesses: sometimes unpredictable to others.',
    analysis_en: 'Your creativity is quite good—sometimes your ideas surprise others; you still follow rules when needed. Strengths: creative and flexible thinking. Weaknesses: sometimes unpredictable to others.'
  },
  {
    code: 'CREATIVE_5_STAR',
    name: 'Creativity: ★★★★★', name_en: 'Creativity: ★★★★★',
    description: 'Score 24-29', description_en: 'Score 24-29',
    analysis: 'Extremely creative; strict-rule environments are torturous. Strengths: rich imagination and extraordinary creativity. Weaknesses: can be careless and pay little attention to details.',
    analysis_en: 'Extremely creative; strict-rule environments are torturous. Strengths: rich imagination and extraordinary creativity. Weaknesses: can be careless and pay little attention to details.'
  }
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
        const score = (scoreMap[q.n] && scoreMap[q.n][i] != null) ? scoreMap[q.n][i] : 0;
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


