# Whyself 博客（Astro）

这是一个基于 Astro Content Collections 的个人博客项目，支持：

- Markdown 内容管理
- 首页与分类归档分页
- 文章详情页（含目录、代码块增强、图片增强）
- 动态卡片（仅列表展示，支持图文与标签）
- 站内搜索、主题切换、RSS、Sitemap、Robots

## 项目结构

- `src/content/posts/*.md`：博客文章内容与 Frontmatter
- `src/content/moments/*.md`：动态内容与 Frontmatter（只在列表展示，没有详情页）
- `src/content/pages/*.md`：About/Bio 页面内容
- `src/content.config.ts`：内容 schema（文章、动态与页面字段）
- `src/pages/index.astro`：首页归档（第 1 页，文章与动态按日期混排）
- `src/pages/page/[page].astro`：首页归档分页
- `src/pages/articles/**`：Articles 分类归档与分页
- `src/pages/books/**`：Books 分类归档与分页
- `src/pages/shows-and-movies/**`：Shows and Movies 分类归档与分页
- `src/pages/moments/**`：动态归档与分页
- `src/pages/posts/[slug].astro`：文章详情页
- `src/pages/archive-data/[route].json.ts`：归档筛选所需的按路由数据源
- `src/pages/rss.xml.ts`：RSS 订阅
- `src/pages/sitemap.xml.ts`：站点地图
- `src/pages/robots.txt.ts`：搜索引擎抓取规则
- `src/components/*`：页面组件（归档、文章卡片、动态卡片、顶部操作、侧栏、页脚等）
- `src/layouts/ContentInfoPageLayout.astro`：About/Bio 共享布局
- `src/utils/archive.ts`：归档卡片、分页/SEO/路由辅助函数
- `src/utils/posts.ts`：文章集合与搜索数据构建工具
- `src/utils/moments.ts`：动态集合、排序与日期格式化工具
- `src/utils/content-pages.ts`：About/Bio 数据构建工具
- `src/styles/article-prose-base.css`：文章正文共享排版样式
- `astro.config.mjs`：Astro 配置（支持 `site` 与 `base`）

## 本地开发

```bash
npm install --cache .npm-cache --ignore-scripts
npm run dev
```

默认开发地址通常是：`http://localhost:4321`

## 构建

```bash
npm run build
```

构建产物输出到：`dist/`

## 环境变量与部署说明

项目支持通过环境变量适配不同部署前缀：

- `SITE_URL`：站点完整地址（例如 `https://example.com`）
- `BASE_PATH`：部署基础路径
  - 根路径部署：`/`
  - 子路径部署：`/<your-path>/`

`BASE_PATH` 会影响内部链接、分页路由、RSS/Sitemap 等 URL 生成，请确保与部署平台配置一致。

## 文章图片排版组件

文章页支持可复用的图文混排类（定义于 `src/pages/posts/[slug].astro`）：

- `post-media post-media--float post-media--float-right`：文首右浮小图
- `post-media post-media--float post-media--float-left`：左浮小图（少量使用）
- `post-media-clear`：清除浮动
- `post-media post-media--center-narrow`：段间窄幅居中图
- `post-media-pair post-media-pair--left`：左图右文并排，桌面端底部齐平
- `post-media-pair__text`：并排布局中的右侧文字容器
- `post-media-pair--balanced`：放大左图并拉大间距，使右侧文字与图片上下对齐

可参考模板 `templates/new-post-template.md`。

如果后续 agent 需要按同一规则排版，请使用项目内 skill：`skills/post-image-layout/SKILL.md`。

## 动态（Moments）

动态用于记录短句与照片，只在列表中出现，不生成可点击进入的详情页。它们会出现在首页 `All` 时间线中，也可以从 `Moments` 归档单独查看；分类页与搜索、RSS 仍只包含文章。

在 `src/content/moments/` 下新建 `.md` 文件，Frontmatter 字段如下：

- `text`（必填）：几句话的文字，换行会保留
- `date`（必填）：发布日期，用于排序，例如 `2026-11-01`
- `title`（可选）：动态标题；不填则只显示文字
- `images`（可选）：图片数组，每项为 `{ src, alt }`；`src` 放在 `public/images/` 下
- `tags`（可选）：标签数组，会出现在侧栏筛选与卡片底部
- `listDate`（可选）：列表日期文案；不填则自动生成 `Nov 1, 2026` 格式
- `draft`（可选）：`true` 时不展示

图片排版会根据图片数量自动选择：

- 0 张：纯文字卡片
- 1 张：16:10 宽幅
- 2 张或 4 张：两列
- 3 张及以上（非 4 张）：三列方格，手机上保持三列缩略图

可参考模板 `templates/new-moment-template.md`。
