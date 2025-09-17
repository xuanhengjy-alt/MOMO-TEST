// 更新 DISC Personality Test 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 disc 的 intro_en ...');
    const INTRO = `In the 1920s, American psychologist William Moulton Marston developed a theory to explain human emotional responses. Prior to this, such research had been largely confined to studies of psychiatric patients or individuals with mental disorders. Dr. Marston sought to broaden the scope of this research to apply it to the general population with normal mental health. Consequently, he structured his theory into a systematic framework titled The Emotions of Normal People.

To test his theory, Dr. Marston needed a psychological assessment method to measure emotional responses—specifically, “personality traits.” He identified four highly representative personality factors: Dominance, Influence, Steadiness, and Compliance. DISC represents the initial letters of these four English words. In 1928, Dr. Marston formally introduced the DISC assessment and its theoretical framework within his book The Emotions of Normal People.

Today, DISC theory is extensively applied in talent recruitment by Fortune 500 companies worldwide, distinguished by its longstanding history, strong professionalism, and high authority.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'disc'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'disc'`
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
