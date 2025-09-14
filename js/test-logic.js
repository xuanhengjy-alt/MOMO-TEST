// 题库与计分逻辑
const TestLogic = (function() {
  // DISC 5 questions - removed Chinese content, now using database
  const discQuestions = [];

  // DISC 评分映射：题i 选项j 计入 D I S C
  // 映射依据 PRD 表格（题1-5）：
  // 题1 D1 I3 S2 C4 -> [D,S,I,C]
  // 题2 D3 I2 S4 C1 -> [C,I,D,S]
  // 题3 D4 I3 S1 C2 -> [S,C,I,D]
  // 题4 D3 I1 S4 C2 -> [I,C,D,S]
  // 题5 D3 I1 S4 C2 -> [I,C,D,S]
  const discMap = [
    ['D','S','I','C'],
    ['C','I','D','S'],
    ['S','C','I','D'],
    ['I','C','D','S'],
    ['I','C','D','S']
  ];

  const discNames = { D: 'Dominance', I: 'Influence', S: 'Steadiness', C: 'Compliance' };
  // DISC analysis removed - now using backend database

  // Management test - removed Chinese content, now using database
  const mgmtQuestions = [];

  // 英文版管理能力测试 15题
  const mgmtEnQuestions = [
    { t:'Are you accustomed to making plans before taking action?', opts:['Yes','No'] },
    { t:'Do you often change your plans for the sake of efficiency?', opts:['Yes','No'] },
    { t:'Can you frequently collect various feedback from others?', opts:['Yes','No'] },
    { t:'Is achieving goals the continuation of problem-solving?', opts:['Yes','No'] },
    { t:'Do you think about and plan what you will do tomorrow before going to bed?', opts:['Yes','No'] },
    { t:'Are the connections and instructions for things always meticulous?', opts:['Yes','No'] },
    { t:'Do you have the habit of frequently recording your actions?', opts:['Yes','No'] },
    { t:'Can you strictly control your actions?', opts:['Yes','No'] },
    { t:'Can you act purposefully no matter where or when?', opts:['Yes','No'] },
    { t:'Can you often think of countermeasures and remove obstacles in achieving your goals?', opts:['Yes','No'] },
    { t:'Do you check your efficiency of the day\'s actions every day?', opts:['Yes','No'] },
    { t:'Do you often strictly compare your planned goals with actual achievements?', opts:['Yes','No'] },
    { t:'Are you very sensitive to the results of your work?', opts:['Yes','No'] },
    { t:'Do you never postpone today\'s pre-arranged work until tomorrow?', opts:['Yes','No'] },
    { t:'Are you accustomed to setting goals and making plans based on relevant information?', opts:['Yes','No'] }
  ];

  // 观察能力测试 15题
  const observationQuestions = [
    { t:'When entering a government office, you:', opts:['Notice the arrangement of desks and chairs','Pay attention to the exact position of the equipment','Observe what is hung on the wall'] },
    { t:'When you meet someone, you:', opts:['Only look at his face','Quietly take a look at him from head to toe','Only pay attention to certain parts of his face'] },
    { t:'What do you remember from the scenery you have seen?', opts:['The color tones','The sky','The feelings that emerged in your heart at that time'] },
    { t:'When you wake up in the morning, you:', opts:['Immediately remember what you should do','Remember what you dreamed about','Think about what happened yesterday'] },
    { t:'When you get on a bus, you:', opts:['Look at no one','See who is standing beside you','Talk to the person nearest to you'] },
    { t:'On the street, you:', opts:['Observe the passing vehicles','Observe the fronts of the houses','Observe the pedestrians'] },
    { t:'When you look at the shop window, you:', opts:['Only care about things that might be useful to you','Also look at things you don\'t need at the moment','Pay attention to everything'] },
    { t:'If you need to find something at home, you:', opts:['Focus your attention on the places where the thing might be.','Search everywhere.','Ask others for help.'] },
    { t:'When you see the past photos of your relatives and friends, you:', opts:['get excited','find them funny','try to figure out who everyone in the photos is'] },
    { t:'If someone suggests you take part in a gambling game you don\'t know how to play, you:', opts:['Try to learn how to play and aim to win.','Make an excuse that you\'ll play later and refuse.','Simply say you won\'t play.'] },
    { t:'You are waiting for someone in the park, so you:', opts:['Observe the people around you carefully','Read a newspaper','Think about something'] },
    { t:'On a starry night, you:', opts:['Try hard to observe constellations','Just gaze at the sky aimlessly','Look at nothing'] },
    { t:'When you put down the book you are reading, you always:', opts:['Mark where you left off with a pencil','Put a bookmark in it','Rely on your memory'] },
    { t:'What do you remember about your neighbor?', opts:['Name','Appearance','Nothing at all'] },
    { t:'At the well-set table:', opts:['Praise its beauty.','Check if everyone is present.','See if all the chairs are in the right places.'] }
  ];

  // DISC 40 英文题目（根据用户提供）
  const disc40Questions = [
    { t:'(1) Please select the option that feels most natural at first glance. If unsure, recall childhood experiences or consider how someone you know best would describe you.', opts:['Adventurous','Adaptable','Lively','Analytical'] },
    { t:'(2) Please select the option that feels most natural at first glance. If unsure, recall childhood experiences or consider how someone you know best would describe you.', opts:['Persistent','Playful','Persuasive','Calm'] },
    { t:'(3) Select the option that gives you the strongest first impression. If unsure, recall childhood experiences or consider how someone who knows you best might describe you.', opts:['Compliant','Self-sacrificing','Socially adept','Strong-willed'] },
    { t:'(4) Select the option that gives you the strongest first impression. If unsure, recall childhood experiences or consider how someone who knows you best might describe you.', opts:['Inspiring','Considerate','Competitive','Self-Controlled'] },
    { t:'(5) Please select based on your first impression. If unsure, recall childhood experiences or choose based on how someone who knows you best would describe you.', opts:['Energizing','Respectful','Adaptable','Reserved'] },
    { t:'(6) Select the option that comes to mind most quickly based on your first impression. If unsure, recall childhood experiences or consider how someone who knows you best might describe you.', opts:['Vibrant','Content','Sensitive','Self-reliant'] },
    { t:'(7) Select the option that gives you the strongest first impression. If unsure, recall childhood experiences or consider how someone who knows you best would describe you.', opts:['Planner','Patient','Proactive','Motivator'] },
    { t:'(8) Select the option that best reflects your first impression. If uncertain, recall childhood experiences or consider how someone who knows you well might describe you.', opts:['Assertive','Unrestrained','Shy','Time-oriented'] },
    { t:'(9) Please select the option that feels most natural at first glance. If unsure, recall childhood experiences or consider how someone you know best would describe you.', opts:['Accommodating','Organized','Frank','Optimistic'] },
    { t:'(10) Choose the option that feels most accurate at first glance. If unsure, recall childhood experiences or consider how those who know you best would describe you.', opts:['Controlling','Loyal','Entertaining','Friendly'] },
    { t:'(11) Select the option that feels most immediate upon first impression. If unsure, recall childhood experiences or consider how someone who knows you best would describe you.', opts:['Brave','Considerate','Detail-oriented','Charming'] },
    { t:'(12) Select the option that best reflects your first impression. If unsure, recall childhood experiences or consider how someone who knows you well might describe you.', opts:['Joyful','Cultured','Confident','Steadfast'] },
    { t:'(13) Select based on your first instinct. If unsure, recall childhood experiences or consider how someone who knows you best would describe you.', opts:['Idealistic','Independent','Non-confrontational','Motivating'] },
    { t:'(14) Choose the option that feels most accurate at first glance. If unsure, recall childhood experiences or consider how someone who knows you well might describe you.', opts:['Emotionally Expressive','Deep-thinking','Decisive','Humorous'] },
    { t:'(15) Please select the option that gives you the strongest first impression. If unsure, recall childhood experiences or choose based on how someone who knows you best would describe you.', opts:['Mediator','Musical','Initiator','Social Butterfly'] },
    { t:'(16) Select the option that best reflects your first impression. If uncertain, recall childhood experiences or consider how someone you know well might describe you.', opts:['Thoughtful','Persistent','Talkative','Tolerant'] },
    { t:'(17) Select the option that feels most accurate at first glance. If unsure, recall childhood experiences or consider how someone who knows you best might describe you.', opts:['Listener','Loyal','Leader','Energetic'] },
    { t:'(18) Please select the option that best reflects your first impression. If unsure, recall childhood experiences or consider how someone you know best describes you.', opts:['Contentment','Leader','Planner','Adorable'] },
    { t:'(19) Choose the option that feels most accurate at first glance. If unsure, recall childhood experiences or consider how someone who knows you best would describe you.', opts:['Perfectionist','Easygoing','Diligent','Popular'] },
    { t:'(20) Select the option that gives you the strongest first impression. If unsure, recall childhood experiences or choose based on how someone who knows you best would describe you.', opts:['Energetic','Fearless','Principled','Balanced'] },
    { t:'(21) Select the option that best captures your first impression. If uncertain, recall childhood experiences or consider how someone who knows you well might describe you.', opts:['Dull','Shy','Flashy','Bossy'] },
    { t:'(22) Please select based on your first instinct. If unsure, recall childhood experiences or choose based on how someone who knows you best would describe you.', opts:['Disorganized','Unempathetic','Lacking enthusiasm','Unforgiving'] },
    { t:'(23) Select the option that feels most accurate at first glance. If unsure, recall childhood experiences or consider how someone who knows you best might describe you.', opts:['Withholding','Resentful','Defiant','Repetitive'] },
    { t:'(24) Please select based on your first instinct. If unsure, recall childhood experiences or choose based on how someone you know best describes you.', opts:['Picky','Timid','Forgetful','Outspoken'] },
    { t:'(25) Choose the option that feels most accurate at first glance. If unsure, recall childhood experiences or consider how someone who knows you well might describe you.', opts:['Impatient','Insecure','Indecisive','Interruptive'] },
    { t:'(26) Select the option that gives you the strongest first impression. If unsure, recall childhood experiences or choose based on how someone who knows you best would describe you.', opts:['Unpopular','Uninvolved','Unpredictable','Lacking Empathy'] },
    { t:'(27) Please select the option that best reflects your first impression. If unsure, recall childhood experiences or consider how someone you know well might describe you.', opts:['Stubborn','Whimsical','Hard to please','Slow to Act'] },
    { t:'(28) Choose the option that comes to mind first. If unsure, recall childhood experiences or consider how someone who knows you well would describe you.', opts:['Unassuming','Pessimistic','Arrogant','Permissive'] },
    { t:'(29) Select the option that best reflects your first impression. If unsure, recall childhood experiences or choose based on how someone who knows you well would describe you.', opts:['Irritable','Aimless','Argumentative','Self-absorbed'] },
    { t:'(30) Please select based on your first instinct. If unsure, recall childhood experiences or consider how someone you know best would describe you.', opts:['Innocent','Pessimistic','Reckless','Indifferent'] },
    { t:'(31) Choose the option that comes to mind first. If unsure, recall childhood experiences or consider how someone who knows you well might describe you.', opts:['Worried','Unsociable','Workaholic','Seeks Approval'] },
    { t:'(32) Please select based on your first instinct. If unsure, recall childhood experiences or choose from descriptions provided by those who know you best.', opts:['Overly Sensitive','Lack of Tact','Timid','Verbose'] },
    { t:'(33) Choose the option that feels most accurate at first glance. If unsure, recall childhood experiences or consider how someone who knows you well might describe you.', opts:['Shy','Disorganized','Domineering','Depressed'] },
    { t:'(34) Select the option that best reflects your immediate first impression. If uncertain, recall childhood experiences or consider how someone who knows you best might describe you.', opts:['Lack of Perseverance','Introverted','Intolerant','Indifferent'] },
    { t:'(35) Choose the option that best reflects your first impression. If unsure, recall childhood experiences or consider how someone you know best would describe you.', opts:['Disorganized','Emotional','Mumbles','Manipulative'] },
    { t:'(36) Choose the option that feels most accurate at first glance. If unsure, recall childhood experiences or consider how someone who knows you best might describe you.', opts:['Slow','Stubborn','Attention-Seeking','Suspicious'] },
    { t:'(37) Choose based on your first instinct. If unsure, recall childhood experiences or select based on how someone who knows you best describes you.', opts:['Solitary','Dominant','Indolent','Loudmouth'] },
    { t:'(38) Choose the option that feels most accurate at first glance. If unsure, recall childhood experiences or consider how someone who knows you well might describe you.', opts:['Procrastinator','Suspicious','Irritable','Inattentive'] },
    { t:'(39) Select the option that best reflects your first impression. If unsure, recall childhood experiences or choose based on how someone who knows you well would describe you.', opts:['Vindictive','Restless','Reluctant','Impulsive'] },
    { t:'(40) Select the option that best reflects your immediate impression. If uncertain, recall childhood experiences or consider how someone who knows you well might describe you.', opts:['Compromising','Critical','Cunning','Fickle'] }
  ];

  // Unify DISC40 question stems as requested
  const disc40UnifiedStem = 'Please select the option that feels most natural at first glance. If unsure, recall childhood experiences or consider how someone you know best would describe you.';
  for (let i = 0; i < disc40Questions.length; i += 1) {
    disc40Questions[i] = { ...disc40Questions[i], t: `(${i+1}) ${disc40UnifiedStem}` };
  }

  // DISC 40 计分表（按题1-40，对应 D/I/S/C 的序号 1..4）
  const disc40Values = [
    [1,3,2,4],[3,2,4,1],[4,3,1,2],[3,1,4,2],[3,1,4,2],
    [4,1,2,3],[3,4,2,1],[1,2,3,4],[4,3,1,2],[1,3,4,2],
    [1,4,2,3],[3,1,4,2],[2,4,3,1],[3,1,4,2],[3,4,1,2],
    [2,3,4,1],[3,4,1,2],[2,4,1,3],[3,4,2,1],[2,1,4,3],
    [4,3,1,2],[2,1,3,4],[3,4,1,2],[4,3,2,1],[1,4,2,3],
    [4,3,2,1],[1,2,4,3],[3,4,1,2],[3,1,2,4],[3,1,4,2],
    [3,4,1,2],[2,4,3,1],[3,2,1,4],[3,1,4,2],[4,1,3,2],
    [2,3,1,4],[2,4,3,1],[3,4,1,2],[4,2,3,1],[3,4,1,2]
  ];

  // removed inline DISC English analysis source (now from backend)

  function scoreDisc(answers) { // answers: 0-based index per question
    const counts = { D:0, I:0, S:0, C:0 };
    answers.forEach((optIndex, qi) => {
      const type = discMap[qi][optIndex];
      counts[type] += 1;
    });
    const max = Math.max(counts.D, counts.I, counts.S, counts.C);
    const tops = Object.entries(counts).filter(([k,v]) => v === max).map(([k]) => k);
    const summary = tops.map(k => discNames[k]).join('、');
    // Frontend no longer provides DISC analysis; use backend response
    const analysis = '';
    return { counts, tops, summary, analysis };
  }

  // Chinese management scoring removed - now using backend

  function scoreMgmtEn(answers) { // answers: 0/1 (Yes=1, No=0)
    const total = answers.reduce((s,v) => s + (v === 0 ? 1 : 0), 0); // 选项索引0为"Yes"
    let summary = '';
    let type = '';
    if (total <= 5) {
      summary = 'Poor management ability';
      type = 'POOR';
    } else if (total <= 9) {
      summary = 'Below-average management ability';
      type = 'BELOW_AVERAGE';
    } else if (total <= 12) {
      summary = 'Average management ability';
      type = 'AVERAGE';
    } else if (total <= 14) {
      summary = 'Strong management ability';
      type = 'STRONG';
    } else {
      summary = 'Very strong management ability';
      type = 'VERY_STRONG';
    }
    return { total, summary, analysis: summary, type };
  }

  function scoreObservation(answers) { // answers: 0/1/2 (对应A/B/C选项)
    // 根据文档中的评分表计算总分
    const scoreMap = [
      [3, 10, 5],   // 题目1: A=3, B=10, C=5
      [5, 10, 3],   // 题目2: A=5, B=10, C=3
      [10, 5, 3],   // 题目3: A=10, B=5, C=3
      [10, 3, 5],   // 题目4: A=10, B=3, C=5
      [3, 5, 10],   // 题目5: A=3, B=5, C=10
      [5, 3, 10],   // 题目6: A=5, B=3, C=10
      [3, 5, 10],   // 题目7: A=3, B=5, C=10
      [10, 5, 3],   // 题目8: A=10, B=5, C=3
      [5, 3, 10],   // 题目9: A=5, B=3, C=10
      [10, 5, 3],   // 题目10: A=10, B=5, C=3
      [10, 5, 3],   // 题目11: A=10, B=5, C=3
      [10, 5, 3],   // 题目12: A=10, B=5, C=3
      [10, 5, 3],   // 题目13: A=10, B=5, C=3
      [10, 3, 5],   // 题目14: A=10, B=3, C=5
      [3, 10, 5]    // 题目15: A=3, B=10, C=5
    ];
    
    let total = 0;
    answers.forEach((answerIndex, questionIndex) => {
      if (scoreMap[questionIndex] && scoreMap[questionIndex][answerIndex] !== undefined) {
        total += scoreMap[questionIndex][answerIndex];
      }
    });
    
    let summary = '';
    let type = '';
    if (total >= 100) {
      summary = 'Outstanding observation skills';
      type = 'EXCELLENT';
    } else if (total >= 75) {
      summary = 'Quite acute observation abilities';
      type = 'GOOD';
    } else if (total >= 45) {
      summary = 'You Live on the Surface';
      type = 'AVERAGE';
    } else {
      summary = 'Immersers in Their Own Worlds';
      type = 'POOR';
    }
    
    return { total, summary, analysis: summary, type };
  }

  function scoreIntroversionExtraversion(answers) { // answers: 0/1 (对应A/B选项)
    // 基础分数70分，根据答案加减分数
    let total = 70;
    
    // 评分规则：根据文档中的答案统计表
    const scores = [
      1, 1, -1, -1, 1, 1, 1, -1, -1, -1,  // 题目1-10
      1, 1, 1, 1, 1, 1, -1, 1, -1, 1,      // 题目11-20
      1, 1, -1, -1, -1, 1, -1, 1, 1, -1,   // 题目21-30
      -1, 1, 1, -1, -1, -1, -1, 1, 1, 1,   // 题目31-40
      1, -1, 1, 1, -1, 1, -1, -1, -1, 1,   // 题目41-50
      1, -1, -1, 1, 1, -1, -1, -1, 1, 1,   // 题目51-60
      1, -1, 1, -1, -1, -1, -1, 1, -1, 1   // 题目61-70
    ];
    
    answers.forEach((answerIndex, questionIndex) => {
      if (scores[questionIndex] !== undefined) {
        // answerIndex 0 = Option A (+1), answerIndex 1 = Option B (-1)
        const score = answerIndex === 0 ? scores[questionIndex] : -scores[questionIndex];
        total += score;
      }
    });
    
    let summary = '';
    let type = '';
    if (total >= 105) {
      summary = 'Very extroverted';
      type = 'VERY_EXTROVERTED';
    } else if (total >= 70) {
      summary = 'Extroverted';
      type = 'EXTROVERTED';
    } else if (total >= 36) {
      summary = 'Introverted';
      type = 'INTROVERTED';
    } else {
      summary = 'Very introverted';
      type = 'VERY_INTROVERTED';
    }
    
    return { total, summary, analysis: summary, type };
  }

  // MBTI mapping loader with fallback
  let mbtiMapping = null;
  let mbtiDescriptions = null;
  async function loadMbtiMapping() {
    if (mbtiMapping) return mbtiMapping;
    try {
      const response = await fetch('/assets/data/mbti-mapping.json');
      if (response.ok) {
        mbtiMapping = await response.json();
        return mbtiMapping;
      }
    } catch (e) {
      console.warn('Failed to load MBTI mapping, using fallback');
    }
    // Fallback: generate from provided table
    mbtiMapping = {
      questions: [
        { "q": 1,  "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 2,  "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 3,  "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 4,  "axis": "E-I", "sideA": "E", "sideB": "I" },
        { "q": 5,  "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 6,  "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 7,  "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 8,  "axis": "E-I", "sideA": "E", "sideB": "I" },
        { "q": 9,  "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 10, "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 11, "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 12, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 13, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 14, "axis": "E-I", "sideA": "E", "sideB": "I" },
        { "q": 15, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 16, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 17, "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 18, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 19, "axis": "E-I", "sideA": "E", "sideB": "I" },
        { "q": 20, "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 21, "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 22, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 23, "axis": "E-I", "sideA": "E", "sideB": "I" },
        { "q": 24, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 25, "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 26, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 27, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 28, "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 29, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 30, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 31, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 32, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 33, "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 34, "axis": "E-I", "sideA": "E", "sideB": "I" },
        { "q": 35, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 36, "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 37, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 38, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 39, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 40, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 41, "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 42, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 43, "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 44, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 45, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 46, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 47, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 48, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 49, "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 50, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 51, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 52, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 53, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 54, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 55, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 56, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 57, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 58, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 59, "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 60, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 61, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 62, "axis": "E-I", "sideA": "E", "sideB": "I" },
        { "q": 63, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 64, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 65, "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 66, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 67, "axis": "E-I", "sideA": "E", "sideB": "I" },
        { "q": 68, "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 69, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 70, "axis": "J-P", "sideA": "J", "sideB": "P" },
        { "q": 71, "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 72, "axis": "E-I", "sideA": "I", "sideB": "E" },
        { "q": 73, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 74, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 75, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 76, "axis": "J-P", "sideA": "P", "sideB": "J" },
        { "q": 77, "axis": "E-I", "sideA": "E", "sideB": "I" },
        { "q": 78, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 79, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 80, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 81, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 82, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 83, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 84, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 85, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 86, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 87, "axis": "S-N", "sideA": "N", "sideB": "S" },
        { "q": 88, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 89, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 90, "axis": "S-N", "sideA": "S", "sideB": "N" },
        { "q": 91, "axis": "T-F", "sideA": "F", "sideB": "T" },
        { "q": 92, "axis": "T-F", "sideA": "T", "sideB": "F" },
        { "q": 93, "axis": "S-N", "sideA": "S", "sideB": "N" }
      ]
    };
    return mbtiMapping;
  }

  async function loadMbtiDescriptions() {
    if (mbtiDescriptions) return mbtiDescriptions;
    // file:// 场景：优先尝试页面内嵌脚本，避免 CORS
    try {
      if (typeof location !== 'undefined' && location.protocol === 'file:' && typeof document !== 'undefined') {
        const embedJson = document.getElementById('mbti-descriptions');
        if (embedJson && embedJson.textContent) {
          try {
            const obj = JSON.parse(embedJson.textContent);
            if (obj && obj.data) { mbtiDescriptions = obj; return mbtiDescriptions; }
          } catch (_) {}
        }
        const embedText = document.getElementById('mbti-descriptions-text');
        if (embedText && embedText.textContent) {
          const parsed = parseMbtiLongText(embedText.textContent);
          if (parsed) { mbtiDescriptions = { meta: { version: 1 }, data: parsed }; return mbtiDescriptions; }
        }
      }
    } catch(_) {}
    try {
      // 支持绝对与相对路径两种加载方式
      let res = await fetch('/assets/data/mbti-descriptions.json', { cache: 'no-store' });
      if (!res.ok) res = await fetch('assets/data/mbti-descriptions.json', { cache: 'no-store' });
      if (res && res.ok) {
        const raw = await res.text();
        // 尝试严格 JSON 解析
        try {
          mbtiDescriptions = JSON.parse(raw);
          return mbtiDescriptions;
        } catch (_) {
          // 若不是合法 JSON，尝试按长文格式解析
          const parsed = parseMbtiLongText(raw);
          if (parsed) {
            mbtiDescriptions = { meta: { version: 1 }, data: parsed };
            return mbtiDescriptions;
          }
        }
      }
      // 再尝试 .txt 版本
      let resTxt = await fetch('/assets/data/mbti-descriptions.txt', { cache: 'no-store' }).catch(()=>null);
      if (!resTxt || !resTxt.ok) resTxt = await fetch('assets/data/mbti-descriptions.txt', { cache: 'no-store' }).catch(()=>null);
      if (resTxt && resTxt.ok) {
        const txt = await resTxt.text();
        const parsed = parseMbtiLongText(txt);
        if (parsed) {
          mbtiDescriptions = { meta: { version: 1 }, data: parsed };
          return mbtiDescriptions;
        }
      }
    } catch (_) {
      // ignore and use fallback below
    }
    // Fallback 内置16型简版完整分析，确保 file:// 也可展示
    mbtiDescriptions = { meta: { version: 1 }, data: {
        ISTJ: "ISTJ (Introverted • Sensing • Thinking • Judging)\n\nSerious, reliable, structured, and pragmatic. Value facts and proven methods. Decide with logic; execute稳健且守时。\n\nStrengths: organization, detail, responsibility, persistence.\nWatchouts: rigidity, under-valuing others’ feelings, resisting change.\n\nFit: accounting, engineering, law, administration, operations.",
        ISFJ: "ISFJ (Introverted • Sensing • Feeling • Judging)\n\nQuiet, considerate, dependable, and caring. Remember meaningful details; provide实在的关照；维护秩序与传统。\n\nStrengths: loyalty, thoroughness, patience, service mindset.\nWatchouts: conflict avoidance, self-effacement, rigidity to routine.\n\nFit: education, healthcare, office admin, customer service.",
        INFJ: "INFJ (Introverted • iNtuitive • Feeling • Judging)\n\nInsightful idealist with values-driven determination. See patterns and long-term meaning; care深切并愿意引导。\n\nStrengths: vision, empathy, dedication, persuasive guidance.\nWatchouts: perfectionism, overextension, difficulty delegating.\n\nFit: education, counseling, writing, R&D, organizational development.",
        INTJ: "INTJ (Introverted • iNtuitive • Thinking • Judging)\n\nStrategic, independent, and decisive. 构建体系与长期方案；综合复杂信息并优化效率。\n\nStrengths: systems thinking, planning, focus, high standards.\nWatchouts: aloofness, impatience with ambiguity/inefficiency.\n\nFit: science, architecture, engineering, product/strategy.",
        ISTP: "ISTP (Introverted • Sensing • Thinking • Perceiving)\n\nCalm, analytical troubleshooter. Understand how things work;在压力下迅速定位问题并解决。\n\nStrengths: practicality, adaptability, hands‑on skill, crisis composure.\nWatchouts: detachment,短期导向、表达情感困难。\n\nFit: engineering, forensics, operations, field tech, entrepreneurship.",
        ISFP: "ISFP (Introverted • Sensing • Feeling • Perceiving)\n\nGentle, warm, authentic, and present-focused. 以行动关怀他人，追求个人与环境的和谐与美感。\n\nStrengths: empathy, flexibility, aesthetics, loyalty to values.\nWatchouts: 不善拒绝、过度自责、回避冲突。\n\nFit: design, healthcare support, arts, artisan crafts, service.",
        INFP: "INFP (Introverted • iNtuitive • Feeling • Perceiving)\n\nIdealistic, imaginative, values-driven. 寻找意义与可能性，促进自我与他人潜能发展。\n\nStrengths: creativity, empathy, inspiration, integrity.\nWatchouts: 犹豫不决、把完美置于行动之前。\n\nFit: counseling, writing, education, media, social impact.",
        INTP: "INTP (Introverted • iNtuitive • Thinking • Perceiving)\n\nTheoretical, logical, independent. 喜爱模型与框架；发现矛盾并重构思路。\n\nStrengths: deep analysis, innovation, problem modeling.\nWatchouts: 过度理论化、忽视落地细节与人际。\n\nFit: research, algorithms, architecture (systems), analysis.",
        ESTP: "ESTP (Extraverted • Sensing • Thinking • Perceiving)\n\nEnergetic, pragmatic, action‑oriented. 面向实时情境快速出手解决问题并享受挑战。\n\nStrengths: adaptability, realism, decisive action.\nWatchouts: 冒险、忽略准备与长期影响。\n\nFit: sales, trading, operations, emergency response, sports.",
        ESFP: "ESFP (Extraverted • Sensing • Feeling • Perceiving)\n\nFriendly, lively, people‑centered. 带来氛围、迅速回应他人需要、促进协作。\n\nStrengths: warmth, engagement, practicality.\nWatchouts: 过度社交/放松、回避复杂事。\n\nFit: events, hospitality, healthcare support, retail, performance.",
        ENFP: "ENFP (Extraverted • iNtuitive • Feeling • Perceiving)\n\nEnthusiastic, imaginative, inspiring. 连接人和点子，激发可能性与行动。\n\nStrengths: creativity, empathy, persuasion, vision.\nWatchouts: 分散、善始难终、忽视细节。\n\nFit: product evangelism, education, media/marketing, coaching.",
        ENTP: "ENTP (Extraverted • iNtuitive • Thinking • Perceiving)\n\nQuick, inventive, challenging. 发现机会、辩证推演、将概念转为策略。\n\nStrengths: ingenuity, flexibility, big‑picture problem solving.\nWatchouts: 好辩、忽视常规、缺少收尾。\n\nFit: entrepreneurship, strategy, consulting, innovation roles.",
        ESTJ: "ESTJ (Extraverted • Sensing • Thinking • Judging)\n\nPractical organizer and decisive executor. 设定标准、管理流程并确保结果。\n\nStrengths: structure, discipline, accountability.\nWatchouts: 刻板、低估情感因素。\n\nFit: operations, project/program management, administration.",
        ESFJ: "ESFJ (Extraverted • Sensing • Feeling • Judging)\n\nWarm, responsible, cooperative. 构建和谐、传递关怀并维护传统。\n\nStrengths: reliability, service, coordination.\nWatchouts: 取悦他人、回避冲突。\n\nFit: education, healthcare, HR, client service, community.",
        ENFJ: "ENFJ (Extraverted • iNtuitive • Feeling • Judging)\n\nEmpathic guide and organizer. 发展他人潜能、对齐团队并以价值观领导。\n\nStrengths: communication, facilitation, mentoring.\nWatchouts: 过度承担、对评价敏感。\n\nFit: leadership development, education, consulting, advocacy.",
        ENTJ: "ENTJ (Extraverted • iNtuitive • Thinking • Judging)\n\nStrategic leader and change driver. 设计系统、推进变革、设定宏大目标并落地。\n\nStrengths: vision, execution, decision.\nWatchouts: 急躁、忽视情感影响。\n\nFit: executive leadership, strategy, large‑scale programs."
      } };
    return mbtiDescriptions;
  }

  // 将 PRD/文本格式的 16 型长文解析为 { code: content }
  function parseMbtiLongText(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const text = raw.replace(/\r\n?/g, '\n');
    const codes = ['ISTJ','ISFJ','INFJ','INTJ','ISTP','ISFP','INFP','INTP','ESTP','ESFP','ENFP','ENTP','ESTJ','ESFJ','ENFJ','ENTJ'];
    const pattern = /(\n|^)(\d+、)?(ISTJ|ISFJ|INFJ|INTJ|ISTP|ISFP|INFP|INTP|ESTP|ESFP|ENFP|ENTP|ESTJ|ESFJ|ENFJ|ENTJ)\b([\s\S]*?)(?=(\n\d+、)?(ISTJ|ISFJ|INFJ|INTJ|ISTP|ISFP|INFP|INTP|ESTP|ESFP|ENFP|ENTP|ESTJ|ESFJ|ENFJ|ENTJ)\b|$)/g;
    const map = {};
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const code = m[3];
      const body = (m[4] || '').trim();
      if (codes.includes(code) && body.length > 0) map[code] = body;
    }
    return Object.keys(map).length ? map : null;
  }

  async function scoreMbti(answers) {
    const mapping = await loadMbtiMapping();
    const descriptions = await loadMbtiDescriptions();
    const traits = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
    
    answers.forEach((answer, index) => {
      const questionNum = index + 1;
      const question = mapping.questions.find(q => q.q === questionNum);
      if (question) {
        const trait = answer === 0 ? question.sideA : question.sideB;
        traits[trait] += 1;
      }
    });
    
    // Tie-breaking per spec: if E ≤ I take I else E; similarly S ≤ N -> N; T ≤ F -> F; J ≤ P -> P
    const ei = traits.E > traits.I ? 'E' : 'I';
    const sn = traits.S > traits.N ? 'S' : 'N';
    const tf = traits.T > traits.F ? 'T' : 'F';
    const jp = traits.J > traits.P ? 'J' : 'P';
    const code = `${ei}${sn}${tf}${jp}`;
    
    // 合成结果文案（若有详细文案文件则拼接展示）
    const head = `After testing, you are **${code}** personality type.`;
    const detailed = (descriptions && descriptions.data && descriptions.data[code]) ? `\n\n${descriptions.data[code]}` : '';
    return {
      summary: code,
      analysis: `${head}${detailed}`,
      traits,
      code
    };
  }

  // MBTI 93 English questions (two options each)
  const mbtiQuestions = [
    { t: '1. When you\'re going out all day, you will', opts: ['plans what you are going to do and when you are going to do it', 'just goes'] },
    { t: '2. You think you are one', opts: ['is more spontaneous', 'is more organized'] },
    { t: '3. If you were a teacher, you would choose to teach', opts: ['factual course', 'theoretical course'] },
    { t: '4. You usually', opts: ['is easy to get along with, while', 'is rather quiet or reserved'] },
    { t: '5. Generally speaking, who do you get along well with?', opts: ['Imaginative person', 'realistic person'] },
    { t: '6. Do you often let', opts: ['Your emotions dominate your reason', 'your reason dominates your emotions'] },
    { t: '7. You\'ll enjoy dealing with a lot of things', opts: ['act on impulse', 'act according to the plan'] },
    { t: '8. Are you?', opts: ['is easy to understand', 'is difficult to understand'] },
    { t: '9. Do things according to the schedule', opts: ['is to your liking', 'makes you feel bound'] },
    { t: '10. When you have a particular task, you\'ll enjoy it', opts: ['Carefully organize and plan before you start', 'find out what to do as you go along'] },
    { t: '11. In most cases, you will choose', opts: ['Go with the flow', 'do things according to the schedule'] },
    { t: '12. Most people would say you are one', opts: ['values personal privacy', 'is very candid and open'] },
    { t: '13. You\'d rather be regarded as one', opts: ['realistic person', 'smart person'] },
    { t: '14. In a large crowd, usually', opts: ['You introduce everyone', 'someone else introduces you'] },
    { t: '15. Who will you be friends with?', opts: ['always brings out new ideas', 'down-to-earth'] },
    { t: '16. You tend', opts: ['values emotion more than logic', 'values logic more than emotion'] },
    { t: '17. You prefer', opts: ['plans after watching things develop', 'plans very early'] },
    { t: '18. You like spending a lot of time', opts: ['Alone', 'with others'] },
    { t: '19. With a lot of people', opts: ['boosts your energy', 'often wears you out'] },
    { t: '20. You prefer', opts: ['arranges dates, social gatherings, etc. very early', 'is unrestrained and does whatever is fun at the time'] },
    { t: '21. When planning a trip, you prefer', opts: ['Most of the time you act according to how you feel that day', 'Know in advance what you\'ll do most of the day'] },
    { t: '22. At social gatherings, you', opts: ['sometimes feels depressed', 'often enjoys it'] },
    { t: '23. You usually', opts: ['tends to get along well with others, while', 'prefers to stay in a corner'] },
    { t: '24. Who will be more attractive to you?', opts: ['quick-witted and very intelligent person', 'A person who is honest and has a lot of common sense'] },
    { t: '25. In your daily work, you will', opts: ['is quite fond of dealing with emergencies that force you to race against time', 'usually plans ahead to avoid having to work under pressure'] },
    { t: '26. You think others are average', opts: ['takes a long time to get to know you', 'takes a short time to get to know you'] },
    { t: '27. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['values privacy', 'candid and open'] },
    { t: '28. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['is pre-arranged', 'is unplanned'] },
    { t: '29. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Abstract', 'Concrete'] },
    { t: '30. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['gentle', 'Firm'] },
    { t: '31. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['thinks', 'feels'] },
    { t: '32. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Fact', 'thought'] },
    { t: '33. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Impulse', 'Decision'] },
    { t: '34. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['is passionate', 'is quietness'] },
    { t: '35. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Quiet', 'Outgoing'] },
    { t: '36. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['has a system', 'is casual'] },
    { t: '37. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Theory', 'Affirmative'] },
    { t: '38. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Sensitive', 'Fair'] },
    { t: '39. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Convincing', 'Touching'] },
    { t: '40. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['declares', 'concept'] },
    { t: '41. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Unconstrained', 'Pre-arranged'] },
    { t: '42. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Reserved', 'talkative'] },
    { t: '43. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['is methodical', 'is casual'] },
    { t: '44. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Thought', 'Reality'] },
    { t: '45. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Compassion', 'Vision'] },
    { t: '46. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Benefit', 'Blessing'] },
    { t: '47. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['pragmatic', 'theoretical'] },
    { t: '48. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['doesn\'t have many friends', 'has many friends'] },
    { t: '49. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['is systematic', 'Improvisational'] },
    { t: '50. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Imaginative', 'matter-of-fact'] },
    { t: '51. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Kind', 'objective'] },
    { t: '52. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Objective', 'Passionate'] },
    { t: '53. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['builds', 'invent'] },
    { t: '54. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Quiet', 'Sociable'] },
    { t: '55. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Theory', 'Fact'] },
    { t: '56. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['is sympathetic', 'is logical'] },
    { t: '57. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['Analytical', 'Sentimental'] },
    { t: '58. Which of the following pairs of words is more to your liking? Regardless of form or pronunciation.', opts: ['makes sense', 'fascinates'] },
    { t: '59. When you are going to finish a big project in a week, you will at the beginning', opts: ['List the different tasks to be done one by one', 'Start working right away'] },
    { t: '60. In social situations, you often feel', opts: ['Have difficulty opening up and maintaining a conversation with certain people', 'Be able to have a long conversation with most people'] },
    { t: '61. Do what many people do, which you prefer', opts: ['Do it in the generally accepted way', 'Come up with an idea of your own'] },
    { t: '62. Can a friend you just met say what interests you have?', opts: ['Right away', 'Wait until they really get to know you'] },
    { t: '63. The subjects you usually prefer are', opts: ['Teach concepts and principles', 'Teach facts and data'] },
    { t: '64. Which is higher praise, or commendation?', opts: ['A person who is always sentimental', 'A person who is always rational'] },
    { t: '65. You think doing things according to the schedule', opts: ['Sometimes it is necessary, but generally you don\'t like to do it', 'Most of the time it\'s helpful and something you enjoy doing'] },
    { t: '66. When you\'re with a group of people, you usually choose', opts: ['Talk to a few people you know well', 'Join in a group conversation'] },
    { t: '67. At social gatherings, you will', opts: ['Be the one who talks a lot', 'Get others to talk more'] },
    { t: '68. The idea is to make a list of things to do over the weekend', opts: ['To your liking', 'Making you lose your energy'] },
    { t: '69. Which is higher praise, or commendation', opts: ['Capable', 'Compassionate'] },
    { t: '70. You usually like', opts: ['Schedule your social appointments in advance', 'Do things on a whim'] },
    { t: '71. In general, when it comes to doing a large assignment, you would choose', opts: ['Think about what to do as you do it', 'Break down the work step by step first'] },
    { t: '72. Can you talk non-stop with people', opts: ['Only those who share the same interests as you', 'Almost anyone can do it'] },
    { t: '73. You will', opts: ['Follow some proven effective methods', 'Analyze what else is wrong and what problems have not been solved yet'] },
    { t: '74. When you read for pleasure, you will', opts: ['Like peculiar or innovative expressions', 'Like the author\'s straightforwardness'] },
    { t: '75. Which kind of boss (or teacher) would you rather work for?', opts: ['is naturally kind, but often inconsistent', 'Sharp-tongued but always logical'] },
    { t: '76. Most of the time you do things', opts: ['Do things according to your mood for the day', 'do things according to the prepared schedule'] },
    { t: '77. Are you?', opts: ['can talk freely to anyone as needed', 'can only speak freely to certain people or in certain circumstances'] },
    { t: '78. When it comes to making decisions, what you think is more important is', opts: ['Measure by facts', 'consider the feelings and opinions of others'] },
    { t: '79. Which of the following pairs of words is more to your liking?', opts: ['Imagined', 'real'] },
    { t: '80. Which of the following pairs of words is more to your liking?', opts: ['Kind and generous', 'Determined'] },
    { t: '81. Which of the following pairs of words is more to your liking?', opts: ['is fair and', 'is caring'] },
    { t: '82. Which of the following pairs of words is more to your liking?', opts: ['makes', 'design'] },
    { t: '83. Which of the following pairs of words is more to your liking?', opts: ['possibility', 'necessity'] },
    { t: '84. Which of the following pairs of words is more to your liking?', opts: ['Gentle', 'Strength'] },
    { t: '85. Which of the following pairs of words is more to your liking?', opts: ['Actually', 'is sentimental'] },
    { t: '86. Which of the following pairs of words is more to your liking?', opts: ['makes', 'creates'] },
    { t: '87. Which of the following pairs of words is more to your liking?', opts: ['Novel', 'known'] },
    { t: '88. Which of the following pairs of words is more to your liking?', opts: ['sympathizes with', 'analysis'] },
    { t: '89. Which of the following pairs of words is more to your liking?', opts: ['stands firm', 'Gentle and loving'] },
    { t: '90. Which of the following pairs of words is more to your liking?', opts: ['concrete', 'Abstract'] },
    { t: '91. Which of the following pairs of words is more to your liking?', opts: ['fully committed', 'Determined'] },
    { t: '92. Which of the following pairs of words is more to your liking?', opts: ['Capable', 'Kind'] },
    { t: '93. Which of the following pairs of words is more to your liking?', opts: ['Actual', 'Innovation'] }
  ];

  return {
    getQuestions(type) {
      // All questions now come from database via API
      // Keep only English test types as fallback
      if (type === 'disc40') return disc40Questions.slice();
      if (type === 'mbti') return mbtiQuestions;
      if (type === 'mgmt_en') return mgmtEnQuestions;
      if (type === 'observation') return observationQuestions;
      return [];
    },
    async score(type, answers) {
      // All scoring now handled by backend API
      // Keep only English test types as fallback
      if (type === 'disc40') {
        // Convert 1..4 rank table to mapping for quick lookup
        const map = disc40Values.map(row => {
          const order = ['D','I','S','C'];
          const arr = [];
          // row: [D,I,S,C] ranks; we need index->type by option index 0..3
          // We pick the type whose rank equals (option+1)
          for (let opt = 1; opt <= 4; opt++) {
            const idx = row.findIndex(r => r === opt);
            arr.push(order[idx]);
          }
          return arr;
        });
        const counts = { D:0, I:0, S:0, C:0 };
        answers.forEach((optIndex, qi) => {
          const typeKey = (map[qi] || map[0])[optIndex];
          counts[typeKey] += 1;
        });
        const tops = Object.entries(counts).filter(([k,v]) => v > 10).map(([k]) => k);
        const names = { D: 'Dominance', I: 'Influence', S: 'Steadiness', C: 'Compliance' };
        const summary = tops.length ? tops.map(k => names[k]).join(', ') : 'No dominant traits';
        // Frontend no longer returns DISC40 analysis text; backend provides it
        const analysis = '';
        return { counts, tops, summary, analysis };
      }
      if (type === 'mbti') {
        return await scoreMbti(answers);
      }
      if (type === 'mgmt_en') return scoreMgmtEn(answers);
      if (type === 'observation') return scoreObservation(answers);
      if (type === 'introversion_extraversion') return scoreIntroversionExtraversion(answers);
      return { summary: 'Test type not supported', analysis: '' };
    }
  };
})();

window.TestLogic = TestLogic;


