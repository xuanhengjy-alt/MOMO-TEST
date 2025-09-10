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

  const discNames = { D: 'Dominance－支配型/控制者', I: 'Influence－活泼型/社交者', S: 'Steadiness－稳定型/支持者', C: 'Compliance－完美型/服从者' };
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
    { t:'(1) Choose the option that feels most natural at first glance. If unsure, recall childhood experiences or consider how those who know you best would describe you.', opts:['Adventurous','Adaptable','Lively','Analytical'] },
    { t:'(2) Choose the option that best reflects your first impression. If unsure, recall childhood experiences or consider how someone who knows you well would describe you.', opts:['Persistent','Playful','Persuasive','Calm'] },
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

  const discAnalysisEn = {
    D: 'Individuals with high D traits can be described as “natural-born leaders.”\n\nEmotionally, D types are resolute and decisive, crave change, enjoy control, possess tremendous drive, are highly independent, and exhibit extreme self-confidence. However, their tendency to overlook others\' feelings can make them appear rude, domineering, impatient, relentless, and unable to relax. They are uncomfortable with emotional exchanges, offer little flattery, dislike displays of tears, and lack empathy.\n\nIn work, D-types are pragmatic and efficiency-driven. They possess clear goals, broad vision, strong organizational skills, and swift action. They resolve issues promptly, persevere decisively, and thrive amid opposition. Yet, their intense focus on outcomes often leads to overlooking details and insufficient meticulousness in problem-solving. Their tendency to micromanage and direct others enables them to drive team progress, yet may provoke resentment among colleagues.\n\nIn interpersonal relationships, Type D individuals prefer making decisions for others—a practice that aids choice-making but can feel coercive. Focused on their own objectives, they value others primarily for their utility. They enjoy exerting control and rarely apologize.\n\nDescriptive Terms: Proactive, competitive, assertive, inquisitive, direct, pioneering, opinionated, confident, candid',
    I: 'High-I individuals are typically lively organizers of group activities.\n\nType I personalities are emotionally expressive and outgoing... (abridged)\n\nDescriptive words: Influential, persuasive, friendly, articulate, talkative, optimistic and positive, sociable',
    S: 'High-S types are typically calm, content with what they have, and reluctant to take initiative...\n\nDescriptive traits: Reliable, thoughtful, warm and friendly, persistent, tenacious, good listener, thorough and considerate, strong self-control',
    C: 'High C types are typically perfectionist professionals...\n\nDescriptive Terms: Compliant, Meticulous, Methodical, Rigorous, Precise, Perfectionist, Logical'
  };

  function scoreDisc(answers) { // answers: 0-based index per question
    const counts = { D:0, I:0, S:0, C:0 };
    answers.forEach((optIndex, qi) => {
      const type = discMap[qi][optIndex];
      counts[type] += 1;
    });
    const max = Math.max(counts.D, counts.I, counts.S, counts.C);
    const tops = Object.entries(counts).filter(([k,v]) => v === max).map(([k]) => k);
    const summary = tops.map(k => discNames[k]).join('、');
    const analysis = tops.map(k => `${discNames[k]}：${discAnalysis[k]}`).join('\n\n');
    return { counts, tops, summary, analysis };
  }

  function scoreMgmt(answers) { // answers: 0/1 (是=1，否=0)
    const total = answers.reduce((s,v) => s + (v === 0 ? 1 : 0), 0); // 选项索引0为“是”
    let summary = '';
    if (total <= 5) summary = '管理能力很差。但你具有较高的艺术创造力，适合从事与艺术有关的具体工作。';
    else if (total <= 9) summary = '管理能力较差。这可能与你言行自由，不服约束有关。';
    else if (total <= 12) summary = '管理能力一般，对你的专业方面的事务性管理尚可。管理方法经常受到情绪的干扰是最大的遗憾。';
    else if (total <= 14) summary = '管理能力较强。能稳重、扎实地作好工作，很少出现以外或有损组织发展的失误。';
    else summary = '管理能力很强。擅长有计划地工作和学习，尤其适合管理大型组织';
    return { total, summary, analysis: summary };
  }

  return {
    getQuestions(type) {
      if (type === 'disc') return discQuestions;
      if (type === 'disc40') return disc40Questions;
      if (type === 'mgmt') return mgmtQuestions;
      return [];
    },
    score(type, answers) {
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
        const analysis = tops.map(k => `${names[k]}:\n\n${discAnalysisEn[k]}`).join('\n\n');
        return { counts, tops, summary, analysis };
      }
      if (type === 'mgmt') return scoreMgmt(answers);
      return { summary: '暂不支持的测试类型', analysis: '' };
    }
  };
})();

window.TestLogic = TestLogic;


