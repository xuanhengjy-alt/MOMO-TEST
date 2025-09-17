// 更新 PDP (pdp_test_en) 的 result_types 英文字段（type_name_en / description_en）
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const { query } = require('../config/database');

(async () => {
  try {
    console.log('开始更新 pdp_test_en 的 result_types ...');
    const PROJECT = 'pdp_test_en';
    const items = [
      { code: 'TIGER_TYPE',     name: 'Tiger type (Dominance)',        desc: 'You are a Tiger type (Dominance)' },
      { code: 'PEACOCK_TYPE',   name: 'Peacock type (Extroversion)',    desc: 'You are Peacock type (Extroversion)' },
      { code: 'KOALA_TYPE',     name: 'Koala type (Pace/Patience)',     desc: 'You are a Koala type (Pace/Patience).' },
      { code: 'OWL_TYPE',       name: 'Owl type (Conformity)',          desc: 'You are an Owl type (Conformity)' },
      { code: 'CHAMELEON_TYPE', name: 'Chameleon type (1/2 Sigma)',     desc: 'You are a Chameleon type (1/2 Sigma)' }
    ];

    for (const it of items) {
      await query(
        `UPDATE result_types SET type_name_en=$1, description_en=$2
         WHERE project_id=(SELECT id FROM test_projects WHERE project_id=$3)
           AND type_code=$4`,
        [it.name, it.desc, PROJECT, it.code]
      );
    }

    console.log('✅ 已更新 5 条记录');
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


