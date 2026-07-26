import re

with open('assets/css/global.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Change header background to the exact blue color requested
css = css.replace('background:rgba(15, 23, 42, 0.85);', 'background:var(--blue);')
css = css.replace('background:rgba(15, 23, 42, 0.95);', 'background:var(--blue-dark);')

with open('assets/css/global.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Updated navbar background to blue in global.css')
