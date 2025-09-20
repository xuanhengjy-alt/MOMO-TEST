// Vercel部署验证脚本
const https = require('https');
const http = require('http');

const VERCEL_URL = process.env.VERCEL_URL || 'https://momo-test-3i2axgsyt-2322d.vercel.app';

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${description}: ${res.statusCode}`);
        if (res.statusCode !== 200) {
          console.log(`   Response: ${data.substring(0, 200)}...`);
        }
        resolve({ status: res.statusCode, data });
      });
    }).on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve({ status: 0, error: err.message });
    });
  });
}

async function verifyDeployment() {
  console.log('🔍 验证Vercel部署...\n');
  
  const tests = [
    { url: `${VERCEL_URL}/`, desc: '主页' },
    { url: `${VERCEL_URL}/index.html`, desc: 'index.html' },
    { url: `${VERCEL_URL}/blog.html`, desc: 'blog.html' },
    { url: `${VERCEL_URL}/test-detail.html`, desc: 'test-detail.html' },
    { url: `${VERCEL_URL}/api/health`, desc: '健康检查API' },
    { url: `${VERCEL_URL}/api/blogs`, desc: '博客API' },
    { url: `${VERCEL_URL}/api/tests`, desc: '测试API' },
    { url: `${VERCEL_URL}/favicon.ico`, desc: 'Favicon' },
    { url: `${VERCEL_URL}/assets/images/logo.png`, desc: 'Logo图片' },
    { url: `${VERCEL_URL}/css/style.css`, desc: 'CSS文件' },
    { url: `${VERCEL_URL}/js/main.js`, desc: 'JS文件' }
  ];
  
  const results = [];
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.desc);
    results.push({ ...test, ...result });
  }
  
  console.log('\n📊 测试结果汇总:');
  const success = results.filter(r => r.status === 200).length;
  const total = results.length;
  console.log(`成功: ${success}/${total}`);
  
  const failures = results.filter(r => r.status !== 200);
  if (failures.length > 0) {
    console.log('\n❌ 失败的端点:');
    failures.forEach(f => {
      console.log(`- ${f.desc}: ${f.status} (${f.url})`);
    });
  }
  
  return success === total;
}

if (require.main === module) {
  verifyDeployment().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { verifyDeployment };
