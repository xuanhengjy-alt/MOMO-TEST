# MOMO TEST 数据库迁移指南

## 概述

本项目已从静态JSON文件迁移到使用Neon PostgreSQL数据库。前端保持稳定，后续添加测试项目只需在数据库中增加数据即可。

## 数据库架构

### 核心表结构

1. **test_projects** - 测试项目表
   - 存储测试项目基本信息（名称、介绍、图片等）
   - 支持多语言（中英文）

2. **questions** - 题目表
   - 存储测试题目内容
   - 支持多语言题目

3. **question_options** - 选项表
   - 存储题目选项
   - 包含评分信息（JSON格式）

4. **test_results** - 测试结果表
   - 存储用户测试结果
   - 支持匿名用户追踪

5. **test_statistics** - 测试统计表
   - 存储测试次数、点赞数等统计信息

6. **result_types** - 结果类型定义表
   - 存储DISC、MBTI等结果类型的分析内容

## 部署步骤

### 1. 数据库初始化

```bash
# 连接到Neon数据库
psql "postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# 执行初始化脚本
\i database/init.sql
```

### 2. 后端服务启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 复制环境变量文件
cp env.example .env

# 编辑环境变量（数据库URL已配置）
# DATABASE_URL=postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# 初始化数据库数据
npm run init-db

# 启动服务
npm start
# 或开发模式
npm run dev
```

### 3. 前端服务启动

```bash
# 使用任何静态文件服务器
# 例如使用Python
python -m http.server 8000

# 或使用Node.js serve
npx serve .

# 或使用VSCode Live Server扩展
```

## API接口

### 测试项目相关

- `GET /api/tests` - 获取所有测试项目
- `GET /api/tests/:projectId` - 获取特定测试项目
- `GET /api/tests/:projectId/questions` - 获取测试题目
- `POST /api/tests/:projectId/like` - 点赞测试项目

### 测试结果相关

- `POST /api/results` - 提交测试结果
- `GET /api/results/:resultId` - 获取测试结果
- `GET /api/results/stats/:projectId` - 获取测试统计

## 添加新测试项目

### 1. 在数据库中添加项目

```sql
INSERT INTO test_projects (
  project_id, name, name_en, image_url, intro, intro_en, 
  test_type, estimated_time, question_count, is_active
) VALUES (
  'new_test', 
  '新测试名称', 
  'New Test Name',
  'assets/images/new-test.png',
  '测试介绍',
  'Test Introduction',
  'custom',
  10,
  20,
  true
);
```

### 2. 添加题目和选项

```sql
-- 添加题目
INSERT INTO questions (project_id, question_number, question_text, question_text_en)
SELECT id, 1, '题目内容', 'Question Content'
FROM test_projects WHERE project_id = 'new_test';

-- 添加选项
INSERT INTO question_options (question_id, option_number, option_text, option_text_en, score_value)
SELECT q.id, 1, '选项1', 'Option 1', '{"score": 1}'
FROM questions q
JOIN test_projects p ON q.project_id = p.id
WHERE p.project_id = 'new_test' AND q.question_number = 1;
```

### 3. 添加结果类型（如需要）....

```sql
INSERT INTO result_types (project_id, type_code, type_name, type_name_en, description, analysis)
SELECT id, 'TYPE_A', '类型A', 'Type A', '类型描述', '详细分析'
FROM test_projects WHERE project_id = 'new_test';
```

## 前端兼容性

- 前端代码已更新为优先使用API，API不可用时自动回退到本地逻辑
- 保持了原有的用户体验和界面
- 支持离线模式（当API不可用时）

## 环境配置

### 开发环境
- 后端：http://localhost:3000
- 前端：http://localhost:8000（或任何静态服务器）

### 生产环境
- 需要配置CORS允许前端域名
- 建议使用环境变量管理配置
- 考虑添加API认证和限流

## 故障排除

### 1. 数据库连接失败
- 检查DATABASE_URL是否正确
- 确认Neon数据库服务状态
- 检查网络连接

### 2. API请求失败
- 检查后端服务是否启动
- 确认CORS配置
- 查看浏览器控制台错误信息

### 3. 前端显示异常
- 检查API服务是否可访问
- 确认静态文件服务器配置
- 查看浏览器控制台错误信息

## 数据备份

建议定期备份数据库：

```bash
# 备份数据库
pg_dump "postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" > backup.sql

# 恢复数据库
psql "postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" < backup.sql
```

## 性能优化

1. **数据库索引**：已为常用查询字段添加索引
2. **连接池**：使用连接池管理数据库连接
3. **缓存**：前端缓存题目数据，减少API请求
4. **CDN**：建议将静态资源部署到CDN

## 安全考虑

1. **SQL注入防护**：使用参数化查询
2. **CORS配置**：限制允许的域名
3. **请求限流**：防止API滥用
4. **数据验证**：验证输入数据格式
