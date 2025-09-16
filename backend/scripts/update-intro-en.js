const { query } = require('../config/database');

const NEW_INTRO = `Have you been feeling down lately and lacking motivation for things you used to enjoy? Or do you often feel inexplicably tense, restless, or even have occasional panic? If these emotions keep recurring and make you wonder if you might be affected by anxiety or depression, you can use this test to sort out your current state.  

This test focuses on real-life daily feelings, covering dimensions such as mood, interests, and physical reactions. While it is not a professional diagnosis, it can help you intuitively see the "severity" of your emotions—whether they are just temporary mood fluctuations or psychological signals that require more attention. If you still feel uneasy after taking the test, remember to seek help from family, friends, or professional mental health professionals in a timely manner. Your feelings deserve to be valued!`;

(async () => {
  try {
    await query(
      'UPDATE test_projects SET intro_en=$1, updated_at=CURRENT_TIMESTAMP WHERE project_id=$2',
      [NEW_INTRO, 'anxiety_depression_test']
    );
    const r = await query('SELECT intro_en FROM test_projects WHERE project_id=$1', ['anxiety_depression_test']);
    console.log('Updated intro_en:\n');
    console.log(r.rows[0]?.intro_en || '(empty)');
  } catch (e) {
    console.error('Failed:', e.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();


