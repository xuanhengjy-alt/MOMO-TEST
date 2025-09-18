-- MOMO TEST 数据库初始化脚本
-- 连接到 Neon PostgreSQL 数据库

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 测试项目表
CREATE TABLE test_projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    name_en VARCHAR(200),
    image_url VARCHAR(500),
    intro TEXT,
    intro_en TEXT,
    test_type VARCHAR(50) NOT NULL,
    estimated_time INTEGER,
    question_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 题目表
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES test_projects(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_text_en TEXT,
    question_type VARCHAR(20) DEFAULT 'single_choice',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, question_number)
);

-- 选项表
CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    option_number INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    option_text_en TEXT,
    score_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, option_number)
);

-- 测试结果表
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES test_projects(id),
    session_id VARCHAR(100),
    user_answers JSONB NOT NULL,
    calculated_result JSONB,
    result_summary TEXT,
    result_analysis TEXT,
    result_summary_en TEXT,
    result_analysis_en TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- 测试统计表
CREATE TABLE test_statistics (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES test_projects(id),
    total_tests INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id)
);

-- 结果类型定义表
CREATE TABLE result_types (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES test_projects(id),
    type_code VARCHAR(20) NOT NULL,
    type_name VARCHAR(100),
    type_name_en VARCHAR(100),
    description TEXT,
    description_en TEXT,
    analysis TEXT,
    analysis_en TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, type_code)
);

-- 创建索引
CREATE INDEX idx_test_projects_project_id ON test_projects(project_id);
CREATE INDEX idx_test_projects_type ON test_projects(test_type);
CREATE INDEX idx_questions_project_id ON questions(project_id);
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_test_results_project_id ON test_results(project_id);
CREATE INDEX idx_test_results_session_id ON test_results(session_id);
CREATE INDEX idx_test_results_completed_at ON test_results(completed_at);
CREATE INDEX idx_result_types_project_id ON result_types(project_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 test_projects 表添加更新时间触发器
CREATE TRIGGER update_test_projects_updated_at 
    BEFORE UPDATE ON test_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------
-- 博客系统表定义（按 PRD_NAV_BLOG_2.0.md 第17章）
-- --------------------------------------------
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

-- 更新时间触发器
CREATE TRIGGER update_blogs_updated_at 
    BEFORE UPDATE ON blogs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 索引（发布状态+时间、发布状态+阅读量）
CREATE INDEX IF NOT EXISTS idx_blogs_published_created_at ON blogs (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_published_reading ON blogs (is_published, reading_count DESC);

-- 示例数据：按 PRD 第15章（如已存在则跳过）
INSERT INTO blogs (slug, title, summary, content_md, cover_image_url, is_published)
SELECT 
  'the-application-of-the-mbti-personality-test-in-real-life',
  'The Application of the MBTI Personality Test in Real Life',
  'It introduces the theoretical basis of the MBTI Personality Test, expounds its applications in personal growth, interpersonal relationships, team management and career development, and also reminds that it should be used objectively and cautiously.',
  'The MBTI Personality Test is a tool based on psychological theories, designed to help people understand their personal traits and behavioral preferences. In real life, it has a wide range of applications, including personal growth, interpersonal relationships, team building, and career development.\n\nFirst, the MBTI Personality Test can help people identify their personality types. Through the test, individuals can learn about their preferences across four dimensions: Extraversion/Introversion, Sensing/Intuition, Thinking/Feeling, and Judging/Perceiving. The combination of these dimensions results in 16 distinct personality types. By understanding their own personality type, individuals can gain better insight into their strengths, weaknesses, and potential development directions.\n\nSecond, the test can help improve interpersonal relationships. By understanding others'' personality types, people can better comprehend others'' ways of thinking and behavioral patterns, thereby enhancing communication and mutual understanding. For instance, a "Sensitive Insightful" type may prioritize emotions and interpersonal connections, while a "Logical Analyst" type may focus more on logic and analysis. This awareness helps people better mediate conflicts and build healthier, more harmonious relationships.\n\nThird, the MBTI test can be used for team building. By understanding team members'' personality types and behavioral preferences, leaders can assign tasks and roles more effectively, promoting team collaboration and development. For example, a "Supporter" type may be better suited for coordination and support roles, while a "Decision-Maker" type may excel in leadership and decision-making positions. This understanding enables the team to leverage each member''s strengths and achieve better overall results.\n\nFinally, the test can aid in career development. By recognizing their personality type and career inclinations, individuals can make more informed choices about their occupations and career paths. For example, an ** "Innovator" ** type may be more suitable for R&D and innovation-related work, while a "Socializer" type may thrive in sales and public relations roles. This knowledge helps individuals plan their careers more effectively and find fields where they are truly interested and skilled.\n\nIn summary, the MBTI Personality Test has extensive applications and significance in real life. By understanding their personality types and behavioral preferences, people can better manage their emotions and behaviors, improve interpersonal relationships, boost team collaboration and development, and plan their careers. However, it is important to note that the MBTI Personality Test is merely a tool; it cannot fully represent all of a person''s personality traits and behaviors, nor can it determine a person''s destiny. Therefore, when using the test, we should maintain an objective and cautious attitude, avoiding relying on it as the sole criterion for evaluating ourselves or others. Instead, we should combine it with real-life situations and personal experiences to continuously reflect on and refine our behaviors and ways of thinking.',
  'assets/blogs/the-application-of-the-mbti-personality-test-in-real-life.png',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM blogs WHERE slug = 'the-application-of-the-mbti-personality-test-in-real-life'
);