console.log('🚀 Starting Enneagram personality test creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 九型人格测试项目数据
const projectData = {
  project_id: 'enneagram_en',
  name: 'Enneagram personality test',
  name_en: 'Enneagram personality test',
  image_url: 'assets/images/enneagram-personality-test.png',
  intro: 'The Enneagram, also known as the Enneatypes or the Nine Personality Types, is a system that has been highly favored by MBA students at renowned international universities such as Stanford in recent years and has become one of the most popular courses. Over the past decade or so, it has gained widespread popularity in academic and business circles in Europe and America.',
  intro_en: 'The Enneagram, also known as the Enneatypes or the Nine Personality Types, is a system that has been highly favored by MBA students at renowned international universities such as Stanford in recent years and has become one of the most popular courses. Over the past decade or so, it has gained widespread popularity in academic and business circles in Europe and America.',
  test_type: 'enneagram',
  estimated_time: 30,
  question_count: 180,
  is_active: true
};

// 九型人格结果类型数据
const resultTypes = [
  {
    code: "TYPE_1",
    name: "The Perfectionist",
    name_en: "The Perfectionist",
    description: "1号人格",
    description_en: "Type 1",
    analysis: "## The Perfectionist\n\n**[Desire Trait]:** Pursuing continuous progress\n\n**[Basic Thought]:** If I'm not perfect, no one will love me.\n\n**[Main Characteristics]:** \n\nPrincipled, not easy to compromise, often says \"should\" and \"shouldn't\", black and white thinking, high standards for oneself and others, pursuit of perfection, constant improvement, weak emotional world; hopes to do everything perfectly and wishes for personal or global progress. Always reflects on one's own mistakes and corrects others' as well.\n\n**[Main Traits]:** \n\nPatient, perseverant, keeps promises, consistent, family-oriented, law-abiding, influential leader, likes to control, straightforward.\n\n**[Suitable Careers]:** \n\nSuitable for all fields that require adherence to principles and fairness, such as judges, doctors, quality inspection, disciplinary inspection, safety inspection, accounting, etc.",
    analysis_en: "## The Perfectionist\n\n**[Desire Trait]:** Pursuing continuous progress\n\n**[Basic Thought]:** If I'm not perfect, no one will love me.\n\n**[Main Characteristics]:** \n\nPrincipled, not easy to compromise, often says \"should\" and \"shouldn't\", black and white thinking, high standards for oneself and others, pursuit of perfection, constant improvement, weak emotional world; hopes to do everything perfectly and wishes for personal or global progress. Always reflects on one's own mistakes and corrects others' as well.\n\n**[Main Traits]:** \n\nPatient, perseverant, keeps promises, consistent, family-oriented, law-abiding, influential leader, likes to control, straightforward.\n\n**[Suitable Careers]:** \n\nSuitable for all fields that require adherence to principles and fairness, such as judges, doctors, quality inspection, disciplinary inspection, safety inspection, accounting, etc."
  },
  {
    code: "TYPE_2",
    name: "The Helper, The Giver",
    name_en: "The Helper, The Giver",
    description: "2号人格",
    description_en: "Type 2",
    analysis: "## The Helper, The Giver\n\n**[Desire Trait]:** Pursuing Service\n\n**[Basic Thought]:** If I don't help others, no one will love me.\n\n**[Main Characteristics]:** \n\nCraving for others' love or good relationships, willing to accommodate others, people-oriented, wanting others to feel they need you, often neglecting oneself; very concerned about others' feelings and needs, extremely enthusiastic, willing to give love to others, feeling one's life is valuable only when seeing others happily accept their love.\n\n**[Main Traits]:** \n\nGentle and friendly, easy-going, never directly expresses needs, tactful and reserved, Mr./Ms. Nice Guy, generous and charitable.\n\n**[Suitable Careers]:** \n\nYou have extraordinary advantages, especially in industries that require high-quality personal direct sales services, such as the insurance industry. All jobs that involve dealing with people can bring out your talents, such as customer service, teaching, nursing, trade union chairperson, and sales personnel.",
    analysis_en: "## The Helper, The Giver\n\n**[Desire Trait]:** Pursuing Service\n\n**[Basic Thought]:** If I don't help others, no one will love me.\n\n**[Main Characteristics]:** \n\nCraving for others' love or good relationships, willing to accommodate others, people-oriented, wanting others to feel they need you, often neglecting oneself; very concerned about others' feelings and needs, extremely enthusiastic, willing to give love to others, feeling one's life is valuable only when seeing others happily accept their love.\n\n**[Main Traits]:** \n\nGentle and friendly, easy-going, never directly expresses needs, tactful and reserved, Mr./Ms. Nice Guy, generous and charitable.\n\n**[Suitable Careers]:** \n\nYou have extraordinary advantages, especially in industries that require high-quality personal direct sales services, such as the insurance industry. All jobs that involve dealing with people can bring out your talents, such as customer service, teaching, nursing, trade union chairperson, and sales personnel."
  },
  {
    code: "TYPE_3",
    name: "The Achiever",
    name_en: "The Achiever",
    description: "3号人格",
    description_en: "Type 3",
    analysis: "## The Achiever\n\n**[Desire Trait]:** Pursuing Achievements\n\n**[Basic Thought]:** If I have no achievements, no one will love me.\n\n**[Main Characteristics]:** \n\nStrong competitive spirit, likes to be in charge, often compares with others, measures self-worth by achievements, focuses on image, workaholic, afraid to express inner feelings; hopes to be affirmed by everyone. An ambitious person, constantly pursues effectiveness, hopes to be different, attract attention and envy, and become the focus of others.\n\n**[Main Traits]:** \n\nConfident, energetic, humorous, self-assured, smooth in dealing with people, proactive, beautiful image\n\n**[Suitable Careers]:** \n\nFlexible, good at persuading others, and highly goal-oriented, you can especially excel in challenging and persuasive jobs, such as in sales, insurance, and public speaking. You can also fully utilize your talents when given a team.",
    analysis_en: "## The Achiever\n\n**[Desire Trait]:** Pursuing Achievements\n\n**[Basic Thought]:** If I have no achievements, no one will love me.\n\n**[Main Characteristics]:** \n\nStrong competitive spirit, likes to be in charge, often compares with others, measures self-worth by achievements, focuses on image, workaholic, afraid to express inner feelings; hopes to be affirmed by everyone. An ambitious person, constantly pursues effectiveness, hopes to be different, attract attention and envy, and become the focus of others.\n\n**[Main Traits]:** \n\nConfident, energetic, humorous, self-assured, smooth in dealing with people, proactive, beautiful image\n\n**[Suitable Careers]:** \n\nFlexible, good at persuading others, and highly goal-oriented, you can especially excel in challenging and persuasive jobs, such as in sales, insurance, and public speaking. You can also fully utilize your talents when given a team."
  },
  {
    code: "TYPE_4",
    name: "The Individualist, The Romantic",
    name_en: "The Individualist, The Romantic",
    description: "4号人格",
    description_en: "Type 4",
    analysis: "## The Individualist, The Romantic\n\n**[Desire Trait]:** Pursuing Uniqueness\n\n**[Basic Thought]:** If I am not unique, no one will love me.\n\n**[Main Characteristics]:** \n\nEmotional, romantic, afraid of rejection, feeling misunderstood by others, possessive, independent lifestyle: Tends to talk about unhappy things, prone to depression and jealousy, seeks to feel good in life; cherishes their love and emotions, thus wanting to nourish them well and express them in the most beautiful and special ways. They strive to create unique and distinctive images and works, constantly self-aware, self-reflective, and self-exploratory.\n\n**[Suitable Careers]:** \n\nSuitable for various highly creative jobs, they have the ability to discover beauty, and can fully utilize their talents in all fields related to beauty. Such as fine arts, music, art, fashion, drama, literature, interior design, advertising, product design, etc.",
    analysis_en: "## The Individualist, The Romantic\n\n**[Desire Trait]:** Pursuing Uniqueness\n\n**[Basic Thought]:** If I am not unique, no one will love me.\n\n**[Main Characteristics]:** \n\nEmotional, romantic, afraid of rejection, feeling misunderstood by others, possessive, independent lifestyle: Tends to talk about unhappy things, prone to depression and jealousy, seeks to feel good in life; cherishes their love and emotions, thus wanting to nourish them well and express them in the most beautiful and special ways. They strive to create unique and distinctive images and works, constantly self-aware, self-reflective, and self-exploratory.\n\n**[Suitable Careers]:** \n\nSuitable for various highly creative jobs, they have the ability to discover beauty, and can fully utilize their talents in all fields related to beauty. Such as fine arts, music, art, fashion, drama, literature, interior design, advertising, product design, etc."
  },
  {
    code: "TYPE_5",
    name: "The Investigator, The Thinker",
    name_en: "The Investigator, The Thinker",
    description: "5号人格",
    description_en: "Type 5",
    analysis: "## The Investigator, The Thinker\n\n**[Desire Trait]:** Pursuing Knowledge\n\n**[Basic Thought]:** If I don't have knowledge, no one will love me.\n\n**[Main Characteristics]:** \n\nViewing the world with a cold eye, detaching from emotions, enjoying thinking and analysis, desiring to know a lot but lacking in action, having low demands for material life, preferring spiritual life, being poor at expressing inner feelings; they want to gain more knowledge to understand the environment and deal with things around them. They aim to find the patterns and principles of things as guidelines for action. Only with knowledge do they feel secure and dare to act.\n\n**[Main Traits]:** \n\nGentle and refined, learned, methodical, reserved in expression, poor at speaking, silent and introverted, indifferent and distant, lacking vitality, slow to react\n\n**[Suitable Careers]:** \n\nSkilled at systematically categorizing large amounts of data, possessing exceptional insight and analytical abilities, they can become experts in a specific field, suitable for positions such as scientists, consultants, decision analysts, data analysts and organizers, researchers, etc.",
    analysis_en: "## The Investigator, The Thinker\n\n**[Desire Trait]:** Pursuing Knowledge\n\n**[Basic Thought]:** If I don't have knowledge, no one will love me.\n\n**[Main Characteristics]:** \n\nViewing the world with a cold eye, detaching from emotions, enjoying thinking and analysis, desiring to know a lot but lacking in action, having low demands for material life, preferring spiritual life, being poor at expressing inner feelings; they want to gain more knowledge to understand the environment and deal with things around them. They aim to find the patterns and principles of things as guidelines for action. Only with knowledge do they feel secure and dare to act.\n\n**[Main Traits]:** \n\nGentle and refined, learned, methodical, reserved in expression, poor at speaking, silent and introverted, indifferent and distant, lacking vitality, slow to react\n\n**[Suitable Careers]:** \n\nSkilled at systematically categorizing large amounts of data, possessing exceptional insight and analytical abilities, they can become experts in a specific field, suitable for positions such as scientists, consultants, decision analysts, data analysts and organizers, researchers, etc."
  },
  {
    code: "TYPE_6",
    name: "The Loyalist",
    name_en: "The Loyalist",
    description: "6号人格",
    description_en: "Type 6",
    analysis: "## The Loyalist\n\n**[Desire Trait]:** Pursuing Loyalty\n\n**[Basic Thought]:** If I don't comply, no one will love me.\n\n**[Main Characteristics]:** \n\nCautious in doing things, not easily trusting others, full of doubts, preferring group life, working hard for others, disliking being in the spotlight, content with the status quo, reluctant to adapt to new environments; believing in authority and following its guidance, yet on the other hand, prone to opposing it, with a contradictory personality. They have a strong sense of group identity, needing intimacy, to be loved, accepted, and to have a sense of security.\n\n**[Main Traits]:** \n\nLoyal, vigilant, cautious, shrewd, practical, rule-abiding, and a maintainer of discipline.\n\n**[Suitable Careers]:** \n\nThey can excel in positions that require meticulousness, patience, vigilance, and loyalty, such as planners, strategists, police officers, intelligence agents, security personnel, etc.",
    analysis_en: "## The Loyalist\n\n**[Desire Trait]:** Pursuing Loyalty\n\n**[Basic Thought]:** If I don't comply, no one will love me.\n\n**[Main Characteristics]:** \n\nCautious in doing things, not easily trusting others, full of doubts, preferring group life, working hard for others, disliking being in the spotlight, content with the status quo, reluctant to adapt to new environments; believing in authority and following its guidance, yet on the other hand, prone to opposing it, with a contradictory personality. They have a strong sense of group identity, needing intimacy, to be loved, accepted, and to have a sense of security.\n\n**[Main Traits]:** \n\nLoyal, vigilant, cautious, shrewd, practical, rule-abiding, and a maintainer of discipline.\n\n**[Suitable Careers]:** \n\nThey can excel in positions that require meticulousness, patience, vigilance, and loyalty, such as planners, strategists, police officers, intelligence agents, security personnel, etc."
  },
  {
    code: "TYPE_7",
    name: "The Enthusiast, The Epicure",
    name_en: "The Enthusiast, The Epicure",
    description: "7号人格",
    description_en: "Type 7",
    analysis: "## The Enthusiast, The Epicure\n\n**[Desire Trait]:** Pursuing Happiness\n\n**[Basic Thought]:** If I don't bring joy, no one will love me.\n\n**[Main Characteristics]:** \n\nOptimistic, craving novelty, keeping up with trends, disliking pressure, fearing negative emotions; desiring a pleasant life, wanting to innovate and entertain both oneself and others, longing for a relatively enjoyable lifestyle, and transforming the unpleasant aspects of life into nothingness. They enjoy immersing themselves in a world of joy and high spirits, so they are constantly seeking and experiencing happiness.\n\n**[Main Traits]:** \n\nCheerful and enthusiastic, constantly active, constantly acquiring, intolerant of serious matters, versatile, familiar with and dedicated to fun activities, willing to do anything for happiness, and treating people and things with a light-hearted and humorous attitude.\n\n**[Suitable Careers]:** \n\nPublic relations, social work, computer-related jobs that require creativity.",
    analysis_en: "## The Enthusiast, The Epicure\n\n**[Desire Trait]:** Pursuing Happiness\n\n**[Basic Thought]:** If I don't bring joy, no one will love me.\n\n**[Main Characteristics]:** \n\nOptimistic, craving novelty, keeping up with trends, disliking pressure, fearing negative emotions; desiring a pleasant life, wanting to innovate and entertain both oneself and others, longing for a relatively enjoyable lifestyle, and transforming the unpleasant aspects of life into nothingness. They enjoy immersing themselves in a world of joy and high spirits, so they are constantly seeking and experiencing happiness.\n\n**[Main Traits]:** \n\nCheerful and enthusiastic, constantly active, constantly acquiring, intolerant of serious matters, versatile, familiar with and dedicated to fun activities, willing to do anything for happiness, and treating people and things with a light-hearted and humorous attitude.\n\n**[Suitable Careers]:** \n\nPublic relations, social work, computer-related jobs that require creativity."
  },
  {
    code: "TYPE_8",
    name: "The Challenger, The Leader",
    name_en: "The Challenger, The Leader",
    description: "8号人格",
    description_en: "Type 8",
    analysis: "## The Challenger, The Leader\n\n**[Desire Trait]:** Pursuit of Power\n\n**[Basic Thought]:** If I don't have power, no one will love me.\n\n**[Main Characteristics]:** \n\nPursues power, values strength, doesn't rely on others, has a sense of justice, wants to be in charge, likes to do big things; is an absolute doer, takes immediate action upon encountering problems. Desires independence and self-reliance, acts based on one's own abilities, is willing to destroy before building, and aims to lead everyone towards fairness and justice.\n\n**[Main Traits]:** \n\nAggressive, self-centered, looks down on weakness, respects the strong, stands up for the oppressed, impulsive, expresses dissatisfaction immediately, subjective, intuitive.\n\n**[Suitable Careers]:** \n\nCareers that require courage and wisdom to face conflicts, such as being a leader, leading a team, or starting a business.",
    analysis_en: "## The Challenger, The Leader\n\n**[Desire Trait]:** Pursuit of Power\n\n**[Basic Thought]:** If I don't have power, no one will love me.\n\n**[Main Characteristics]:** \n\nPursues power, values strength, doesn't rely on others, has a sense of justice, wants to be in charge, likes to do big things; is an absolute doer, takes immediate action upon encountering problems. Desires independence and self-reliance, acts based on one's own abilities, is willing to destroy before building, and aims to lead everyone towards fairness and justice.\n\n**[Main Traits]:** \n\nAggressive, self-centered, looks down on weakness, respects the strong, stands up for the oppressed, impulsive, expresses dissatisfaction immediately, subjective, intuitive.\n\n**[Suitable Careers]:** \n\nCareers that require courage and wisdom to face conflicts, such as being a leader, leading a team, or starting a business."
  },
  {
    code: "TYPE_9",
    name: "The Peacemaker, The Mediator",
    name_en: "The Peacemaker, The Mediator",
    description: "9号人格",
    description_en: "Type 9",
    analysis: "## The Peacemaker, The Mediator\n\n**[Desire Trait]:** Pursuing peace\n\n**[Basic Thought]:** If I'm not kind, no one will love me.\n\n**[Main Characteristics]:** \n\nTakes a long time to make decisions, has difficulty saying no to others, doesn't know how to vent anger; appears very gentle, dislikes conflicts, doesn't boast or seek attention, has a mild personality. Desires harmonious relationships with others, avoids all conflicts and tensions, hopes to maintain a pleasant status quo. Ignores things that make them unhappy and tries to keep themselves stable and calm as much as possible.\n\n**[Main Traits]:** \n\nGentle and friendly, patient, easy-going, afraid of competition, unable to concentrate, sometimes seems like a sleepwalker, won't finish tasks until the last minute, highly dependent on others' reminders, focuses on details and minor matters, has little interest in most things, dislikes being controlled, never directly expresses dissatisfaction but instead goes along with things.\n\n**[Suitable Careers]:** \n\nJobs that do not involve conflicts and involve dealing with people. Such as teaching, nursing, consulting, therapy, service positions, etc.",
    analysis_en: "## The Peacemaker, The Mediator\n\n**[Desire Trait]:** Pursuing peace\n\n**[Basic Thought]:** If I'm not kind, no one will love me.\n\n**[Main Characteristics]:** \n\nTakes a long time to make decisions, has difficulty saying no to others, doesn't know how to vent anger; appears very gentle, dislikes conflicts, doesn't boast or seek attention, has a mild personality. Desires harmonious relationships with others, avoids all conflicts and tensions, hopes to maintain a pleasant status quo. Ignores things that make them unhappy and tries to keep themselves stable and calm as much as possible.\n\n**[Main Traits]:** \n\nGentle and friendly, patient, easy-going, afraid of competition, unable to concentrate, sometimes seems like a sleepwalker, won't finish tasks until the last minute, highly dependent on others' reminders, focuses on details and minor matters, has little interest in most things, dislikes being controlled, never directly expresses dissatisfaction but instead goes along with things.\n\n**[Suitable Careers]:** \n\nJobs that do not involve conflicts and involve dealing with people. Such as teaching, nursing, consulting, therapy, service positions, etc."
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有九型人格测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'enneagram_en'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 九型人格测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating Enneagram test project...');
    
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
    
    console.log('🎉 Enneagram test setup completed!');
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
