// 更新 Check mental age test 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 mental_age_test_en 的 intro_en ...');
    const INTRO = `Whether a person is mature cannot be simply defined by their age, because one’s years of life do not fully align with their behaviors and emotions. Some people are physically mature, yet their actions are as childish as those of a kid. On the other hand, there are individuals who, though still young children, have already gained a good understanding of many truths about the world—this is exactly what the saying "an old head on young shoulders" means.  

Compared with one’s actual age, everyone has a mental age, which serves as a measure of how mature your mind and spirit are. A "young mind" is beneficial in some aspects, but approaching adult problems with a childlike attitude is not always a pleasant experience. This test will explore your attitudes, emotions, and other behavioral patterns to assess your mental age, helping you figure out whether you are mature enough to face the various challenges in life.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'mental_age_test_en'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'mental_age_test_en'`
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


