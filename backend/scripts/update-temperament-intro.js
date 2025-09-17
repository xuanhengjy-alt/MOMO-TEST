// 更新 Temperament Type Test 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 temperament_type_test 的 intro_en ...');
    const INTRO = `Temperament refers to the dynamic characteristics of psychological activities, and it is similar to the concepts of "temper" or "natural disposition" commonly used in daily life. As the natural expression of personality traits, temperament is mainly shaped by the neural activity patterns of the brain and acquired habits. There is no distinction between good and bad, or superiority and inferiority, in terms of social value evaluation for different temperament types. In fact, every temperament type contains both positive and negative elements. Therefore, in the process of self-improvement of personality, one should promote strengths and avoid weaknesses. Importantly, temperament does not determine a person's moral and ethical qualities, nor does it decide the level of achievement in their activities. Individuals of all temperament types can make contributions to society, though the negative elements of their temperament may exert adverse effects on their behavior.

According to research conducted by psychologists and sociologists, temperament influences the characteristics, methods, and efficiency of a person's activities. For the smooth operation of business activities, enterprises thus require employees to possess certain temperamental traits that match their job positions, so as to achieve twice the result with half the effort. It should be noted that temperament is not an indicator of a person's intellectual development or moral standards, and it is even more inappropriate to judge an employee's merits or demerits based on a certain temperament type—each type has its own advantages and disadvantages. For example:

- Sanguine temperament: People with this type have flexible thinking, quick reactions, good communication skills, and high sensitivity; however, they tend to be volatile, impetuous, and unstable.

- Choleric temperament: Individuals of this type are straightforward, enthusiastic, and energetic; yet, they may be reckless, prone to impulsiveness, and lack accuracy.

- Phlegmatic temperament: Those with this type are calm, composed, self-disciplined, and patient; but they often react slowly and lack vitality.

- Melancholic temperament: People with this type are meticulous, profound in thinking, and down-to-earth; nevertheless, they are prone to being sentimental, withdrawn, and slow in action.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'temperament_type_test'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'temperament_type_test'`
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


