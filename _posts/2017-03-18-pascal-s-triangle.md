---
layout: post
title: Pascal's Triangle
category: Study
tags: Algorithm
---

记一个关于计算`Pascal's Triangle`第`N`行数据数学公式，如下：\\[r_i=\frac{r_{i-1} \times (rowIndex - i + 1)}{i}\\]

注：\\(r_i\\)表示`rowIndex`行第`i`个元素，`rowIndex`当前行数，行数和每一个行开始位置都是从`0`开始。

{% include mathjax.html %}