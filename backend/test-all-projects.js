// 测试所有项目的字段映射
const testAllProjects = async () => {
  try {
    console.log('🧪 测试所有项目的字段映射...\n');
    
    // 获取所有测试项目
    const response = await fetch('http://localhost:3000/api/tests');
    const data = await response.json();
    
    if (!data.projects) {
      console.log('❌ 无法获取项目列表');
      return;
    }
    
    console.log(`找到 ${data.projects.length} 个测试项目\n`);
    
    // 测试每个项目
    for (const project of data.projects) {
      console.log(`📋 测试 ${project.id}: ${project.name}`);
      
      try {
        // 模拟测试答案（根据问题数量）
        const questionCount = project.questionCount || 10;
        const mockAnswers = new Array(questionCount).fill(2); // 全部选第3个选项
        
        const resultResponse = await fetch('http://localhost:3000/api/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: project.id,
            answers: mockAnswers,
            sessionId: 'test-session-' + Date.now()
          })
        });
        
        const result = await resultResponse.json();
        
        if (result.success && result.result) {
          console.log(`   ✅ 测试成功`);
          console.log(`   Summary: "${result.result.summary}"`);
          console.log(`   Analysis: "${result.result.analysis ? result.result.analysis.substring(0, 100) + '...' : '无'}"`);
          console.log(`   Total Score: ${result.result.totalScore || '无'}`);
          console.log(`   Result Type: ${result.result.resultType || '无'}`);
          
          // 检查是否有问题
          if (result.result.summary === '暂不支持的测试类型') {
            console.log(`   ❌ 仍然显示"暂不支持的测试类型"`);
          } else if (result.result.summary && result.result.summary.length > 10) {
            console.log(`   ✅ Summary内容正常`);
          } else {
            console.log(`   ⚠️ Summary内容可能有问题`);
          }
        } else {
          console.log(`   ❌ 测试失败: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`   ❌ 测试异常: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('✅ 所有项目测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
};

testAllProjects();
