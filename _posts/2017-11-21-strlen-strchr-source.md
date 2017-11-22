---
layout: post
title: strlen和strchr源码分析
category: Study
tags: C glibc
---

#### 源码

##### strlen

```c
/* 引用自 glibc-2.26/string/strlen.c */
size_t
strlen (const char *str)
{
    const char *char_ptr;
    const unsigned long int *longword_ptr;
    unsigned long int longword, himagic, lomagic;

    /* 地址按照sizeof(long)个字节对齐 */
    for (char_ptr = str;
        ((unsigned long int) char_ptr & (sizeof (longword) - 1)) != 0;
        ++char_ptr)
        if (*char_ptr == '\0')
            return char_ptr - str;

    longword_ptr = (unsigned long int *) char_ptr;

    /*
     * 0x80808080 = 1000 0000 1000 0000 1000 0000 1000 0000
     * 0x01010101 = 0000 0001 0000 0001 0000 0001 0000 0001
     */
    himagic = 0x80808080L;
    lomagic = 0x01010101L;

    /*
     * 当long为64bits时，应保证himagic和lomagic高位结构和低位一致,
     * 向左移位操作分两步，是为了避免当long为32bits时的系统警告
     */
    if (sizeof (longword) > 4) {
        himagic = ((himagic << 16) << 16) | himagic;
        lomagic = ((lomagic << 16) << 16) | lomagic;
    }

    /* 当long大于64bits时，直接终止程序 */
    if (sizeof (longword) > 8)
        abort();

    for (;;) {
        longword = *longword_ptr++;

        /*
         * ASCII码为0~127，对于一个无符号8bits的字节，它的至高位始终为0
         *
         * 1、longword - lomagic: 如果longword中任何一个字节为0，那么就会有借位，
         *    相减后字节的至高位为1
         * 2、(longword - lomagic) & ~longword：提取longword中变化的bits
         * 3、(longword - lomagic) & ~longword & himagic：如何结果为0，那么意味着
         *    没有发生借位，longword中不存在为0的字节；反之则有
         */
        if (((longword - lomagic) & ~longword & himagic) != 0) {
            const char *cp = (const char *) (longword_ptr - 1);
            if (cp[0] == 0)
                return cp - str;
            if (cp[1] == 0)
                return cp - str + 1;
            if (cp[2] == 0)
                return cp - str + 2;
            if (cp[3] == 0)
                return cp - str + 3;
            if (sizeof (longword) > 4) {
                if (cp[4] == 0)
                    return cp - str + 4;
                if (cp[5] == 0)
                    return cp - str + 5;
                if (cp[6] == 0)
                    return cp - str + 6;
                if (cp[7] == 0)
                    return cp - str + 7;
            }
        }
    }
}
```

##### strchr

```c
/* 引用自 glibc-2.26/string/strchr.c */
char *
strchr (const char *s, int c_in) {
    const unsigned char *char_ptr;
    const unsigned long int *longword_ptr;
    unsigned long int longword, magic_bits, charmask;
    unsigned char c;

    c = (unsigned char) c_in;

    for (char_ptr = (const unsigned char *) s;
         ((unsigned long int) char_ptr & (sizeof (longword) - 1)) != 0;
         ++char_ptr)
        if (*char_ptr == c)
            return (void *) char_ptr;
        else if (*char_ptr == '\0')
            return NULL;

    longword_ptr = (unsigned long int *) char_ptr;

    /*
     * 1、magic_bits所有位均为1
     * 2、magic_bits / 0xff：结果是将所有bits为1的magic_bits中除每个字节的至低位外，
     *    其他bits置0
     * 3、magic_bits / 0xff * 0xfe：反转步骤2的结果
     * 4、magic_bits / 0xff * 0xfe << 1 >> 1：将步骤3的结果高位字节的至高位置0
     * 5、magic_bits / 0xff * 0xfe << 1 >> 1 | 1：将步骤3的结果低位字节的至低位置0
     *
     * 当long为32bits时，例:
     * 1、1111 1111 1111 1111 1111 1111 1111 1111
     * 2、0000 0001 0000 0001 0000 0001 0000 0001
     * 3、1111 1110 1111 1110 1111 1110 1111 1110
     * 4、0111 1110 1111 1110 1111 1110 1111 1110
     * 5、0111 1110 1111 1110 1111 1110 1111 1111 == 0x7efefeff
     */
    magic_bits = -1;
    magic_bits = magic_bits / 0xff * 0xfe << 1 >> 1 | 1;

    /* 将charmask中每一个字节都设置为c */
    charmask = c | (c << 8);
    charmask |= charmask << 16;
    if (sizeof (longword) > 4)
        charmask |= (charmask << 16) << 16;

    if (sizeof (longword) > 8)
        abort();

    for (;;) {
        longword = *longword_ptr++;

        /*
         * (((x + magic_bits) ^ ~x) & ~magic_bits)：检测x中是否存在为0的字节，
         *    不存在则返回0，否则返回非0
         */
        if ((((longword + magic_bits) ^ ~longword) & ~magic_bits) != 0 ||
            ((((longword ^ charmask) + magic_bits) ^ ~(longword ^ charmask)) & ~magic_bits) != 0) {
            const unsigned char *cp = (const unsigned char *) (longword_ptr - 1);
            if (*cp == c)
                return (char *) cp;
            else if (*cp == '\0')
                return NULL;
            if (*++cp == c)
                return (char *) cp;
            else if (*cp == '\0')
                return NULL;
            if (*++cp == c)
                return (char *) cp;
            else if (*cp == '\0')
                return NULL;
            if (*++cp == c)
                return (char *) cp;
            else if (*cp == '\0')
                return NULL;
            if (sizeof (longword) > 4) {
                if (*++cp == c)
                    return (char *) cp;
                else if (*cp == '\0')
                    return NULL;
                if (*++cp == c)
                    return (char *) cp;
                else if (*cp == '\0')
                    return NULL;
                if (*++cp == c)
                    return (char *) cp;
                else if (*cp == '\0')
                    return NULL;
                if (*++cp == c)
                    return (char *) cp;
                else if (*cp == '\0')
                    return NULL;
            }
        }
    }

    return NULL;
}
```
#### 总结

这两段源码都利用了字节对齐的方式读，一定程度上有效率上的提升。还有就是用了一个magic_bits，32位下值为0x7efefeff，64位下结构类似32位，两种用法都很巧妙。

#### 参考文章

1. [glibc -- strlen源码分析](http://blog.csdn.net/astrotycoon/article/details/8124359)
2. [strlen源码剖析](http://www.cppblog.com/ant/archive/2007/10/12/32886.html)
