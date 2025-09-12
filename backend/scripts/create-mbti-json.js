const fs = require('fs');
const path = require('path');

function createMbtiJson() {
  try {
    console.log('🔧 开始创建格式正确的MBTI JSON文件...');
    
    const mbtiDescriptionsPath = path.join(__dirname, '../../assets/data/mbti-descriptions.json');
    const content = fs.readFileSync(mbtiDescriptionsPath, 'utf8');
    
    // 手动解析内容（因为原始JSON格式有问题）
    const lines = content.split('\n');
    const result = {
      meta: { version: 1 },
      data: {}
    };
    
    let currentType = null;
    let currentDescription = '';
    let inDataSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('"data": {')) {
        inDataSection = true;
        continue;
      }
      
      if (inDataSection && line.startsWith('"') && line.includes('": "')) {
        // 保存前一个类型
        if (currentType && currentDescription) {
          result.data[currentType] = currentDescription.trim();
        }
        
        // 开始新类型
        const match = line.match(/"([^"]+)":\s*"(.*)/);
        if (match) {
          currentType = match[1];
          currentDescription = match[2];
        }
        continue;
      }
      
      if (inDataSection && currentType && line !== '}') {
        // 继续构建描述
        if (line.endsWith('",') || line.endsWith('"')) {
          // 移除结尾的引号和逗号
          const cleanLine = line.replace(/",?\s*$/, '');
          currentDescription += cleanLine;
        } else {
          currentDescription += ' ' + line;
        }
      }
    }
    
    // 保存最后一个类型
    if (currentType && currentDescription) {
      result.data[currentType] = currentDescription.trim();
    }
    
    console.log(`📖 解析到 ${Object.keys(result.data).length} 个MBTI类型`);
    
    // 保存格式正确的JSON文件
    const outputPath = path.join(__dirname, '../../assets/data/mbti-descriptions-corrected.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    
    console.log('💾 格式正确的JSON文件已保存到:', outputPath);
    
    return result;
    
  } catch (error) {
    console.error('❌ 创建JSON文件失败:', error);
    return null;
  }
}

const mbtiData = createMbtiJson();
if (mbtiData) {
  console.log('✅ MBTI数据创建成功！');
  console.log('类型列表:', Object.keys(mbtiData.data));
}
