---
# ===== 动态 Frontmatter =====
# 动态只在列表展示，没有详情页；正文内容不读取，文字请写进 text 字段。

# title: 可选标题；不填则只显示文字
title: "动态标题"

# date: 必填，发布日期（用于排序）
date: 2026-11-01

# text: 必填，几句话的文字；使用 | 保留换行
text: |
  第一段文字。
  第二段文字。

# images: 可选，0 张 / 1 张 / 多张均可；路径放在 public/images/ 下
# 1 张显示为 16:10 宽幅；2 张或 4 张为两列；3 张及以上为三列方格
images:
  - src: /images/moments/example-01.jpg
    alt: 图片描述
  - src: /images/moments/example-02.jpg
    alt: 图片描述

# tags: 可选，会出现在卡片底部与侧栏筛选中
tags:
  - 日常
  - 照片

# listDate: 可选，列表日期文案；不填自动生成 "Nov 1, 2026"
# listDate: "Nov 1, 2026"

# draft: true 时不展示
draft: true
---
