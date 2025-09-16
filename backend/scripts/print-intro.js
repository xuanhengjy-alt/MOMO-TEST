const { query } = require('../config/database');

(async () => {
  try {
    const res = await query(
      'SELECT intro_en FROM test_projects WHERE project_id = $1',
      ['anxiety_depression_test']
    );
    const intro = (res.rows[0] && res.rows[0].intro_en) ? res.rows[0].intro_en : '(empty)';
    console.log(intro);
  } catch (e) {
    console.error('Query failed:', e.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();


