import re, glob
files = glob.glob('*.html')
for f in files:
    content = open(f, encoding='utf-8').read()
    new_content = re.sub(r'(href|src)="assets/([^"]+\.(css|js))\?v=\d+"', r'\1="assets/\2?v=3"', content)
    open(f, 'w', encoding='utf-8').write(new_content)
    print("Updated", f)
