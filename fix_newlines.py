import re

with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# Replace any newlines inside title: "..."
def repl(m):
    clean_title = m.group(1).replace('\n', ' ').replace('\r', '')
    return f'title: "{clean_title}"'

new_js = re.sub(r'title:\s*"([^"]*)"', repl, js_content, flags=re.DOTALL)

with open('f:/studypack.taleemihub.com/files (2)/assets/js/main.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
print("Successfully fixed newlines in main.js")
