console.log('🚀 Starting Holland questions creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 根据文档创建的90道题目数据
const questions = [
  { question: "A strong and agile body is very important to me.", type: "REALISTIC" },
  { question: "I must thoroughly understand the truth of things.", type: "INVESTIGATIVE" },
  { question: "My mood is greatly influenced by music, colors and beautiful things.", type: "ARTISTIC" },
  { question: "Relationships with others enrich my life and give it meaning.", type: "SOCIAL" },
  { question: "I am confident that I will succeed.", type: "ENTERPRISING" },
  { question: "I must have clear guidance when doing things.", type: "CONVENTIONAL" },
  { question: "I am good at making and repairing things by myself.", type: "REALISTIC" },
  { question: "I can spend a long time thinking through the logic of things.", type: "INVESTIGATIVE" },
  { question: "I value a beautiful environment.", type: "ARTISTIC" },
  { question: "I am willing to spend time helping others solve personal crises.", type: "SOCIAL" },
  { question: "I enjoy competition.", type: "ENTERPRISING" },
  { question: "I spend a lot of time planning before starting a project.", type: "CONVENTIONAL" },
  { question: "I enjoy using my hands to do things.", type: "REALISTIC" },
  { question: "Exploring new ideas satisfies me.", type: "INVESTIGATIVE" },
  { question: "I am seeking new ways to express my creativity.", type: "ARTISTIC" },
  { question: "I think it is important to share my anxiety with others.", type: "SOCIAL" },
  { question: "Being a key task executor in a group is important to me.", type: "ENTERPRISING" },
  { question: "I am proud that I can pay attention to all the details in my work.", type: "CONVENTIONAL" },
  { question: "I don't mind getting my hands dirty at work.", type: "REALISTIC" },
  { question: "I believe that education is a lifelong learning process to develop and sharpen the mind.", type: "INVESTIGATIVE" },
  { question: "I like casual clothing and trying new colors and styles.", type: "ARTISTIC" },
  { question: "I often understand the need of someone to communicate with others.", type: "SOCIAL" },
  { question: "I enjoy helping others improve continuously.", type: "ENTERPRISING" },
  { question: "When making decisions, I usually don't like to take risks.", type: "CONVENTIONAL" },
  { question: "I like to buy small parts and make them into finished products.", type: "REALISTIC" },
  { question: "Sometimes I spend a long time reading, playing puzzles, and meditating on the essence of life.", type: "INVESTIGATIVE" },
  { question: "I have a strong imagination.", type: "ARTISTIC" },
  { question: "I enjoy helping others develop their talents and abilities.", type: "SOCIAL" },
  { question: "I like to supervise things until they are completed.", type: "ENTERPRISING" },
  { question: "If I face a new situation, I will make full preparations in advance.", type: "CONVENTIONAL" },
  { question: "I like to complete a task independently.", type: "REALISTIC" },
  { question: "I am eager to read or think about anything that can arouse my curiosity.", type: "INVESTIGATIVE" },
  { question: "I like to try innovative concepts.", type: "ARTISTIC" },
  { question: "If I have conflicts with others, I will keep trying to turn hostility into harmony.", type: "SOCIAL" },
  { question: "To succeed, one must set high goals.", type: "ENTERPRISING" },
  { question: "I like to be responsible for major decisions.", type: "CONVENTIONAL" },
  { question: "I like to speak frankly and dislike beating around the bush.", type: "REALISTIC" },
  { question: "Before solving a problem, I must analyze it thoroughly.", type: "INVESTIGATIVE" },
  { question: "I enjoy rearranging my environment to make it unique.", type: "ARTISTIC" },
  { question: "I often solve my own problems by talking with others.", type: "SOCIAL" },
  { question: "I often draft a plan and let others handle the details.", type: "ENTERPRISING" },
  { question: "Punctuality is very important to me.", type: "CONVENTIONAL" },
  { question: "Outdoor activities make me feel refreshed.", type: "REALISTIC" },
  { question: "I constantly ask: Why?", type: "INVESTIGATIVE" },
  { question: "I like my work to express my emotions and feelings.", type: "ARTISTIC" },
  { question: "I like to help others find ways to pay attention to each other.", type: "SOCIAL" },
  { question: "It is exciting to be involved in major decisions.", type: "ENTERPRISING" },
  { question: "I often keep things clean and like to be organized.", type: "CONVENTIONAL" },
  { question: "I like my surroundings to be simple and practical.", type: "REALISTIC" },
  { question: "I will keep thinking about a problem until I find the answer.", type: "INVESTIGATIVE" },
  { question: "The beauty of nature deeply touches my soul.", type: "ARTISTIC" },
  { question: "Close interpersonal relationships are very important to me.", type: "SOCIAL" },
  { question: "Promotion and progress are extremely important to me.", type: "ENTERPRISING" },
  { question: "I feel more secure when I plan my daily work well.", type: "CONVENTIONAL" },
  { question: "I am not afraid of heavy workloads and know the priorities of work.", type: "REALISTIC" },
  { question: "I like books that make me think and give me new ideas.", type: "INVESTIGATIVE" },
  { question: "I hope to see art performances, plays and good movies.", type: "ARTISTIC" },
  { question: "I am quite sensitive to others' emotional lows.", type: "SOCIAL" },
  { question: "Being able to influence others excites me.", type: "ENTERPRISING" },
  { question: "When I promise to do something, I will supervise all the details to the best of my ability.", type: "CONVENTIONAL" },
  { question: "I hope that heavy manual work won't hurt anyone.", type: "REALISTIC" },
  { question: "I hope to study all the subjects that interest me.", type: "INVESTIGATIVE" },
  { question: "I hope to do something different.", type: "ARTISTIC" },
  { question: "I am willing to offer help to others when they are in trouble.", type: "SOCIAL" },
  { question: "I am willing to take a little risk for progress.", type: "ENTERPRISING" },
  { question: "I feel safe when I follow the rules.", type: "CONVENTIONAL" },
  { question: "When I choose a car, the first thing I notice is a good engine.", type: "REALISTIC" },
  { question: "I like words that stimulate my thinking.", type: "INVESTIGATIVE" },
  { question: "When I am engaged in creative work, I forget all my past experiences.", type: "ARTISTIC" },
  { question: "I am concerned about the fact that many people in society need help.", type: "SOCIAL" },
  { question: "It is interesting to persuade others to act according to the plan.", type: "ENTERPRISING" },
  { question: "I am good at checking details.", type: "CONVENTIONAL" },
  { question: "I usually know how to deal with emergencies.", type: "REALISTIC" },
  { question: "Reading newly discovered books is an exciting thing.", type: "INVESTIGATIVE" },
  { question: "I like beautiful and extraordinary things.", type: "ARTISTIC" },
  { question: "I often care about lonely and unfriendly people.", type: "SOCIAL" },
  { question: "I like bargaining.", type: "ENTERPRISING" },
  { question: "I am careful with my money.", type: "CONVENTIONAL" },
  { question: "I keep fit by doing sports.", type: "REALISTIC" },
  { question: "I am often curious about the mysteries of nature.", type: "INVESTIGATIVE" },
  { question: "Trying new and extraordinary things is quite interesting.", type: "ARTISTIC" },
  { question: "When others tell me about their difficulties, I am a good listener.", type: "SOCIAL" },
  { question: "If I fail in doing something, I will try again.", type: "ENTERPRISING" },
  { question: "I need to know exactly what others expect of me.", type: "CONVENTIONAL" },
  { question: "I like to take things apart to see if I can repair them.", type: "REALISTIC" },
  { question: "I like to study all the facts and then make a logical decision.", type: "INVESTIGATIVE" },
  { question: "A life without beautiful things is unimaginable to me.", type: "ARTISTIC" },
  { question: "People often tell me their problems.", type: "SOCIAL" },
  { question: "I often get in touch with others through the information network.", type: "ENTERPRISING" },
  { question: "Finishing something carefully is a rewarding thing.", type: "CONVENTIONAL" }
];

// 每题都有相同的2个选项
const options = [
  { text: "Yes", score: 1 },
  { text: "No", score: 0 }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 获取项目ID
    const projectResult = await client.query(
      "SELECT id FROM test_projects WHERE project_id = 'holland_test_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found, please run create-holland-test.js first');
      return;
    }
    
    const projectId = projectResult.rows[0].id;
    console.log(`📊 Using project ID: ${projectId}`);
    
    // 删除现有的题目（如果有的话）
    await client.query('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE project_id = $1)', [projectId]);
    await client.query('DELETE FROM questions WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing questions');
    
    // 创建所有题目
    console.log('📝 Creating all 90 questions...');
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
      
      if ((i + 1) % 15 === 0) {
        console.log(`✅ Created ${i + 1}/90 questions`);
      }
    }
    
    console.log('🎉 Holland questions setup completed!');
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
