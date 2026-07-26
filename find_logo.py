html = open('f:/studypack.taleemihub.com/files (2)/index.html', 'r', encoding='utf-8').read()
start = html.find('class="logo"')
print(html[start:start+300])
