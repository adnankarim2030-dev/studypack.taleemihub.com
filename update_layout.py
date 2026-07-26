import re

# 1. Update global.css
with open('assets/css/global.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Change header background to light blue and text to dark
css = css.replace('background:rgba(15, 23, 42, 0.85);', 'background:rgba(227, 242, 253, 0.95);')
css = css.replace('background:rgba(15, 23, 42, 0.95);', 'background:rgba(210, 235, 255, 0.95);')
css = css.replace('.logo{display:flex; align-items:center; gap:8px; font-family:var(--ff-head); font-weight:800; font-size:19px; color:#fff;', '.logo{display:flex; align-items:center; gap:8px; font-family:var(--ff-head); font-weight:800; font-size:19px; color:var(--navy);')
css = css.replace('color:#e2e8f0;', 'color:var(--navy);')
css = css.replace('.nav-links a:hover{background:rgba(255,255,255,0.1); color:#fff;', '.nav-links a:hover{background:rgba(0,0,0,0.05); color:var(--blue);')
css = css.replace('.icon-btn{position:relative; width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:50%; color:#fff;', '.icon-btn{position:relative; width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:50%; color:var(--navy);')
css = css.replace('.icon-btn:hover{background:rgba(255,255,255,0.1);', '.icon-btn:hover{background:rgba(0,0,0,0.05);')
css = css.replace('.burger{display:none; width:42px; height:42px; align-items:center; justify-content:center; border-radius:50%; color:#fff;}', '.burger{display:none; width:42px; height:42px; align-items:center; justify-content:center; border-radius:50%; color:var(--navy);}')

# Change footer background to light blue
css = css.replace('footer{background:linear-gradient(135deg, #fcecd7, #dbeafe); color:var(--ink); padding-top:80px;}', 'footer{background:#e3f2fd; color:var(--navy); padding-top:80px;}')

with open('assets/css/global.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Inject real header/footer into book-details.html
with open('header_footer.txt', 'r', encoding='utf-8') as f:
    hf = f.read()

header = hf.split('FOOTER:')[0].replace('HEADER:\n', '').strip()
footer = hf.split('FOOTER:')[1].strip()

with open('book-details.html', 'r', encoding='utf-8') as f:
    bd = f.read()

# Remove the temporary header
bd = re.sub(r'<!-- Copying header.*?</header>', '', bd, flags=re.DOTALL)

# Insert real header after <body>
bd = bd.replace('<body>', '<body>\n' + header + '\n<div style="padding-top:100px;"></div>')

# Insert real footer before the flip modal
bd = bd.replace('<div class="flip-modal"', footer + '\n<div class="flip-modal"')

with open('book-details.html', 'w', encoding='utf-8') as f:
    f.write(bd)

print('Updated CSS and injected header/footer into book-details.html')
