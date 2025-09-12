const { Pool } = require('pg');

// 设置环境变量
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
process.env.NODE_ENV = 'development';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkMbtiData() {
  try {
    console.log('🔍 检查MBTI数据...');
    
    const client = await pool.connect();
    
    try {
      // 查询MBTI项目信息
      const projectResult = await client.query(`
        SELECT id, project_id, name FROM test_projects WHERE project_id = 'mbti'
      `);
      
      console.log('📋 MBTI项目信息:');
      console.log(projectResult.rows);
      
      // 查询MBTI结果类型
      const resultTypesResult = await client.query(`
        SELECT rt.type_code, rt.type_name, rt.description, rt.analysis
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'mbti'
        ORDER BY rt.type_code
      `);
      
      console.log(`\n📊 找到 ${resultTypesResult.rows.length} 个MBTI类型:`);
      resultTypesResult.rows.forEach(row => {
        console.log(`\n${row.type_code}:`);
        console.log(`  描述长度: ${row.description ? row.description.length : 0} 字符`);
        console.log(`  分析长度: ${row.analysis ? row.analysis.length : 0} 字符`);
        console.log(`  描述预览: ${row.description ? row.description.substring(0, 100) + '...' : '无'}`);
      });
      
      // 测试查询INTJ类型
      const intjResult = await client.query(`
        SELECT rt.analysis, rt.description, rt.type_name
        FROM result_types rt
        JOIN test_projects tp ON rt.project_id = tp.id
        WHERE tp.project_id = 'mbti' AND rt.type_code = 'INTJ'
      `);
      
      console.log('\n🎯 INTJ类型查询结果:');
      if (intjResult.rows.length > 0) {
        const intj = intjResult.rows[0];
        console.log(`类型名称: ${intj.type_name}`);
        console.log(`分析长度: ${intj.analysis ? intj.analysis.length : 0} 字符`);
        console.log(`分析预览: ${intj.analysis ? intj.analysis.substring(0, 200) + '...' : '无'}`);
      } else {
        console.log('❌ 未找到INTJ类型');
      }
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ 检查MBTI数据失败:', error);
  } finally {
    await pool.end();
  }
}

checkMbtiData();
