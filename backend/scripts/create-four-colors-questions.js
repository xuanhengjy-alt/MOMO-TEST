console.log('🚀 Starting Four-colors questions creation...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 根据文档创建的30道题目数据
const questions = [
  {
    question: "Regarding my outlook on life, my inner self is actually:",
    options: [
      "I hope to have a wide variety of life experiences, so my thoughts are extremely diverse.",
      "Set goals carefully on a reasonable basis, and once set, stick to them with determination.",
      "Care more about achieving everything possible.",
      "No risk at all, preferring stability or status quo."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "If I go hiking, in most cases, on the route back down, I'm most likely to:",
    options: [
      "Fun and interesting, so I'd rather take a new route back to the nest.",
      "Safe and secure, so prefer the original route back.",
      "Challenging difficulties, so prefer a new route back to the nest.",
      "Convenient and worry-free, so prefer to return along the original route."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "When speaking, I value more:",
    options: [
      "Feel the effect. Sometimes it may seem a little exaggerated.",
      "Describe precisely. Sometimes it may skip the verbosity.",
      "Achieve the result. Sometimes it may be too direct to make others unhappy.",
      "Interpersonal feelings. Sometimes you may be reluctant to tell the truth."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "Most of the time, my heart desires more:",
    options: [
      "Excitement. Always come up with new ideas, do whatever you want, and enjoy being different.",
      "Safe. Keep a cool head and be less impulsive.",
      "Challenge. Competitions are everywhere in life, and there is a strong desire to \"win\".",
      "Stability. Be content with what you have and seldom envy others."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "I think my basic emotional traits are:",
    options: [
      "Mood swings frequently.",
      "Strong self-restraint on the outside, but with great emotional ups and downs inside, once hurt, it's hard to recover.",
      "Emotions are not dragging, but when unstable, they are prone to anger.",
      "Naturally calm emotions."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "I think that apart from work, in terms of my desire for control, I:",
    options: [
      "I have no desire to control, only the desire to influence others, but I'm not very good at self-control.",
      "Use rules to maintain my control over myself and my demands on others.",
      "I have a desire for control and a desire for others to obey me.",
      "I have no interest in influencing others and I don't want others to control me."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "When I'm in a relationship with a lover, I most hope that the other person:",
    options: [
      "Always praise me and make me happy. Be cared for and have a certain degree of freedom.",
      "Be able to understand my inner thoughts at any time and be extremely sensitive to my needs.",
      "Get the other person's approval that I'm right and that I'm valuable to them.",
      "Respect and get along quietly."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "In interpersonal relationships, I:",
    options: [
      "Essentially still think that socializing with people is more enjoyable than being alone for a long time.",
      "Entering very cautiously and slowly is often perceived as likely to be distant.",
      "Desire to take the lead in relationships.",
      "Go with the flow, be lukewarm and relatively passive."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "I do things often:",
    options: [
      "Lack of permanence, dislike doing the same thing for a long time without change.",
      "Lack of decisiveness, expecting the best outcome but always seeing the downside first.",
      "Lack of patience, sometimes acting too hastily.",
      "Lack of urgency, slow action, and difficulty in making decisions."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "The way I usually get things done is:",
    options: [
      "Always finish before the deadline, a master of last-minute cramming.",
      "Have a strict procedure of your own, do it precisely, and don't bother others.",
      "Do it first, do it quickly.",
      "Follow the traditional method step by step and get help from others when needed."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "If someone really annoys me, I:",
    options: [
      "Feeling hurt in my heart, thinking there's no possibility of forgiveness, but in the end, many times I still forgive the other person.",
      "Feeling so angry that how could it be forgotten? I will keep it in mind and avoid that guy completely in the future.",
      "Will be furious and expect to have a chance to respond hard.",
      "Avoid a showdown because it's not yet that point or you're looking for new friends on your own."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "In interpersonal relationships, what I care about most is:",
    options: [
      "To receive praise and welcome from others.",
      "To be understood and appreciated by others.",
      "Receive gratitude and respect from others.",
      "Be respected and accepted by others."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "At work, I show more of:",
    options: [
      "Passionate, full of ideas and very spiritual.",
      "Thoughtful, perfect and precise, and reliable.",
      "Strong and straightforward, and driven.",
      "Patient, adaptable and good at coordination."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "My former teachers' most likely assessment of me was:",
    options: [
      "High mood swings, good at expressing and pouring out emotions.",
      "Strictly protect your privacy and sometimes appear lonely or unsociable.",
      "Be agile and independent, and enjoy doing things on your own.",
      "Appears calm and relaxed, has a low reaction rate, and is relatively gentle."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "The most likely comments from friends about me are:",
    options: [
      "Enjoy talking to friends and have the power to influence others.",
      "Be able to ask a lot of comprehensive questions and require a lot of detailed explanations.",
      "Be willing to speak out and sometimes be straightforward and sharp about people you don't like.",
      "Usually be a listener along with others."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "When it comes to helping others, my inner thoughts are:",
    options: [
      "When someone comes to me, I'm not very likely to refuse and will do my best to help him.",
      "Those who deserve help should be helped.",
      "I seldom promise to help, but if I promise, I will keep it.",
      "Though I have no heroic spirit, I always have the spirit of volunteering."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "In the face of others' praise for myself, my heart:",
    options: [
      "It doesn't matter if I don't have it. I'm not particularly delighted.",
      "I don't need insignificant praise. I'd rather the other person appreciate my ability.",
      "Consider the authenticity of the other person or immediately avoid the attention of the crowd.",
      "Praise as much as possible is always pleasant."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "Facing life, I am more like:",
    options: [
      "Easy-going - I have nothing to do with the outside world. I think I'm fine this way.",
      "Actionist - If I don't progress, others will, so I have to keep moving forward.",
      "Analyst - Think of all possibilities before the problem occurs.",
      "Worry-free - The most important thing is to be happy every day."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "My inner attitude towards rules is:",
    options: [
      "Unwilling to violate the rules, but perhaps unable to meet the requirements of the rules because of being loose.",
      "Break the rules, hoping to make the rules yourself rather than follow them.",
      "Strictly follow the rules and do your best within them.",
      "Dislike being bound by the rules and find it fresh and fun not to play by the rules."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "I think my basic behavioral traits are:",
    options: [
      "Slow-paced, methodical, and in harmony with the people around.",
      "Have clear goals, focus on achieving them, and be good at grasping the core points.",
      "Be cautious and spare no effort to do a good job in prevention and aftermath.",
      "Rich and dynamic, disliking systems and constraints, inclined to react quickly."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "When I do something wrong, I tend to:",
    options: [
      "Be afraid but show it on the surface.",
      "Not admitting and refuting, but actually understanding in the heart.",
      "Guilt and pain tend to remain in self-repression.",
      "Feeling embarrassed and wanting to avoid criticism from others."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "When ending a deep relationship, I will:",
    options: [
      "It's hard, but life has to go on and time will dilute everything.",
      "Though I feel hurt, once I make up my mind, I will try to throw away the shadow of the past.",
      "Trapped in grief, unable to extricate oneself for a considerable period of time, and unwilling to accept new people.",
      "Heartbroken, need to talk to a friend or find a way to vent and seek a solution."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "In the face of others' confessions, I recall that most of the time I instinctively tend to:",
    options: [
      "Be able to identify with and understand the other person's feelings at that time.",
      "Make quick conclusions or judgments.",
      "Offer some analysis or reasoning to help the other person sort out their thoughts.",
      "May fluctuate with his mood, and may also make some comments or opinions."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "In which of the following groups do I feel more satisfied communicating?",
    options: [
      "Reaching a consensus calmly in a comfortable and relaxed atmosphere.",
      "Engage in intense debates with each other and gain something from them.",
      "Discuss in detail, meaningfully, the pros and cons of things and their implications.",
      "Chat happily and freely."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "In my true thoughts, I feel that work:",
    options: [
      "There's no need to be too much pressure. It's good to be able to do the work I'm familiar with.",
      "It should be done as quickly as possible, and strive to complete more tasks.",
      "Either don't do it or do it to the best of your ability.",
      "It would be great if you could incorporate fun into it, but it would be boring if you don't like the job."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "If I were a leader, I would rather be in the eyes of my subordinates that I am:",
    options: [
      "Approachable and considerate of them.",
      "Highly capable and leadership-oriented.",
      "Fair and trustworthy.",
      "Liked by them and found inspiring."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "My need for recognition is:",
    options: [
      "Life goes on whether others agree or not.",
      "The identity of the elite is the most important.",
      "As long as the people I care about identify with me, that's enough.",
      "How good it would be if all the people I meet, whether high or low, agree with me."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "When I was a child I:",
    options: [
      "Not very active in trying new things, usually preferring the old and the familiar.",
      "Is the leader of the kids, and people often listen to my decisions.",
      "Shy of strangers and consciously avoid them.",
      "Mischievous and lovely, optimistic and warm-hearted."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "If I were a parent, I might be:",
    options: [
      "Persuasive or forgiving.",
      "Rather stern. Impatient and decisive.",
      "Insisting on one's own ideas and being picky.",
      "Actively participating in playing with children and being warmly welcomed by the kids."
    ],
    scores: ['A', 'B', 'C', 'D']
  },
  {
    question: "Which of the following four sets of mottos fits me best as a whole?",
    options: [
      "The most profound truths are the simplest and most ordinary. To succeed in this world, one must be wise but appear foolish. A good temper is the best dress one can wear in social situations. Contentment is the greatest happiness in life.",
      "Go your own way and let others talk. Though the world is full of suffering, it can always be overcome. To achieve something is the only true pleasure in life. For me, solving a problem is as good as enjoying a vacation.",
      "A man who doesn't pay attention to small things will never succeed in a big undertaking. Reason is the noblest element of the soul. Avoid extravagance and ostentation. It's more incomplete than excessive. Caution is much more powerful than boldness.",
      "Happiness lies in the joy and passion for life. It is more important than anything else to be true to yourself at all times. Make life a fantasy, and then turn the fantasy into reality. Happiness is not about having money, but about the joy of achievement and the passion for creativity."
    ],
    scores: ['A', 'B', 'C', 'D']
  }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    
    // 获取项目ID
    const projectResult = await client.query(
      "SELECT id FROM test_projects WHERE project_id = 'four_colors_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found, please run create-four-colors-test.js first');
      return;
    }
    
    const projectId = projectResult.rows[0].id;
    console.log(`📊 Using project ID: ${projectId}`);
    
    // 删除现有的题目（如果有的话）
    await client.query('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE project_id = $1)', [projectId]);
    await client.query('DELETE FROM questions WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing questions');
    
    // 创建所有题目
    console.log('📝 Creating all 30 questions...');
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
      
      // 创建选项
      for (let j = 0; j < q.options.length; j++) {
        await client.query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [questionId, j + 1, q.options[j], q.options[j], 0]);
      }
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1}/30 questions`);
      }
    }
    
    console.log('🎉 Four-colors questions setup completed!');
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📝 Total questions: ${questions.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
