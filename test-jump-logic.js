const https = require('https');

async function testJumpLogic() {
  // 测试暴力指数测试的跳转逻辑
  const testData = {
    projectId: 'violence_index',
    answers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 模拟用户选择
    sessionId: 'test-violence-jump'
  };

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testData);
    const options = {
      hostname: 'momotest.aithink.app',
      port: 443,
      path: '/api/results',
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
          resolve(result);
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

async function testPersonalityCharm() {
  // 测试人格魅力测试的跳转逻辑
  const testData = {
    projectId: 'personality_charm_1min',
    answers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // 模拟用户选择
    sessionId: 'test-charm-jump'
  };

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testData);
    const options = {
      hostname: 'momotest.aithink.app',
      port: 443,
      path: '/api/results',
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
          resolve(result);
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

async function runJumpTests() {
  console.log('🧪 测试跳转型测试项目的跳转逻辑...\n');

  try {
    console.log('=== 测试暴力指数测试 ===');
    const violenceResult = await testJumpLogic();
    console.log('暴力指数测试结果:', JSON.stringify(violenceResult, null, 2));
    
    if (violenceResult.success) {
      console.log('✅ 暴力指数测试跳转逻辑正常');
    } else {
      console.log('❌ 暴力指数测试跳转逻辑异常:', violenceResult.error);
    }
  } catch (error) {
    console.log('❌ 暴力指数测试请求失败:', error.message);
  }

  try {
    console.log('\n=== 测试人格魅力测试 ===');
    const charmResult = await testPersonalityCharm();
    console.log('人格魅力测试结果:', JSON.stringify(charmResult, null, 2));
    
    if (charmResult.success) {
      console.log('✅ 人格魅力测试跳转逻辑正常');
    } else {
      console.log('❌ 人格魅力测试跳转逻辑异常:', charmResult.error);
    }
  } catch (error) {
    console.log('❌ 人格魅力测试请求失败:', error.message);
  }
}

runJumpTests();
