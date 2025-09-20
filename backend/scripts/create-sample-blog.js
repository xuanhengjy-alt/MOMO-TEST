// 创建示例博客数据
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

async function createSampleBlogs() {
  try {
    console.log('🔄 开始创建示例博客数据...\n');

    const sampleBlogs = [
      {
        slug: 'mbti-personality-test-guide',
        title: 'Complete Guide to MBTI Personality Test',
        summary: 'Learn everything about the MBTI personality test, including the 16 personality types, how to take the test, and practical applications in daily life.',
        content_md: `# Complete Guide to MBTI Personality Test

The Myers-Briggs Type Indicator (MBTI) is one of the most popular personality tests in the world. It helps people understand their personality preferences and how they interact with others.

## What is MBTI?

The MBTI is based on Carl Jung's theory of psychological types and was developed by Katharine Cook Briggs and Isabel Briggs Myers. It categorizes people into 16 different personality types based on four key dimensions:

- **Extraversion (E) vs Introversion (I)**: How you gain energy
- **Sensing (S) vs Intuition (N)**: How you take in information  
- **Thinking (T) vs Feeling (F)**: How you make decisions
- **Judging (J) vs Perceiving (P)**: How you approach life

## The 16 Personality Types

Each combination of these preferences results in one of 16 unique personality types, such as:
- ENFP (The Campaigner)
- INTJ (The Architect)
- ESFJ (The Consul)
- ISTP (The Virtuoso)

## How to Take the Test

Taking the MBTI test is simple and takes about 15-20 minutes. Answer each question honestly based on your natural preferences, not how you think you should answer.

## Applications

The MBTI can be used for:
- Personal development
- Career guidance
- Team building
- Relationship improvement
- Educational planning

Remember, the MBTI is a tool for self-discovery, not a definitive measure of your personality.`,
        cover_image_url: 'assets/blogs/mbti-personality-test-guide.jpg',
        test_project_id: 'mbti'
      },
      {
        slug: 'disc-personality-assessment',
        title: 'Understanding DISC Personality Assessment',
        summary: 'Discover the DISC personality model and how it can help you understand behavioral styles in the workplace and personal relationships.',
        content_md: `# Understanding DISC Personality Assessment

The DISC personality assessment is a powerful tool for understanding behavioral styles and improving communication in both personal and professional settings.

## What is DISC?

DISC stands for:
- **Dominance**: How you approach problems and challenges
- **Influence**: How you influence others and handle social situations
- **Steadiness**: How you respond to pace and consistency
- **Compliance**: How you respond to rules and procedures

## The Four DISC Types

### High D (Dominance)
- Direct and results-oriented
- Natural leaders
- Competitive and decisive

### High I (Influence)
- Enthusiastic and optimistic
- People-oriented
- Great communicators

### High S (Steadiness)
- Patient and reliable
- Team players
- Consistent and supportive

### High C (Compliance)
- Detail-oriented and analytical
- Quality-focused
- Systematic and careful

## Benefits of DISC

Understanding DISC can help you:
- Improve communication
- Build better relationships
- Enhance team dynamics
- Reduce workplace conflicts
- Develop leadership skills

The DISC assessment is particularly valuable in professional settings where understanding different working styles can lead to more effective collaboration.`,
        cover_image_url: 'assets/blogs/disc-personality-assessment.jpg',
        test_project_id: 'disc40'
      },
      {
        slug: 'enneagram-personality-types',
        title: 'Introduction to Enneagram Personality Types',
        summary: 'Explore the nine Enneagram personality types and discover how this ancient system can help you understand yourself and others better.',
        content_md: `# Introduction to Enneagram Personality Types

The Enneagram is a powerful personality system that describes nine distinct personality types, each with its own motivations, fears, and growth paths.

## What is the Enneagram?

The Enneagram is more than just a personality test - it's a comprehensive system for understanding human nature. It reveals:
- Core motivations
- Basic fears
- Defense mechanisms
- Growth opportunities

## The Nine Types

### Type 1: The Perfectionist
- Motivated by the need to be right and perfect
- Fear: Being corrupt or defective
- Growth path: Learn to accept imperfection

### Type 2: The Helper
- Motivated by the need to be loved
- Fear: Being unloved
- Growth path: Learn to love themselves

### Type 3: The Achiever
- Motivated by the need to be valuable
- Fear: Being worthless
- Growth path: Learn their intrinsic worth

### Type 4: The Individualist
- Motivated by the need to be unique
- Fear: Having no identity
- Growth path: Learn to appreciate the ordinary

### Type 5: The Investigator
- Motivated by the need to understand
- Fear: Being useless or incompetent
- Growth path: Learn to engage with the world

### Type 6: The Loyalist
- Motivated by the need for security
- Fear: Being without support
- Growth path: Learn to trust themselves

### Type 7: The Enthusiast
- Motivated by the need to be happy
- Fear: Being trapped in pain
- Growth path: Learn to face difficult emotions

### Type 8: The Challenger
- Motivated by the need to be in control
- Fear: Being controlled
- Growth path: Learn to be vulnerable

### Type 9: The Peacemaker
- Motivated by the need to maintain peace
- Fear: Loss of connection
- Growth path: Learn to assert themselves

## Benefits of Understanding Enneagram

The Enneagram helps you:
- Understand your core motivations
- Recognize your patterns and habits
- Identify areas for personal growth
- Improve relationships with others
- Develop greater self-awareness

This ancient system continues to be relevant today because it addresses the fundamental human need to understand ourselves and our place in the world.`,
        cover_image_url: 'assets/blogs/enneagram-personality-types.jpg',
        test_project_id: 'enneagram_en'
      }
    ];

    for (const blog of sampleBlogs) {
      console.log(`创建博客: ${blog.title}`);
      await query(`
        INSERT INTO blogs (slug, title, summary, content_md, cover_image_url, test_project_id, is_published, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          content_md = EXCLUDED.content_md,
          cover_image_url = EXCLUDED.cover_image_url,
          test_project_id = EXCLUDED.test_project_id,
          is_published = true,
          updated_at = NOW()
      `, [blog.slug, blog.title, blog.summary, blog.content_md, blog.cover_image_url, blog.test_project_id]);
      console.log(`✅ ${blog.title} 创建成功`);
    }

    console.log('\n📋 检查创建的博客数据:');
    const result = await query(`
      SELECT slug, title, is_published
      FROM blogs
      WHERE is_published = true
      ORDER BY created_at DESC
    `);
    
    result.rows.forEach(row => {
      console.log(`- ${row.slug}: ${row.title} (${row.is_published ? 'Published' : 'Draft'})`);
    });

    console.log('\n🎉 示例博客数据创建完成！');
  } catch (error) {
    console.error('❌ 创建博客数据失败:', error);
    throw error;
  }
}

createSampleBlogs().then(() => process.exit(0)).catch(err => {
  console.error('❌ 脚本执行失败:', err);
  process.exit(1);
});
