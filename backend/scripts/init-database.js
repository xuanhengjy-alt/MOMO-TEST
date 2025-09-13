const fs = require('fs');
const path = require('path');
const { query, transaction } = require('../config/database');

// 从现有的JSON文件读取数据
function loadTestData() {
  const testsPath = path.join(__dirname, '../../assets/data/tests.json');
  const testsData = JSON.parse(fs.readFileSync(testsPath, 'utf8'));
  
  // 这里可以添加其他数据文件的加载
  return testsData;
}

// 初始化测试项目数据
async function initTestProjects() {
  console.log('🔄 Initializing test projects...');
  
  const testData = loadTestData();
  
  for (const project of testData.projects) {
    try {
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
        project.id,
        project.name,
        project.name, // 暂时使用相同名称
        project.image,
        project.intro,
        project.intro, // 暂时使用相同内容
        project.type,
        getEstimatedTime(project.type),
        getQuestionCount(project.type),
        true
      ]);
      
      console.log(`✅ Project ${project.id} initialized`);
    } catch (error) {
      console.error(`❌ Error initializing project ${project.id}:`, error.message);
    }
  }
  
  // 禁用已删除的测试项目
  await disableRemovedProjects();
}

// 禁用已删除的测试项目
async function disableRemovedProjects() {
  console.log('🔄 Disabling removed test projects...');
  
  const removedProjects = ['disc', 'mgmt'];
  
  for (const projectId of removedProjects) {
    try {
      await query(`
        UPDATE test_projects 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE project_id = $1
      `, [projectId]);
      
      console.log(`✅ Project ${projectId} disabled`);
    } catch (error) {
      console.error(`❌ Error disabling project ${projectId}:`, error.message);
    }
  }
}

// 根据测试类型获取预计时间
function getEstimatedTime(testType) {
  const timeMap = {
    'disc': 2,
    'disc40': 8,
    'mbti': 15,
    'mgmt': 5
  };
  return timeMap[testType] || 5;
}

// 根据测试类型获取题目数量
function getQuestionCount(testType) {
  const countMap = {
    'disc': 5,
    'disc40': 40,
    'mbti': 93,
    'mgmt': 15
  };
  return countMap[testType] || 0;
}

// 初始化题目数据
async function initQuestions() {
  console.log('🔄 Initializing questions...');
  
  // 这里需要根据实际的题目数据来初始化
  // 暂时跳过，因为题目数据在 test-logic.js 中
  console.log('⚠️  Questions initialization skipped - implement based on your question data');
}

// 初始化结果类型数据
async function initResultTypes() {
  console.log('🔄 Initializing result types...');
  
  // DISC 结果类型
  const discTypes = [
    { code: 'D', name: 'Dominance', nameEn: 'Dominance' },
    { code: 'I', name: 'Influence', nameEn: 'Influence' },
    { code: 'S', name: 'Steadiness', nameEn: 'Steadiness' },
    { code: 'C', name: 'Compliance', nameEn: 'Compliance' }
  ];
  
  // 获取DISC项目ID
  const discProject = await query('SELECT id FROM test_projects WHERE project_id = $1', ['disc']);
  if (discProject.rows.length > 0) {
    const projectId = discProject.rows[0].id;
    
    for (const type of discTypes) {
      await query(`
        INSERT INTO result_types (project_id, type_code, type_name, type_name_en)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (project_id, type_code) DO NOTHING
      `, [projectId, type.code, type.name, type.nameEn]);
    }
  }
  
  console.log('✅ Result types initialized');
}

// 初始化测试统计数据
async function initTestStatistics() {
  console.log('🔄 Initializing test statistics...');
  
  // 设置初始统计数据
  const initialStats = [
    { projectId: 'mbti', totalTests: 120000, totalLikes: 13000 },
    { projectId: 'disc40', totalTests: 50000, totalLikes: 4500 }
  ];
  
  for (const stat of initialStats) {
    try {
      await query(`
        INSERT INTO test_statistics (project_id, total_tests, total_likes, last_updated)
        SELECT id, $2, $3, CURRENT_TIMESTAMP
        FROM test_projects 
        WHERE project_id = $1
        ON CONFLICT (project_id) DO UPDATE SET
          total_tests = EXCLUDED.total_tests,
          total_likes = EXCLUDED.total_likes,
          last_updated = CURRENT_TIMESTAMP
      `, [stat.projectId, stat.totalTests, stat.totalLikes]);
      
      console.log(`✅ Statistics initialized for ${stat.projectId}: ${stat.totalTests} tests, ${stat.totalLikes} likes`);
    } catch (error) {
      console.error(`❌ Error initializing statistics for ${stat.projectId}:`, error.message);
    }
  }
  
  console.log('✅ Test statistics initialized');
}

// 主初始化函数
async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // 检查数据库连接
    await query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // 初始化各个模块
    await initTestProjects();
    await initQuestions();
    await initResultTypes();
    await initTestStatistics();
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = { initializeDatabase };
