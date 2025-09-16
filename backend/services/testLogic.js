// 测试计算逻辑服务
// 从原有的 test-logic.js 移植过来，适配数据库结构

const { query } = require('../config/database');

class TestLogicService {
  constructor() {
    this.discMap = [
      ['D','S','I','C'],
      ['C','I','D','S'],
      ['S','C','I','D'],
      ['I','C','D','S'],
      ['I','C','D','S']
    ];

    this.discNames = { 
      D: 'Dominance', 
      I: 'Influence', 
      S: 'Steadiness', 
      C: 'Compliance' 
    };

    this.discAnalysis = {
      D: '高D型特质的人可以称为是"天生的领袖"。\n\n在情感方面，D型人一个坚定果敢的人，酷好变化，喜欢控制，干劲十足，独立自主，超级自信。可是，由于比较不会顾及别人的感受，所以显得粗鲁、霸道、没有耐心、穷追不舍、不会放松。D型人不习惯与别人进行感情上的交流，不会恭维人，不喜欢眼泪，匮乏同情心。\n\n在工作方面，D型人是一个务实和讲究效率的人，目标明确，眼光全面，组织力强，行动迅速，解决问题不过夜，果敢坚持到底，在反对声中成长。但是，因为过于强调结果，D型人往往容易忽视细节，处理问题不够细致。爱管人、喜欢支使他人的特点使得D型人能够带动团队进步，但也容易激起同事的反感。\n\n在人际关系方面，D型人喜欢为别人做主，虽然这样能够帮助别人做出选择，但也容易让人有强迫感。由于关注自己的目标，D型人在乎的是别人的可利用价值。喜欢控制别人，不会说对不起。\n\n描述性词语：积级进取、争强好胜、强势、爱追根究底、直截了当、主动的开拓者、坚持意见、自信、直率',
      I: '高I型特质的人可以称为是"天生的社交家"。\n\n在情感方面，I型人是一个热情洋溢的人，乐观向上，善于表达，富有感染力，喜欢与人交往，充满活力。但是，由于过于乐观，I型人往往缺乏耐心，容易冲动，不够专注，有时显得不够稳重。\n\n在工作方面，I型人是一个富有创意和想象力的人，善于激励他人，具有良好的沟通能力，能够营造积极的工作氛围。但是，由于缺乏条理性，I型人往往容易分心，难以专注于细节工作，有时显得不够务实。\n\n在人际关系方面，I型人是一个受欢迎的人，善于建立人际关系，能够快速融入新环境，具有良好的团队合作精神。但是，由于过于关注他人的认可，I型人有时会显得不够独立，容易受到他人影响。\n\n描述性词语：热情洋溢、乐观向上、善于表达、富有感染力、充满活力、富有创意、善于激励、沟通能力强',
      S: '高S型的人通常较为平和，知足常乐，不愿意主动前进。\n\n在情感方面，S型人是一个温和主义者，悠闲，平和，有耐心，感情内藏，待人和蔼，乐于倾听，遇事冷静，随遇而安。S型喜欢使用一句口头禅："不过如此。"这个特点使得S型总是缺乏热情，不愿改变。\n\n在工作方面，S型能够按部就班地管理事务，胜任工作并能够持之以恒。奉行中庸之道，平和可亲，一方面习惯于避免冲突，另一方面也能处变不惊。但是，S型似乎总是慢吞吞的，很难被鼓动，懒惰，马虎，得过且过。由于害怕承担风险和责任，宁愿站在一边旁观。很多时候，S型总是焉有主意，有话不说，或折衷处理。\n\n在人际关系方面，S型是一个容易相处的人，喜欢观察人、琢磨人，乐于倾听，愿意支持。可是，由于不以为然，S型也可能显得漠不关心，或者嘲讽别人。\n\n描述性词语：可靠、深思熟虑、亲切友好、有毅力、坚持不懈、善倾听者、全面周到、自制力强',
      C: '高C型的人通常是喜欢追求完美的专业型人才。\n\n在情感方面，C型人是一个性格深沉的人，严肃认真，目的性强，善于分析，愿意思考人生与工作的意义，喜欢美丽，对他人敏感，理想主义。但是，C型人总是习惯于记住负面的东西，容易情绪低落，过分自我反省，自我贬低，离群索居，有忧郁症倾向。\n\n在工作方面，C型人是一个完美主义者，高标准，计划性强，注重细节，讲究条理，整洁，能够发现问题并制订解决问题的办法，喜欢图表和清单，坚持己见，善始善终。但是，C型人也很可能是一个优柔寡断的人，习惯于收集信息资料和做分析，却很难投入到实际运作的工作中来。容易自我否定，因此需要别人的认同。同时，也习惯于挑剔别人，不能忍受别人的工作做不好。\n\n对待人际关系方面，C型人一方面在寻找理想伙伴，另一方面却交友谨慎。能够深切地关怀他人，善于倾听抱怨，帮助别人解决困难。但是，C型人似乎始终有一种不安全感，以致于感情内向，退缩，怀疑别人，喜欢批评人事，却不喜欢别人的反对。\n\n描述性词语：遵从、仔细、有条不紊、严谨、准确、完美主义者、逻辑性强'
    };
  }

  // 从数据库读取 DISC 分析（英文）与名称（英文）
  async fetchDiscFromDatabase(projectKey, typeCodes) {
    try {
      const result = await query(`
        SELECT rt.type_code, rt.type_name_en, COALESCE(rt.analysis_en, '') AS analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = $1 AND rt.type_code = ANY($2::text[])
      `, [projectKey, typeCodes]);

      const map = {};
      result.rows.forEach(r => { map[r.type_code] = r; });
      return map;
    } catch (e) {
      console.error('Error fetching DISC analysis from DB:', e);
      return null;
    }
  }

  // DISC 5题测试计算（仅使用数据库英文分析；无数据则返回空分析）
  async scoreDisc(answers, projectKey = 'disc') {
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    answers.forEach((optIndex, qi) => {
      const type = this.discMap[qi] && this.discMap[qi][optIndex];
      if (type && counts[type] != null) counts[type] += 1;
    });

    const max = Math.max(counts.D, counts.I, counts.S, counts.C);
    const tops = Object.entries(counts).filter(([_, v]) => v === max).map(([k]) => k);

    // 尝试从数据库读取英文分析
    const dbMap = await this.fetchDiscFromDatabase(projectKey, tops);
    if (dbMap) {
      const names = tops.map(k => (dbMap[k] && dbMap[k].type_name_en) ? dbMap[k].type_name_en : k);
      const analysis = tops.map(k => (dbMap[k] && dbMap[k].analysis_en) ? dbMap[k].analysis_en : '').filter(Boolean).join('\n\n');
      return { counts, tops, summary: names.join(', '), analysis };
    }

    // 无数据库内容时，不再使用本地中文兜底，保持空分析，名称用英文字母占位
    return { counts, tops, summary: tops.join(', '), analysis: '' };
  }

  // 管理能力测试计算
  scoreMgmt(answers) {
    const total = answers.reduce((s, v) => s + (v === 0 ? 1 : 0), 0);
    let summary = '';
    if (total <= 5) summary = '管理能力很差。但你具有较高的艺术创造力，适合从事与艺术有关的具体工作。';
    else if (total <= 9) summary = '管理能力较差。这可能与你言行自由，不服约束有关。';
    else if (total <= 12) summary = '管理能力一般，对你的专业方面的事务性管理尚可。管理方法经常受到情绪的干扰是最大的遗憾。';
    else if (total <= 14) summary = '管理能力较强。能稳重、扎实地作好工作，很少出现以外或有损组织发展的失误。';
    else summary = '管理能力很强。擅长有计划地工作和学习，尤其适合管理大型组织';
    
    return { total, summary, analysis: summary };
  }

  // 内向外向测试计算
  async scoreIntroversionExtraversion(answers) {
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
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'introversion_en' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const introData = result.rows[0];
        return {
          summary: introData.description_en || summary,
          summaryEn: introData.description_en || summary,
          analysis: introData.analysis_en || '',
          analysisEn: introData.analysis_en || '',
          typeName: introData.type_name_en,
          typeNameEn: introData.type_name_en,
          total: total,
          type: type
        };
      }
    } catch (error) {
      console.error('Error fetching introversion description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `After testing, you are **${summary}** personality type.`,
      analysisEn: `After testing, you are **${summary}** personality type.`,
      typeName: summary,
      typeNameEn: summary,
      total: total,
      type: type
    };
  }

  // 九型人格测试计算
  async scoreEnneagram(answers) {
    const personalityScores = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // 对应1-9号人格
    
    // 根据文档中的答案统计表
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
    let type = '';
    if (dominantTypes.length === 1) {
      summary = `Type ${dominantTypes[0]}: ${typeNames[dominantTypes[0] - 1]}`;
      type = `TYPE_${dominantTypes[0]}`;
    } else {
      summary = `Types ${dominantTypes.join(', ')}: ${dominantTypes.map(t => typeNames[t-1]).join(', ')}`;
      type = `TYPE_${dominantTypes[0]}`;
    }
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'enneagram_en' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const enneagramData = result.rows[0];
        return {
          summary: enneagramData.description_en || summary,
          summaryEn: enneagramData.description_en || summary,
          analysis: enneagramData.analysis_en || '',
          analysisEn: enneagramData.analysis_en || '',
          typeName: enneagramData.type_name_en,
          typeNameEn: enneagramData.type_name_en,
          total: maxScore,
          type: type,
          personalityScores: personalityScores,
          dominantTypes: dominantTypes
        };
      }
    } catch (error) {
      console.error('Error fetching enneagram description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `After testing, you are **${summary}** personality type.`,
      analysisEn: `After testing, you are **${summary}** personality type.`,
      typeName: summary,
      typeNameEn: summary,
      total: maxScore,
      type: type,
      personalityScores: personalityScores,
      dominantTypes: dominantTypes
    };
  }

  // 国际标准情商测试计算
  async scoreEQTest(answers) {
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
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'eq_test_en' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const eqData = result.rows[0];
        return {
          summary: eqData.description_en || summary,
          summaryEn: eqData.description_en || summary,
          analysis: eqData.analysis_en || '',
          analysisEn: eqData.analysis_en || '',
          typeName: eqData.type_name_en,
          typeNameEn: eqData.type_name_en,
          total: total,
          type: type
        };
      }
    } catch (error) {
      console.error('Error fetching EQ description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `Your emotional intelligence level: **${summary}** (${total} points).`,
      analysisEn: `Your emotional intelligence level: **${summary}** (${total} points).`,
      typeName: summary,
      typeNameEn: summary,
      total: total,
      type: type
    };
  }

  // 菲尔人格测试计算
  async scorePhilTest(answers) {
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
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'phil_test_en' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const philData = result.rows[0];
        return {
          summary: philData.description_en || summary,
          summaryEn: philData.description_en || summary,
          analysis: philData.analysis_en || '',
          analysisEn: philData.analysis_en || '',
          typeName: philData.type_name_en,
          typeNameEn: philData.type_name_en,
          total: total,
          type: type
        };
      }
    } catch (error) {
      console.error('Error fetching Phil description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `Your Phil personality type: **${summary}** (${total} points).`,
      analysisEn: `Your Phil personality type: **${summary}** (${total} points).`,
      typeName: summary,
      typeNameEn: summary,
      total: total,
      type: type
    };
  }

  // 四色性格测试计算
  async scoreFourColors(answers) {
    let ahCountCorrect = 0, bgCountCorrect = 0, cfCountCorrect = 0, deCountCorrect = 0;
    
    // 根据文档的评分规则，计算A+H、B+G、C+F、D+E的数量
    for (let i = 0; i < answers.length; i++) {
      const answerIndex = answers[i];
      
      if (i < 15) { // 前15题：A/B/C/D
        if (answerIndex === 0) ahCountCorrect++; // A
        else if (answerIndex === 1) bgCountCorrect++; // B
        else if (answerIndex === 2) cfCountCorrect++; // C
        else if (answerIndex === 3) deCountCorrect++; // D
      } else { // 后15题：E/F/G/H对应A/B/C/D
        if (answerIndex === 0) deCountCorrect++; // E对应A，计入D+E
        else if (answerIndex === 1) cfCountCorrect++; // F对应B，计入C+F
        else if (answerIndex === 2) bgCountCorrect++; // G对应C，计入B+G
        else if (answerIndex === 3) ahCountCorrect++; // H对应D，计入A+H
      }
    }
    
    // 找出最大值
    const counts = [
      { type: 'RED', count: ahCountCorrect },
      { type: 'BLUE', count: bgCountCorrect },
      { type: 'YELLOW', count: cfCountCorrect },
      { type: 'GREEN', count: deCountCorrect }
    ];
    
    const maxCount = Math.max(...counts.map(c => c.count));
    const dominantTypes = counts.filter(c => c.count === maxCount);
    
    let summary = '';
    let type = '';
    
    if (dominantTypes.length === 1) {
      const dominant = dominantTypes[0];
      if (dominant.type === 'RED') {
        summary = 'Red personality';
        type = 'RED_PERSONALITY';
      } else if (dominant.type === 'BLUE') {
        summary = 'Blue personality';
        type = 'BLUE_PERSONALITY';
      } else if (dominant.type === 'YELLOW') {
        summary = 'Yellow personality';
        type = 'YELLOW_PERSONALITY';
      } else if (dominant.type === 'GREEN') {
        summary = 'Green personality';
        type = 'GREEN_PERSONALITY';
      }
    } else {
      // 多个类型并列最多
      const typeNames = dominantTypes.map(t => {
        if (t.type === 'RED') return 'Red';
        else if (t.type === 'BLUE') return 'Blue';
        else if (t.type === 'YELLOW') return 'Yellow';
        else if (t.type === 'GREEN') return 'Green';
      });
      summary = `${typeNames.join(', ')} personality`;
      type = dominantTypes[0].type + '_PERSONALITY';
    }
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'four_colors_en' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const fourColorsData = result.rows[0];
        return {
          summary: fourColorsData.description_en || summary,
          summaryEn: fourColorsData.description_en || summary,
          analysis: fourColorsData.analysis_en || '',
          analysisEn: fourColorsData.analysis_en || '',
          typeName: fourColorsData.type_name_en,
          typeNameEn: fourColorsData.type_name_en,
          total: maxCount,
          type: type,
          counts: {
            red: ahCountCorrect,
            blue: bgCountCorrect,
            yellow: cfCountCorrect,
            green: deCountCorrect
          }
        };
      }
    } catch (error) {
      console.error('Error fetching Four-colors description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `Your Four-colors personality type: **${summary}** (A+H: ${ahCountCorrect}, B+G: ${bgCountCorrect}, C+F: ${cfCountCorrect}, D+E: ${deCountCorrect}).`,
      analysisEn: `Your Four-colors personality type: **${summary}** (A+H: ${ahCountCorrect}, B+G: ${bgCountCorrect}, C+F: ${cfCountCorrect}, D+E: ${deCountCorrect}).`,
      typeName: summary,
      typeNameEn: summary,
      total: maxCount,
      type: type,
      counts: {
        red: ahCountCorrect,
        blue: bgCountCorrect,
        yellow: cfCountCorrect,
        green: deCountCorrect
      }
    };
  }

  // PDP行为风格测试计算
  async scorePDPTest(answers) {
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
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'pdp_test_en' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const pdpData = result.rows[0];
        return {
          summary: pdpData.description_en || summary,
          summaryEn: pdpData.description_en || summary,
          analysis: pdpData.analysis_en || '',
          analysisEn: pdpData.analysis_en || '',
          typeName: pdpData.type_name_en,
          typeNameEn: pdpData.type_name_en,
          total: maxScore,
          type: type,
          scores: {
            tiger: tigerScore,
            peacock: peacockScore,
            koala: koalaScore,
            owl: owlScore,
            chameleon: chameleonScore
          }
        };
      }
    } catch (error) {
      console.error('Error fetching PDP description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `Your PDP behavioral style: **${summary}** (Tiger: ${tigerScore}, Peacock: ${peacockScore}, Koala: ${koalaScore}, Owl: ${owlScore}, Chameleon: ${chameleonScore}).`,
      analysisEn: `Your PDP behavioral style: **${summary}** (Tiger: ${tigerScore}, Peacock: ${peacockScore}, Koala: ${koalaScore}, Owl: ${owlScore}, Chameleon: ${chameleonScore}).`,
      typeName: summary,
      typeNameEn: summary,
      total: maxScore,
      type: type,
      scores: {
        tiger: tigerScore,
        peacock: peacockScore,
        koala: koalaScore,
        owl: owlScore,
        chameleon: chameleonScore
      }
    };
  }

  // 心理年龄测试计算
  async scoreMentalAgeTest(answers) {
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
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'mental_age_test_en' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const mentalAgeData = result.rows[0];
        return {
          summary: mentalAgeData.description_en || summary,
          summaryEn: mentalAgeData.description_en || summary,
          analysis: mentalAgeData.analysis_en || '',
          analysisEn: mentalAgeData.analysis_en || '',
          typeName: mentalAgeData.type_name_en,
          typeNameEn: mentalAgeData.type_name_en,
          total: total,
          type: type
        };
      }
    } catch (error) {
      console.error('Error fetching Mental Age description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `Your mental age: **${summary}** (Score: ${total}/100).`,
      analysisEn: `Your mental age: **${summary}** (Score: ${total}/100).`,
      typeName: summary,
      typeNameEn: summary,
      total: total,
      type: type
    };
  }

  // 霍兰德职业兴趣测试计算
  async scoreHollandTest(answers) {
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
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'holland_test_en' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const hollandData = result.rows[0];
        return {
          summary: hollandData.description_en || summary,
          summaryEn: hollandData.description_en || summary,
          analysis: hollandData.analysis_en || '',
          analysisEn: hollandData.analysis_en || '',
          typeName: hollandData.type_name_en,
          typeNameEn: hollandData.type_name_en,
          total: maxScore,
          type: type,
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
    } catch (error) {
      console.error('Error fetching Holland description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `Your Holland occupational interest type: **${summary}** (Realistic: ${realisticScore}, Investigative: ${investigativeScore}, Artistic: ${artisticScore}, Social: ${socialScore}, Enterprising: ${enterprisingScore}, Conventional: ${conventionalScore}).`,
      analysisEn: `Your Holland occupational interest type: **${summary}** (Realistic: ${realisticScore}, Investigative: ${investigativeScore}, Artistic: ${artisticScore}, Social: ${socialScore}, Enterprising: ${enterprisingScore}, Conventional: ${conventionalScore}).`,
      typeName: summary,
      typeNameEn: summary,
      total: maxScore,
      type: type,
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

  // 凯尔西气质类型测试计算
  async scoreKelseyTest(answers) {
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
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'kelsey_test_en' AND rt.type_code = $1
      `, [typeCode]);
      
      if (result.rows.length > 0) {
        const kelseyData = result.rows[0];
        return {
          summary: kelseyData.description_en || typeName,
          summaryEn: kelseyData.description_en || typeName,
          analysis: kelseyData.analysis_en || '',
          analysisEn: kelseyData.analysis_en || '',
          typeName: kelseyData.type_name_en,
          typeNameEn: kelseyData.type_name_en,
          total: Math.max(eScore, iScore) + Math.max(sScore, nScore) + Math.max(tScore, fScore) + Math.max(jScore, pScore),
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
    } catch (error) {
      console.error('Error fetching Kelsey description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: typeName,
      summaryEn: typeName,
      analysis: `Your Kelsey temperament type: **${typeName}** (${typeCode}) - E:${eScore}, I:${iScore}, S:${sScore}, N:${nScore}, T:${tScore}, F:${fScore}, J:${jScore}, P:${pScore}.`,
      analysisEn: `Your Kelsey temperament type: **${typeName}** (${typeCode}) - E:${eScore}, I:${iScore}, S:${sScore}, N:${nScore}, T:${tScore}, F:${fScore}, J:${jScore}, P:${pScore}.`,
      typeName: typeName,
      typeNameEn: typeName,
      total: Math.max(eScore, iScore) + Math.max(sScore, nScore) + Math.max(tScore, fScore) + Math.max(jScore, pScore),
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

  // 主要计算入口
  async calculateResult(testType, answers) {
    switch (testType) {
      case 'disc':
        return await this.scoreDisc(answers, 'disc');
      case 'mgmt':
        return this.scoreMgmt(answers);
      case 'disc40':
        return await this.scoreDisc40(answers);
      case 'mbti':
        return await this.scoreMbti(answers);
      case 'introversion_extraversion':
        return await this.scoreIntroversionExtraversion(answers);
      case 'enneagram':
        return await this.scoreEnneagram(answers);
      case 'eq_test':
        return await this.scoreEQTest(answers);
      case 'phil_test':
        return await this.scorePhilTest(answers);
      case 'four_colors':
        return await this.scoreFourColors(answers);
      case 'pdp_test':
        return await this.scorePDPTest(answers);
      case 'mental_age_test':
        return await this.scoreMentalAgeTest(answers);
      case 'holland_test':
        return await this.scoreHollandTest(answers);
      case 'kelsey_test':
        return await this.scoreKelseyTest(answers);
      case 'social_anxiety_test':
        return await this.scoreSocialAnxietyTest(answers);
      case 'personality_charm_1min':
      case 'phil_test_en':
      case 'temperament_type_test':
      case 'violence_index':
        return await this.scoreGenericTest(testType, answers);
      default:
        return { summary: '暂不支持的测试类型', analysis: '' };
    }
  }

  // 通用测试评分方法
  async scoreGenericTest(testType, answers) {
    try {
      // 计算总分（简单累加）
      const totalScore = answers.reduce((sum, answer) => sum + (answer || 0), 0);
      
      // 从数据库获取结果类型信息
      const resultQuery = await query(`
        SELECT 
          rt.type_code, 
          rt.type_name_en, 
          rt.description_en, 
          rt.analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = $1
        ORDER BY rt.type_code
        LIMIT 1
      `, [testType]);
      
      if (resultQuery.rows.length > 0) {
        const result = resultQuery.rows[0];
        return {
          summary: result.description_en || result.type_name_en || 'Test Result',
          analysis: result.analysis_en || '',
          summaryEn: result.description_en || result.type_name_en || 'Test Result',
          analysisEn: result.analysis_en || '',
          totalScore: totalScore,
          resultType: result.type_code,
          description: result.description_en || ''
        };
      } else {
        // 如果没有数据库结果，返回基本结果
        return {
          summary: `Test completed with score: ${totalScore}`,
          analysis: 'Test analysis not available.',
          summaryEn: `Test completed with score: ${totalScore}`,
          analysisEn: 'Test analysis not available.',
          totalScore: totalScore,
          resultType: 'UNKNOWN'
        };
      }
    } catch (error) {
      console.error(`Error scoring ${testType}:`, error);
      return {
        summary: 'Test scoring error',
        analysis: 'Unable to process test results.',
        summaryEn: 'Test scoring error',
        analysisEn: 'Unable to process test results.',
        totalScore: 0,
        resultType: 'ERROR'
      };
    }
  }

  // DISC 40题测试计算（当前沿用5题映射，取前5题；仅DB英文分析）
  async scoreDisc40(answers) {
    return await this.scoreDisc(answers.slice(0, 5), 'disc40');
  }

  // MBTI测试计算
  async scoreMbti(answers) {
    // 使用与前端一致的题目→维度映射（A=sideA，B=sideB）
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    const mapping = [
      { q:1, axis:'J-P', sideA:'J', sideB:'P' },
      { q:2, axis:'J-P', sideA:'P', sideB:'J' },
      { q:3, axis:'S-N', sideA:'S', sideB:'N' },
      { q:4, axis:'E-I', sideA:'E', sideB:'I' },
      { q:5, axis:'S-N', sideA:'N', sideB:'S' },
      { q:6, axis:'T-F', sideA:'F', sideB:'T' },
      { q:7, axis:'J-P', sideA:'P', sideB:'J' },
      { q:8, axis:'E-I', sideA:'E', sideB:'I' },
      { q:9, axis:'J-P', sideA:'J', sideB:'P' },
      { q:10, axis:'J-P', sideA:'J', sideB:'P' },
      { q:11, axis:'J-P', sideA:'P', sideB:'J' },
      { q:12, axis:'E-I', sideA:'I', sideB:'E' },
      { q:13, axis:'S-N', sideA:'S', sideB:'N' },
      { q:14, axis:'E-I', sideA:'E', sideB:'I' },
      { q:15, axis:'S-N', sideA:'N', sideB:'S' },
      { q:16, axis:'T-F', sideA:'F', sideB:'T' },
      { q:17, axis:'J-P', sideA:'P', sideB:'J' },
      { q:18, axis:'E-I', sideA:'I', sideB:'E' },
      { q:19, axis:'E-I', sideA:'E', sideB:'I' },
      { q:20, axis:'J-P', sideA:'J', sideB:'P' },
      { q:21, axis:'J-P', sideA:'P', sideB:'J' },
      { q:22, axis:'E-I', sideA:'I', sideB:'E' },
      { q:23, axis:'E-I', sideA:'E', sideB:'I' },
      { q:24, axis:'S-N', sideA:'N', sideB:'S' },
      { q:25, axis:'J-P', sideA:'P', sideB:'J' },
      { q:26, axis:'E-I', sideA:'I', sideB:'E' },
      { q:27, axis:'E-I', sideA:'I', sideB:'E' },
      { q:28, axis:'J-P', sideA:'J', sideB:'P' },
      { q:29, axis:'S-N', sideA:'N', sideB:'S' },
      { q:30, axis:'T-F', sideA:'F', sideB:'T' },
      { q:31, axis:'T-F', sideA:'T', sideB:'F' },
      { q:32, axis:'S-N', sideA:'S', sideB:'N' },
      { q:33, axis:'J-P', sideA:'P', sideB:'J' },
      { q:34, axis:'E-I', sideA:'E', sideB:'I' },
      { q:35, axis:'E-I', sideA:'I', sideB:'E' },
      { q:36, axis:'J-P', sideA:'J', sideB:'P' },
      { q:37, axis:'S-N', sideA:'N', sideB:'S' },
      { q:38, axis:'T-F', sideA:'F', sideB:'T' },
      { q:39, axis:'T-F', sideA:'T', sideB:'F' },
      { q:40, axis:'S-N', sideA:'S', sideB:'N' },
      { q:41, axis:'J-P', sideA:'P', sideB:'J' },
      { q:42, axis:'E-I', sideA:'I', sideB:'E' },
      { q:43, axis:'J-P', sideA:'J', sideB:'P' },
      { q:44, axis:'S-N', sideA:'N', sideB:'S' },
      { q:45, axis:'T-F', sideA:'F', sideB:'T' },
      { q:46, axis:'T-F', sideA:'T', sideB:'F' },
      { q:47, axis:'S-N', sideA:'S', sideB:'N' },
      { q:48, axis:'E-I', sideA:'I', sideB:'E' },
      { q:49, axis:'J-P', sideA:'J', sideB:'P' },
      { q:50, axis:'S-N', sideA:'N', sideB:'S' },
      { q:51, axis:'T-F', sideA:'F', sideB:'T' },
      { q:52, axis:'T-F', sideA:'T', sideB:'F' },
      { q:53, axis:'S-N', sideA:'S', sideB:'N' },
      { q:54, axis:'E-I', sideA:'I', sideB:'E' },
      { q:55, axis:'S-N', sideA:'N', sideB:'S' },
      { q:56, axis:'T-F', sideA:'F', sideB:'T' },
      { q:57, axis:'T-F', sideA:'T', sideB:'F' },
      { q:58, axis:'S-N', sideA:'S', sideB:'N' },
      { q:59, axis:'J-P', sideA:'J', sideB:'P' },
      { q:60, axis:'E-I', sideA:'I', sideB:'E' },
      { q:61, axis:'S-N', sideA:'S', sideB:'N' },
      { q:62, axis:'E-I', sideA:'E', sideB:'I' },
      { q:63, axis:'S-N', sideA:'N', sideB:'S' },
      { q:64, axis:'T-F', sideA:'F', sideB:'T' },
      { q:65, axis:'J-P', sideA:'P', sideB:'J' },
      { q:66, axis:'E-I', sideA:'I', sideB:'E' },
      { q:67, axis:'E-I', sideA:'E', sideB:'I' },
      { q:68, axis:'J-P', sideA:'J', sideB:'P' },
      { q:69, axis:'T-F', sideA:'T', sideB:'F' },
      { q:70, axis:'J-P', sideA:'J', sideB:'P' },
      { q:71, axis:'J-P', sideA:'P', sideB:'J' },
      { q:72, axis:'E-I', sideA:'I', sideB:'E' },
      { q:73, axis:'S-N', sideA:'S', sideB:'N' },
      { q:74, axis:'S-N', sideA:'N', sideB:'S' },
      { q:75, axis:'T-F', sideA:'T', sideB:'F' },
      { q:76, axis:'J-P', sideA:'P', sideB:'J' },
      { q:77, axis:'E-I', sideA:'E', sideB:'I' },
      { q:78, axis:'T-F', sideA:'T', sideB:'F' },
      { q:79, axis:'S-N', sideA:'N', sideB:'S' },
      { q:80, axis:'T-F', sideA:'F', sideB:'T' },
      { q:81, axis:'T-F', sideA:'T', sideB:'F' },
      { q:82, axis:'S-N', sideA:'S', sideB:'N' },
      { q:83, axis:'S-N', sideA:'N', sideB:'S' },
      { q:84, axis:'T-F', sideA:'F', sideB:'T' },
      { q:85, axis:'T-F', sideA:'T', sideB:'F' },
      { q:86, axis:'S-N', sideA:'S', sideB:'N' },
      { q:87, axis:'S-N', sideA:'N', sideB:'S' },
      { q:88, axis:'T-F', sideA:'F', sideB:'T' },
      { q:89, axis:'T-F', sideA:'T', sideB:'F' },
      { q:90, axis:'S-N', sideA:'S', sideB:'N' },
      { q:91, axis:'T-F', sideA:'F', sideB:'T' },
      { q:92, axis:'T-F', sideA:'T', sideB:'F' },
      { q:93, axis:'S-N', sideA:'S', sideB:'N' }
    ];

    // 防御性处理：仅计入前 93 题，且仅接受 0/1 两类答案
    const MAX_Q = 93;
    const sanitized = (Array.isArray(answers) ? answers : [])
      .map(v => (v === 0 || v === 1) ? v : (Number(v) === 0 ? 0 : 1))
      .slice(0, MAX_Q);

    sanitized.forEach((answer, idx) => {
      const qnum = idx + 1;
      const m = mapping[qnum - 1];
      if (!m) return;
      const trait = (answer === 0) ? m.sideA : m.sideB;
      if (scores[trait] !== undefined) scores[trait] += 1;
    });
    
    // 确定MBTI类型
    const type = 
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');
    
    // 从数据库获取完整的MBTI描述
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.description_en, rt.type_name_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'mbti' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const mbtiData = result.rows[0];
        return {
          summary: mbtiData.description_en || type,
          analysis: mbtiData.analysis_en || '',
          typeName: mbtiData.type_name_en,
          scores: scores
        };
      }
    } catch (error) {
      console.error('Error fetching MBTI description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: type,
      analysis: `After testing, you are **${type}** personality type.`,
      typeName: type,
      scores: scores
    };
  }

  // Social Anxiety Level Test 计算
  async scoreSocialAnxietyTest(answers) {
    try {
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
      if (totalScore >= 61) {
        resultType = 'SA_SEVERE';
      } else if (totalScore >= 41) {
        resultType = 'SA_MILD';
      } else {
        resultType = 'SA_NONE';
      }
      
      // 从数据库获取结果类型信息
      const resultQuery = await query(`
        SELECT 
          rt.type_code, 
          rt.type_name_en, 
          rt.description_en, 
          rt.analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'social_anxiety_test' AND rt.type_code = $1
      `, [resultType]);
      
      if (resultQuery.rows.length > 0) {
        const result = resultQuery.rows[0];
        return {
          summary: result.description_en || result.type_name_en || resultType,
          analysis: result.analysis_en || '',
          summaryEn: result.description_en || result.type_name_en || resultType,
          analysisEn: result.analysis_en || '',
          totalScore: totalScore,
          resultType: resultType,
          description: result.description_en || ''
        };
      } else {
        // 如果没有找到数据库结果，返回基本结果
        return {
          summary: `Score: ${totalScore}/75`,
          analysis: `Your social anxiety level score is ${totalScore} out of 75.`,
          summaryEn: `Score: ${totalScore}/75`,
          analysisEn: `Your social anxiety level score is ${totalScore} out of 75.`,
          totalScore: totalScore,
          resultType: resultType
        };
      }
    } catch (error) {
      console.error('Error calculating social anxiety test result:', error);
      return {
        summary: 'Calculation Error',
        analysis: 'Unable to calculate test result. Please try again.',
        summaryEn: 'Calculation Error',
        analysisEn: 'Unable to calculate test result. Please try again.'
      };
    }
  }
}

module.exports = new TestLogicService();
