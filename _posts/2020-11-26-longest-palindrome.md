---
layout: post
title: 最长回文子串
category: Study
tags: C leetcode
---

[leetcode][leetcode-link]

```c
/*
 * 暴力解法
 */
char *longestPalindrome(char *s) {
    int len = strlen(s);
    int i, j, m = 0, n = 0;
    for (i = 0; i < len; i++) {
        /* 遍历以i为中心奇数回文子串 */
        for (j = 1; (i - j >= 0) && (i + j < len); j++) {
            if (s[i - j] != s[i + j]) {
                break;
            }
        }

        /* 更新最长回文 */
        if (2 * j - 1 > n - m + 1) {
            m = i - j + 1;
            n = i + j - 1;
        }

        /* 当s[i] == s[i + 1]时，以i和i + 1为中心的偶数回文子串 */
        for (j = 0; (i - j >= 0) && (i + j + 1 < len); j++) {
            if (s[i - j] != s[i + j + 1]) {
                break;
            }
        }

        /* 更新最长回文 */
        if (2 * j > n - m + 1) {
            m = i - j + 1;
            n = i + j;
        }
    }

    /* 返回结果 */
    char *result = (char *) malloc(n - m + 2);
    memset(result, 0, n - m + 2);
    memcpy(result, s + m, n - m + 1);
    return result;
}
```

```c
/*
 * 动态规划解法
 */
char *longestPalindrome(char *s)
{   
    int len = strlen(s);
    
    /* 题中有给出字符串最大长度为1000 */
    char dp[1000][1000];
    
    int l, i, j, m = 0, n = 0;
    for (l = 0; l < len; l++) {
        for (i = 0; i + l < len; i++) {
            j = i + l;

            if (0 == l) {
                /* 当i == j时，dp[i][j]是长度为1的回文，一个字符 */
                dp[i][j] = 1;
            } else if (1 == l) {
                /* 当j = i + 1时，且s[i] == s[j]，dp[i][j]是长度为2的回文，两个相同字符 */
                dp[i][j] = s[i] == s[j] ? 1 : 0;
            } else {
                /* 当j - i > 1时，若s[i] == s[j]且dp[i + 1][j - 1]为回文时，dp[i][j]才是回文，否则不是回文 */
                dp[i][j] = (s[i] == s[j] && 1 == dp[i + 1][j - 1]) ? 1 : 0;
            }
            
            /* 若dp[i][j]是回文，更新最长回文 */
            if (1 == dp[i][j] && l + 1 > n - m) {
                m = i, n = j;
            }
        }
    }
    
    /* 返回结果 */
    char *result = (char *) malloc(n - m + 2);
    memset(result, 0, n - m + 2); 
    memcpy(result, s + m, n - m + 1);
    return result;
}
```

[leetcode-link]: https://leetcode.com/problems/longest-palindromic-substring/
