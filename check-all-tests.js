const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

async function checkAllTests() {
  try {
    console.log('🔍 检查所有测试项目的完整数据...\n');
    
    // 1. 获取所有测试项目
    const projectsResult = await pool.query(`
      SELECT 
        project_id, 
        name, 
        name_en, 
        intro, 
        intro_en, 
        is_active,
        question_count,
        estimated_time
      FROM test_projects 
      WHERE is_active = true
      ORDER BY created_at ASC
    `);
    
    console.log(`📊 数据库中的测试项目总数: ${projectsResult.rows.length}\n`);
    
    // 2. 检查每个测试项目
    for (const project of projectsResult.rows) {
      console.log(`\n🔸 测试项目: ${project.project_id}`);
      console.log(`   名称: ${project.name_en}`);
      
      // 检查Introduction
      const hasIntro = project.intro && project.intro.trim().length > 0;
      const hasIntroEn = project.intro_en && project.intro_en.trim().length > 0;
      console.log(`   Introduction: ${hasIntro ? '✅' : '❌'} (中文: ${hasIntro ? '有' : '无'}, 英文: ${hasIntroEn ? '有' : '无'})`);
      
      // 检查题目数量
      const questionsResult = await pool.query(`
        SELECT COUNT(*) as count FROM questions WHERE project_id = $1
      `, [project.project_id]);
      const questionCount = parseInt(questionsResult.rows[0].count);
      console.log(`   题目数量: ${questionCount} (配置: ${project.question_count || 'N/A'})`);
      
      // 检查结果类型和分析
      const resultTypesResult = await pool.query(`
        SELECT 
          type_code, 
          type_name, 
          type_name_en, 
          description, 
          description_en, 
          analysis, 
          analysis_en
        FROM result_types 
        WHERE project_id = $1
        ORDER BY type_code
      `, [project.project_id]);
      
      const resultTypes = resultTypesResult.rows;
      console.log(`   结果类型数量: ${resultTypes.length}`);
      
      if (resultTypes.length > 0) {
        resultTypes.forEach((rt, index) => {
          const hasName = rt.type_name && rt.type_name.trim().length > 0;
          const hasNameEn = rt.type_name_en && rt.type_name_en.trim().length > 0;
          const hasDesc = rt.description && rt.description.trim().length > 0;
          const hasDescEn = rt.description_en && rt.description_en.trim().length > 0;
          const hasAnalysis = rt.analysis && rt.analysis.trim().length > 0;
          const hasAnalysisEn = rt.analysis_en && rt.analysis_en.trim().length > 0;
          
          console.log(`     ${index + 1}. ${rt.type_code}:`);
          console.log(`        名称: ${hasName ? '✅' : '❌'} (中文: ${hasName ? '有' : '无'}, 英文: ${hasNameEn ? '有' : '无'})`);
          console.log(`        描述: ${hasDesc ? '✅' : '❌'} (中文: ${hasDesc ? '有' : '无'}, 英文: ${hasDescEn ? '有' : '无'})`);
          console.log(`        分析: ${hasAnalysis ? '✅' : '❌'} (中文: ${hasAnalysis ? '有' : '无'}, 英文: ${hasAnalysisEn ? '有' : '无'})`);
        });
      } else {
        console.log(`   ❌ 没有结果类型数据`);
      }
      
      // 检查题目选项
      const optionsResult = await pool.query(`
        SELECT COUNT(*) as count 
        FROM question_options qo 
        JOIN questions q ON qo.question_id = q.id 
        WHERE q.project_id = $1
      `, [project.project_id]);
      const optionCount = parseInt(optionsResult.rows[0].count);
      console.log(`   题目选项数量: ${optionCount}`);
      
      // 计算完整性分数
      let completenessScore = 0;
      let totalChecks = 0;
      
      // Introduction检查
      totalChecks += 2;
      if (hasIntro) completenessScore += 1;
      if (hasIntroEn) completenessScore += 1;
      
      // 结果类型检查
      if (resultTypes.length > 0) {
        resultTypes.forEach(rt => {
          totalChecks += 6; // 名称(2) + 描述(2) + 分析(2)
          if (rt.type_name && rt.type_name.trim().length > 0) completenessScore += 1;
          if (rt.type_name_en && rt.type_name_en.trim().length > 0) completenessScore += 1;
          if (rt.description && rt.description.trim().length > 0) completenessScore += 1;
          if (rt.description_en && rt.description_en.trim().length > 0) completenessScore += 1;
          if (rt.analysis && rt.analysis.trim().length > 0) completenessScore += 1;
          if (rt.analysis_en && rt.analysis_en.trim().length > 0) completenessScore += 1;
        });
      }
      
      const completenessPercent = totalChecks > 0 ? Math.round((completenessScore / totalChecks) * 100) : 0;
      console.log(`   📈 数据完整性: ${completenessPercent}% (${completenessScore}/${totalChecks})`);
      
      if (completenessPercent < 80) {
        console.log(`   ⚠️  数据不完整，需要补充`);
      } else if (completenessPercent < 100) {
        console.log(`   ⚠️  数据基本完整，但有小部分缺失`);
      } else {
        console.log(`   ✅ 数据完整`);
      }
    }
    
    // 3. 总结
    console.log(`\n📋 检查总结:`);
    console.log(`   总测试项目数: ${projectsResult.rows.length}`);
    
    const incompleteProjects = [];
    for (const project of projectsResult.rows) {
      const resultTypesResult = await pool.query(`
        SELECT COUNT(*) as count FROM result_types WHERE project_id = $1
      `, [project.project_id]);
      
      const hasResultTypes = parseInt(resultTypesResult.rows[0].count) > 0;
      const hasIntro = project.intro && project.intro.trim().length > 0;
      
      if (!hasResultTypes || !hasIntro) {
        incompleteProjects.push(project.project_id);
      }
    }
    
    if (incompleteProjects.length > 0) {
      console.log(`   ❌ 不完整的项目: ${incompleteProjects.join(', ')}`);
    } else {
      console.log(`   ✅ 所有项目都有基本数据`);
    }
    
  } catch (error) {
    console.error('❌ 检查过程中出错:', error.message);
  } finally {
    await pool.end();
  }
}

checkAllTests();
