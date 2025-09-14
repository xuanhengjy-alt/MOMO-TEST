console.log('🚀 Starting Test Your Mental Age creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 心理年龄测试项目数据
const projectData = {
  project_id: 'mental_age_test_en',
  name: 'Test Your Mental Age',
  name_en: 'Test Your Mental Age',
  image_url: 'assets/images/test-your-mental-age.png',
  intro: 'Whether a person is mature cannot be simply defined by their age, because one\'s years of life do not fully align with their behaviors and emotions. Some people are physically mature, yet their actions are as childish as those of a kid. On the other hand, there are individuals who, though still young children, have already gained a good understanding of many truths about the world—this is exactly what the saying "an old head on young shoulders" means.',
  intro_en: 'Whether a person is mature cannot be simply defined by their age, because one\'s years of life do not fully align with their behaviors and emotions. Some people are physically mature, yet their actions are as childish as those of a kid. On the other hand, there are individuals who, though still young children, have already gained a good understanding of many truths about the world—this is exactly what the saying "an old head on young shoulders" means.',
  test_type: 'mental_age_test',
  estimated_time: 8,
  question_count: 20,
  is_active: true
};

// 心理年龄测试结果类型数据
const resultTypes = [
  {
    code: "CHILD_STAGE",
    name: "Child Stage",
    name_en: "Child Stage",
    description: "心理年龄稳定在儿童阶段 (20-45分)",
    description_en: "Mental age remains stable at childlike state (20-45 points)",
    analysis: "Your mental age remains stable at a childlike state. You may always feel a bit pitiful and especially long for emotional comfort and support at critical moments. You love to hear praise, always want to please others, and hope that people say you make them happy. This childlike state makes you somewhat unrealistic in many aspects, but it also enables you to feel happier than those \"mature\" people. You are likely to be passionate about sports and can enjoy all kinds of things like a child.",
    analysis_en: "Your mental age remains stable at a childlike state. You may always feel a bit pitiful and especially long for emotional comfort and support at critical moments. You love to hear praise, always want to please others, and hope that people say you make them happy. This childlike state makes you somewhat unrealistic in many aspects, but it also enables you to feel happier than those \"mature\" people. You are likely to be passionate about sports and can enjoy all kinds of things like a child."
  },
  {
    code: "ADOLESCENT_STAGE",
    name: "Adolescent Stage",
    name_en: "Adolescent Stage",
    description: "内心世界处于青少年阶段 (46-75分)",
    description_en: "Inner world is in teenage state (46-75 points)",
    analysis: "Your inner world is in a teenage state, needing both independence and comfort and care. This contradictory mentality is a characteristic of the teenage years. They wish to break free from the constraints of family life, but at the same time, they have a latent worry about the harshness of the outside world. No matter how old you are, this teenage contradiction is an important tendency in your personality. You are not very practical when assessing situations, quickly alternating between optimism and pessimism. Perhaps the greatest trait in your nature is the creative aspect, and it's very likely that you still hold onto the teenage view that everything is possible and the world is your birthday cake.",
    analysis_en: "Your inner world is in a teenage state, needing both independence and comfort and care. This contradictory mentality is a characteristic of the teenage years. They wish to break free from the constraints of family life, but at the same time, they have a latent worry about the harshness of the outside world. No matter how old you are, this teenage contradiction is an important tendency in your personality. You are not very practical when assessing situations, quickly alternating between optimism and pessimism. Perhaps the greatest trait in your nature is the creative aspect, and it's very likely that you still hold onto the teenage view that everything is possible and the world is your birthday cake."
  },
  {
    code: "MATURE_STAGE",
    name: "Highly Mature",
    name_en: "Highly Mature",
    description: "高度成熟 (76-100分)",
    description_en: "Highly mature (76-100 points)",
    analysis: "Your mental age is very mature. In fact, you must be over 25 years old. This means that you are quite practical and sophisticated when dealing with daily problems. You have a strong rational nature, are not interested in empty talk, and are not very idealistic. At least within the range you feel you can control, you consider yourself a strong person. You control others within this range and care about them at the same time. If you become a parent, you will surely be very responsible, but you may worry too much. You will find that your adult role forces you to sacrifice a lot of freedom. Have you lost some of the joy of life?",
    analysis_en: "Your mental age is very mature. In fact, you must be over 25 years old. This means that you are quite practical and sophisticated when dealing with daily problems. You have a strong rational nature, are not interested in empty talk, and are not very idealistic. At least within the range you feel you can control, you consider yourself a strong person. You control others within this range and care about them at the same time. If you become a parent, you will surely be very responsible, but you may worry too much. You will find that your adult role forces you to sacrifice a lot of freedom. Have you lost some of the joy of life?"
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有心理年龄测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'mental_age_test_en'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 心理年龄测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating Test Your Mental Age project...');
    
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
    
    console.log('🎉 Test Your Mental Age setup completed!');
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
