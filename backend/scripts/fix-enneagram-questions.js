console.log('🔧 Fixing Enneagram questions - adding missing question...');

const { Pool } = require('pg');

// 直接设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 根据文档重新创建完整的180道题目映射
const questionPersonalityMapping = [
  { question: "When I have difficulties, I try not to let others know.", personality: 1 },
  { question: "I don't want to be a person who likes to criticize, but it's hard to do.", personality: 1 },
  { question: "I like to be the protagonist and hope to get everyone's attention.", personality: 3 },
  { question: "Being misunderstood by others is a very painful thing for me.", personality: 4 },
  { question: "I like to study the principles and philosophies of the universe.", personality: 5 },
  { question: "I often imagine the worst outcome and make myself feel distressed.", personality: 6 },
  { question: "I like to present things in a relaxed and humorous way.", personality: 7 },
  { question: "I'm an easy-to-satisfy person, rarely feel worried, and am almost always calm.", personality: 9 },
  { question: "I'm good at standing up for myself and insisting on my needs.", personality: 8 },
  { question: "I often get frustrated and unhappy when things don't go as I expect.", personality: 1 },
  { question: "I need to have an important place in others' lives and I like others to need me.", personality: 2 },
  { question: "I'm a born salesman and it's easy for me to persuade others.", personality: 3 },
  { question: "I'm not good at group discussions or short conversations. I need a lot of private time and space.", personality: 5 },
  { question: "I have a near-obsessive nostalgia for the past.", personality: 4 },
  { question: "I often test or challenge the loyalty of my friends and partners.", personality: 6 },
  { question: "I'm good at planning but not at implementing.", personality: 7 },
  { question: "I like to be independent and do everything by myself.", personality: 8 },
  { question: "Physical comfort is very important to me.", personality: 9 },
  { question: "I'm always dissatisfied with what exists.", personality: 1 },
  { question: "I'm efficient in doing things and also like to take shortcuts. I have a strong ability to imitate.", personality: 3 },
  { question: "Many people feel very willing to approach me.", personality: 2 },
  { question: "I'm often attracted by symbolic things.", personality: 4 },
  { question: "When I feel embarrassed or am asked about my real feelings, my mind often goes blank.", personality: 5 },
  { question: "I find it hard to go against the opinions of those in power.", personality: 6 },
  { question: "I never have much doubt about others and their motives.", personality: 7 },
  { question: "I can admit my mistakes and correct them, but due to my stubbornness and competitiveness, people around me still feel pressured.", personality: 8 },
  { question: "I like to have time when I don't have to work at all.", personality: 9 },
  { question: "I get disappointed and angry when others fail to do their part.", personality: 1 },
  { question: "Not being able to help others makes me feel painful.", personality: 2 },
  { question: "I seem to have an instinct for planning and organizing work and can get it done smoothly.", personality: 3 },
  { question: "Many people lack the depth to understand my feelings.", personality: 4 },
  { question: "I hate seeming stupid and detest being regarded as such.", personality: 5 },
  { question: "I seem to enjoy life more than most people.", personality: 7 },
  { question: "Before making any decision, I always collect information from multiple sources to ensure it's accurate and sufficient.", personality: 6 },
  { question: "When I'm immersed in work or my area of expertise, others may think I'm cold and heartless.", personality: 8 },
  { question: "I'm an easy-going person and everything is negotiable.", personality: 9 },
  { question: "My facial expressions are serious and stiff.", personality: 1 },
  { question: "I like to rescue others from difficult or embarrassing situations.", personality: 2 },
  { question: "I'm used to promoting myself and have great confidence in my abilities.", personality: 3 },
  { question: "I think I'm very imperfect.", personality: 4 },
  { question: "I like to watch others do things from the side without participating myself.", personality: 5 },
  { question: "I need a long time to make a decision. Generally speaking, I like to act cautiously.", personality: 6 },
  { question: "There aren't many things in life that I can't appreciate.", personality: 7 },
  { question: "I yearn for positions of power and enjoy exercising authority.", personality: 8 },
  { question: "Even though there are individual differences, I still think most people are kind and good.", personality: 9 },
  { question: "I'm often critical of myself and expect to constantly improve my shortcomings to become a perfect person.", personality: 1 },
  { question: "I know how to make others like me.", personality: 2 },
  { question: "I'm outgoing, energetic, and like to constantly pursue achievements, which makes me feel very good about myself.", personality: 3 },
  { question: "Sometimes I appreciate my authority, and sometimes I'm indecisive and dependent on others.", personality: 6 },
  { question: "I like to keep things in order and have a refined taste, and I also attach great importance to my appearance.", personality: 4 },
  { question: "I often doubt whether I have enough courage to do what I should do.", personality: 5 },
  { question: "I have experienced very few painful and unpleasant things in my life.", personality: 7 },
  { question: "I am ambitious and enjoy challenges and the experience of reaching the peak.", personality: 8 },
  { question: "Generally speaking, I don't get overly involved in any one thing.", personality: 9 },
  { question: "I often ruin the whole thing because of a few details.", personality: 1 },
  { question: "I feel that helping others is my duty, and I will force myself to do so whether I like it or not.", personality: 2 },
  { question: "I like to know where I am in the progress of a task before I start.", personality: 3 },
  { question: "I don't like to imagine myself as an ordinary person. In many ways, I am different.", personality: 4 },
  { question: "I am quieter than others, and people often have to ask me what I'm thinking.", personality: 5 },
  { question: "I think it's hard to guide people without strict rules.", personality: 6 },
  { question: "I pay great attention to whether I am young because that is the capital for happiness.", personality: 7 },
  { question: "If someone around me behaves too outrageously, I will surely make them feel embarrassed.", personality: 8 },
  { question: "When others criticize me, I won't respond or defend myself because I don't want any disputes or conflicts.", personality: 9 },
  { question: "I can easily recognize the merits and benefits of others.", personality: 2 },
  { question: "I am always worried about what others do and, after criticizing them, I will do it myself.", personality: 1 },
  { question: "I like to use schedules, checklists or other indicators to show my progress in work.", personality: 3 },
  { question: "I often appear very melancholy, full of pain and introverted.", personality: 4 },
  { question: "When others ask me questions, I will analyze them in detail and clearly.", personality: 5 },
  { question: "I attach great importance to others' views on the principles I hold, whether they are in favor or against.", personality: 6 },
  { question: "Everything in my life appears in the best state.", personality: 7 },
  { question: "I am very proactive, even aggressive and self-assertive.", personality: 8 },
  { question: "I need external motivation or stimulation to keep working and taking action.", personality: 9 },
  { question: "I often criticize myself and others in my mind.", personality: 1 },
  { question: "I have often felt that others' reliance on me has become an unbearable burden.", personality: 2 },
  { question: "I often attract jealousy because I complete more work.", personality: 3 },
  { question: "My sorrows and pressures are often not noticed by others.", personality: 4 },
  { question: "I don't like it when people ask me broad and general questions.", personality: 5 },
  { question: "I think that before taking any action, it's better to get approval from someone in authority.", personality: 6 },
  { question: "I am an almost abnormal optimist, and \"ideals\" are more important to me than anything else.", personality: 7 },
  { question: "I like to follow routines and don't like changes.", personality: 9 },
  { question: "I strongly resist others interfering in my actions or imposing their actions on me.", personality: 8 },
  { question: "I seem not to understand humor and am not flexible.", personality: 1 },
  { question: "I don't feel that I have many needs and always think of myself last.", personality: 2 },
  { question: "I value presenting a successful image in front of others.", personality: 3 },
  { question: "When I first meet strangers, I tend to be cold and arrogant.", personality: 4 },
  { question: "I usually wait for others to approach me rather than approaching them myself.", personality: 5 },
  { question: "I am often troubled by doubts and am particularly alert and sensitive to existing contradictions.", personality: 6 },
  { question: "I hope others can take things more lightly.", personality: 7 },
  { question: "I find it difficult to show my gentler side, such as tenderness, acceptance and care.", personality: 8 },
  { question: "I can be regarded as the most impartial arbitrator because I think both sides in a dispute are equally good.", personality: 9 },
  { question: "I value doing things accurately and without mistakes.", personality: 1 },
  { question: "Sometimes I feel that others don't appreciate everything I do for them.", personality: 2 },
  { question: "To succeed, sometimes one needs to moderately adjust one's principles or standards.", personality: 3 },
  { question: "I'm very flighty and often don't know what I want in the next moment.", personality: 4 },
  { question: "I'm very tolerant and polite, but I don't have deep emotional interactions with people.", personality: 5 },
  { question: "I work purely for responsibility and duty.", personality: 6 },
  { question: "I often think about the bright side of things and don't look at the dark side of life.", personality: 7 },
  { question: "I usually choose the path with the least resistance when dealing with things.", personality: 9 },
  { question: "I will do my best to protect the people I love.", personality: 8 },
  { question: "I often feel like I'm racing against time, with many things that should be done still pending.", personality: 1 },
  { question: "Sometimes, I feel like a victim, as if everyone is taking advantage of me.", personality: 2 },
  { question: "I like to present a young and lively image.", personality: 3 },
  { question: "I seem to feel more deeply the distress when relationships end than others do.", personality: 4 },
  { question: "If I can't express myself perfectly, I'd rather not say anything.", personality: 5 },
  { question: "I have to ask questions about everything that's unclear to me. Ambiguity is the thing I can't stand the most.", personality: 6 },
  { question: "I think I'm a person with a childlike heart, able to share joy with others.", personality: 7 },
  { question: "I demand honesty and integrity, and I'm willing to conflict with others for it.", personality: 8 },
  { question: "I'm passive and indecisive.", personality: 9 },
  { question: "I'm warm and patient with people.", personality: 2 },
  { question: "I feel I must be responsible for every moment of mine.", personality: 1 },
  { question: "Whenever new things come up, I usually take the lead in the activity.", personality: 3 },
  { question: "I feel things deeply and am suspicious of those who are always happy.", personality: 4 },
  { question: "I'm very stingy with time, money and everything I have.", personality: 5 },
  { question: "When faced with threats, I either become anxious or confront the danger head-on.", personality: 6 },
  { question: "I like to \"depict\" things, to see where I've been and where I'm going.", personality: 7 },
  { question: "I have a strong sense of justice and sometimes support the underdog.", personality: 8 },
  { question: "I'm proud of my stable temperament.", personality: 9 },
  { question: "Every night, I carefully reflect on what I've done that day to see if everything was done properly.", personality: 1 },
  { question: "Helping others achieve happiness and success is an important accomplishment for me.", personality: 2 },
  { question: "I'm an active competitor and also very eager for others' appreciation.", personality: 3 },
  { question: "I often suffer from feeling abandoned and lonely.", personality: 4 },
  { question: "I care more about myself than anyone else and value how to protect myself and my position.", personality: 5 },
  { question: "I'm very sensitive to others' aggressive behavior and don't like being forced to do anything.", personality: 6 },
  { question: "I like a dramatic and colorful life.", personality: 7 },
  { question: "I think I'm an unrestricted and uncompromising person.", personality: 8 },
  { question: "I like to handle things in a low-key way, which also calms others down.", personality: 9 },
  { question: "Not only do I not say sweet words, but others also think I'm nagging.", personality: 1 },
  { question: "When I give, if others don't accept it willingly, I feel frustrated.", personality: 2 },
  { question: "I'm competitive and like to compare myself with others.", personality: 3 },
  { question: "I understand the sadness hidden behind a clown's smile and resonate with this fact.", personality: 4 },
  { question: "My voice is soft, and people often ask me to speak louder, which makes me angry.", personality: 5 },
  { question: "When I'm close to powerful people, on the one hand, I feel safe, but on the other hand, I'm afraid of them.", personality: 6 },
  { question: "I have a strong need for sensory stimulation, enjoying good food, clothing, physical touch, and indulging in pleasures.", personality: 7 },
  { question: "I can stick to my opinions, even when I'm at a disadvantage.", personality: 8 },
  { question: "I can't remember the last time I had a restless night.", personality: 9 },
  { question: "I'm a rule-follower, and order is very meaningful to me.", personality: 1 },
  { question: "I feel that many people rely on my help and generosity.", personality: 2 },
  { question: "I often deliberately keep myself excited. I have a strong creative talent and imagination, and I enjoy reorganizing things.", personality: 3 },
  { question: "I tend to make my own judgments and solve problems on my own.", personality: 5 },
  { question: "Sometimes I look forward to others' guidance, but sometimes I ignore their advice and just do what I want.", personality: 6 },
  { question: "I often find many things fun and interesting, and life is truly enjoyable.", personality: 7 },
  { question: "I think most events are unimportant. So why be so tense and let them control me?", personality: 9 },
  { question: "If I work according to my own plan, I will surely achieve better results than if I follow a plan arranged by others.", personality: 8 },
  { question: "\"Emotion\" is very important to me.", personality: 4 },
  { question: "I am extremely devoted to my work and identify with my role at work. Sometimes I even forget who I am.", personality: 3 },
  { question: "I pay attention to details but am not very efficient.", personality: 1 },
  { question: "I am very emotional, and my moods change frequently throughout the day.", personality: 4 },
  { question: "I keep what I have and also collect some materials that might be useful in the future.", personality: 5 },
  { question: "I am always alert.", personality: 6 },
  { question: "I don't like the feeling of having to fulfill obligations to others.", personality: 7 },
  { question: "I value the present and often feel a sense of urgency that now is the time to act.", personality: 8 },
  { question: "I don't require a lot of attention.", personality: 9 },
  { question: "I believe that if I want others to love and recognize me, I must be the best at everything.", personality: 1 },
  { question: "If I have a day off, I often don't know what to do for myself.", personality: 2 },
  { question: "Sometimes I sacrifice perfection and principles for efficiency.", personality: 3 },
  { question: "Art and artistic expressions are very important to me. They help me channel my emotions.", personality: 4 },
  { question: "I often fantasize about being a hero or belonging to an important class in some aspect.", personality: 5 },
  { question: "I often enter and exit quietly without being noticed by those around me.", personality: 6 },
  { question: "I usually avoid getting involved in serious issues most of the time.", personality: 9 },
  { question: "When a crisis occurs, I will step forward and take control of the situation.", personality: 8 },
  { question: "I can easily identify with what others do and know.", personality: 2 },
  { question: "I am used to suppressing my dissatisfaction with the outside world in my heart rather than expressing it.", personality: 1 },
  { question: "I think I deserve an important place in people's hearts because of all I have done.", personality: 2 },
  { question: "I think most people don't appreciate the inner beauty of life.", personality: 4 },
  { question: "I believe I must be successful in many aspects before others will notice me.", personality: 3 },
  { question: "When I feel I am in a situation where I can't do much, I often do nothing.", personality: 5 },
  { question: "When I evaluate others, I often base it on whether they pose a threat to me.", personality: 6 },
  { question: "My planned goals are usually higher than what I actually achieve.", personality: 7 },
  { question: "I tend to feel depressed and numb more than angry.", personality: 9 },
  { question: "I can easily detect deception and humiliation. When I realize I have been deceived, I get extremely angry.", personality: 8 },
  { question: "My perspective on things seems to be more about whether they are \"right or wrong\" or \"good or bad\".", personality: 1 },
  { question: "I think being able to nourish others makes me prouder than any job.", personality: 2 },
  { question: "I like to tell others what I do and what I know.", personality: 3 },
  { question: "I am not very interested in most social gatherings unless they involve people I know and like.", personality: 5 },
  { question: "I sometimes feel like an exiled noble.", personality: 4 },
  { question: "I am often worried about losing my freedom, so I don't like to make promises.", personality: 7 },
  { question: "I am a loyal friend and partner.", personality: 6 },
  { question: "I feel the need to express my dissatisfaction to others.", personality: 8 },
  { question: "I am gentle and calm, not boastful, and don't like to compete with others.", personality: 9 }
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to database');
    console.log(`📊 题目数量: ${questionPersonalityMapping.length}`);
    
    // 获取项目ID
    const projectResult = await client.query(
      "SELECT id FROM test_projects WHERE project_id = 'enneagram_en'"
    );
    
    if (projectResult.rows.length === 0) {
      console.log('❌ Project not found');
      return;
    }
    
    const projectId = projectResult.rows[0].id;
    console.log(`📊 Using project ID: ${projectId}`);
    
    // 删除现有的题目（如果有的话）
    await client.query('DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE project_id = $1)', [projectId]);
    await client.query('DELETE FROM questions WHERE project_id = $1', [projectId]);
    console.log('🗑️ Cleared existing questions');
    
    // 创建所有题目
    console.log('📝 Creating all 180 questions...');
    for (let i = 0; i < questionPersonalityMapping.length; i++) {
      const q = questionPersonalityMapping[i];
      
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
      
      // 创建选项A (对应人格类型+1分)
      await client.query(`
        INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [questionId, 1, "Yes", "Yes", q.personality]);
      
      // 创建选项B (不加分)
      await client.query(`
        INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [questionId, 2, "No", "No", 0]);
      
      // 创建选项C (不加分)
      await client.query(`
        INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at) 
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [questionId, 3, "I don't know", "I don't know", 0]);
      
      if ((i + 1) % 20 === 0) {
        console.log(`✅ Created ${i + 1}/180 questions`);
      }
    }
    
    console.log('🎉 Enneagram questions fix completed!');
    console.log(`📊 Project ID: ${projectId}`);
    console.log(`📝 Total questions: ${questionPersonalityMapping.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
