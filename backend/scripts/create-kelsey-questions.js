console.log('🚀 Starting Kelsey questions creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 根据文档创建的70道题目数据
const questions = [
  { question: "When the phone rings, you would:", type: "E" },
  { question: "You tend to:", type: "S" },
  { question: "Which situation is worse for you:", type: "N" },
  { question: "When you are with others, you usually:", type: "F" },
  { question: "Which situation makes you feel more comfortable:", type: "T" },
  { question: "When facing noise in the work environment, you would:", type: "J" },
  { question: "Your way of doing things:", type: "P" },
  { question: "When queuing, you often:", type: "E" },
  { question: "You tend to:", type: "S" },
  { question: "What are you more interested in:", type: "N" },
  { question: "You are more likely to make judgments based on:", type: "F" },
  { question: "When evaluating others, you tend to be:", type: "T" },
  { question: "How do you prefer to make a contract:", type: "J" },
  { question: "You would rather have:", type: "P" },
  { question: "At a party, you tend to:", type: "E" },
  { question: "You tend to:", type: "S" },
  { question: "What kind of author do you like:", type: "N" },
  { question: "What attracts you more:", type: "F" },
  { question: "If you have to disappoint someone, you usually:", type: "T" },
  { question: "In work, you hope your progress is:", type: "J" },
  { question: "You often propose:", type: "P" },
  { question: "Communicating with strangers:", type: "E" },
  { question: "Facts:", type: "S" },
  { question: "You think that dreamers and theorists:", type: "N" },
  { question: "In a heated debate, you would:", type: "F" },
  { question: "Which is better:", type: "T" },
  { question: "What do you think is more natural in work:", type: "J" },
  { question: "When do you feel more comfortable:", type: "P" },
  { question: "You tend to:", type: "E" },
  { question: "Common sense:", type: "S" },
  { question: "Children often do not:", type: "N" },
  { question: "When managing others, you tend to be:", type: "F" },
  { question: "You tend to be:", type: "T" },
  { question: "You tend to:", type: "J" },
  { question: "In most cases, you are more:", type: "P" },
  { question: "You think you are:", type: "E" },
  { question: "You are more often:", type: "S" },
  { question: "When you speak, you:", type: "N" },
  { question: "Which sentence is more like a compliment:", type: "F" },
  { question: "What do you tend to be more influenced by:", type: "T" },
  { question: "When a task is completed, you prefer:", type: "J" },
  { question: "What kind of work do you like:", type: "P" },
  { question: "You are the kind of person who:", type: "E" },
  { question: "You are more likely to accept:", type: "S" },
  { question: "You tend to pay more attention to:", type: "N" },
  { question: "Which is worse to be:", type: "F" },
  { question: "In embarrassing situations, you sometimes act:", type: "T" },
  { question: "When making choices, you tend to:", type: "J" },
  { question: "You prefer:", type: "P" },
  { question: "At work, you tend to:", type: "E" },
  { question: "You are more likely to believe:", type: "S" },
  { question: "You are more willing to accept:", type: "N" },
  { question: "You consider yourself more of:", type: "F" },
  { question: "Which of your qualities do you value more:", type: "T" },
  { question: "You usually hope that things:", type: "J" },
  { question: "You consider yourself more:", type: "P" },
  { question: "You think of yourself as:", type: "E" },
  { question: "You are quite satisfied with your ability to:", type: "S" },
  { question: "You pay more attention to:", type: "N" },
  { question: "Which mistake seems more serious:", type: "F" },
  { question: "What influences you more:", type: "T" },
  { question: "In which situation do you feel better:", type: "J" },
  { question: "What is more satisfying:", type: "P" },
  { question: "You are:", type: "E" },
  { question: "What kind of stories do you like:", type: "S" },
  { question: "What is easier for you:", type: "N" },
  { question: "What do you wish you had more of:", type: "F" },
  { question: "You basically consider yourself:", type: "T" },
  { question: "What you often notice is:", type: "J" },
  { question: "You are more:", type: "P" }
];

// 每题都有相同的2个选项
const options = [
  { text: "A", score: 1 },
  { text: "B", score: 0 }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 获取项目ID
    const projectResult = await client.query(
      "SELECT id FROM test_projects WHERE project_id = 'kelsey_test_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found, please run create-kelsey-test.js first');
      return;
    }
    
    const projectId = projectResult.rows[0].id;
    console.log(`📊 Using project ID: ${projectId}`);
    
    // 删除现有的题目（如果有的话）
    await client.query('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE project_id = $1)', [projectId]);
    await client.query('DELETE FROM questions WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing questions');
    
    // 创建所有题目
    console.log('📝 Creating all 70 questions...');
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
        const option = options[j];
        await client.query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [questionId, j + 1, option.text, option.text, option.score]);
      }
      
      if ((i + 1) % 14 === 0) {
        console.log(`✅ Created ${i + 1}/70 questions`);
      }
    }
    
    console.log('🎉 Kelsey questions setup completed!');
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📝 Total questions: ${questions.length}`);
    console.log(`📋 Options per question: ${options.length}`);
    
    // 显示题目类型统计
    console.log('\n📊 题目类型统计:');
    const typeStats = {};
    questions.forEach(q => {
      typeStats[q.type] = (typeStats[q.type] || 0) + 1;
    });
    
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}题`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
