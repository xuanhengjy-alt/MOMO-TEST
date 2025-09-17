// 更新 Phil personality test 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 phil_test_en 的 intro_en ...');
    const INTRO = `The Phil Personality Test is a psychological assessment instrument developed by Dr. Phil, a prominent psychologist, during his appearance on the television program hosted by renowned media personality Oprah Winfrey. This test categorizes personality types based on the analysis of behavioral patterns and psychological inclinations. It has since been adopted by certain organizations for purposes such as personnel evaluation and employee profiling.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'phil_test_en'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'phil_test_en'`
    );
    console.log('\n📋 验证内容预览:');
    console.log((verify.rows[0]?.intro_en || '').slice(0, 200) + '...');
    console.log('\n🎉 更新完成');
    process.exit(0);
  } catch (e) {
    console.error('❌ 更新失败:', e);
    process.exit(1);
  }
})();


