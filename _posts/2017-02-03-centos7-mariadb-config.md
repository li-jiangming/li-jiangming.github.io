---
layout: post
title: CentOS7上的Mariadb配置
category: Study
tags: CentOS7 Mariadb
---

以前一直使用Mysql作为我的首选数据库，目前在Centos7上面我使用MariaDB作为数据库，它和Mysql的操作管理方式几乎一样。

#### 安装mariadb-server

```
yum install mariadb-server
```

#### 启动mariadb服务

```
systemctl enable mariadb
systemctl start mariadb
```

#### 设置root密码

以前在安装Mysql的过程中会有提示框提示设置root用户密码,在安装mariadb-server的过程中没有设置root密码这一步，初始密码为空。

```
mysqladmin -u root -p password
```

#### 远程连接

##### 防火墙

在防火墙中添加mariadb-server运行端口，默认端口为3306。

```
firewall-cmd --add-port=3306/tcp
```

##### 添加用户和设置权限

```
grant 权限 on 数据库名.数据库表名 用户名@远程地址 identified by '密码';
```

权限可以设置insert,delete,update,select,create等权限的组合，也可以直接设置all privileges。

数据库表名可以被*代替，表示所有数据库表。

用户名可以是现有用户的名称，也可以是当前不存在用户的名称。

远程地址可以设置ip地址或主机名，可以被%代替，表示任意地址。

密码是用户名对应的登陆密码。

##### 刷新系统权限

```
flush privileges;
```

#### 客户端连接

按照上面步骤操作，在客户端使用服务器ip地址和Mariadb监听端口，以及有远程连接权限的用户登陆。
