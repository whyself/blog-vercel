---
title: "贝叶斯入门（中文）"
excerpt: "用一个通俗例子理解后验概率，顺便验证中文 + LaTeX 渲染。"
publishDate: 2024-03-12
listDate: "Mar 12, 2024"
wordCount: "1,180 Words"
tags:
  - 中文
  - 统计
  - LaTeX
majorCategory: Books
---

贝叶斯公式：$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}$。

如果要展开分母，可以写成：

$$
P(B)=\sum_i P(B\mid A_i)P(A_i)
$$

这个写法非常适合做阅读笔记。