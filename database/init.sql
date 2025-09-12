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
