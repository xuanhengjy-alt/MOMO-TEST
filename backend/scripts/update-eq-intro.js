// 更新 International Standard Emotional Intelligence Test 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 eq_test_en 的 intro_en ...');
    const INTRO = `Psychologists suggest that among the various subjective factors influencing personal success, intelligence quotient (IQ) contributes approximately 20%, while emotional quotient (EQ) accounts for roughly 80%. Emotional intelligence comprises the following key components:

1. Self-awareness — the ability to recognize and understand one’s own emotions, which is essential for making informed decisions and maintaining autonomy in life.
2. Emotional regulation — the capacity to manage and control emotional responses effectively, enabling greater self-control and adaptability.
3. Self-motivation — the internal drive that enables individuals to recover from setbacks, maintain perseverance, and initiate new endeavors.
4. Empathy — the ability to identify and understand the emotions of others, which serves as the foundation for effective communication and meaningful interpersonal relationships.
5. Social skills — the competence in managing interpersonal relationships and influencing others, which is closely related to leadership and organizational abilities.

The International Standard EQ Assessment is a widely recognized evaluation tool that originated in Europe. It has been adopted by numerous multinational corporations, including Coca-Cola, McDonald's, and Nokia, as a reference framework for employee emotional intelligence assessments. This test is designed to help individuals better understand their emotional competencies and areas for development.

If you are prepared, you may now proceed with the assessment.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'eq_test_en'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'eq_test_en'`
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
