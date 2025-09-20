// 统一的数据库连接模块
const { Pool } = require('pg');
const { getDatabaseConfig } = require('./environment');

// 创建数据库连接池
const pool = new Pool(getDatabaseConfig());

// 查询重试机制
const query = async (text, params, retries = 3) => {
  const start = Date.now();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text: text.substring(0, 100) + '...', duration, rows: res.rowCount, attempt });
      return res;
    } catch (error) {
      console.error(`Database query error (attempt ${attempt}/${retries}):`, error.message);
      if (attempt === retries) {
        throw error;
      }
      // 指数退避
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
};

// 从数据库获取结果类型信息（统一规则）
const getResultTypeFromDatabase = async (projectId, typeCode) => {
  try {
    const result = await query(`
      SELECT rt.type_code, rt.type_name_en, 
             COALESCE(rt.description_en, '') AS description_en,
             COALESCE(rt.analysis_en, '') AS analysis_en
      FROM result_types rt
      JOIN test_projects tp ON rt.project_id = tp.id
      WHERE tp.project_id = $1 AND rt.type_code = $2
    `, [projectId, typeCode]);
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        type_code: row.type_code,
        type_name_en: row.type_name_en,
        description_en: row.description_en,
        analysis_en: row.analysis_en
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching result type from database:', error);
    return null;
  }
};

// 健康检查
const healthCheck = async () => {
  try {
    await query('SELECT 1');
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

module.exports = {
  pool,
  query,
  getResultTypeFromDatabase,
  healthCheck
};
