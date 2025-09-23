const https = require('https');

async function testJumpTest(projectId, testName, answers) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      projectId,
      answers,
      sessionId: `test-${projectId}-${Date.now()}`
    });

    const options = {
      hostname: 'momotest.aithink.app',
      port: 443,
      path: '/api/results?debug=1',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ testName, result });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function runJumpVerificationTests() {
  console.log('🚀 验证跳转型测试项目的跳转逻辑...\n');

  const tests = [
    {
      name: '暴力指数测试',
      projectId: 'violence_index',
      answers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 模拟用户选择
      expectedResult: 'RESULT1|RESULT2|RESULT3|RESULT4'
    },
    {
      name: '人格魅力测试',
      projectId: 'personality_charm_1min',
      answers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 模拟用户选择
      expectedResult: 'RESULT1|RESULT2|RESULT3|RESULT4|RESULT5'
    },
    {
      name: '孤独感测试',
      projectId: 'loneliness_1min',
      answers: [0, 1, 2, 3, 4], // 模拟用户选择
      expectedResult: 'LONELY_*'
    }
  ];

  let successCount = 0;
  let totalCount = tests.length;

  for (const test of tests) {
    try {
      console.log(`\n=== 测试 ${test.name} ===`);
      const { testName, result } = await testJumpTest(test.projectId, test.name, test.answers);
      
      console.log(`📊 测试结果:`, JSON.stringify(result.result, null, 2));
      
      if (result.success) {
        const summary = result.result.summary || '';
        const hasValidResult = !summary.includes('undetermined') && 
                              !summary.includes('Calculation Error') &&
                              summary.length > 10;
        
        if (hasValidResult) {
          console.log('✅ 跳转逻辑正常工作');
          console.log(`📝 结果摘要: ${summary}`);
          successCount++;
        } else {
          console.log('❌ 跳转逻辑异常 - 返回了未确定结果');
          console.log(`📝 问题摘要: ${summary}`);
        }
        
        // 显示debug信息
        if (result.debug) {
          console.log(`🔍 计算耗时: ${result.debug.calcDurationMs}ms`);
          if (result.debug.probe) {
            console.log(`📊 数据统计: 题目${result.debug.probe.questions}个, 选项${result.debug.probe.options}个, 结果类型${result.debug.probe.resultTypes}个`);
          }
          if (result.debug.diag) {
            console.log(`🔧 诊断信息: ${JSON.stringify(result.debug.diag)}`);
          }
        }
      } else {
        console.log('❌ 测试失败:', result.error);
      }
    } catch (error) {
      console.log('❌ 请求失败:', error.message);
    }
  }

  console.log(`\n📈 跳转逻辑验证总结:`);
  console.log(`✅ 成功: ${successCount}/${totalCount}`);
  console.log(`❌ 失败: ${totalCount - successCount}/${totalCount}`);
  console.log(`📊 成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 所有跳转型测试项目的跳转逻辑都正常工作！');
  } else {
    console.log('\n⚠️ 部分跳转型测试项目需要进一步检查');
  }
}

runJumpVerificationTests();
