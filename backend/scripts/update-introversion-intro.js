// 更新 Professional Test For Introversion vs Extroversion 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 introversion_en 的 intro_en ...');
    const INTRO = `Do you truly understand your social tendencies and energy sources? This professional test, through 70 carefully designed questions, helps you scientifically assess the extroverted and introverted traits in your personality. Extroverts often gain energy from interpersonal interactions, while introverts tend to restore their energy in solitude - and this is not simply a matter of being "lively" or "quiet", but rather about how you think, make decisions and perceive the world. 

After completing the test, you will receive a detailed personality analysis report, clearly indicating your position on the spectrum from "very introverted - introverted - extroverted - very extroverted", and helping you understand your strengths and potential challenges. Whether you are good at contemplation or passionate about expression, this test will assist you in better planning your career path, optimizing your social approach, and achieving more composed growth based on self-awareness. 

Are you ready to have a 15-minute conversation with your true self?`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'introversion_en'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'introversion_en'`
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
