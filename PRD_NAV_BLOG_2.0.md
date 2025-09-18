### 产品需求文档（PRD）2.0 — 导航与博客系统迭代（含本地图片存储方案）

## 1. 概要
- **目标**：在现有测试站点新增顶部导航（TEST/Blog），并实现数据库驱动的博客系统（列表页、详情页、随机推荐、Markdown 渲染），同时采用站点静态目录管理博客配图。
- **范围**：导航与路由、数据库与API、列表/详情页、Markdown 渲染、随机推荐、图片存储方案、基础SEO与统计。

## 2. 导航栏
- 位置：全站顶部 Header，固定吸顶。
- 标签：
  - TEST：默认选中，指向现有首页（URL 不变）。
  - Blog：指向博客列表页 `/blog`。
- 高亮：当前页对应标签高亮（主色/下划线）。
- 移动端：折叠菜单包含 TEST/Blog 两项。

## 3. 数据库与数据模型
- 新增表：`blogs`
  - `id`（主键，自增或 UUID）
  - `slug`（唯一，用于路由）
  - `title`（文章名称）
  - `summary`（文章简介）
  - `content_md`（Markdown 正文）
- `cover_image_url`（封面图 URL，可为相对路径，见第8章）
  - `reading_count`（阅读数量，默认 0）
  - `is_published`（是否发布）
  - `created_at` / `updated_at`
- 预留：`tags`、`author`、`seo_title`、`seo_desc`、`is_top`、`order_index`。

## 4. API 设计
- `GET /api/blogs`
  - 用途：分页/筛选获取已发布文章列表（默认 `created_at DESC`）
  - 入参：`page`、`pageSize`、`keyword`（可选）
  - 出参：`[{ id, slug, title, summary, cover_image_url, created_at, reading_count }]`
- `GET /api/blogs/:slug`
  - 用途：获取单篇详情
  - 出参：`{ id, slug, title, summary, content_md, cover_image_url, created_at, reading_count }`
  - 侧效：后端对 `reading_count` +1（可做幂等/频率限制）
- `GET /api/blogs/:slug/recommend`
  - 用途：随机推荐 3 篇文章
  - 规则：仅从 `is_published=true` 的集合中随机，排除当前 `slug`；不足 3 篇则返回可用数量
  - 出参：同列表项
- 后台写入（迭代预留）：`POST /api/blogs`、`PUT /api/blogs/:id`

## 5. 前端路由与页面
### 5.1 列表页 `/blog`
- 网格卡片，桌面端每行 3 个、平板 2 个、移动端 1 个。
- 卡片内容：封面（固定比例 16:9，`object-cover`）、标题、简介。
- 点击跳转 `/blog/:slug`。
- 空态：友好提示与重试按钮。

### 5.2 详情页 `/blog/:slug`
- 面包屑：`Home / Blog / 文章标题`。
- 结构（自上而下）：
  1) 标题（H1）
  2) Markdown 正文（安全渲染，支持标题、列表、引用、图片、代码块）
  3) 推荐阅读：默认展示 3 篇，以卡片并排、一行最多 3 个（移动端自适配）。
- 阅读量：进入详情页触发后端计数 +1。
- SEO：`<title>` 使用文章标题；`meta description` 使用简介前若干字。

## 6. Markdown 渲染与安全
- 前端使用 `marked + DOMPurify`（已在项目中使用）进行 Markdown 渲染与 XSS 清洗。
- 代码高亮（可选）：`highlight.js`。
- 图片在 Markdown 中可使用相对路径，详见第8章目录规范。

## 7. 推荐算法规则
- 从 `blogs` 表中过滤 `is_published=true` 且 `slug != 当前` 的集合中随机选 3 篇。
- 若可用数量 < 3，则返回可用数量；不重复返回当前阅读文章。

## 8. 博客配图存储方案（本地静态目录）
### 8.1 目录与命名
- 根目录：`assets/blogs/`
- 封面文件统一命名方案（PNG）：`assets/blogs/<title>.png`
- 其中 `<title>` 指文章标题的“规范化文件名”（sanitizedTitle，见下文 8.2 规范化规则）。

```
assets/
  blogs/
    enneagram-intro-guide.png
    mbti-career-personality-test.png
```

### 8.2 字段与引用
- 数据库 `cover_image_url`：存相对路径或绝对路径均可。
  - 相对：`assets/blogs/<sanitizedTitle>.png`
  - 绝对：`/assets/blogs/<sanitizedTitle>.png`
- 前端加载策略（解析顺序）：
  1) 若有 `cover_image_url` 则使用之；
  2) 否则使用 `assets/blogs/${sanitizedTitle}.png`；
  3) 失败则兜底 `assets/images/logo.png`。

规范化规则（sanitizedTitle）
- 将标题转为文件名时应当：
  - 全部转为小写；
  - 去除首尾空格；
  - 将空格与分隔符（/、\\、_、.、：、：、— 等）统一替换为 `-`；
  - 仅保留 `[a-z0-9-]` 字符，其他字符移除；
  - 连续 `-` 合并为一个；
  - 长度建议 ≤ 60；
  - 若标题主要为中文/非 ASCII，建议提供一个英文/拼音形式的“展示同义标题”用于文件名；
  - 如发生重名冲突，尾部追加短 hash（如 `-a1b2`）。

### 8.3 规范与性能
- 尺寸建议：16:9，最小 1200×675px；大小 < 400KB。
- 懒加载：`<img loading="lazy">`。
- 缓存：为静态资源开启长缓存；更新时在引用处追加 `?v=<timestamp>`。
- Git 管理：图片随代码版本管理，回滚友好。

## 9. 交互细节与响应式
- 导航：点击 TEST 进入首页；点击 Blog 进入博客列表；当前标签高亮。
- 列表卡片：统一尺寸，Hover 增加轻微阴影；图片加载 Skeleton。
- 详情页：面包屑可点击返回列表；推荐卡片与列表卡片一致。

## 10. 埋点与统计（基础）
- 列表页曝光量（可选）。
- 详情页阅读量（后端计数）。
- 推荐卡片点击量（可选）。

## 11. 验收标准
- 导航正常工作，TEST 默认选中，Blog 可正常进入。
- `/blog`：卡片 3 列（桌面），2 列（平板），1 列（移动）；加载列表成功展示。
- `/blog/:slug`：标题 → Markdown 正文 → 推荐 3 篇（不包含当前文章）。
- 新文章仅通过数据库写入与放置 `cover.jpg` 即可在前端自动展示，无需改代码。
- 图片不存在时有兜底图；Markdown 渲染安全、无 XSS 问题。

## 12. 里程碑
- M1：导航栏 + 列表页 + `GET /api/blogs`
- M2：详情页（Markdown + 阅读量 + 推荐）+ `GET /api/blogs/:slug` + `/recommend`
- M3：图片方案落地（本地目录）、懒加载与缓存版本号

## 13. 运维与发布流程
1) 新增/更新文章数据（写库 `blogs`）。
2) 将封面图置于 `assets/blogs/<sanitizedTitle>.png`。
3) 部署后前端自动展示；必要时在引用处添加 `?v=<timestamp>` 强刷缓存。

## 14. 风险与边界
- 文章总量增长导致首页/列表加载压力：采用分页或滚动加载，限制单页条数。
- 图片过大影响体验：提交前统一压缩（可引入校验与压缩脚本）。
- 本地静态资源在多节点/多环境差异：通过 Git 同步，或后续平滑迁移 CDN（`cover_image_url` 切换为 CDN URL 即可）。

## 15. 数据样例（真实）
```json
{
  "title": "The Application of the MBTI Personality Test in Real Life",
  "cover_image_url": "assets/blogs/the-application-of-the-mbti-personality-test-in-real-life.png",
  "summary": "It introduces the theoretical basis of the MBTI Personality Test, expounds its applications in personal growth, interpersonal relationships, team management and career development, and also reminds that it should be used objectively and cautiously.",
  "content_md": "The MBTI Personality Test is a tool based on psychological theories, designed to help people understand their personal traits and behavioral preferences. In real life, it has a wide range of applications, including personal growth, interpersonal relationships, team building, and career development.\n\nFirst, the MBTI Personality Test can help people identify their personality types. Through the test, individuals can learn about their preferences across four dimensions: Extraversion/Introversion, Sensing/Intuition, Thinking/Feeling, and Judging/Perceiving. The combination of these dimensions results in 16 distinct personality types. By understanding their own personality type, individuals can gain better insight into their strengths, weaknesses, and potential development directions.\n\nSecond, the test can help improve interpersonal relationships. By understanding others' personality types, people can better comprehend others' ways of thinking and behavioral patterns, thereby enhancing communication and mutual understanding. For instance, a \"Sensitive Insightful\" type may prioritize emotions and interpersonal connections, while a \"Logical Analyst\" type may focus more on logic and analysis. This awareness helps people better mediate conflicts and build healthier, more harmonious relationships.\n\nThird, the MBTI test can be used for team building. By understanding team members' personality types and behavioral preferences, leaders can assign tasks and roles more effectively, promoting team collaboration and development. For example, a \"Supporter\" type may be better suited for coordination and support roles, while a \"Decision-Maker\" type may excel in leadership and decision-making positions. This understanding enables the team to leverage each member's strengths and achieve better overall results.\n\nFinally, the test can aid in career development. By recognizing their personality type and career inclinations, individuals can make more informed choices about their occupations and career paths. For example, an ** \"Innovator\" ** type may be more suitable for R&D and innovation-related work, while a \"Socializer\" type may thrive in sales and public relations roles. This knowledge helps individuals plan their careers more effectively and find fields where they are truly interested and skilled.\n\nIn summary, the MBTI Personality Test has extensive applications and significance in real life. By understanding their personality types and behavioral preferences, people can better manage their emotions and behaviors, improve interpersonal relationships, boost team collaboration and development, and plan their careers. However, it is important to note that the MBTI Personality Test is merely a tool; it cannot fully represent all of a person's personality traits and behaviors, nor can it determine a person's destiny. Therefore, when using the test, we should maintain an objective and cautious attitude, avoiding relying on it as the sole criterion for evaluating ourselves or others. Instead, we should combine it with real-life situations and personal experiences to continuously reflect on and refine our behaviors and ways of thinking.",
  "reading_count": 0,
  "is_published": true
}
```



## 16. API 规范细化（通用）
- **分页参数**：`page`（默认 1，>=1 的整数），`pageSize`（默认 12，范围 1-50）。
- **排序**：仅允许白名单字段（`created_at`、`reading_count`），方向 `ASC|DESC`（默认 `DESC`）。
- **筛选**：`keyword` 模糊匹配 `title` 与 `summary`；仅对已发布集合生效，后台接口除外。
- **错误响应模型**：
  - 结构：`{ code: string, message: string, details?: any }`
  - 示例：`{ code: "NOT_FOUND", message: "Blog not found" }`
- **幂等与频率**：详情接口在同 IP/同会话内对 `reading_count` 增量设置节流（例如 1 分钟内同 `slug` 只计一次）。
- **CORS 与缓存**：开放 GET 接口跨域；返回 `Cache-Control`（见第19章）；错误响应不缓存。
- **状态码约定**：200 成功；400 入参错误；404 资源不存在；429 频率限制；500 服务异常。

## 17. 数据库定义与约束
### 17.1 表结构（MySQL/PostgreSQL 均可）
```sql
CREATE TABLE blogs (
  id              BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  slug            VARCHAR(160) NOT NULL UNIQUE,
  title           VARCHAR(200) NOT NULL,
  summary         VARCHAR(500) DEFAULT '' NOT NULL,
  content_md      TEXT NOT NULL,
  cover_image_url VARCHAR(300) DEFAULT '' NOT NULL,
  reading_count   BIGINT DEFAULT 0 NOT NULL,
  is_published    BOOLEAN DEFAULT FALSE NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 索引与优化
CREATE INDEX idx_blogs_published_created_at ON blogs (is_published, created_at DESC);
CREATE INDEX idx_blogs_published_reading ON blogs (is_published, reading_count DESC);
CREATE INDEX idx_blogs_title_summary_gin ON blogs USING GIN ((to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,''))));
```
注：若使用 MySQL，可改用全文索引或前缀索引；如不支持 GIN，请根据引擎替换为合适的全文方案。

### 17.2 触发器/更新规则
- `updated_at` 在更新行时自动刷新（触发器或应用层保证）。
- `slug` 唯一约束防重；建议在应用层做 `slug` 生成与冲突处理（尾部短 hash）。

### 17.3 迁移与种子
- 新增迁移文件：创建 `blogs` 表与索引。
- 种子数据：至少 3 篇可发布文章（便于推荐功能验收）。

## 18. 安全与权限
- **输入校验**：对所有查询参数与路径参数进行类型与长度校验；`page/pageSize` 限制范围。
- **注入防护**：使用参数化查询；禁止字符串拼接 SQL。
- **XSS**：前端 `DOMPurify` 清洗 Markdown；后端对 `content_md` 不做危害性 HTML 的白名单外透传。
- **速率限制**：对 `GET /api/blogs/:slug` 与推荐接口设置 IP 级与用户级速率限制（如 60 rpm）。
- **管理接口**：`POST/PUT` 预留需鉴权（后续接入 JWT/Session）；当前阶段不对外暴露。

## 19. 缓存与静态资源策略
- **接口缓存**：
  - 列表与详情：`Cache-Control: public, max-age=60, stale-while-revalidate=120`。
  - 推荐：`max-age=30`，允许轻度过期使用以提升体验。
- **静态图片**：`assets/blogs/` 开启长缓存 `Cache-Control: public, max-age=31536000, immutable`；更新时文件名或引用追加 `?v=<timestamp>`。
- **CDN 兼容**：未来可将 `cover_image_url` 切换为 CDN；其余逻辑不变。

## 20. SEO 与站点地图
- **页面级**：
  - 列表页 `<title>Blog - 站点名</title>`；可选 `meta description`。
  - 详情页 `<title>{title} - 站点名</title>`，`meta description` 取 `summary` 前 120-160 字。
- **OG/Twitter**：在详情页注入 `og:title`、`og:description`、`og:image`、`og:type=article`、`og:url`；Twitter 同步。
- **sitemap.xml**：将已发布的 `slug` 生成到 `/blog/:slug`；每日或手动更新。
- **robots.txt**：允许抓取 `/blog` 与 `/blog/:slug`，屏蔽后台接口。

## 21. 可观测性与日志
- **后端日志**：按请求记录方法、路径、耗时、状态码、错误摘要；敏感字段脱敏。
- **指标**：接口 QPS、P95/P99、错误率；阅读计数自增失败率。
- **前端埋点**：列表曝光、详情阅读、推荐点击（可选）；统一上报结构与采样。

## 22. 性能与可用性
- **分页**：首次加载 `pageSize=12`；滚动或分页按钮加载更多。
- **图片**：懒加载，指定 `width/height` 或 `aspect-ratio` 以避免布局抖动；采用 `object-fit: cover`。
- **降级**：接口失败时展示空态与重试；推荐失败不阻塞正文展示。
- **并发安全**：`reading_count` 使用 `UPDATE ... SET reading_count = reading_count + 1` 原子自增；必要时加去重键规避重复统计。

## 23. 质量保障与用例
### 23.1 后端用例
- 列表默认分页成功返回；`page=0`、`pageSize=999` 返回 400。
- 关键词搜索返回期望集合；未发布文章不出现在公开接口。
- 详情已发布文章返回 200；不存在或未发布返回 404。
- 阅读计数同 IP 1 分钟内多次访问仅 +1；超过窗口再次 +1。
- 推荐接口：返回 ≤3 篇、且不包含当前 `slug`；当总量 <3 时按实际可用返回。

### 23.2 前端用例
- 列表卡片自适应列数（3/2/1）；图片懒加载与 Skeleton 生效。
- 详情页渲染 Markdown（标题、列表、引用、图片、代码块）；无 XSS。
- 推荐卡片点击可跳转对应详情；失败时组件隐藏或提供重试。

## 24. 无障碍与易用性
- 语义化标签：导航用 `<nav>`，面包屑用 `aria-label="breadcrumb"`。
- 键盘可达：焦点顺序合理，卡片可通过 Enter 打开。
- 对比度与可读性：正文字号与行高符合阅读规范。

## 25. 国际化（可选）
- 提供英文与中文标题/简介字段或在前端做文案表；`slug` 保持稳定不受语言切换影响。

## 26. 回滚与版本化
- 数据迁移向后兼容：加列不删列；如需回滚，先下线依赖字段再移除。
- 静态资源版本化：通过文件名或查询参数确保缓存可控。
- 接口变更采用语义化版本或新增路径（如 `/api/v2/blogs`）。