import re, glob
files = glob.glob('*.html')
for f in files:
    content = open(f, encoding='utf-8').read()
    # Replace anything without v= to v=2
    new_content = re.sub(r'(href|src)="assets/([^"]+\.(css|js))(\?[^"]*)?"', r'\1="assets/\2?v=2"', content)
    open(f, 'w', encoding='utf-8').write(new_content)
    print("Updated", f)
