// 更新 Four-colors Personality Analysis 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 four_colors_en 的 intro_en ...');
    const INTRO = `FPA (Four-colors Personality Analysis) provides people with a simple and practical tool that everyone can quickly master and apply in real life and work. No matter what kind of occupation you are engaged in - whether in an office, a hospital, a store, a school or a construction site, you can gain insights into the personality traits of people around you through their dressing styles, job responsibilities and ways of interpersonal communication. Mastering this tool not only helps you learn to appreciate others, but also enables you to create a harmonious and efficient working atmosphere.

At the same time, FPA profoundly explains the differences between "personality" and "character", and between "motivation" and "behavior", thus taking the understanding of human behavior to a deeper level.

The FPA color personality test usually consists of a series of carefully designed questions that cover an individual's behavioral habits, thinking patterns, emotional reactions and coping strategies in different situations.

FPA Four-color Personality Analysis opens a window for us to understand ourselves and others. By identifying the characteristics and advantages of different color personalities, we can give full play to our own potential, improve interpersonal relationships and enhance the quality of life. In this diverse world, let us use the wisdom of color psychology to get along harmoniously with people of different personalities and jointly create a better future.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'four_colors_en'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'four_colors_en'`
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


