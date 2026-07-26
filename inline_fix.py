import glob
files = glob.glob('*.html')
for f in files:
    content = open(f, encoding='utf-8').read()
    content = content.replace('<div class="p-card"', '<div class="p-card" style="min-width:0; overflow:hidden;"')
    content = content.replace('<div class="p-meta">', '<div class="p-meta" style="min-width:0;">')
    open(f, 'w', encoding='utf-8').write(content)
    print("Updated", f)
