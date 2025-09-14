console.log('🚀 Starting Four-colors Personality Analysis creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 四色性格测试项目数据
const projectData = {
  project_id: 'four_colors_en',
  name: 'Four-colors Personality Analysis',
  name_en: 'Four-colors Personality Analysis',
  image_url: 'assets/images/four-colors-personality-analysis.png',
  intro: 'FPA (Four-colors Personality Analysis) provides people with a simple and practical tool that everyone can quickly master and apply in real life and work. No matter what kind of occupation you are engaged in - whether in an office, a hospital, a store, a school or a construction site, you can gain insights into the personality traits of people around you through their dressing styles, job responsibilities and ways of interpersonal communication.',
  intro_en: 'FPA (Four-colors Personality Analysis) provides people with a simple and practical tool that everyone can quickly master and apply in real life and work. No matter what kind of occupation you are engaged in - whether in an office, a hospital, a store, a school or a construction site, you can gain insights into the personality traits of people around you through their dressing styles, job responsibilities and ways of interpersonal communication.',
  test_type: 'four_colors',
  estimated_time: 15,
  question_count: 30,
  is_active: true
};

// 四色性格测试结果类型数据
const resultTypes = [
  {
    code: "RED_PERSONALITY",
    name: "Red personality",
    name_en: "Red personality",
    description: "A+H数量最多",
    description_en: "A+H count is highest",
    analysis: "# Red personality\n## [Personality Strengths]:\n\n**As an individual:**\n\nA highly optimistic and positive mindset. Like oneself and also easily accept others. Regard life as an experience worth enjoying. Like novelty, change and excitement. Often happy and pursue happiness. Rich and expressive emotions. Free and unrestrained. Like to joke and tease. Original and distinctive. Strong expressiveness. Easily liked and welcomed by people. Lively and curious.\n\n**Communication Characteristics:**\n\nQuick-witted and articulate. Prefers physical contact to convey affection. Eager to strike up conversations. Direct in expressing feelings during conflicts. Becomes more energetic in larger groups. Skilled in public speaking and stage performances. Enjoys voicing opinions.\n\n**As a friend:**\n\nSincere and proactive, full of enthusiasm. Enjoys making friends and is good at interacting with strangers. Skilled at making people laugh, a source of joy. Forgiving of oneself and others, not holding grudges. Has personal charm. Always ready to help. Admits mistakes promptly and apologizes quickly. Loves receiving affirmation and praise from others.\n\n**Attitude towards work and career:**\n\nProactive in work, always seeking new tasks. Infectious and able to draw others into participation. Inspires the team's enthusiasm for cooperation and progress, valuing the sense of teamwork. A pleasant workmate. Highly explosive in achieving short-term goals. Trusts others. Skilled at praising and encouraging, a natural motivator. Dislikes excessive regulations and restrictions, creative. Approaches work in a lively and enriching way. Quick to react, starts like lightning.",
    analysis_en: "# Red personality\n## [Personality Strengths]:\n\n**As an individual:**\n\nA highly optimistic and positive mindset. Like oneself and also easily accept others. Regard life as an experience worth enjoying. Like novelty, change and excitement. Often happy and pursue happiness. Rich and expressive emotions. Free and unrestrained. Like to joke and tease. Original and distinctive. Strong expressiveness. Easily liked and welcomed by people. Lively and curious.\n\n**Communication Characteristics:**\n\nQuick-witted and articulate. Prefers physical contact to convey affection. Eager to strike up conversations. Direct in expressing feelings during conflicts. Becomes more energetic in larger groups. Skilled in public speaking and stage performances. Enjoys voicing opinions.\n\n**As a friend:**\n\nSincere and proactive, full of enthusiasm. Enjoys making friends and is good at interacting with strangers. Skilled at making people laugh, a source of joy. Forgiving of oneself and others, not holding grudges. Has personal charm. Always ready to help. Admits mistakes promptly and apologizes quickly. Loves receiving affirmation and praise from others.\n\n**Attitude towards work and career:**\n\nProactive in work, always seeking new tasks. Infectious and able to draw others into participation. Inspires the team's enthusiasm for cooperation and progress, valuing the sense of teamwork. A pleasant workmate. Highly explosive in achieving short-term goals. Trusts others. Skilled at praising and encouraging, a natural motivator. Dislikes excessive regulations and restrictions, creative. Approaches work in a lively and enriching way. Quick to react, starts like lightning."
  },
  {
    code: "BLUE_PERSONALITY",
    name: "Blue personality",
    name_en: "Blue personality",
    description: "B+G数量最多",
    description_en: "B+G count is highest",
    analysis: "# Blue personality\n##【Strengths】:\n\n**As an individual:**\n\nA serious philosophy of life. Deep thinking, independent thinking without blindly following the crowd. Silent and reserved, mature and prudent. Emphasizes commitment, reliable and safe. Cautious and reserved. Adheres to principles, highly responsible. Follows rules, well-organized. Deep and goal-oriented idealism. Sensitive and delicate. High standards, pursues perfection. Modest and stable. Good at analysis, organized. Loyal to friends, self-sacrificing. Thoughtful and deliberate. Tenacious and persistent.\n\n**Communication characteristics:**\n\nEnjoys sensitive and profound communication. Empathizes with others. Can remember the emotions and thoughts that resonated during conversations. Prefers intellectual exchanges in small groups. Pays attention to the details of conversations.\n\n**As a friend:**\n\nSilently shows concern and love by giving. Loyal to friendship. Cares sincerely about friends' situations and is good at being considerate. Can remember special days. When friends encounter difficulties, tries to offer encouragement and comfort. Rarely expresses inner thoughts to others. Often plays the role of solving and analyzing problems.\n\n**Towards work and career:**\n\nEmphasizes systems, procedures, norms, details, and processes. Plans before doing and strictly follows the plan. Likes to explore and act based on facts. Loyal and dedicated, pursues excellence. Highly self-disciplined. Prefers to verify results through management with tables and numbers. Emphasizes commitment. Executes work meticulously.",
    analysis_en: "# Blue personality\n##【Strengths】:\n\n**As an individual:**\n\nA serious philosophy of life. Deep thinking, independent thinking without blindly following the crowd. Silent and reserved, mature and prudent. Emphasizes commitment, reliable and safe. Cautious and reserved. Adheres to principles, highly responsible. Follows rules, well-organized. Deep and goal-oriented idealism. Sensitive and delicate. High standards, pursues perfection. Modest and stable. Good at analysis, organized. Loyal to friends, self-sacrificing. Thoughtful and deliberate. Tenacious and persistent.\n\n**Communication characteristics:**\n\nEnjoys sensitive and profound communication. Empathizes with others. Can remember the emotions and thoughts that resonated during conversations. Prefers intellectual exchanges in small groups. Pays attention to the details of conversations.\n\n**As a friend:**\n\nSilently shows concern and love by giving. Loyal to friendship. Cares sincerely about friends' situations and is good at being considerate. Can remember special days. When friends encounter difficulties, tries to offer encouragement and comfort. Rarely expresses inner thoughts to others. Often plays the role of solving and analyzing problems.\n\n**Towards work and career:**\n\nEmphasizes systems, procedures, norms, details, and processes. Plans before doing and strictly follows the plan. Likes to explore and act based on facts. Loyal and dedicated, pursues excellence. Highly self-disciplined. Prefers to verify results through management with tables and numbers. Emphasizes commitment. Executes work meticulously."
  },
  {
    code: "YELLOW_PERSONALITY",
    name: "Yellow personality",
    name_en: "Yellow personality",
    description: "C+F数量最多",
    description_en: "C+F count is highest",
    analysis: "# Yellow personality\n## [Personality Strengths]:\n\n**As an individual:**\n\nI will never give up until I reach my goal. I constantly set goals to drive myself forward. I view life as a competition. I act quickly and am full of energy. I have a strong will. I am confident, not emotional, and very energetic. I am straightforward, direct, and to the point. I have a strong drive for progress and always think ahead. I am independent. I have a strong desire to win. I am not afraid of power and am willing to take risks. I am not easily discouraged and do not care about others' evaluations. I stick to the path and direction I have chosen. I step forward in times of crisis. I value speed and efficiency. I am willing to accept challenges and eager for success.\n\n**Communication style:**\n\nI lead conversations in a practical way. I like to control the way things are done. I can directly grasp the essence of the problem. I speak concisely and dislike beating around the bush. I am not influenced or controlled by emotions.\n\n**As a friend:**\n\nI offer solutions to problems rather than dwelling on the past. I quickly provide advice and direction. I give suggestions straightforwardly.\n\n**Work and career:**\n\nI act decisively and efficiently. I can handle long-term high-intensity pressure. I have a strong goal orientation and am good at setting goals. I have a broad perspective and a sense of the big picture. I am good at delegating tasks. I persevere and facilitate activities. I focus on key points and execute them. I have a brisk style of doing things. I am a natural leader and have strong organizational skills. The stronger the competition, the more energetic I become, and the more resilient I am in the face of setbacks. I seek practical solutions. I am result-oriented and highly efficient. I am good at making quick decisions and handling all problems I encounter. I am highly responsible.",
    analysis_en: "# Yellow personality\n## [Personality Strengths]:\n\n**As an individual:**\n\nI will never give up until I reach my goal. I constantly set goals to drive myself forward. I view life as a competition. I act quickly and am full of energy. I have a strong will. I am confident, not emotional, and very energetic. I am straightforward, direct, and to the point. I have a strong drive for progress and always think ahead. I am independent. I have a strong desire to win. I am not afraid of power and am willing to take risks. I am not easily discouraged and do not care about others' evaluations. I stick to the path and direction I have chosen. I step forward in times of crisis. I value speed and efficiency. I am willing to accept challenges and eager for success.\n\n**Communication style:**\n\nI lead conversations in a practical way. I like to control the way things are done. I can directly grasp the essence of the problem. I speak concisely and dislike beating around the bush. I am not influenced or controlled by emotions.\n\n**As a friend:**\n\nI offer solutions to problems rather than dwelling on the past. I quickly provide advice and direction. I give suggestions straightforwardly.\n\n**Work and career:**\n\nI act decisively and efficiently. I can handle long-term high-intensity pressure. I have a strong goal orientation and am good at setting goals. I have a broad perspective and a sense of the big picture. I am good at delegating tasks. I persevere and facilitate activities. I focus on key points and execute them. I have a brisk style of doing things. I am a natural leader and have strong organizational skills. The stronger the competition, the more energetic I become, and the more resilient I am in the face of setbacks. I seek practical solutions. I am result-oriented and highly efficient. I am good at making quick decisions and handling all problems I encounter. I am highly responsible."
  },
  {
    code: "GREEN_PERSONALITY",
    name: "Green personality",
    name_en: "Green personality",
    description: "D+E数量最多",
    description_en: "D+E count is highest",
    analysis: "# Green personality\n##【Strengths】:\n\n**As an individual:**\n\nPrefers tranquility over activity, exuding a gentle and peaceful charm with a serene and pleasant demeanor. Possesses a kind nature and is generous in character. Strives for harmonious interpersonal relationships. Adheres to the principle of moderation, maintaining a stable and low-key presence. Remains composed and unflappable in the face of change. Content with what one has, maintaining a relaxed mindset. Seeks a simple and peaceful life. Has a laid-back attitude and can adapt to all environments and situations. Never loses temper, embodying gentleness, modesty, and peace. Practices the principle of \"letting go when you can.\" Prefers a simple and casual lifestyle. Communicates with a soft approach, achieving victory without conflict. Avoids confrontation and focuses on win-win situations. Calm, composed, and unhurried. Good at accepting others' opinions. An excellent listener with great patience. Skilled at making others feel at ease. Has a natural and effortless sense of humor. Relaxed and magnanimous, never in a hurry.\n\n**As a friend:**\n\nNever aggressive. Full of compassion and concern. Forgives others for their wrongs. Accepts people of all personalities. Kind by nature and tactful in dealing with others. Not strict in friendship. Considers others' needs and is willing to give. Interacting with them is easy and stress-free. A great confidant, encouraging friends to talk about themselves. Never tries to change others.\n\n**In work and career:**\n\nHas an exceptional ability to coordinate interpersonal relationships. Skilled at handling pressure with composure. Expert at resolving conflicts. Stays out of political struggles and has no enemies. Advances steadily to gain thinking space. Emphasizes human-oriented management. Advocates a work environment where all employees actively participate. Respects employees' independence, earning their loyalty and cohesion. Good at considering others. Team-oriented. Creates stability. Handles affairs with a natural and low-key approach.",
    analysis_en: "# Green personality\n##【Strengths】:\n\n**As an individual:**\n\nPrefers tranquility over activity, exuding a gentle and peaceful charm with a serene and pleasant demeanor. Possesses a kind nature and is generous in character. Strives for harmonious interpersonal relationships. Adheres to the principle of moderation, maintaining a stable and low-key presence. Remains composed and unflappable in the face of change. Content with what one has, maintaining a relaxed mindset. Seeks a simple and peaceful life. Has a laid-back attitude and can adapt to all environments and situations. Never loses temper, embodying gentleness, modesty, and peace. Practices the principle of \"letting go when you can.\" Prefers a simple and casual lifestyle. Communicates with a soft approach, achieving victory without conflict. Avoids confrontation and focuses on win-win situations. Calm, composed, and unhurried. Good at accepting others' opinions. An excellent listener with great patience. Skilled at making others feel at ease. Has a natural and effortless sense of humor. Relaxed and magnanimous, never in a hurry.\n\n**As a friend:**\n\nNever aggressive. Full of compassion and concern. Forgives others for their wrongs. Accepts people of all personalities. Kind by nature and tactful in dealing with others. Not strict in friendship. Considers others' needs and is willing to give. Interacting with them is easy and stress-free. A great confidant, encouraging friends to talk about themselves. Never tries to change others.\n\n**In work and career:**\n\nHas an exceptional ability to coordinate interpersonal relationships. Skilled at handling pressure with composure. Expert at resolving conflicts. Stays out of political struggles and has no enemies. Advances steadily to gain thinking space. Emphasizes human-oriented management. Advocates a work environment where all employees actively participate. Respects employees' independence, earning their loyalty and cohesion. Good at considering others. Team-oriented. Creates stability. Handles affairs with a natural and low-key approach."
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有四色性格测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'four_colors_en'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 四色性格测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating Four-colors Personality Analysis project...');
    
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
    
    console.log('🎉 Four-colors Personality Analysis setup completed!');
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
