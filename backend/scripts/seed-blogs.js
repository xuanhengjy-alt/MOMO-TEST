const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function upsertSampleBlog() {
  const slug = 'the-application-of-the-mbti-personality-test-in-real-life';
  const title = 'The Application of the MBTI Personality Test in Real Life';
  const summary = 'It introduces the theoretical basis of the MBTI Personality Test, expounds its applications in personal growth, interpersonal relationships, team management and career development, and also reminds that it should be used objectively and cautiously.';
  const cover = 'assets/blogs/the-application-of-the-mbti-personality-test-in-real-life.png';
  const content_md = `The MBTI Personality Test is a tool based on psychological theories, designed to help people understand their personal traits and behavioral preferences. In real life, it has a wide range of applications, including personal growth, interpersonal relationships, team building, and career development.

First, the MBTI Personality Test can help people identify their personality types. Through the test, individuals can learn about their preferences across four dimensions: Extraversion/Introversion, Sensing/Intuition, Thinking/Feeling, and Judging/Perceiving. The combination of these dimensions results in 16 distinct personality types. By understanding their own personality type, individuals can gain better insight into their strengths, weaknesses, and potential development directions.

Second, the test can help improve interpersonal relationships. By understanding others' personality types, people can better comprehend others' ways of thinking and behavioral patterns, thereby enhancing communication and mutual understanding. For instance, a "Sensitive Insightful" type may prioritize emotions and interpersonal connections, while a "Logical Analyst" type may focus more on logic and analysis. This awareness helps people better mediate conflicts and build healthier, more harmonious relationships.

Third, the MBTI test can be used for team building. By understanding team members' personality types and behavioral preferences, leaders can assign tasks and roles more effectively, promoting team collaboration and development. For example, a "Supporter" type may be better suited for coordination and support roles, while a "Decision-Maker" type may excel in leadership and decision-making positions. This understanding enables the team to leverage each member's strengths and achieve better overall results.

Finally, the test can aid in career development. By recognizing their personality type and career inclinations, individuals can make more informed choices about their occupations and career paths. For example, an ** "Innovator" ** type may be more suitable for R&D and innovation-related work, while a "Socializer" type may thrive in sales and public relations roles. This knowledge helps individuals plan their careers more effectively and find fields where they are truly interested and skilled.

In summary, the MBTI Personality Test has extensive applications and significance in real life. By understanding their personality types and behavioral preferences, people can better manage their emotions and behaviors, improve interpersonal relationships, boost team collaboration and development, and plan their careers. However, it is important to note that the MBTI Personality Test is merely a tool; it cannot fully represent all of a person's personality traits and behaviors, nor can it determine a person's destiny. Therefore, when using the test, we should maintain an objective and cautious attitude, avoiding relying on it as the sole criterion for evaluating ourselves or others. Instead, we should combine it with real-life situations and personal experiences to continuously reflect on and refine our behaviors and ways of thinking.`;

  await query(`
    INSERT INTO blogs (slug, title, summary, content_md, cover_image_url, is_published)
    VALUES ($1, $2, $3, $4, $5, true)
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      content_md = EXCLUDED.content_md,
      cover_image_url = EXCLUDED.cover_image_url,
      is_published = true,
      updated_at = CURRENT_TIMESTAMP
  `, [slug, title, summary, content_md, cover]);
  console.log('✅ Seeded sample blog:', slug);
}

if (require.main === module) {
  upsertSampleBlog().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { upsertSampleBlog };


