// 检查其他测试项目的数据内容
const { query } = require('./config/database');

async function checkOtherTestsData() {
  try {
    console.log('🔍 检查其他测试项目的数据内容...\n');
    
    // 检查MBTI测试
    console.log('1. MBTI测试数据:');
    const mbtiQuery = await query(`
      SELECT rt.type_code, rt.type_name_en, rt.description_en, rt.analysis_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = 'mbti'
      LIMIT 2
    `);
    
    mbtiQuery.rows.forEach((row, index) => {
      console.log(`\n   ${index + 1}. ${row.type_code}:`);
      console.log(`      Type Name: "${row.type_name_en}"`);
      console.log(`      Description: "${row.description_en}"`);
      console.log(`      Analysis: "${row.analysis_en}"`);
      console.log(`      Description长度: ${row.description_en ? row.description_en.length : 0}`);
      console.log(`      Analysis长度: ${row.analysis_en ? row.analysis_en.length : 0}`);
    });
    
    // 检查Enneagram测试
    console.log('\n2. Enneagram测试数据:');
    const enneagramQuery = await query(`
      SELECT rt.type_code, rt.type_name_en, rt.description_en, rt.analysis_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = 'enneagram_en'
      LIMIT 2
    `);
    
    enneagramQuery.rows.forEach((row, index) => {
      console.log(`\n   ${index + 1}. ${row.type_code}:`);
      console.log(`      Type Name: "${row.type_name_en}"`);
      console.log(`      Description: "${row.description_en}"`);
      console.log(`      Analysis: "${row.analysis_en}"`);
      console.log(`      Description长度: ${row.description_en ? row.description_en.length : 0}`);
      console.log(`      Analysis长度: ${row.analysis_en ? row.analysis_en.length : 0}`);
    });
    
    // 检查EQ测试
    console.log('\n3. EQ测试数据:');
    const eqQuery = await query(`
      SELECT rt.type_code, rt.type_name_en, rt.description_en, rt.analysis_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = 'eq_en'
      LIMIT 2
    `);
    
    eqQuery.rows.forEach((row, index) => {
      console.log(`\n   ${index + 1}. ${row.type_code}:`);
      console.log(`      Type Name: "${row.type_name_en}"`);
      console.log(`      Description: "${row.description_en}"`);
      console.log(`      Analysis: "${row.analysis_en}"`);
      console.log(`      Description长度: ${row.description_en ? row.description_en.length : 0}`);
      console.log(`      Analysis长度: ${row.analysis_en ? row.analysis_en.length : 0}`);
    });
    
    console.log('\n✅ 其他测试项目数据检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkOtherTestsData();
