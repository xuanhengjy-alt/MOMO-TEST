# Vercel 404错误修复指南

## 问题描述
项目部署到Vercel后，测试项目详情页出现404错误：
```
Failed to load resource: the server responded with a status of 404 ()
API request failed: Error: HTTP error! status: 404
```

## 问题原因分析

### 1. API路由结构不完整
- 缺少 `api/tests/[id].js` 文件处理 `/api/tests/{id}` 请求
- 缺少 `api/tests/[id]/questions.js` 文件处理题目请求
- 缺少 `api/tests/[id]/like-status.js` 文件处理点赞状态请求

### 2. 数据库连接问题
- Vercel环境变量可能未正确配置
- 数据库连接池配置可能不适合Vercel环境

### 3. 测试项目数据缺失
- 数据库中可能没有 `eq_test_en` 项目的数据

## 修复方案

### 步骤1：创建缺失的API路由文件

已创建以下文件：
- ✅ `api/tests/[id].js` - 处理单个测试项目请求
- ✅ `api/tests/[id]/questions.js` - 处理题目请求
- ✅ `api/tests/[id]/like-status.js` - 处理点赞状态请求

### 步骤2：初始化测试项目数据

运行以下脚本初始化EQ测试项目：
```bash
node init-eq-test.js
```

### 步骤3：设置Vercel环境变量

在Vercel Dashboard中设置以下环境变量：
```
DATABASE_URL=postgresql://neondb_owner:npg_CSmA7V5acbdJ@ep-muddy-salad-af73ejdb-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
```

### 步骤4：测试API连接

运行测试脚本验证修复：
```bash
node test-vercel-api.js
```

## 部署步骤

### 1. 提交代码
```bash
git add .
git commit -m "Fix Vercel 404 error: Add missing API routes and initialize test data"
git push
```

### 2. 设置环境变量
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目设置
3. 在 "Environment Variables" 部分添加：
   - `DATABASE_URL`: 数据库连接字符串
   - `NODE_ENV`: `production`

### 3. 重新部署
Vercel会自动重新部署，或手动触发重新部署。

### 4. 验证修复
1. 访问测试项目详情页：`https://your-domain.vercel.app/test-detail.html/eq_test_en`
2. 检查浏览器控制台是否还有404错误
3. 确认页面正常显示项目信息和题目

## API端点说明

### 测试项目详情
- **URL**: `/api/tests/{id}`
- **方法**: `GET`
- **功能**: 获取单个测试项目的详细信息

### 测试题目
- **URL**: `/api/tests/{id}/questions`
- **方法**: `GET`
- **功能**: 获取测试项目的题目列表

### 点赞状态
- **URL**: `/api/tests/{id}/like-status`
- **方法**: `GET`
- **功能**: 获取测试项目的点赞统计

## 故障排除

### 如果仍然出现404错误：

1. **检查Vercel函数状态**
   - 登录Vercel Dashboard
   - 进入项目 → Functions标签页
   - 确认API函数已正确部署

2. **查看部署日志**
   - 在Vercel Dashboard查看部署日志
   - 确认没有构建错误

3. **测试API端点**
   ```bash
   # 测试基本API
   curl https://your-domain.vercel.app/api/tests/eq_test_en
   
   # 测试题目API
   curl https://your-domain.vercel.app/api/tests/eq_test_en/questions
   ```

4. **检查环境变量**
   - 确认 `DATABASE_URL` 已正确设置
   - 确认环境变量在正确的环境中（Production/Preview）

### 如果数据库连接失败：

1. **检查数据库连接字符串**
   - 确认 `DATABASE_URL` 格式正确
   - 确认数据库服务正常运行

2. **检查网络连接**
   - Vercel可能需要时间建立数据库连接
   - 尝试重新部署

## 预期结果

修复完成后，应该看到：
- ✅ 测试项目详情页正常加载
- ✅ 项目信息正确显示
- ✅ 题目列表正常加载
- ✅ 点赞功能正常工作
- ✅ 浏览器控制台无404错误

## 注意事项

- 确保所有API文件都使用 `module.exports` 导出格式
- 确保数据库连接配置适合Vercel环境
- 建议在本地测试通过后再部署到Vercel
