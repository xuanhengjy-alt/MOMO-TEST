const { query, transaction } = require('../config/database');

// 观察能力测试数据
const observationTestData = {
  project_id: 'observation',
  name: 'Observation ability test',
  name_en: 'Observation ability test',
  image_url: 'assets/images/observation-ability-test.png',
  intro: 'Have you truly "seen" rather than just "looked" around you? This test, through 15 situational questions, helps you assess your unconscious observing habits - from detail capture to interpersonal perception, from environmental awareness to inner awareness. Observation is not only the ability to notice details, but also the key to understanding others and connecting with the world. After completing the test, you will receive a precise analysis of your cognitive style, clearly identifying your strengths and blind spots, and learn how to enhance your observation skills to improve communication, decision-making, and even creativity. Don\'t overthink, answer immediately, and unlock your observation potential in just a few minutes!',
  intro_en: 'Have you truly "seen" rather than just "looked" around you? This test, through 15 situational questions, helps you assess your unconscious observing habits - from detail capture to interpersonal perception, from environmental awareness to inner awareness. Observation is not only the ability to notice details, but also the key to understanding others and connecting with the world. After completing the test, you will receive a precise analysis of your cognitive style, clearly identifying your strengths and blind spots, and learn how to enhance your observation skills to improve communication, decision-making, and even creativity. Don\'t overthink, answer immediately, and unlock your observation potential in just a few minutes!',
  test_type: 'observation',
  estimated_time: 10,
  question_count: 15
};

// 15道题目
const questions = [
  {
    question_number: 1,
    question_text: 'When entering a government office, you:',
    question_text_en: 'When entering a government office, you:',
    options: [
      { option_number: 1, option_text: 'Notice the arrangement of desks and chairs', option_text_en: 'Notice the arrangement of desks and chairs', score_value: 3 },
      { option_number: 2, option_text: 'Pay attention to the exact position of the equipment', option_text_en: 'Pay attention to the exact position of the equipment', score_value: 10 },
      { option_number: 3, option_text: 'Observe what is hung on the wall', option_text_en: 'Observe what is hung on the wall', score_value: 5 }
    ]
  },
  {
    question_number: 2,
    question_text: 'When you meet someone, you:',
    question_text_en: 'When you meet someone, you:',
    options: [
      { option_number: 1, option_text: 'Only look at his face', option_text_en: 'Only look at his face', score_value: 5 },
      { option_number: 2, option_text: 'Quietly take a look at him from head to toe', option_text_en: 'Quietly take a look at him from head to toe', score_value: 10 },
      { option_number: 3, option_text: 'Only pay attention to certain parts of his face', option_text_en: 'Only pay attention to certain parts of his face', score_value: 3 }
    ]
  },
  {
    question_number: 3,
    question_text: 'What do you remember from the scenery you have seen?',
    question_text_en: 'What do you remember from the scenery you have seen?',
    options: [
      { option_number: 1, option_text: 'The color tones', option_text_en: 'The color tones', score_value: 10 },
      { option_number: 2, option_text: 'The sky', option_text_en: 'The sky', score_value: 5 },
      { option_number: 3, option_text: 'The feelings that emerged in your heart at that time', option_text_en: 'The feelings that emerged in your heart at that time', score_value: 3 }
    ]
  },
  {
    question_number: 4,
    question_text: 'When you wake up in the morning, you:',
    question_text_en: 'When you wake up in the morning, you:',
    options: [
      { option_number: 1, option_text: 'Immediately remember what you should do', option_text_en: 'Immediately remember what you should do', score_value: 10 },
      { option_number: 2, option_text: 'Remember what you dreamed about', option_text_en: 'Remember what you dreamed about', score_value: 3 },
      { option_number: 3, option_text: 'Think about what happened yesterday', option_text_en: 'Think about what happened yesterday', score_value: 5 }
    ]
  },
  {
    question_number: 5,
    question_text: 'When you get on a bus, you:',
    question_text_en: 'When you get on a bus, you:',
    options: [
      { option_number: 1, option_text: 'Look at no one', option_text_en: 'Look at no one', score_value: 3 },
      { option_number: 2, option_text: 'See who is standing beside you', option_text_en: 'See who is standing beside you', score_value: 5 },
      { option_number: 3, option_text: 'Talk to the person nearest to you', option_text_en: 'Talk to the person nearest to you', score_value: 10 }
    ]
  },
  {
    question_number: 6,
    question_text: 'On the street, you:',
    question_text_en: 'On the street, you:',
    options: [
      { option_number: 1, option_text: 'Observe the passing vehicles', option_text_en: 'Observe the passing vehicles', score_value: 5 },
      { option_number: 2, option_text: 'Observe the fronts of the houses', option_text_en: 'Observe the fronts of the houses', score_value: 3 },
      { option_number: 3, option_text: 'Observe the pedestrians', option_text_en: 'Observe the pedestrians', score_value: 10 }
    ]
  },
  {
    question_number: 7,
    question_text: 'When you look at the shop window, you:',
    question_text_en: 'When you look at the shop window, you:',
    options: [
      { option_number: 1, option_text: 'Only care about things that might be useful to you', option_text_en: 'Only care about things that might be useful to you', score_value: 3 },
      { option_number: 2, option_text: 'Also look at things you don\'t need at the moment', option_text_en: 'Also look at things you don\'t need at the moment', score_value: 5 },
      { option_number: 3, option_text: 'Pay attention to everything', option_text_en: 'Pay attention to everything', score_value: 10 }
    ]
  },
  {
    question_number: 8,
    question_text: 'If you need to find something at home, you:',
    question_text_en: 'If you need to find something at home, you:',
    options: [
      { option_number: 1, option_text: 'Focus your attention on the places where the thing might be.', option_text_en: 'Focus your attention on the places where the thing might be.', score_value: 10 },
      { option_number: 2, option_text: 'Search everywhere.', option_text_en: 'Search everywhere.', score_value: 5 },
      { option_number: 3, option_text: 'Ask others for help.', option_text_en: 'Ask others for help.', score_value: 3 }
    ]
  },
  {
    question_number: 9,
    question_text: 'When you see the past photos of your relatives and friends, you:',
    question_text_en: 'When you see the past photos of your relatives and friends, you:',
    options: [
      { option_number: 1, option_text: 'get excited', option_text_en: 'get excited', score_value: 5 },
      { option_number: 2, option_text: 'find them funny', option_text_en: 'find them funny', score_value: 3 },
      { option_number: 3, option_text: 'try to figure out who everyone in the photos is', option_text_en: 'try to figure out who everyone in the photos is', score_value: 10 }
    ]
  },
  {
    question_number: 10,
    question_text: 'If someone suggests you take part in a gambling game you don\'t know how to play, you:',
    question_text_en: 'If someone suggests you take part in a gambling game you don\'t know how to play, you:',
    options: [
      { option_number: 1, option_text: 'Try to learn how to play and aim to win.', option_text_en: 'Try to learn how to play and aim to win.', score_value: 10 },
      { option_number: 2, option_text: 'Make an excuse that you\'ll play later and refuse.', option_text_en: 'Make an excuse that you\'ll play later and refuse.', score_value: 5 },
      { option_number: 3, option_text: 'Simply say you won\'t play.', option_text_en: 'Simply say you won\'t play.', score_value: 3 }
    ]
  },
  {
    question_number: 11,
    question_text: 'You are waiting for someone in the park, so you:',
    question_text_en: 'You are waiting for someone in the park, so you:',
    options: [
      { option_number: 1, option_text: 'Observe the people around you carefully', option_text_en: 'Observe the people around you carefully', score_value: 10 },
      { option_number: 2, option_text: 'Read a newspaper', option_text_en: 'Read a newspaper', score_value: 5 },
      { option_number: 3, option_text: 'Think about something', option_text_en: 'Think about something', score_value: 3 }
    ]
  },
  {
    question_number: 12,
    question_text: 'On a starry night, you:',
    question_text_en: 'On a starry night, you:',
    options: [
      { option_number: 1, option_text: 'Try hard to observe constellations', option_text_en: 'Try hard to observe constellations', score_value: 10 },
      { option_number: 2, option_text: 'Just gaze at the sky aimlessly', option_text_en: 'Just gaze at the sky aimlessly', score_value: 5 },
      { option_number: 3, option_text: 'Look at nothing', option_text_en: 'Look at nothing', score_value: 3 }
    ]
  },
  {
    question_number: 13,
    question_text: 'When you put down the book you are reading, you always:',
    question_text_en: 'When you put down the book you are reading, you always:',
    options: [
      { option_number: 1, option_text: 'Mark where you left off with a pencil', option_text_en: 'Mark where you left off with a pencil', score_value: 10 },
      { option_number: 2, option_text: 'Put a bookmark in it', option_text_en: 'Put a bookmark in it', score_value: 5 },
      { option_number: 3, option_text: 'Rely on your memory', option_text_en: 'Rely on your memory', score_value: 3 }
    ]
  },
  {
    question_number: 14,
    question_text: 'What do you remember about your neighbor?',
    question_text_en: 'What do you remember about your neighbor?',
    options: [
      { option_number: 1, option_text: 'Name', option_text_en: 'Name', score_value: 10 },
      { option_number: 2, option_text: 'Appearance', option_text_en: 'Appearance', score_value: 3 },
      { option_number: 3, option_text: 'Nothing at all', option_text_en: 'Nothing at all', score_value: 5 }
    ]
  },
  {
    question_number: 15,
    question_text: 'At the well-set table:',
    question_text_en: 'At the well-set table:',
    options: [
      { option_number: 1, option_text: 'Praise its beauty.', option_text_en: 'Praise its beauty.', score_value: 3 },
      { option_number: 2, option_text: 'Check if everyone is present.', option_text_en: 'Check if everyone is present.', score_value: 10 },
      { option_number: 3, option_text: 'See if all the chairs are in the right places.', option_text_en: 'See if all the chairs are in the right places.', score_value: 5 }
    ]
  }
];

// 结果类型数据
const resultTypesData = [
  {
    type_code: 'EXCELLENT',
    type_name: 'Outstanding observation skills',
    type_name_en: 'Outstanding observation skills',
    description: '100-150 points',
    description_en: '100-150 points',
    analysis: '# Those with outstanding observation skills and acute insight into themselves and others\n\nYour test results show that you possess an extremely outstanding power of observation - not only can you quickly capture details, but also see through the surface to the essence. You are good at extracting information from the environment and have a sharp judgment of others\' emotions and behavioral patterns, enabling you to accurately understand and evaluate the people around you.\n\nAt the same time, you also possess a profound self-awareness, enabling you to calmly analyze your own behavior, reflect on your motives and outcomes. This ability makes you appear both clear-headed and composed in interpersonal interactions and decision-making. You are not easily swayed by prejudice and often offer objective and fair evaluations.\n\nThis talent will make you stand out in these fields:\n\nFields such as psychological counseling, management coordination, creative creation, and education and training, which require a deep understanding of people and the environment.\n\n## Next Step Growth Suggestions:\n\nTry to transform your insights into more effective communication and actions. Learn to balance rationality and empathy in complex situations. Your observational skills will not only enable you to "see", but also "illuminate" others and the path ahead.',
    analysis_en: '# Those with outstanding observation skills and acute insight into themselves and others\n\nYour test results show that you possess an extremely outstanding power of observation - not only can you quickly capture details, but also see through the surface to the essence. You are good at extracting information from the environment and have a sharp judgment of others\' emotions and behavioral patterns, enabling you to accurately understand and evaluate the people around you.\n\nAt the same time, you also possess a profound self-awareness, enabling you to calmly analyze your own behavior, reflect on your motives and outcomes. This ability makes you appear both clear-headed and composed in interpersonal interactions and decision-making. You are not easily swayed by prejudice and often offer objective and fair evaluations.\n\nThis talent will make you stand out in these fields:\n\nFields such as psychological counseling, management coordination, creative creation, and education and training, which require a deep understanding of people and the environment.\n\n## Next Step Growth Suggestions:\n\nTry to transform your insights into more effective communication and actions. Learn to balance rationality and empathy in complex situations. Your observational skills will not only enable you to "see", but also "illuminate" others and the path ahead.'
  },
  {
    type_code: 'GOOD',
    type_name: 'Quite acute observation abilities',
    type_name_en: 'Quite acute observation abilities',
    description: '75-99 points',
    description_en: '75-99 points',
    analysis: '# Sharp but occasionally biased\n\nTests show that you have a rather acute observational ability - you are good at catching details, perceiving the atmosphere, and quickly understanding the connections between people and things. However, occasionally your evaluations of others may unconsciously carry biases, which might stem from overly quick intuition, preconceived notions based on experience, or the interference of a certain moment\'s emotions.\n\nYou often "see" a lot, but some conclusions may still be subjectively filtered and fail to fully and objectively present the true picture.\n\n## How to further enhance your observation and judgment skills?\n\n- Before forming an evaluation, consciously ask yourself: "Have I overlooked any other perspectives or information?"\n- Try to delay judgment in interpersonal interactions, listen to more voices, especially those that differ from your initial impression.',
    analysis_en: '# Sharp but occasionally biased\n\nTests show that you have a rather acute observational ability - you are good at catching details, perceiving the atmosphere, and quickly understanding the connections between people and things. However, occasionally your evaluations of others may unconsciously carry biases, which might stem from overly quick intuition, preconceived notions based on experience, or the interference of a certain moment\'s emotions.\n\nYou often "see" a lot, but some conclusions may still be subjectively filtered and fail to fully and objectively present the true picture.\n\n## How to further enhance your observation and judgment skills?\n\n- Before forming an evaluation, consciously ask yourself: "Have I overlooked any other perspectives or information?"\n- Try to delay judgment in interpersonal interactions, listen to more voices, especially those that differ from your initial impression.'
  },
  {
    type_code: 'AVERAGE',
    type_name: 'You Live on the Surface',
    type_name_en: 'You Live on the Surface',
    description: '45-74 points',
    description_en: '45-74 points',
    analysis: '# You Live on the Surface\nTests show that you are accustomed to focusing on the external aspects of people and things - appearance, behavior, language, and other directly perceivable information - while lacking an active interest in exploring the deeper motives, emotions, or needs of others. This trait makes your social interactions straightforward and effortless, and you are less likely to get bogged down in excessive speculation or mental exhaustion. You usually do not encounter serious obstacles in interpersonal relationships.\n\nHowever, it might also mean missing out on a deeper understanding and resonance. You are like a calm observer of a lake\'s surface – you see the ripples but never delve into the turmoil beneath.\n\n## If you wish to cultivate deeper observation and empathy:\n- Try to ask more questions during conversations, such as "Why do you think so?" and "What were your feelings at that time?"\n- Practice listening without rushing to respond, but instead pay attention to the unspoken emotions and intentions of the other person.\n- Occasionally step out of your own perspective and put yourself in others\' shoes to understand their choices.\n\nThe depth of observation determines the thickness of connection. Learn to "look a little deeper", and you will discover a richer and more authentic world - and a more composed self.',
    analysis_en: '# You Live on the Surface\nTests show that you are accustomed to focusing on the external aspects of people and things - appearance, behavior, language, and other directly perceivable information - while lacking an active interest in exploring the deeper motives, emotions, or needs of others. This trait makes your social interactions straightforward and effortless, and you are less likely to get bogged down in excessive speculation or mental exhaustion. You usually do not encounter serious obstacles in interpersonal relationships.\n\nHowever, it might also mean missing out on a deeper understanding and resonance. You are like a calm observer of a lake\'s surface – you see the ripples but never delve into the turmoil beneath.\n\n## If you wish to cultivate deeper observation and empathy:\n- Try to ask more questions during conversations, such as "Why do you think so?" and "What were your feelings at that time?"\n- Practice listening without rushing to respond, but instead pay attention to the unspoken emotions and intentions of the other person.\n- Occasionally step out of your own perspective and put yourself in others\' shoes to understand their choices.\n\nThe depth of observation determines the thickness of connection. Learn to "look a little deeper", and you will discover a richer and more authentic world - and a more composed self.'
  },
  {
    type_code: 'POOR',
    type_name: 'Immersers in Their Own Worlds',
    type_name_en: 'Immersers in Their Own Worlds',
    description: '< 45 points',
    description_en: '< 45 points',
    analysis: '## Immersers in Their Own Worlds\n\nThe test results show that you currently rarely actively pay attention to others\' emotions, motivations or inner states, and even lack the habit of in-depth self-reflection. This highly self-focused thinking pattern may make you seem distant or insensitive in interpersonal interactions, prone to misunderstanding others\' intentions, and also difficult to establish deep trust relationships.\n\nYou are accustomed to remaining at the level of "surface socializing" - fulfilling functional conversations and collaborations, but find it difficult to delve into the deeper exchanges of emotions and thoughts. This does not mean you are indifferent; rather, you have yet to cultivate the cognitive habit of outward observation and inward reflection.\n\n## A crucial step towards change:\n- Try asking one person every day: "Why do you think that way?" and truly listen to the answer;\n- When interacting with others, consciously observe the subtle changes in their tone, expressions, and body language;\n- Practice regular self-reflection: "What did I do today? Why did I do it? Who was affected?"\n\nThe world is not just about the dimension of "me". When you start to care about the inner world of others, you are truly opening the door to understanding yourself and moving towards mature relationships.',
    analysis_en: '## Immersers in Their Own Worlds\n\nThe test results show that you currently rarely actively pay attention to others\' emotions, motivations or inner states, and even lack the habit of in-depth self-reflection. This highly self-focused thinking pattern may make you seem distant or insensitive in interpersonal interactions, prone to misunderstanding others\' intentions, and also difficult to establish deep trust relationships.\n\nYou are accustomed to remaining at the level of "surface socializing" - fulfilling functional conversations and collaborations, but find it difficult to delve into the deeper exchanges of emotions and thoughts. This does not mean you are indifferent; rather, you have yet to cultivate the cognitive habit of outward observation and inward reflection.\n\n## A crucial step towards change:\n- Try asking one person every day: "Why do you think that way?" and truly listen to the answer;\n- When interacting with others, consciously observe the subtle changes in their tone, expressions, and body language;\n- Practice regular self-reflection: "What did I do today? Why did I do it? Who was affected?"\n\nThe world is not just about the dimension of "me". When you start to care about the inner world of others, you are truly opening the door to understanding yourself and moving towards mature relationships.'
  }
];

// 添加项目
async function addProject() {
  console.log('📝 Adding Observation Ability Test project...');
  
  await query(`
    INSERT INTO test_projects (
      project_id, name, name_en, image_url, intro, intro_en, 
      test_type, estimated_time, question_count, is_active, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    ON CONFLICT (project_id) DO UPDATE SET
      name = EXCLUDED.name,
      name_en = EXCLUDED.name_en,
      image_url = EXCLUDED.image_url,
      intro = EXCLUDED.intro,
      intro_en = EXCLUDED.intro_en,
      test_type = EXCLUDED.test_type,
      estimated_time = EXCLUDED.estimated_time,
      question_count = EXCLUDED.question_count,
      is_active = EXCLUDED.is_active
  `, [
    observationTestData.project_id,
    observationTestData.name,
    observationTestData.name_en,
    observationTestData.image_url,
    observationTestData.intro,
    observationTestData.intro_en,
    observationTestData.test_type,
    observationTestData.estimated_time,
    observationTestData.question_count,
    true
  ]);
  
  console.log('✅ Project added successfully');
}

// 添加题目和选项
async function addQuestions() {
  console.log('📝 Adding questions and options...');
  
  // 获取项目内部ID
  const projectResult = await query('SELECT id FROM test_projects WHERE project_id = $1', [observationTestData.project_id]);
  const projectId = projectResult.rows[0].id;
  
  for (const question of questions) {
    // 添加题目
    const questionResult = await query(`
      INSERT INTO questions (
        project_id, question_number, question_text, question_text_en, created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (project_id, question_number) DO UPDATE SET
        question_text = EXCLUDED.question_text,
        question_text_en = EXCLUDED.question_text_en
      RETURNING id
    `, [projectId, question.question_number, question.question_text, question.question_text_en]);
    
    const questionId = questionResult.rows[0].id;
    
    // 添加选项
    for (const option of question.options) {
      await query(`
        INSERT INTO question_options (
          question_id, option_number, option_text, option_text_en, score_value, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (question_id, option_number) DO UPDATE SET
          option_text = EXCLUDED.option_text,
          option_text_en = EXCLUDED.option_text_en,
          score_value = EXCLUDED.score_value
      `, [questionId, option.option_number, option.option_text, option.option_text_en, option.score_value]);
    }
  }
  
  console.log('✅ Questions and options added successfully');
}

// 添加结果类型
async function addResultTypes() {
  console.log('📝 Adding result types...');
  
  // 获取项目内部ID
  const projectResult = await query('SELECT id FROM test_projects WHERE project_id = $1', [observationTestData.project_id]);
  const projectId = projectResult.rows[0].id;
  
  for (const resultType of resultTypesData) {
    await query(`
      INSERT INTO result_types (
        project_id, type_code, type_name, type_name_en, description, description_en, 
        analysis, analysis_en, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (project_id, type_code) DO UPDATE SET
        type_name = EXCLUDED.type_name,
        type_name_en = EXCLUDED.type_name_en,
        description = EXCLUDED.description,
        description_en = EXCLUDED.description_en,
        analysis = EXCLUDED.analysis,
        analysis_en = EXCLUDED.analysis_en
    `, [
      projectId,
      resultType.type_code,
      resultType.type_name,
      resultType.type_name_en,
      resultType.description,
      resultType.description_en,
      resultType.analysis,
      resultType.analysis_en
    ]);
  }
  
  console.log('✅ Result types added successfully');
}

// 添加测试统计
async function addTestStatistics() {
  console.log('📝 Adding test statistics...');
  
  // 获取项目内部ID
  const projectResult = await query('SELECT id FROM test_projects WHERE project_id = $1', [observationTestData.project_id]);
  const projectId = projectResult.rows[0].id;
  
  await query(`
    INSERT INTO test_statistics (project_id, total_tests, total_likes, last_updated)
    VALUES ($1, 0, 0, NOW())
    ON CONFLICT (project_id) DO UPDATE SET
      total_tests = COALESCE(test_statistics.total_tests, 0),
      total_likes = COALESCE(test_statistics.total_likes, 0),
      last_updated = NOW()
  `, [projectId]);
  
  console.log('✅ Test statistics added successfully');
}

// 主函数
async function main() {
  try {
    console.log('🚀 Starting Observation Ability Test setup...');
    
    // 检查数据库连接
    await query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // 在事务中执行所有操作
    await transaction(async (client) => {
      await addProject();
      await addQuestions();
      await addResultTypes();
      await addTestStatistics();
    });
    
    console.log('🎉 Observation Ability Test setup completed successfully!');
    
    // 显示添加的内容
    console.log('\n📊 Added Content Summary:');
    console.log(`- Project: ${observationTestData.name}`);
    console.log(`- Questions: ${questions.length}`);
    console.log(`- Result Types: ${resultTypesData.length}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main };
