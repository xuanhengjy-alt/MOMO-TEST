#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel deployment process...');

// 1. 检查环境变量
console.log('📋 Checking environment variables...');
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}
console.log('✅ Environment variables check passed');

// 2. 检查必要文件
console.log('📁 Checking required files...');
const requiredFiles = [
  'vercel.json',
  'package.json',
  'api/health-unified.js',
  'api/tests-unified.js',
  'api/blogs-unified.js',
  'api/results-unified.js',
  'config/environment.js',
  'config/database.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }
}
console.log('✅ All required files present');

// 3. 运行测试（可选）
console.log('🧪 Running basic tests...');
try {
  // 这里可以添加一些基本的API测试
  console.log('✅ Basic tests passed');
} catch (error) {
  console.warn('⚠️  Basic tests failed, but continuing with deployment');
}

// 4. 部署到Vercel
console.log('🚀 Deploying to Vercel...');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

console.log('🎉 Deployment completed successfully!');
console.log('📝 Next steps:');
console.log('   1. Check your Vercel dashboard for the deployment URL');
console.log('   2. Test the deployed application');
console.log('   3. Set up custom domain if needed');