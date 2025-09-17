// 更新 Professional Dyna-Metric Program (PDP) 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 pdp_test_en 的 intro_en ...');
    const INTRO = `PDP, or Professional Dyna-Metric Program, is a tool for behavioral style assessment. Behavioral style refers to the most proficient way of doing things in a person's natural endowment. It is a system used to measure an individual's behavioral traits, vitality, kinetic energy, stress, energy, and energy fluctuations. PDP classifies people into five types based on their innate traits, namely: Dominant, Expressive, Amiable, Analytical, and Integrative. To visualize the personality traits of these five types, they are respectively called "Tiger", "Peacock", "Koala", "Owl", and "Chameleon".

PDP was jointly invented by the Institute of Statistical Sciences at the University of Southern California in the United States and the Rtcatch Behavioral Science Research Institute in the United Kingdom. It can measure an individual's "basic behavior", "response to the environment", and "predictable behavior patterns". Over the past 25 years, there have been 16 million valid computer cases worldwide, and more than 5,000 enterprises, research institutions, and government organizations have continuously tracked its effectiveness. Its effectiveness has been confirmed through four research methods: structure, contributing factors, predictive ability, and content validity. The reliability of all adjective distinctions exceeds 86%.

Research institution surveys show that when the procedures suggested by PDP are adopted and implemented, the error rate is less than 4%. Through the PDP test, we can understand our behavioral style, make up for our shortcomings, and play to our strengths.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'pdp_test_en'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'pdp_test_en'`
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


