# 博客图片加载修复说明

## 问题描述
博客列表页可以正常加载，但是博客图片无法显示，控制台显示 "Blog image preload failed" 错误。

## 问题原因
**字段名不匹配**：前端代码期望的字段名与API返回的字段名不一致
- 前端代码期望：`cover_image_url`
- API实际返回：`imageUrl`

## 修复内容

### 1. API字段名修正
在 `api/blogs.js` 中，为所有博客相关API添加了正确的字段名：

```javascript
// 修复前
const blogs = result.rows.map(row => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.summary,
  imageUrl: row.cover_image_url, // 前端期望的是 cover_image_url
  // ...
}));

// 修复后
const blogs = result.rows.map(row => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.summary,
  cover_image_url: row.cover_image_url, // 保持原始字段名
  imageUrl: row.cover_image_url, // 兼容字段名
  // ...
}));
```

### 2. 修复的API端点
- ✅ `/api/blogs` - 博客列表API
- ✅ `/api/blogs/{slug}` - 博客详情API  
- ✅ `/api/blogs/{slug}/recommend` - 博客推荐API

### 3. 图片路径处理
前端代码的图片加载逻辑是正确的：
```javascript
// 优先使用数据库提供的封面 URL
const dbCover = (b.cover_image_url || '').trim();
const normalizedDbCover = dbCover ? (dbCover.startsWith('/') ? dbCover : `/${dbCover}`) : '';
const bySlug = `/assets/blogs/${encodeURIComponent(b.slug)}.jpg`;
```

## 数据库图片路径验证

### 实际图片文件存在
```
assets/blogs/
├── quickly-improve-depressive-moods.jpg
├── the-best-way-to-relieve-anxiety.jpg
├── on-the-importance-of-high-emotional-quotient.jpg
├── how-to-apply-the-pdp-professional-personality-test.jpg
├── pdp-personality-test-is-your-personality-tiger-peacock-koala-owl-or-chameleon-type.jpg
├── holland-occupational-interest-test-find-your-calling-career.jpg
├── four-color-personality-analysis.jpg
├── the-color-you-like-reflects-your-personality.jpg
├── analysis-of-the-personality-traits.jpg
├── do-you-know-what-kind-of-personality-you-have.jpg
├── the-6-mbti-personality-types-most-severely-lacking-in-relationship-security.jpg
├── mbti-personality-types-prone-to-impulsive-decisions-and-regret.jpg
└── the-application-of-the-mbti-personality-test-in-real-life.jpg
```

### 数据库图片路径映射
- 博客1: `assets/blogs/quickly-improve-depressive-moods.jpg` ✅
- 博客2: `assets/blogs/the-best-way-to-relieve-anxiety.jpg` ✅
- 博客3: `assets/blogs/on-the-importance-of-high-emotional-quotient.jpg` ✅
- 博客4: `assets/blogs/how-to-apply-the-pdp-professional-personality-test.jpg` ✅
- 博客5: `assets/blogs/pdp-personality-test-is-your-personality-tiger-peacock-koala-owl-or-chameleon-type.jpg` ✅
- 博客6: `assets/blogs/holland-occupational-interest-test-find-your-calling-career.jpg` ✅
- 博客7: `assets/blogs/four-color-personality-analysis.jpg` ✅
- 博客8: `assets/blogs/the-color-you-like-reflects-your-personality.jpg` ✅
- 博客9: `assets/blogs/analysis-of-the-personality-traits.jpg` ✅
- 博客10: `assets/blogs/do-you-know-what-kind-of-personality-you-have.jpg` ✅
- 博客11: `assets/blogs/the-6-mbti-personality-types-most-severely-lacking-in-relationship-security.jpg` ✅
- 博客12: `assets/blogs/mbti-personality-types-prone-to-impulsive-decisions-and-regret.jpg` ✅
- 博客13: `assets/blogs/the-application-of-the-mbti-personality-test-in-real-life.jpg` ✅

## 预期结果

修复后应该看到：
- ✅ 博客列表页正常加载
- ✅ 所有博客图片正确显示
- ✅ 浏览器控制台无图片加载错误
- ✅ 图片预加载成功

## 部署步骤

1. **提交修复**：
   ```bash
   git add api/blogs.js
   git commit -m "Fix blog image loading: Add cover_image_url field to API response"
   git push
   ```

2. **验证修复**：
   - 访问博客页面
   - 检查所有博客图片是否正常显示
   - 确认浏览器控制台无错误

## 技术细节

### 前端图片加载逻辑
```javascript
// 优先使用数据库提供的封面 URL
const dbCover = (b.cover_image_url || '').trim();
const normalizedDbCover = dbCover ? (dbCover.startsWith('/') ? dbCover : `/${dbCover}`) : '';
const bySlug = `/assets/blogs/${encodeURIComponent(b.slug)}.jpg`;

// 预加载图片
const realSrc = ver ? `${(normalizedDbCover || bySlug)}?v=${ver}` : (normalizedDbCover || bySlug);
const pre = new Image();
pre.onload = function(){
  img.src = realSrc;
  sk.classList.add('hidden');
  img.classList.remove('hidden');
};
pre.onerror = function(){
  sk.classList.add('hidden');
  console.error('Blog image preload failed:', normalizedDbCover || bySlug);
};
pre.src = realSrc;
```

### API响应格式
```javascript
{
  "success": true,
  "blogs": [
    {
      "id": 13,
      "slug": "10-low-cost-small-things-that-can-quickly-improve-depressive-moods",
      "title": "10 Low-Cost Small Things That Can Quickly Improve Depressive Moods",
      "excerpt": "...",
      "cover_image_url": "assets/blogs/quickly-improve-depressive-moods.jpg",
      "imageUrl": "assets/blogs/quickly-improve-depressive-moods.jpg",
      "author": "MOMO TEST",
      "publishedAt": "2025-09-19T07:47:30.000Z",
      "viewCount": 13,
      "likeCount": 0
    }
  ]
}
```

这个修复确保了前端代码能够正确获取到博客图片路径，解决图片无法显示的问题。
