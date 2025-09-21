#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 清理API文件，减少Vercel函数数量...\n');

// 需要删除的旧API文件
const filesToDelete = [
  'api/blogs.js',           // 使用 blogs-unified.js
  'api/health.js',          // 使用 health-unified.js  
  'api/results.js',         // 使用 results-unified.js
  'api/results-backup.js',  // 备份文件，不需要部署
  'api/results-new.js',     // 新版本，使用 unified 版本
  'api/test.js',            // 测试文件，不需要部署
  'api/tests.js'            // 使用 tests-unified.js
];

// 保留的文件
const filesToKeep = [
  'api/blogs-unified.js',
  'api/health-unified.js', 
  'api/results-unified.js',
  'api/tests-unified.js',
  'api/results/stats/[id].js',
  'api/tests/[id].js',
  'api/tests/[id]/like.js',
  'api/tests/[id]/questions.js'
];

console.log('📋 将要删除的文件:');
filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ❌ ${file}`);
  } else {
    console.log(`  ⚠️  ${file} (不存在)`);
  }
});

console.log('\n📋 保留的文件:');
filesToKeep.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ⚠️  ${file} (不存在)`);
  }
});

// 确认删除
console.log('\n🗑️  开始删除文件...');
let deletedCount = 0;

filesToDelete.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`  ✅ 已删除: ${file}`);
      deletedCount++;
    } catch (error) {
      console.log(`  ❌ 删除失败: ${file} - ${error.message}`);
    }
  }
});

console.log(`\n📊 清理完成！删除了 ${deletedCount} 个文件`);
console.log(`📊 剩余API文件数量: ${filesToKeep.length} 个`);

// 验证最终的文件数量
const remainingFiles = fs.readdirSync('api', { recursive: true })
  .filter(file => typeof file === 'string' && file.endsWith('.js'))
  .length;

console.log(`📊 实际剩余文件数量: ${remainingFiles} 个`);

if (remainingFiles <= 12) {
  console.log('✅ 符合Vercel免费计划限制（≤12个函数）');
} else {
  console.log('❌ 仍然超过Vercel免费计划限制');
}
