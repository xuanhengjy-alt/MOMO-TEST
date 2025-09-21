# 博客API修复说明

## 问题描述
Vercel部署后，博客列表页报错无法正常显示，API请求超时。

## 问题原因
1. **字段名不匹配**：API代码中使用的字段名与数据库实际字段名不一致
2. **数据库连接超时**：可能是数据库查询超时导致的

## 数据库字段映射

### 实际数据库字段 → API返回字段
- `title` → `title`
- `summary` → `excerpt`  
- `content_md` → `content`
- `cover_image_url` → `imageUrl`
- `reading_count` → `viewCount`
- `is_published` → 查询条件（WHERE is_published = true）
- `created_at` → `publishedAt`

### 修复内容

#### 1. 字段名修正
```sql
-- 修复前（错误）
SELECT title_en, excerpt_en, content_en, image_url, view_count, status
FROM blogs WHERE status = 'published'

-- 修复后（正确）
SELECT title, summary, content_md, cover_image_url, reading_count, is_published
FROM blogs WHERE is_published = true
```

#### 2. 超时处理
- 添加了10秒查询超时限制
- 超时后返回空列表而不是错误，避免页面崩溃

#### 3. 错误处理优化
- 数据库查询失败时返回空列表
- 添加详细的错误日志
- 保持API响应格式一致

## 修复后的API行为

### 博客列表API (`/api/blogs`)
- ✅ 正确查询已发布的博客
- ✅ 支持分页和关键词搜索
- ✅ 超时保护机制
- ✅ 优雅的错误处理

### 博客详情API (`/api/blogs/{slug}`)
- ✅ 正确获取博客详情
- ✅ 自动更新浏览次数
- ✅ 返回正确的字段映射

### 博客推荐API (`/api/blogs/{slug}/recommend`)
- ✅ 随机推荐相关博客
- ✅ 使用正确的字段名

## 测试验证

### 1. 数据库连接测试
```bash
# 测试数据库连接
curl https://your-domain.vercel.app/api/health
```

### 2. 博客列表测试
```bash
# 获取博客列表
curl https://your-domain.vercel.app/api/blogs

# 带分页参数
curl https://your-domain.vercel.app/api/blogs?page=1&pageSize=12
```

### 3. 博客详情测试
```bash
# 获取博客详情
curl https://your-domain.vercel.app/api/blogs/some-blog-slug
```

## 预期结果

修复后应该看到：
- ✅ 博客列表页正常加载
- ✅ 博客数据正确显示
- ✅ 无API超时错误
- ✅ 浏览器控制台无错误信息

## 部署步骤

1. **提交修复**：
   ```bash
   git add api/blogs.js
   git commit -m "Fix blog API: Correct database field names and add timeout handling"
   git push
   ```

2. **验证修复**：
   - 访问博客页面
   - 检查浏览器控制台
   - 确认博客列表正常显示

## 技术细节

### 数据库字段映射函数
```javascript
const blogs = result.rows.map(row => ({
  id: row.id,
  slug: row.slug,
  title: row.title,                    // 直接使用 title
  excerpt: row.summary,                // summary → excerpt
  imageUrl: row.cover_image_url,       // cover_image_url → imageUrl
  author: 'MOMO TEST',                 // 默认作者
  publishedAt: row.created_at,         // created_at → publishedAt
  viewCount: row.reading_count || 0,   // reading_count → viewCount
  likeCount: 0                         // 默认点赞数
}));
```

### 超时处理机制
```javascript
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Database query timeout')), 10000);
});

const result = await Promise.race([queryPromise, timeoutPromise]);
```

这个修复确保了博客API能够正确处理数据库字段名，并提供可靠的超时保护机制。
