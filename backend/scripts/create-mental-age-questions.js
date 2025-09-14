console.log('🚀 Starting Mental Age questions creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 根据文档创建的20道题目数据
const questions = [
  { 
    question: "Which of the following situations best describes you?", 
    options: [
      { text: "I am often drawn to people who are stronger than myself.", score: 1 },
      { text: "I prefer to approach those who seem to like and respect me.", score: 3 },
      { text: "I like people who appear to need me.", score: 5 }
    ]
  },
  { 
    question: "You are trying to explain an important issue to a friend, but they disagree or fail to understand. What will you do?", 
    options: [
      { text: "Continue explaining.", score: 5 },
      { text: "Feel hurt or angry and stop talking.", score: 1 },
      { text: "Avoid the issue.", score: 3 }
    ]
  },
  { 
    question: "Suppose you are at an evening gathering with friends and you start to feel down. What will you do?", 
    options: [
      { text: "Make an excuse and go home as soon as possible.", score: 3 },
      { text: "Stay with them until the end even if you feel miserable.", score: 1 },
      { text: "Force a smile and keep your low mood from being noticed.", score: 5 }
    ]
  },
  { 
    question: "When you are bedridden due to illness, you:", 
    options: [
      { text: "Like being waited on by others.", score: 1 },
      { text: "Prefer to be alone.", score: 5 },
      { text: "Don't like being the center of attention or being cared for; you'd rather read books or find other ways to entertain yourself.", score: 3 }
    ]
  },
  { 
    question: "Which of the following situations best describes you?", 
    options: [
      { text: "I like the kind of food my mom has always made for me.", score: 1 },
      { text: "I enjoy all kinds of food as long as it tastes good.", score: 3 },
      { text: "I like the meals I cook myself the most.", score: 5 }
    ]
  },
  { 
    question: "When you encounter troubles at work, what will you do after work?", 
    options: [
      { text: "Go out to distract yourself and forget about the troubles.", score: 5 },
      { text: "Hope to get comfort when you go home.", score: 1 },
      { text: "Find a friend to vent your unhappiness to.", score: 3 }
    ]
  },
  { 
    question: "You have been teasing a good-natured friend, and suddenly they argue with you. What will you do?", 
    options: [
      { text: "Feel embarrassed.", score: 1 },
      { text: "Argue back with them.", score: 3 },
      { text: "Blame yourself and try to make amends.", score: 5 }
    ]
  },
  { 
    question: "Someone you just met is struggling to teach you something you already know very well. What will you do?", 
    options: [
      { text: "Tell them you already know it.", score: 3 },
      { text: "Say nothing but stop listening.", score: 1 },
      { text: "Wait for them to finish, then show that you are very proficient in this area.", score: 5 }
    ]
  },
  { 
    question: "If you receive a bonus (higher than your salary), you will:", 
    options: [
      { text: "Save it.", score: 3 },
      { text: "Use it to buy something you have always wanted but don't necessarily need.", score: 1 },
      { text: "Use it to buy daily necessities.", score: 5 }
    ]
  },
  { 
    question: "Which activity interests you the most?", 
    options: [
      { text: "Any activity that allows you to interact with others.", score: 3 },
      { text: "Activities that help you escape work stress and bring pure joy.", score: 1 },
      { text: "Organizing sports events or other beneficial activities, such as gardening, woodworking, etc.", score: 5 }
    ]
  },
  { 
    question: "If a friend says something insulting to you, what will you do?", 
    options: [
      { text: "Resent them and end the friendship.", score: 5 },
      { text: "Feel very sad no matter how ridiculous the words are.", score: 1 },
      { text: "Not know what to say.", score: 3 }
    ]
  },
  { 
    question: "Is the person you care about the most:", 
    options: [
      { text: "Someone who needs you more than you need them.", score: 5 },
      { text: "Someone who needs you as much as you need them.", score: 3 },
      { text: "Someone you need more than they need you.", score: 1 }
    ]
  },
  { 
    question: "You are in a passionate relationship with someone. An old friend of yours, who has known this person for a long time, cares about you and warns you about them. What will you do?", 
    options: [
      { text: "Listen to them with resentment.", score: 5 },
      { text: "Tell them to mind their own business.", score: 3 },
      { text: "Oppose everything they say.", score: 1 }
    ]
  },
  { 
    question: "When you receive an unexpected gift, how will you react?", 
    options: [
      { text: "Think about what gift to give in return.", score: 5 },
      { text: "Feel happy.", score: 1 },
      { text: "Think about what the giver wants from you.", score: 3 }
    ]
  },
  { 
    question: "You have already planned your holiday schedule, but the holiday is still a month away. Will you:", 
    options: [
      { text: "Feel so excited that the days until then seem annoying and long.", score: 1 },
      { text: "Spend a lot of time imagining what you will do.", score: 3 },
      { text: "Continue living your life as usual during this period.", score: 5 }
    ]
  },
  { 
    question: "A friend cancels a date with you at the last minute without a valid reason. What will you think?", 
    options: [
      { text: "They found something better to do.", score: 1 },
      { text: "They must have run into some trouble.", score: 3 },
      { text: "They are a bit thoughtless, but it won't bother you much.", score: 3 }
    ]
  },
  { 
    question: "When you become interested in something, what will you do?", 
    options: [
      { text: "Work hard at it and persist with it for a long time.", score: 5 },
      { text: "Get involved in it but lose enthusiasm quickly.", score: 1 },
      { text: "Sometimes do a, sometimes do b—it depends on what the interest is.", score: 3 }
    ]
  },
  { 
    question: "Which of the following situations best describes you?", 
    options: [
      { text: "It's a pity I never got the chance; otherwise, I would have achieved great things instead of being where I am now.", score: 1 },
      { text: "Everything I have achieved is consistent with my long-term efforts.", score: 5 },
      { text: "I spend a lot of time doing things I don't want to do.", score: 3 }
    ]
  },
  { 
    question: "A friend points out an annoying flaw of yours. What will you do?", 
    options: [
      { text: "Feel resentful.", score: 5 },
      { text: "Feel upset and ashamed for a while.", score: 1 },
      { text: "Ask another friend if this flaw is true.", score: 3 }
    ]
  },
  { 
    question: "You really want to be good friends with someone, so you invite them to a dance, but they refuse. What will you do?", 
    options: [
      { text: "Feel stupid.", score: 1 },
      { text: "Wonder what you did to make them dislike you, but not feel particularly sad about it.", score: 3 },
      { text: "Shrug and tell yourself, \"There are plenty of other people in the world besides them.\"", score: 5 }
    ]
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 获取项目ID
    const projectResult = await client.query(
      "SELECT id FROM test_projects WHERE project_id = 'mental_age_test_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found, please run create-mental-age-test.js first');
      return;
    }
    
    const projectId = projectResult.rows[0].id;
    console.log(`📊 Using project ID: ${projectId}`);
    
    // 删除现有的题目（如果有的话）
    await client.query('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE project_id = $1)', [projectId]);
    await client.query('DELETE FROM questions WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing questions');
    
    // 创建所有题目
    console.log('📝 Creating all 20 questions...');
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
        const option = q.options[j];
        await client.query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [questionId, j + 1, option.text, option.text, option.score]);
      }
      
      if ((i + 1) % 5 === 0) {
        console.log(`✅ Created ${i + 1}/20 questions`);
      }
    }
    
    console.log('🎉 Mental Age questions setup completed!');
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📝 Total questions: ${questions.length}`);
    console.log(`📋 Options per question: 3`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
