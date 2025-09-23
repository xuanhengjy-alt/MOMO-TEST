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

async function runFinalJumpTests() {
  console.log('🚀 验证部署后的跳转型测试项目跳转逻辑...\n');

  const tests = [
    {
      name: '暴力指数测试',
      projectId: 'violence_index',
      answers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      expectedResult: 'RESULT1|RESULT2|RESULT3|RESULT4'
    },
    {
      name: '人格魅力测试',
      projectId: 'personality_charm_1min',
      answers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      expectedResult: 'RESULT1|RESULT2|RESULT3|RESULT4|RESULT5'
    },
    {
      name: '孤独感测试',
      projectId: 'loneliness_1min',
      answers: [0, 1, 2, 3, 4],
      expectedResult: 'LONELY_*'
    }
  ];

  let successCount = 0;
  let totalCount = tests.length;

  for (const test of tests) {
    try {
      console.log(`\n=== 测试 ${test.name} ===`);
      const { testName, result } = await testJumpTest(test.projectId, test.name, test.answers);
      
      if (result.success) {
        const summary = result.result.summary || '';
        const analysis = result.result.analysis || '';
        const hasValidResult = !summary.includes('undetermined') && 
                              !summary.includes('Calculation Error') &&
                              summary.length > 10;
        
        if (hasValidResult) {
          console.log('✅ 跳转逻辑正常工作');
          console.log(`📝 结果摘要: ${summary}`);
          console.log(`📊 结果类型: ${result.result.resultType || 'N/A'}`);
          console.log(`🔍 计算耗时: ${result.debug?.calcDurationMs || 'N/A'}ms`);
          successCount++;
        } else {
          console.log('❌ 跳转逻辑异常');
          console.log(`📝 问题摘要: ${summary}`);
          if (result.debug?.diag) {
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

  console.log(`\n📈 最终验证总结:`);
  console.log(`✅ 成功: ${successCount}/${totalCount}`);
  console.log(`❌ 失败: ${totalCount - successCount}/${totalCount}`);
  console.log(`📊 成功率: ${((successCount / totalCount) * 100).toFixed(1)}%`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 所有跳转型测试项目的跳转逻辑都正常工作！');
    console.log('🎯 跳转逻辑修复完成！');
  } else if (successCount > 0) {
    console.log('\n⚠️ 部分跳转型测试项目正常工作，部分需要进一步检查');
  } else {
    console.log('\n❌ 跳转型测试项目仍有问题，需要进一步调试');
  }
}

runFinalJumpTests();
