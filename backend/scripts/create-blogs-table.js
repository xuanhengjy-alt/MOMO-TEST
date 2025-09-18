const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/database');

async function createBlogsTable() {
  const sql = `
  CREATE TABLE IF NOT EXISTS blogs (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(160) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    summary VARCHAR(500) DEFAULT '' NOT NULL,
    content_md TEXT NOT NULL,
    cover_image_url VARCHAR(300) DEFAULT '' NOT NULL,
    reading_count BIGINT DEFAULT 0 NOT NULL,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ language 'plpgsql';
  DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
  CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  CREATE INDEX IF NOT EXISTS idx_blogs_published_created_at ON blogs (is_published, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_blogs_published_reading ON blogs (is_published, reading_count DESC);
  `;
  await query(sql);
  console.log('✅ blogs table ensured');
}

if (require.main === module) {
  createBlogsTable().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { createBlogsTable };


