console.log('🚀 Starting full introversion test creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 所有70道题目数据
const questions = [
    { question: "Do you usually feel physically healthy?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you think it's easy to introduce yourself to strangers at a dance?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Are you the type of person who works hard but is rather dull?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Are you careful and attentive with money?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you like to play pranks?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you react well when you become the victim of a prank?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you have a \"live for the moment\" attitude towards life?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you often worry about being fooled?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you like to stay at home in the evening?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you prefer playing the flute to playing the trumpet?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you get easily excited when watching sports games?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you often complain about people riding bicycles too recklessly?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Are you always in a hurry, regardless of whether you have time or not?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you tend to procrastinate?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you confide your troubles to your friends?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you cherish every day you have?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "When you go by train or plane, do you consider the possibility of traffic jams or other delays on the way?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "When on vacation, do you prefer lively places rather than the tranquility of the countryside?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Would you rather read a famous person's autobiography than meet them in person?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Are you versatile?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Can you make decisions quickly and decisively?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Are you often forgetful and careless?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you enjoy playing riddles?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you prefer writing letters to making phone calls?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you think you are more reserved and shy than most people?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Can you get dressed, make up and be ready to go within 15 minutes when you are invited at the last minute?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you think you can only focus on one thing at a time?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you remember the physical features of your acquaintances and friends very clearly?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Are you always eager to start implementing new plans?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "When with unfamiliar people, do you always observe and imitate others and act according to their expressions?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you always think carefully before acting?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you enjoy contact with the public and lively situations?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you sometimes interrupt others and take over the conversation?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you prefer slow, deep and inspiring music rather than intense music that makes you want to get up and dance?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you prefer the planning and design stage of a grand blueprint to its implementation?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you believe in preventive medicine and take preventive medications, thinking that people have an instinct for self-defense?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Can you concentrate highly?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Can you handle various emergencies that may occur at any time well?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Would you like to stay in bed the whole morning or even idle away the whole day?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do your friends say that you never relax or take a break?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you like to participate in demonstrations and street rallies?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Can you make decisions after weighing the pros and cons?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you find it difficult to record your true feelings in writing?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you think that others' thinking and behavior are very slow?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you take world issues seriously and care about them?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you actively initiate and organize activities in your circle?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you find it interesting to delve into the ins and outs of things and conduct thorough research?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you feel anxious and uneasy whenever you hear about natural disasters?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Even when doing something you really enjoy, do you sometimes feel unable to cope?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Are you easily angered and lose your temper?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you keep your promises?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Can you keep secrets for others?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you often arrive late?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Is \"Speed first, the faster the better\" your motto?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you laugh heartily easily?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Would you rather remain silent than express your disagreement and make others uncomfortable?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Are you usually reliable when you speak?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you always read small-print materials before signing a contract?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Even if it's still Monday, do you always look forward to tomorrow coming soon?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you easily get bored with the monotony of daily work?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you like to take unnecessary risks?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Have you seriously considered quitting the real world?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you like playing cards or other gambling activities?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you hate strangers touching you?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you think quiet time is beneficial and necessary for your mental health?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you tend to unconsciously immerse yourself in your own personal world?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you tend to use one type of cosmetic or facial cleanser?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you like dogs more than cats?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 },
    { question: "Do you agree with the saying \"A gold nest, a silver nest, can't beat my own straw nest\"?", option_a: "Yes", option_b: "No", score_a: -1, score_b: 1 },
    { question: "Do you like to fry eggs with only one side cooked and the yolk on top?", option_a: "Yes", option_b: "No", score_a: 1, score_b: -1 }
];

// 结果类型数据
const resultTypes = [
    {
        code: "VERY_INTROVERTED",
        name: "Very introverted",
        name_en: "Very introverted",
        description: "0-35分",
        description_en: "0-35 points",
        analysis: "## Very introverted\nYou are very introverted. Your close friends and family always give you a sense of security and protect you all the time. Therefore, you feel very comfortable and at ease in your own family environment and among your close friends. You may tend to avoid others, even those who are very close to you, and shut yourself in your own small world. Of course, you can do this, and you may even need to do so, as it is beneficial for you to have your own world and cultivate a unique self. However, you should understand that those who like you and love you want to listen to your difficulties and are always ready to help you, because you may have some negative emotions at any time. Keeping these negative emotions deep inside you and always swallowing your unhappiness is not good for you. It is always beneficial for you to confide your difficulties to kind-hearted people. There are always some people around you who are willing to approach you and are very willing to listen to you.\n\nYou belong to the type of people who are deeply contemplative, with thoughts that are quite profound. You are extremely concerned about the fate of humanity and global issues. Because of this, what you contribute to society is likely to far exceed your own estimation. Your meticulousness and focused emotions provide you with a powerful inner strength, which is worth remembering carefully, especially when you feel shy or are with people you think are smarter, more agile, or more noble than you, making you feel extremely depressed.\n\nBecause you are timid and shy, you may very much envy those who are talkative and charming, and you may want to imitate them. However, you should understand that you need to bring out the advantages of your inner calmness and steadiness, and use this characteristic to develop your personality. This is the best way for you to improve yourself. You would rather occasionally utter some profound clichés than speak rashly and talk freely. Such a lively personality is definitely not what you should have.",
        analysis_en: "## Very introverted\nYou are very introverted. Your close friends and family always give you a sense of security and protect you all the time. Therefore, you feel very comfortable and at ease in your own family environment and among your close friends. You may tend to avoid others, even those who are very close to you, and shut yourself in your own small world. Of course, you can do this, and you may even need to do so, as it is beneficial for you to have your own world and cultivate a unique self. However, you should understand that those who like you and love you want to listen to your difficulties and are always ready to help you, because you may have some negative emotions at any time. Keeping these negative emotions deep inside you and always swallowing your unhappiness is not good for you. It is always beneficial for you to confide your difficulties to kind-hearted people. There are always some people around you who are willing to approach you and are very willing to listen to you.\n\nYou belong to the type of people who are deeply contemplative, with thoughts that are quite profound. You are extremely concerned about the fate of humanity and global issues. Because of this, what you contribute to society is likely to far exceed your own estimation. Your meticulousness and focused emotions provide you with a powerful inner strength, which is worth remembering carefully, especially when you feel shy or are with people you think are smarter, more agile, or more noble than you, making you feel extremely depressed.\n\nBecause you are timid and shy, you may very much envy those who are talkative and charming, and you may want to imitate them. However, you should understand that you need to bring out the advantages of your inner calmness and steadiness, and use this characteristic to develop your personality. This is the best way for you to improve yourself. You would rather occasionally utter some profound clichés than speak rashly and talk freely. Such a lively personality is definitely not what you should have."
    },
    {
        code: "INTROVERTED",
        name: "Introverted",
        name_en: "Introverted",
        description: "36-69分",
        description_en: "36-69 points",
        analysis: "## Introverted\nYou enjoy reading books, flipping through newspapers and magazines, spending quiet evenings at home with your family or a few friends, and taking vacations in peaceful riverside areas or remote villages. You would never take any unnecessary risks and always believe that prevention is better than cure. You plan your life based on your preference for tranquility. You are a diligent and unexciting doer and think that to achieve your modest ambitions or aspirations, you need to make progress step by step.\n\nYou often feel very uncomfortable and at ease, because the noisy clubs are not set up for you, and going out for a noisy night with a girl or a boy is not for you either. You'd better try your best to avoid such occasions, otherwise, you will feel very embarrassed and even distressed. Instead, you can do many other things that suit you.\n\nYou may enjoy the type of work that both challenges your mind and makes you feel calm. However, don't be too isolated. For instance, if you still like listening to people debate, you might as well occasionally join in the discussion or argument.\n\nYou still worry a lot. If this is your nature, no one's advice will be of any use. Anyway, please remember that to solve the problems that arise, just thinking about them with your mind is not enough; you must also adopt other methods. Of course, you should carefully analyze all the details of the problem. But you might as well try to use your instinctive intuition. All kinds of methods will be effective. You may be able to compare the pros and cons, weigh the advantages and disadvantages, and distinguish right from wrong, or you may be able to make some decisive decisions driven by the power of your instincts.",
        analysis_en: "## Introverted\nYou enjoy reading books, flipping through newspapers and magazines, spending quiet evenings at home with your family or a few friends, and taking vacations in peaceful riverside areas or remote villages. You would never take any unnecessary risks and always believe that prevention is better than cure. You plan your life based on your preference for tranquility. You are a diligent and unexciting doer and think that to achieve your modest ambitions or aspirations, you need to make progress step by step.\n\nYou often feel very uncomfortable and at ease, because the noisy clubs are not set up for you, and going out for a noisy night with a girl or a boy is not for you either. You'd better try your best to avoid such occasions, otherwise, you will feel very embarrassed and even distressed. Instead, you can do many other things that suit you.\n\nYou may enjoy the type of work that both challenges your mind and makes you feel calm. However, don't be too isolated. For instance, if you still like listening to people debate, you might as well occasionally join in the discussion or argument.\n\nYou still worry a lot. If this is your nature, no one's advice will be of any use. Anyway, please remember that to solve the problems that arise, just thinking about them with your mind is not enough; you must also adopt other methods. Of course, you should carefully analyze all the details of the problem. But you might as well try to use your instinctive intuition. All kinds of methods will be effective. You may be able to compare the pros and cons, weigh the advantages and disadvantages, and distinguish right from wrong, or you may be able to make some decisive decisions driven by the power of your instincts."
    },
    {
        code: "EXTROVERTED",
        name: "Extroverted",
        name_en: "Extroverted",
        description: "70-104分",
        description_en: "70-104 points",
        analysis: "## Extroverted\nYou like to judge people by their appearance and also hope that others do the same. You probably love life very much and enjoy its pleasures to the fullest. You are very ambitious, but when it comes to seizing and taking advantage of various opportunities that come up on the road of life, you tend to be a bit timid. In public, you are at ease and talk freely. If you are at a competition, you will cheer for your team; in business, work and social activities, you like to compete with your opponents, and in this way, your natural vitality and enthusiasm will be fully and positively exerted.\n\nBoth in your work and in your spare time, your interests are too wide-ranging. You should pay attention to overcoming this habit, which is very necessary for you. Otherwise, your original versatility will eventually come to nothing and you will end up knowing a little about everything but being good at nothing. You should not have the idea that \"other people's industries are better\", and even less should you be driven by such an idea, which may cause the promising career in your hands to be abandoned halfway.\n\nYou need to constantly cultivate your patience. You may be able to control yourself and get rid of the habit of interrupting others, but limited self-control and abundant energy often force you to lose control. Do some deep breathing exercises frequently and take some time to meditate. How will you walk through this life journey? What is your life goal? If you add strong belief to your lively and eloquent nature, you will achieve success.\n\nPeople usually rely on you to do some organizational work, and you do it well indeed. However, meticulous work is not your forte. If you join a committee, you can definitely be a leader and hold a key position, but you should entrust the specific tasks that require carefulness to those who have strong analytical skills, are cautious and methodical. In many cases, you seem like a breath of fresh air to others, but it is very important that you do not lose the opportunity to listen to their opinions.",
        analysis_en: "## Extroverted\nYou like to judge people by their appearance and also hope that others do the same. You probably love life very much and enjoy its pleasures to the fullest. You are very ambitious, but when it comes to seizing and taking advantage of various opportunities that come up on the road of life, you tend to be a bit timid. In public, you are at ease and talk freely. If you are at a competition, you will cheer for your team; in business, work and social activities, you like to compete with your opponents, and in this way, your natural vitality and enthusiasm will be fully and positively exerted.\n\nBoth in your work and in your spare time, your interests are too wide-ranging. You should pay attention to overcoming this habit, which is very necessary for you. Otherwise, your original versatility will eventually come to nothing and you will end up knowing a little about everything but being good at nothing. You should not have the idea that \"other people's industries are better\", and even less should you be driven by such an idea, which may cause the promising career in your hands to be abandoned halfway.\n\nYou need to constantly cultivate your patience. You may be able to control yourself and get rid of the habit of interrupting others, but limited self-control and abundant energy often force you to lose control. Do some deep breathing exercises frequently and take some time to meditate. How will you walk through this life journey? What is your life goal? If you add strong belief to your lively and eloquent nature, you will achieve success.\n\nPeople usually rely on you to do some organizational work, and you do it well indeed. However, meticulous work is not your forte. If you join a committee, you can definitely be a leader and hold a key position, but you should entrust the specific tasks that require carefulness to those who have strong analytical skills, are cautious and methodical. In many cases, you seem like a breath of fresh air to others, but it is very important that you do not lose the opportunity to listen to their opinions."
    },
    {
        code: "VERY_EXTROVERTED",
        name: "Very extroverted",
        name_en: "Very extroverted",
        description: "105-140分",
        description_en: "105-140 points",
        analysis: "## Very extroverted\nIn your eyes, the world seems to be a vast playground exclusively designed for you. Your decisive and courageous actions often astonish people, and nothing and no one can stop you from moving forward. Your ambitions reach the sky, and of course, you are well aware of how to achieve them. If you go into business, your rivals will be defeated like a defeated army at your hands.\n\nFirst of all, you will most likely focus your main time and energy on winning, such as participating in football matches, competing with your chosen partner, and so on. You will regard all these as extremely important things to do. Due to your strong competitive spirit and unwavering belief, you must constantly remind yourself not to hurt others on your way to achieving your goals. You can easily do this with a little attention. Otherwise, you will be shocked when your opponents complain about you. It is unlikely that you can consciously forget all these influences. You will also spend a lot of time making many promises and explanations.\n\nYou possess many admirable and even enviable qualities. You are bold and courageous, passionate and generous. However, it is precisely because of your positivity and decisiveness that there will be some blanks in your life and you will lose many things. For instance, you simply cannot spare time to carefully ponder over some issues. It would be better for you to inspire more and better inspiration in terms of emotions and intellect. If you often calm down and reflect on your own psychology, your thoughts will become deeper and your personality will be a perfect whole. Therefore, try to think twice before you act!",
        analysis_en: "## Very extroverted\nIn your eyes, the world seems to be a vast playground exclusively designed for you. Your decisive and courageous actions often astonish people, and nothing and no one can stop you from moving forward. Your ambitions reach the sky, and of course, you are well aware of how to achieve them. If you go into business, your rivals will be defeated like a defeated army at your hands.\n\nFirst of all, you will most likely focus your main time and energy on winning, such as participating in football matches, competing with your chosen partner, and so on. You will regard all these as extremely important things to do. Due to your strong competitive spirit and unwavering belief, you must constantly remind yourself not to hurt others on your way to achieving your goals. You can easily do this with a little attention. Otherwise, you will be shocked when your opponents complain about you. It is unlikely that you can consciously forget all these influences. You will also spend a lot of time making many promises and explanations.\n\nYou possess many admirable and even enviable qualities. You are bold and courageous, passionate and generous. However, it is precisely because of your positivity and decisiveness that there will be some blanks in your life and you will lose many things. For instance, you simply cannot spare time to carefully ponder over some issues. It would be better for you to inspire more and better inspiration in terms of emotions and intellect. If you often calm down and reflect on your own psychology, your thoughts will become deeper and your personality will be a perfect whole. Therefore, try to think twice before you act!"
    }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 获取项目ID
    const projectResult = await client.query(
      "SELECT id FROM test_projects WHERE project_id = 'introversion_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found, please run simple-introversion-test.js first');
      return;
    }
    
    const projectId = projectResult.rows[0].id;
    console.log(`📊 Using project ID: ${projectId}`);
    
    // 删除现有的题目（如果有的话）
    await client.query('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE project_id = $1)', [projectId]);
    await client.query('DELETE FROM questions WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing questions');
    
    // 创建所有题目
    console.log('📝 Creating all 70 questions...');
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      // 创建题目
      const questionResult = await client.query(`
        INSERT INTO questions (project_id, question_number, question_text, question_text_en, question_type, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW()) 
        RETURNING id
      `, [
        projectId,
        i + 1,
        q.question,
        q.question,
        'single_choice'
      ]);
      
      const questionId = questionResult.rows[0].id;
      
      // 创建选项A
      await client.query(`
        INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [questionId, 1, q.option_a, q.option_a, q.score_a]);
      
      // 创建选项B
      await client.query(`
        INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [questionId, 2, q.option_b, q.option_b, q.score_b]);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1}/70 questions`);
      }
    }
    
    // 删除现有的结果类型
    await client.query('DELETE FROM result_types WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing result types');
    
    // 创建所有结果类型
    console.log('📝 Creating all 4 result types...');
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
    
    console.log('🎉 Full introversion test setup completed!');
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📝 Total questions: ${questions.length}`);
    console.log(`📋 Result types: ${resultTypes.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
