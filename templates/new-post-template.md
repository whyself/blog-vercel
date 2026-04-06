---
# ===== Required =====
# title: 文章主标题（文章页 H1 + SEO 标题基础）
title: "文章标题"

# excerpt: 摘要（用于首页/列表卡片 + SEO description）
excerpt: "一句话摘要（用于列表与 SEO）"

# publishDate: 发布日期（真正用于排序的日期，推荐 YYYY-MM-DD）
publishDate: 2026-03-29

# listDate: 列表页显示的日期文案（纯字符串，可自定义格式）
listDate: "Mar 29, 2026"

# wordCount: 阅读量文案（字符串，按你习惯写）
wordCount: "1,200 Words"

# tags: 标签数组（用于文章元信息和筛选）
tags:
  - 中文
  - 标签2

# majorCategory: 主分类（只能是 Articles / Books / Shows and Movies）
majorCategory: Articles

# ===== Optional (delete if unused) =====
# listTitle: 列表页短标题（不填则默认使用 title）
listTitle: "列表页短标题"

# subtitle: 副标题（显示在文章标题下方）
subtitle: "副标题（可选）"

# articleDate: 文章页显示日期（不填则用 listDate）
articleDate: "Mar 29, 2026"

# thumbnail: 卡片缩略图路径（建议放 public/images 下）
thumbnail: "/images/posts/your-cover.webp"

# heroImage: 顶部大图路径（当前主题可按需使用）
heroImage: "/images/posts/your-hero.webp"

# author: 作者名（不填默认 whyself）
author: "whyself"

# authorAvatar: 作者头像路径（不填会走默认头像）
authorAvatar: "/images/profile-avatar.jpg"

# toc: 手动目录（通常自动提取标题；仅在需要手动覆盖时填写）
toc:
  - id: section-1
    label: 第一节

# draft: 草稿开关（true=不发布，false=发布）
draft: true
---

在这里开始写正文。

<!-- 可复用图片排版组件（建议二选一或组合） -->
<!-- 1) 文首右浮小图：短文推荐，只放 1 张 -->
<figure class="post-media post-media--float post-media--float-right">
  <img src="/images/posts/your-post/cover.jpg" alt="图片描述" />
</figure>

<!-- 2) 段间窄幅居中图：用于场景切换 -->
<div class="post-media-clear"></div>
<figure class="post-media post-media--center-narrow">
  <img src="/images/posts/your-post/scene.jpg" alt="图片描述" />
</figure>

<!-- 3) 左图右文（底部齐平）：适合结尾收束段 -->
<div class="post-media-pair post-media-pair--left post-media-pair--balanced">
  <figure class="post-media">
    <img src="/images/posts/your-post/ending.jpg" alt="图片描述" />
    <figcaption>一句简短收束语。</figcaption>
  </figure>
  <div class="post-media-pair__text">
    <p>右侧段落 1。</p>
    <p>右侧段落 2。</p>
  </div>
</div>

## 第一节

正文内容……
