// 临时调试：打印 violence_index 的 result_types 与各题 option 的 resultCode 映射
const { query } = require('../config/database');

(async () => {
  try {
    const prj = await query("SELECT id FROM test_projects WHERE project_id='violence_index' LIMIT 1");
    if (!prj.rows.length) {
      console.log('No project violence_index');
      process.exit(0);
    }
    const pid = prj.rows[0].id;

    const rt = await query(
      `SELECT type_code, type_name_en, description_en, analysis_en
       FROM result_types WHERE project_id=$1
       ORDER BY type_code`, [pid]
    );
    console.log('=== result_types for violence_index ===');
    console.log(rt.rows);

    const qo = await query(
      `SELECT q.question_number AS qn, o.option_number AS onum, o.option_text_en AS text,
              (o.score_value->>'resultCode') AS result_code,
              (o.score_value->>'next') AS next
       FROM questions q
       JOIN question_options o ON o.question_id = q.id
       WHERE q.project_id=$1
       ORDER BY q.question_number, o.option_number`, [pid]
    );
    console.log('=== question option resultCode map ===');
    const byQ = {};
    for (const row of qo.rows) {
      const q = row.qn;
      if (!byQ[q]) byQ[q] = [];
      byQ[q].push({ option: Number(row.onum), text: row.text, resultCode: row.result_code, next: row.next });
    }
    console.log(JSON.stringify(byQ, null, 2));

    // 检查每一个 resultCode 是否能在 result_types 中匹配到（按 type_code 或 type_name_en）
    const typeCodes = new Set(rt.rows.map(r => (r.type_code || '').trim()));
    const typeNames = new Set(rt.rows.map(r => (r.type_name_en || '').trim()));

    function expandCandidates(code) {
      const cands = new Set();
      if (!code) return [];
      const raw = String(code).trim();
      cands.add(raw);
      const mResult = raw.match(/^result\s*_?(\d)$/i);
      if (mResult) {
        const n = mResult[1];
        cands.add(`Result ${n}`);
        cands.add(`VI_RES_${n}`);
      }
      const mVi = raw.match(/^vi_res_(\d)$/i);
      if (mVi) {
        const n = mVi[1];
        cands.add(`VI_RES_${n}`);
        cands.add(`Result ${n}`);
      }
      const mResSp = raw.match(/^result\s+(\d)$/i);
      if (mResSp) {
        const n = mResSp[1];
        cands.add(`VI_RES_${n}`);
        cands.add(`Result ${n}`);
      }
      return Array.from(cands);
    }

    const misses = [];
    for (const q of Object.keys(byQ)) {
      for (const item of byQ[q]) {
        const rc = (item.resultCode || '').trim();
        if (!rc) continue;
        const cands = expandCandidates(rc);
        let ok = false;
        for (const c of cands) {
          if (typeCodes.has(c) || typeNames.has(c)) { ok = true; break; }
        }
        if (!ok) misses.push({ qn: Number(q), option: item.option, resultCode: rc, candidates: cands });
      }
    }
    console.log('=== unmatched resultCodes (cannot find in result_types) ===');
    console.log(misses);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();


