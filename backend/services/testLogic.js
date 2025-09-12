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
      D: 'Dominance－支配型/控制者', 
      I: 'Influence－活泼型/社交者', 
      S: 'Steadiness－稳定型/支持者', 
      C: 'Compliance－完美型/服从者' 
    };

    this.discAnalysis = {
      D: '高D型特质的人可以称为是"天生的领袖"。\n\n在情感方面，D型人一个坚定果敢的人，酷好变化，喜欢控制，干劲十足，独立自主，超级自信。可是，由于比较不会顾及别人的感受，所以显得粗鲁、霸道、没有耐心、穷追不舍、不会放松。D型人不习惯与别人进行感情上的交流，不会恭维人，不喜欢眼泪，匮乏同情心。\n\n在工作方面，D型人是一个务实和讲究效率的人，目标明确，眼光全面，组织力强，行动迅速，解决问题不过夜，果敢坚持到底，在反对声中成长。但是，因为过于强调结果，D型人往往容易忽视细节，处理问题不够细致。爱管人、喜欢支使他人的特点使得D型人能够带动团队进步，但也容易激起同事的反感。\n\n在人际关系方面，D型人喜欢为别人做主，虽然这样能够帮助别人做出选择，但也容易让人有强迫感。由于关注自己的目标，D型人在乎的是别人的可利用价值。喜欢控制别人，不会说对不起。\n\n描述性词语：积级进取、争强好胜、强势、爱追根究底、直截了当、主动的开拓者、坚持意见、自信、直率',
      I: '高I型特质的人可以称为是"天生的社交家"。\n\n在情感方面，I型人是一个热情洋溢的人，乐观向上，善于表达，富有感染力，喜欢与人交往，充满活力。但是，由于过于乐观，I型人往往缺乏耐心，容易冲动，不够专注，有时显得不够稳重。\n\n在工作方面，I型人是一个富有创意和想象力的人，善于激励他人，具有良好的沟通能力，能够营造积极的工作氛围。但是，由于缺乏条理性，I型人往往容易分心，难以专注于细节工作，有时显得不够务实。\n\n在人际关系方面，I型人是一个受欢迎的人，善于建立人际关系，能够快速融入新环境，具有良好的团队合作精神。但是，由于过于关注他人的认可，I型人有时会显得不够独立，容易受到他人影响。\n\n描述性词语：热情洋溢、乐观向上、善于表达、富有感染力、充满活力、富有创意、善于激励、沟通能力强',
      S: '高S型的人通常较为平和，知足常乐，不愿意主动前进。\n\n在情感方面，S型人是一个温和主义者，悠闲，平和，有耐心，感情内藏，待人和蔼，乐于倾听，遇事冷静，随遇而安。S型喜欢使用一句口头禅："不过如此。"这个特点使得S型总是缺乏热情，不愿改变。\n\n在工作方面，S型能够按部就班地管理事务，胜任工作并能够持之以恒。奉行中庸之道，平和可亲，一方面习惯于避免冲突，另一方面也能处变不惊。但是，S型似乎总是慢吞吞的，很难被鼓动，懒惰，马虎，得过且过。由于害怕承担风险和责任，宁愿站在一边旁观。很多时候，S型总是焉有主意，有话不说，或折衷处理。\n\n在人际关系方面，S型是一个容易相处的人，喜欢观察人、琢磨人，乐于倾听，愿意支持。可是，由于不以为然，S型也可能显得漠不关心，或者嘲讽别人。\n\n描述性词语：可靠、深思熟虑、亲切友好、有毅力、坚持不懈、善倾听者、全面周到、自制力强',
      C: '高C型的人通常是喜欢追求完美的专业型人才。\n\n在情感方面，C型人是一个性格深沉的人，严肃认真，目的性强，善于分析，愿意思考人生与工作的意义，喜欢美丽，对他人敏感，理想主义。但是，C型人总是习惯于记住负面的东西，容易情绪低落，过分自我反省，自我贬低，离群索居，有忧郁症倾向。\n\n在工作方面，C型人是一个完美主义者，高标准，计划性强，注重细节，讲究条理，整洁，能够发现问题并制订解决问题的办法，喜欢图表和清单，坚持己见，善始善终。但是，C型人也很可能是一个优柔寡断的人，习惯于收集信息资料和做分析，却很难投入到实际运作的工作中来。容易自我否定，因此需要别人的认同。同时，也习惯于挑剔别人，不能忍受别人的工作做不好。\n\n对待人际关系方面，C型人一方面在寻找理想伙伴，另一方面却交友谨慎。能够深切地关怀他人，善于倾听抱怨，帮助别人解决困难。但是，C型人似乎始终有一种不安全感，以致于感情内向，退缩，怀疑别人，喜欢批评人事，却不喜欢别人的反对。\n\n描述性词语：遵从、仔细、有条不紊、严谨、准确、完美主义者、逻辑性强'
    };
  }

  // DISC 5题测试计算
  scoreDisc(answers) {
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    answers.forEach((optIndex, qi) => {
      const type = this.discMap[qi][optIndex];
      counts[type] += 1;
    });
    
    const max = Math.max(counts.D, counts.I, counts.S, counts.C);
    const tops = Object.entries(counts).filter(([k, v]) => v === max).map(([k]) => k);
    const summary = tops.map(k => this.discNames[k]).join('、');
    const analysis = tops.map(k => `${this.discNames[k]}：${this.discAnalysis[k]}`).join('\n\n');
    
    return { counts, tops, summary, analysis };
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

  // 主要计算入口
  async calculateResult(testType, answers) {
    switch (testType) {
      case 'disc':
        return this.scoreDisc(answers);
      case 'mgmt':
        return this.scoreMgmt(answers);
      case 'disc40':
        return this.scoreDisc40(answers);
      case 'mbti':
        return await this.scoreMbti(answers);
      default:
        return { summary: '暂不支持的测试类型', analysis: '' };
    }
  }

  // DISC 40题测试计算（简化版）
  scoreDisc40(answers) {
    // 这里需要根据实际的DISC 40题计分规则来实现
    // 暂时使用5题版本的逻辑
    return this.scoreDisc(answers.slice(0, 5));
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
        SELECT rt.analysis, rt.description, rt.type_name
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'mbti' AND rt.type_code = $1
      `, [type]);
      
      if (result.rows.length > 0) {
        const mbtiData = result.rows[0];
        return {
          summary: type,
          analysis: mbtiData.analysis || mbtiData.description,
          typeName: mbtiData.type_name,
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
}

module.exports = new TestLogicService();
