# Vercel API 404 错误修复说明

## 问题描述
部署到 Vercel 后，博客 API 返回 404 错误：
```
API request failed: Error: HTTP error! status: 404
```

## 问题原因
1. **API 路由配置错误**：Vercel 需要 API 文件放在 `api/` 目录下
2. **缺少博客 API 文件**：只有 `api/` 目录下的文件才会被 Vercel 识别为 API 路由
3. **数据库连接问题**：在 Vercel 环境中需要正确的环境变量配置

## 修复内容

### 1. 创建独立的博客 API 文件
- ✅ 创建了 `api/blogs.js` 文件
- ✅ 包含博客列表和详情 API 端点
- ✅ 直接使用 PostgreSQL 连接，不依赖后端服务器

### 2. 更新 Vercel 配置
- ✅ 移除了对 `backend/server.js` 的依赖
- ✅ 配置 `api/*.js` 使用 Node.js 18.x 运行时
- ✅ 简化了路由配置

### 3. 环境变量配置
需要在 Vercel 仪表板中设置以下环境变量：

```bash
DATABASE_URL=postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
```

## 部署步骤

### 1. 设置环境变量
1. 登录 Vercel 仪表板
2. 进入项目设置
3. 在 "Environment Variables" 部分添加：
   - `DATABASE_URL`: 数据库连接字符串
   - `NODE_ENV`: `production`

### 2. 重新部署
1. 提交所有修改到 Git
2. 推送到 GitHub
3. Vercel 会自动重新部署

### 3. 验证修复
1. 访问博客页面：`https://your-domain.vercel.app/blog.html`
2. 检查浏览器控制台是否还有 404 错误
3. 确认博客列表正常显示

## API 端点

### 博客列表
- **URL**: `/api/blogs`
- **方法**: `GET`
- **参数**: 
  - `page`: 页码 (默认: 1)
  - `pageSize`: 每页数量 (默认: 12)
  - `keyword`: 搜索关键词 (可选)

### 博客详情
- **URL**: `/api/blogs`
- **方法**: `POST`
- **Body**: `{ "slug": "blog-slug" }`

## 注意事项
- 确保 Vercel 项目中有 `pg` 依赖包
- 数据库连接字符串必须正确设置
- API 文件必须使用 CommonJS 格式 (`module.exports`)
