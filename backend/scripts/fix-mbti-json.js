const fs = require('fs');
const path = require('path');

function fixMbtiJson() {
  try {
    console.log('🔧 开始修复MBTI JSON文件...');
    
    const mbtiDescriptionsPath = path.join(__dirname, '../../assets/data/mbti-descriptions.json');
    const content = fs.readFileSync(mbtiDescriptionsPath, 'utf8');
    
    console.log('📖 原始文件大小:', content.length, '字符');
    
    // 修复JSON格式问题
    let fixedContent = content
      // 转义换行符
      .replace(/\n/g, '\\n')
      // 转义双引号
      .replace(/"/g, '\\"')
      // 转义反斜杠
      .replace(/\\/g, '\\\\');
    
    console.log('✅ JSON文件修复完成');
    console.log('📖 修复后文件大小:', fixedContent.length, '字符');
    
    // 保存修复后的文件
    const fixedPath = path.join(__dirname, '../../assets/data/mbti-descriptions-fixed.json');
    fs.writeFileSync(fixedPath, fixedContent, 'utf8');
    
    console.log('💾 修复后的文件已保存到:', fixedPath);
    
  } catch (error) {
    console.error('❌ 修复JSON文件失败:', error);
  }
}

fixMbtiJson();
