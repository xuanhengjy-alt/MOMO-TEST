const TestLogic = require('../services/testLogic');

async function testMbtiLogic() {
  try {
    console.log('🧪 测试MBTI逻辑...');
    
    // 测试答案（模拟INTJ类型）
    const testAnswers = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]; // 16个答案
    
    console.log('📝 测试答案:', testAnswers);
    
    // 调用MBTI计算
    const result = await TestLogic.scoreMbti(testAnswers);
    
    console.log('\n🎯 计算结果:');
    console.log('类型:', result.summary);
    console.log('类型名称:', result.typeName);
    console.log('分析长度:', result.analysis ? result.analysis.length : 0, '字符');
    console.log('分析预览:', result.analysis ? result.analysis.substring(0, 200) + '...' : '无');
    console.log('得分:', result.scores);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testMbtiLogic();
