---
layout: post
title: Linux系统编程之修改进程名
category: Study
tags: Linux Process
---

在调试nginx时，会发现在启动程序后有两个进程，分别是nginx: master和nginx: worker，显然它们的进程名都是经过修改的。在nginx源代码src/os/unix/ngx_setproctitle.c中的注释详细介绍了nginx使用的方法，以及实现。

大致说的是在Linux中可以直接通过修改argv[0]来修改进程名，新名称长度小于等于argv[0]的长度直接修改没问题，否则会丢失内容。另外说了在进程中argv[](参数数组)和environ[](环境参数数组)是连续内存。然后我们可以通过备份environ[]中的数据，利用原有environ[]的内存来扩展原有argv[]的内存，这样我们就可以后移argv[0]之后的参数，留出一定长度的内存保证我们能存放新的进程名称。

示例代码[linux_setproctitle][linux_setproctitle]。

[linux_setproctitle]: https://github.com/li-jiangming/test_codes/blob/master/linux_setproctitle.c
