import re

with open('f:/studypack.taleemihub.com/files (2)/assets/css/global.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace .pl-book
css = re.sub(r'\.pl-book\s*\{[^}]+\}', '.pl-book{width:128px; height:88px; position:relative; perspective:800px;}', css)

# Replace .pl-label
css = re.sub(r'\.pl-label\s*\{[^}]+\}', '.pl-label{position:absolute; margin-top:140px; color:#9fb2d6; font-size:22px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; font-family:var(--ff-head);}', css)

with open('f:/studypack.taleemihub.com/files (2)/assets/css/global.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated preloader size in global.css")
