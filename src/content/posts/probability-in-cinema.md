---
title: "电影里的概率直觉"
excerpt: "从悬疑片叙事到条件概率，看看故事如何操控先验。"
publishDate: 2024-03-16
listDate: "Mar 16, 2024"
wordCount: "1,260 Words"
tags:
  - Cinema
  - 概率
  - LaTeX
majorCategory: Shows and Movies
---

很多悬疑片都在做同一件事：改变观众的先验分布 $P(H)$。

当新证据 $E$ 出现时，观众对结论的判断会更新到 $P(H\mid E)$。

$$
\text{odds}(H\mid E)=\text{odds}(H)\times\frac{P(E\mid H)}{P(E\mid \neg H)}
$$