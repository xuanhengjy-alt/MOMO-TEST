// 更新 Test Your Mental Age 的 result_types 英文字段（名称与简短描述）
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 mental_age_test_en 的 result_types ...');
    const PROJECT = 'mental_age_test_en';
    const items = [
      { code: 'CHILD_STAGE',       name: 'Child Stage',       desc: 'Your mental age remains steadily in the child stage.' },
      { code: 'ADOLESCENT_STAGE',  name: 'Adolescent Stage',  desc: 'Your inner world is in the adolescent stage.' },
      { code: 'MATURE_STAGE',      name: 'Highly Mature',     desc: 'You are highly mature.' }
    ];

    for (const it of items) {
      await query(
        `UPDATE result_types SET type_name_en=$1, description_en=$2
         WHERE project_id=(SELECT id FROM test_projects WHERE project_id=$3)
           AND type_code=$4`,
        [it.name, it.desc, PROJECT, it.code]
      );
    }

    console.log('✅ 已更新 3 条记录');
    const verify = await query(
      `SELECT type_code, type_name_en, description_en
       FROM result_types
       WHERE project_id=(SELECT id FROM test_projects WHERE project_id=$1)
       ORDER BY type_code`,
      [PROJECT]
    );
    console.log('\n📋 验证结果:');
    for (const r of verify.rows) {
      console.log(`${r.type_code}: ${r.type_name_en} | ${r.description_en}`);
    }
    console.log('\n🎉 更新完成');
    process.exit(0);
  } catch (e) {
    console.error('❌ 更新失败:', e);
    process.exit(1);
  }
})();


