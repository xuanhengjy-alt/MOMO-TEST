// 更新 Enneagram personality test free 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 enneagram_en 的 intro_en ...');
    const INTRO = `The Enneagram, also known as the Enneatypes or the Nine Personality Types, is a system that has been highly favored by MBA students at renowned international universities such as Stanford in recent years and has become one of the most popular courses. Over the past decade or so, it has gained widespread popularity in academic and business circles in Europe and America. Management teams of the world's top 500 companies have all studied the Enneagram and use it to train employees, build teams, and enhance execution capabilities. 

In their 1977 book "Temperament and Development", Dr. Alexander Thomas and Dr. Stella Chess mentioned that we can identify nine different temperaments in infants from the second to the third month after birth. 

They are:
activity level; regularity; initiative; adaptability; range of interests; intensity of response; psychological quality; degree of distraction; range and persistence of concentration. 

David Daniels discovered that these nine different temperaments precisely match the nine personality types. The Enneagram is not merely a sophisticated tool for personality analysis; more importantly, it offers profound insights for personal cultivation and self-improvement. Unlike other contemporary personality classification methods, the Enneagram reveals the deepest values and focal points of an individual's inner self, unaffected by superficial changes in external behavior. It enables one to truly understand oneself and others, helping individuals to comprehend their own personalities and fully accept their shortcomings while leveraging their strengths. It also helps people understand the personality types of others, thereby facilitating effective communication and harmonious coexistence with different individuals, and fostering more genuine and harmonious partnerships.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'enneagram_en'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'enneagram_en'`
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
