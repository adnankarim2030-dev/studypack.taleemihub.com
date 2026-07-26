import re

with open('assets/css/global.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace the bento grid columns
css = css.replace('grid-template-columns:repeat(6,1fr); grid-auto-rows:130px;', 'grid-template-columns:repeat(3,1fr); grid-auto-rows:220px;')
# Also let's make sure the large font on c-big is preserved if needed, but we removed c-big class.
# We should probably slightly increase font-size of all items if they are 220px tall now.
css = css.replace('.cat-card .name{font-family:var(--ff-head); font-weight:700; font-size:15.5px; z-index:1;}', '.cat-card .name{font-family:var(--ff-head); font-weight:700; font-size:20px; margin-bottom: 4px; z-index:1;}')
css = css.replace('.cat-card .count{font-size:11.5px; opacity:.85; font-weight:600; z-index:1;}', '.cat-card .count{font-size:13px; opacity:.85; font-weight:600; z-index:1;}')
css = css.replace('.cat-card .ic{width:42px; height:42px;', '.cat-card .ic{width:56px; height:56px;')
css = css.replace('.cat-card .ic svg{width:22px; height:22px;}', '.cat-card .ic svg{width:28px; height:28px;}')

with open('assets/css/global.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Updated bento grid CSS for uniform size')
