// 更新 Kelsey Temperament Type Test 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 kelsey_test_en 的 intro_en ...');
    const INTRO = `The Kiersey Temperament Sorter is a widely utilized psychological assessment tool designed to help individuals understand their inherent temperament traits and behavioral tendencies. Grounded in the Kiersey Temperament Theory, this assessment categorizes human temperaments into four distinct types: Choleric, Sanguine, Melancholic, and Phlegmatic.

Individuals with a Choleric temperament are typically characterized by confidence, decisiveness, and high energy. They demonstrate strong leadership abilities within team settings. Those with a Sanguine temperament are sociable, optimistic, and creative, often serving as the focal point in social gatherings and activities. Phlegmatic individuals tend to be calm, amiable, and detail-oriented, exhibiting strong organizational and planning capabilities. Individuals with a Melancholic temperament are generally introspective, emotionally sensitive, and analytical, often excelling in roles requiring deep thinking and strategic decision-making.

The Kiersey Temperament Sorter evaluates an individual’s preference among the four temperament types through a structured series of questions and situational scenarios. The resulting insights can assist individuals in gaining a clearer understanding of their behavioral patterns, fostering personal development, and improving interpersonal communication and collaboration.

It is important to note that the Kiersey Temperament Sorter offers only a foundational understanding of an individual’s temperament and should not be regarded as a definitive measure of personality. Temperament is a complex and dynamic construct, shaped by a range of internal and external factors, including environmental influences, personal experiences, and educational background. Consequently, while the test can provide valuable self-awareness, individuals should continue to refine their behavioral strategies and interpersonal skills through practical experience to support ongoing personal and professional growth.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'kelsey_test_en'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'kelsey_test_en'`
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


