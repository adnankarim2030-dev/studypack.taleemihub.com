import glob
import re

logo_html = """<a href="index.html" class="logo">
          <img src="assets/images/logo.png" alt="Study Pack Logo" style="height: 38px; width: auto; object-fit: contain;">
          <span>Study Pack</span>
        </a>"""

old_pattern = r'<a href="index\.html" class="logo" style="color:#fff;">\s*<img src="assets/images/logo\.png" alt="Study Pack Logo" style="height: 38px; width: auto; object-fit: contain;">\s*<span>Study Pack</span>\s*</a>'

for filepath in glob.glob('f:/studypack.taleemihub.com/files (2)/*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    new_html, count = re.subn(old_pattern, logo_html, html, flags=re.DOTALL)
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Updated {filepath}")
    else:
        print(f"Could not find footer logo with white text in {filepath}")
