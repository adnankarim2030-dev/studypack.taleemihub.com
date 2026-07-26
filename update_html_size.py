import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove c-big class so they are all the same size in the grid
html = html.replace('class="cat-card c1 c-big"', 'class="cat-card c1"')
html = html.replace("class='cat-card c1 c-big'", "class='cat-card c1'")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Removed c-big class from index.html')
