# Whyself 博客（Astro）

这是一个基于 Astro Content Collections 的个人博客项目，支持：

- Markdown 内容管理
- 首页与分类归档分页
- 文章详情页（含目录、代码块增强、图片增强）
- 站内搜索、主题切换、RSS、Sitemap、Robots

## 项目结构

- `src/content/posts/*.md`：博客文章内容与 Frontmatter
- `src/content/pages/*.md`：About/Bio 页面内容
- `src/content/config.ts`：内容 schema（文章与页面字段）
- `src/pages/index.astro`：首页归档（第 1 页）
- `src/pages/page/[page].astro`：首页归档分页
- `src/pages/articles/**`：Articles 分类归档与分页
- `src/pages/books/**`：Books 分类归档与分页
- `src/pages/shows-and-movies/**`：Shows and Movies 分类归档与分页
- `src/pages/posts/[slug].astro`：文章详情页
- `src/pages/archive-data/[route].json.ts`：归档筛选所需的按路由数据源
- `src/pages/rss.xml.ts`：RSS 订阅
- `src/pages/sitemap.xml.ts`：站点地图
- `src/pages/robots.txt.ts`：搜索引擎抓取规则
- `src/components/*`：页面组件（归档、顶部操作、侧栏、页脚等）
- `src/layouts/ContentInfoPageLayout.astro`：About/Bio 共享布局
- `src/utils/archive.ts`：归档分页/SEO/路由辅助函数
- `src/utils/posts.ts`：文章集合与搜索数据构建工具
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
