console.log('🚀 Starting International Standard Emotional Intelligence Test creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 国际标准情商测试项目数据
const projectData = {
  project_id: 'eq_test_en',
  name: 'International Standard Emotional Intelligence Test',
  name_en: 'International Standard Emotional Intelligence Test',
  image_url: 'assets/images/international-standard-emotional-intelligence-test.png',
  intro: 'Psychologists suggest that among the various subjective factors influencing personal success, intelligence quotient (IQ) contributes approximately 20%, while emotional quotient (EQ) accounts for roughly 80%. The International Standard EQ Assessment is a widely recognized evaluation tool that originated in Europe.',
  intro_en: 'Psychologists suggest that among the various subjective factors influencing personal success, intelligence quotient (IQ) contributes approximately 20%, while emotional quotient (EQ) accounts for roughly 80%. The International Standard EQ Assessment is a widely recognized evaluation tool that originated in Europe.',
  test_type: 'eq_test',
  estimated_time: 15,
  question_count: 33,
  is_active: true
};

// 情商测试结果类型数据
const resultTypes = [
  {
    code: "EQ_EXPERT",
    name: "EQ Expert",
    name_en: "EQ Expert",
    description: "150分以上",
    description_en: "Above 150 points",
    analysis: "You are an expert in emotional intelligence.\n\nYou respect everyone's human rights and personal dignity. You do not impose your own values on others. You have a clear understanding of yourself and can withstand pressure. You are confident but not complacent. You have good interpersonal relationships and can get along well with friends or colleagues. You are good at handling various problems encountered in life. You take every matter seriously.\n\nYou are an EQ master. Your emotional intelligence is not only not an obstacle to your career, but also an important prerequisite for your success.",
    analysis_en: "You are an expert in emotional intelligence.\n\nYou respect everyone's human rights and personal dignity. You do not impose your own values on others. You have a clear understanding of yourself and can withstand pressure. You are confident but not complacent. You have good interpersonal relationships and can get along well with friends or colleagues. You are good at handling various problems encountered in life. You take every matter seriously.\n\nYou are an EQ master. Your emotional intelligence is not only not an obstacle to your career, but also an important prerequisite for your success."
  },
  {
    code: "EQ_HIGH",
    name: "High EQ",
    name_en: "High EQ",
    description: "130~149分",
    description_en: "130-149 points",
    analysis: "Your emotional intelligence is relatively high.\n\nYou are a responsible and good citizen. You have self-respect and an independent personality, but in some cases, you can be influenced by others' anxiety. You are confident but not complacent. You have good interpersonal relationships. You can handle most problems without too much psychological pressure.\n\nYour EQ is relatively high, which indicates that you are a happy person, not easily frightened or worried. You are passionate and dedicated to your work, and are willing to take responsibility. You are also just, upright, and compassionate, showing concern for others. These are your strengths and you should strive to maintain them.",
    analysis_en: "Your emotional intelligence is relatively high.\n\nYou are a responsible and good citizen. You have self-respect and an independent personality, but in some cases, you can be influenced by others' anxiety. You are confident but not complacent. You have good interpersonal relationships. You can handle most problems without too much psychological pressure.\n\nYour EQ is relatively high, which indicates that you are a happy person, not easily frightened or worried. You are passionate and dedicated to your work, and are willing to take responsibility. You are also just, upright, and compassionate, showing concern for others. These are your strengths and you should strive to maintain them."
  },
  {
    code: "EQ_AVERAGE",
    name: "Average EQ",
    name_en: "Average EQ",
    description: "90~129分",
    description_en: "90-129 points",
    analysis: "Your emotional intelligence (EQ) is at an average level, and you are relatively susceptible to external influences. You may lack a clearly defined personal direction or long-term goals. Your responses to specific situations or individuals may vary over time, which is associated with your level of self-awareness. This awareness is not consistently present, indicating a need for greater attention and regular self-reflection.\n\nYou are capable of managing mild levels of anxiety. However, your sense of self-worth appears to be largely dependent on external validation and the approval of others. This suggests a relatively underdeveloped sense of personal identity and self-confidence. Additionally, your interpersonal relationships may be characterized by challenges, indicating room for improvement in social and emotional competencies.",
    analysis_en: "Your emotional intelligence (EQ) is at an average level, and you are relatively susceptible to external influences. You may lack a clearly defined personal direction or long-term goals. Your responses to specific situations or individuals may vary over time, which is associated with your level of self-awareness. This awareness is not consistently present, indicating a need for greater attention and regular self-reflection.\n\nYou are capable of managing mild levels of anxiety. However, your sense of self-worth appears to be largely dependent on external validation and the approval of others. This suggests a relatively underdeveloped sense of personal identity and self-confidence. Additionally, your interpersonal relationships may be characterized by challenges, indicating room for improvement in social and emotional competencies."
  },
  {
    code: "EQ_LOW",
    name: "Low EQ",
    name_en: "Low EQ",
    description: "90分以下",
    description_en: "Below 90 points",
    analysis: "Your emotional intelligence (EQ) level is relatively low, and your self-awareness is limited. You appear to lack clear personal goals and demonstrate minimal motivation to translate intentions into action. There is a tendency toward over-reliance on others, coupled with underdeveloped interpersonal skills. You exhibit limited capacity in managing anxiety and maintaining structured daily routines. Additionally, your sense of personal responsibility is underdeveloped, and you frequently express dissatisfaction or complaints.\n\nYou often struggle with emotional regulation, making you particularly susceptible to mood-driven behaviors. Frequent episodes of anger, irritability, and impulsive emotional reactions have been observed. These behavioral patterns represent significant risk factors that could potentially undermine professional development and career stability.\n\nA recommended approach involves cognitive reframing of negative experiences, combined with the cultivation of emotional regulation techniques. Maintaining rational objectivity and fostering a constructive mindset can significantly improve emotional resilience.",
    analysis_en: "Your emotional intelligence (EQ) level is relatively low, and your self-awareness is limited. You appear to lack clear personal goals and demonstrate minimal motivation to translate intentions into action. There is a tendency toward over-reliance on others, coupled with underdeveloped interpersonal skills. You exhibit limited capacity in managing anxiety and maintaining structured daily routines. Additionally, your sense of personal responsibility is underdeveloped, and you frequently express dissatisfaction or complaints.\n\nYou often struggle with emotional regulation, making you particularly susceptible to mood-driven behaviors. Frequent episodes of anger, irritability, and impulsive emotional reactions have been observed. These behavioral patterns represent significant risk factors that could potentially undermine professional development and career stability.\n\nA recommended approach involves cognitive reframing of negative experiences, combined with the cultivation of emotional regulation techniques. Maintaining rational objectivity and fostering a constructive mindset can significantly improve emotional resilience."
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有情商测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'eq_test_en'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 国际标准情商测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating EQ test project...');
    
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
    
    console.log('🎉 EQ test setup completed!');
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
