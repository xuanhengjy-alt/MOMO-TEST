const { query } = require('../config/database');

const INTRO = `Have you ever quietly clenched your fists when someone cut in line or misunderstood you? Or felt an inexplicable urge to "straighten things out" when seeing a messy situation? Don’t panic! This isn’t real "violence" — it’s just an emotional reaction hidden in your personality～  

Come take this super interesting little quiz! No need to struggle with complicated questions; just a few daily scenario-based questions can easily tell you how many stars your "violence index" has. Are you a gentle 1-star little sheep, or an occasionally grumpy 3-star little hedgehog? No matter what the result is, it can help you understand your emotional triggers better～ Come and try it, and see what your hidden "emotional quirks" are really like!`;

// Overwrite by using type_code exactly as jump result codes: 'Result 1'..'Result 4'
const RESULTS = [
  {
    code: 'Result 1',
    type_name_en: 'Result 1',
    description_en: 'Violence Index: ★★★★☆',
    analysis_en: 'Probably because "those who are favored act with impunity" — relying on others’ affection for you, you tend to be more casual and unconstrained. Sometimes you have unreasonable thoughts, like feeling that someone "should treat you well"; if things don’t go your way even a little, you lose your temper. But in reality, no one is obligated to be nice to you. People who treat you well do so only because you are worthy of it.'
  },
  {
    code: 'Result 2',
    type_name_en: 'Result 2',
    description_en: 'Violence Index: ☆☆☆☆☆',
    analysis_en: 'You always manage to control your emotions well — you never let negative feelings affect your judgment or your relationships with others. Even when you’re angry, you can keep a sense of proportion and communicate effectively. So no matter what happens, you will never resort to violent means to solve problems. (Mom, they must be a little angel!)'
  },
  {
    code: 'Result 3',
    type_name_en: 'Result 3',
    description_en: 'Violence Index: ★★☆☆☆',
    analysis_en: 'You have a certain tendency toward violence, but fortunately, this isn’t always the case. Most of the time, you can control your emotions and prevent negative feelings from disrupting your life. Only when you encounter a major setback will you become demoralized and try to "solve" things through "violent" ways — like becoming irritable, getting into arguments, or throwing and breaking things. Afterward, though, you’ll regret it when you think back.'
  },
  {
    code: 'Result 4',
    type_name_en: 'Result 4',
    description_en: 'Violence Index: ★★★☆☆',
    analysis_en: 'It has to be admitted that you’re not the easiest person to get along with. Cold and withdrawn, you lack opportunities to communicate with others, and you don’t know how to express yourself properly. You might fly into a rage over something that others see as a trivial matter; or you might bottle up your dissatisfaction inside — putting on a calm front on the surface, but eventually, the pent-up emotions will have to burst out one day.'
  }
];

(async () => {
  try {
    // Ensure project exists and update intro_en
    const pr = await query('SELECT id FROM test_projects WHERE project_id=$1', ['violence_index']);
    if (!pr.rows.length) {
      throw new Error('Project violence_index not found');
    }
    const projectId = pr.rows[0].id;

    await query('UPDATE test_projects SET intro_en=$1 WHERE id=$2', [INTRO, projectId]);

    // Remove all existing result_types for this project to avoid ambiguity
    await query('DELETE FROM result_types WHERE project_id=$1', [projectId]);

    for (const r of RESULTS) {
      // insert with type_code exactly equal to jump code
      const ex = await query(
        'SELECT id FROM result_types WHERE project_id=$1 AND type_code=$2',
        [projectId, r.code]
      );
      if (ex.rows.length) {
        await query(
          'UPDATE result_types SET type_code=$1, description_en=$2, analysis_en=$3, updated_at=NOW() WHERE id=$4',
          [r.code, r.description_en, r.analysis_en, ex.rows[0].id]
        );
      } else {
        await query(
          'INSERT INTO result_types (project_id, type_code, type_name_en, description_en, analysis_en, created_at) VALUES ($1,$2,$3,$4,$5,NOW())',
          [projectId, r.code, r.type_name_en, r.description_en, r.analysis_en]
        );
      }
    }
    console.log('✅ violence_index intro_en and result_types updated');
  } catch (e) {
    console.error('❌ Update failed:', e.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();


