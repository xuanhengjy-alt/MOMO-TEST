console.log('🚀 Starting Phil personality test creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 菲尔人格测试项目数据
const projectData = {
  project_id: 'phil_test_en',
  name: 'Phil personality test',
  name_en: 'Phil personality test',
  image_url: 'assets/images/phil-personality-test.png',
  intro: 'The Phil Personality Test is a psychological assessment instrument developed by Dr. Phil, a prominent psychologist, during his appearance on the television program hosted by renowned media personality Oprah Winfrey. This test categorizes personality types based on the analysis of behavioral patterns and psychological inclinations.',
  intro_en: 'The Phil Personality Test is a psychological assessment instrument developed by Dr. Phil, a prominent psychologist, during his appearance on the television program hosted by renowned media personality Oprah Winfrey. This test categorizes personality types based on the analysis of behavioral patterns and psychological inclinations.',
  test_type: 'phil_test',
  estimated_time: 5,
  question_count: 10,
  is_active: true
};

// 菲尔人格测试结果类型数据
const resultTypes = [
  {
    code: "PHIL_INTROVERTED_PESSIMIST",
    name: "Introverted Pessimist",
    name_en: "Introverted Pessimist",
    description: "< 21分",
    description_en: "< 21 points",
    analysis: "## Introverted Pessimist\n\nPeople think you are shy, neurotic, indecisive, someone who needs to be taken care of, always needing others to make decisions for you, and not wanting to be involved with anything or anyone. They think you are a worrywart, someone who always sees problems that don't exist. Some people find you boring, but only those who truly know you understand that you are not like that.",
    analysis_en: "## Introverted Pessimist\n\nPeople think you are shy, neurotic, indecisive, someone who needs to be taken care of, always needing others to make decisions for you, and not wanting to be involved with anything or anyone. They think you are a worrywart, someone who always sees problems that don't exist. Some people find you boring, but only those who truly know you understand that you are not like that."
  },
  {
    code: "PHIL_CONFIDENCE_LACKING_CRITIC",
    name: "Confidence-Lacking Critic",
    name_en: "Confidence-Lacking Critic",
    description: "21-30分",
    description_en: "21-30 points",
    analysis: "## Confidence-Lacking Critic\n\nYour friends think you are diligent and meticulous, very critical. They see you as cautious, extremely careful, a slow and steady worker. If you do anything impulsive or unprepared, it will surprise them. They think you often decide not to do things after carefully examining them from all angles. They believe this reaction of yours is partly due to your cautious nature.",
    analysis_en: "## Confidence-Lacking Critic\n\nYour friends think you are diligent and meticulous, very critical. They see you as cautious, extremely careful, a slow and steady worker. If you do anything impulsive or unprepared, it will surprise them. They think you often decide not to do things after carefully examining them from all angles. They believe this reaction of yours is partly due to your cautious nature."
  },
  {
    code: "PHIL_RETALIATORY_SELF_PROTECTOR",
    name: "Retaliatory Self-Protector",
    name_en: "Retaliatory Self-Protector",
    description: "31-40分",
    description_en: "31-40 points",
    analysis: "## Retaliatory Self-Protector\n\nOthers think you are wise, cautious, and practical. They also think you are smart, talented, and humble. You don't make friends quickly or easily, but you are very loyal to your friends and expect the same loyalty in return. Those who truly get to know you will understand that it's very hard to shake your trust in friends, but equally, once that trust is broken, it's very hard for you to get over it.",
    analysis_en: "## Retaliatory Self-Protector\n\nOthers think you are wise, cautious, and practical. They also think you are smart, talented, and humble. You don't make friends quickly or easily, but you are very loyal to your friends and expect the same loyalty in return. Those who truly get to know you will understand that it's very hard to shake your trust in friends, but equally, once that trust is broken, it's very hard for you to get over it."
  },
  {
    code: "PHIL_BALANCED_MODERATE",
    name: "Balanced Moderate",
    name_en: "Balanced Moderate",
    description: "41-50分",
    description_en: "41-50 points",
    analysis: "## Balanced Moderate\n\nOthers think you are fresh, energetic, charming, fun, practical, and always interesting; someone who is often the center of attention but balanced enough not to get carried away. They also think you are kind, gentle, considerate, and understanding; someone who always cheers others up and helps them.",
    analysis_en: "## Balanced Moderate\n\nOthers think you are fresh, energetic, charming, fun, practical, and always interesting; someone who is often the center of attention but balanced enough not to get carried away. They also think you are kind, gentle, considerate, and understanding; someone who always cheers others up and helps them."
  },
  {
    code: "PHIL_ATTRACTIVE_ADVENTURER",
    name: "Attractive Adventurer",
    name_en: "Attractive Adventurer",
    description: "51-60分",
    description_en: "51-60 points",
    analysis: "## Attractive Adventurer\n\nOthers think you are exciting, highly energetic, and rather impulsive. You are a natural leader, someone who makes decisions quickly, though not always correctly. They think you are bold and adventurous, willing to try anything at least once; someone who is willing to take chances and appreciate adventure. Because of your excitement, they enjoy being around you.",
    analysis_en: "## Attractive Adventurer\n\nOthers think you are exciting, highly energetic, and rather impulsive. You are a natural leader, someone who makes decisions quickly, though not always correctly. They think you are bold and adventurous, willing to try anything at least once; someone who is willing to take chances and appreciate adventure. Because of your excitement, they enjoy being around you."
  },
  {
    code: "PHIL_ARROGANT_SOLITARY",
    name: "Arrogant Solitary",
    name_en: "Arrogant Solitary",
    description: "> 60分",
    description_en: "> 60 points",
    analysis: "## Arrogant Solitary\n\nOthers think you must be \"handled with care\". In their eyes, you are arrogant, self-centered, extremely domineering and controlling. They may admire you and wish to be more like you, but they won't always trust you and may hesitate to get closer to you. The world is nested layer upon layer, repeating itself; it doesn't change according to any will.",
    analysis_en: "## Arrogant Solitary\n\nOthers think you must be \"handled with care\". In their eyes, you are arrogant, self-centered, extremely domineering and controlling. They may admire you and wish to be more like you, but they won't always trust you and may hesitate to get closer to you. The world is nested layer upon layer, repeating itself; it doesn't change according to any will."
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有菲尔人格测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'phil_test_en'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 菲尔人格测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating Phil personality test project...');
    
    // 创建测试项目
    const projectResult = await client.query(`
      INSERT INTO test_projects (project_id, name, name_en, image_url, intro, intro_en, test_type, estimated_time, question_count, is_active, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
      RETURNING id
    `, [
      projectData.project_id,
      projectData.name,
      projectData.name_en,
      projectData.image_url,
      projectData.intro,
      projectData.intro_en,
      projectData.test_type,
      projectData.estimated_time,
      projectData.question_count,
      projectData.is_active
    ]);
    
    const projectId = projectResult.rows[0].id;
    console.log(`✅ Test project created with ID: ${projectId}`);
    
    // 创建结果类型
    console.log('📝 Creating result types...');
    for (const resultType of resultTypes) {
      await client.query(`
        INSERT INTO result_types (project_id, type_code, type_name, type_name_en, description, description_en, analysis, analysis_en, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        projectId,
        resultType.code,
        resultType.name,
        resultType.name_en,
        resultType.description,
        resultType.description_en,
        resultType.analysis,
        resultType.analysis_en
      ]);
    }
    console.log(`✅ Created ${resultTypes.length} result types`);
    
    console.log('🎉 Phil personality test setup completed!');
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📋 Result types: ${resultTypes.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
