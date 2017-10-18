---
layout: default
title: Tags
---
### {{ page.title }}

{% for tag in site.tags %}[{{ tag | first }}](#{{ tag| first }})<sup>{{ tag | last | size}}</sup>  {% endfor %}
{% for tag in site.tags %}
<a name="{{ tag | first }}"></a>

#### {{ tag | first }}({{ tag | last | size }})
{% for post in tag.last %}
* {{ post.date | date_to_string }} - [{{ post.title }}]({{ post.url }})
{% endfor %}
{% endfor %}
