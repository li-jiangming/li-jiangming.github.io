---
layout: post
title: 排列组合的递归和非递归实现
category: Study
tags: C
---

#### 排列

```c
#include <stdlib.h>
#include <assert.h>

/*
 * DFS
 *
 * Args:
 *	1. deep：递归深度
 *	2. used：记录已使用的元素
 *	3. curr：当前取得的排列
 *	4. ans：保存最终结果排列数组
 *	5. ans_size 已取得排列个数
 */
void
p1(const int *nums, int nums_size, int n, int deep,
  int *used, int *curr, int ***ans, int *ans_size)
{
    int i;

    assert(ans);

    if (deep == n) {
        (*ans_size)++;

        *ans = (int **)realloc(*ans, (*ans_size) * sizeof(int *));
        assert(ans);

        (*ans)[(*ans_size) - 1] = (int *)malloc(n * sizeof(int));
        assert((*ans)[(*ans_size) - 1]);

        for (i = 0; i < n; i++)
            (*ans)[(*ans_size) - 1][i] = curr[i];

        return;
    }

    for (i = 0; i < nums_size; i++) {
        if (used[i])
            continue;

        used[i] = 1;
        curr[deep] = nums[i];
        p1(nums, nums_size, n, deep + 1, used, curr, ans, ans_size);
        used[i] = 0;
    }
}

/* 交换a和b指向得值，异或操作可以避免溢出错误 */
void
swap(int *a, int *b)
{
    *a = (*a) ^ (*b);
    *b = (*a) ^ (*b);
    *a = (*a) ^ (*b);
}

/* 整型数组反转 */
void
reverse(int *a, int start, int end)
{
    assert(a);
    assert(start >= 0 && end >= start);

    while (end > start)
        swap(a + start++, a + end--);
}

/* 数组全排列 */
void
p2(const int *nums, int nums_size, int ***ans, int *ans_size)
{
    int i, j;
    int flag;

    assert(nums);
    assert(nums_size > 0);
    assert(ans && ans_size);

    int *new_nums = (int *)malloc(nums_size * sizeof(int));
    assert(new_nums);

    for (i = 0; i < nums_size; i++)
        new_nums[i] = nums[i];

    for (;;) {
        (*ans_size)++;
        (*ans) = (int **)realloc(*ans, (*ans_size) * sizeof(int *));
        assert(*ans);

        (*ans)[(*ans_size) - 1] = (int *)malloc(nums_size * sizeof(int));
        assert((*ans)[(*ans_size) - 1]);

        for (i = 0; i < nums_size; i++)
            (*ans)[(*ans_size) - 1][i] = new_nums[i];

        j = i = nums_size - 1;
        for (; i > 0 && new_nums[i] < new_nums[i - 1]; --i);

        if (0 == i) {
            return;
        }

        for (; j >= 0 && new_nums[j] < new_nums[i - 1]; --j);
        swap(new_nums + i - 1, new_nums + j);
        reverse(new_nums, i, nums_size - 1);
    }

    if (new_nums)
        free(new_nums);
}

/* 在nums中nums_size个整数取n个数排列 */
void
p3(const int *nums, int nums_size, int n, int ***ans, int *ans_size)
{
    int i;
    int **comb_ans;
    int comb_ans_size;

    assert(nums);
    assert(n > 0);
    assert(nums_size >= n);
    assert(ans && ans_size);

    comb_ans_size = 0;
    comb_ans = combination(nums, nums_size, n, &comb_ans_size);
    if (!comb_ans || !comb_ans_size)
        return;

    for (i = 0; i < comb_ans_size; i++)
        p2(comb_ans[i], n, ans, ans_size);

    for (i = 0; i < comb_ans_size; i++)
        if (comb_ans[i])
            free(comb_ans[i]);

    if (comb_ans)
        free(comb_ans);
}

/*
 * 排列求解
 *
 * Args：
 *	1. nums：整形数组，排列源数据
 * 	2. nums_size：nums数组大小
 * 	3. n：从nums中取n个排列
 * 	4. rtn_size：返回结果数量
 *
 * Return：
 *  返回保存所有组合的二维数组，二维数组包含rtn_size个一维数组，
 *  每个一维数组的大小位n
 */
int **
permutation(const int *nums, int nums_size, int n, int *rtn_size)
{
    int **ans = NULL;

    assert(nums);
    assert(nums_size >= n);
    assert(rtn_size);

    *rtn_size = 0;

#ifdef USE_RECURSIVE
    /* 递归方式求排列 */
    int i;
    int *used = (int *)malloc(nums_size * sizeof(int));
    assert(used);

    for (i = 0; i < nums_size; i++)
        used[i] = 0;

    int *curr = (int *)malloc(n * sizeof(int));
    assert(used);

    p1(nums, nums_size, n, 0, used, curr, &ans, rtn_size);

    if (used)
        free(used);

    if (curr)
        free(curr);
#else
    /* 非递归方式求排列 */
    if (nums_size == n)
        p2(nums, nums_size, &ans, rtn_size);
    else if (nums_size > n)
        p3(nums, nums_size, n, &ans, rtn_size);
#endif

    return ans;
}
```

#### 组合

```c
#include <stdio.h>
#include <stdlib.h>

/*
 * DFS
 *
 * Args:
 *  1. deep：递归深度
 *  2. start：数组开始位置
 *  3. curr：当前取得的组合
 *  4. ans：保存最终结果组合数组
 *  5. ans_size 已取得组合个数
 */
void
c1(const int *nums, int nums_size, int n, int deep, int start,
     int *curr, int ***ans, int *ans_size)
{
    int i;

    assert(curr);
    assert(ans);

    if (deep == n) {
        (*ans_size)++;

        *ans = (int **)realloc(*ans, (*ans_size) * sizeof(int *));
        assert(*ans);

        (*ans)[(*ans_size) - 1] = (int *)malloc(n * sizeof(int));
        assert((*ans)[(*ans_size) - 1]);

        for (i = 0; i < n; i++)
            (*ans)[(*ans_size) - 1][i] = curr[i];

        return;
    }

    for (i = start; i < nums_size; i++) {
        curr[deep] = nums[i];
        c1(nums, nums_size, n, deep + 1, i + 1, curr, ans, ans_size);
    }
}

/*
 * 移位操作函数
 *
 * Args:
 *  1. b: 数组
 *  2. b_size: 数组大小
 */
void
move(int *b, int b_size)
{
    int i, j;

    assert(b);

    /* 将第一个10变成01 */
    for (i = 0; i < b_size - 1; i++)
        if (1 == b[i] && 0 ==  b[i + 1]) {
            b[i] = 0;
            b[i + 1] = 1;
            break;
        }

    /* 将第一个10左边的1，全部移到数组的最左边 */
    for (--i; i > 0; i--)
        for (j = 0; 1 == b[i] && j < i; j++)
            if (0 == b[j]) {
                b[i] = 0;
                b[j] = 1;
            }
}

/* 非递归之组合求解 */
void
c2(const int *nums, int nums_size, int n, int ***ans, int *ans_size)
{
    int i;
    int count;

    assert(ans);

    /* 建立临时二值数组 */
    int *binary_array = (int *)malloc(nums_size * sizeof(int));
    assert(binary_array);

    /* 初始化二值数组 */
    for (i = 0; i < nums_size; i++)
        if (i < n)
            binary_array[i] = 1;
        else
            binary_array[i] = 0;

    for(;;) {
        /* 保存结果 */
        (*ans_size)++;

        *ans = (int **)realloc(*ans, (*ans_size) * sizeof(int *));
        assert(*ans);

        (*ans)[(*ans_size) - 1] = (int *)malloc(n * sizeof(int));
        assert((*ans)[(*ans_size) - 1]);

        count = 0;
        for (i = 0; i < nums_size; i++)
            if (1 == binary_array[i])
                (*ans)[(*ans_size) - 1][count++] = nums[i];

        /* 循环退出条件检测 */
        for (i = nums_size - n; i < nums_size; i++)
            if (0 == binary_array[i])
                break;

        if (i == nums_size)
            break;

        /* 移位操作 */
        move(binary_array, nums_size);
    }

    if (binary_array)
        free(binary_array);
}


/*
 * 组合求解
 *
 * Args：
 *  1. nums：整形数组，组合源数据
 *  2. nums_size：nums数组大小
 *  3. n：从nums_size个证数中取n个组合
 *  4. rtn_size：返回结果数量
 *
 * Return：
 *  返回保存所有组合的二维数组，二维数组包含rtn_size个一维数组，
 *  每个一维数组的大小位n
 */
int **
combination(const int *nums, int nums_size,
            int n, int *rtn_size)
{
    int **ans = NULL;

    assert(nums);
    assert(n > 0 && nums_size >= n);
    assert(rtn_size);

    *rtn_size = 0;

#ifdef USE_RECURSIVE
    int *curr = (int *)malloc(n * sizeof(int));
    assert(curr);

    c1(nums, nums_size, n, 0, 0, curr, &ans, rtn_size);

    if (curr)
        free(curr);

#else
    c2(nums, nums_size, n, &ans, rtn_size);
#endif

    return ans;
}
```

#### 参考

1. [花花酱 LeetCode 39. Combination Sum - 刷题找工作 EP81](https://www.youtube.com/watch?v=zIY2BWdsbFs&t=241s)
2. [排列组合面试题](https://octman.com/blog/2013-10-10-permutation/)
