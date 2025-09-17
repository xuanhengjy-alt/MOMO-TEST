// 更新 MBTI Career Personality Test 的 intro_en 字段
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 mbti 的 intro_en ...');
    const INTRO = `The MBTI personality theory is based on the classification of psychological types by the renowned psychologist Carl Jung, which was later studied and developed by a mother and daughter, Katharine Cook Briggs and Isabel Briggs Myers. This theory can help explain why different people are interested in different things, excel at different jobs, and sometimes don't understand each other. This tool has been in use around the world for nearly 30 years. Couples use it to enhance harmony, teachers and students use it to improve learning and teaching efficiency, young people use it to choose careers, organizations use it to improve interpersonal relationships, team communication, organizational building, organizational diagnosis and many other aspects. In the Fortune 500, 80 percent of companies have experience in applying MBTI.

People tend to develop their personalities during adolescence, after which they have a relatively stable personality type, which then develops and improves dynamically over the years. We usually think that as a person grows older, his character changes. According to Jung's theory, once a person's character is formed, it is very difficult to change. The reason for showing different manifestations is that the character is developing dynamically due to changes in factors such as environment and experience, and functions that were not used before are also being exerted accordingly. If we use the left hand and the right hand as a metaphor, a person's MBTI tendencies are the hand he is most familiar with using, and as he gains more experience, he begins to practice using the other hand.

The personality type description provided by MBTI is only for the test-taker to determine their own personality type. There are no good or bad personality types, only differences. Each personality trait has its own value and merits, as well as weaknesses and points to note. A clear understanding of one's strengths and weaknesses helps to better utilize one's strengths, and to avoid weaknesses in one's personality as much as possible in dealing with people and matters, to get along better with others, and to make better important decisions.

Those who take part in the test must answer the questions honestly and independently. Only in this way can effective results be obtained.`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = 'mbti'`,
      [INTRO]
    );
    console.log('✅ 已更新 intro_en');

    const verify = await query(
      `SELECT intro_en FROM test_projects WHERE project_id = 'mbti'`
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
