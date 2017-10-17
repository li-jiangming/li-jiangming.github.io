---
layout: post
title: FreeBSD10配置shadowsocks-libev整理
category: Study
tags: FreeBSD Shadowsocks_libev
---

在DigitalOcean上面创建了一个FreeBSD 11.0系统的Droplet,首先还是自己搭建个VPN，方便访问Google以及其他的被墙的内容，这里介绍安装和配置shadowsocks-libev。

1. 更新Ports

        portsnap fetch extract
        portsnap update

2. 安装shadowsocks-libev

        cd /usr/ports/net/shadowsocks-libev/
        make install clean

3. 编辑配置文件/etc/rc.conf

        shadowsocks_libev_enable="YES"
        shadowsocks_libev_flags="-c /usr/local/etc/shadowsocks-libev/config.json"

4. 编辑config.json

    使用`vi`打开config.json

        vi /usr/local/etc/shadowsocks-libev/config.json

    编辑内容

        {
            "server":"服务器ip",
            "server_port":"服务器本地监听端口",
            "local_port":"1080",
            "password":"密码",
            "timeout":60,      
            "method":"aes-256-cfb"
        }

5. 启动Shadowsocks-libev服务

        service shadowsocks_libev start
