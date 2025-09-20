# Vercel 部署问题修复说明

## 问题描述
部署到 Vercel 后出现 JavaScript 文件加载错误：
```
i18n.js?v=20250116:1 Uncaught SyntaxError: Unexpected token '<'
```

## 问题原因
1. **路径不一致**：不同 HTML 文件使用了不同的路径格式
   - `index.html` 和 `blog.html` 使用相对路径：`js/i18n.js`
   - `test-detail.html` 和 `blog-detail.html` 使用绝对路径：`/js/i18n.js`

2. **Vercel 静态文件服务配置不完整**：缺少正确的 MIME 类型和路由配置

## 修复内容

### 1. 统一所有资源路径为相对路径
- ✅ JavaScript 文件：`/js/` → `js/`
- ✅ CSS 文件：`/css/` → `css/`
- ✅ 图片文件：`/assets/` → `assets/`
- ✅ Favicon：`/assets/images/logo.png` → `assets/images/logo.png`

### 2. 更新 Vercel 配置 (`vercel.json`)
```json
{
  "version": 2,
  "outputDirectory": ".",
  "functions": {
    "backend/server.js": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }
      ]
    },
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/css; charset=utf-8"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=2592000"
        }
      ]
    }
  ]
}
```

## 修复的文件
- `test-detail.html` - 统一所有资源路径
- `blog-detail.html` - 统一所有资源路径
- `vercel.json` - 添加完整的静态文件服务配置

## 部署步骤
1. 提交所有修改到 Git
2. 推送到 GitHub
3. Vercel 会自动重新部署
4. 检查部署后的网站是否正常加载 JavaScript 文件

## 验证方法
1. 打开浏览器开发者工具
2. 检查 Console 是否还有 JavaScript 错误
3. 确认所有测试项目和博客内容正常显示
4. 检查网络面板确认 JavaScript 文件正确加载

## 注意事项
- 所有资源路径现在都使用相对路径，确保在不同环境下的一致性
- Vercel 配置中添加了正确的 MIME 类型，确保 JavaScript 和 CSS 文件被正确识别
- 添加了适当的缓存策略以提高性能
