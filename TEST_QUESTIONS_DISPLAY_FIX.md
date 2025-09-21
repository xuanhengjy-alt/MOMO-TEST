# 测试项目详情页题目数量显示修复

## 问题描述
测试项目详情页没有显示题目数量，页面显示错误信息 "Unable to load questions. Please refresh the page."

## 问题原因
**jQuery依赖缺失**：JavaScript代码使用了jQuery选择器 `$('#info-line')`，但页面没有加载jQuery库，导致：
1. `infoLine` 变量为 `undefined`
2. 无法更新题目数量显示
3. 错误信息无法正确显示

## 修复方案

### 1. 修复jQuery选择器
将所有jQuery选择器替换为原生JavaScript的 `document.getElementById()`：

```javascript
// 修复前
const infoLine = $('#info-line');
const projectTitle = $('#project-title');
const projectImage = $('#project-image');
const breadcrumbProject = $('#breadcrumb-project');
// ... 等等

// 修复后
const infoLine = document.getElementById('info-line');
const projectTitle = document.getElementById('project-title');
const projectImage = document.getElementById('project-image');
const breadcrumbProject = document.getElementById('breadcrumb-project');
// ... 等等
```

### 2. 修复的具体元素
- ✅ `info-line` - 题目数量显示元素
- ✅ `project-title` - 项目标题
- ✅ `project-image` - 项目图片
- ✅ `breadcrumb-project` - 面包屑项目名
- ✅ `breadcrumb-subview` - 面包屑子视图
- ✅ `view-detail` - 详情视图
- ✅ `view-start` - 开始视图
- ✅ `view-result` - 结果视图
- ✅ `tested-count` - 测试人数
- ✅ `like-btn` - 点赞按钮
- ✅ `like-count` - 点赞数量
- ✅ `goto-start` - 开始测试按钮
- ✅ `project-intro` - 项目介绍
- ✅ `progress-bar` - 进度条
- ✅ `progress-text` - 进度文本
- ✅ `question-title` - 题目标题
- ✅ `options` - 选项容器
- ✅ `restart-btn` - 重新开始按钮
- ✅ `result-title` - 结果标题
- ✅ `result-image` - 结果图片
- ✅ `result-summary` - 结果摘要
- ✅ `result-analysis` - 结果分析
- ✅ `result-restart` - 结果页重新开始按钮

## 题目数据状态

### 有题目数据的测试项目
- ✅ Phil personality test (phil_test_en) - 10个题目
- ✅ EQ test (eq_test_en) - 33个题目
- ✅ Four-colors Personality Analysis (four_colors_en) - 30个题目
- ✅ PDP test (pdp_test_en) - 30个题目
- ✅ Holland test (holland_test_en) - 90个题目
- ✅ Enneagram test (enneagram_en) - 180个题目
- ✅ 等等...

### 缺失题目数据的测试项目
- ❌ MBTI test (mbti) - 0个题目
- ❌ DISC test (disc40) - 0个题目

## 预期结果

修复后应该看到：

### 有题目数据的测试项目
- ✅ 显示题目数量：如 "Total **10** questions, estimated **2** minutes"
- ✅ 显示预计完成时间
- ✅ "Start Test" 按钮可点击

### 缺失题目数据的测试项目
- ✅ 显示错误信息：**"Unable to load questions. Please refresh the page."**
- ✅ 错误信息为红色文本
- ✅ "Start Test" 按钮可能不可用或显示错误

## 技术细节

### 题目数量显示逻辑
```javascript
// 获取题目数据
const questions = await getQList();
const totalQ = questions ? questions.length : 0;

if (totalQ > 0) {
  // 显示题目数量和预计时间
  const estMinutes = Math.max(1, Math.round((totalQ * 12) / 60));
  infoLine.innerHTML = `Total <span class="font-semibold text-rose-600">${totalQ}</span> questions, estimated <span class="font-semibold text-rose-600">${estMinutes}</span> minutes`;
} else {
  // 显示错误信息
  infoLine.innerHTML = `<span class="text-red-500">Unable to load questions. Please refresh the page.</span>`;
}
```

### 预计时间计算
- 每题约12秒
- 总时间 = (题目数量 × 12) ÷ 60 分钟
- 最少显示1分钟

## 部署步骤

1. **提交修复**：
   ```bash
   git add js/test-page.js
   git commit -m "Fix test detail page: Replace jQuery selectors with native JavaScript"
   git push
   ```

2. **验证修复**：
   - 访问有题目数据的测试项目详情页
   - 检查题目数量是否正确显示
   - 访问缺失题目数据的测试项目详情页
   - 检查错误信息是否正确显示

## 后续建议

### 1. 添加缺失的题目数据
为MBTI和DISC测试添加题目数据：
- MBTI测试通常需要93个题目
- DISC测试通常需要28个题目

### 2. 改进错误处理
- 为缺失数据的测试项目提供更友好的错误信息
- 添加"联系我们"或"报告问题"的链接

### 3. 性能优化
- 考虑添加题目数据的懒加载
- 优化数据库查询性能

这个修复解决了测试项目详情页题目数量显示的核心问题，确保用户能够看到正确的题目数量或错误信息。
