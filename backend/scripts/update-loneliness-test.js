// 更新 "Find out just how lonely your heart really is" 测试项目数据
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 loneliness 测试项目数据...');

    // 1. 更新 test_projects 表的 intro_en
    const updateIntro = await query(`
      UPDATE test_projects 
      SET intro_en = $1 
      WHERE project_id = 'loneliness_1min'
    `, [
      `You're always smiling in a crowd, but suddenly feel an empty void in your heart? You scroll through your contacts late at night, only to find no one you can share your thoughts with anytime? Stop quietly wondering, "Am I too lonely?" — This surprisingly accurate casual quiz can help you see your inner loneliness index in just 1 minute!  

No complicated answers needed. A few lighthearted questions can quietly "read" your emotions: Is it just occasional loneliness acting up, or is there unknown sadness hidden deep inside you? Whether you want a fun way to pass the time or are curious about your emotional state, give it a try～ You might just find that your loneliness isn't as intense as you thought it was!`
    ]);

    console.log('✅ 已更新 test_projects.intro_en');

    // 2. 删除现有的 result_types 记录
    const deleteExisting = await query(`
      DELETE FROM result_types 
        WHERE project_id = (SELECT id FROM test_projects WHERE project_id = 'loneliness_1min')
    `);

    console.log('✅ 已删除现有 result_types 记录');

    // 3. 插入新的 result_types 记录
    const resultTypes = [
      {
        type_name_en: '0-2',
        description_en: 'Loneliness Index: 10%',
        analysis_en: `## Loneliness Index: 10%  

You don't feel lonely at all. On the contrary, you have an optimistic personality and believe simplicity is a kind of happiness. You enjoy the time laughing and playing with friends, and you can always face difficulties calmly — there's no problem that a meal can't solve; if there is, have two meals.`
      },
      {
        type_name_en: '3-5',
        description_en: 'Loneliness Index: 30%',
        analysis_en: `## Loneliness Index: 30%  

You take gains and losses in life lightly. Although you inevitably feel down sometimes, who hasn't encountered bad things? When facing setbacks, you can adjust yourself positively. When you feel depressed or lonely inside, you will also take the initiative to find someone to talk to, or distract yourself through other ways.`
      },
      {
        type_name_en: '6-8',
        description_en: 'Loneliness Index: 70%',
        analysis_en: `## Loneliness Index: 70%  

The saying "the older you grow, the lonelier you become" seems to fit your current state of mind perfectly. The days of youth are always particularly memorable; when you look back on those times, it seems you were always very happy. Troubles back then were simple, and the teenagers back then were easily satisfied. But as you grow older, it becomes harder and harder to find a confidant. Gradually, people get used to loneliness and dare not get close to each other.`
      },
      {
        type_name_en: '9-10',
        description_en: 'Loneliness Index: 90%',
        analysis_en: `## Loneliness Index: 90%  

You always get used to keeping your thoughts to yourself and can't be open and honest with others, so no one else can walk into your heart. Therefore, you are very lonely deep down and feel that there is no one around who truly understands you. Over time, you may have gotten used to loneliness — it even gives you a good protection, allowing you to ignore the disputes of the outside world.`
      }
    ];

    for (const resultType of resultTypes) {
      await query(`
        INSERT INTO result_types (project_id, type_code, type_name_en, description_en, analysis_en)
        VALUES (
          (SELECT id FROM test_projects WHERE project_id = 'loneliness_1min'),
          $1, $2, $3, $4
        )
      `, [
        resultType.type_name_en,
        resultType.type_name_en,
        resultType.description_en,
        resultType.analysis_en
      ]);
    }

    console.log('✅ 已插入新的 result_types 记录');

    // 4. 验证更新结果
    const verify = await query(`
      SELECT 
        tp.intro_en,
        rt.type_name_en,
        rt.description_en,
        LEFT(rt.analysis_en, 50) || '...' as analysis_preview
      FROM test_projects tp
      LEFT JOIN result_types rt ON rt.project_id = tp.id
      WHERE tp.project_id = 'loneliness_1min'
      ORDER BY rt.type_name_en
    `);

    console.log('\n📋 验证更新结果:');
    console.log('Intro:', verify.rows[0]?.intro_en?.substring(0, 100) + '...');
    console.log('Result Types:');
    verify.rows.forEach(row => {
      if (row.type_name_en) {
        console.log(`  ${row.type_name_en}: ${row.description_en} - ${row.analysis_preview}`);
      }
    });

    console.log('\n🎉 loneliness 测试项目数据更新完成！');
    process.exit(0);

  } catch (error) {
    console.error('❌ 更新失败:', error);
    process.exit(1);
  }
})();
