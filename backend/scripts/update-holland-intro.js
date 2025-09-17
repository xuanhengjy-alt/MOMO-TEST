// 更新 Holland Occupational Interest Test 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 holland_test_en 的 intro_en ...');
    const INTRO = `Are you looking for a suitable career direction for yourself? Are you curious which jobs are more compatible with your personality traits? John Holland, a psychology professor at Johns Hopkins University in the United States and a renowned career guidance expert, put forward the far-reaching "Vocational Interest Theory" as early as 1959. 🌟

This theory holds that a person's personality and interests directly influence career choices and sense of accomplishment. When a person engages in a career that matches their personality type, they will be more proactive, persistent, and happy. Holland classified personalities into six types: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. Each type corresponds to different career inclinations and ability advantages.

Do you want to know which personality type you belong to? Which career environment can maximize your potential?

Why not participate in our "Holland Occupational Interest Test"? In just a few minutes, it can help you see your future direction more clearly!`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'holland_test_en'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'holland_test_en'`
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


