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
  async scoreMgmt(answers) {
    const total = answers.reduce((s, v) => s + (v === 0 ? 1 : 0), 0);
    
    // 根据分数确定结果类型
    let typeCode = '';
    let summary = '';
    if (total <= 5) {
      typeCode = 'POOR';
      summary = 'Poor management ability';
    } else if (total <= 9) {
      typeCode = 'BELOW_AVERAGE';
      summary = 'Below-average management ability';
    } else if (total <= 12) {
      typeCode = 'AVERAGE';
      summary = 'Average management ability';
    } else if (total <= 14) {
      typeCode = 'STRONG';
      summary = 'Strong management ability';
    } else {
      typeCode = 'VERY_STRONG';
      summary = 'Very strong management ability';
    }
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en, rt.description_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'mgmt_en' AND rt.type_code = $1
      `, [typeCode]);
      
      if (result.rows.length > 0) {
        const mgmtData = result.rows[0];
        return {
          summary: mgmtData.description_en || summary,
          summaryEn: mgmtData.description_en || summary,
          analysis: mgmtData.analysis_en || '',
          analysisEn: mgmtData.analysis_en || '',
          typeName: mgmtData.type_name_en,
          typeNameEn: mgmtData.type_name_en,
          total: total,
          type: typeCode
        };
      }
    } catch (error) {
      console.error('Error fetching mgmt description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `Your management ability assessment: **${summary}**\n\nBased on your responses, you scored ${total} out of 15 points. This indicates your current level of management skills across various dimensions including planning, execution, and self-discipline.`,
      analysisEn: `Your management ability assessment: **${summary}**\n\nBased on your responses, you scored ${total} out of 15 points. This indicates your current level of management skills across various dimensions including planning, execution, and self-discipline.`,
      typeName: summary,
      typeNameEn: summary,
      total: total,
      type: typeCode
    };
  }

  // 观察能力测试计算
  async scoreObservation(answers) {
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
    
    // 从数据库获取完整的分析
    try {
      const result = await query(`
        SELECT rt.analysis_en, rt.type_name_en, rt.description_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'observation' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const observationData = result.rows[0];
        return {
          summary: observationData.description_en || summary,
          summaryEn: observationData.description_en || summary,
          analysis: observationData.analysis_en || '',
          analysisEn: observationData.analysis_en || '',
          typeName: observationData.type_name_en,
          typeNameEn: observationData.type_name_en,
          total: total,
          type: type
        };
      }
    } catch (error) {
      console.error('Error fetching observation description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    return {
      summary: summary,
      summaryEn: summary,
      analysis: `Your observation ability assessment: **${summary}**\n\nBased on your responses, you scored ${total} out of 150 points. This indicates your current level of observation skills across various dimensions including detail capture, interpersonal perception, and environmental awareness.`,
      analysisEn: `Your observation ability assessment: **${summary}**\n\nBased on your responses, you scored ${total} out of 150 points. This indicates your current level of observation skills across various dimensions including detail capture, interpersonal perception, and environmental awareness.`,
      typeName: summary,
      typeNameEn: summary,
      total: total,
      type: type
    };
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
        SELECT rt.analysis_en, rt.type_name_en, rt.description_en
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
    
    // 构建类型代码数组用于数据库查询
    const typeCodes = dominantTypes.map(t => `TYPE_${t}`);
    
    // 从数据库获取所有并列类型的完整分析
    try {
      const result = await query(`
        SELECT rt.type_code, rt.type_name_en, rt.description_en, rt.analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'enneagram_en' AND rt.type_code = ANY($1::text[])
        ORDER BY rt.type_code
      `, [typeCodes]);
      
      if (result.rows.length > 0) {
        // 建立映射
        const typeMap = {};
        result.rows.forEach(row => {
          typeMap[row.type_code] = row;
        });
        
        // 构建摘要和分析
        const summaries = [];
        const analyses = [];
        
        for (const typeCode of typeCodes) {
          const row = typeMap[typeCode];
          if (row) {
            const description = row.description_en || row.type_name_en || typeCode;
            summaries.push(description);
            
            if (row.analysis_en) {
              analyses.push(`## ${row.type_name_en || typeCode}\n\n${row.analysis_en}`);
            } else {
              analyses.push(`## ${row.type_name_en || typeCode}`);
            }
          }
        }
        
        return {
          summary: summaries.join(' | '),
          summaryEn: summaries.join(' | '),
          analysis: analyses.join('\n\n---\n\n'),
          analysisEn: analyses.join('\n\n---\n\n'),
          typeName: typeMap[typeCodes[0]]?.type_name_en || '',
          typeNameEn: typeMap[typeCodes[0]]?.type_name_en || '',
          total: maxScore,
          type: typeCodes[0], // 保持第一个类型用于兼容性
          personalityScores: personalityScores,
          dominantTypes: dominantTypes
        };
      }
    } catch (error) {
      console.error('Error fetching enneagram description from database:', error);
    }
    
    // 如果数据库查询失败，返回默认结果
    const fallbackSummary = dominantTypes.length === 1 
      ? `Type ${dominantTypes[0]}: ${typeNames[dominantTypes[0] - 1]}`
      : `Types ${dominantTypes.join(', ')}: ${dominantTypes.map(t => typeNames[t-1]).join(', ')}`;
    
    return {
      summary: fallbackSummary,
      summaryEn: fallbackSummary,
      analysis: `After testing, you are **${fallbackSummary}** personality type.`,
      analysisEn: `After testing, you are **${fallbackSummary}** personality type.`,
      typeName: dominantTypes.length === 1 ? typeNames[dominantTypes[0] - 1] : '',
      typeNameEn: dominantTypes.length === 1 ? typeNames[dominantTypes[0] - 1] : '',
      total: maxScore,
      type: `TYPE_${dominantTypes[0]}`,
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
        SELECT rt.analysis_en, rt.type_name_en, rt.description_en
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
    
    // 从数据库获取完整的分析（支持并列最高分，合并多结果）
    try {
      const types = dominantTypes.length > 1
        ? dominantTypes.map(t => t.type + '_PERSONALITY')
        : [type];

      const result = await query(`
        SELECT rt.type_code, rt.type_name_en, rt.description_en, rt.analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'four_colors_en' AND rt.type_code = ANY($1::text[])
      `, [types]);

      if (result.rows.length > 0) {
        const map = {}; result.rows.forEach(r => { map[r.type_code] = r; });
        const order = ['RED_PERSONALITY','BLUE_PERSONALITY','YELLOW_PERSONALITY','GREEN_PERSONALITY'];
        const fallbackName = {
          RED_PERSONALITY: 'Red personality',
          BLUE_PERSONALITY: 'Blue personality',
          YELLOW_PERSONALITY: 'Yellow personality',
          GREEN_PERSONALITY: 'Green personality'
        };
        const selected = (types || []).slice().sort((a,b)=>order.indexOf(a)-order.indexOf(b));

        const summaries = [];
        const analyses = [];
        selected.forEach(code => {
          const r = map[code] || {};
          const typeName = r.type_name_en || fallbackName[code] || code;
          const s = r.description_en || typeName;
          const a = r.analysis_en || '';
          summaries.push(s);
          if (a) analyses.push(`## ${typeName}\n\n${a}`); else analyses.push(`## ${typeName}`);
        });

        return {
          summary: summaries.join(' | '),
          summaryEn: summaries.join(' | '),
          analysis: analyses.join('\n\n---\n\n'),
          analysisEn: analyses.join('\n\n---\n\n'),
          typeName: selected.join(', '),
          typeNameEn: selected.join(', '),
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
    
    // 从数据库获取完整的分析（支持并列最高分，合并多结果）
    try {
      const types = dominantTypes.length > 1
        ? dominantTypes.map(t => `${t.type}_TYPE`)
        : [type];

      const result = await query(`
        SELECT rt.type_code, rt.type_name_en, rt.description_en, rt.analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'pdp_test_en' AND rt.type_code = ANY($1::text[])
      `, [types]);

      if (result.rows.length > 0) {
        const map = {}; result.rows.forEach(r => { map[r.type_code] = r; });
        const order = ['TIGER_TYPE','PEACOCK_TYPE','KOALA_TYPE','OWL_TYPE','CHAMELEON_TYPE'];
        const selected = (types || []).slice().sort((a,b)=>order.indexOf(a)-order.indexOf(b));

        const summaries = [];
        const analyses = [];
        selected.forEach(code => {
          const r = map[code] || {};
          const s = r.description_en || r.type_name_en || code;
          const a = r.analysis_en || '';
          summaries.push(s);
          if (a) analyses.push(`## ${r.type_name_en || code}\n\n${a}`); else analyses.push(`## ${r.type_name_en || code}`);
        });

        return {
          summary: summaries.join(' | '),
          summaryEn: summaries.join(' | '),
          analysis: analyses.join('\n\n---\n\n'),
          analysisEn: analyses.join('\n\n---\n\n'),
          typeName: selected.join(', '),
          typeNameEn: selected.join(', '),
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
    
    // 更正后的 20 题评分矩阵（每题 [A,B,C] 分值）
    const scoreMatrix = [
      [1,3,5], // 1
      [5,1,3], // 2
      [3,1,5], // 3
      [1,5,3], // 4
      [1,3,5], // 5
      [5,1,3], // 6
      [1,3,5], // 7
      [3,1,5], // 8
      [3,1,5], // 9
      [3,1,5], // 10
      [5,1,3], // 11
      [5,3,1], // 12
      [5,3,1], // 13
      [5,1,3], // 14
      [1,3,5], // 15
      [1,3,5], // 16
      [5,1,3], // 17
      [1,5,3], // 18
      [5,1,3], // 19
      [1,3,5]  // 20
    ];
    
    for (let i = 0; i < answers.length && i < scoreMatrix.length; i++) {
      const answerIndex = answers[i];
      const row = scoreMatrix[i];
      if (Array.isArray(row) && answerIndex >= 0 && answerIndex < row.length) {
        total += row[answerIndex];
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
    const asYes = (idx) => (idx === 0 ? 1 : 0); // 前端答案索引：0=Yes(A)，1=No(B)

    realisticQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        realisticScore += asYes(answers[qIndex]);
      }
    });
    
    investigativeQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        investigativeScore += asYes(answers[qIndex]);
      }
    });
    
    artisticQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        artisticScore += asYes(answers[qIndex]);
      }
    });
    
    socialQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        socialScore += asYes(answers[qIndex]);
      }
    });
    
    enterprisingQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        enterprisingScore += asYes(answers[qIndex]);
      }
    });
    
    conventionalQuestions.forEach(qIndex => {
      if (qIndex < answers.length) {
        conventionalScore += asYes(answers[qIndex]);
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
    
    // 从数据库获取完整的分析（支持并列最高分，合并多结果）
    try {
      const types = dominantTypes.length > 1
        ? dominantTypes.map(obj => obj.type)
        : [type];

      const result = await query(`
        SELECT rt.type_code, rt.type_name_en, rt.description_en, rt.analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'holland_test_en' AND rt.type_code = ANY($1::text[])
      `, [types]);

      if (result.rows.length > 0) {
        const map = {}; result.rows.forEach(r => { map[r.type_code] = r; });
        const order = ['REALISTIC','INVESTIGATIVE','ARTISTIC','SOCIAL','ENTERPRISING','CONVENTIONAL'];
        const selected = (types || []).slice().sort((a,b)=>order.indexOf(a)-order.indexOf(b));

        const summaries = [];
        const analyses = [];
        selected.forEach(code => {
          const r = map[code] || {};
          const s = r.description_en || r.type_name_en || code;
          const a = r.analysis_en || '';
          summaries.push(s);
          if (a) analyses.push(`## ${r.type_name_en || code}\n\n${a}`); else analyses.push(`## ${r.type_name_en || code}`);
        });

        return {
          summary: summaries.join(' | '),
          summaryEn: summaries.join(' | '),
          analysis: analyses.join('\n\n---\n\n'),
          analysisEn: analyses.join('\n\n---\n\n'),
          typeName: selected.join(', '),
          typeNameEn: selected.join(', '),
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

  // Temperament Type Test 计算（四种气质：CHOLERIC/SANGUINE/PHLEGMATIC/MELANCHOLIC）
  async scoreTemperamentType(answers) {
    try {
      // 读取题库中每题各选项携带的四维度得分（存于 score_value JSON）
      const qres = await query(`
        SELECT q.order_index, o.option_number, o.score_value
        FROM questions q
        JOIN question_options o ON o.question_id = q.id
        WHERE q.project_id = (SELECT id FROM test_projects WHERE project_id = 'temperament_type_test')
        ORDER BY q.order_index ASC, o.option_number ASC
      `);

      // scoreMap: question_number -> [{CHOLERIC: x, SANGUINE: y, PHLEGMATIC: z, MELANCHOLIC: w} per option]
      const scoreMap = new Map();
      for (const row of qres.rows) {
        const qn = Number(row.question_number);
        if (!scoreMap.has(qn)) scoreMap.set(qn, []);
        const arr = scoreMap.get(qn);
        const optIdx = Number(row.option_number) - 1;
        let sv = { CHOLERIC: 0, SANGUINE: 0, PHLEGMATIC: 0, MELANCHOLIC: 0 };
        try {
          const v = row.score_value || {};
          if (v && typeof v === 'object') {
            sv = {
              CHOLERIC: Number(v.CHOLERIC ?? 0),
              SANGUINE: Number(v.SANGUINE ?? 0),
              PHLEGMATIC: Number(v.PHLEGMATIC ?? 0),
              MELANCHOLIC: Number(v.MELANCHOLIC ?? 0)
            };
          }
        } catch(_) {}
        arr[optIdx] = sv;
      }

      // 汇总分数
      const totals = { CHOLERIC: 0, SANGUINE: 0, PHLEGMATIC: 0, MELANCHOLIC: 0 };
      for (let i = 0; i < answers.length; i++) {
        const qn = i + 1;
        const optIndex = Number(answers[i]);
        const opts = scoreMap.get(qn) || [];
        if (optIndex >= 0 && optIndex < opts.length) {
          const sv = opts[optIndex] || {};
          totals.CHOLERIC += Number(sv.CHOLERIC ?? 0);
          totals.SANGUINE += Number(sv.SANGUINE ?? 0);
          totals.PHLEGMATIC += Number(sv.PHLEGMATIC ?? 0);
          totals.MELANCHOLIC += Number(sv.MELANCHOLIC ?? 0);
        }
      }

      // 找出最高分与并列项（支持多结果合并）
      const order = ['CHOLERIC','SANGUINE','PHLEGMATIC','MELANCHOLIC'];
      const maxScore = Math.max(totals.CHOLERIC, totals.SANGUINE, totals.PHLEGMATIC, totals.MELANCHOLIC);
      const tops = order.filter(k => totals[k] === maxScore);

      // 批量读取结果文案
      const r = await query(`
        SELECT type_code, type_name_en, description_en, analysis_en
        FROM result_types
        WHERE project_id = (SELECT id FROM test_projects WHERE project_id = 'temperament_type_test')
          AND type_code = ANY($1::text[])
      `, [tops]);

      // 建立映射并按既定顺序输出
      const map = {};
      (r.rows || []).forEach(x => { map[x.type_code] = x; });
      const summaries = [];
      const analyses = [];
      for (const code of tops) {
        const row = map[code] || {};
        const s = row.description_en || row.type_name_en || code;
        const a = row.analysis_en || '';
        summaries.push(s);
        if (a) {
          // 为便于阅读，合并时加上类型小标题
          analyses.push(`## ${row.type_name_en || code}\n\n${a}`);
        } else {
          analyses.push(`## ${row.type_name_en || code}`);
        }
      }

      return {
        summary: summaries.join(' | '),
        analysis: analyses.join('\n\n---\n\n'),
        summaryEn: summaries.join(' | '),
        analysisEn: analyses.join('\n\n---\n\n'),
        details: { totals, tops }
      };
    } catch (e) {
      console.error('Error scoring temperament_type_test:', e);
      return {
        summary: 'Test scoring error',
        analysis: 'Unable to process test results.',
        summaryEn: 'Test scoring error',
        analysisEn: 'Unable to process test results.'
      };
    }
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
    const key = (testType || '').toString().trim().toLowerCase();
    switch (key) {
      case 'disc':
        return await this.scoreDisc(answers, 'disc');
      case 'mgmt':
      case 'mgmt_en':
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
      case 'temperament_type_test':
        return await this.scoreTemperamentType(answers);
      case 'kelsey_test':
        return await this.scoreKelseyTest(answers);
      case 'creativity_test':
        return await this.scoreCreativityTest(answers);
      case 'anxiety_depression_test':
      case 'anxiety_depression':
      case 'anxiety_and_depression':
      case 'anxiety_and_depression_test':
        return await this.scoreAnxietyDepressionTest(answers);
      case 'social_anxiety_test':
        return await this.scoreSocialAnxietyTest(answers);
      case 'loneliness_test':
        return await this.scoreLonelinessTest(answers);
      case 'violence_index':
        return await this.scoreViolenceIndex(answers);
      case 'personality_charm':
      case 'personality_charm_1min':
        return await this.scorePersonalityCharm(answers);
      case 'observation':
        return await this.scoreObservation(answers);
      case 'personality_charm_1min':
      case 'phil_test_en':
      case 'temperament_type_test':
      case 'violence_index':
        return await this.scoreGenericTest(testType, answers);
      default:
        // 对未显式列出的测试类型，统一走通用评分逻辑（按 result_types 兜底）
        return await this.scoreGenericTest(key, answers);
    }
  }

  // 通用测试评分方法
  async scoreGenericTest(testType, answers) {
    try {
      // 计算总分（简单累加：答案索引按 0,1,2... 计分）
      const totalScore = (Array.isArray(answers) ? answers : []).reduce((sum, answer) => sum + (Number.isFinite(answer) ? Number(answer) : 0), 0);

      // 读取该项目的所有结果区间
      const resultQuery = await query(`
        SELECT 
          rt.type_code, 
          rt.type_name_en, 
          rt.description_en, 
          rt.analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = $1
        ORDER BY rt.type_name_en ASC
      `, [testType]);

      if (resultQuery.rows.length > 0) {
        // 解析区间，如 "7-12"、"13–17"、"24 - 29"、"11-42"
        const ranges = resultQuery.rows.map(r => {
          const label = (r.type_name_en || '').toString();
          const nums = label.match(/\d+/g) || [];
          let min = null, max = null;
          if (nums.length >= 2) { min = parseInt(nums[0], 10); max = parseInt(nums[1], 10); }
          else if (nums.length === 1) { min = parseInt(nums[0], 10); max = min; }
          return { row: r, min, max, label };
        }).filter(x => x.min !== null);

        // 选中匹配 totalScore 的区间（闭区间 [min,max]）；若无匹配，取最接近的
        let chosen = null;
        for (const item of ranges) {
          if (item.max == null) { if (totalScore >= item.min) { chosen = item; break; } }
          else if (totalScore >= item.min && totalScore <= item.max) { chosen = item; break; }
        }
        if (!chosen) {
          // 按 min 升序，选择最后一个 min <= totalScore，否则选择最小 min 的区间
          const sorted = ranges.slice().sort((a,b) => (a.min - b.min));
          const le = sorted.filter(it => totalScore >= it.min);
          chosen = le.length ? le[le.length - 1] : sorted[0];
        }

        const r = chosen.row;
        return {
          summary: r.description_en || r.type_name_en || 'Test Result',
          analysis: r.analysis_en || '',
          summaryEn: r.description_en || r.type_name_en || 'Test Result',
          analysisEn: r.analysis_en || '',
          totalScore: totalScore,
          resultType: r.type_code,
          description: r.description_en || '',
          details: { rangeLabel: chosen.label, rangeMin: chosen.min, rangeMax: chosen.max }
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

  // Test your creativity 精确计分（按数据库中每个选项的 score_value.score 求和）
  async scoreCreativityTest(answers) {
    try {
      // 读取所有题目的选项评分
      const qres = await query(`
        SELECT q.order_index, o.option_number, o.score_value
        FROM questions q
        JOIN question_options o ON o.question_id = q.id
        WHERE q.project_id = (SELECT id FROM test_projects WHERE project_id = 'creativity_test')
        ORDER BY q.order_index ASC, o.option_number ASC
      `);

      const scoreMap = new Map();
      for (const row of qres.rows) {
        const qn = Number(row.question_number);
        if (!scoreMap.has(qn)) scoreMap.set(qn, []);
        const arr = scoreMap.get(qn);
        const optIdx = Number(row.option_number) - 1;
        let s = 0;
        try {
          const v = row.score_value || {};
          s = typeof v === 'object' && v !== null ? (v.score ?? 0) : 0;
        } catch(_) { s = 0; }
        arr[optIdx] = s;
      }

      // 求总分（answers 为各题选项索引 0..n）
      let totalScore = 0;
      for (let i = 0; i < answers.length; i++) {
        const qn = i + 1;
        const optIndex = Number(answers[i]);
        const arr = scoreMap.get(qn) || [];
        if (optIndex >= 0 && optIndex < arr.length) totalScore += (arr[optIndex] || 0);
      }

      // 读取区间并匹配
      const rt = await query(`
        SELECT rt.type_code, rt.type_name_en, rt.description_en, rt.analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'creativity_test'
        ORDER BY rt.type_name_en ASC
      `);
      if (rt.rows.length > 0) {
        const ranges = rt.rows.map(r => {
          const label = (r.type_name_en || '').toString();
          const nums = label.match(/\d+/g) || [];
          let min = null, max = null;
          if (nums.length >= 2) { min = parseInt(nums[0], 10); max = parseInt(nums[1], 10); }
          else if (nums.length === 1) { min = parseInt(nums[0], 10); max = min; }
          return { row: r, min, max, label };
        }).filter(x => x.min !== null);

        let chosen = null;
        for (const item of ranges) {
          if (item.max == null) { if (totalScore >= item.min) { chosen = item; break; } }
          else if (totalScore >= item.min && totalScore <= item.max) { chosen = item; break; }
        }
        if (!chosen) {
          const sorted = ranges.slice().sort((a,b) => a.min - b.min);
          const le = sorted.filter(it => totalScore >= it.min);
          chosen = le.length ? le[le.length - 1] : sorted[0];
        }

        const r = chosen.row;
        return {
          summary: r.description_en || r.type_name_en || 'Test Result',
          analysis: r.analysis_en || '',
          summaryEn: r.description_en || r.type_name_en || 'Test Result',
          analysisEn: r.analysis_en || '',
          totalScore,
          resultType: r.type_code,
          description: r.description_en || '',
          details: { rangeLabel: chosen.label, rangeMin: chosen.min, rangeMax: chosen.max }
        };
      }

      return {
        summary: `Test completed with score: ${totalScore}`,
        analysis: 'Result ranges not configured.',
        summaryEn: `Test completed with score: ${totalScore}`,
        analysisEn: 'Result ranges not configured.',
        totalScore,
        resultType: 'UNKNOWN'
      };
    } catch (e) {
      console.error('Error scoring creativity_test:', e);
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

  // Violence Index: 选项直接对应结果（resultCode），不按总分
  async scoreViolenceIndex(answers) {
    try {
      // 读取每题各选项附带的 resultCode（存放在 score_value JSON 中）
      const qres = await query(`
        SELECT q.order_index as question_number, o.option_number, o.score_value
        FROM questions q
        JOIN question_options o ON o.question_id = q.id
        WHERE q.project_id = (SELECT id FROM test_projects WHERE project_id = 'violence_index')
        ORDER BY q.order_index ASC, o.option_number ASC
      `);

      // 构建跳转表：题号 -> 选项数组（包含 resultCode 与 next）
      const jumpMap = new Map();
      for (const row of qres.rows) {
        const qn = Number(row.question_number);
        if (!jumpMap.has(qn)) jumpMap.set(qn, []);
        const arr = jumpMap.get(qn);
        const optIdx = Number(row.option_number) - 1;
        let rc = null;
        let nx = null;
        try {
          const v = row.score_value || {};
          rc = (v && typeof v === 'object') ? (v.resultCode ?? null) : null;
          nx = (v && typeof v === 'object') ? (v.next ?? null) : null;
        } catch(_) { rc = null; nx = null; }
        arr[optIdx] = { resultCode: rc, next: nx };
      }

      // 依据答案顺序，按 next 指针从第1题开始逐题跳转，取最后一个非空 resultCode
      let currentQ = 1;
      let finalCode = null;
      const SAFE_MAX_STEPS = 50;
      let step = 0;
      for (let i = 0; i < answers.length && step < SAFE_MAX_STEPS; i++, step++) {
        const optIndex = Number(answers[i]);
        const options = jumpMap.get(currentQ) || [];
        const picked = (optIndex >= 0 && optIndex < options.length) ? options[optIndex] : null;
        if (!picked) break;
        if (picked.resultCode) finalCode = String(picked.resultCode).trim();
        // 若有 next 继续跳，否则终止
        if (picked.next != null && picked.next !== '') {
          const nxt = Number(picked.next);
          currentQ = Number.isFinite(nxt) ? nxt : currentQ + 1; // 兜底：无效 next 则顺延
        } else {
          break;
        }
      }

      // 生成候选码集合，尽量覆盖所有历史/新格式：
      // - 'RESULT1', 'RESULT 1', 'Result1', 'Result 1'
      // - 'VI_RES_1'
      // - 题库里可能直接存 'Result 1' 为 type_code 或 type_name_en
      const candidates = [];
      if (finalCode) {
        const raw = finalCode;
        candidates.push(raw);
        // 将 "Result2" 归一化为 "Result 2"
        const mResult = raw.match(/^result\s*_?(\d)$/i);
        if (mResult) {
          const n = mResult[1];
          candidates.push(`Result ${n}`);
          candidates.push(`VI_RES_${n}`);
        }
        // VI_RES_1 → 也加入 Result 1
        const mVi = raw.match(/^vi_res_(\d)$/i);
        if (mVi) {
          const n = mVi[1];
          candidates.push(`VI_RES_${n}`);
          candidates.push(`Result ${n}`);
        }
        // 若原始是 'Result 2'，也补充 VI_RES_2
        const mResSp = raw.match(/^result\s+(\d)$/i);
        if (mResSp) {
          const n = mResSp[1];
          candidates.push(`VI_RES_${n}`);
          candidates.push(`Result ${n}`);
        }
      }

      // 去重，保持顺序
      const uniqCandidates = Array.from(new Set(candidates)).filter(Boolean);

      let row = null;
      for (const key of uniqCandidates) {
        // 先按 type_code
        const r1 = await query(`
          SELECT description_en, analysis_en, type_name_en
          FROM result_types WHERE project_id = (SELECT id FROM test_projects WHERE project_id='violence_index')
          AND type_code = $1
          LIMIT 1
        `, [key]);
        if (r1.rows[0]) { row = r1.rows[0]; break; }
        // 再按 type_name_en
        const r2 = await query(`
          SELECT description_en, analysis_en, type_name_en
          FROM result_types WHERE project_id = (SELECT id FROM test_projects WHERE project_id='violence_index')
          AND type_name_en = $1
          LIMIT 1
        `, [key]);
        if (r2.rows[0]) { row = r2.rows[0]; break; }
      }

      if (!row) {
        // 若未能解析出 resultCode，则返回兜底
        return {
          summary: 'Violence Index: (undetermined)',
          analysis: '',
          summaryEn: 'Violence Index: (undetermined)',
          analysisEn: ''
        };
      }

      return {
        summary: row.description_en || row.type_name_en || 'Violence Index',
        analysis: row.analysis_en || '',
        summaryEn: row.description_en || row.type_name_en || 'Violence Index',
        analysisEn: row.analysis_en || ''
      };
    } catch (e) {
      console.error('Error scoring violence_index:', e);
      return {
        summary: 'Calculation Error',
        analysis: 'Unable to calculate test result.',
        summaryEn: 'Calculation Error',
        analysisEn: 'Unable to calculate test result.'
      };
    }
  }

  // Personality Charm: 与 violence_index 一样为分支跳转题，选项可直达结果码（resultCode）
  async scorePersonalityCharm(answers) {
    try {
      // 读取每题各选项附带的 resultCode/next（存放在 score_value JSON 中）
      const qres = await query(`
        SELECT q.order_index as question_number, o.option_number, o.score_value
        FROM questions q
        JOIN question_options o ON o.question_id = q.id
        WHERE q.project_id = (SELECT id FROM test_projects WHERE project_id = 'personality_charm_1min')
        ORDER BY q.order_index ASC, o.option_number ASC
      `);

      const jumpMap = new Map();
      for (const row of qres.rows) {
        const qn = Number(row.question_number);
        if (!jumpMap.has(qn)) jumpMap.set(qn, []);
        const arr = jumpMap.get(qn);
        const optIdx = Number(row.option_number) - 1;
        let rc = null;
        let nx = null;
        try {
          const v = row.score_value || {};
          rc = (v && typeof v === 'object') ? (v.resultCode ?? null) : null;
          nx = (v && typeof v === 'object') ? (v.next ?? null) : null;
        } catch(_) { rc = null; nx = null; }
        arr[optIdx] = { resultCode: rc, next: nx };
      }

      // 依据答案顺序，从第1题开始沿 next 跳转，取最后一个非空 resultCode
      let currentQ = 1;
      let finalCode = null;
      const SAFE_MAX_STEPS = 50;
      let step = 0;
      for (let i = 0; i < answers.length && step < SAFE_MAX_STEPS; i++, step++) {
        const optIndex = Number(answers[i]);
        const options = jumpMap.get(currentQ) || [];
        const picked = (optIndex >= 0 && optIndex < options.length) ? options[optIndex] : null;
        if (!picked) break;
        if (picked.resultCode) finalCode = String(picked.resultCode).trim();
        if (picked.next != null && picked.next !== '') {
          const nxt = Number(picked.next);
          currentQ = Number.isFinite(nxt) ? nxt : currentQ + 1;
        } else {
          break;
        }
      }

      if (!finalCode) {
        return {
          summary: 'Personality Charm: (undetermined)',
          analysis: '',
          summaryEn: 'Personality Charm: (undetermined)',
          analysisEn: ''
        };
      }

      // 直接按 type_code 查找描述与分析（RESULT1..RESULT5）
      const r1 = await query(`
        SELECT description_en, analysis_en, type_name_en
        FROM result_types 
        WHERE project_id = (SELECT id FROM test_projects WHERE project_id='personality_charm_1min')
          AND type_code = $1
        LIMIT 1
      `, [finalCode]);

      const row = r1.rows[0] || null;
      if (!row) {
        return {
          summary: 'Personality Charm',
          analysis: '',
          summaryEn: 'Personality Charm',
          analysisEn: ''
        };
      }

      return {
        summary: row.description_en || row.type_name_en || 'Personality Charm',
        analysis: row.analysis_en || '',
        summaryEn: row.description_en || row.type_name_en || 'Personality Charm',
        analysisEn: row.analysis_en || ''
      };
    } catch (e) {
      console.error('Error scoring personality_charm:', e);
      return {
        summary: 'Calculation Error',
        analysis: 'Unable to calculate test result.',
        summaryEn: 'Calculation Error',
        analysisEn: 'Unable to calculate test result.'
      };
    }
  }

  // DISC 40题测试计算（使用40题映射表）
  async scoreDisc40(answers) {
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

    const counts = { D: 0, I: 0, S: 0, C: 0 };
    answers.forEach((optIndex, qi) => {
      const typeKey = (map[qi] || map[0])[optIndex];
      if (counts[typeKey] !== undefined) counts[typeKey] += 1;
    });

    const max = Math.max(counts.D, counts.I, counts.S, counts.C);
    const tops = Object.entries(counts).filter(([_, v]) => v === max).map(([k]) => k);

    // 尝试从数据库读取英文分析
    const dbMap = await this.fetchDiscFromDatabase('disc40', tops);
    if (dbMap) {
      const names = tops.map(k => (dbMap[k] && dbMap[k].type_name_en) ? dbMap[k].type_name_en : k);
      const analysis = tops.map(k => (dbMap[k] && dbMap[k].analysis_en) ? dbMap[k].analysis_en : '').filter(Boolean).join('\n\n');
      return { counts, tops, summary: names.join(', '), analysis };
    }

    // 无数据库内容时，返回基本结果
    const names = { D: 'Dominance', I: 'Influence', S: 'Steadiness', C: 'Compliance' };
    const summary = tops.length ? tops.map(k => names[k]).join(', ') : 'No dominant traits';
    return { counts, tops, summary, analysis: '' };
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

  // Social Test Anxiety Test 计算（改为DB驱动，每题每选项取score_value.score）
  async scoreSocialAnxietyTest(answers) {
    try {
      // 读取数据库里该项目所有题目的选项分值（按题号、选项序）
      const qres = await query(`
        SELECT 
          COALESCE(
            q.order_index,
            ROW_NUMBER() OVER (ORDER BY q.id)
          ) AS qn,
          o.option_number,
          o.score_value
        FROM questions q
        JOIN question_options o ON o.question_id = q.id
        WHERE q.project_id = (SELECT id FROM test_projects WHERE project_id = 'social_anxiety_test')
        ORDER BY qn ASC, o.option_number ASC
      `);

      let totalScore = 0;
      if (qres.rows.length > 0) {
        // 构建 question_number -> [scores per option_index(0-based)]
        const scoreMap = new Map();
        for (const row of qres.rows) {
          const qn = Number(row.qn);
          if (!scoreMap.has(qn)) scoreMap.set(qn, []);
          const arr = scoreMap.get(qn);
          const optIdx = Number(row.option_number) - 1; // DB从1开始，前端answers从0开始
          let s = 0;
          try {
            const v = row.score_value;
            if (v && typeof v === 'object') {
              const raw = (v.score ?? v.value ?? 0);
              let n = Number(raw) || 0;
              if (n > 5) n = n - 4; // 规范化到1..5（DB若存7/9等）
              s = n;
            } else if (typeof v === 'string') {
              const n = Number.parseFloat(v);
              const nn = Number.isFinite(n) ? n : 0;
              s = nn > 5 ? (nn - 4) : nn;
            } else if (typeof v === 'number') {
              const nn = Number.isFinite(v) ? v : 0;
              s = nn > 5 ? (nn - 4) : nn;
            } else {
              s = 0;
            }
          } catch (_) { s = 0; }
          arr[optIdx] = s;
        }
        // 标准化反向题（若DB未反向，则对 3/6/10/15 题将分值数组反转，使 A..E 从大到小）
        const reversedSet = new Set([3,6,10,15]);
        for (const [qn, arr] of scoreMap.entries()) {
          if (reversedSet.has(qn) && Array.isArray(arr) && arr.length >= 5) {
            // 固定反向：3/6/10/15 题一律按反向处理
            arr.reverse();
            scoreMap.set(qn, arr);
          }
        }
        // 逐题累加得分
        for (let i = 0; i < answers.length && i < 50; i++) {
          const qn = i + 1;
          const optIndex = Number(answers[i]);
          const arr = scoreMap.get(qn) || [];
          if (optIndex >= 0 && optIndex < arr.length) totalScore += (arr[optIndex] || 0);
        }
      } else {
        // Fallback：若DB无配置，按标准SA量表位置反向(3,6,10,15)进行计分
        const reversed = new Set([3,6,10,15]);
        for (let i = 0; i < answers.length && i < 15; i++) {
          const qi = i + 1;
          const optIndex = Number(answers[i]); // 0..4 对应 A..E
          if (optIndex < 0 || optIndex > 4 || Number.isNaN(optIndex)) continue;
          const score = reversed.has(qi) ? (5 - optIndex) : (optIndex + 1);
          totalScore += score;
        }
      }

      // 区间映射与原来保持一致
      let resultType = '';
      if (totalScore >= 61) resultType = 'SA_SEVERE';
      else if (totalScore >= 41) resultType = 'SA_MILD';
      else resultType = 'SA_NONE';

      // 读取对应类型文案
      const resultQuery = await query(`
        SELECT description_en, analysis_en
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'social_anxiety_test' AND rt.type_code = $1
        LIMIT 1
      `, [resultType]);

      const row = resultQuery.rows[0] || {};
      return {
        summary: row.description_en || resultType,
        analysis: row.analysis_en || '',
        summaryEn: row.description_en || resultType,
        analysisEn: row.analysis_en || '',
        totalScore,
        resultType
      };
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

  // Loneliness Test 计算
  async scoreLonelinessTest(answers) {
    try {
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
      if (totalScore >= 0 && totalScore <= 2) {
        resultType = 'LONELY_10';
      } else if (totalScore >= 3 && totalScore <= 5) {
        resultType = 'LONELY_30';
      } else if (totalScore >= 6 && totalScore <= 8) {
        resultType = 'LONELY_70';
      } else if (totalScore >= 9 && totalScore <= 10) {
        resultType = 'LONELY_90';
      } else {
        // 边界情况处理
        resultType = totalScore <= 2 ? 'LONELY_10' : 'LONELY_90';
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
        WHERE tp.project_id = 'loneliness_1min' AND rt.type_code = $1
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
        // 如果没有找到数据库结果，使用硬编码的分析内容
        let description = '';
        let analysis = '';
        
        if (totalScore >= 0 && totalScore <= 2) {
          description = 'Loneliness Index: 10%';
          analysis = '## Loneliness Index: 10%\n\nYou don\'t feel lonely at all. On the contrary, you have an optimistic personality and believe simplicity is a kind of happiness. You enjoy the time laughing and playing with friends, and you can always face difficulties calmly — there\'s no problem that a meal can\'t solve; if there is, have two meals.';
        } else if (totalScore >= 3 && totalScore <= 5) {
          description = 'Loneliness Index: 30%';
          analysis = '## Loneliness Index: 30%\n\nYou take gains and losses in life lightly. Although you inevitably feel down sometimes, who hasn\'t encountered bad things? When facing setbacks, you can adjust yourself positively. When you feel depressed or lonely inside, you will also take the initiative to find someone to talk to, or distract yourself through other ways.';
        } else if (totalScore >= 6 && totalScore <= 8) {
          description = 'Loneliness Index: 70%';
          analysis = '## Loneliness Index: 70%\n\nThe saying "the older you grow, the lonelier you become" seems to fit your current state of mind perfectly. The days of youth are always particularly memorable; when you look back on those times, it seems you were always very happy. Troubles back then were simple, and the teenagers back then were easily satisfied. But as you grow older, it becomes harder and harder to find a confidant. Gradually, people get used to loneliness and dare not get close to each other.';
        } else if (totalScore >= 9 && totalScore <= 10) {
          description = 'Loneliness Index: 90%';
          analysis = '## Loneliness Index: 90%\n\nYou always get used to keeping your thoughts to yourself and can\'t be open and honest with others, so no one else can walk into your heart. Therefore, you are very lonely deep down and feel that there is no one around who truly understands you. Over time, you may have gotten used to loneliness — it even gives you a good protection, allowing you to ignore the disputes of the outside world.';
        } else {
          description = 'Loneliness Index: 30%';
          analysis = 'Unable to determine loneliness level. Please retake the test.';
        }
        
        return {
          summary: description,
          analysis: analysis,
          summaryEn: description,
          analysisEn: analysis,
          totalScore: totalScore,
          resultType: resultType
        };
      }
    } catch (error) {
      console.error('Error calculating loneliness test result:', error);
      return {
        summary: 'Calculation Error',
        analysis: 'Unable to calculate test result. Please try again.',
        summaryEn: 'Calculation Error',
        analysisEn: 'Unable to calculate test result. Please try again.'
      };
    }
  }

  // Anxiety and Depression Level Test 计算
  async scoreAnxietyDepressionTest(answers) {
    try {
      // 读取题目与选项的实际评分（score_value.score），确保正反向题按DB计算
      const qres = await query(`
        SELECT q.order_index, o.option_number, o.score_value
        FROM questions q
        JOIN question_options o ON o.question_id = q.id
        WHERE q.project_id = (SELECT id FROM test_projects WHERE project_id = 'anxiety_depression_test')
        ORDER BY q.order_index ASC, o.option_number ASC
      `);

      // 构建 (question_number -> [scores per option_number]) 的映射
      const scoreMap = new Map();
      for (const row of qres.rows) {
        const qn = Number(row.question_number);
        if (!scoreMap.has(qn)) scoreMap.set(qn, []);
        const arr = scoreMap.get(qn);
        const optionIdx = Number(row.option_number) - 1;
        let score = 0;
        try {
          const json = row.score_value || {};
          score = typeof json === 'object' && json !== null ? (json.score ?? 0) : 0;
        } catch (_) { score = 0; }
        arr[optionIdx] = score;
      }

      // HADS 子量表划分：A(焦虑)=1,3,5,7,9,11,13；D(抑郁)=2,4,6,8,10,12,14
      const anxietySet = new Set([1,3,5,7,9,11,13]);
      const depressionSet = new Set([2,4,6,8,10,12,14]);

      let anxietyScore = 0;
      let depressionScore = 0;
      for (let i = 0; i < answers.length && i < 14; i++) {
        const qn = i + 1;
        const optIndex = Number(answers[i]);
        const optionsScores = scoreMap.get(qn) || [];
        const s = (optIndex >= 0 && optIndex < optionsScores.length) ? (optionsScores[optIndex] || 0) : 0;
        if (anxietySet.has(qn)) anxietyScore += s; else if (depressionSet.has(qn)) depressionScore += s;
      }

      // 分段：0-7 Normal；8-10 Borderline；11-42 Abnormal（根据更正后的量表上限）
      const band = (v) => (v <= 7 ? 'Normal' : (v <= 10 ? 'Borderline' : 'Abnormal'));
      const anxietyBand = band(anxietyScore);
      const depressionBand = band(depressionScore);

      // 选取更严重的等级映射到 AD_* 档位，按要求：Result 用 description_en，Analysis 用 analysis_en
      // 严重度：Abnormal > Borderline > Normal
      const severityRank = { Normal: 0, Borderline: 1, Abnormal: 2 };
      const worstBand = (severityRank[anxietyBand] >= severityRank[depressionBand]) ? anxietyBand : depressionBand;
      const typeCode = worstBand === 'Abnormal' ? 'AD_OBVIOUS' : (worstBand === 'Borderline' ? 'AD_MAYBE' : 'AD_NONE');

      // 读取对应档位的 description_en / analysis_en
      const r = await query(`
        SELECT description_en, analysis_en
        FROM result_types
        WHERE project_id = (SELECT id FROM test_projects WHERE project_id = 'anxiety_depression_test')
          AND type_code = $1
      `, [typeCode]);

      const resultRow = r.rows[0] || {};
      const resultSummary = resultRow.description_en || `${typeCode}`;
      const resultAnalysis = resultRow.analysis_en || '';

      return {
        summary: resultSummary,
        analysis: resultAnalysis,
        summaryEn: resultSummary,
        analysisEn: resultAnalysis,
        totalScore: anxietyScore + depressionScore,
        resultType: typeCode,
        details: { anxietyScore, depressionScore, anxietyBand, depressionBand }
      };
    } catch (error) {
      console.error('Error calculating anxiety & depression test result:', error);
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
