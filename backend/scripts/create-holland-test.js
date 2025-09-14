console.log('🚀 Starting Holland Occupational Interest Test creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 霍兰德职业兴趣测试项目数据
const projectData = {
  project_id: 'holland_test_en',
  name: 'Holland Occupational Interest Test',
  name_en: 'Holland Occupational Interest Test',
  image_url: 'assets/images/holland-occupational-interest-test.png',
  intro: 'Are you looking for a suitable career direction for yourself? Are you curious which jobs are more compatible with your personality traits? John Holland, a psychology professor at Johns Hopkins University in the United States and a renowned career guidance expert, put forward the far-reaching "Vocational Interest Theory" as early as 1959.',
  intro_en: 'Are you looking for a suitable career direction for yourself? Are you curious which jobs are more compatible with your personality traits? John Holland, a psychology professor at Johns Hopkins University in the United States and a renowned career guidance expert, put forward the far-reaching "Vocational Interest Theory" as early as 1959.',
  test_type: 'holland_test',
  estimated_time: 15,
  question_count: 90,
  is_active: true
};

// 霍兰德职业兴趣测试结果类型数据
const resultTypes = [
  {
    code: "REALISTIC",
    name: "Realistic",
    name_en: "Realistic",
    description: "现实型总分最高",
    description_en: "Realistic type has the highest score",
    analysis: "# Realistic\n\n## Common Characteristics:\n\nWilling to use tools for operational work, with strong hands-on ability, flexible and coordinated movements. Prefers concrete tasks, not good at expressing oneself, conservative in doing things, and rather modest. Lacks social skills and usually prefers to work independently.\n\n## Typical Occupations:\n\nJobs that involve the use of tools and machines and require basic operational skills. People who are interested in occupations that demand mechanical aptitude, physical strength, or work with objects, machines, tools, sports equipment, plants, and animals, and have the corresponding abilities. Such as technical occupations (computer hardware personnel, photographers, draftsmen, mechanical assemblers), and skilled occupations (carpenters, chefs, mechanics, repairmen, farmers, general laborers).",
    analysis_en: "# Realistic\n\n## Common Characteristics:\n\nWilling to use tools for operational work, with strong hands-on ability, flexible and coordinated movements. Prefers concrete tasks, not good at expressing oneself, conservative in doing things, and rather modest. Lacks social skills and usually prefers to work independently.\n\n## Typical Occupations:\n\nJobs that involve the use of tools and machines and require basic operational skills. People who are interested in occupations that demand mechanical aptitude, physical strength, or work with objects, machines, tools, sports equipment, plants, and animals, and have the corresponding abilities. Such as technical occupations (computer hardware personnel, photographers, draftsmen, mechanical assemblers), and skilled occupations (carpenters, chefs, mechanics, repairmen, farmers, general laborers)."
  },
  {
    code: "INVESTIGATIVE",
    name: "Investigative",
    name_en: "Investigative",
    description: "研究型总分最高",
    description_en: "Investigative type has the highest score",
    analysis: "# Investigative\n\n## Common Characteristics:\n\nA thinker rather than a doer, with strong abstract thinking ability, a strong thirst for knowledge, willing to use the brain and good at thinking, but reluctant to take action. Prefers independent and creative work. Well-informed and learned, but not good at leading others. Considers issues rationally, likes to be precise when doing things, enjoys logical analysis and reasoning, and constantly explores unknown fields.\n\n## Typical Occupations:\n\nPeople who enjoy intellectual, abstract, analytical and independent-oriented tasks, and whose work requires the application of intelligence or analytical skills to observe, estimate, measure, form theories and ultimately solve problems, and who possess the corresponding abilities. Such as scientific researchers, teachers, engineers, computer programmers, doctors, and systems analysts.",
    analysis_en: "# Investigative\n\n## Common Characteristics:\n\nA thinker rather than a doer, with strong abstract thinking ability, a strong thirst for knowledge, willing to use the brain and good at thinking, but reluctant to take action. Prefers independent and creative work. Well-informed and learned, but not good at leading others. Considers issues rationally, likes to be precise when doing things, enjoys logical analysis and reasoning, and constantly explores unknown fields.\n\n## Typical Occupations:\n\nPeople who enjoy intellectual, abstract, analytical and independent-oriented tasks, and whose work requires the application of intelligence or analytical skills to observe, estimate, measure, form theories and ultimately solve problems, and who possess the corresponding abilities. Such as scientific researchers, teachers, engineers, computer programmers, doctors, and systems analysts."
  },
  {
    code: "ARTISTIC",
    name: "Artistic",
    name_en: "Artistic",
    description: "艺术型总分最高",
    description_en: "Artistic type has the highest score",
    analysis: "# Artistic\n\n## Common Characteristics:\n\nCreative, enjoying the creation of novel and distinctive achievements, eager to express one's individuality and realize one's own value. Idealistic in doing things, pursuing perfection and not attaching much importance to practicality. Possessing certain artistic talents and individuality. Good at expressing oneself, nostalgic, and having a rather complex mindset.\n\n## Typical Occupations:\n\nThe preferred job requires artistic accomplishment, creativity, expression ability and intuition, and applying them to the aesthetic, thinking and feeling of language, behavior, sound, color and form, and having the corresponding ability. Not good at administrative work. Such as in the field of art (actors, directors, art designers, sculptors, architects, photographers, advertising producers), music (singers, composers, band conductors), literature (novelists, poets, playwrights).",
    analysis_en: "# Artistic\n\n## Common Characteristics:\n\nCreative, enjoying the creation of novel and distinctive achievements, eager to express one's individuality and realize one's own value. Idealistic in doing things, pursuing perfection and not attaching much importance to practicality. Possessing certain artistic talents and individuality. Good at expressing oneself, nostalgic, and having a rather complex mindset.\n\n## Typical Occupations:\n\nThe preferred job requires artistic accomplishment, creativity, expression ability and intuition, and applying them to the aesthetic, thinking and feeling of language, behavior, sound, color and form, and having the corresponding ability. Not good at administrative work. Such as in the field of art (actors, directors, art designers, sculptors, architects, photographers, advertising producers), music (singers, composers, band conductors), literature (novelists, poets, playwrights)."
  },
  {
    code: "SOCIAL",
    name: "Social",
    name_en: "Social",
    description: "社会型总分最高",
    description_en: "Social type has the highest score",
    analysis: "# Social\n\n## Common Features:\n\nEnjoy interacting with people, constantly making new friends, be good at conversation, and be willing to teach others. Care about social issues and eager to play a role in society. Seek extensive interpersonal relationships and attach great importance to social obligations and social morality.\n\n## Typical Occupations:\n\nI enjoy jobs that involve interacting with people, constantly making new friends, and engaging in activities such as providing information, inspiration, assistance, training, development or treatment, and I have the corresponding abilities. For example: educators (teachers, educational administrators), social workers (counselors, public relations personnel).",
    analysis_en: "# Social\n\n## Common Features:\n\nEnjoy interacting with people, constantly making new friends, be good at conversation, and be willing to teach others. Care about social issues and eager to play a role in society. Seek extensive interpersonal relationships and attach great importance to social obligations and social morality.\n\n## Typical Occupations:\n\nI enjoy jobs that involve interacting with people, constantly making new friends, and engaging in activities such as providing information, inspiration, assistance, training, development or treatment, and I have the corresponding abilities. For example: educators (teachers, educational administrators), social workers (counselors, public relations personnel)."
  },
  {
    code: "ENTERPRISING",
    name: "Enterprising",
    name_en: "Enterprising",
    description: "企业型总分最高",
    description_en: "Enterprising type has the highest score",
    analysis: "# Enterprising\n\n## Common Features:\n\nA pursuit of power, authority and material wealth, with leadership skills. Enjoy competition, dare to take risks, be ambitious and have lofty aspirations. Be practical, accustomed to measuring the value of doing things in terms of gains and losses, power, status, money, etc., and have a strong sense of purpose in doing things.\n\n## Typical Occupations:\n\nThose who enjoy jobs that require business, management, persuasion, supervision and leadership skills to achieve institutional, political, social and economic goals, and possess the corresponding abilities, such as project managers, salespeople, marketing managers, government officials, business leaders, judges and lawyers.",
    analysis_en: "# Enterprising\n\n## Common Features:\n\nA pursuit of power, authority and material wealth, with leadership skills. Enjoy competition, dare to take risks, be ambitious and have lofty aspirations. Be practical, accustomed to measuring the value of doing things in terms of gains and losses, power, status, money, etc., and have a strong sense of purpose in doing things.\n\n## Typical Occupations:\n\nThose who enjoy jobs that require business, management, persuasion, supervision and leadership skills to achieve institutional, political, social and economic goals, and possess the corresponding abilities, such as project managers, salespeople, marketing managers, government officials, business leaders, judges and lawyers."
  },
  {
    code: "CONVENTIONAL",
    name: "Conventional",
    name_en: "Conventional",
    description: "常规型总分最高",
    description_en: "Conventional type has the highest score",
    analysis: "# Conventional\n\n## Common Characteristics:\n\nRespect authority and regulations, like to act according to plans, be meticulous and organized, accustomed to accepting others' instructions and leadership, and not seek leadership positions. Like to focus on practical and detailed situations, usually cautious and conservative, lack creativity, dislike taking risks and competing, and have a spirit of self-sacrifice.\n\n## Typical Occupations:\n\nPeople who enjoy occupations that require attention to detail, precision, and systematic organization of data and textual information according to specific requirements or procedures, and possess the corresponding abilities, such as secretaries, office workers, clerks, accountants, administrative assistants, librarians, cashiers, typists, and investment analysts.",
    analysis_en: "# Conventional\n\n## Common Characteristics:\n\nRespect authority and regulations, like to act according to plans, be meticulous and organized, accustomed to accepting others' instructions and leadership, and not seek leadership positions. Like to focus on practical and detailed situations, usually cautious and conservative, lack creativity, dislike taking risks and competing, and have a spirit of self-sacrifice.\n\n## Typical Occupations:\n\nPeople who enjoy occupations that require attention to detail, precision, and systematic organization of data and textual information according to specific requirements or procedures, and possess the corresponding abilities, such as secretaries, office workers, clerks, accountants, administrative assistants, librarians, cashiers, typists, and investment analysts."
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有霍兰德职业兴趣测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'holland_test_en'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 霍兰德职业兴趣测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating Holland Occupational Interest Test project...');
    
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
    
    console.log('🎉 Holland Occupational Interest Test setup completed!');
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
