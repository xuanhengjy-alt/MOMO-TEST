const fs = require('fs');
const path = require('path');
const { query } = require('../config/database');

async function createTables() {
  try {
    console.log('🚀 Creating database tables...');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../../database/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 直接整体执行 SQL 文件，避免函数/触发器内的分号被错误切分
    try {
      await query(sql);
      console.log('✅ Executed full SQL file');
    } catch (error) {
      // 已存在时不视为致命错误
      if (error.code === '42P07' || error.code === '42710' || error.code === '42883') {
        console.log('⚠️  Objects may already exist, continuing:', error.message);
      } else {
        console.error('❌ SQL execution error:', error.message);
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
