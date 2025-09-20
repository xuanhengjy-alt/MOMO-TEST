console.log('🚀 Starting simple introversion test...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有内向外向测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE name LIKE '%Introversion%' OR test_type = 'introversion_extraversion'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 内向外向测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating introversion test project...');
    
    // 创建测试项目
    const projectResult = await client.query(`
      INSERT INTO test_projects (project_id, name, name_en, image_url, intro, intro_en, test_type, estimated_time, question_count, is_active, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
      RETURNING id
    `, [
      'introversion_en',
      'Professional Test For Introversion vs Extroversion',
      'Professional Test For Introversion vs Extroversion',
      'assets/images/professional-test-for-introversion-extraversion-degree.png',
      'Do you truly understand your social tendencies and energy sources? This professional test, through 70 carefully designed questions, helps you scientifically assess the extroverted and introverted traits in your personality.',
      'Do you truly understand your social tendencies and energy sources? This professional test, through 70 carefully designed questions, helps you scientifically assess the extroverted and introverted traits in your personality.',
      'introversion_extraversion',
      15,
      70,
      true
    ]);
    
    const projectId = projectResult.rows[0].id;
    console.log(`✅ Test project created with ID: ${projectId}`);
    
    // 创建第一道题作为示例
    const questionResult = await client.query(`
      INSERT INTO questions (project_id, question_number, question_text, question_text_en, question_type, created_at) 
      VALUES ($1, $2, $3, $4, $5, NOW()) 
      RETURNING id
    `, [
      projectId,
      1,
      "Do you usually feel physically healthy?",
      "Do you usually feel physically healthy?",
      'single_choice'
    ]);
    
    const questionId = questionResult.rows[0].id;
    
    // 创建选项
    await client.query(`
      INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [questionId, 1, "Yes", "Yes", 1]);
    
    await client.query(`
      INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [questionId, 2, "No", "No", -1]);
    
    console.log('✅ First question and options created');
    
    // 创建结果类型
    await client.query(`
      INSERT INTO result_types (project_id, type_code, type_name, type_name_en, description, description_en, analysis, analysis_en, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      projectId,
      "VERY_INTROVERTED",
      "Very introverted",
      "Very introverted",
      "0-35分",
      "0-35 points",
      "You are very introverted. Your close friends and family always give you a sense of security and protect you all the time.",
      "You are very introverted. Your close friends and family always give you a sense of security and protect you all the time."
    ]);
    
    console.log('✅ Result type created');
    console.log('🎉 Simple introversion test setup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
