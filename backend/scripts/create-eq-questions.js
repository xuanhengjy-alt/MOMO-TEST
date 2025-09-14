console.log('🚀 Starting EQ questions creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 根据文档创建的33道题目数据
const questions = [
  { question: "I have the ability to overcome all kinds of difficulties", options: ["Yes", "Not necessarily", "No"] },
  { question: "If I could go to a new environment, I would arrange my life", options: ["Similar to before", "Not necessarily", "Different from before"] },
  { question: "Throughout my life, I felt that I could achieve the goals I envisioned", options: ["Yes", "Not necessarily", "No"] },
  { question: "For some reason, some people are always avoiding or being cold to me", options: ["No", "Not necessarily", "Yes"] },
  { question: "On the street, I often avoid people I don't want to greet", options: ["Never like", "Occasionally like", "Sometimes like"] },
  { question: "When I'm concentrating on my work, if someone is talking loudly beside me", options: ["I can still concentrate on my work", "Somewhere between A and C", "I can't concentrate and I feel angry"] },
  { question: "Can I clearly identify directions wherever I go", options: ["Yes", "Not necessarily", "No"] },
  { question: "I love my major and the work I do", options: ["Yes", "Not necessarily", "No"] },
  { question: "Climate change doesn't affect my mood", options: ["Yes", "Between A and C", "No"] },
  { question: "I never get angry at gossip", options: ["Yes", "Between A and C", "No"] },
  { question: "I'm good at controlling my facial expressions", options: ["Yes", "Not quite sure", "No"] },
  { question: "When going to bed, I often", options: ["Easy to fall asleep", "Between A and C", "Difficult to fall asleep"] },
  { question: "When someone bothers me, I", options: ["Keep quiet", "Somewhere between A and C", "Protest loudly to vent one's anger"] },
  { question: "After arguing with others or making mistakes at work, I often feel tremors, exhausted and unable to continue working with peace of mind", options: ["No", "Somewhere between A and C", "Yes"] },
  { question: "I'm often bothered by trivial matters", options: ["No", "Somewhere between A and C", "Yes"] },
  { question: "I'd rather live in a secluded suburb than in a noisy city", options: ["No", "Not quite sure", "Yes"] },
  { question: "I've been nicknamed and taunted by friends and colleagues", options: ["Never", "Occasionally", "It's a common thing"] },
  { question: "There is a kind of food that makes me vomit after eating it", options: ["No", "Remember", "Yes"] },
  { question: "There is no other world in my heart except the world I see", options: ["No", "Remember", "Yes"] },
  { question: "What would I think of years later that would make me extremely uneasy", options: ["Never thought of", "Occasionally thought of", "Often thought"] },
  { question: "I often feel that my family is not nice to me, but I know for sure that they are nice to me", options: ["No", "Unexplainable", "Yes"] },
  { question: "Every day I close the door as soon as I get home", options: ["No", "Not clear", "Yes"] },
  { question: "I sat in the small room with the door closed, but I still felt uneasy", options: ["No", "Occasionally", "Yes"] },
  { question: "When something requires me to make a decision, I often find it very difficult", options: ["No", "Occasionally", "Yes"] },
  { question: "I often use games like flipping coins, flipping paper, and drawing lots to predict good or bad luck", options: ["No", "Occasionally", "Yes"] },
  { question: "I go out early and come back late for work, and I often feel exhausted when I get up in the morning", options: ["Yes", "No"] },
  { question: "In a certain state of mind, I would get lost in daydreaming because of confusion and put my work on hold", options: ["Yes", "No"] },
  { question: "My nerves are fragile and I tremble at the slightest provocation", options: ["Yes", "No"] },
  { question: "In my sleep, I am often awakened by nightmares", options: ["Yes", "No"] },
  { question: "I am willing to take on tough tasks at work", options: ["Never", "Almost never", "Half the time", "Most of the time", "Always"] },
  { question: "I often find good intentions in others", options: ["Never", "Almost never", "Half the time", "Most of the time", "Always"] },
  { question: "Be able to listen to different opinions, including self-criticism", options: ["Never", "Almost never", "Half the time", "Most of the time", "Always"] },
  { question: "I often encourage myself to be hopeful about the future", options: ["Never", "Almost never", "Half the time", "Most of the time", "Always"] }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 获取项目ID
    const projectResult = await client.query(
      "SELECT id FROM test_projects WHERE project_id = 'eq_test_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found, please run create-eq-test.js first');
      return;
    }
    
    const projectId = projectResult.rows[0].id;
    console.log(`📊 Using project ID: ${projectId}`);
    
    // 删除现有的题目（如果有的话）
    await client.query('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE project_id = $1)', [projectId]);
    await client.query('DELETE FROM questions WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing questions');
    
    // 创建所有题目
    console.log('📝 Creating all 33 questions...');
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
        `, [questionId, j + 1, q.options[j], q.options[j], 0]);
      }
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1}/33 questions`);
      }
    }
    
    console.log('🎉 EQ questions setup completed!');
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
