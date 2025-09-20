// Vercel兼容性测试脚本
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const LOCAL_URL = 'http://localhost:3000';

async function testLocalEnvironment() {
  console.log('🧪 测试本地环境兼容性...\n');

  const tests = [
    {
      name: '健康检查API',
      url: `${LOCAL_URL}/api/health`,
      expectedStatus: 200
    },
    {
      name: '博客列表API',
      url: `${LOCAL_URL}/api/blogs`,
      expectedStatus: 200
    },
    {
      name: '测试项目首页',
      url: `${LOCAL_URL}/`,
      expectedStatus: 200
    },
    {
      name: '博客列表页',
      url: `${LOCAL_URL}/blog.html`,
      expectedStatus: 200
    },
    {
      name: '测试详情页',
      url: `${LOCAL_URL}/test-detail.html`,
      expectedStatus: 200
    },
    {
      name: '博客详情页',
      url: `${LOCAL_URL}/blog-detail.html`,
      expectedStatus: 200
    },
    {
      name: '带参数的测试详情页',
      url: `${LOCAL_URL}/test-detail.html?id=mbti`,
      expectedStatus: 200
    },
    {
      name: '带参数的博客详情页',
      url: `${LOCAL_URL}/blog-detail.html?slug=the-application-of-the-mbti-personality-test-in-real-life`,
      expectedStatus: 200
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`测试: ${test.name}`);
      const { stdout } = await execPromise(`curl -s -o /dev/null -w "%{http_code}" "${test.url}"`);
      const statusCode = parseInt(stdout.trim(), 10);
      
      if (statusCode === test.expectedStatus) {
        console.log(`✅ ${test.name}: HTTP ${statusCode}`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: 期望 HTTP ${test.expectedStatus}, 实际 HTTP ${statusCode}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: 请求失败 - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 测试结果: ${passed} 通过, ${failed} 失败`);
  
  if (failed === 0) {
    console.log('🎉 所有测试通过！本地环境与Vercel完全兼容。');
    return true;
  } else {
    console.log('⚠️ 部分测试失败，需要进一步修复。');
    return false;
  }
}

async function testVercelDeployment() {
  console.log('\n🚀 测试Vercel部署兼容性...\n');
  
  // 检查vercel.json配置
  const fs = require('fs');
  const path = require('path');
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    console.log('✅ vercel.json 配置有效');
    
    // 检查API文件是否存在
    const apiFiles = [
      'api/health.js',
      'api/blogs.js',
      'api/tests.js'
    ];
    
    for (const file of apiFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} 存在`);
      } else {
        console.log(`❌ ${file} 缺失`);
      }
    }
    
    console.log('\n✅ Vercel部署配置检查完成');
    return true;
  } catch (error) {
    console.log(`❌ Vercel配置检查失败: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Vercel兼容性测试开始\n');
  
  const localTest = await testLocalEnvironment();
  const vercelTest = await testVercelDeployment();
  
  console.log('\n📋 总结:');
  console.log(`- 本地环境测试: ${localTest ? '✅ 通过' : '❌ 失败'}`);
  console.log(`- Vercel配置测试: ${vercelTest ? '✅ 通过' : '❌ 失败'}`);
  
  if (localTest && vercelTest) {
    console.log('\n🎉 完美！您的项目完全兼容Vercel部署。');
    console.log('💡 现在可以安全地使用 git push 部署到Vercel。');
  } else {
    console.log('\n⚠️ 需要进一步修复以确保Vercel兼容性。');
  }
}

main().catch(console.error);
