const { query } = require('../../config/database');

async function runMigration() {
  console.log('🚀 Running schema fix migration...');

  // Ensure test_projects has expected columns
  await query(`
    ALTER TABLE IF EXISTS test_projects
      ADD COLUMN IF NOT EXISTS name VARCHAR(200),
      ADD COLUMN IF NOT EXISTS name_en VARCHAR(200),
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS intro TEXT,
      ADD COLUMN IF NOT EXISTS intro_en TEXT,
      ADD COLUMN IF NOT EXISTS test_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS estimated_time INTEGER,
      ADD COLUMN IF NOT EXISTS question_count INTEGER,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `);

  // Ensure result_types has expected columns
  await query(`
    ALTER TABLE IF EXISTS result_types
      ADD COLUMN IF NOT EXISTS type_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS type_name_en VARCHAR(100),
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS description_en TEXT,
      ADD COLUMN IF NOT EXISTS analysis TEXT,
      ADD COLUMN IF NOT EXISTS analysis_en TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `);

  // Ensure test_statistics has unique constraint on project_id
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'test_statistics_project_id_key'
      ) THEN
        ALTER TABLE test_statistics
          ADD CONSTRAINT test_statistics_project_id_key UNIQUE (project_id);
      END IF;
    END$$;
  `);

  // Ensure index existence (idempotent via IF NOT EXISTS)
  await query(`
    CREATE INDEX IF NOT EXISTS idx_test_projects_project_id ON test_projects(project_id);
    CREATE INDEX IF NOT EXISTS idx_test_projects_type ON test_projects(test_type);
    CREATE INDEX IF NOT EXISTS idx_questions_project_id ON questions(project_id);
    CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
    CREATE INDEX IF NOT EXISTS idx_test_results_project_id ON test_results(project_id);
    CREATE INDEX IF NOT EXISTS idx_test_results_session_id ON test_results(session_id);
    CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at);
    CREATE INDEX IF NOT EXISTS idx_result_types_project_id ON result_types(project_id);
  `);

  console.log('✅ Schema fix migration completed');
}

if (require.main === module) {
  runMigration().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { runMigration };
