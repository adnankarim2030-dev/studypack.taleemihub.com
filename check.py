import re

with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'r', encoding='utf-8') as f:
    data = f.read()

m = re.search(r'const STATIONERY = \[\n(.*?)\];', data, re.DOTALL)
if m:
    block = m.group(1)
    paras_count = block.count('img: "https://www.parasartfever.com')
    empty_count = block.count('img: ""')
    print(f"Paras URLs: {paras_count}")
    print(f"Empty URLs: {empty_count}")
else:
    print("STATIONERY not found")
