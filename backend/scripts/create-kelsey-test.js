console.log('🚀 Starting Kelsey Temperament Type Test creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 凯尔西气质类型测试项目数据
const projectData = {
  project_id: 'kelsey_test_en',
  name: 'Kelsey Temperament Type Test',
  name_en: 'Kelsey Temperament Type Test',
  image_url: 'assets/images/kelsey-temperament-type-test.png',
  intro: 'The Kiersey Temperament Sorter is a widely utilized psychological assessment tool designed to help individuals understand their inherent temperament traits and behavioral tendencies. Grounded in the Kiersey Temperament Theory, this assessment categorizes human temperaments into four distinct types: Choleric, Sanguine, Melancholic, and Phlegmatic.',
  intro_en: 'The Kiersey Temperament Sorter is a widely utilized psychological assessment tool designed to help individuals understand their inherent temperament traits and behavioral tendencies. Grounded in the Kiersey Temperament Theory, this assessment categorizes human temperaments into four distinct types: Choleric, Sanguine, Melancholic, and Phlegmatic.',
  test_type: 'kelsey_test',
  estimated_time: 12,
  question_count: 70,
  is_active: true
};

// 凯尔西气质类型测试结果类型数据（16种MBTI类型）
const resultTypes = [
  {
    code: "ESTP",
    name: "Entrepreneur",
    name_en: "Entrepreneur",
    description: "ESTP - 企业家型",
    description_en: "ESTP - Entrepreneur",
    analysis: "# Entrepreneur\n\nEntrepreneurs can launch a business, attract others to it, and convince them to believe and work in the way they envision, moving in the direction they desire. Their adaptability far exceeds their other abilities, and their tenacious character also makes them well-suited for the role of a persuasive operator.\n\n**Suitable jobs:**\n\nBusinessman, salesperson, arbitrator, negotiator, defense lawyer, industrialist, real estate developer, entertainment producer.\n\n**Suitable partners:**\n\nProtectors\n\nConquering the introverted, conservative, and friendly protectors and persuading them to temporarily abandon their caution and overthinking, and engage in more adventurous activities is an extremely interesting thing for the tenacious and extroverted entrepreneurs. They are born adventurers and doers.",
    analysis_en: "# Entrepreneur\n\nEntrepreneurs can launch a business, attract others to it, and convince them to believe and work in the way they envision, moving in the direction they desire. Their adaptability far exceeds their other abilities, and their tenacious character also makes them well-suited for the role of a persuasive operator.\n\n**Suitable jobs:**\n\nBusinessman, salesperson, arbitrator, negotiator, defense lawyer, industrialist, real estate developer, entertainment producer.\n\n**Suitable partners:**\n\nProtectors\n\nConquering the introverted, conservative, and friendly protectors and persuading them to temporarily abandon their caution and overthinking, and engage in more adventurous activities is an extremely interesting thing for the tenacious and extroverted entrepreneurs. They are born adventurers and doers."
  },
  {
    code: "ISTP",
    name: "Artisan",
    name_en: "Artisan",
    description: "ISTP - 工匠型",
    description_en: "ISTP - Artisan",
    analysis: "# Artisan\n\nThis type of people accounts for about 10% of the population. They are naturally good at operating tools and equipment and have an almost instinctive sensitivity to machinery. They have been attracted by tools since childhood and are good at learning through practice, but often lack interest in abstract theories or language expression.\n\n**Suitable occupations:**\n\nBusinessman, craftsman, mechanic, jeweler, weaver, furniture maker, driver, surgeon, artist, athlete, musician, weapon artist.\n\n**Suitable partner:**\n\nProvider\n\nThey can be regarded as a happy couple. Silent and resolute, the craftsman is quiet and skilled with tools, longing for the freedom of adventure. In family and society, they seem to need the care and gentle comfort of others.",
    analysis_en: "# Artisan\n\nThis type of people accounts for about 10% of the population. They are naturally good at operating tools and equipment and have an almost instinctive sensitivity to machinery. They have been attracted by tools since childhood and are good at learning through practice, but often lack interest in abstract theories or language expression.\n\n**Suitable occupations:**\n\nBusinessman, craftsman, mechanic, jeweler, weaver, furniture maker, driver, surgeon, artist, athlete, musician, weapon artist.\n\n**Suitable partner:**\n\nProvider\n\nThey can be regarded as a happy couple. Silent and resolute, the craftsman is quiet and skilled with tools, longing for the freedom of adventure. In family and society, they seem to need the care and gentle comfort of others."
  },
  {
    code: "ESFP",
    name: "Performer",
    name_en: "Performer",
    description: "ESFP - 表演者型",
    description_en: "ESFP - Performer",
    analysis: "# Performer\n\nThe performer personality type accounts for approximately 10% of the total population. They are naturally skilled at expressing and presenting themselves, and are adept at bringing joy to others through humor, drama, and infectious enthusiasm. For them, the world is like a stage, and they are always the center of attention under the spotlight.\n\n**Suitable jobs:**\n\nSalesperson, primary school teacher\n\n**Suitable partner:**\n\nInspector\n\nThe two may get along particularly well. The performer is expressive, interesting, energetic, and eager for social gatherings, while the inspector is quiet, resolute, reliable, prepared, and trustworthy.",
    analysis_en: "# Performer\n\nThe performer personality type accounts for approximately 10% of the total population. They are naturally skilled at expressing and presenting themselves, and are adept at bringing joy to others through humor, drama, and infectious enthusiasm. For them, the world is like a stage, and they are always the center of attention under the spotlight.\n\n**Suitable jobs:**\n\nSalesperson, primary school teacher\n\n**Suitable partner:**\n\nInspector\n\nThe two may get along particularly well. The performer is expressive, interesting, energetic, and eager for social gatherings, while the inspector is quiet, resolute, reliable, prepared, and trustworthy."
  },
  {
    code: "ISFP",
    name: "Creator",
    name_en: "Creator",
    description: "ISFP - 创造者型",
    description_en: "ISFP - Creator",
    analysis: "# Creator\n\nCreators make up about 10% of the population. They are naturally good at expressing themselves through actions rather than words and are skilled at integrating various elements to complete artistic or practical creations. They have highly acute senses, which enable them to delicately distinguish colors, sounds, textures, smells and tastes.\n\n**Suitable occupations:**\n\nPainter, sculptor, choreographer, film director, songwriter, playwright, poet, novelist, chef, fashion designer, nurse, art teacher, veterinarian, gardener.\n\n**Suitable partner:**\n\nSupervisor\n\nThe two are a perfect match. The introverted and friendly creator, who enjoys being close to nature and indulging in artistic creation, is the most gentle and worldly type of person.",
    analysis_en: "# Creator\n\nCreators make up about 10% of the population. They are naturally good at expressing themselves through actions rather than words and are skilled at integrating various elements to complete artistic or practical creations. They have highly acute senses, which enable them to delicately distinguish colors, sounds, textures, smells and tastes.\n\n**Suitable occupations:**\n\nPainter, sculptor, choreographer, film director, songwriter, playwright, poet, novelist, chef, fashion designer, nurse, art teacher, veterinarian, gardener.\n\n**Suitable partner:**\n\nSupervisor\n\nThe two are a perfect match. The introverted and friendly creator, who enjoys being close to nature and indulging in artistic creation, is the most gentle and worldly type of person."
  },
  {
    code: "ESTJ",
    name: "Supervisor",
    name_en: "Supervisor",
    description: "ESTJ - 监督者型",
    description_en: "ESTJ - Supervisor",
    analysis: "# Supervisor\n\nSupervisors make up about 10% of the population. They are practical managers who value order, rules and responsibility. They respect authority and hierarchy, and firmly believe that clear systems and procedures are the foundation for maintaining efficiency and stability.\n\n**Suitable jobs:**\n\nCommunity organizations, law, politics, business.\n\n**Suitable partners:**\n\nCreators\n\nThey make good partners. Supervisors enjoy and feel fulfilled when they manage power institutions to maintain stability and orderly development in accordance with norms.",
    analysis_en: "# Supervisor\n\nSupervisors make up about 10% of the population. They are practical managers who value order, rules and responsibility. They respect authority and hierarchy, and firmly believe that clear systems and procedures are the foundation for maintaining efficiency and stability.\n\n**Suitable jobs:**\n\nCommunity organizations, law, politics, business.\n\n**Suitable partners:**\n\nCreators\n\nThey make good partners. Supervisors enjoy and feel fulfilled when they manage power institutions to maintain stability and orderly development in accordance with norms."
  },
  {
    code: "ISTJ",
    name: "Inspector",
    name_en: "Inspector",
    description: "ISTJ - 检查者型",
    description_en: "ISTJ - Inspector",
    analysis: "# Inspector\n\nInspectors are the steadfast guardians of systems and norms. With meticulous and cautious attitudes, they focus on verification work, dedicated to ensuring the accuracy and compliance of processes. They are adept at quietly identifying and correcting errors behind the scenes.\n\n**Suitable Jobs:**\n\nInsurance statistician, accountant, broker, financial representative, financial worker, dentist, optometrist, legal clerk, legal researcher, secondary school teacher.\n\n**Suitable Partner:**\n\nPerformer\n\nThe most compatible. The reclusive and resolute Inspector, a trustworthy protector of orthodoxy, hopes to instill a sense of responsibility in the Performer through their own efforts.",
    analysis_en: "# Inspector\n\nInspectors are the steadfast guardians of systems and norms. With meticulous and cautious attitudes, they focus on verification work, dedicated to ensuring the accuracy and compliance of processes. They are adept at quietly identifying and correcting errors behind the scenes.\n\n**Suitable Jobs:**\n\nInsurance statistician, accountant, broker, financial representative, financial worker, dentist, optometrist, legal clerk, legal researcher, secondary school teacher.\n\n**Suitable Partner:**\n\nPerformer\n\nThe most compatible. The reclusive and resolute Inspector, a trustworthy protector of orthodoxy, hopes to instill a sense of responsibility in the Performer through their own efforts."
  },
  {
    code: "ESFJ",
    name: "Provider",
    name_en: "Provider",
    description: "ESFJ - 提供者型",
    description_en: "ESFJ - Provider",
    analysis: "# Provider\n\nProviders make up about 10% of the total population and are typical social service providers and material coordinators. They are naturally kind, outgoing, and passionate about caring for others. They voluntarily take on the responsibility of meeting the needs of the group and maintaining traditions and order.\n\n**Suitable jobs:**\n\nSalesperson, coach, teacher, personal secretary, office receptionist, etc.\n\n**Suitable partner:**\n\nArtisan\n\nThey may be the happiest couple. The Provider is kind-hearted, good at expressing themselves, and tends to care for and comfort others.",
    analysis_en: "# Provider\n\nProviders make up about 10% of the total population and are typical social service providers and material coordinators. They are naturally kind, outgoing, and passionate about caring for others. They voluntarily take on the responsibility of meeting the needs of the group and maintaining traditions and order.\n\n**Suitable jobs:**\n\nSalesperson, coach, teacher, personal secretary, office receptionist, etc.\n\n**Suitable partner:**\n\nArtisan\n\nThey may be the happiest couple. The Provider is kind-hearted, good at expressing themselves, and tends to care for and comfort others."
  },
  {
    code: "ISFJ",
    name: "Protector",
    name_en: "Protector",
    description: "ISFJ - 保护者型",
    description_en: "ISFJ - Protector",
    analysis: "# Protector\n\nProtectors make up about 10% of the population. They are caring personalities who quietly contribute and prioritize the safety and well-being of others. They are naturally gentle and cautious, expressing their concern through practical actions rather than words.\n\n**Suitable jobs:**\n\nGuardian, personal secretary, librarian, middle manager, personal doctor, nurse, insurance agent.\n\n**Suitable partner:**\n\nEntrepreneur\n\nThey tend to feel very compatible with each other. Entrepreneurs are outgoing and strong, often enjoying the peak of their careers; while the reclusive and friendly protector provides them with a quiet refuge.",
    analysis_en: "# Protector\n\nProtectors make up about 10% of the population. They are caring personalities who quietly contribute and prioritize the safety and well-being of others. They are naturally gentle and cautious, expressing their concern through practical actions rather than words.\n\n**Suitable jobs:**\n\nGuardian, personal secretary, librarian, middle manager, personal doctor, nurse, insurance agent.\n\n**Suitable partner:**\n\nEntrepreneur\n\nThey tend to feel very compatible with each other. Entrepreneurs are outgoing and strong, often enjoying the peak of their careers; while the reclusive and friendly protector provides them with a quiet refuge."
  },
  {
    code: "ENFJ",
    name: "Leader",
    name_en: "Leader",
    description: "ENFJ - 领导者型",
    description_en: "ENFJ - Leader",
    analysis: "# Leader\n\nInstructors make up approximately 2% of the total population. They are idealists born with charisma and a passion for education. They are adept at perceiving the potential in others and inspire those around them to grow with a high degree of empathy and optimism.\n\n**Suitable Careers:**\n\nClinical medicine, educator.\n\n**Suitable Partner:**\n\nArchitect\n\nIn every respect, they are a perfect match. The educator, who is good at expressing and organizing, is a natural educator and growth promoter.",
    analysis_en: "# Leader\n\nInstructors make up approximately 2% of the total population. They are idealists born with charisma and a passion for education. They are adept at perceiving the potential in others and inspire those around them to grow with a high degree of empathy and optimism.\n\n**Suitable Careers:**\n\nClinical medicine, educator.\n\n**Suitable Partner:**\n\nArchitect\n\nIn every respect, they are a perfect match. The educator, who is good at expressing and organizing, is a natural educator and growth promoter."
  },
  {
    code: "INFJ",
    name: "Adviser",
    name_en: "Adviser",
    description: "INFJ - 顾问型",
    description_en: "INFJ - Adviser",
    analysis: "# Adviser\n\nAdvisors make up about 1% of the total population. They are introverted and profound idealists, dedicated to helping others realize their personal potential and inner harmony. They possess an extremely strong ability to empathize and a sharp intuition.\n\n**Suitable Jobs:**\n\nMedical consulting services, clinical medicine.\n\n**Suitable Partners:**\n\nInventors. They often make a perfect couple. The advisor is reserved, strategic, complex, and mysterious, often troubled by introspective and ethical issues.",
    analysis_en: "# Adviser\n\nAdvisors make up about 1% of the total population. They are introverted and profound idealists, dedicated to helping others realize their personal potential and inner harmony. They possess an extremely strong ability to empathize and a sharp intuition.\n\n**Suitable Jobs:**\n\nMedical consulting services, clinical medicine.\n\n**Suitable Partners:**\n\nInventors. They often make a perfect couple. The advisor is reserved, strategic, complex, and mysterious, often troubled by introspective and ethical issues."
  },
  {
    code: "ENFP",
    name: "Striver",
    name_en: "Striver",
    description: "ENFP - 奋斗者型",
    description_en: "ENFP - Striver",
    analysis: "# Striver\n\nStrivers make up about 2% to 3% of the population and are passionate and inspiring advocates of ideals. They are adept at perceiving the underlying meaning of things, eager to experience and convey profound human truths, and inspire others with strong beliefs.\n\n**Suitable occupations:**\n\nTeacher, journalist, orator, novelist, screenwriter, and playwright.\n\n**Suitable partner:**\n\nThe Director. They should be a perfect match. The Striver is passionate, insightful, and enthusiastic, and straightforward.",
    analysis_en: "# Striver\n\nStrivers make up about 2% to 3% of the population and are passionate and inspiring advocates of ideals. They are adept at perceiving the underlying meaning of things, eager to experience and convey profound human truths, and inspire others with strong beliefs.\n\n**Suitable occupations:**\n\nTeacher, journalist, orator, novelist, screenwriter, and playwright.\n\n**Suitable partner:**\n\nThe Director. They should be a perfect match. The Striver is passionate, insightful, and enthusiastic, and straightforward."
  },
  {
    code: "INFP",
    name: "Conciliator",
    name_en: "Conciliator",
    description: "INFP - 调解者型",
    description_en: "INFP - Conciliator",
    analysis: "# Conciliator\n\nThe Peacemakers make up about 1% of the total population. They are deep and morally idealistic guardians of peace. They appear gentle and serene on the outside, but inside they are filled with a profound concern for humanity and ethics.\n\n**Suitable jobs:**\n\nPublicity work, social work, library research, early childhood counseling services, university education in the humanities.\n\n**Suitable partner:**\n\nField Marshal\n\nThey are likely to gain great satisfaction from marriage. As Peacemakers, they are reserved, enjoy exploration, and find it more difficult than other types to choose a partner.",
    analysis_en: "# Conciliator\n\nThe Peacemakers make up about 1% of the total population. They are deep and morally idealistic guardians of peace. They appear gentle and serene on the outside, but inside they are filled with a profound concern for humanity and ethics.\n\n**Suitable jobs:**\n\nPublicity work, social work, library research, early childhood counseling services, university education in the humanities.\n\n**Suitable partner:**\n\nField Marshal\n\nThey are likely to gain great satisfaction from marriage. As Peacemakers, they are reserved, enjoy exploration, and find it more difficult than other types to choose a partner."
  },
  {
    code: "ENTJ",
    name: "Field Marshal",
    name_en: "Field Marshal",
    description: "ENTJ - 元帅型",
    description_en: "ENTJ - Field Marshal",
    analysis: "# Field Marshal\n\nThey are called leaders among leaders, coordinating personnel and materials in the process of achieving a clear goal. They tend to take on the role of an instructor and are naturally decisive and good at planning, which makes them more inclined to take on the role of a field marshal.\n\n**Suitable jobs:**\n\nManager\n\n**Suitable Partner: The Peacemaker**\n\nLife together seems very harmonious. The Marshal, a natural mobilizer in every aspect, and the Peacemaker, who enjoys seclusion and exploration, become leaders of the team when seeking ideals.",
    analysis_en: "# Field Marshal\n\nThey are called leaders among leaders, coordinating personnel and materials in the process of achieving a clear goal. They tend to take on the role of an instructor and are naturally decisive and good at planning, which makes them more inclined to take on the role of a field marshal.\n\n**Suitable jobs:**\n\nManager\n\n**Suitable Partner: The Peacemaker**\n\nLife together seems very harmonious. The Marshal, a natural mobilizer in every aspect, and the Peacemaker, who enjoys seclusion and exploration, become leaders of the team when seeking ideals."
  },
  {
    code: "INTJ",
    name: "Strategist",
    name_en: "Strategist",
    description: "INTJ - 战略家型",
    description_en: "INTJ - Strategist",
    analysis: "# Strategist\n\nPlanners make up about 1% of the population and are the most strategic and systemically-minded among the rational types. They are adept at formulating grand yet detailed plans, viewing reality as a chessboard that can be analyzed and optimized.\n\n**Suitable Jobs:**\n\nManagerial positions in the business field.\n\n**Suitable Partner:**\n\nStrivers\n\nTheoretically speaking, they are the most compatible pair. Planners are introverted and good at strategizing, and they are more planned than anyone else when choosing a partner.",
    analysis_en: "# Strategist\n\nPlanners make up about 1% of the population and are the most strategic and systemically-minded among the rational types. They are adept at formulating grand yet detailed plans, viewing reality as a chessboard that can be analyzed and optimized.\n\n**Suitable Jobs:**\n\nManagerial positions in the business field.\n\n**Suitable Partner:**\n\nStrivers\n\nTheoretically speaking, they are the most compatible pair. Planners are introverted and good at strategizing, and they are more planned than anyone else when choosing a partner."
  },
  {
    code: "ENTP",
    name: "Inventor",
    name_en: "Inventor",
    description: "ENTP - 发明家型",
    description_en: "ENTP - Inventor",
    analysis: "# Inventor\n\nInventors make up about 2% of the total population. They are extroverted builders full of curiosity and the spirit of exploration. They are good at functional analysis and are passionate about solving complex problems through invention and system improvement.\n\n**Suitable Jobs:**\n\nAny job\n\n**Suitable Partner:**\n\nAdviser\n\nTogether, they can easily feel a great sense of satisfaction. Inventors, who love to improve existing tools and work, are bound to break the authority and cause dissatisfaction among the management.",
    analysis_en: "# Inventor\n\nInventors make up about 2% of the total population. They are extroverted builders full of curiosity and the spirit of exploration. They are good at functional analysis and are passionate about solving complex problems through invention and system improvement.\n\n**Suitable Jobs:**\n\nAny job\n\n**Suitable Partner:**\n\nAdviser\n\nTogether, they can easily feel a great sense of satisfaction. Inventors, who love to improve existing tools and work, are bound to break the authority and cause dissatisfaction among the management."
  },
  {
    code: "INTP",
    name: "Architect",
    name_en: "Architect",
    description: "INTP - 建筑师型",
    description_en: "INTP - Architect",
    analysis: "# Architect\n\nArchitects make up about 1% of the population and are the most strategic and system-oriented among the rational types. Their core abilities lie in building models and designing structures. They view the world as raw material that can be analyzed and reshaped.\n\n**Suitable occupations:**\n\nLogician, mathematician, technical expert, scientist, teacher.\n\n**Suitable partner:**\n\nInstructor\n\nOften highly adaptable. Architects, introverted, exploratory, and easily lost in their abstract world, may feel disappointed if they cannot find a partner who can listen to them and appreciate them.",
    analysis_en: "# Architect\n\nArchitects make up about 1% of the population and are the most strategic and system-oriented among the rational types. Their core abilities lie in building models and designing structures. They view the world as raw material that can be analyzed and reshaped.\n\n**Suitable occupations:**\n\nLogician, mathematician, technical expert, scientist, teacher.\n\n**Suitable partner:**\n\nInstructor\n\nOften highly adaptable. Architects, introverted, exploratory, and easily lost in their abstract world, may feel disappointed if they cannot find a partner who can listen to them and appreciate them."
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有凯尔西气质类型测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'kelsey_test_en'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 凯尔西气质类型测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating Kelsey Temperament Type Test project...');
    
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
    
    console.log('🎉 Kelsey Temperament Type Test setup completed!');
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
