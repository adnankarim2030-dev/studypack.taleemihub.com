import glob
import re

logo_html = """<a href="index.html" class="logo">
        <img src="assets/images/logo.png" alt="Study Pack Logo" style="height: 38px; width: auto; object-fit: contain;">
        <span>Study Pack</span>
      </a>"""

old_pattern = r'<a href="index\.html" class="logo">\s*<span class="mark">.*?</span>\s*<span>Edu<em>Books</em></span>\s*</a>'
# Some files might have slightly different spacing
for filepath in glob.glob('f:/studypack.taleemihub.com/files (2)/*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Try replacing using regex
    new_html, count = re.subn(old_pattern, logo_html, html, flags=re.DOTALL)
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Updated {filepath}")
    else:
        print(f"Could not find logo block in {filepath}")
