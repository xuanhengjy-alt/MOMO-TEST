console.log('🚀 Starting PDP questions creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 根据文档创建的30道题目数据
const questions = [
  { question: "Are you a reliable person when doing things?" },
  { question: "Are you gentle in personality?" },
  { question: "Are you energetic?" },
  { question: "Are you understanding?" },
  { question: "Are you independent?" },
  { question: "Are you beloved by others?" },
  { question: "Are you serious and upright in doing things?" },
  { question: "Are you compassionate?" },
  { question: "Are you persuasive?" },
  { question: "Are you bold?" },
  { question: "Are you precise?" },
  { question: "Are you adaptable?" },
  { question: "Are you good at organizing?" },
  { question: "Are you proactive?" },
  { question: "Are you shy?" },
  { question: "Are you assertive?" },
  { question: "Are you calm?" },
  { question: "Are you brave to learn?" },
  { question: "Are you quick in reaction?" },
  { question: "Are you outgoing?" },
  { question: "Do you pay attention to details?" },
  { question: "Are you talkative?" },
  { question: "Are you good at coordinating?" },
  { question: "Are you diligent?" },
  { question: "Are you generous?" },
  { question: "Are you cautious?" },
  { question: "Are you pleasant?" },
  { question: "Are you traditional?" },
  { question: "Are you kind?" },
  { question: "Are you efficient enough in work?" }
];

// 每题都有相同的5个选项
const options = [
  "Strongly agree",
  "Agree", 
  "Neutral",
  "Slightly agree",
  "Disagree"
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 获取项目ID
    const projectResult = await client.query(
      "SELECT id FROM test_projects WHERE project_id = 'pdp_test_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found, please run create-pdp-test.js first');
      return;
    }
    
    const projectId = projectResult.rows[0].id;
    console.log(`📊 Using project ID: ${projectId}`);
    
    // 删除现有的题目（如果有的话）
    await client.query('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE project_id = $1)', [projectId]);
    await client.query('DELETE FROM questions WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing questions');
    
    // 创建所有题目
    console.log('📝 Creating all 30 questions...');
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
      for (let j = 0; j < options.length; j++) {
        await client.query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [questionId, j + 1, options[j], options[j], 0]);
      }
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1}/30 questions`);
      }
    }
    
    console.log('🎉 PDP questions setup completed!');
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📝 Total questions: ${questions.length}`);
    console.log(`📋 Options per question: ${options.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
