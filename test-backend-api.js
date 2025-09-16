const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function testBackendAPI() {
  try {
    console.log('🧪 测试后端Social Anxiety Level Test API...\n');
    
    // 模拟测试结果提交
    const mockAnswers = [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]; // 全部选择第5个选项
    
    // 直接调用TestLogic服务
    const TestLogic = require('./backend/services/testLogic');
    const result = await TestLogic.calculateResult('social_anxiety_test', mockAnswers);
    
    console.log('TestLogic返回的结果:');
    console.log(JSON.stringify(result, null, 2));
    
    // 检查必要字段
    console.log('\n字段检查:');
    console.log('summary:', result.summary || '❌ 缺失');
    console.log('analysis:', result.analysis || '❌ 缺失');
    console.log('summaryEn:', result.summaryEn || '❌ 缺失');
    console.log('analysisEn:', result.analysisEn || '❌ 缺失');
    console.log('totalScore:', result.totalScore || '❌ 缺失');
    console.log('resultType:', result.resultType || '❌ 缺失');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testBackendAPI();
