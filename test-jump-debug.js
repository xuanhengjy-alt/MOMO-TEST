const https = require('https');

async function testJumpDebug() {
  const testData = {
    projectId: 'violence_index',
    answers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    sessionId: 'test-violence-debug'
  };

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testData);
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

async function runDebugTest() {
  try {
    console.log('🔍 测试暴力指数测试的debug信息...');
    const result = await testJumpDebug();
    console.log('Debug结果:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Debug测试失败:', error.message);
  }
}

runDebugTest();
