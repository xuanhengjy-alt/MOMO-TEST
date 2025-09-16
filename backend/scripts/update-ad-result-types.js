const { query } = require('../config/database');

const payloads = [
  {
    code: 'AD_NONE',
    type_name_en: '0-7',
    description_en: 'You show no signs of anxiety or depression. Keep up the good work!',
    analysis_en: 'Based on the feedback from this anxiety and depression level test, you currently show no typical signs of anxiety or depression—this is an excellent state to be in! You still maintain enthusiasm for the things that interested you in the past, often feel happy emotions, and rarely experience unexplained tension, restlessness, or panic. You also keep an optimistic and forward-looking mindset toward life—all of these indicate that your current mental state is relatively stable, and your ability to regulate emotions is at a good level.\n\nSuch a positive state is inseparable from your active management of life. Just keep up this healthy mental rhythm!'
  },
  {
    code: 'AD_MAYBE',
    type_name_en: '8-10',
    description_en: 'You may have signs of anxiety or depression. Please make an effort to stay in a good mood and do more things that bring you joy.',
    analysis_en: 'According to the comprehensive assessment of this anxiety and depression level test, your current state may show signs of anxiety or depression, so you need to pay more attention to your emotional health. From the test, it can be seen that you may occasionally feel anxious and restless, in a low mood, lack motivation for things that used to interest you, or easily get trapped in worries—these are all signals from your emotions saying "I need care". There’s no need to panic about this; timely adjustment can help alleviate these feelings gradually.\n\nIn the days ahead, try to arrange more things that bring you joy: for example, take a walk in the park and soak up some sunshine, listen to a favorite song, chat with someone you trust about your recent life, or try simple handicrafts or cooking. Let these small things help you gradually regain a relaxed state. If this low mood or anxiety persists for a long time, you can also take the initiative to talk to family or friends; if necessary, seek help from professional mental health practitioners. Remember, paying attention to your emotions and proactively regulating them is in itself a brave act. Take it slow, and you will definitely get your good mood back!'
  },
  {
    code: 'AD_OBVIOUS',
    type_name_en: '11-42',
    description_en: 'You have signs of anxiety or depression. Please seek help from family, friends, or professional mental health practitioners in a timely manner—your feelings deserve to be taken seriously!',
    analysis_en: 'Combined with the multi-dimensional feedback from this anxiety and depression level test (including emotional state, interest performance, physical feelings, etc.), your current state has shown relatively obvious signs of anxiety or depression. At this time, please never bear these emotions alone—seeking help in a timely manner is the more important choice.\n\nFrom the test, it can be felt that you may be troubled by persistent tension and low mood, lack interest in things in life, and may even often experience restlessness, panic, and other feelings—these are not "over-sensitivity"; they are your mental state reminding you "I need to be cared for". Please be brave enough to share your feelings with trusted family members or friends around you; their company and understanding will be an important source of support. If you find it difficult to regulate your emotions on your own, you can also take the initiative to contact professional mental health practitioners, who can provide more scientific guidance and help.\n\nPlease remember, your feelings are extremely precious and deserve to be valued and cared for. Taking the initiative to seek help is never a sign of weakness, but a brave choice to be responsible for yourself. Do not let negative emotions consume you alone.'
  }
];

(async () => {
  try {
    const pr = await query('SELECT id FROM test_projects WHERE project_id=$1', ['anxiety_depression_test']);
    if (!pr.rows.length) throw new Error('Project anxiety_depression_test not found');
    const projectId = pr.rows[0].id;

    for (const p of payloads) {
      await query(
        'UPDATE result_types SET type_name_en=$1, description_en=$2, analysis_en=$3 WHERE project_id=$4 AND type_code=$5',
        [p.type_name_en, p.description_en, p.analysis_en, projectId, p.code]
      );
    }

    const rows = await query(
      'SELECT type_code, type_name_en, description_en, LEFT(analysis_en, 120) AS analysis_preview FROM result_types WHERE project_id=$1 AND type_code IN (\'AD_NONE\',\'AD_MAYBE\',\'AD_OBVIOUS\') ORDER BY type_code',
      [projectId]
    );
    console.log(JSON.stringify(rows.rows, null, 2));
  } catch (e) {
    console.error('Failed to update AD result types:', e.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();


