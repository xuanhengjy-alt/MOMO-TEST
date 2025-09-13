const { query, transaction } = require('../config/database');

// 管理能力测试项目数据
const managementTestData = {
  project: {
    project_id: 'mgmt_en',
    name: '管理能力自评测试',
    name_en: 'Self-assessment of Management Skills',
    image_url: 'assets/images/self-assessment-of-management-skills.png',
    intro: '你是否具备清晰的目标意识和高效的执行能力？这个经典测试通过15个问题快速评估你的核心管理能力，如规划、决策和自我约束等。完成自测后，你将获得针对性的能力分析和改进方向。无论是提升团队效率还是个人职业发展，都能找到突破路径。花几分钟时间进行自测，解锁你的管理潜能！',
    intro_en: 'Do you have a clear sense of purpose and efficient execution ability? This classic test quickly assesses your core management abilities such as planning, decision-making, and self-discipline through 15 questions. After completing the self-test, you will receive targeted ability analysis and improvement directions. Whether it\'s enhancing team efficiency or personal career development, you can find a breakthrough path. Spend a few minutes on the self-test and unlock your management potential!',
    test_type: 'mgmt_en',
    estimated_time: 15,
    question_count: 15,
    is_active: true
  },
  questions: [
    {
      number: 1,
      text: '你在采取行动之前习惯制定计划吗？',
      text_en: 'Are you accustomed to making plans before taking action?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 2,
      text: '你经常为了效率而改变计划吗？',
      text_en: 'Do you often change your plans for the sake of efficiency?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 3,
      text: '你能经常收集他人的各种反馈吗？',
      text_en: 'Can you frequently collect various feedback from others?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 4,
      text: '实现目标是解决问题的延续吗？',
      text_en: 'Is achieving goals the continuation of problem-solving?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 5,
      text: '你睡前会思考和规划明天要做的事情吗？',
      text_en: 'Do you think about and plan what you will do tomorrow before going to bed?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 6,
      text: '事物的联系和指令总是细致入微吗？',
      text_en: 'Are the connections and instructions for things always meticulous?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 7,
      text: '你有经常记录自己行为的习惯吗？',
      text_en: 'Do you have the habit of frequently recording your actions?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 8,
      text: '你能严格控制自己的行为吗？',
      text_en: 'Can you strictly control your actions?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 9,
      text: '你能无论在何地何时都有目的地行动吗？',
      text_en: 'Can you act purposefully no matter where or when?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 10,
      text: '你能经常想到对策并清除实现目标中的障碍吗？',
      text_en: 'Can you often think of countermeasures and remove obstacles in achieving your goals?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 11,
      text: '你每天都会检查自己当天行为的效率吗？',
      text_en: 'Do you check your efficiency of the day\'s actions every day?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 12,
      text: '你经常严格比较计划目标与实际成就吗？',
      text_en: 'Do you often strictly compare your planned goals with actual achievements?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 13,
      text: '你对工作结果非常敏感吗？',
      text_en: 'Are you very sensitive to the results of your work?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 14,
      text: '你从不把今天预定的工作拖到明天吗？',
      text_en: 'Do you never postpone today\'s pre-arranged work until tomorrow?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    },
    {
      number: 15,
      text: '你习惯根据相关信息设定目标和制定计划吗？',
      text_en: 'Are you accustomed to setting goals and making plans based on relevant information?',
      options: [
        { number: 1, text: '是', text_en: 'Yes', score: 1 },
        { number: 2, text: '否', text_en: 'No', score: 0 }
      ]
    }
  ],
  resultTypes: [
    {
      code: 'POOR',
      name: '管理能力较差',
      name_en: 'Poor management ability',
      description: '0-5分',
      description_en: '0-5 points',
      analysis: '测试表明你的管理技能仍然欠缺，但这恰恰说明你有着天马行空的想象力和独特的艺术感知力！你不喜欢被条条框框束缚，更适合在自由灵活的环境中展现才华。设计、创作、艺术表达等领域可能是你真正的舞台——那里需要的是敏锐的直觉和突破常规的灵感，而不是严格的规划和控制。没必要强迫自己成为"传统意义上的管理者"。你的价值在于创造出与众不同的东西。拥抱你的艺术天赋，或许有一天，你会以独特的方式影响世界！',
      analysis_en: 'This test indicates that your management skills are still lacking, but this precisely shows that you have a wild imagination and a unique artistic perception! You don\'t like being bound by rules and regulations, and you are more suitable to display your talents in a free and flexible environment. Fields such as design, creation, and artistic expression might be your true stage - where what is needed is acute intuition and unconventional inspiration rather than strict planning and control. There\'s no need to force yourself to become a "conventional manager". Your value lies in creating something distinctive. Embrace your artistic talent, and perhaps one day, you will influence the world in a unique way!'
    },
    {
      code: 'BELOW_AVERAGE',
      name: '管理能力低于平均水平',
      name_en: 'Below-average management ability',
      description: '6-9分',
      description_en: '6-9 points',
      analysis: '测试表明你的管理技能相对较弱，这可能源于你天性自由、厌恶约束的本质。你习惯于跟随直觉和灵感，抗拒僵化的流程和规则。虽然这样的性格不利于传统意义上的管理，但可能蕴含着独特的创造力和突破性思维。你更适合自由度较高、鼓励创新、约束较少的工作，比如创意策划、艺术创作、独立咨询或内容制作等。没必要强迫自己适应标准化的管理方式。相反，发挥你打破常规的能力，在灵活开放的环境中，你更有可能取得非凡的成功。你的道路或许正需要拒绝平庸和"拒绝约束"！',
      analysis_en: 'Tests indicate that your management skills are relatively weak, which may stem from your inherent nature of being free-spirited and averse to constraints. You are accustomed to following your intuition and inspiration, and resist rigid processes and rules. Although such a personality is not conducive to traditional management, it may hold unique creativity and breakthrough thinking. You are more suitable for jobs with high freedom, innovation encouragement, and less strict constraints, such as creative planning, artistic creation, independent consulting, or content production. There is no need to force yourself to adapt to standardized management. Instead, leverage your ability to break conventions, and you are more likely to achieve extraordinary success in a flexible and open environment. Your path might just require a refusal to be mediocre and a "rejection of constraints"!'
    },
    {
      code: 'AVERAGE',
      name: '管理能力平均水平',
      name_en: 'Average management ability',
      description: '10-12分',
      description_en: '10-12 points',
      analysis: '测试显示你在专业领域事务管理方面有一定基础——目标设定、计划推进、流程执行都能满足基本要求，但在情绪管理方面存在明显不足。情绪波动容易让你在压力下变得优柔寡断，影响团队协作，甚至打乱原本清晰的节奏。\n\n情绪如何阻碍你的管理效果？\n\n你可能会发现，当你情绪高涨时充满自信，但一旦陷入焦虑或沮丧，就容易变得消极或责怪他人。这种状态不仅降低了你的判断力，也影响了团队对你的信任。\n\n进阶建议：\n\n- 建立情绪觉察机制：在重大决策前，花几分钟让自己冷静下来，问问自己"我现在的情绪是否在影响我的思考？"\n- 系统化流程：使用清单、待办提醒、自动化工具等来减少人为情绪的干扰。\n- 尝试在团队中建立反馈缓冲：比如为重要决策预留半天的冷静期，或请理性的同事协助审查。\n\n管理，本质上是一场自我控制的游戏。一旦你学会引导而非压抑情绪，你不仅会成为一个称职的管理者，更可能成为真正能够推动团队走向高效的领导者。保持冷静，你的管理之路会走得更远。',
      analysis_en: 'Tests show that you have a certain foundation in professional field affairs management - goal setting, plan promotion, and process execution can all meet basic requirements, but there is a significant shortcoming in emotional management. Emotional fluctuations can easily make you indecisive under pressure, affect team collaboration, and even disrupt the originally clear rhythm.\n\nHow do emotions hinder your management effectiveness?\n\nYou may find that when you are in high spirits, you are full of confidence, but once you fall into anxiety or frustration, you tend to become passive or blame others. This state not only reduces your judgment, but also affects the trust your team has in you.\n\nAdvanced Suggestions:\n\n- Established an emotion awareness mechanism: Before making major decisions, take a few minutes to calm down and ask yourself, "Is my current emotion affecting my thinking?"\n- Systematize the process: Use checklists, to-do reminders, and automation tools to reduce the interference of human emotions.\n- Try to establish a feedback buffer in the team: For example, reserve a half-day cooling-off period for important decisions, or ask rational colleagues to assist in review.\n\nManagement, at its core, is a game of self-control. Once you learn to guide rather than suppress your emotions, you will not only be a competent manager but also likely become the true leader who can drive the team towards efficiency. Keep your composure, and your path in management will extend further.'
    },
    {
      code: 'STRONG',
      name: '管理能力较强',
      name_en: 'Strong management ability',
      description: '13-14分',
      description_en: '13-14 points',
      analysis: '测试显示你具备较强的管理能力，是一位可靠稳重的管理者。你注重制定切实可行的计划，并以扎实细致的方式执行，很少因为疏忽或冲动而出现意外失误。这种稳健低风险的管理风格为团队或组织提供了可靠的发展保障。\n\n你善于在既定框架内优化流程，对细节和风险控制有着敏锐的洞察力。这种特质在需要稳定输出的领域特别有价值，比如项目管理、运维协调、行政统筹等。\n\n## 进一步提升建议：\n\n在保持稳健的同时，适当培养灵活性和突破性思维，学会在复杂环境中快速调整策略。这样，就能在维护现状的基础上，拓宽进一步拓展和发展的潜力空间。\n\n继续保持你的细致和沉稳，这些已经是管理路上非常宝贵的优势。',
      analysis_en: 'The test shows that you have strong management skills and are a reliable and steady manager. You focus on formulating practical plans and implement them in a solid and meticulous manner, rarely making unexpected mistakes due to negligence or impulsiveness. This stable and low-risk management style provides a reliable development guarantee for the team or organization.\n\nYou excel at optimizing processes within a given framework, paying close attention to details and risk control. This trait is particularly valuable in fields that require stable output, such as project management, operation and maintenance, and administrative coordination.\n\n## Further Improvement Suggestions:\n\nWhile maintaining stability, it is appropriate to cultivate flexibility and breakthrough thinking, learning to quickly adjust strategies in complex environments. Thus, beyond merely preserving the status quo, the potential for further expansion and development can be broadened.\n\nKeep maintaining your meticulousness and composure. These are already very valuable strengths on the road of management.'
    },
    {
      code: 'VERY_STRONG',
      name: '管理能力很强',
      name_en: 'Very strong management ability',
      description: '15分',
      description_en: '15 points',
      analysis: '# 优秀管理者：系统性思维与战略执行的典范\n\n测试显示你拥有出色的管理能力，尤其在目标导向的系统性规划和高效执行方面表现卓越。你注重细节，善于协调资源，能够在大型、多层级组织中稳步推进事务，很少出现战略失误或操作失控的情况。\n\n无论是复杂项目的推进、团队协调还是长期目标的制定，你都展现出了冷静的判断力和强大的掌控力。这种能力让你在高级管理、业务运营、战略规划等岗位上具有显著优势。\n\n## 未来挑战与成长方向：\n\n可以在保持秩序的基础上，进一步培养创新、变革和文化塑造的能力，尝试成为推动组织突破边界的引领者。\n\n真正的管理，不仅在于确保系统完美运转，更在于让其持续进化——而你已具备这样的潜质。',
      analysis_en: '# Outstanding Managers: Paragons of Systematic Thinking and Strategic Execution\n\nTests show that you possess outstanding management skills, especially excelling in goal-oriented systematic planning and efficient execution. You pay attention to details and are good at coordinating resources, capable of steadily advancing affairs in large-scale, multi-level organizations with few strategic mistakes or operational losses of control.\n\nWhether it is the advancement of complex projects, team coordination or the formulation of long-term goals, you have demonstrated calm judgment and strong control. This ability gives you a significant advantage in positions such as senior management, business operation, and strategic planning.\n\n## Future Challenges and Growth Directions:\n\nOne can further cultivate the ability to innovate, transform and shape culture, and attempt to become a driver that leads the organization to break through boundaries on the basis of maintaining order.\n\nTrue management lies not only in ensuring the system operates flawlessly but also in enabling its continuous evolution - and you already possess such potential.'
    }
  ]
};

// 添加测试项目
async function addTestProject() {
  console.log('🔄 Adding Management Skills Test project...');
  
  const { project } = managementTestData;
  
  await query(`
    INSERT INTO test_projects (
      project_id, name, name_en, image_url, intro, intro_en, 
      test_type, estimated_time, question_count, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (project_id) DO UPDATE SET
      name = EXCLUDED.name,
      name_en = EXCLUDED.name_en,
      image_url = EXCLUDED.image_url,
      intro = EXCLUDED.intro,
      intro_en = EXCLUDED.intro_en,
      test_type = EXCLUDED.test_type,
      estimated_time = EXCLUDED.estimated_time,
      question_count = EXCLUDED.question_count,
      updated_at = CURRENT_TIMESTAMP
  `, [
    project.project_id,
    project.name,
    project.name_en,
    project.image_url,
    project.intro,
    project.intro_en,
    project.test_type,
    project.estimated_time,
    project.question_count,
    project.is_active
  ]);
  
  console.log(`✅ Project ${project.project_id} added/updated`);
}

// 添加题目和选项
async function addQuestions() {
  console.log('🔄 Adding questions and options...');
  
  // 获取项目ID
  const projectResult = await query('SELECT id FROM test_projects WHERE project_id = $1', ['mgmt_en']);
  if (projectResult.rows.length === 0) {
    throw new Error('Project mgmt_en not found');
  }
  const projectId = projectResult.rows[0].id;
  
  for (const questionData of managementTestData.questions) {
    // 添加题目
    const questionResult = await query(`
      INSERT INTO questions (
        project_id, question_number, question_text, question_text_en, question_type
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (project_id, question_number) DO UPDATE SET
        question_text = EXCLUDED.question_text,
        question_text_en = EXCLUDED.question_text_en
      RETURNING id
    `, [projectId, questionData.number, questionData.text, questionData.text_en, 'single_choice']);
    
    const questionId = questionResult.rows[0].id;
    
    // 添加选项
    for (const optionData of questionData.options) {
      await query(`
        INSERT INTO question_options (
          question_id, option_number, option_text, option_text_en, score_value
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (question_id, option_number) DO UPDATE SET
          option_text = EXCLUDED.option_text,
          option_text_en = EXCLUDED.option_text_en,
          score_value = EXCLUDED.score_value
      `, [questionId, optionData.number, optionData.text, optionData.text_en, optionData.score]);
    }
  }
  
  console.log('✅ Questions and options added');
}

// 添加结果类型
async function addResultTypes() {
  console.log('🔄 Adding result types...');
  
  // 获取项目ID
  const projectResult = await query('SELECT id FROM test_projects WHERE project_id = $1', ['mgmt_en']);
  if (projectResult.rows.length === 0) {
    throw new Error('Project mgmt_en not found');
  }
  const projectId = projectResult.rows[0].id;
  
  for (const resultTypeData of managementTestData.resultTypes) {
    await query(`
      INSERT INTO result_types (
        project_id, type_code, type_name, type_name_en, 
        description, description_en, analysis, analysis_en
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (project_id, type_code) DO UPDATE SET
        type_name = EXCLUDED.type_name,
        type_name_en = EXCLUDED.type_name_en,
        description = EXCLUDED.description,
        description_en = EXCLUDED.description_en,
        analysis = EXCLUDED.analysis,
        analysis_en = EXCLUDED.analysis_en
    `, [
      projectId,
      resultTypeData.code,
      resultTypeData.name,
      resultTypeData.name_en,
      resultTypeData.description,
      resultTypeData.description_en,
      resultTypeData.analysis,
      resultTypeData.analysis_en
    ]);
  }
  
  console.log('✅ Result types added');
}

// 添加测试统计数据
async function addTestStatistics() {
  console.log('🔄 Adding test statistics...');
  
  // 获取项目ID
  const projectResult = await query('SELECT id FROM test_projects WHERE project_id = $1', ['mgmt_en']);
  if (projectResult.rows.length === 0) {
    throw new Error('Project mgmt_en not found');
  }
  const projectId = projectResult.rows[0].id;
  
  await query(`
    INSERT INTO test_statistics (project_id, total_tests, total_likes, last_updated)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    ON CONFLICT (project_id) DO UPDATE SET
      total_tests = EXCLUDED.total_tests,
      total_likes = EXCLUDED.total_likes,
      last_updated = CURRENT_TIMESTAMP
  `, [projectId, 0, 0]);
  
  console.log('✅ Test statistics added');
}

// 主函数
async function main() {
  try {
    console.log('🚀 Starting Management Skills Test setup...');
    
    // 检查数据库连接
    await query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // 按顺序执行
    await addTestProject();
    await addQuestions();
    await addResultTypes();
    await addTestStatistics();
    
    console.log('🎉 Management Skills Test setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { main };
