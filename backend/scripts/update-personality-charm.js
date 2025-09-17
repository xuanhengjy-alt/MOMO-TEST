// 更新 "Find Out Your Personality Charm Level in Just 1 Minute" 测试项目数据
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 personality_charm_1min 测试项目数据...');

    // 1) 更新 intro_en
    const INTRO = `Do you want to know how attractive you are in others' eyes? Do you want to unlock the unique charm code hidden in your personality?

This ultra-convenient personality charm test can give you the answer in just 1 minute! No complicated calculations, no long answers—just a few simple questions to accurately capture the shining points in your personality. Is it your approachability from being sincere to others, or your charisma from being calm and confident? Is it your tenderness from being delicate and empathetic, or your courage to think and act boldly?

Whether you think you're "ordinary" or are curious about how others see you, this test helps you see the strengths and potential of your personality charm clearly. Come and try it! Unlock your exclusive charm score with one click—you might even discover charming traits you didn't notice in yourself!`;

    await query(
      `UPDATE test_projects SET intro_en = $1, updated_at = NOW() WHERE project_id = 'personality_charm_1min'`,
      [INTRO]
    );
    console.log('✅ 已更新 test_projects.intro_en');

    // 2) 删除现有 result_types
    await query(
      `DELETE FROM result_types WHERE project_id = (SELECT id FROM test_projects WHERE project_id = 'personality_charm_1min')`
    );
    console.log('✅ 已删除现有 result_types 记录');

    // 3) 插入新的 result_types（Result1..Result5）
    const resultTypes = [
      {
        code: 'RESULT1',
        type_name_en: 'Result1',
        description_en: 'Personality Charm Index: 50 points',
        analysis_en: `In your view, you don’t need a large circle of friends—three or five close confidants are more than enough. You aren’t someone who’s good at expressing yourself; you talk very little in front of people you don’t know well, and only when you’re with friends can you speak freely and be your true self. Therefore, in others’ eyes, you may not seem very outgoing, but in fact, you reserve your warm side for those who truly understand you.`
      },
      {
        code: 'RESULT2',
        type_name_en: 'Result2',
        description_en: 'Personality Charm Index: 80 points',
        analysis_en: `You are a strong, optimistic person with great perseverance. You often stick to your decisions or plans, which makes you come across as someone with clear ideas. Additionally, you get along well with friends: you always have many quirky and interesting thoughts, making you appear sunny and outgoing. Chatting with you is always a pleasant experience.`
      },
      {
        code: 'RESULT3',
        type_name_en: 'Result3',
        description_en: 'Personality Charm Index: 99 points',
        analysis_en: `You are straightforward and optimistic—you do what you want to do, and try your best to live life without regrets. In others’ eyes, you are a charming person, because you often manage to do things they can’t or dare not do. Besides, you are full of confidence: you believe there is always a way to solve any problem, and you will never be defeated by immediate difficulties! That’s why your personality charm scores 99 out of 100—we deduct 1 point just to keep you from getting too proud!`
      },
      {
        code: 'RESULT4',
        type_name_en: 'Result4',
        description_en: 'Personality Charm Index: 30 points',
        analysis_en: `You aren’t good at socializing. When facing strangers, you often feel awkward and don’t know how to act. As a sentimental person, you also tend to bury your thoughts and feelings deep inside. It’s hard for others to understand what you’re thinking, and you often feel unappreciated. This sense of being misunderstood further strengthens your resistance to social interaction, making you retreat into your own "safe haven".`
      },
      {
        code: 'RESULT5',
        type_name_en: 'Result5',
        description_en: 'Personality Charm Index: 70 points',
        analysis_en: `You are a person with depth, and at the same time, you are quite independent. Rather than participating in group activities, you prefer to spend time on yourself and are unwilling to waste time on blindly conforming to a crowd. However, this doesn’t prevent you from being an excellent listener and collaborator. You use your rationality to analyze the current situation, which makes you appear very reliable.`
      }
    ];

    for (const rt of resultTypes) {
      await query(
        `INSERT INTO result_types (project_id, type_code, type_name_en, description_en, analysis_en)
         VALUES ((SELECT id FROM test_projects WHERE project_id = 'personality_charm_1min'), $1, $2, $3, $4)`,
        [rt.code, rt.type_name_en, rt.description_en, rt.analysis_en]
      );
    }
    console.log('✅ 已插入新的 result_types 记录');

    // 4) 验证
    const verify = await query(`
      SELECT 
        tp.intro_en,
        rt.type_code,
        rt.type_name_en,
        rt.description_en,
        LEFT(rt.analysis_en, 80) || '...' AS analysis_preview
      FROM test_projects tp
      LEFT JOIN result_types rt ON rt.project_id = tp.id
      WHERE tp.project_id = 'personality_charm_1min'
      ORDER BY rt.type_code
    `);

    console.log('\n📋 验证更新结果:');
    console.log('Intro preview:', verify.rows[0]?.intro_en?.substring(0, 120) + '...');
    console.log('Result Types:');
    verify.rows
      .filter(r => r.type_code)
      .forEach(r => console.log(`  ${r.type_code} / ${r.type_name_en} -> ${r.description_en} | ${r.analysis_preview}`));

    console.log('\n🎉 personality_charm_1min 测试项目数据更新完成！');
    process.exit(0);
  } catch (e) {
    console.error('❌ 更新失败:', e);
    process.exit(1);
  }
})();


