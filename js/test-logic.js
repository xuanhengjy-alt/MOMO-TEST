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

  function scoreEnneagram(answers) { // answers: 0/1/2 (对应A/B/C选项)
    // 九型人格评分：计算1-9号人格的分数
    const personalityScores = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 对应1-9号人格
    
    // 根据文档中的答案统计表，每道题选择Option A时对应人格+1分
    const personalityMapping = [
      2, 1, 3, 4, 5, 6, 7, 9, 8, 1,  // 题目1-10
      2, 3, 5, 4, 6, 7, 8, 9, 1, 3,  // 题目11-20
      2, 4, 5, 6, 7, 8, 9, 1, 2, 3,  // 题目21-30
      4, 5, 7, 6, 8, 9, 1, 2, 3, 6,  // 题目31-40
      4, 5, 6, 7, 8, 9, 1, 2, 3, 4,  // 题目41-50
      5, 6, 7, 8, 9, 1, 2, 3, 4, 5,  // 题目51-60
      6, 7, 8, 9, 1, 2, 3, 4, 5, 6,  // 题目61-70
      7, 8, 9, 1, 2, 3, 4, 5, 6, 7,  // 题目71-80
      8, 9, 1, 2, 3, 4, 5, 6, 7, 8,  // 题目81-90
      9, 1, 2, 3, 4, 5, 6, 7, 8, 9,  // 题目91-100
      1, 2, 3, 4, 5, 6, 7, 8, 9, 1,  // 题目101-110
      2, 3, 4, 5, 6, 7, 8, 9, 1, 2,  // 题目111-120
      3, 4, 5, 6, 7, 8, 9, 1, 2, 3,  // 题目121-130
      4, 5, 6, 7, 8, 9, 1, 2, 3, 4,  // 题目131-140
      5, 6, 7, 8, 9, 1, 2, 3, 4, 5,  // 题目141-150
      6, 7, 8, 9, 1, 2, 3, 4, 5, 6,  // 题目151-160
      7, 8, 9, 1, 2, 3, 4, 5, 6, 7,  // 题目161-170
      8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9   // 题目171-180
    ];
    
    answers.forEach((answerIndex, questionIndex) => {
      if (personalityMapping[questionIndex] && answerIndex === 0) { // 选择Option A
        const personalityType = personalityMapping[questionIndex] - 1; // 转换为数组索引
        personalityScores[personalityType]++;
      }
    });
    
    // 找到得分最高的人格类型
    const maxScore = Math.max(...personalityScores);
    const dominantTypes = [];
    
    for (let i = 0; i < personalityScores.length; i++) {
      if (personalityScores[i] === maxScore) {
        dominantTypes.push(i + 1);
      }
    }
    
    const typeNames = [
      'The Perfectionist',
      'The Helper, The Giver', 
      'The Achiever',
      'The Individualist, The Romantic',
      'The Investigator, The Thinker',
      'The Loyalist',
      'The Enthusiast, The Epicure',
      'The Challenger, The Leader',
      'The Peacemaker, The Mediator'
    ];
    
    let summary = '';
    if (dominantTypes.length === 1) {
      summary = `Type ${dominantTypes[0]}: ${typeNames[dominantTypes[0] - 1]}`;
    } else {
      summary = `Types ${dominantTypes.join(', ')}: ${dominantTypes.map(t => typeNames[t-1]).join(', ')}`;
    }
    
    return { 
      total: maxScore, 
      summary, 
      analysis: summary, 
      type: `TYPE_${dominantTypes[0]}`,
      personalityScores,
      dominantTypes
    };
  }

  function scoreEQTest(answers) { // answers: 0/1/2/3/4 (对应A/B/C/D/E选项)
    let total = 0;
    
    // 根据文档的评分规则
    for (let i = 0; i < answers.length; i++) {
      const answerIndex = answers[i];
      
      if (i < 9) { // 第1-9题
        if (answerIndex === 0) total += 6; // A选项
        else if (answerIndex === 1) total += 3; // B选项
        else if (answerIndex === 2) total += 0; // C选项
      } else if (i < 16) { // 第10-16题
        if (answerIndex === 0) total += 5; // A选项
        else if (answerIndex === 1) total += 2; // B选项
        else if (answerIndex === 2) total += 0; // C选项
      } else if (i < 25) { // 第17-25题
        if (answerIndex === 0) total += 5; // A选项
        else if (answerIndex === 1) total += 2; // B选项
        else if (answerIndex === 2) total += 0; // C选项
      } else if (i < 29) { // 第26-29题
        if (answerIndex === 0) total += 0; // A选项
        else if (answerIndex === 1) total += 5; // B选项
      } else { // 第30-33题
        if (answerIndex === 0) total += 1; // A选项
        else if (answerIndex === 1) total += 2; // B选项
        else if (answerIndex === 2) total += 3; // C选项
        else if (answerIndex === 3) total += 4; // D选项
        else if (answerIndex === 4) total += 5; // E选项
      }
    }
    
    let summary = '';
    let type = '';
    if (total >= 150) {
      summary = 'EQ Expert';
      type = 'EQ_EXPERT';
    } else if (total >= 130) {
      summary = 'High EQ';
      type = 'EQ_HIGH';
    } else if (total >= 90) {
      summary = 'Average EQ';
      type = 'EQ_AVERAGE';
    } else {
      summary = 'Low EQ';
      type = 'EQ_LOW';
    }
    
    return { 
      total, 
      summary, 
      analysis: summary, 
      type
    };
  }

  function scorePhilTest(answers) { // answers: 0/1/2/3/4/5/6 (对应A/B/C/D/E/F/G选项)
    let total = 0;
    
    // 根据文档的评分规则，每道题的得分对应关系
    const scores = [
      [2, 4, 6], // 第1题: a=2, b=4, c=6
      [6, 4, 7, 2, 1], // 第2题: a=6, b=4, c=7, d=2, e=1
      [4, 2, 5, 7, 6], // 第3题: a=4, b=2, c=5, d=7, e=6
      [4, 6, 2, 1], // 第4题: a=4, b=6, c=2, d=1
      [6, 4, 3, 5], // 第5题: a=6, b=4, c=3, d=5
      [6, 4, 2], // 第6题: a=6, b=4, c=2
      [6, 2, 4], // 第7题: a=6, b=2, c=4
      [6, 7, 5, 4, 3, 2, 1], // 第8题: a=6, b=7, c=5, d=4, e=3, f=2, g=1
      [7, 6, 4, 2, 1], // 第9题: a=7, b=6, c=4, d=2, e=1
      [4, 2, 3, 5, 6, 1] // 第10题: a=4, b=2, c=3, d=5, e=6, f=1
    ];
    
    // 计算总分
    for (let i = 0; i < answers.length && i < scores.length; i++) {
      const answerIndex = answers[i];
      if (answerIndex >= 0 && answerIndex < scores[i].length) {
        total += scores[i][answerIndex];
      }
    }
    
    let summary = '';
    let type = '';
    if (total < 21) {
      summary = 'Introverted Pessimist';
      type = 'PHIL_PESSIMIST';
    } else if (total >= 21 && total <= 30) {
      summary = 'Confidence-Lacking Critic';
      type = 'PHIL_CRITIC';
    } else if (total >= 31 && total <= 40) {
      summary = 'Retaliatory Self-Protector';
      type = 'PHIL_PROTECTOR';
    } else if (total >= 41 && total <= 50) {
      summary = 'Balanced Moderate';
      type = 'PHIL_MODERATE';
    } else if (total >= 51 && total <= 60) {
      summary = 'Attractive Adventurer';
      type = 'PHIL_ADVENTURER';
    } else {
      summary = 'Arrogant Solitary';
      type = 'PHIL_SOLITARY';
    }
    
    return { 
      total, 
      summary, 
      analysis: summary, 
      type
    };
  }

  function scoreFourColors(answers) { // frontend disabled for four_colors; backend authoritative
    return {
      total: 0,
      summary: '',
      analysis: '',
      type: '',
      counts: { red: 0, blue: 0, yellow: 0, green: 0 }
    };
  }

  function scorePDPTest(answers) { // answers: 0/1/2/3/4 (对应A/B/C/D/E选项)
    let total = 0;
    
    // 根据文档的评分规则，计算每种类型的分数
    let tigerScore = 0;    // 第5、10、14、18、24、30题
    let peacockScore = 0;  // 第3、6、13、20、22、29题
    let koalaScore = 0;    // 第2、8、15、17、25、28题
    let owlScore = 0;      // 第1、7、11、16、21、26题
    let chameleonScore = 0; // 第4、9、12、19、23、27题
    
    // 题目索引映射（从0开始）
    const tigerQuestions = [4, 9, 13, 17, 23, 29];      // 第5、10、14、18、24、30题
    const peacockQuestions = [2, 5, 12, 19, 21, 28];    // 第3、6、13、20、22、29题
    const koalaQuestions = [1, 7, 14, 16, 24, 27];      // 第2、8、15、17、25、28题
    const owlQuestions = [0, 6, 10, 15, 20, 25];        // 第1、7、11、16、21、26题
    const chameleonQuestions = [3, 8, 11, 18, 22, 26];  // 第4、9、12、19、23、27题
    
    // 计算每种类型的分数
    tigerQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        const score = [5, 4, 3, 2, 1][answers[qIndex]] || 0;
        tigerScore += score;
      }
    });
    
    peacockQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        const score = [5, 4, 3, 2, 1][answers[qIndex]] || 0;
        peacockScore += score;
      }
    });
    
    koalaQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        const score = [5, 4, 3, 2, 1][answers[qIndex]] || 0;
        koalaScore += score;
      }
    });
    
    owlQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        const score = [5, 4, 3, 2, 1][answers[qIndex]] || 0;
        owlScore += score;
      }
    });
    
    chameleonQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        const score = [5, 4, 3, 2, 1][answers[qIndex]] || 0;
        chameleonScore += score;
      }
    });
    
    // 找出最高分数
    const scores = [
      { type: 'TIGER', score: tigerScore },
      { type: 'PEACOCK', score: peacockScore },
      { type: 'KOALA', score: koalaScore },
      { type: 'OWL', score: owlScore },
      { type: 'CHAMELEON', score: chameleonScore }
    ];
    
    const maxScore = Math.max(...scores.map(s => s.score));
    const dominantTypes = scores.filter(s => s.score === maxScore);
    
    let summary = '';
    let type = '';
    
    if (dominantTypes.length === 1) {
      const dominant = dominantTypes[0];
      if (dominant.type === 'TIGER') {
        summary = 'Tiger type (Dominance)';
        type = 'TIGER_TYPE';
      } else if (dominant.type === 'PEACOCK') {
        summary = 'Peacock type (Extroversion)';
        type = 'PEACOCK_TYPE';
      } else if (dominant.type === 'KOALA') {
        summary = 'Koala type (Pace/Patience)';
        type = 'KOALA_TYPE';
      } else if (dominant.type === 'OWL') {
        summary = 'Owl type (Conformity)';
        type = 'OWL_TYPE';
      } else if (dominant.type === 'CHAMELEON') {
        summary = 'Chameleon type (1/2 Sigma)';
        type = 'CHAMELEON_TYPE';
      }
    } else {
      // 多个类型并列最高
      const typeNames = dominantTypes.map(t => {
        if (t.type === 'TIGER') return 'Tiger';
        else if (t.type === 'PEACOCK') return 'Peacock';
        else if (t.type === 'KOALA') return 'Koala';
        else if (t.type === 'OWL') return 'Owl';
        else if (t.type === 'CHAMELEON') return 'Chameleon';
      });
      summary = `${typeNames.join(', ')} type`;
      type = dominantTypes[0].type + '_TYPE';
    }
    
    return { 
      total: maxScore, 
      summary, 
      analysis: summary, 
      type,
      scores: {
        tiger: tigerScore,
        peacock: peacockScore,
        koala: koalaScore,
        owl: owlScore,
        chameleon: chameleonScore
      }
    };
  }

  function scoreMentalAgeTest(answers) { // answers: 0/1/2 (对应a/b/c选项)
    let total = 0;
    
    // 根据文档的答案统计表计算总分
    const scores = [1, 3, 5]; // a=1分, b=3分, c=5分
    
    for (let i = 0; i < answers.length; i++) {
      const answerIndex = answers[i];
      if (answerIndex >= 0 && answerIndex < scores.length) {
        total += scores[answerIndex];
      }
    }
    
    // 根据总分判定心理年龄阶段
    let summary = '';
    let type = '';
    
    if (total >= 20 && total <= 45) {
      summary = 'Child Stage';
      type = 'CHILD_STAGE';
    } else if (total >= 46 && total <= 75) {
      summary = 'Adolescent Stage';
      type = 'ADOLESCENT_STAGE';
    } else if (total >= 76 && total <= 100) {
      summary = 'Highly Mature';
      type = 'MATURE_STAGE';
    } else {
      // 处理边界情况
      if (total < 20) {
        summary = 'Child Stage';
        type = 'CHILD_STAGE';
      } else if (total > 100) {
        summary = 'Highly Mature';
        type = 'MATURE_STAGE';
      }
    }
    
    return { 
      total, 
      summary, 
      analysis: summary, 
      type
    };
  }

  function scoreHollandTest(answers) { // answers: 0/1 (对应Yes/No选项)
    // 根据文档的答案统计表，计算六种类型的分数
    let realisticScore = 0;    // 现实型：第1,7,13,19,25,31,37,43,49,55,61,67,73,79,85题
    let investigativeScore = 0; // 研究型：第2,8,14,20,26,32,38,44,50,56,62,68,74,80,86题
    let artisticScore = 0;     // 艺术型：第3,9,15,21,27,33,39,45,51,57,63,69,75,81,87题
    let socialScore = 0;       // 社会型：第4,10,16,22,28,34,40,46,52,58,64,70,76,82,88题
    let enterprisingScore = 0; // 企业型：第5,11,17,23,29,35,41,47,53,59,65,71,77,83,89题
    let conventionalScore = 0; // 常规型：第6,12,18,24,30,36,42,48,54,60,66,72,78,84,90题
    
    // 题目索引映射（从0开始）
    const realisticQuestions = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84];      // 第1,7,13,19,25,31,37,43,49,55,61,67,73,79,85题
    const investigativeQuestions = [1, 7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73, 79, 85];  // 第2,8,14,20,26,32,38,44,50,56,62,68,74,80,86题
    const artisticQuestions = [2, 8, 14, 20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80, 86];       // 第3,9,15,21,27,33,39,45,51,57,63,69,75,81,87题
    const socialQuestions = [3, 9, 15, 21, 27, 33, 39, 45, 51, 57, 63, 69, 75, 81, 87];         // 第4,10,16,22,28,34,40,46,52,58,64,70,76,82,88题
    const enterprisingQuestions = [4, 10, 16, 22, 28, 34, 40, 46, 52, 58, 64, 70, 76, 82, 88];  // 第5,11,17,23,29,35,41,47,53,59,65,71,77,83,89题
    const conventionalQuestions = [5, 11, 17, 23, 29, 35, 41, 47, 53, 59, 65, 71, 77, 83, 89];  // 第6,12,18,24,30,36,42,48,54,60,66,72,78,84,90题
    
    // 计算每种类型的分数（选Yes得1分，选No得0分）
    realisticQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        realisticScore += answers[qIndex]; // 0=No, 1=Yes
      }
    });
    
    investigativeQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        investigativeScore += answers[qIndex];
      }
    });
    
    artisticQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        artisticScore += answers[qIndex];
      }
    });
    
    socialQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        socialScore += answers[qIndex];
      }
    });
    
    enterprisingQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        enterprisingScore += answers[qIndex];
      }
    });
    
    conventionalQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        conventionalScore += answers[qIndex];
      }
    });
    
    // 找出最高分数
    const scores = [
      { type: 'REALISTIC', score: realisticScore },
      { type: 'INVESTIGATIVE', score: investigativeScore },
      { type: 'ARTISTIC', score: artisticScore },
      { type: 'SOCIAL', score: socialScore },
      { type: 'ENTERPRISING', score: enterprisingScore },
      { type: 'CONVENTIONAL', score: conventionalScore }
    ];
    
    const maxScore = Math.max(...scores.map(s => s.score));
    const dominantTypes = scores.filter(s => s.score === maxScore);
    
    let summary = '';
    let type = '';
    
    if (dominantTypes.length === 1) {
      const dominant = dominantTypes[0];
      if (dominant.type === 'REALISTIC') {
        summary = 'Realistic';
        type = 'REALISTIC';
      } else if (dominant.type === 'INVESTIGATIVE') {
        summary = 'Investigative';
        type = 'INVESTIGATIVE';
      } else if (dominant.type === 'ARTISTIC') {
        summary = 'Artistic';
        type = 'ARTISTIC';
      } else if (dominant.type === 'SOCIAL') {
        summary = 'Social';
        type = 'SOCIAL';
      } else if (dominant.type === 'ENTERPRISING') {
        summary = 'Enterprising';
        type = 'ENTERPRISING';
      } else if (dominant.type === 'CONVENTIONAL') {
        summary = 'Conventional';
        type = 'CONVENTIONAL';
      }
    } else {
      // 多个类型并列最高
      const typeNames = dominantTypes.map(t => {
        if (t.type === 'REALISTIC') return 'Realistic';
        else if (t.type === 'INVESTIGATIVE') return 'Investigative';
        else if (t.type === 'ARTISTIC') return 'Artistic';
        else if (t.type === 'SOCIAL') return 'Social';
        else if (t.type === 'ENTERPRISING') return 'Enterprising';
        else if (t.type === 'CONVENTIONAL') return 'Conventional';
      });
      summary = `${typeNames.join(', ')}`;
      type = dominantTypes[0].type;
    }
    
    return { 
      total: maxScore, 
      summary, 
      analysis: summary, 
      type,
      scores: {
        realistic: realisticScore,
        investigative: investigativeScore,
        artistic: artisticScore,
        social: socialScore,
        enterprising: enterprisingScore,
        conventional: conventionalScore
      }
    };
  }

  function scoreKelseyTest(answers) { // answers: 0/1 (对应A/B选项)
    // 根据正确的评分规则，计算E/I、S/N、T/F、J/P分数
    let eScore = 0, iScore = 0;
    let sScore = 0, nScore = 0;
    let tScore = 0, fScore = 0;
    let jScore = 0, pScore = 0;
    
    // 正确的题目类型映射（从0开始）
    // 1、8、15、22、29、36、43、50、57、64题，选A则E+1分，选B则I+1分
    const eQuestions = [0, 7, 14, 21, 28, 35, 42, 49, 56, 63];
    
    // 2、9、16、23、30、37、44、51、58、65、3、10、17、24、31、38、45、52、59、66题，选A则S+1分，选B则N+1分
    const sQuestions = [1, 8, 15, 22, 29, 36, 43, 50, 57, 64, 2, 9, 16, 23, 30, 37, 44, 51, 58, 65];
    
    // 4、11、18、25、32、39、46、53、60、67、5、12、19、26、33、40、47、54、61、68题，选A则T+1分，选B则F+1分
    const tQuestions = [3, 10, 17, 24, 31, 38, 45, 52, 59, 66, 4, 11, 18, 25, 32, 39, 46, 53, 60, 67];
    
    // 6、13、20、27、34、41、48、55、62、69、7、14、21、28、35、42、49、56、63、70题，选A则J+1分，选B则P+1分
    const jQuestions = [5, 12, 19, 26, 33, 40, 47, 54, 61, 68, 6, 13, 20, 27, 34, 41, 48, 55, 62, 69];
    
    // 计算E/I分数
    eQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        if (answers[qIndex] === 0) eScore++; // A选项得1分
        else iScore++; // B选项得1分
      }
    });
    
    // 计算S/N分数
    sQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        if (answers[qIndex] === 0) sScore++; // A选项得1分
        else nScore++; // B选项得1分
      }
    });
    
    // 计算T/F分数
    tQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        if (answers[qIndex] === 0) tScore++; // A选项得1分
        else fScore++; // B选项得1分
      }
    });
    
    // 计算J/P分数
    jQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        if (answers[qIndex] === 0) jScore++; // A选项得1分
        else pScore++; // B选项得1分
      }
    });
    
    // 根据文档的判定规则确定最终类型
    const eOrI = eScore >= iScore ? 'E' : 'I';
    const sOrN = sScore >= nScore ? 'S' : 'N';
    const tOrF = tScore >= fScore ? 'T' : 'F';
    const jOrP = jScore >= pScore ? 'J' : 'P';
    
    const typeCode = eOrI + sOrN + tOrF + jOrP;
    
    // 根据类型代码确定名称
    const typeNames = {
      'ESTP': 'Entrepreneur',
      'ISTP': 'Artisan',
      'ESFP': 'Performer',
      'ISFP': 'Creator',
      'ESTJ': 'Supervisor',
      'ISTJ': 'Inspector',
      'ESFJ': 'Provider',
      'ISFJ': 'Protector',
      'ENFJ': 'Leader',
      'INFJ': 'Adviser',
      'ENFP': 'Striver',
      'INFP': 'Conciliator',
      'ENTJ': 'Field Marshal',
      'INTJ': 'Strategist',
      'ENTP': 'Inventor',
      'INTP': 'Architect'
    };
    
    const typeName = typeNames[typeCode] || typeCode;
    
    return { 
      total: Math.max(eScore, iScore) + Math.max(sScore, nScore) + Math.max(tScore, fScore) + Math.max(jScore, pScore), 
      summary: typeName, 
      analysis: typeName, 
      type: typeCode,
      scores: {
        e: eScore,
        i: iScore,
        s: sScore,
        n: nScore,
        t: tScore,
        f: fScore,
        j: jScore,
        p: pScore
      }
    };
  }

  function scoreTemperamentTypeTest(answers) { // answers: 0/1/2/3/4 (对应A/B/C/D/E选项)
    // 根据文档的评分规则，计算四种气质类型的分数
    let cholericScore = 0;    // 胆汁质：第2,6,9,14,17,21,27,31,36,38,42,48,50,54,58题
    let sanguineScore = 0;    // 多血质：第4,8,11,16,19,23,25,29,34,40,44,46,52,56,60题
    let phlegmaticScore = 0;  // 黏液质：第1,7,10,13,18,22,26,30,33,39,43,45,49,55,57题
    let melancholicScore = 0; // 抑郁质：第3,5,12,15,20,24,28,32,35,37,41,47,51,53,59题
    
    // 题目索引映射（从0开始）
    const cholericQuestions = [1, 5, 8, 13, 16, 20, 26, 30, 35, 37, 41, 47, 49, 53, 57];      // 第2,6,9,14,17,21,27,31,36,38,42,48,50,54,58题
    const sanguineQuestions = [3, 7, 10, 15, 18, 22, 24, 28, 33, 39, 43, 45, 51, 55, 59];     // 第4,8,11,16,19,23,25,29,34,40,44,46,52,56,60题
    const phlegmaticQuestions = [0, 6, 9, 12, 17, 21, 25, 29, 32, 38, 42, 44, 48, 54, 56];    // 第1,7,10,13,18,22,26,30,33,39,43,45,49,55,57题
    const melancholicQuestions = [2, 4, 11, 14, 19, 23, 27, 31, 34, 36, 40, 46, 50, 52, 58]; // 第3,5,12,15,20,24,28,32,35,37,41,47,51,53,59题
    
    // 评分规则：A=+2, B=+1, C=0, D=-1, E=-2
    const scoreMap = [2, 1, 0, -1, -2];
    
    // 计算胆汁质分数
    cholericQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        const answerIndex = answers[qIndex];
        if (answerIndex >= 0 && answerIndex < scoreMap.length) {
          cholericScore += scoreMap[answerIndex];
        }
      }
    });
    
    // 计算多血质分数
    sanguineQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        const answerIndex = answers[qIndex];
        if (answerIndex >= 0 && answerIndex < scoreMap.length) {
          sanguineScore += scoreMap[answerIndex];
        }
      }
    });
    
    // 计算黏液质分数
    phlegmaticQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        const answerIndex = answers[qIndex];
        if (answerIndex >= 0 && answerIndex < scoreMap.length) {
          phlegmaticScore += scoreMap[answerIndex];
        }
      }
    });
    
    // 计算抑郁质分数
    melancholicQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        const answerIndex = answers[qIndex];
        if (answerIndex >= 0 && answerIndex < scoreMap.length) {
          melancholicScore += scoreMap[answerIndex];
        }
      }
    });
    
    // 找出最高分数
    const scores = [
      { type: 'CHOLERIC', score: cholericScore, name: 'Choleric Temperament' },
      { type: 'SANGUINE', score: sanguineScore, name: 'Sanguine Temperament' },
      { type: 'PHLEGMATIC', score: phlegmaticScore, name: 'Phlegmatic Temperament' },
      { type: 'MELANCHOLIC', score: melancholicScore, name: 'Melancholic Temperament' }
    ];
    
    const maxScore = Math.max(...scores.map(s => s.score));
    const dominantTypes = scores.filter(s => s.score === maxScore);
    
    let summary = '';
    let type = '';
    
    if (dominantTypes.length === 1) {
      const dominant = dominantTypes[0];
      summary = dominant.name;
      type = dominant.type;
    } else {
      // 多个类型并列最高
      const typeNames = dominantTypes.map(t => t.name);
      summary = typeNames.join(', ');
      type = dominantTypes[0].type;
    }
    
    return { 
      total: maxScore, 
      summary, 
      analysis: summary, 
      type,
      scores: {
        choleric: cholericScore,
        sanguine: sanguineScore,
        phlegmatic: phlegmaticScore,
        melancholic: melancholicScore
      }
    };
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
      if (type === 'enneagram') return scoreEnneagram(answers);
      if (type === 'eq_test') return scoreEQTest(answers);
      if (type === 'phil_test') return scorePhilTest(answers);
      if (type === 'four_colors') return scoreFourColors(answers);
      if (type === 'pdp_test') return scorePDPTest(answers);
      if (type === 'mental_age_test') return scoreMentalAgeTest(answers);
      if (type === 'holland_test') return scoreHollandTest(answers);
      if (type === 'kelsey_test') return scoreKelseyTest(answers);
      if (type === 'temperament_type_test') return scoreTemperamentTypeTest(answers);
      if (type === 'social_anxiety_test') return scoreSocialAnxietyTest(answers);
      if (type === 'loneliness_test') return scoreLonelinessTest(answers);
      return { summary: 'Test type not supported', analysis: '' };
    }
  };
})();

// Loneliness Test 评分函数
function scoreLonelinessTest(answers) {
  // 孤独测试评分规则：Q1 A+2 B+0 C+1; Q2 A+2 B+0 C+1; Q3 A+0 B+1 C+2; Q4 A+1 B+2 C+0; Q5 A+1 B+2 C+0
  const scoreMap = {
    1: [2, 0, 1],  // 第1题: A=2分, B=0分, C=1分
    2: [2, 0, 1],  // 第2题: A=2分, B=0分, C=1分
    3: [0, 1, 2],  // 第3题: A=0分, B=1分, C=2分
    4: [1, 2, 0],  // 第4题: A=1分, B=2分, C=0分
    5: [1, 2, 0]   // 第5题: A=1分, B=2分, C=0分
  };
  
  // 计算总分
  let totalScore = 0;
  for (let i = 0; i < answers.length && i < 5; i++) {
    const questionNum = i + 1;
    const answerIndex = answers[i];
    if (scoreMap[questionNum] && answerIndex >= 0 && answerIndex < scoreMap[questionNum].length) {
      totalScore += scoreMap[questionNum][answerIndex];
    }
  }
  
  // 根据总分确定结果类型
  let resultType = '';
  let summary = '';
  let analysis = '';
  
  if (totalScore >= 0 && totalScore <= 2) {
    resultType = 'LONELY_10';
    summary = 'Loneliness Index: 10%';
    analysis = '## Loneliness Index: 10%\n\nYou don\'t feel lonely at all. On the contrary, you have an optimistic personality and believe simplicity is a kind of happiness. You enjoy the time laughing and playing with friends, and you can always face difficulties calmly — there\'s no problem that a meal can\'t solve; if there is, have two meals.';
  } else if (totalScore >= 3 && totalScore <= 5) {
    resultType = 'LONELY_30';
    summary = 'Loneliness Index: 30%';
    analysis = '## Loneliness Index: 30%\n\nYou take gains and losses in life lightly. Although you inevitably feel down sometimes, who hasn\'t encountered bad things? When facing setbacks, you can adjust yourself positively. When you feel depressed or lonely inside, you will also take the initiative to find someone to talk to, or distract yourself through other ways.';
  } else if (totalScore >= 6 && totalScore <= 8) {
    resultType = 'LONELY_70';
    summary = 'Loneliness Index: 70%';
    analysis = '## Loneliness Index: 70%\n\nThe saying "the older you grow, the lonelier you become" seems to fit your current state of mind perfectly. The days of youth are always particularly memorable; when you look back on those times, it seems you were always very happy. Troubles back then were simple, and the teenagers back then were easily satisfied. But as you grow older, it becomes harder and harder to find a confidant. Gradually, people get used to loneliness and dare not get close to each other.';
  } else if (totalScore >= 9 && totalScore <= 10) {
    resultType = 'LONELY_90';
    summary = 'Loneliness Index: 90%';
    analysis = '## Loneliness Index: 90%\n\nYou always get used to keeping your thoughts to yourself and can\'t be open and honest with others, so no one else can walk into your heart. Therefore, you are very lonely deep down and feel that there is no one around who truly understands you. Over time, you may have gotten used to loneliness — it even gives you a good protection, allowing you to ignore the disputes of the outside world.';
  } else {
    resultType = 'LONELY_30';
    summary = 'Loneliness Index: 30%';
    analysis = 'Unable to determine loneliness level. Please retake the test.';
  }
  
  return {
    summary: summary,
    analysis: analysis,
    totalScore: totalScore,
    resultType: resultType,
    description: summary
  };
}

// Social Test Anxiety Test 评分函数
function scoreSocialAnxietyTest(answers) {
  // 评分映射 (根据create-social-anxiety-test.js中的规则)
  const scoreMap = {
    1:  [1,2,3,4,5],   // 题目1: 选项1-5对应分数1-5
    2:  [1,2,3,4,5],   // 题目2: 选项1-5对应分数1-5
    3:  [5,4,3,2,1],   // 题目3: 选项1-5对应分数5-1 (反向)
    4:  [1,2,3,4,5],   // 题目4: 选项1-5对应分数1-5
    5:  [1,2,3,4,5],   // 题目5: 选项1-5对应分数1-5
    6:  [5,4,3,2,1],   // 题目6: 选项1-5对应分数5-1 (反向)
    7:  [1,2,3,4,5],   // 题目7: 选项1-5对应分数1-5
    8:  [1,2,3,4,5],   // 题目8: 选项1-5对应分数1-5
    9:  [1,2,3,4,5],   // 题目9: 选项1-5对应分数1-5
    10: [5,4,3,2,1],   // 题目10: 选项1-5对应分数5-1 (反向)
    11: [1,2,3,4,5],   // 题目11: 选项1-5对应分数1-5
    12: [1,2,3,4,5],   // 题目12: 选项1-5对应分数1-5
    13: [1,2,3,4,5],   // 题目13: 选项1-5对应分数1-5
    14: [1,2,3,4,5],   // 题目14: 选项1-5对应分数1-5
    15: [5,4,3,2,1]    // 题目15: 选项1-5对应分数5-1 (反向)
  };
  
  // 计算总分
  let totalScore = 0;
  answers.forEach((answerIndex, questionIndex) => {
    const questionNum = questionIndex + 1;
    if (scoreMap[questionNum] && answerIndex >= 0 && answerIndex < scoreMap[questionNum].length) {
      totalScore += scoreMap[questionNum][answerIndex];
    }
  });
  
  // 根据分数确定结果类型
  let resultType = '';
  let summary = '';
  let analysis = '';
  
  if (totalScore >= 61) {
    resultType = 'SA_SEVERE';
    summary = '61-75';
    analysis = 'You currently have a rather severe tendency of social anxiety across multiple scenarios. Consider seeking professional help in time.';
  } else if (totalScore >= 41) {
    resultType = 'SA_MILD';
    summary = '41-60';
    analysis = 'Only mild social anxiety in specific cases; simple adjustments can help.';
  } else {
    resultType = 'SA_NONE';
    summary = '0-40';
    analysis = 'No social anxiety; you can remain relaxed and natural in most social contexts.';
  }
  
  return {
    summary: summary,
    analysis: analysis,
    totalScore: totalScore,
    resultType: resultType,
    description: summary
  };
}

window.TestLogic = TestLogic;


