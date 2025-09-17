// 简单测试后端服务
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('./config/database');

async function simpleTest() {
  try {
    console.log('🧪 简单测试后端服务...');
    
    // 测试数据库连接
    const result = await query('SELECT COUNT(*) as count FROM test_projects');
    console.log(`✅ 数据库连接正常，项目数量: ${result.rows[0].count}`);
    
    // 测试TestLogic服务
    const TestLogicService = require('./services/testLogic');
    console.log('✅ TestLogic服务加载成功');
    
    // 测试通用测试方法
    const testResult = await TestLogicService.scoreGenericTest('personality_charm_1min', [1, 2, 3, 4, 5]);
    console.log('✅ 通用测试方法工作正常');
    console.log(`   结果: ${JSON.stringify(testResult, null, 2)}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

simpleTest();
