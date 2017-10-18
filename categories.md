---
layout: default
title: Categories
---
### {{ page.title }}

{% for category in site.categories %}[{{ category | first }}](#{{ category | first }})<sup>{{ category | last | size }}</sup>  {% endfor %}
{% for category in site.categories %}
<a name="{{ category | first }}"></a>

#### {{ category | first }}({{ category | last | size }})
{% for post in category.last %}
* {{ post.date | date_to_string }} - [{{ post.title }}]({{ post.url }})
{% endfor %}
{% endfor %}
