# 环境配置说明

## 统一开发部署方案

### 环境变量设置

**本地开发**：
创建 `.env.local` 文件（不会被提交到Git）：
```bash
# 本地开发环境变量
DATABASE_URL=postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=development
PORT=3000
```

**Vercel部署**：
在Vercel仪表板中设置环境变量：
```bash
DATABASE_URL=postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
```

### 开发流程

1. **本地开发**：
   ```bash
   npm run dev
   # 访问 http://localhost:3000
   ```

2. **部署到Vercel**：
   ```bash
   git add .
   git commit -m "Update"
   git push
   # Vercel自动部署
   ```

### 优势

- ✅ 本地和Vercel使用完全相同的API文件
- ✅ 相同的数据库连接
- ✅ 相同的代码结构
- ✅ 无兼容性问题
- ✅ 开发完直接部署即可用
