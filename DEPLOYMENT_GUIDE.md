# 🚀 本地和Vercel兼容部署指南

## 📋 概述

本方案确保应用在本地开发环境测试OK后，能够直接部署到Vercel正常运行，实现完全兼容。

## 🏗️ 架构设计

### 统一配置层
- `config/environment.js` - 环境检测和配置统一
- `config/database.js` - 数据库连接和查询统一

### 统一API层
- `api/tests-unified.js` - 测试项目API
- `api/blogs-unified.js` - 博客API
- `api/results-unified.js` - 测试结果API
- `api/health-unified.js` - 健康检查API

### 本地开发服务器
- `local-server-unified.js` - 兼容本地和Vercel的开发服务器

## 🔧 本地开发

### 1. 环境设置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
# 设置 DATABASE_URL 为你的数据库连接字符串
```

### 2. 启动开发服务器
```bash
# 使用统一服务器（推荐）
npm run dev

# 或使用传统服务器
npm run local
```

### 3. 测试API
```bash
# 健康检查
curl http://localhost:3000/api/health

# 获取测试项目
curl http://localhost:3000/api/tests

# 获取博客列表
curl http://localhost:3000/api/blogs
```

## 🚀 Vercel部署

### 1. 环境变量设置
在Vercel Dashboard中设置以下环境变量：
- `DATABASE_URL` - 你的数据库连接字符串
- `NODE_ENV` - production

### 2. 部署方式

#### 方式一：使用Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署
vercel --prod
```

#### 方式二：使用部署脚本
```bash
# 运行部署脚本
node deploy-vercel.js
```

#### 方式三：Git集成
1. 将代码推送到GitHub
2. 在Vercel Dashboard中连接仓库
3. 设置环境变量
4. 自动部署

### 3. 验证部署
```bash
# 检查健康状态
curl https://your-app.vercel.app/api/health

# 测试API功能
curl https://your-app.vercel.app/api/tests
```

## 🔄 开发流程

### 1. 本地开发
```bash
# 1. 启动开发服务器
npm run dev

# 2. 在浏览器中测试
# http://localhost:3000

# 3. 测试所有功能
# - 测试详情页
# - 博客页面
# - API接口
```

### 2. 部署到Vercel
```bash
# 1. 提交代码
git add .
git commit -m "feat: add new features"
git push

# 2. 部署（如果使用CLI）
vercel --prod

# 3. 验证部署
# 检查Vercel Dashboard中的部署状态
```

## 🛠️ 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查环境变量
echo $DATABASE_URL

# 检查数据库连接
node -e "const { pool } = require('./config/database'); pool.query('SELECT 1').then(() => console.log('OK')).catch(console.error)"
```

#### 2. API路由不工作
- 检查 `vercel.json` 路由配置
- 确保API文件存在
- 检查函数导出格式

#### 3. 静态资源404
- 检查文件路径
- 确保文件存在于正确位置
- 检查 `vercel.json` 配置

### 调试技巧

#### 1. 查看Vercel日志
```bash
vercel logs
```

#### 2. 本地模拟Vercel环境
```bash
# 设置Vercel环境变量
export VERCEL=1
export NODE_ENV=production

# 启动服务器
npm run dev
```

#### 3. 检查环境差异
```bash
# 检查环境检测
node -e "const { isVercel, isLocal } = require('./config/environment'); console.log({ isVercel, isLocal });"
```

## 📊 性能优化

### 1. 数据库连接池
- 本地：最大5个连接
- Vercel：最大2个连接

### 2. 查询重试机制
- 自动重试失败的查询
- 指数退避策略

### 3. 缓存策略
- 静态资源缓存
- API响应缓存

## 🔒 安全考虑

### 1. 环境变量
- 不要在代码中硬编码敏感信息
- 使用环境变量管理配置

### 2. CORS设置
- 生产环境限制允许的域名
- 开发环境允许所有来源

### 3. 数据库安全
- 使用SSL连接
- 限制数据库权限

## 📈 监控和维护

### 1. 健康检查
```bash
# 定期检查API健康状态
curl https://your-app.vercel.app/api/health
```

### 2. 日志监控
- 查看Vercel函数日志
- 监控数据库连接状态

### 3. 性能监控
- 监控API响应时间
- 监控数据库查询性能

## 🎯 最佳实践

### 1. 开发流程
1. 本地开发 → 测试 → 提交代码
2. Vercel自动部署 → 验证功能
3. 监控和维护

### 2. 代码管理
- 使用Git版本控制
- 编写清晰的提交信息
- 定期备份数据库

### 3. 部署策略
- 使用分支部署测试
- 生产环境使用主分支
- 设置自动部署

## 📞 支持

如果遇到问题，请检查：
1. 环境变量设置
2. 数据库连接状态
3. Vercel部署日志
4. API路由配置

---

**注意**: 本方案确保本地和Vercel环境的完全兼容，所有功能在本地测试OK后，部署到Vercel将正常工作。
