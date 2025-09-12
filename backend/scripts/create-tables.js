const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function createTables() {
  try {
    console.log('🚀 Creating database tables...');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../../database/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 分割SQL语句（以分号分割）
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
          console.log('✅ Executed SQL statement');
        } catch (error) {
          // 忽略一些错误（如表已存在等）
          if (error.code === '42P07') { // relation already exists
            console.log('⚠️  Table already exists, skipping');
          } else {
            console.error('❌ SQL execution error:', error.message);
          }
        }
      }
    }
    
    console.log('🎉 Database tables created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create tables:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createTables().then(() => {
    process.exit(0);
  });
}

module.exports = { createTables };
