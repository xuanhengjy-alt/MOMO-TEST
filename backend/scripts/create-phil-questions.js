console.log('🚀 Starting Phil questions creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 根据文档创建的10道题目数据
const questions = [
  {
    question: "When do you feel best?",
    options: ["In the morning", "In the afternoon and evening", "At night"],
    scores: [2, 4, 6]
  },
  {
    question: "When you walk, do you:",
    options: [
      "Take long strides and walk fast",
      "Take short steps and walk fast", 
      "Walk slowly with your head held high facing the world",
      "Walk slowly with your head down",
      "Walk very slowly"
    ],
    scores: [6, 4, 7, 2, 1]
  },
  {
    question: "When you talk to people, you...",
    options: [
      "stand with your arms crossed",
      "hold your hands tightly",
      "put one or both hands on your hips",
      "touch or push the person you are talking to",
      "play with your ears, stroke your chin, or fix your hair with your hands"
    ],
    scores: [4, 2, 5, 7, 6]
  },
  {
    question: "When sitting and resting, your...",
    options: [
      "knees are together",
      "legs are crossed",
      "legs are stretched out straight",
      "one leg is curled under your body"
    ],
    scores: [4, 6, 2, 1]
  },
  {
    question: "When you come across something that makes you laugh, your reaction is...",
    options: [
      "A hearty laugh of appreciation",
      "A smile, but not a loud one",
      "A soft giggle",
      "A shy smile"
    ],
    scores: [6, 4, 3, 5]
  },
  {
    question: "When you go to a party or social event, you...",
    options: [
      "enter loudly to draw attention",
      "enter quietly and look for people you know",
      "enter very quietly and try to stay unnoticed"
    ],
    scores: [6, 4, 2]
  },
  {
    question: "When you are concentrating very hard on your work and someone interrupts you, you will...",
    options: [
      "welcome him",
      "feel extremely annoyed",
      "be somewhere between the two extremes"
    ],
    scores: [6, 2, 4]
  },
  {
    question: "Of the following colors, which one do you like best?",
    options: [
      "Red or orange",
      "Black",
      "Yellow or light blue",
      "Green",
      "Dark blue or purple",
      "White",
      "Brown or gray"
    ],
    scores: [6, 7, 5, 4, 3, 2, 1]
  },
  {
    question: "What is your posture in bed just before falling asleep?",
    options: [
      "Lying on your back, fully stretched out",
      "Lying on your stomach, fully stretched out",
      "Lying on your side, slightly curled up",
      "With your head resting on one arm",
      "With the blanket pulled over your head"
    ],
    scores: [7, 6, 4, 2, 1]
  },
  {
    question: "Do you often dream that you are...",
    options: [
      "falling",
      "fighting or struggling",
      "looking for something or someone",
      "flying or floating",
      "you don't dream at all",
      "your dreams are all pleasant"
    ],
    scores: [4, 2, 3, 5, 6, 1]
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 获取项目ID
    const projectResult = await client.query(
      "SELECT id FROM test_projects WHERE project_id = 'phil_test_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found, please run create-phil-test.js first');
      return;
    }
    
    const projectId = projectResult.rows[0].id;
    console.log(`📊 Using project ID: ${projectId}`);
    
    // 删除现有的题目（如果有的话）
    await client.query('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE project_id = $1)', [projectId]);
    await client.query('DELETE FROM questions WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing questions');
    
    // 创建所有题目
    console.log('📝 Creating all 10 questions...');
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      // 创建题目
      const questionResult = await client.query(`
        INSERT INTO questions (project_id, question_number, question_text, question_text_en, question_type, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW()) 
        RETURNING id
      `, [
        projectId,
        i + 1,
        q.question,
        q.question,
        'single_choice'
      ]);
      
      const questionId = questionResult.rows[0].id;
      
      // 创建选项
      for (let j = 0; j < q.options.length; j++) {
        await client.query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [questionId, j + 1, q.options[j], q.options[j], q.scores[j]]);
      }
      
      console.log(`✅ Created question ${i + 1}/10: ${q.question.substring(0, 50)}...`);
    }
    
    console.log('🎉 Phil questions setup completed!');
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📝 Total questions: ${questions.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
