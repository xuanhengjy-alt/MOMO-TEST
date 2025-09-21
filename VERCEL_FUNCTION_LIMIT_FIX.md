# Vercel函数数量限制修复指南

## 问题描述
Vercel部署失败，错误信息：
```
Error: No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan. 
Create a team (Pro plan) to deploy more.
```

## 问题原因
项目中有13个API函数文件，超过了Vercel Hobby计划的12个限制：
- `api/tests.js`
- `api/tests-unified.js`
- `api/blogs.js`
- `api/blogs-unified.js`
- `api/results.js`
- `api/results-unified.js`
- `api/tests/[id].js`
- `api/tests/[id]/questions.js`
- `api/tests/[id]/like-status.js`
- `api/tests/[id]/like.js`
- `api/blogs/[slug].js`
- `api/blogs/[slug]/recommend.js`
- `api/results/stats/[id].js`

## 解决方案

### 1. 合并API功能
将多个相关功能的API合并到单个文件中：

#### 测试相关API (`api/tests.js`)
- ✅ 处理 `/api/tests` - 获取所有测试项目
- ✅ 处理 `/api/tests/{id}` - 获取单个测试项目
- ✅ 处理 `/api/tests/{id}/questions` - 获取测试题目
- ✅ 处理 `/api/tests/{id}/like-status` - 获取点赞状态
- ✅ 处理 `/api/tests/{id}/like` - 点赞操作

#### 博客相关API (`api/blogs.js`)
- ✅ 处理 `/api/blogs` - 获取博客列表
- ✅ 处理 `/api/blogs/{slug}` - 获取博客详情
- ✅ 处理 `/api/blogs/{slug}/recommend` - 获取博客推荐

#### 结果相关API (`api/results.js`)
- ✅ 处理 `/api/results` - 提交测试结果
- ✅ 处理 `/api/results/stats/{id}` - 获取统计信息

#### 健康检查API (`api/health.js`)
- ✅ 处理 `/api/health` - 健康检查

### 2. 删除冗余文件
删除了所有冗余的API文件，最终只保留4个文件：
- `api/tests.js` - 测试相关功能
- `api/blogs.js` - 博客相关功能  
- `api/results.js` - 结果相关功能
- `api/health.js` - 健康检查

### 3. 统一路由处理
每个API文件内部使用路径解析来处理不同的端点：

```javascript
// 示例：tests.js中的路由处理
const pathParts = url.pathname.split('/').filter(Boolean);

// 处理 /api/tests/{id}/questions
if (pathParts.length === 4 && pathParts[1] === 'tests' && pathParts[3] === 'questions') {
  return await handleQuestionsRequest(req, res, pathParts[2]);
}

// 处理 /api/tests/{id}
if (pathParts.length === 3 && pathParts[1] === 'tests') {
  return await handleSingleProjectRequest(req, res, pathParts[2]);
}
```

## 部署步骤

### 1. 提交代码
```bash
git add .
git commit -m "Fix Vercel function limit: Consolidate API routes into 4 files"
git push
```

### 2. 验证部署
部署完成后，验证以下API端点：

#### 测试API
```bash
# 获取所有测试项目
curl https://your-domain.vercel.app/api/tests

# 获取单个测试项目
curl https://your-domain.vercel.app/api/tests/eq_test_en

# 获取测试题目
curl https://your-domain.vercel.app/api/tests/eq_test_en/questions

# 获取点赞状态
curl https://your-domain.vercel.app/api/tests/eq_test_en/like-status
```

#### 博客API
```bash
# 获取博客列表
curl https://your-domain.vercel.app/api/blogs

# 获取博客详情
curl https://your-domain.vercel.app/api/blogs/some-blog-slug

# 获取博客推荐
curl https://your-domain.vercel.app/api/blogs/some-blog-slug/recommend
```

#### 结果API
```bash
# 获取统计信息
curl https://your-domain.vercel.app/api/results/stats/eq_test_en

# 提交测试结果（POST）
curl -X POST https://your-domain.vercel.app/api/results \
  -H "Content-Type: application/json" \
  -d '{"projectId":"eq_test_en","answers":[1,2,3]}'
```

#### 健康检查
```bash
curl https://your-domain.vercel.app/api/health
```

## 优势

### 1. 符合Vercel限制
- ✅ 只有4个API函数，远少于12个限制
- ✅ 可以正常部署到Hobby计划

### 2. 功能完整
- ✅ 所有原有功能都保留
- ✅ API端点路径保持不变
- ✅ 前端代码无需修改

### 3. 性能优化
- ✅ 减少冷启动时间
- ✅ 更好的资源利用
- ✅ 简化的部署结构

### 4. 维护性
- ✅ 代码更集中，易于维护
- ✅ 减少文件数量，降低复杂性
- ✅ 统一的错误处理

## 注意事项

1. **API路径保持不变**：前端代码无需修改，所有API调用路径保持原样

2. **错误处理**：每个API文件都有统一的错误处理和日志记录

3. **CORS配置**：所有API都正确配置了CORS头

4. **数据库连接**：使用统一的数据库连接配置

5. **环境变量**：确保在Vercel中设置了正确的环境变量：
   - `DATABASE_URL`
   - `NODE_ENV`

## 预期结果

修复完成后：
- ✅ Vercel部署成功
- ✅ 所有API端点正常工作
- ✅ 测试项目详情页正常加载
- ✅ 博客功能正常
- ✅ 测试结果提交正常
- ✅ 健康检查正常

这个解决方案既解决了Vercel的函数数量限制问题，又保持了所有功能的完整性，是一个高效且实用的解决方案。
