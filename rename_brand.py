import glob

for filepath in glob.glob('f:/studypack.taleemihub.com/files (2)/*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    new_html = html.replace('EduBooks', 'Study Pack')
    
    if new_html != html:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Updated EduBooks to Study Pack in {filepath}")
