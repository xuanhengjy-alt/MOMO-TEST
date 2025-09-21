#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Vercel部署问题诊断工具\n');

// 1. 检查Git状态
console.log('1️⃣ 检查Git状态...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log('⚠️  有未提交的更改:');
    console.log(gitStatus);
  } else {
    console.log('✅ Git工作区干净');
  }
} catch (error) {
  console.log('❌ 无法检查Git状态:', error.message);
}

// 2. 检查远程仓库
console.log('\n2️⃣ 检查远程仓库...');
try {
  const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
  console.log('📍 远程仓库:', remoteUrl);
  
  if (!remoteUrl.includes('github.com')) {
    console.log('⚠️  警告: 远程仓库不是GitHub，可能影响Vercel自动部署');
  }
} catch (error) {
  console.log('❌ 无法获取远程仓库信息:', error.message);
}

// 3. 检查最近提交
console.log('\n3️⃣ 检查最近提交...');
try {
  const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
  console.log('📝 最近提交:', lastCommit);
  
  const lastPush = execSync('git log origin/HEAD -1 --oneline', { encoding: 'utf8' }).trim();
  console.log('🚀 远程最新提交:', lastPush);
  
  if (lastCommit !== lastPush) {
    console.log('⚠️  本地提交未推送到远程，请运行: git push');
  } else {
    console.log('✅ 本地和远程同步');
  }
} catch (error) {
  console.log('❌ 无法检查提交状态:', error.message);
}

// 4. 检查Vercel配置
console.log('\n4️⃣ 检查Vercel配置...');
const vercelConfig = 'vercel.json';
if (fs.existsSync(vercelConfig)) {
  try {
    const config = JSON.parse(fs.readFileSync(vercelConfig, 'utf8'));
    console.log('✅ vercel.json存在');
    console.log('📋 配置版本:', config.version);
    
    if (config.builds) {
      console.log('🔧 构建配置:', config.builds.length, '个');
    }
    
    if (config.routes && config.routes.length > 0) {
      console.log('⚠️  警告: 发现路由配置，可能影响自动部署');
    } else {
      console.log('✅ 无复杂路由配置');
    }
  } catch (error) {
    console.log('❌ vercel.json格式错误:', error.message);
  }
} else {
  console.log('❌ vercel.json不存在');
}

// 5. 检查API文件
console.log('\n5️⃣ 检查API文件...');
const apiDir = 'api';
if (fs.existsSync(apiDir)) {
  const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));
  console.log('✅ API目录存在，包含', apiFiles.length, '个文件');
  
  // 检查统一API文件
  const unifiedFiles = ['health-unified.js', 'tests-unified.js', 'blogs-unified.js', 'results-unified.js'];
  const missingUnified = unifiedFiles.filter(f => !fs.existsSync(path.join(apiDir, f)));
  
  if (missingUnified.length > 0) {
    console.log('⚠️  缺少统一API文件:', missingUnified.join(', '));
  } else {
    console.log('✅ 所有统一API文件存在');
  }
} else {
  console.log('❌ API目录不存在');
}

// 6. 检查环境变量
console.log('\n6️⃣ 检查环境变量...');
if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL已设置');
} else {
  console.log('⚠️  DATABASE_URL未设置，可能影响部署');
}

// 7. 检查package.json
console.log('\n7️⃣ 检查package.json...');
if (fs.existsSync('package.json')) {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ package.json存在');
    console.log('📦 项目名称:', pkg.name);
    console.log('🔧 Node版本要求:', pkg.engines?.node || '未指定');
    
    if (pkg.scripts?.build) {
      console.log('✅ 构建脚本存在');
    } else {
      console.log('⚠️  无构建脚本，使用默认构建');
    }
  } catch (error) {
    console.log('❌ package.json格式错误:', error.message);
  }
} else {
  console.log('❌ package.json不存在');
}

// 8. 建议解决方案
console.log('\n🎯 建议解决方案:');
console.log('1. 确保代码已推送到GitHub: git add . && git commit -m "fix" && git push');
console.log('2. 检查Vercel Dashboard中的项目设置:');
console.log('   - 确认GitHub仓库连接正确');
console.log('   - 确认分支设置正确');
console.log('   - 检查环境变量设置');
console.log('3. 手动触发部署: 在Vercel Dashboard中点击"Redeploy"');
console.log('4. 检查部署日志: 在Vercel Dashboard的"Functions"标签页查看错误');

console.log('\n✨ 诊断完成！');
