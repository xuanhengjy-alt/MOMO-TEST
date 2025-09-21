// 初始化EQ测试项目数据
const { query } = require('./config/database');

async function initEqTest() {
  try {
    console.log('🔍 初始化EQ测试项目...');
    
    // 检查项目是否已存在
    const existingProject = await query(
      'SELECT id FROM test_projects WHERE project_id = $1',
      ['eq_test_en']
    );
    
    if (existingProject.rows.length > 0) {
      console.log('✅ EQ测试项目已存在，ID:', existingProject.rows[0].id);
      return existingProject.rows[0].id;
    }
    
    console.log('📝 创建EQ测试项目...');
    
    // 创建测试项目
    const projectResult = await query(`
      INSERT INTO test_projects (
        project_id, name, name_en, image_url, intro, intro_en, 
        test_type, estimated_time, question_count, is_active, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
      ) RETURNING id
    `, [
      'eq_test_en',
      '国际标准情商测试',
      'International Standard Emotional Intelligence Test',
      '/assets/images/international-standard-emotional-intelligence-test.jpg',
      '心理学家认为，在各种主观因素中，智商(IQ)约占20%，而情商(EQ)约占80%。国际标准情商测评是源于欧洲的广泛认可评估工具。',
      'Psychologists suggest that among the various subjective factors influencing personal success, intelligence quotient (IQ) contributes approximately 20%, while emotional quotient (EQ) accounts for roughly 80%. The International Standard EQ Assessment is a widely recognized evaluation tool that originated in Europe.',
      'eq_test',
      15,
      33,
      true
    ]);
    
    const projectId = projectResult.rows[0].id;
    console.log('✅ EQ测试项目创建成功，ID:', projectId);
    
    // 创建统计记录
    await query(`
      INSERT INTO test_statistics (project_id, total_tests, total_likes, created_at)
      VALUES ($1, 0, 0, NOW())
      ON CONFLICT (project_id) DO NOTHING
    `, [projectId]);
    
    console.log('✅ 统计记录创建成功');
    
    // 创建结果类型
    const resultTypes = [
      {
        code: 'high_eq',
        name: '高情商',
        name_en: 'High Emotional Intelligence',
        description: '你具有很高的情商，能够很好地理解和处理自己和他人的情绪。',
        description_en: 'You have high emotional intelligence and can understand and manage both your own and others\' emotions very well.',
        analysis: '高情商的人通常具有以下特点：1. 自我认知能力强 2. 情绪管理能力出色 3. 社交技能娴熟 4. 同理心强 5. 人际关系和谐。',
        analysis_en: 'People with high emotional intelligence typically have the following characteristics: 1. Strong self-awareness 2. Excellent emotional management skills 3. Proficient social skills 4. Strong empathy 5. Harmonious interpersonal relationships.'
      },
      {
        code: 'good_eq',
        name: '良好情商',
        name_en: 'Good Emotional Intelligence',
        description: '你的情商水平良好，在大多数情况下能够有效处理情绪和人际关系。',
        description_en: 'You have good emotional intelligence and can effectively handle emotions and interpersonal relationships in most situations.',
        analysis: '良好情商的人具有：1. 基本的自我认知能力 2. 较好的情绪控制能力 3. 良好的沟通技巧 4. 适度的同理心 5. 稳定的人际关系。',
        analysis_en: 'People with good emotional intelligence have: 1. Basic self-awareness 2. Good emotional control 3. Good communication skills 4. Moderate empathy 5. Stable interpersonal relationships.'
      },
      {
        code: 'average_eq',
        name: '中等情商',
        name_en: 'Average Emotional Intelligence',
        description: '你的情商处于中等水平，在某些情况下可能需要提升情绪管理能力。',
        description_en: 'Your emotional intelligence is at an average level, and you may need to improve your emotional management skills in some situations.',
        analysis: '中等情商的人需要关注：1. 增强自我认知 2. 提高情绪调节能力 3. 改善沟通方式 4. 培养同理心 5. 学习冲突解决技巧。',
        analysis_en: 'People with average emotional intelligence need to focus on: 1. Enhancing self-awareness 2. Improving emotional regulation 3. Improving communication methods 4. Developing empathy 5. Learning conflict resolution skills.'
      },
      {
        code: 'low_eq',
        name: '低情商',
        name_en: 'Low Emotional Intelligence',
        description: '你的情商还有提升空间，建议多关注情绪管理和人际交往技巧。',
        description_en: 'Your emotional intelligence has room for improvement. It is recommended to pay more attention to emotional management and interpersonal communication skills.',
        analysis: '低情商的人需要重点提升：1. 自我反思能力 2. 情绪识别和管理 3. 倾听和表达技巧 4. 理解他人感受 5. 建立健康的人际关系模式。',
        analysis_en: 'People with low emotional intelligence need to focus on improving: 1. Self-reflection ability 2. Emotional recognition and management 3. Listening and expression skills 4. Understanding others\' feelings 5. Building healthy interpersonal relationship patterns.'
      }
    ];
    
    console.log('📝 创建结果类型...');
    for (const resultType of resultTypes) {
      await query(`
        INSERT INTO result_types (
          project_id, type_code, type_name, type_name_en, 
          description, description_en, analysis, analysis_en, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        projectId,
        resultType.code,
        resultType.name,
        resultType.name_en,
        resultType.description,
        resultType.description_en,
        resultType.analysis,
        resultType.analysis_en
      ]);
    }
    
    console.log(`✅ 创建了 ${resultTypes.length} 个结果类型`);
    
    // 创建示例题目（33道题）
    console.log('📝 创建示例题目...');
    const sampleQuestions = [];
    for (let i = 1; i <= 33; i++) {
      sampleQuestions.push({
        question_text: `问题 ${i}`,
        question_text_en: `Question ${i}: How do you typically react when faced with emotional challenges?`,
        question_number: i
      });
    }
    
    for (const question of sampleQuestions) {
      const questionResult = await query(`
        INSERT INTO questions (project_id, question_number, question_text, question_text_en, question_type, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id
      `, [projectId, question.question_number, question.question_text, question.question_text_en, 'single_choice']);
      
      const questionId = questionResult.rows[0].id;
      
      // 为每道题创建4个选项
      const options = [
        { text: '完全不符合', text_en: 'Strongly disagree', value: 1 },
        { text: '不太符合', text_en: 'Somewhat disagree', value: 2 },
        { text: '比较符合', text_en: 'Somewhat agree', value: 3 },
        { text: '完全符合', text_en: 'Strongly agree', value: 4 }
      ];
      
      for (let j = 0; j < options.length; j++) {
        await query(`
          INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [questionId, j + 1, options[j].text, options[j].text_en, options[j].value]);
      }
    }
    
    console.log(`✅ 创建了 33 道题目和 ${33 * 4} 个选项`);
    console.log('🎉 EQ测试项目初始化完成！');
    
    return projectId;
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initEqTest().then(() => {
    console.log('✅ 初始化完成');
    process.exit(0);
  }).catch(error => {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  });
}

module.exports = { initEqTest };
