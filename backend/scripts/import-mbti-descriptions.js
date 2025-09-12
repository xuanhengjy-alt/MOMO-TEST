const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// 数据库连接配置
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function importMbtiDescriptions() {
  try {
    console.log('🚀 开始导入MBTI描述数据...');
    
    // 设置环境变量
    process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    process.env.NODE_ENV = 'development';
    
    // 读取MBTI描述JSON文件
    const mbtiDescriptionsPath = path.join(__dirname, '../../assets/data/mbti-descriptions-corrected.json');
    console.log('📁 读取文件路径:', mbtiDescriptionsPath);
    const mbtiData = JSON.parse(fs.readFileSync(mbtiDescriptionsPath, 'utf8'));
    
    console.log(`📖 读取到 ${Object.keys(mbtiData.data).length} 个MBTI类型描述`);
    
    // 获取数据库连接
    const client = await pool.connect();
    
    try {
      // 开始事务
      await client.query('BEGIN');
      
      // 获取MBTI项目的ID
      console.log('🔍 查找MBTI项目ID...');
      const projectResult = await client.query('SELECT id FROM test_projects WHERE project_id = $1', ['mbti']);
      if (projectResult.rows.length === 0) {
        throw new Error('MBTI项目不存在，请先运行init-database.js');
      }
      const mbtiProjectId = projectResult.rows[0].id;
      console.log('✅ 找到MBTI项目ID:', mbtiProjectId);
      
      // 清空现有的MBTI结果类型数据
      console.log('🗑️ 清空现有MBTI结果类型数据...');
      await client.query('DELETE FROM result_types WHERE project_id = $1', [mbtiProjectId]);
      
      // 插入MBTI描述数据
      console.log('📝 插入MBTI描述数据...');
      const insertQuery = `
        INSERT INTO result_types (
          project_id, 
          type_code, 
          type_name, 
          type_name_en, 
          description, 
          description_en, 
          analysis, 
          analysis_en
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      
      let insertedCount = 0;
      for (const [typeCode, fullDescription] of Object.entries(mbtiData.data)) {
        // 提取简短描述（前几行）
        const lines = fullDescription.split('\n');
        const briefDescription = lines.slice(0, 3).join(' ').substring(0, 200) + '...';
        
        // 设置类型名称
        const typeName = typeCode;
        const typeNameEn = typeCode;
        
        await client.query(insertQuery, [
          mbtiProjectId,    // project_id (使用数字ID)
          typeCode,         // type_code
          typeName,         // type_name
          typeNameEn,       // type_name_en
          briefDescription, // description (简短描述)
          briefDescription, // description_en
          fullDescription,  // analysis (完整描述)
          fullDescription   // analysis_en
        ]);
        
        insertedCount++;
        console.log(`✅ 已插入 ${typeCode} 类型描述`);
      }
      
      // 提交事务
      await client.query('COMMIT');
      console.log(`🎉 成功导入 ${insertedCount} 个MBTI类型描述到数据库！`);
      
    } catch (error) {
      // 回滚事务
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ 导入MBTI描述数据失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行导入脚本
if (require.main === module) {
  importMbtiDescriptions();
}

module.exports = { importMbtiDescriptions };
