---
layout: default
title: Posts
---

### {{ page.title }}

{% for post in site.posts %}
* {{ post.date | date: "%Y %b %d" }} - [{{ post.title }}]({{ post.url }})
{% endfor %}
