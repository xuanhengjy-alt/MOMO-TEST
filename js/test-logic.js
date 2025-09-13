// 题库与计分逻辑
const TestLogic = (function() {
  // DISC 五题
  const discQuestions = [
    {
      t: '请按第一印象最快的选择，如果不能确定，可回忆童年时的情况，或者以你最熟悉的人对你的评价来从中选择。',
      opts: ['富于冒险:愿意面对新事物并敢于下决心掌握的人','适应力强:轻松自如适应任何环境','生动:充满活力,表情生动,多手势','善于分析:喜欢研究各部分之间的逻辑和正确的关系']
    },
    {
      t: '请按第一印象最快的选择，如果不能确定，可回忆童年时的情况，或者以你最熟悉的人对你的评价来从中选择。',
      opts: ['坚持不懈：要完成现有的事才能做新的事情','喜好娱乐：开心充满乐趣与幽默感','善于说服：用逻辑和事实而不用威严和权利服人','平和：在冲突中不受干扰，保持平静']
    },
    {
      t: '请按第一印象最快的选择，如果不能确定，可回忆童年时的情况，或者以你最熟悉的人对你的评价来从中选择。',
      opts: ['顺服：易接受他人的观点和喜好，不坚持己见','自我牺牲：为他人利益愿意放弃个人意见','善于社交：认为与人相处是好玩，而不是挑战或者商业机会','意志坚定：决心以自己的方式做事']
    },
    {
      t: '请按第一印象最快的选择，如果不能确定，可回忆童年时的情况，或者以你最熟悉的人对你的评价来从中选择。',
      opts: ['使人认同：因人格魅力或性格使人认同','体贴：关心别人的感受与需要','竞争性：把一切当作竞赛，总是有强烈的赢的欲望','自控性：控制自己的情感，极少流露']
    },
    {
      t: '请按第一印象最快的选择，如果不能确定，可回忆童年时的情况，或者以你最熟悉的人对你的评价来从中选择。',
      opts: ['使人振作：给他人清新振奋的刺激','尊重他人：对人诚实尊重','善于应变：对任何情况都能作出有效的反应','含蓄：自我约束情绪与热忱']
    }
  ];

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
  /* Removed inline DISC analysis, rely on backend */
  const discAnalysis = {
    D: '高D型特质的人可以称为是“天生的领袖”。\n\n在情感方面，D型人一个坚定果敢的人，酷好变化，喜欢控制，干劲十足，独立自主，超级自信。可是，由于比较不会顾及别人的感受，所以显得粗鲁、霸道、没有耐心、穷追不舍、不会放松。D型人不习惯与别人进行感情上的交流，不会恭维人，不喜欢眼泪，匮乏同情心。\n\n在工作方面，D型人是一个务实和讲究效率的人，目标明确，眼光全面，组织力强，行动迅速，解决问题不过夜，果敢坚持到底，在反对声中成长。但是，因为过于强调结果，D型人往往容易忽视细节，处理问题不够细致。爱管人、喜欢支使他人的特点使得D型人能够带动团队进步，但也容易激起同事的反感。\n\n在人际关系方面，D型人喜欢为别人做主，虽然这样能够帮助别人做出选择，但也容易让人有强迫感。由于关注自己的目标，D型人在乎的是别人的可利用价值。喜欢控制别人，不会说对不起。\n\n描述性词语：积级进取、争强好胜、强势、爱追根究底、直截了当、主动的开拓者、坚持意见、自信、直率',
    I: '高I型特质的人可以称为是“天生的社交家”。\n\n在情感方面，I型人是一个热情洋溢的人，乐观向上，善于表达，富有感染力，喜欢与人交往，充满活力。但是，由于过于乐观，I型人往往缺乏耐心，容易冲动，不够专注，有时显得不够稳重。\n\n在工作方面，I型人是一个富有创意和想象力的人，善于激励他人，具有良好的沟通能力，能够营造积极的工作氛围。但是，由于缺乏条理性，I型人往往容易分心，难以专注于细节工作，有时显得不够务实。\n\n在人际关系方面，I型人是一个受欢迎的人，善于建立人际关系，能够快速融入新环境，具有良好的团队合作精神。但是，由于过于关注他人的认可，I型人有时会显得不够独立，容易受到他人影响。\n\n描述性词语：热情洋溢、乐观向上、善于表达、富有感染力、充满活力、富有创意、善于激励、沟通能力强',
    S: '高S型的人通常较为平和，知足常乐，不愿意主动前进。\n\n在情感方面，S型人是一个温和主义者，悠闲，平和，有耐心，感情内藏，待人和蔼，乐于倾听，遇事冷静，随遇而安。S型喜欢使用一句口头禅：“不过如此。”这个特点使得S型总是缺乏热情，不愿改变。\n\n在工作方面，S型能够按部就班地管理事务，胜任工作并能够持之以恒。奉行中庸之道，平和可亲，一方面习惯于避免冲突，另一方面也能处变不惊。但是，S型似乎总是慢吞吞的，很难被鼓动，懒惰，马虎，得过且过。由于害怕承担风险和责任，宁愿站在一边旁观。很多时候，S型总是焉有主意，有话不说，或折衷处理。\n\n在人际关系方面，S型是一个容易相处的人，喜欢观察人、琢磨人，乐于倾听，愿意支持。可是，由于不以为然，S型也可能显得漠不关心，或者嘲讽别人。\n\n描述性词语：可靠、深思熟虑、亲切友好、有毅力、坚持不懈、善倾听者、全面周到、自制力强',
    C: '高C型的人通常是喜欢追求完美的专业型人才。\n\n在情感方面，C型人是一个性格深沉的人，严肃认真，目的性强，善于分析，愿意思考人生与工作的意义，喜欢美丽，对他人敏感，理想主义。但是，C型人总是习惯于记住负面的东西，容易情绪低落，过分自我反省，自我贬低，离群索居，有忧郁症倾向。\n\n在工作方面，C型人是一个完美主义者，高标准，计划性强，注重细节，讲究条理，整洁，能够发现问题并制订解决问题的办法，喜欢图表和清单，坚持己见，善始善终。但是，C型人也很可能是一个优柔寡断的人，习惯于收集信息资料和做分析，却很难投入到实际运作的工作中来。容易自我否定，因此需要别人的认同。同时，也习惯于挑剔别人，不能忍受别人的工作做不好。\n\n对待人际关系方面，C型人一方面在寻找理想伙伴，另一方面却交友谨慎。能够深切地关怀他人，善于倾听抱怨，帮助别人解决困难。但是，C型人似乎始终有一种不安全感，以致于感情内向，退缩，怀疑别人，喜欢批评人事，却不喜欢别人的反对。\n\n描述性词语：遵从、仔细、有条不紊、严谨、准确、完美主义者、逻辑性强'
  };

  // 管理能力 15题（是=1，否=0）
  const mgmtQuestions = [
    { t:'习惯于行动之前制定计划？', opts:['是','否'] },
    { t:'经常处于效率上的考虑而更改计划？', opts:['是','否'] },
    { t:'能经常收集他人的各种反映？', opts:['是','否'] },
    { t:'实现目标是解决问题的继续？', opts:['是','否'] },
    { t:'临睡前思考筹划明天要做的事情？', opts:['是','否'] },
    { t:'事物上的联系、指令常常是一丝不苟？', opts:['是','否'] },
    { t:'有经常记录自己行动的习惯？', opts:['是','否'] },
    { t:'能严格制约自己的行动？', opts:['是','否'] },
    { t:'无论何时何地，都能有目的的行动？', opts:['是','否'] },
    { t:'能经常思考对策，扫除实现目标中的障碍？', opts:['是','否'] },
    { t:'能每天检查自己当天的行动效率？', opts:['是','否'] },
    { t:'经常严格查对预定目标和实际成绩？', opts:['是','否'] },
    { t:'对工作的成果非常敏感？', opts:['是','否'] },
    { t:'今天预先安排的工作决不拖到明天？', opts:['是','否'] },
    { t:'习惯于在掌握有关信息基础上制定目标和计划？', opts:['是','否'] }
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

  function scoreMgmt(answers) { // answers: 0/1 (是=1，否=0)
    const total = answers.reduce((s,v) => s + (v === 0 ? 1 : 0), 0); // 选项索引0为"是"
    let summary = '';
    if (total <= 5) summary = '管理能力很差。但你具有较高的艺术创造力，适合从事与艺术有关的具体工作。';
    else if (total <= 9) summary = '管理能力较差。这可能与你言行自由，不服约束有关。';
    else if (total <= 12) summary = '管理能力一般，对你的专业方面的事务性管理尚可。管理方法经常受到情绪的干扰是最大的遗憾。';
    else if (total <= 14) summary = '管理能力较强。能稳重、扎实地作好工作，很少出现以外或有损组织发展的失误。';
    else summary = '管理能力很强。擅长有计划地工作和学习，尤其适合管理大型组织';
    return { total, summary, analysis: summary };
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
      if (type === 'disc') return discQuestions.slice();
      if (type === 'disc40') return disc40Questions.slice();
      if (type === 'mbti') return mbtiQuestions;
      if (type === 'mgmt') return mgmtQuestions;
      return [];
    },
    async score(type, answers) {
      if (type === 'disc') return scoreDisc(answers);
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
      if (type === 'mgmt') return scoreMgmt(answers);
      return { summary: '暂不支持的测试类型', analysis: '' };
    }
  };
})();

window.TestLogic = TestLogic;


