console.log('🚀 Starting Temperament Type Test creation...');
console.log('Script is running...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 气质类型测试项目数据
const projectData = {
  project_id: 'temperament_type_test',
  name: 'Temperament Type Test',
  name_en: 'Temperament Type Test',
  image_url: 'assets/images/temperament-type-test.png',
  intro: 'Temperament refers to the dynamic characteristics of psychological activities, and it is similar to the concepts of "temper" or "natural disposition" commonly used in daily life. As the natural expression of personality traits, temperament is mainly shaped by the neural activity patterns of the brain and acquired habits. There is no distinction between good and bad, or superiority and inferiority, in terms of social value evaluation for different temperament types. In fact, every temperament type contains both positive and negative elements. Therefore, in the process of self-improvement of personality, one should promote strengths and avoid weaknesses. Importantly, temperament does not determine a person\'s moral and ethical qualities, nor does it decide the level of achievement in their activities. Individuals of all temperament types can make contributions to society, though the negative elements of their temperament may exert adverse effects on their behavior.',
  intro_en: 'Temperament refers to the dynamic characteristics of psychological activities, and it is similar to the concepts of "temper" or "natural disposition" commonly used in daily life. As the natural expression of personality traits, temperament is mainly shaped by the neural activity patterns of the brain and acquired habits. There is no distinction between good and bad, or superiority and inferiority, in terms of social value evaluation for different temperament types. In fact, every temperament type contains both positive and negative elements. Therefore, in the process of self-improvement of personality, one should promote strengths and avoid weaknesses. Importantly, temperament does not determine a person\'s moral and ethical qualities, nor does it decide the level of achievement in their activities. Individuals of all temperament types can make contributions to society, though the negative elements of their temperament may exert adverse effects on their behavior.',
  test_type: 'temperament_type_test',
  estimated_time: 15,
  question_count: 60,
  is_active: true
};

// 气质类型测试结果类型数据
const resultTypes = [
  {
    code: "CHOLERIC",
    name: "胆汁质",
    name_en: "Choleric Temperament",
    description: "胆汁质总分最高",
    description_en: "Choleric temperament has the highest score",
    analysis: "Also known as the \"unrestrainable type\" or \"combat type,\" sanguine temperament is characterized by a strong excitement process and a relatively weak depression process. Individuals with this temperament are easily emotionally aroused, respond quickly, act swiftly, and are fiery and forceful. They show intense and rapid emotional expressions in language, facial expressions, and gestures. They have an unstoppable and persistent drive to overcome difficulties but are not good at careful consideration. They are impulsive, and their emotions tend to erupt uncontrollably. Their work style exhibits obvious periodicity: they will immerse themselves in their career and be ready to overcome numerous difficulties and obstacles on the way to their goals. However, when their energy is exhausted, they tend to lose confidence easily.\n\nSuitable Occupations: Management work, diplomatic work, driver, garment and textile industry, catering and service industry, doctor, lawyer, athlete, adventurer, journalist, actor/actress, soldier, public security officer, etc.",
    analysis_en: "Also known as the \"unrestrainable type\" or \"combat type,\" sanguine temperament is characterized by a strong excitement process and a relatively weak depression process. Individuals with this temperament are easily emotionally aroused, respond quickly, act swiftly, and are fiery and forceful. They show intense and rapid emotional expressions in language, facial expressions, and gestures. They have an unstoppable and persistent drive to overcome difficulties but are not good at careful consideration. They are impulsive, and their emotions tend to erupt uncontrollably. Their work style exhibits obvious periodicity: they will immerse themselves in their career and be ready to overcome numerous difficulties and obstacles on the way to their goals. However, when their energy is exhausted, they tend to lose confidence easily.\n\nSuitable Occupations: Management work, diplomatic work, driver, garment and textile industry, catering and service industry, doctor, lawyer, athlete, adventurer, journalist, actor/actress, soldier, public security officer, etc."
  },
  {
    code: "SANGUINE",
    name: "多血质",
    name_en: "Sanguine Temperament",
    description: "多血质总分最高",
    description_en: "Sanguine temperament has the highest score",
    analysis: "Also known as the \"lively type,\" individuals with choleric temperament are agile, active, and skilled at socializing, and they do not feel constrained in new environments. In work and study, they are energetic and efficient, demonstrating sharp work capabilities and a strong ability to adapt to environmental changes. Within a group, they are cheerful and vibrant, willing to engage in practical undertakings, and hold a longing for career aspirations. They can quickly grasp new things, and when equipped with sufficient self-control and a sense of discipline, they will exhibit great enthusiasm. Their interests are broad, yet their emotions are changeable—if they encounter setbacks in their career, their passion may diminish just as rapidly as they once dedicated themselves to it. They often achieve outstanding results when undertaking diverse types of work.\n\nSuitable Occupations: Tour guide, salesperson, program host, speaker, foreign affairs receptionist, actor/actress, market researcher, supervisor, etc.",
    analysis_en: "Also known as the \"lively type,\" individuals with choleric temperament are agile, active, and skilled at socializing, and they do not feel constrained in new environments. In work and study, they are energetic and efficient, demonstrating sharp work capabilities and a strong ability to adapt to environmental changes. Within a group, they are cheerful and vibrant, willing to engage in practical undertakings, and hold a longing for career aspirations. They can quickly grasp new things, and when equipped with sufficient self-control and a sense of discipline, they will exhibit great enthusiasm. Their interests are broad, yet their emotions are changeable—if they encounter setbacks in their career, their passion may diminish just as rapidly as they once dedicated themselves to it. They often achieve outstanding results when undertaking diverse types of work.\n\nSuitable Occupations: Tour guide, salesperson, program host, speaker, foreign affairs receptionist, actor/actress, market researcher, supervisor, etc."
  },
  {
    code: "PHLEGMATIC",
    name: "黏液质",
    name_en: "Phlegmatic Temperament",
    description: "黏液质总分最高",
    description_en: "Phlegmatic temperament has the highest score",
    analysis: "Also known as the \"calm type,\" individuals with this temperament are steadfast, reliable, and hardworking in life. Endowed with a strong inhibitory process that balances their excitatory process, they act slowly and calmly, strictly adhering to established daily routines and work systems, and are not distracted by unnecessary temptations. People with phlegmatic temperament have a composed attitude, maintain moderate social interactions, and avoid empty or frivolous conversations. They are not easily emotionally aroused, rarely lose their temper, and do not readily show their emotions; they are self-disciplined and often do not flaunt their abilities. Such individuals can persist in their work for a long time and carry it out in an orderly manner. Their shortcomings lie in being less flexible and not good at shifting their attention. Inertia makes them conservative and rigid—they excel in consistency but lack adaptability. They possess the virtues of calmness and conscientiousness, and their personalities exhibit consistency and certainty.\n\nSuitable Occupations: Surgeon, judge, administrator, cashier, accountant, broadcaster, switchboard operator, mediator, teacher, human resources manager, etc.",
    analysis_en: "Also known as the \"calm type,\" individuals with this temperament are steadfast, reliable, and hardworking in life. Endowed with a strong inhibitory process that balances their excitatory process, they act slowly and calmly, strictly adhering to established daily routines and work systems, and are not distracted by unnecessary temptations. People with phlegmatic temperament have a composed attitude, maintain moderate social interactions, and avoid empty or frivolous conversations. They are not easily emotionally aroused, rarely lose their temper, and do not readily show their emotions; they are self-disciplined and often do not flaunt their abilities. Such individuals can persist in their work for a long time and carry it out in an orderly manner. Their shortcomings lie in being less flexible and not good at shifting their attention. Inertia makes them conservative and rigid—they excel in consistency but lack adaptability. They possess the virtues of calmness and conscientiousness, and their personalities exhibit consistency and certainty.\n\nSuitable Occupations: Surgeon, judge, administrator, cashier, accountant, broadcaster, switchboard operator, mediator, teacher, human resources manager, etc."
  },
  {
    code: "MELANCHOLIC",
    name: "抑郁质",
    name_en: "Melancholic Temperament",
    description: "抑郁质总分最高",
    description_en: "Melancholic temperament has the highest score",
    analysis: "Individuals with this temperament have strong receptive abilities and are prone to emotional reactions. They have fewer ways of experiencing emotions, but their emotional experiences are long-lasting and intense. They can observe details that others hardly notice, are sensitive to changes in the external environment, and have profound inner experiences. Their external behaviors are very slow, awkward, timid, suspicious, withdrawn, indecisive, and they are prone to fear.\n\nSuitable Occupations: Proofreader, typist, typesetter, inspector, carving worker, embroidery worker, storekeeper, confidential secretary, art worker, philosopher, scientist.",
    analysis_en: "Individuals with this temperament have strong receptive abilities and are prone to emotional reactions. They have fewer ways of experiencing emotions, but their emotional experiences are long-lasting and intense. They can observe details that others hardly notice, are sensitive to changes in the external environment, and have profound inner experiences. Their external behaviors are very slow, awkward, timid, suspicious, withdrawn, indecisive, and they are prone to fear.\n\nSuitable Occupations: Proofreader, typist, typesetter, inspector, carving worker, embroidery worker, storekeeper, confidential secretary, art worker, philosopher, scientist."
  }
];

// 60道题目数据
const questions = [
  "Strives to be steady in doing things and generally avoids taking actions without certainty.",
  "Becomes furious when encountering annoying things and only feels relieved after pouring out all thoughts.",
  "Prefers to work alone rather than with a large group of people.",
  "Can quickly adapt to a new environment.",
  "Dislikes intense stimuli such as screams, noise, and dangerous scenes.",
  "Always takes the initiative to attack and tends to provoke others during arguments.",
  "Prefers a quiet environment.",
  "Is good at interacting with people.",
  "Admires those who are good at controlling their emotions.",
  "Lives a regular life and rarely violates the daily schedule.",
  "Tends to be optimistic in most cases.",
  "Feels very constrained when meeting strangers.",
  "Can well control oneself when encountering irritating things.",
  "Always has abundant energy when doing things.",
  "Often hesitates and is indecisive when facing problems.",
  "Never feels overly constrained in a crowd.",
  "Finds everything interesting when in a high mood, but feels nothing is worthwhile when in a low mood.",
  "When focusing on one thing, it is hard for other things to distract oneself.",
  "Grasps problems faster than others.",
  "Often feels extreme fear when encountering dangerous situations.",
  "Has great enthusiasm for study, work, and career.",
  "Can do boring and monotonous work for a long time.",
  "Works with great energy if the task matches personal interests; otherwise, is unwilling to do it.",
  "Gets emotionally upset over trivial matters.",
  "Hates work that requires patience and carefulness.",
  "Interacts with others in a neither humble nor overbearing manner.",
  "Likes to participate in lively activities.",
  "Enjoys reading literary works with delicate emotions and detailed descriptions of characters' inner activities.",
  "Often feels tired after studying or working for a long time.",
  "Dislikes discussing one issue for a long time and prefers to take practical actions.",
  "Would rather talk loudly and confidently than whisper.",
  "Others say that I am always in low spirits.",
  "Usually understands problems slower than others.",
  "After feeling tired, can quickly refresh and get back to work with a short rest.",
  "When having thoughts in mind, prefers to think alone rather than speak them out.",
  "Once setting a goal, hopes to achieve it as soon as possible and will not give up until reaching the target.",
  "After studying or working with others for the same period, often feels more tired than them.",
  "Acts a bit recklessly and often does things without considering the consequences.",
  "When teachers or mentors teach new knowledge and skills, always hopes they can speak slower and repeat more times.",
  "Can quickly forget unpleasant things.",
  "Always spends more time than others on doing homework or completing a task.",
  "Likes strenuous sports with large exercise volume or participates in various entertainment activities.",
  "Cannot quickly shift attention from one thing to another.",
  "After accepting a task, hopes to complete it quickly.",
  "Thinks following established rules is better than taking risks.",
  "Can focus on several things at the same time.",
  "When feeling down, it is hard for others to cheer me up.",
  "Likes reading novels with thrilling plots and exciting storylines.",
  "Takes work seriously and rigorously, with a consistent attitude.",
  "Always has trouble getting along with people around.",
  "Likes to review learned knowledge and repeatedly check completed work.",
  "Hopes to do work that is changeable and full of variety.",
  "When I was a child, I could recite many poems and seemed to remember them more clearly than others.",
  "Others say I \"hurt people with my words,\" but I don't feel that way.",
  "In sports activities, often falls behind due to slow reactions.",
  "Is quick-witted and has a flexible mind.",
  "Likes work that is organized and not troublesome.",
  "Exciting things often make me unable to fall asleep.",
  "Often fails to understand new concepts when teachers explain them, but once understanding, it is hard to forget.",
  "If the work is boring, my mood will drop immediately."
];

// 气质类型对应的题号
const temperamentQuestions = {
  CHOLERIC: [2, 6, 9, 14, 17, 21, 27, 31, 36, 38, 42, 48, 50, 54, 58], // 胆汁质
  SANGUINE: [4, 8, 11, 16, 19, 23, 25, 29, 34, 40, 44, 46, 52, 56, 60], // 多血质
  PHLEGMATIC: [1, 7, 10, 13, 18, 22, 26, 30, 33, 39, 43, 45, 49, 55, 57], // 黏液质
  MELANCHOLIC: [3, 5, 12, 15, 20, 24, 28, 32, 35, 37, 41, 47, 51, 53, 59] // 抑郁质
};

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 检查是否已有气质类型测试项目
    const checkResult = await client.query(
      "SELECT * FROM test_projects WHERE project_id = 'temperament_type_test'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('✅ 气质类型测试项目已存在:', checkResult.rows[0].name);
      return;
    }
    
    console.log('📝 Creating Temperament Type Test project...');
    
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
    
    // 创建题目和选项
    console.log('📝 Creating questions and options...');
    for (let i = 0; i < questions.length; i++) {
      const questionNumber = i + 1;
      const questionText = questions[i];
      
      // 插入题目
      const questionResult = await client.query(`
        INSERT INTO questions (project_id, question_number, question_text, question_text_en, question_type, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW()) 
        RETURNING id
      `, [
        projectId,
        questionNumber,
        questionText,
        questionText,
        'single_choice'
      ]);
      
      const questionId = questionResult.rows[0].id;
      
      // 创建选项 (A: +2, B: +1, C: 0, D: -1, E: -2)
      const options = [
        { number: 1, text: 'Very much in line', text_en: 'Very much in line', score: 2 },
        { number: 2, text: 'Relatively in line', text_en: 'Relatively in line', score: 1 },
        { number: 3, text: 'In between', text_en: 'In between', score: 0 },
        { number: 4, text: 'Not quite in line', text_en: 'Not quite in line', score: -1 },
        { number: 5, text: 'Not in line at all', text_en: 'Not in line at all', score: -2 }
      ];
      
      for (const option of options) {
        // 计算每个选项对不同气质类型的分数
        const scoreValue = {};
        for (const [temperament, questionNumbers] of Object.entries(temperamentQuestions)) {
          if (questionNumbers.includes(questionNumber)) {
            scoreValue[temperament] = option.score;
          } else {
            scoreValue[temperament] = 0;
          }
        }
        
        await client.query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [
          questionId,
          option.number,
          option.text,
          option.text_en,
          JSON.stringify(scoreValue)
        ]);
      }
    }
    console.log(`✅ Created ${questions.length} questions with options`);
    
    console.log('🎉 Temperament Type Test setup completed!');
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📋 Result types: ${resultTypes.length}`);
    console.log(`❓ Questions: ${questions.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
