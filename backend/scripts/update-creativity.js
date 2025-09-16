const { query } = require('../config/database');

const INTRO = `People always say "creativity is inborn", but do you really understand the creativity hidden in your daily life? Maybe you’ve had wonderful ideas while doodling casually, or solved small troubles with unique methods — these are actually all sparks of creativity!  

Come and try this super interesting creativity quiz! No need to rack your brains for complicated plans; there are 10 easy questions, covering everything from "dealing with small accidents" to "fun little associations", which will explore your creative potential in all aspects. Let’s see if you’re definitely a hidden "creative genius"!  

Whether you think you’re "not creative" or are curious about how high your creativity score is, you can take this quiz. You might just find that there are so many undiscovered wonderful ideas hidden in your mind after taking it～ Click to start now and see how many points your creativity can get!`;

const items = [
  {
    code: 'CREATIVE_2_STAR',
    type_name_en: '7-12',
    description_en: 'Creativity: ★★☆☆☆',
    analysis_en: 'You are a rule-abiding person who doesn’t like challenging tasks; instead, you prefer things you can be sure of. As a result, you may have some compulsive behaviors—for example, keeping items in fixed places and doing things according to plans.  \n\n**Strengths:** \n\nYou keep your word and rarely make mistakes in your work.  \n\n**Weaknesses: **\n\nYou follow "rules" too strictly and struggle to break through the limitations of your own thinking.'
  },
  {
    code: 'CREATIVE_3_STAR',
    type_name_en: '13-17',
    description_en: 'Creativity: ★★★☆☆',
    analysis_en: 'Between being an adventurer and a conservative, you lean more toward the latter. You’re not good at improvising, and you’ll feel frustrated if a well-made plan is disrupted. Therefore, you may lack a bit of creativity and are more skilled at routine, transactional work.  \n\n**Strengths:**\n\n You are well-organized and give others a reliable impression.  \n\n**Weaknesses: **\n\nSometimes you get stuck on surface-level issues and can’t break free from conventional ways of thinking.'
  },
  {
    code: 'CREATIVE_4_STAR',
    type_name_en: '18-23',
    description_en: 'Creativity: ★★★★☆',
    analysis_en: 'Your creativity is quite good—there are times when you come up with ideas that are full of insight, surprising others. But most of the time, you still know how to follow rules and won’t do things that "cross the line." You also perform well when given tasks to complete.  \n\n**Strengths:** \n\nYou are creative and have a flexible way of thinking.  \n\n**Weaknesses: **\n\nSometimes you don’t play by the rules, making it hard for others to figure you out.'
  },
  {
    code: 'CREATIVE_5_STAR',
    type_name_en: '24-29',
    description_en: 'Creativity: ★★★★★',
    analysis_en: 'Wow, you are an extremely creative person! Working in an environment with strict rules would be really torturous for you. Endowed with wild imagination and non-linear thinking, you like to conceptualize everything using your unique ideas.  \n\n**Strengths:**\n\n You have a rich imagination and extraordinary creativity.  \n\n**Weaknesses: **\n\nYou can be careless and pay little attention to details.'
  }
];

(async () => {
  try {
    const pr = await query('SELECT id FROM test_projects WHERE project_id=$1', ['creativity_test']);
    if (!pr.rows.length) throw new Error('Project creativity_test not found');
    const pid = pr.rows[0].id;

    await query('UPDATE test_projects SET intro_en=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2', [INTRO, pid]);

    for (const it of items) {
      await query(
        'UPDATE result_types SET type_name_en=$1, description_en=$2, analysis_en=$3 WHERE project_id=$4 AND type_code=$5',
        [it.type_name_en, it.description_en, it.analysis_en, pid, it.code]
      );
    }

    const res = await query('SELECT type_code, type_name_en FROM result_types WHERE project_id=$1 ORDER BY type_code', [pid]);
    console.log('Updated result_types:', res.rows);
  } catch (e) {
    console.error('Failed to update creativity_test:', e.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();


