console.log('🚀 Starting Professional Dyna-Metric Program creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 行为风格测试项目数据
const projectData = {
  project_id: 'pdp_test_en',
  name: '行为风格测试 Professional Dyna-Metric Program',
  name_en: 'Professional Dyna-Metric Program',
  image_url: 'assets/images/professional-dyna-metric-program.png',
  intro: 'PDP, or Professional Dyna-Metric Program, is a tool for behavioral style assessment. Behavioral style refers to the most proficient way of doing things in a person\'s natural endowment. It is a system used to measure an individual\'s behavioral traits, vitality, kinetic energy, stress, energy, and energy fluctuations. PDP classifies people into five types based on their innate traits, namely: Dominant, Expressive, Amiable, Analytical, and Integrative.',
  intro_en: 'PDP, or Professional Dyna-Metric Program, is a tool for behavioral style assessment. Behavioral style refers to the most proficient way of doing things in a person\'s natural endowment. It is a system used to measure an individual\'s behavioral traits, vitality, kinetic energy, stress, energy, and energy fluctuations. PDP classifies people into five types based on their innate traits, namely: Dominant, Expressive, Amiable, Analytical, and Integrative.',
  test_type: 'pdp_test',
  estimated_time: 10,
  question_count: 30,
  is_active: true
};

// 行为风格测试结果类型数据
const resultTypes = [
  {
    code: "TIGER_TYPE",
    name: "Tiger type (Dominance)",
    name_en: "Tiger type (Dominance)",
    description: "老虎分数最多",
    description_en: "Tiger score is highest",
    analysis: "# Tiger type (Dominance)\n\nThe \"tiger\" typically has a strong ambition, loves taking risks, and has a proactive and highly competitive personality. They prefer to take control of the overall situation and give orders, dislike maintaining the status quo, but have strong execution capabilities—once a goal is set, they will go all out to achieve it. Their downside is that they tend to be arbitrary in decision-making and unwilling to compromise, making it easier for them to have conflicts and frictions with others.\n\n**Personality Traits:**\n\nConfident, authoritative, decisive, highly competitive, ambitious, and fond of evaluation. They have strong ambition, love taking risks, are proactive, highly competitive, and tend to be confrontational.\n\n**Advantages:**\n\nThey excel at taking control of situations and making decisions decisively; those who work in this style achieve extraordinary results.\n\n**Disadvantages:**\n\nWhen under pressure, people of this type focus too much on completing tasks quickly, easily overlooking details, and may disregard the emotions of themselves and others. Due to their high demands and competitive nature, they may sometimes become workaholics.\n\n## Main Work Behaviors of the Tiger-Type Style:\n- Maintain direct eye contact during conversations;\n- Act with purpose and speed;\n- Speak quickly and persuasively;\n- Use straightforward and practical language;\n- Have calendars and key plan points displayed in the office.\n\nTiger-type leaders tend to make decisions with an authoritative style. Their subordinates must not only be highly obedient but also have the courage to take risks and overcome obstacles for them.\n\nTiger-type people are most suitable for pioneering and reform-oriented work. They are most likely to perform exceptionally well in eras of market development or environments that require the implementation of reforms.",
    analysis_en: "# Tiger type (Dominance)\n\nThe \"tiger\" typically has a strong ambition, loves taking risks, and has a proactive and highly competitive personality. They prefer to take control of the overall situation and give orders, dislike maintaining the status quo, but have strong execution capabilities—once a goal is set, they will go all out to achieve it. Their downside is that they tend to be arbitrary in decision-making and unwilling to compromise, making it easier for them to have conflicts and frictions with others.\n\n**Personality Traits:**\n\nConfident, authoritative, decisive, highly competitive, ambitious, and fond of evaluation. They have strong ambition, love taking risks, are proactive, highly competitive, and tend to be confrontational.\n\n**Advantages:**\n\nThey excel at taking control of situations and making decisions decisively; those who work in this style achieve extraordinary results.\n\n**Disadvantages:**\n\nWhen under pressure, people of this type focus too much on completing tasks quickly, easily overlooking details, and may disregard the emotions of themselves and others. Due to their high demands and competitive nature, they may sometimes become workaholics.\n\n## Main Work Behaviors of the Tiger-Type Style:\n- Maintain direct eye contact during conversations;\n- Act with purpose and speed;\n- Speak quickly and persuasively;\n- Use straightforward and practical language;\n- Have calendars and key plan points displayed in the office.\n\nTiger-type leaders tend to make decisions with an authoritative style. Their subordinates must not only be highly obedient but also have the courage to take risks and overcome obstacles for them.\n\nTiger-type people are most suitable for pioneering and reform-oriented work. They are most likely to perform exceptionally well in eras of market development or environments that require the implementation of reforms."
  },
  {
    code: "PEACOCK_TYPE",
    name: "Peacock type (Extroversion)",
    name_en: "Peacock type (Extroversion)",
    description: "孔雀分数最多",
    description_en: "Peacock score is highest",
    analysis: "# Peacock type (Extroversion)\n\nThe \"peacock\" is enthusiastic, sociable, eloquent, and values personal image. They excel at building interpersonal relationships, have great compassion, and are most suited for people-oriented work. Their downside is that they tend to be overly optimistic, often failing to consider details, and thus require highly professional technical experts to collaborate with them in terms of execution.\n\n**Personality Traits:**\n\nThey are very enthusiastic, optimistic, eloquent, sociable, graceful, and sincere. They are full of passion, enjoy making friends, have a fluent way with words, are inherently optimistic, and have a strong desire to perform.\n\n**Advantages:**\n\nPeople of this type are naturally lively. They can energize others, work efficiently, and are good at building alliances or fostering relationships to achieve goals. They are well-suited for jobs that require public performance, drawing attention, and an open demeanor.\n\n**Disadvantages:**\n\nDue to their jumping thinking pattern, they often fail to take details into account and lack dedication to seeing things through to completion.\n\n## Main Work Behaviors of the Peacock-Type Style:\n\nThey use quick hand gestures; have extremely expressive facial expressions; use persuasive language; and their workspaces are filled with various inspiring items.\n\nPeacocks possess strong expressive abilities and exceptional social skills. They have fluent speech and a warm, humorous demeanor, making it easy for them to form good relationships and build a reputation in groups or communities. Peacock-type leaders are naturally optimistic and amiable, with sincere compassion and the ability to inspire others. They perform best in work environments that emphasize teamwork.\n\nIn any group, peacock-type leaders are the most popular and well-liked, and they are the ones best able to rally the group as a leader.",
    analysis_en: "# Peacock type (Extroversion)\n\nThe \"peacock\" is enthusiastic, sociable, eloquent, and values personal image. They excel at building interpersonal relationships, have great compassion, and are most suited for people-oriented work. Their downside is that they tend to be overly optimistic, often failing to consider details, and thus require highly professional technical experts to collaborate with them in terms of execution.\n\n**Personality Traits:**\n\nThey are very enthusiastic, optimistic, eloquent, sociable, graceful, and sincere. They are full of passion, enjoy making friends, have a fluent way with words, are inherently optimistic, and have a strong desire to perform.\n\n**Advantages:**\n\nPeople of this type are naturally lively. They can energize others, work efficiently, and are good at building alliances or fostering relationships to achieve goals. They are well-suited for jobs that require public performance, drawing attention, and an open demeanor.\n\n**Disadvantages:**\n\nDue to their jumping thinking pattern, they often fail to take details into account and lack dedication to seeing things through to completion.\n\n## Main Work Behaviors of the Peacock-Type Style:\n\nThey use quick hand gestures; have extremely expressive facial expressions; use persuasive language; and their workspaces are filled with various inspiring items.\n\nPeacocks possess strong expressive abilities and exceptional social skills. They have fluent speech and a warm, humorous demeanor, making it easy for them to form good relationships and build a reputation in groups or communities. Peacock-type leaders are naturally optimistic and amiable, with sincere compassion and the ability to inspire others. They perform best in work environments that emphasize teamwork.\n\nIn any group, peacock-type leaders are the most popular and well-liked, and they are the ones best able to rally the group as a leader."
  },
  {
    code: "KOALA_TYPE",
    name: "Koala type (Pace/Patience)",
    name_en: "Koala type (Pace/Patience)",
    description: "考拉分数最多",
    description_en: "Koala score is highest",
    analysis: "# Koala type (Pace/Patience)\n\nThe \"koala\" is someone who acts steadily and does not exaggerate, emphasizing practicality. They have a calm temperament, dislike causing trouble for others, and refrain from stirring up trouble. Kind and gentle, they are often mistakenly seen by others as lazy and unmotivated. However, once they are determined to commit themselves, they are definitely the best example of the saying \"distance tests a horse's stamina\" (meaning long-term efforts reveal true capability).\n\n**Personality Traits:**\n\nThey are very stable, sincere and honest, gentle and regular, and avoid conflicts. They act steadily, emphasize practicality, possess extraordinary patience, and are kind and gentle.\n\n**Advantages:**\n\nThey are highly sensitive to the feelings of others, which allows them to get along well with people in a group environment.\n\n**Disadvantages:**\n\nIt is difficult for them to stick to their own views and make decisions quickly. Generally speaking, they do not like to face situations where their opinions conflict with colleagues, and they are unwilling to deal with disputes.\n\n## Main Work Behaviors of the Koala-Type Style:\n\nThey have an amiable facial expression; speak slowly with a soft voice; use approving and encouraging language; and display photos of their family in the office.\n\nKoalas have a high level of patience. They are sincere, easy-going, and act calmly and composedly. They pursue a regular life but also take things as they come, and can remain calm and unperturbed in the face of difficulties.\n\nKoala-type leaders are suitable for management work that stabilizes the internal environment. They can give full play to their strengths in fields requiring professional and sophisticated skills, or in workplace environments with a harmonious atmosphere and no tight schedules.",
    analysis_en: "# Koala type (Pace/Patience)\n\nThe \"koala\" is someone who acts steadily and does not exaggerate, emphasizing practicality. They have a calm temperament, dislike causing trouble for others, and refrain from stirring up trouble. Kind and gentle, they are often mistakenly seen by others as lazy and unmotivated. However, once they are determined to commit themselves, they are definitely the best example of the saying \"distance tests a horse's stamina\" (meaning long-term efforts reveal true capability).\n\n**Personality Traits:**\n\nThey are very stable, sincere and honest, gentle and regular, and avoid conflicts. They act steadily, emphasize practicality, possess extraordinary patience, and are kind and gentle.\n\n**Advantages:**\n\nThey are highly sensitive to the feelings of others, which allows them to get along well with people in a group environment.\n\n**Disadvantages:**\n\nIt is difficult for them to stick to their own views and make decisions quickly. Generally speaking, they do not like to face situations where their opinions conflict with colleagues, and they are unwilling to deal with disputes.\n\n## Main Work Behaviors of the Koala-Type Style:\n\nThey have an amiable facial expression; speak slowly with a soft voice; use approving and encouraging language; and display photos of their family in the office.\n\nKoalas have a high level of patience. They are sincere, easy-going, and act calmly and composedly. They pursue a regular life but also take things as they come, and can remain calm and unperturbed in the face of difficulties.\n\nKoala-type leaders are suitable for management work that stabilizes the internal environment. They can give full play to their strengths in fields requiring professional and sophisticated skills, or in workplace environments with a harmonious atmosphere and no tight schedules."
  },
  {
    code: "OWL_TYPE",
    name: "Owl type (Conformity)",
    name_en: "Owl type (Conformity)",
    description: "猫头鹰分数最多",
    description_en: "Owl score is highest",
    analysis: "# Owl type (Conformity)\n\nThe \"owl\" is traditional and conservative, with strong analytical skills and high precision, making them the best quality assurance personnel. They like to systemize details, have a reserved and implicit personality, adhere to proper limits and are loyal to their duties, but may be seen as \"nitpicky\". \"Owls\" are skilled at clearly analyzing reasons to convince others and handle things in an objective and reasonable manner, though sometimes they may get stuck in a narrow-minded view and find it hard to get out.\n\n**Personality Traits:**\n\nThey are very traditional, detail-oriented, well-organized, highly responsible, and value discipline. They are conservative, have strong analytical abilities and high precision, like to systemize details, and have a reserved and implicit personality.\n\n**Advantages:**\n\nThey are innately inclined to find out the truth of things, as they have the patience to carefully examine all details and come up with logical solutions.\n\n**Disadvantages:**\n\nThey prioritize facts and precision over emotions, which may make them seem emotionally cold. Under pressure, they may over-analyze things sometimes to avoid making conclusions.\n\n## Main Work Behaviors of the Owl-Type Style:\n\nThey rarely show facial expressions; their movements are slow; they use precise language and pay attention to specific details; their offices are decorated with charts, statistical figures, etc.\n\nOwls possess a high level of precision. In their work style, they prioritize rules over emotions, take rules as the criterion for everything, and regard this as their guiding ideology. They are introverted, good at using numbers or rules as tools for expression, but not very skilled at using language to communicate emotions or give instructions to colleagues and subordinates.\n\nOrganizations with stable structures and sound systems are best off hiring owl-type people as leaders at all levels. This is because owl-type leaders prefer to work in an environment with a secure framework and can perform at their best in such settings.",
    analysis_en: "# Owl type (Conformity)\n\nThe \"owl\" is traditional and conservative, with strong analytical skills and high precision, making them the best quality assurance personnel. They like to systemize details, have a reserved and implicit personality, adhere to proper limits and are loyal to their duties, but may be seen as \"nitpicky\". \"Owls\" are skilled at clearly analyzing reasons to convince others and handle things in an objective and reasonable manner, though sometimes they may get stuck in a narrow-minded view and find it hard to get out.\n\n**Personality Traits:**\n\nThey are very traditional, detail-oriented, well-organized, highly responsible, and value discipline. They are conservative, have strong analytical abilities and high precision, like to systemize details, and have a reserved and implicit personality.\n\n**Advantages:**\n\nThey are innately inclined to find out the truth of things, as they have the patience to carefully examine all details and come up with logical solutions.\n\n**Disadvantages:**\n\nThey prioritize facts and precision over emotions, which may make them seem emotionally cold. Under pressure, they may over-analyze things sometimes to avoid making conclusions.\n\n## Main Work Behaviors of the Owl-Type Style:\n\nThey rarely show facial expressions; their movements are slow; they use precise language and pay attention to specific details; their offices are decorated with charts, statistical figures, etc.\n\nOwls possess a high level of precision. In their work style, they prioritize rules over emotions, take rules as the criterion for everything, and regard this as their guiding ideology. They are introverted, good at using numbers or rules as tools for expression, but not very skilled at using language to communicate emotions or give instructions to colleagues and subordinates.\n\nOrganizations with stable structures and sound systems are best off hiring owl-type people as leaders at all levels. This is because owl-type leaders prefer to work in an environment with a secure framework and can perform at their best in such settings."
  },
  {
    code: "CHAMELEON_TYPE",
    name: "Chameleon type (1/2 Sigma)",
    name_en: "Chameleon type (1/2 Sigma)",
    description: "变色龙分数最多",
    description_en: "Chameleon score is highest",
    analysis: "# Chameleon type (1/2 Sigma)\n\nThe \"chameleon\" is moderate and not extreme, not persistent in everything, has extremely strong resilience, is good at communication and is a natural negotiator. They can fully integrate into various new environments and cultures and have good adaptability. In the eyes of others, they may seem \"lacking in personality\", so \"having no principles is the highest principle\", and they know how to judge everything according to the situation and occasion.\n\n**Advantages of the chameleon-type working style:**\n\nThey are good at adjusting their roles in the work to adapt to the environment and have excellent communication skills.\n\n**Disadvantages:**\n\nFrom the perspective of others, the chameleon group may seem to have relatively little personality and principles.\n\n## Main behaviors of the chameleon-type working style:\n\nThey combine the characteristics of the tiger, peacock, koala, and owl. They seemingly have no outstanding personality, but are good at integrating internal and external resources. Having no strong personal ideology is their value in handling affairs.\n\nChameleon-type leaders are a combination of the four characteristics of the dominant type, expressive type, patient type, and precise type. They have no outstanding personality, are good at integrating internal and external information, are inclusive, do not make enemies with others, and deal with things in a moderate way. They are very tactful in handling affairs, have extremely strong flexibility, leave leeway in everything they do, and will never take extreme measures.\n\nChameleon-type leaders not only have no outstanding personality, but also have no strong personal ideology towards things. They seek neutrality in everything and tend to stand in a position of having no stance. Therefore, in a conflicting environment, they are masters at wandering and compromising.",
    analysis_en: "# Chameleon type (1/2 Sigma)\n\nThe \"chameleon\" is moderate and not extreme, not persistent in everything, has extremely strong resilience, is good at communication and is a natural negotiator. They can fully integrate into various new environments and cultures and have good adaptability. In the eyes of others, they may seem \"lacking in personality\", so \"having no principles is the highest principle\", and they know how to judge everything according to the situation and occasion.\n\n**Advantages of the chameleon-type working style:**\n\nThey are good at adjusting their roles in the work to adapt to the environment and have excellent communication skills.\n\n**Disadvantages:**\n\nFrom the perspective of others, the chameleon group may seem to have relatively little personality and principles.\n\n## Main behaviors of the chameleon-type working style:\n\nThey combine the characteristics of the tiger, peacock, koala, and owl. They seemingly have no outstanding personality, but are good at integrating internal and external resources. Having no strong personal ideology is their value in handling affairs.\n\nChameleon-type leaders are a combination of the four characteristics of the dominant type, expressive type, patient type, and precise type. They have no outstanding personality, are good at integrating internal and external information, are inclusive, do not make enemies with others, and deal with things in a moderate way. They are very tactful in handling affairs, have extremely strong flexibility, leave leeway in everything they do, and will never take extreme measures.\n\nChameleon-type leaders not only have no outstanding personality, but also have no strong personal ideology towards things. They seek neutrality in everything and tend to stand in a position of having no stance. Therefore, in a conflicting environment, they are masters at wandering and compromising."
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有行为风格测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'pdp_test_en'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 行为风格测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating Professional Dyna-Metric Program project...');
    
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
    
    console.log('🎉 Professional Dyna-Metric Program setup completed!');
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
