---
layout: post
title: FreeBSD和Linux之修改进程名
category: Study
tags: FreeBSD Linux Process
---

运行nginx时，会发现程序有两个进程，分别是：nginx: master和nginx: worker。显然它们的进程名都是经过修改的，在nginx源代码src/os/unix/ngx_setproctitle.c中的注释详细介绍了nginx使用的方法，以及实现。

程序中可以直接通过修改argv的值，从而达到修改进程名的目的。新名称长度小于等于argv[0]的长度直接修改没问题，否则会丢失内容。在进程中argv[](参数数组)和environ[](环境参数数组)是连续内存，然后我们可以通过备份environ[]中的数据，利用原有environ[]的内存来扩展原有argv[]的内存，这样我们就可以后移argv[0]之后的参数，留出一定长度的内存保证我们能存放新的进程名称。

FreeBSD提供了setproctitle(3)用以修改进程名，如下：

```c
#include <sys/types.h>
#include <unistd.h>

void
setproctitle(const char *fmt, ...);
```

Linux则没有提供相关功能的函数调用，自己简单实现一个，如下：

```c
#include <sys/types.h>
#include <unistd.h>
#include <stdarg.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

extern char **environ;

/* In main function, global_argv = argv */
extern char **global_argv;

void
setproctitle(const char *fmt, ...)
{
        size_t size;
        int i;
        char *p;
        va_list va;
        char title[1024];

        va_start(va, fmt);
        snprintf(buf, sizeof(buf), fmt, va);
        va_end(va);

        size = 0;
        for (i = 0; environ[i]; i++)
                size += strlen(environ[i]) + 1;

        p = malloc(sizeof(char) * size);
        if (NULL == p)
                return;

        for (i = 0; environ[i]; i++) {
                size = strlen(environ[i]) + 1;
                memcpy(p, environ[i], size);
                environ[i] = p;
                p += size;
        }

        if (global_argv != NULL) {
                strcpy(global_argv[0], "nginx: ");
                strcat(global_argv[0], title);
        }
}
```
